import secrets
from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from backend.app.core.database import get_db
from backend.app.models.user import User
from backend.app.models.trip import Trip
from backend.app.models.booking import Booking
from backend.app.models.itinerary import ItineraryDay, ItineraryItem
from backend.app.schemas.booking import (
    BookingCreate,
    BookingOut,
    HotelCatalogItem,
    RestaurantCatalogItem,
    NearbyHotelResult,
    NearbyRestaurantResult
)
from backend.app.api.deps import get_current_user, check_trip_member
from backend.app.services.catalog_service import catalog_service

router = APIRouter(tags=["Bookings & Catalog"])

def _generate_confirmation_code(booking_type: str) -> str:
    prefix = "HTL" if booking_type.upper() == "HOTEL" else "RES"
    random_hex = secrets.token_hex(2).upper()
    random_digits = secrets.randbelow(9000) + 1000
    return f"ARC-{prefix}-{random_hex}{random_digits}"

# --- CATALOG BROWSING ENDPOINTS ---

@router.get("/catalog/hotels", response_model=List[HotelCatalogItem])
def browse_hotels(
    destination: Optional[str] = Query(None, description="Destination city or region to filter hotels"),
    current_user: User = Depends(get_current_user)
):
    """
    Returns curated and destination-tailored hotels with amenities, nightly rates, and room options.
    """
    return catalog_service.get_hotels(destination)

@router.get("/catalog/restaurants", response_model=List[RestaurantCatalogItem])
def browse_restaurants(
    destination: Optional[str] = Query(None, description="Destination city or region to filter restaurants"),
    current_user: User = Depends(get_current_user)
):
    """
    Returns top-rated dining spots with cuisine styles, vibes, signature dishes, and reservation time slots.
    """
    return catalog_service.get_restaurants(destination)

