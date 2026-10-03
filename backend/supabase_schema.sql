-- =========================================================================
-- Smart Hostel Complaint Management Platform: Student Registration Schema
-- Table: students
-- =========================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Drop table if exists for fresh setup (comment out if appending to existing DB)
-- DROP TABLE IF EXISTS students CASCADE;

CREATE TABLE IF NOT EXISTS students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    hostel_name TEXT NOT NULL,
    block_number TEXT NOT NULL,
    room_number TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for unique student_id lookup and performance
CREATE INDEX IF NOT EXISTS idx_students_student_id ON students (student_id);
CREATE INDEX IF NOT EXISTS idx_students_hostel_name ON students (hostel_name);
CREATE INDEX IF NOT EXISTS idx_students_created_at ON students (created_at DESC);

-- Row Level Security (RLS) policies
-- Note: FastAPI backend accesses Supabase using the service_role key, which bypasses RLS.
-- This ensures the service role key remains strictly within the backend.
ALTER TABLE students ENABLE ROW LEVEL SECURITY;

-- If anon/authenticated access is ever enabled via Supabase directly:
-- Disallow public inserts/deletes to prevent tampering; only read or service role
CREATE POLICY "Allow service role full access" 
ON students 
FOR ALL 
TO service_role 
USING (true) 
WITH CHECK (true);

-- Optional sample initial seed data (commented out by default)
/*
INSERT INTO students (student_id, name, phone, hostel_name, block_number, room_number, status)
VALUES 
('STU001', 'Rahul Kumar', '9876543210', 'Boys Hostel A', 'B', '204', 'ACTIVE'),
('STU002', 'Priya Sharma', '9123456780', 'Girls Hostel 1', 'A', '105', 'ACTIVE'),
('STU003', 'Aman Verma', '9898989898', 'Boys Hostel B', 'C', '312', 'ACTIVE')
ON CONFLICT (student_id) DO NOTHING;
*/
