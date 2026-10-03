# Smart Hostel Complaint Management Platform
## Module 1: Admin Dashboard for Student Registration

A modern, institutional hostel management portal built with **React + TypeScript + Tailwind CSS**, **Python FastAPI**, and **Supabase PostgreSQL**.

---

### Features Implemented
- **Admin Dashboard Layout**: Clean dark-mode sidebar, overview metrics, database status indicator, and quick actions.
- **Student Registration**:
  - Student ID, Name, Phone Number, Hostel Name, Block Number, Room Number
  - Unique Student ID enforcement & duplicate checking
  - Strict phone number format validation
  - Clear, user-friendly error banners and success confirmation
- **Students Directory**:
  - Full data table with all student attributes and registration timestamp
  - Real-time search by Student ID, Name, or Phone
  - Filter by Hostel Name
  - Filter by Block Number
  - One-click copy for Student ID
  - Instant refresh & reload
- **Enterprise Architecture**:
  - **React Frontend** &rarr; **FastAPI Backend** &rarr; **Supabase PostgreSQL**
  - **Zero frontend exposure**: The Supabase service role key remains strictly on the server.
  - Built-in fallback database for development and test execution.

---

### Prerequisites
- Node.js (v18+)
- Python (3.10+)

---

### 1. Database Setup (Supabase)
1. Go to your [Supabase Dashboard](https://supabase.com/dashboard) and open your project.
2. Open the **SQL Editor** tab.
3. Paste and run the SQL script located in `backend/supabase_schema.sql`.
4. Copy your **Project URL** and **Service Role Key** (found in Project Settings &rarr; API).
5. Open `backend/.env` and fill in:
   ```env
   SUPABASE_URL=https://your-project-id.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key-here
   ```

---

### 2. Running the Backend (FastAPI)
In a terminal:
```bash
cd backend
# Activate virtual environment
.\venv\Scripts\activate   # Windows
# (or source venv/bin/activate on Linux/macOS)

# Start FastAPI server
uvicorn app.main:app --reload --port 8000
```
API Documentation will be available at:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

---

### 3. Running the Frontend (React + Vite)
In a second terminal:
```bash
cd frontend
npm run dev
```
Open your browser at `http://localhost:5173`.

---

### API Specification
#### 1. Register Student
- **Endpoint**: `POST /api/admin/students`
- **Body**:
  ```json
  {
    "student_id": "STU001",
    "name": "Rahul Kumar",
    "phone": "9876543210",
    "hostel_name": "Boys Hostel A",
    "block_number": "B",
    "room_number": "204"
  }
  ```
- **Responses**:
  - `201 Created`: Student registered successfully.
  - `409 Conflict`: Student ID already exists.
  - `422 Unprocessable Entity`: Field validation failed.

#### 2. Get All Students
- **Endpoint**: `GET /api/admin/students`
- **Query Parameters**:
  - `search` (optional)
  - `hostel` (optional)
  - `block` (optional)
- **Response**: List of students ordered by creation time descending.
