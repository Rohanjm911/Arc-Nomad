from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from backend.app.core.database import get_db
from backend.app.models.user import User
from backend.app.models.trip import Trip, TripMember, TripRole, TripStatus
from backend.app.models.itinerary import ItineraryDay
from backend.app.models.notification import NotificationType
from backend.app.schemas.trip import TripCreate, TripUpdate, TripOut, TripSummary, TripMemberCreate, TripMemberUpdate, TripMemberOut
from backend.app.api.deps import get_current_user, check_trip_member, require_trip_roles
from backend.app.services.weather.service import weather_service
from backend.app.services.notifications.service import notification_service
from backend.app.services.geocoding.service import geocoding_service

router = APIRouter(prefix="/trips", tags=["Trips"])

@router.get("/geocode")
async def geocode_destination(
    query: str = Query(..., min_length=1, description="Location to geocode"),
    current_user: User = Depends(get_current_user)
):
    results = await geocoding_service.geocode(query, limit=5)
    return results

@router.get("/", response_model=List[TripSummary])
def get_user_trips(
    status_filter: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    memberships = db.query(TripMember).filter(TripMember.user_id == current_user.id).all()
    trip_ids = [m.trip_id for m in memberships]
    roles_map = {m.trip_id: m.role for m in memberships}

    query = db.query(Trip).filter(Trip.id.in_(trip_ids))
    if status_filter:
        query = query.filter(Trip.status == status_filter.upper())

    trips = query.order_by(Trip.start_date.asc()).all()

    summaries = []
    for t in trips:
        member_count = db.query(TripMember).filter(TripMember.trip_id == t.id).count()
        summaries.append(
            TripSummary(
                id=t.id,
                title=t.title,
                destination=t.destination,
                destination_lat=t.destination_lat,
                destination_lng=t.destination_lng,
                start_date=t.start_date,
                end_date=t.end_date,
                status=t.status,
                budget=t.budget,
                currency=t.currency,
                cover_image=t.cover_image,
                member_count=member_count,
                user_role=roles_map.get(t.id, "VIEWER")
            )
        )
    return summaries

@router.post("/", response_model=TripOut, status_code=status.HTTP_201_CREATED)
def create_trip(
    trip_in: TripCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Set default lat/lng if not provided
    lat = trip_in.destination_lat
    lng = trip_in.destination_lng
    if lat is None or lng is None:
        lat, lng = geocoding_service.get_destination_coords_sync(trip_in.destination)

    # Set dynamic default cover image if not provided
    cover = trip_in.cover_image
    if not cover:
        d_lower = trip_in.destination.lower()
        if "tokyo" in d_lower or "japan" in d_lower:
            cover = "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80"
        elif "paris" in d_lower or "france" in d_lower:
            cover = "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80"
        elif "rome" in d_lower or "amalfi" in d_lower or "italy" in d_lower:
            cover = "https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=1200&q=80"
        elif "swiss" in d_lower or "alps" in d_lower:
            cover = "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=1200&q=80"
        elif "new york" in d_lower:
            cover = "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=1200&q=80"
        else:
            cover = "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80"

    trip = Trip(
        title=trip_in.title,
        description=trip_in.description,
        destination=trip_in.destination,
        destination_lat=lat,
        destination_lng=lng,
        start_date=trip_in.start_date,
        end_date=trip_in.end_date,
        budget=trip_in.budget,
        currency=trip_in.currency,
        cover_image=cover,
        status=trip_in.status or TripStatus.PLANNING.value,
        owner_id=current_user.id
    )
    db.add(trip)
    db.commit()
    db.refresh(trip)

    # Add creator as OWNER member
    member = TripMember(
        trip_id=trip.id,
        user_id=current_user.id,
        role=TripRole.OWNER.value
    )
    db.add(member)

    # Initialize Day 1, Day 2, Day 3 based on date duration
    duration = (trip.end_date - trip.start_date).days + 1
    duration = max(1, min(duration, 14))
    for d in range(1, duration + 1):
        day = ItineraryDay(
            trip_id=trip.id,
            day_number=d,
            notes=f"Day {d} in {trip.destination}"
        )
        db.add(day)

    db.commit()
    db.refresh(trip)

    out = TripOut.model_validate(trip)
    out.user_role = TripRole.OWNER.value
    return out

@router.get("/{trip_id}", response_model=TripOut)
def get_trip(
    trip_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    trip, role = check_trip_member(trip_id=trip_id, db=db, current_user=current_user)
    out = TripOut.model_validate(trip)
    out.user_role = role
    return out

@router.put("/{trip_id}", response_model=TripOut)
def update_trip(
    trip_id: str,
    trip_in: TripUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    trip, role = require_trip_roles([TripRole.OWNER.value, TripRole.EDITOR.value])(
        trip_id=trip_id, db=db, current_user=current_user
    )

    if trip_in.title is not None:
        trip.title = trip_in.title
    if trip_in.description is not None:
        trip.description = trip_in.description
    if trip_in.destination is not None:
        trip.destination = trip_in.destination
        if trip_in.destination_lat is None or trip_in.destination_lng is None:
            lat, lng = get_coords_for_destination(trip_in.destination)
            trip.destination_lat = lat
            trip.destination_lng = lng
    if trip_in.destination_lat is not None:
        trip.destination_lat = trip_in.destination_lat
    if trip_in.destination_lng is not None:
        trip.destination_lng = trip_in.destination_lng
    if trip_in.start_date is not None:
        trip.start_date = trip_in.start_date
    if trip_in.end_date is not None:
        trip.end_date = trip_in.end_date
    if trip_in.budget is not None:
        trip.budget = trip_in.budget
    if trip_in.currency is not None:
        trip.currency = trip_in.currency
    if trip_in.cover_image is not None:
        trip.cover_image = trip_in.cover_image
    if trip_in.status is not None:
        trip.status = trip_in.status

    db.commit()
    db.refresh(trip)

    out = TripOut.model_validate(trip)
    out.user_role = role
    return out

@router.delete("/{trip_id}")
def delete_trip(
    trip_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    trip, role = require_trip_roles([TripRole.OWNER.value])(
        trip_id=trip_id, db=db, current_user=current_user
    )

    db.delete(trip)
    db.commit()
    return {"message": "Trip deleted successfully"}

# ----------------- MEMBERS & COLLABORATION -----------------

@router.post("/{trip_id}/members", response_model=TripMemberOut, status_code=status.HTTP_201_CREATED)
def invite_trip_member(
    trip_id: str,
    member_in: TripMemberCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    trip, _ = require_trip_roles([TripRole.OWNER.value, TripRole.EDITOR.value])(
        trip_id=trip_id, db=db, current_user=current_user
    )

    target_ident = member_in.user_id_or_email.lower().strip()
    target_user = db.query(User).filter(
        (User.id == target_ident) | (User.email == target_ident) | (User.username == target_ident)
    ).first()

    if not target_user:
        raise HTTPException(status_code=404, detail="User not found to invite")

    existing_member = db.query(TripMember).filter(
        TripMember.trip_id == trip_id,
        TripMember.user_id == target_user.id
    ).first()

    if existing_member:
        raise HTTPException(status_code=400, detail="User is already a member of this trip")

    member = TripMember(
        trip_id=trip_id,
        user_id=target_user.id,
        role=member_in.role.upper()
    )
    db.add(member)
    db.commit()
    db.refresh(member)

    # Dispatch notification to invited member
    notification_service.create_notification(
        db=db,
        user_id=target_user.id,
        type=NotificationType.TRIP_INVITATION.value,
        title=f"Trip Invitation: {trip.title}",
        message=f"{current_user.full_name} added you as {member.role} to '{trip.title}' ({trip.destination}).",
        link_url=f"/trips/{trip.id}",
        extra_data={"trip_id": trip.id, "role": member.role}
    )

    return TripMemberOut.model_validate(member)

@router.put("/{trip_id}/members/{user_id}", response_model=TripMemberOut)
def update_trip_member_role(
    trip_id: str,
    user_id: str,
    role_in: TripMemberUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    trip, _ = require_trip_roles([TripRole.OWNER.value])(
        trip_id=trip_id, db=db, current_user=current_user
    )

    member = db.query(TripMember).filter(
        TripMember.trip_id == trip_id,
        TripMember.user_id == user_id
    ).first()

    if not member:
        raise HTTPException(status_code=404, detail="Member not found in trip")

    member.role = role_in.role.upper()
    db.commit()
    db.refresh(member)
    return TripMemberOut.model_validate(member)

@router.delete("/{trip_id}/members/{user_id}")
def remove_trip_member(
    trip_id: str,
    user_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    trip, role = check_trip_member(trip_id=trip_id, db=db, current_user=current_user)

    # Owner can remove anyone; members can leave themselves
    if role != TripRole.OWNER.value and current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Only trip owners can remove other members")

    member = db.query(TripMember).filter(
        TripMember.trip_id == trip_id,
        TripMember.user_id == user_id
    ).first()

    if not member:
        raise HTTPException(status_code=404, detail="Member not found in trip")

    if member.role == TripRole.OWNER.value:
        raise HTTPException(status_code=400, detail="Cannot remove the trip owner")

    db.delete(member)
    db.commit()
    return {"message": "Member removed from trip"}

# ----------------- WEATHER -----------------

@router.get("/{trip_id}/weather")
async def get_trip_weather(
    trip_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    trip, _ = check_trip_member(trip_id=trip_id, db=db, current_user=current_user)
    lat = trip.destination_lat or 35.6762
    lng = trip.destination_lng or 139.6503
    return await weather_service.get_weather(lat=lat, lng=lng, destination_name=trip.destination)
