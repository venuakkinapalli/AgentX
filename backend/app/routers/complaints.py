from fastapi import APIRouter, HTTPException, status
from ..schemas import ComplaintListResponse
from ..database import db_manager

router = APIRouter(prefix="/api/admin/complaints", tags=["Admin Complaints (View Only)"])

@router.get(
    "",
    response_model=ComplaintListResponse,
    status_code=status.HTTP_200_OK,
    summary="Get all complaints submitted by students (View Only)",
    description="Fetches all complaints registered by hostel students from Supabase with joined student details. Strictly view-only."
)
async def get_complaints():
    try:
        complaints = db_manager.fetch_all_complaints()
        return ComplaintListResponse(
            success=True,
            count=len(complaints),
            data=complaints,
            complaints=complaints
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch complaints: {str(e)}"
        )
