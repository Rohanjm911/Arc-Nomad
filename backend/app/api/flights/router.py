from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from backend.app.core.database import get_db
from backend.app.models.user import User
from backend.app.models.trip import TripRole
from backend.app.models.flight import Flight, FlightStatus
from backend.app.schemas.flight import (
    FlightOut, FlightCreate, FlightUpdate, FlightSimulateStatusRequest
)
from backend.app.api.deps import get_current_user, check_trip_member, require_trip_roles
from backend.app.services.flight_tracking.service import flight_tracking_service

router = APIRouter(prefix="/flights", tags=["Flights"])

@router.get("/{trip_id}", response_model=List[FlightOut])
def get_trip_flights(
    trip_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    check_trip_member(trip_id=trip_id, db=db, current_user=current_user)
    flights = db.query(Flight).filter(Flight.trip_id == trip_id).order_by(Flight.departure_time.asc()).all()
    return flights

@router.post("/", response_model=FlightOut, status_code=status.HTTP_201_CREATED)
def create_flight(
    flight_in: FlightCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    require_trip_roles([TripRole.OWNER.value, TripRole.EDITOR.value])(
        trip_id=flight_in.trip_id, db=db, current_user=current_user
    )

    flight = Flight(
        trip_id=flight_in.trip_id,
        user_id=flight_in.user_id or current_user.id,
        airline=flight_in.airline,
        flight_number=flight_in.flight_number.upper(),
        departure_airport=flight_in.departure_airport.upper(),
        arrival_airport=flight_in.arrival_airport.upper(),
        departure_city=flight_in.departure_city,
        arrival_city=flight_in.arrival_city,
        departure_time=flight_in.departure_time,
        arrival_time=flight_in.arrival_time,
        terminal=flight_in.terminal,
        gate=flight_in.gate,
        status=flight_in.status or FlightStatus.SCHEDULED.value,
        seat=flight_in.seat,
        booking_reference=flight_in.booking_reference,
        notes=flight_in.notes
    )
    db.add(flight)
    db.commit()
    db.refresh(flight)
    return flight

@router.put("/{flight_id}", response_model=FlightOut)
def update_flight(
    flight_id: str,
    flight_in: FlightUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    flight = db.query(Flight).filter(Flight.id == flight_id).first()
    if not flight:
        raise HTTPException(status_code=404, detail="Flight not found")

    require_trip_roles([TripRole.OWNER.value, TripRole.EDITOR.value])(
        trip_id=flight.trip_id, db=db, current_user=current_user
    )

    if flight_in.airline is not None:
        flight.airline = flight_in.airline
    if flight_in.flight_number is not None:
        flight.flight_number = flight_in.flight_number.upper()
    if flight_in.departure_airport is not None:
        flight.departure_airport = flight_in.departure_airport.upper()
    if flight_in.arrival_airport is not None:
        flight.arrival_airport = flight_in.arrival_airport.upper()
    if flight_in.departure_city is not None:
        flight.departure_city = flight_in.departure_city
    if flight_in.arrival_city is not None:
        flight.arrival_city = flight_in.arrival_city
    if flight_in.departure_time is not None:
        flight.departure_time = flight_in.departure_time
    if flight_in.arrival_time is not None:
        flight.arrival_time = flight_in.arrival_time
    if flight_in.terminal is not None:
        flight.terminal = flight_in.terminal
    if flight_in.gate is not None:
        flight.gate = flight_in.gate
    if flight_in.status is not None:
        flight.status = flight_in.status
    if flight_in.seat is not None:
        flight.seat = flight_in.seat
    if flight_in.booking_reference is not None:
        flight.booking_reference = flight_in.booking_reference
    if flight_in.notes is not None:
        flight.notes = flight_in.notes

    db.commit()
    db.refresh(flight)
    return flight

@router.delete("/{flight_id}")
def delete_flight(
    flight_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    flight = db.query(Flight).filter(Flight.id == flight_id).first()
    if not flight:
        raise HTTPException(status_code=404, detail="Flight not found")

    require_trip_roles([TripRole.OWNER.value, TripRole.EDITOR.value])(
        trip_id=flight.trip_id, db=db, current_user=current_user
    )

    db.delete(flight)
    db.commit()
    return {"message": "Flight deleted"}

@router.post("/{flight_id}/simulate-status", response_model=FlightOut)
def simulate_flight_status(
    flight_id: str,
    sim_in: FlightSimulateStatusRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    flight = db.query(Flight).filter(Flight.id == flight_id).first()
    if not flight:
        raise HTTPException(status_code=404, detail="Flight not found")

    check_trip_member(trip_id=flight.trip_id, db=db, current_user=current_user)

    updated_flight = flight_tracking_service.update_flight_status(
        db=db,
        flight_id=flight_id,
        new_status=sim_in.new_status,
        gate=sim_in.gate,
        terminal=sim_in.terminal,
        delay_minutes=sim_in.delay_minutes,
        message=sim_in.message,
        updated_by_user_id=current_user.id
    )

    return updated_flight
