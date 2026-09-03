from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from backend.app.core.database import get_db
from backend.app.models.user import User
from backend.app.models.trip import Trip, TripRole
from backend.app.models.itinerary import ItineraryDay, ItineraryItem
from backend.app.models.notification import NotificationType
from backend.app.schemas.itinerary import (
    ItineraryDayOut, ItineraryDayCreate, ItineraryDayUpdate,
    ItineraryItemOut, ItineraryItemCreate, ItineraryItemUpdate,
    ItineraryItemBatchReorder
)
from backend.app.schemas.ai import (
    AIItineraryRequest, GeneratedItineraryResponse,
    AIModifyItineraryRequest
)
from backend.app.api.deps import get_current_user, check_trip_member, require_trip_roles
from backend.app.services.ai.service import ai_service
from backend.app.services.notifications.service import notification_service

router = APIRouter(prefix="/itinerary", tags=["Itinerary"])

@router.get("/{trip_id}/days", response_model=List[ItineraryDayOut])
def get_trip_itinerary(
    trip_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    check_trip_member(trip_id=trip_id, db=db, current_user=current_user)
    days = db.query(ItineraryDay).filter(ItineraryDay.trip_id == trip_id).order_by(ItineraryDay.day_number.asc()).all()
    return days

@router.post("/{trip_id}/days", response_model=ItineraryDayOut, status_code=status.HTTP_201_CREATED)
def create_itinerary_day(
    trip_id: str,
    day_in: ItineraryDayCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    require_trip_roles([TripRole.OWNER.value, TripRole.EDITOR.value])(
        trip_id=trip_id, db=db, current_user=current_user
    )

    day = ItineraryDay(
        trip_id=trip_id,
        day_number=day_in.day_number,
        date=day_in.date,
        notes=day_in.notes
    )
    db.add(day)
    db.commit()
    db.refresh(day)
    return day

@router.post("/items", response_model=ItineraryItemOut, status_code=status.HTTP_201_CREATED)
def create_itinerary_item(
    item_in: ItineraryItemCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    day = db.query(ItineraryDay).filter(ItineraryDay.id == item_in.day_id).first()
    if not day:
        raise HTTPException(status_code=404, detail="Itinerary day not found")

    require_trip_roles([TripRole.OWNER.value, TripRole.EDITOR.value])(
        trip_id=day.trip_id, db=db, current_user=current_user
    )

    # Determine order index if not specified
    existing_items_count = db.query(ItineraryItem).filter(ItineraryItem.day_id == day.id).count()

    item = ItineraryItem(
        day_id=day.id,
        trip_id=day.trip_id,
        title=item_in.title,
        description=item_in.description,
        location_name=item_in.location_name,
        address=item_in.address,
        latitude=item_in.latitude,
        longitude=item_in.longitude,
        start_time=item_in.start_time,
        end_time=item_in.end_time,
        category=item_in.category.upper() if item_in.category else "SIGHTSEEING",
        estimated_cost=item_in.estimated_cost,
        currency=item_in.currency,
        order_index=item_in.order_index if item_in.order_index > 0 else existing_items_count,
        notes=item_in.notes,
        is_completed=item_in.is_completed
    )
    db.add(item)
    db.commit()
    db.refresh(item)

    notification_service.notify_trip_members(
        db=db,
        trip_id=day.trip_id,
        exclude_user_id=current_user.id,
        type=NotificationType.ITINERARY_CHANGE.value,
        title="Itinerary Updated",
        message=f"{current_user.full_name} added '{item.title}' to Day {day.day_number}.",
        link_url=f"/trips/{day.trip_id}?tab=itinerary",
        extra_data={"trip_id": day.trip_id, "item_id": item.id}
    )

    return item

@router.put("/items/{item_id}", response_model=ItineraryItemOut)
def update_itinerary_item(
    item_id: str,
    item_in: ItineraryItemUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    item = db.query(ItineraryItem).filter(ItineraryItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Itinerary item not found")

    require_trip_roles([TripRole.OWNER.value, TripRole.EDITOR.value])(
        trip_id=item.trip_id, db=db, current_user=current_user
    )

    if item_in.title is not None:
        item.title = item_in.title
    if item_in.description is not None:
        item.description = item_in.description
    if item_in.location_name is not None:
        item.location_name = item_in.location_name
    if item_in.address is not None:
        item.address = item_in.address
    if item_in.latitude is not None:
        item.latitude = item_in.latitude
    if item_in.longitude is not None:
        item.longitude = item_in.longitude
    if item_in.start_time is not None:
        item.start_time = item_in.start_time
    if item_in.end_time is not None:
        item.end_time = item_in.end_time
    if item_in.category is not None:
        item.category = item_in.category.upper()
    if item_in.estimated_cost is not None:
        item.estimated_cost = item_in.estimated_cost
    if item_in.currency is not None:
        item.currency = item_in.currency
    if item_in.order_index is not None:
        item.order_index = item_in.order_index
    if item_in.notes is not None:
        item.notes = item_in.notes
    if item_in.is_completed is not None:
        item.is_completed = item_in.is_completed
    if item_in.day_id is not None:
        item.day_id = item_in.day_id

    db.commit()
    db.refresh(item)
    return item

@router.delete("/items/{item_id}")
def delete_itinerary_item(
    item_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    item = db.query(ItineraryItem).filter(ItineraryItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Itinerary item not found")

    require_trip_roles([TripRole.OWNER.value, TripRole.EDITOR.value])(
        trip_id=item.trip_id, db=db, current_user=current_user
    )

    trip_id = item.trip_id
    db.delete(item)
    db.commit()
    return {"message": "Itinerary item deleted"}

@router.post("/reorder")
def reorder_itinerary_items(
    reorder_in: ItineraryItemBatchReorder,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not reorder_in.items:
        return {"message": "No items to reorder"}

    first_item = db.query(ItineraryItem).filter(ItineraryItem.id == reorder_in.items[0].item_id).first()
    if first_item:
        require_trip_roles([TripRole.OWNER.value, TripRole.EDITOR.value])(
            trip_id=first_item.trip_id, db=db, current_user=current_user
        )

    for entry in reorder_in.items:
        db_item = db.query(ItineraryItem).filter(ItineraryItem.id == entry.item_id).first()
        if db_item:
            db_item.day_id = entry.day_id
            db_item.order_index = entry.order_index

    db.commit()
    return {"message": "Items reordered successfully"}

# ----------------- AI ITINERARY GENERATION -----------------

@router.post("/ai-generate", response_model=List[ItineraryDayOut])
async def ai_generate_itinerary(
    req: AIItineraryRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    trip, _ = require_trip_roles([TripRole.OWNER.value, TripRole.EDITOR.value])(
        trip_id=req.trip_id, db=db, current_user=current_user
    )

    # Call AI Service
    ai_result = await ai_service.generate_itinerary(req)

    # Delete existing items and days to cleanly replace with newly generated itinerary
    db.query(ItineraryItem).filter(ItineraryItem.trip_id == trip.id).delete(synchronize_session=False)
    db.query(ItineraryDay).filter(ItineraryDay.trip_id == trip.id).delete(synchronize_session=False)
    db.commit()

    # Recreate days and items from AI structured plan
    created_days = []
    for day_plan in ai_result.days:
        day = ItineraryDay(
            trip_id=trip.id,
            day_number=day_plan.day_number,
            notes=f"{day_plan.theme}. {day_plan.notes or ''}".strip()
        )
        db.add(day)
        db.flush()

        for idx, item_plan in enumerate(day_plan.items):
            item = ItineraryItem(
                day_id=day.id,
                trip_id=trip.id,
                title=item_plan.title,
                description=item_plan.description,
                location_name=item_plan.location_name,
                address=item_plan.address,
                latitude=item_plan.latitude,
                longitude=item_plan.longitude,
                start_time=item_plan.start_time,
                end_time=item_plan.end_time,
                category=item_plan.category,
                estimated_cost=item_plan.estimated_cost,
                currency=trip.currency,
                order_index=idx,
                notes=item_plan.notes
            )
            db.add(item)

        created_days.append(day)

    db.commit()

    # Notify trip members of the AI plan generation
    notification_service.notify_trip_members(
        db=db,
        trip_id=trip.id,
        exclude_user_id=current_user.id,
        type=NotificationType.ITINERARY_CHANGE.value,
        title="AI Itinerary Generated",
        message=f"{current_user.full_name} generated a {len(ai_result.days)}-day AI travel plan for {trip.destination}.",
        link_url=f"/trips/{trip.id}?tab=itinerary",
        extra_data={"trip_id": trip.id}
    )

    return db.query(ItineraryDay).filter(ItineraryDay.trip_id == trip.id).order_by(ItineraryDay.day_number.asc()).all()