@router.get("/catalog/hotels/nearby", response_model=List[NearbyHotelResult])
def browse_nearby_hotels(
    trip_id: str = Query(..., description="Trip ID to read itinerary spots from"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Recommends hotels near the user's picked tourist spots.
    Reads all itinerary items with valid coordinates, then ranks catalog hotels
    by Haversine proximity to the nearest spot.
    """
    # Verify trip membership
    trip = db.query(Trip).filter(Trip.id == trip_id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")

    # Collect all itinerary items with valid coordinates
    items = (
        db.query(ItineraryItem)
        .filter(
            ItineraryItem.trip_id == trip_id,
            ItineraryItem.latitude.isnot(None),
            ItineraryItem.longitude.isnot(None),
        )
        .all()
    )

    spots = [
        (item.latitude, item.longitude, item.title or item.location_name or "Tourist Spot")
        for item in items
        if item.latitude is not None and item.longitude is not None
    ]

    return catalog_service.get_nearby_hotels(spots, destination=trip.destination)

@router.get("/catalog/restaurants/nearby", response_model=List[NearbyRestaurantResult])
def browse_nearby_restaurants(
    trip_id: str = Query(..., description="Trip ID to read itinerary spots from"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Recommends dining spots and restaurants near the user's picked tourist spots.
    Reads all itinerary items with valid coordinates, then ranks catalog dining options
    by Haversine proximity to the nearest spot.
    """
    # Verify trip membership
    trip = db.query(Trip).filter(Trip.id == trip_id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")

    # Collect all itinerary items with valid coordinates
    items = (
        db.query(ItineraryItem)
        .filter(
            ItineraryItem.trip_id == trip_id,
            ItineraryItem.latitude.isnot(None),
            ItineraryItem.longitude.isnot(None),
        )
        .all()
    )

    spots = [
        (item.latitude, item.longitude, item.title or item.location_name or "Tourist Spot")
        for item in items
        if item.latitude is not None and item.longitude is not None
    ]

    return catalog_service.get_nearby_restaurants(spots, destination=trip.destination)

# --- TRIP BOOKINGS CRUD ENDPOINTS ---

@router.get("/trips/{trip_id}/bookings", response_model=List[BookingOut])
def get_trip_bookings(
    trip_id: str,
    db: Session = Depends(get_db),
    trip_and_role: tuple[Trip, str] = Depends(check_trip_member)
):
    """
    Fetches all confirmed hotel stays and dining reservations for the specified trip.
    """
    bookings = db.query(Booking).filter(
        Booking.trip_id == trip_id
    ).order_by(Booking.start_date.asc()).all()
    return bookings

@router.post("/trips/{trip_id}/bookings", response_model=BookingOut, status_code=status.HTTP_201_CREATED)
def create_booking(
    trip_id: str,
    payload: BookingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    trip_and_role: tuple[Trip, str] = Depends(check_trip_member)
):
    """
    Creates a new confirmed hotel or restaurant reservation with a unique verification code.
    Optionally syncs the reservation directly into the trip daily itinerary.
    """
    trip, role = trip_and_role
    
    clean_type = payload.booking_type.upper()
    if clean_type not in ["HOTEL", "RESTAURANT"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Booking type must be either 'HOTEL' or 'RESTAURANT'."
        )

    confirmation_code = _generate_confirmation_code(clean_type)

    new_booking = Booking(
        trip_id=trip_id,
        user_id=current_user.id,
        booking_type=clean_type,
        title=payload.title,
        confirmation_code=confirmation_code,
        status="CONFIRMED",
        start_date=payload.start_date,
        end_date=payload.end_date,
        time_slot=payload.time_slot,
        party_size=payload.party_size,
        total_price=payload.total_price,
        currency=payload.currency or "USD",
        address=payload.address,
        phone_or_contact=payload.phone_or_contact,
        special_requests=payload.special_requests,
        details=payload.details or {}
    )
    db.add(new_booking)
    db.commit()
    db.refresh(new_booking)

    # Optional itinerary synchronization
    if payload.add_to_itinerary:
        target_day = None
        if payload.itinerary_day_id:
            target_day = db.query(ItineraryDay).filter(
                ItineraryDay.id == payload.itinerary_day_id,
                ItineraryDay.trip_id == trip_id
            ).first()
        
        # If no specific day id or not found, find the first day of the trip
        if not target_day:
            target_day = db.query(ItineraryDay).filter(
                ItineraryDay.trip_id == trip_id
            ).order_by(ItineraryDay.day_number.asc()).first()
        
        # If no days exist yet for this trip, create Day 1 automatically
        if not target_day:
            target_day = ItineraryDay(
                trip_id=trip_id,
                day_number=1,
                date=trip.start_date,
                notes="Initial Day"
            )
            db.add(target_day)
            db.commit()
            db.refresh(target_day)

        # Count current items for order_index
        item_count = db.query(ItineraryItem).filter(ItineraryItem.day_id == target_day.id).count()
        
        category = "HOTEL" if clean_type == "HOTEL" else "FOOD"
        start_time_val = payload.time_slot or ("15:00" if clean_type == "HOTEL" else "19:00")
        notes_str = f"Verified Ref: {confirmation_code}"
        if payload.special_requests:
            notes_str += f" | Notes: {payload.special_requests}"

        itinerary_item = ItineraryItem(
            day_id=target_day.id,
            trip_id=trip_id,
            title=f"{'Check-in:' if clean_type == 'HOTEL' else 'Reservation:'} {payload.title}",
            description=f"Confirmed reservation ({confirmation_code}). Party of {payload.party_size}.",
            location_name=payload.title,
            address=payload.address,
            start_time=start_time_val,
            category=category,
            estimated_cost=payload.total_price or 0.0,
            currency=payload.currency or "USD",
            order_index=item_count,
            notes=notes_str
        )
        db.add(itinerary_item)
        db.commit()

    return new_booking

@router.delete("/trips/{trip_id}/bookings/{booking_id}", status_code=status.HTTP_200_OK)
def cancel_or_delete_booking(
    trip_id: str,
    booking_id: str,
    db: Session = Depends(get_db),
    trip_and_role: tuple[Trip, str] = Depends(check_trip_member)
):
    """
    Cancels and removes a hotel or restaurant booking from the trip ledger.
    """
    booking = db.query(Booking).filter(
        Booking.id == booking_id,
        Booking.trip_id == trip_id
    ).first()

    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking record not found for this trip."
        )

    db.delete(booking)
    db.commit()
    return {"message": "Booking removed successfully", "id": booking_id}
