import re
from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, Field, field_validator

PHONE_REGEX = re.compile(r"^\+?[0-9]{10,15}$")

class StudentBase(BaseModel):
    phone: str = Field(..., description="Unique Phone Number of the Student (e.g. 9876543210)", min_length=10, max_length=15)
    name: str = Field(..., description="Full Name of the Student", min_length=2, max_length=100)
    hostel_name: str = Field(..., description="Name of the hostel, e.g. Boys Hostel A", min_length=2, max_length=100)
    block_number: str = Field(..., description="Block identifier, e.g. B", min_length=1, max_length=50)
    room_number: str = Field(..., description="Room identifier, e.g. 204", min_length=1, max_length=50)

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, v: str) -> str:
        clean = re.sub(r"[\s\-\(\)]", "", v.strip())
        if not PHONE_REGEX.match(clean):
            raise ValueError("Please provide a valid 10 to 15-digit phone number (e.g. 9876543210)")
        return clean

    @field_validator("name")
    @classmethod
    def validate_name(cls, v: str) -> str:
        clean = v.strip()
        if not clean:
            raise ValueError("Student name cannot be blank")
        if len(clean) < 2:
            raise ValueError("Student name must be at least 2 characters")
        return clean

    @field_validator("hostel_name", "block_number", "room_number")
    @classmethod
    def validate_non_empty(cls, v: str, info) -> str:
        clean = v.strip()
        if not clean:
            field_name = info.field_name.replace("_", " ").title()
            raise ValueError(f"{field_name} is required and cannot be blank")
        return clean

class StudentCreate(StudentBase):
    pass

class StudentRecord(StudentBase):
    id: Optional[str] = None
    status: str = "ACTIVE"
    created_at: Optional[str] = None

class StudentCreateResponse(BaseModel):
    success: bool = True
    message: str = "Student registered successfully."
    data: StudentRecord

class StudentListResponse(BaseModel):
    success: bool = True
    count: int
    data: List[StudentRecord]

class ComplaintRecord(BaseModel):
    id: str
    complaint_id: Optional[str] = None
    student_phone: str
    student_name: Optional[str] = "Student"
    room_number: Optional[str] = None
    problem: str
    description: Optional[str] = None
    photo_url: Optional[str] = None
    status: str = "PENDING"
    created_at: Optional[str] = None

class ComplaintListResponse(BaseModel):
    success: bool = True
    count: int
    data: List[ComplaintRecord]
    complaints: List[ComplaintRecord] = []

