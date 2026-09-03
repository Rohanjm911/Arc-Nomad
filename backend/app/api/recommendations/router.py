from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from backend.app.core.database import get_db
from backend.app.models.user import User
from backend.app.models.trip import TripRole
from backend.app.models.recommendation import Recommendation
from backend.app.models.itinerary import ItineraryDay, ItineraryItem
from backend.app.schemas.recommendation import (
    RecommendationOut, RecommendationCreate, SaveToItineraryRequest
)
from backend.app.schemas.ai import AIRecommendationRequest, GeneratedRecommendationsResponse
from backend.app.api.deps import get_current_user, check_trip_member, require_trip_roles
from backend.app.services.ai.service import ai_service

router = APIRouter(prefix="/recommendations", tags=["Recommendations"])

@router.get("/{trip_id}", response_model=List[RecommendationOut])
def get_trip_recommendations(
    trip_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    check_trip_member(trip_id=trip_id, db=db, current_user=current_user)
    recs = db.query(Recommendation).filter(Recommendation.trip_id == trip_id).order_by(Recommendation.created_at.desc()).all()
    return recs

@router.post("/explore", response_model=GeneratedRecommendationsResponse)
async def explore_recommendations(
    req: AIRecommendationRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    check_trip_member(trip_id=req.trip_id, db=db, current_user=current_user)
    return await ai_service.generate_recommendations(req)

@router.post("/save", response_model=RecommendationOut, status_code=status.HTTP_201_CREATED)
def save_recommendation(
    rec_in: RecommendationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    require_trip_roles([TripRole.OWNER.value, TripRole.EDITOR.value])(
        trip_id=rec_in.trip_id, db=db, current_user=current_user
    )

    rec = Recommendation(
        trip_id=rec_in.trip_id,
        name=rec_in.name,
        category=rec_in.category,
        description=rec_in.description,
        rating=rec_in.rating,
        price_level=rec_in.price_level,
        address=rec_in.address,
        latitude=rec_in.latitude,
        longitude=rec_in.longitude,
        image_url=rec_in.image_url,
        reason=rec_in.reason,
        tags=rec_in.tags,
        is_saved=True
    )
    db.add(rec)
    db.commit()
    db.refresh(rec)
    return rec

@router.post("/add-to-itinerary")
def add_recommendation_to_itinerary(
    req: SaveToItineraryRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    rec = db.query(Recommendation).filter(Recommendation.id == req.recommendation_id).first()
    if not rec:
        raise HTTPException(status_code=404, detail="Recommendation not found")

    day = db.query(ItineraryDay).filter(ItineraryDay.id == req.day_id).first()
    if not day:
        raise HTTPException(status_code=404, detail="Itinerary day not found")

    require_trip_roles([TripRole.OWNER.value, TripRole.EDITOR.value])(
        trip_id=day.trip_id, db=db, current_user=current_user
    )

    count = db.query(ItineraryItem).filter(ItineraryItem.day_id == day.id).count()

    cat_map = {
        "Attractions": "SIGHTSEEING",
        "Restaurants": "FOOD",
        "Cafes": "FOOD",
        "Activities": "ACTIVITY",
        "Hotels": "HOTEL",
        "Hidden Gems": "SIGHTSEEING"
    }
    mapped_cat = cat_map.get(rec.category, "SIGHTSEEING")

    item = ItineraryItem(
        day_id=day.id,
        trip_id=day.trip_id,
        title=rec.name,
        description=rec.description,
        location_name=rec.name,
        address=rec.address,
        latitude=rec.latitude,
        longitude=rec.longitude,
        start_time=req.start_time or "10:00",
        end_time=req.end_time or "12:00",
        category=mapped_cat,
        estimated_cost=req.estimated_cost or 0.0,
        currency="USD",
        order_index=count,
        notes=f"Added from recommendations. {rec.reason or ''}".strip()
    )
    db.add(item)
    rec.is_saved = True
    db.commit()

    return {"message": "Recommendation added to itinerary", "item_id": item.id}
