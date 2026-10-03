from fastapi import APIRouter, HTTPException, Query, status
from typing import Optional, List
from ..schemas import StudentCreate, StudentCreateResponse, StudentListResponse
from ..database import db_manager

router = APIRouter(prefix="/api/admin/students", tags=["Admin Student Registration"])

@router.post(
    "",
    response_model=StudentCreateResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new hostel student",
    description="Registers a new hostel student with unique student ID, room, and contact details."
)
async def register_student(payload: StudentCreate):
    try:
        created_student = db_manager.insert_student(payload)
        return StudentCreateResponse(
            success=True,
            message="Student registered successfully.",
            data=created_student
        )
    except ValueError as ve:
        # Duplicate student ID or validation error
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(ve)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to register student: {str(e)}"
        )

@router.get(
    "",
    response_model=StudentListResponse,
    status_code=status.HTTP_200_OK,
    summary="Get all registered students",
    description="Fetches all registered students with optional search, hostel filter, and block filter."
)
async def get_students(
    search: Optional[str] = Query(None, description="Search by Student ID or Name"),
    hostel: Optional[str] = Query(None, description="Filter by Hostel Name"),
    block: Optional[str] = Query(None, description="Filter by Block")
):
    try:
        students = db_manager.fetch_all_students(search=search, hostel=hostel, block=block)
        db_status = db_manager.get_status()
        return StudentListResponse(
            success=True,
            count=len(students),
            data=students,
            storage_type=db_status.get("mode", "supabase")
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch students: {str(e)}"
        )

@router.get(
    "/status",
    summary="Get backend and database health status",
)
async def get_db_status():
    return {
        "status": "healthy",
        "database": db_manager.get_status()
    }
