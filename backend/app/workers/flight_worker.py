import asyncio
import logging
import random
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from backend.app.core.database import SessionLocal
from backend.app.models.flight import Flight, FlightStatus
from backend.app.services.flight_tracking.service import flight_tracking_service

logger = logging.getLogger(__name__)

async def run_flight_monitoring_cycle():
    """
    Background worker cycle to simulate periodic flight tracking and status updates.
    """
    db = SessionLocal()
    try:
        active_flights = db.query(Flight).filter(
            Flight.status.in_([FlightStatus.SCHEDULED.value, FlightStatus.BOARDING.value, FlightStatus.DELAYED.value])
        ).all()

        for flight in active_flights:
            # Low probability simulation tick
            if random.random() < 0.15:
                transitions = {
                    FlightStatus.SCHEDULED.value: [
                        (FlightStatus.BOARDING.value, None, f"Boarding commenced at Gate {flight.gate or 'B14'}."),
                        (FlightStatus.DELAYED.value, 25, "Aircraft delayed due to late inbound arrival.")
                    ],
                    FlightStatus.BOARDING.value: [
                        (FlightStatus.DEPARTED.value, None, "Flight departed on time.")
                    ],
                    FlightStatus.DELAYED.value: [
                        (FlightStatus.BOARDING.value, None, "Delay resolved; boarding now open.")
                    ]
                }
                possibilities = transitions.get(flight.status, [])
                if possibilities:
                    new_status, delay, msg = random.choice(possibilities)
                    flight_tracking_service.update_flight_status(
                        db=db,
                        flight_id=flight.id,
                        new_status=new_status,
                        delay_minutes=delay,
                        message=msg
                    )
                    logger.info(f"Simulated flight update: {flight.flight_number} -> {new_status}")
    except Exception as e:
        logger.error(f"Error in flight monitoring cycle: {e}")
    finally:
        db.close()

async def start_flight_worker_loop(interval_seconds: int = 60):
    logger.info("Flight monitoring background worker started.")
    while True:
        await run_flight_monitoring_cycle()
        await asyncio.sleep(interval_seconds)
