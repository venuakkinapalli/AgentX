import re
import logging
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone
from supabase import create_client, Client
from .config import settings
from .schemas import StudentCreate, StudentRecord, ComplaintRecord

logger = logging.getLogger("hostel_admin.database")

class DatabaseManager:
    def __init__(self):
        self.supabase: Client = None
        self._initialize()

    def _initialize(self):
        url = settings.SUPABASE_URL.strip()
        key = settings.active_supabase_key

        if not url or not key:
            raise RuntimeError(
                "Supabase URL and API Key must be set in backend/.env. "
                "Supabase is the sole source of truth."
            )

        try:
            self.supabase = create_client(url, key)
            logger.info("Connected to Supabase project at %s", url)
        except Exception as e:
            logger.error("Failed to initialize Supabase client: %s", e)
            raise RuntimeError(f"Could not connect to Supabase: {str(e)}")

    def get_status(self) -> Dict[str, Any]:
        return {
            "mode": "supabase",
            "supabase_url": settings.SUPABASE_URL,
            "connected": self.supabase is not None,
        }

    def check_duplicate_phone(self, phone: str) -> bool:
        """Returns True if student with this phone number already exists."""
        clean_phone = phone.strip()
        try:
            response = self.supabase.table("students").select("phone").eq("phone", clean_phone).execute()
            return bool(response.data and len(response.data) > 0)
        except Exception as e:
            err_msg = str(e)
            logger.error("Error during Supabase duplicate phone check: %s", err_msg)
            # Pass clear error if table not found or permission issue
            if "PGRST205" in err_msg or "Could not find the table" in err_msg:
                raise RuntimeError(
                    "Table 'students' not found in Supabase schema cache. "
                    "Please ensure the 'students' table exists in the public schema of your Supabase project."
                )
            raise RuntimeError(f"Supabase database error: {err_msg}")

    def insert_student(self, student: StudentCreate) -> StudentRecord:
        """Inserts a new student record into the Supabase students table."""
        clean_phone = student.phone.strip()

        # Check for duplicate phone
        if self.check_duplicate_phone(clean_phone):
            raise ValueError(f"A student with phone number '{clean_phone}' is already registered in the hostel system.")

        payload = {
            "phone": clean_phone,
            "name": student.name.strip(),
            "hostel_name": student.hostel_name.strip(),
            "block_number": student.block_number.strip(),
            "room_number": student.room_number.strip(),
            "status": "ACTIVE",
        }

        try:
            response = self.supabase.table("students").insert(payload).execute()
            if not response.data:
                raise RuntimeError("Supabase returned empty response upon insert.")

            inserted = response.data[0]
            return StudentRecord(
                id=str(inserted.get("id")) if inserted.get("id") else None,
                phone=inserted.get("phone", clean_phone),
                name=inserted.get("name", student.name.strip()),
                hostel_name=inserted.get("hostel_name", student.hostel_name.strip()),
                block_number=inserted.get("block_number", student.block_number.strip()),
                room_number=inserted.get("room_number", student.room_number.strip()),
                status=inserted.get("status", "ACTIVE"),
                created_at=str(inserted.get("created_at", datetime.now(timezone.utc).isoformat())),
            )
        except Exception as e:
            err_msg = str(e)
            logger.error("Supabase insert error: %s", err_msg)
            if "duplicate key" in err_msg.lower() or "unique constraint" in err_msg.lower() or "23505" in err_msg:
                raise ValueError(f"Phone number '{clean_phone}' is already registered.")
            if "42501" in err_msg or "row-level security" in err_msg.lower():
                raise RuntimeError(
                    "Supabase Row-Level Security (RLS) is active on 'public.students' and blocking the insert. "
                    "To resolve: In Supabase SQL Editor, run: "
                    "ALTER TABLE public.students DISABLE ROW LEVEL SECURITY; "
                    "(or add SUPABASE_SERVICE_ROLE_KEY to backend/.env)."
                )
            if "PGRST205" in err_msg or "Could not find the table" in err_msg:
                raise RuntimeError(
                    "Table 'public.students' was not found in Supabase schema cache. "
                    "Please verify the table is created in public schema."
                )
            raise RuntimeError(f"Failed to insert student into Supabase: {err_msg}")

    def fetch_all_students(
        self,
        search: Optional[str] = None,
        hostel: Optional[str] = None,
        block: Optional[str] = None
    ) -> List[StudentRecord]:
        """Fetches all students directly from Supabase ordered by created_at DESC."""
        try:
            query = self.supabase.table("students").select("*")

            if hostel and hostel.strip():
                query = query.eq("hostel_name", hostel.strip())
            if block and block.strip():
                query = query.eq("block_number", block.strip())

            # Attempt ordering by created_at descending
            try:
                query = query.order("created_at", desc=True)
            except Exception:
                pass

            response = query.execute()
            rows = response.data or []

            students = []
            for row in rows:
                # In-memory search filter for search term
                if search and search.strip():
                    term = search.strip().lower()
                    phone_match = term in str(row.get("phone", "")).lower()
                    name_match = term in str(row.get("name", "")).lower()
                    if not (phone_match or name_match):
                        continue

                students.append(
                    StudentRecord(
                        id=str(row.get("id")) if row.get("id") else None,
                        phone=str(row.get("phone", "")),
                        name=str(row.get("name", "")),
                        hostel_name=str(row.get("hostel_name", "")),
                        block_number=str(row.get("block_number", "")),
                        room_number=str(row.get("room_number", "")),
                        status=str(row.get("status", "ACTIVE")),
                        created_at=str(row.get("created_at", "")),
                    )
                )

            return students
        except Exception as e:
            err_msg = str(e)
            logger.error("Supabase fetch error: %s", err_msg)
            if "PGRST205" in err_msg or "Could not find the table" in err_msg:
                raise RuntimeError(
                    "Table 'students' was not found in Supabase schema cache. "
                    "Please verify the table is created in public schema."
                )
            raise RuntimeError(f"Failed to fetch students from Supabase: {err_msg}")

    def fetch_all_complaints(self) -> List[ComplaintRecord]:
        """
        Fetches all student complaints directly from Supabase complaints table.
        Uses students.phone -> complaints.student_phone relation to populate student name and details.
        Administrator view only.
        """
        try:
            # 1. Fetch complaints from public.complaints
            query = self.supabase.table("complaints").select("*")
            try:
                query = query.order("created_at", desc=True)
            except Exception as oe:
                logger.debug("created_at order ignored: %s", oe)

            complaint_res = query.execute()
            complaint_rows = complaint_res.data

            if complaint_rows is None:
                raise RuntimeError("Supabase query on 'public.complaints' returned null data.")

            logger.info("Retrieved %d complaints from public.complaints table in Supabase", len(complaint_rows))

            # 2. Build student lookup map for student_phone -> student info
            student_map = {}
            try:
                students_res = self.supabase.table("students").select("phone, name, room_number").execute()
                for s in (students_res.data or []):
                    clean_p = str(s.get("phone", "")).strip()
                    if clean_p:
                        student_map[clean_p] = s
                        # Also index digits
                        digits = re.sub(r"\D", "", clean_p)
                        if digits:
                            student_map[digits] = s
                            if len(digits) >= 10:
                                student_map[digits[-10:]] = s
            except Exception as se:
                logger.error("Error fetching students for complaints relation: %s", se)

            # 3. Assemble ComplaintRecord objects with joined student info
            complaints = []
            for row in complaint_rows:
                raw_phone = str(row.get("student_phone", "")).strip()
                digits_phone = re.sub(r"\D", "", raw_phone)
                last10 = digits_phone[-10:] if len(digits_phone) >= 10 else digits_phone

                student_info = (
                    student_map.get(raw_phone)
                    or student_map.get(digits_phone)
                    or student_map.get(last10)
                    or {}
                )

                cid = str(row.get("id") or row.get("complaint_id") or "")
                st_name = student_info.get("name") or "Student"
                rm_no = str(row.get("room_number") or student_info.get("room_number") or "N/A")

                complaints.append(
                    ComplaintRecord(
                        id=cid,
                        complaint_id=cid,
                        student_phone=raw_phone,
                        student_name=st_name,
                        room_number=rm_no,
                        problem=str(row.get("problem", "Unspecified")),
                        description=str(row.get("description", "")) if row.get("description") else None,
                        photo_url=str(row.get("photo_url", "")) if row.get("photo_url") else None,
                        status=str(row.get("status", "PENDING")),
                        created_at=str(row.get("created_at", "")) if row.get("created_at") else None,
                    )
                )

            return complaints
        except Exception as e:
            err_msg = str(e)
            logger.error("Supabase complaints fetch error: %s", err_msg)
            if "PGRST205" in err_msg or "Could not find the table" in err_msg:
                raise RuntimeError(
                    "Table 'complaints' was not found in Supabase schema cache. "
                    "Please verify public.complaints exists in your Supabase project."
                )
            raise RuntimeError(f"Failed to fetch complaints from Supabase: {err_msg}")

db_manager = DatabaseManager()
