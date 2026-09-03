from sqlalchemy.orm import Session
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any
from backend.app.models.flight import Flight, FlightStatusHistory, FlightStatus
from backend.app.models.notification import NotificationType
from backend.app.services.notifications.service import notification_service

class FlightTrackingService:
    @staticmethod
    def update_flight_status(
        db: Session,
        flight_id: str,
        new_status: str,
        gate: Optional[str] = None,
        terminal: Optional[str] = None,
        delay_minutes: Optional[int] = None,
        message: Optional[str] = None,
        updated_by_user_id: Optional[str] = None
    ) -> Flight:
        flight = db.query(Flight).filter(Flight.id == flight_id).first()
        if not flight:
            raise ValueError("Flight not found")

        old_status = flight.status
        flight.status = new_status
        if gate:
            flight.gate = gate
        if terminal:
            flight.terminal = terminal
        if delay_minutes and delay_minutes > 0:
            msg = f"Flight delayed by {delay_minutes} minutes. {message or ''}"
        else:
            msg = message or f"Flight status updated from {old_status} to {new_status}."

        history = FlightStatusHistory(
            flight_id=flight.id,
            old_status=old_status,
            new_status=new_status,
            message=msg
        )
        db.add(history)
        db.commit()
        db.refresh(flight)

        # Generate notifications for the trip members
        notif_type = NotificationType.FLIGHT_DELAY.value if new_status == FlightStatus.DELAYED.value else (
            NotificationType.FLIGHT_CANCELLATION.value if new_status == FlightStatus.CANCELLED.value else (
                NotificationType.GATE_CHANGE.value if gate and gate != flight.gate else NotificationType.SYSTEM.value
            )
        )
        
        notification_title = f"Flight {flight.airline} {flight.flight_number}: {new_status}"
        notification_msg = f"{flight.departure_airport} → {flight.arrival_airport}: {msg}"
        if gate:
            notification_msg += f" (Gate: {gate})"

        notification_service.notify_trip_members(
            db=db,
            trip_id=flight.trip_id,
            exclude_user_id=None,
            type=notif_type,
            title=notification_title,
            message=notification_msg,
            link_url=f"/trips/{flight.trip_id}?tab=flights",
            extra_data={"flight_id": flight.id, "new_status": new_status, "gate": gate}
        )

        return flight

flight_tracking_service = FlightTrackingService()
