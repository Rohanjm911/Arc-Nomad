from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import Response, StreamingResponse
from sqlalchemy.orm import Session
import urllib.parse
from backend.app.core.database import get_db
from backend.app.models.user import User
from backend.app.models.trip import Trip
from backend.app.api.deps import get_current_user, check_trip_member
from backend.app.services.pdf.generator import pdf_export_service
from backend.app.services.excel.generator import excel_export_service

router = APIRouter(prefix="/exports", tags=["Exports"])

@router.get("/{trip_id}/pdf")
def export_trip_pdf(
    trip_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    trip, _ = check_trip_member(trip_id=trip_id, db=db, current_user=current_user)
    
    pdf_buffer = pdf_export_service.generate_trip_itinerary_pdf(db=db, trip_id=trip_id)
    
    safe_title = "".join(c for c in trip.title if c.isalnum() or c in (" ", "_", "-")).rstrip()
    filename = f"ARC_NOMADE_{safe_title}_Itinerary.pdf"
    encoded_filename = urllib.parse.quote(filename)

    return Response(
        content=pdf_buffer.getvalue(),
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"; filename*=UTF-8\'\'{encoded_filename}'
        }
    )

@router.get("/{trip_id}/excel")
def export_trip_excel(
    trip_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    trip, _ = check_trip_member(trip_id=trip_id, db=db, current_user=current_user)

    excel_buffer = excel_export_service.generate_expense_workbook(db=db, trip_id=trip_id)

    safe_title = "".join(c for c in trip.title if c.isalnum() or c in (" ", "_", "-")).rstrip().replace(" ", "_")
    filename = f"ARC_NOMADE_{safe_title}_Dossier.xlsx"
    encoded_filename = urllib.parse.quote(filename)

    return Response(
        content=excel_buffer.getvalue(),
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"; filename*=UTF-8\'\'{encoded_filename}'
        }
    )
