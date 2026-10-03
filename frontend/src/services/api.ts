import { Student, StudentFormData, ApiResponse } from '../types/student';

const API_BASE = '/api/admin/students';

export async function fetchStudents(filters?: {
  search?: string;
  hostel?: string;
  block?: string;
}): Promise<{ students: Student[]; storageType: string }> {
  const params = new URLSearchParams();
  if (filters?.search?.trim()) params.append('search', filters.search.trim());
  if (filters?.hostel?.trim()) params.append('hostel', filters.hostel.trim());
  if (filters?.block?.trim()) params.append('block', filters.block.trim());

  const url = `${API_BASE}${params.toString() ? `?${params.toString()}` : ''}`;
  const response = await fetch(url);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message = errorData.detail || errorData.message || `Failed to fetch students (${response.status})`;
    throw new Error(typeof message === 'string' ? message : JSON.stringify(message));
  }

  const result: ApiResponse<Student[]> = await response.json();
  return {
    students: result.data || [],
    storageType: result.storage_type || 'supabase',
  };
}

export async function registerStudent(studentData: StudentFormData): Promise<{
  student: Student;
  message: string;
}> {
  const response = await fetch(API_BASE, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(studentData),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    if (response.status === 409) {
      throw new Error(data.detail || `A student with phone '${studentData.phone}' is already registered.`);
    }
    if (response.status === 422) {
      if (Array.isArray(data.detail)) {
        const errorMessages = data.detail.map((err: any) => err.msg || 'Invalid field').join(', ');
        throw new Error(errorMessages);
      }
      throw new Error(data.message || data.detail || 'Validation failed. Please verify all inputs.');
    }
    throw new Error(data.detail || data.message || `Server error (${response.status})`);
  }

  return {
    student: data.data,
    message: data.message || 'Student registered successfully in Supabase.',
  };
}

export async function checkHealth(): Promise<{ status: string; mode: string }> {
  try {
    const response = await fetch(`${API_BASE}/status`);
    if (response.ok) {
      const data = await response.json();
      return {
        status: data.status,
        mode: data.database?.mode || 'supabase',
      };
    }
  } catch (e) {
    // fallback
  }
  return { status: 'offline', mode: 'supabase' };
}

export async function fetchComplaints(): Promise<import('../types/complaint').Complaint[]> {
  const response = await fetch('/api/admin/complaints');
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message = errorData.detail || errorData.message || `Failed to fetch complaints (${response.status})`;
    throw new Error(typeof message === 'string' ? message : JSON.stringify(message));
  }
  const result = await response.json();
  if (Array.isArray(result)) {
    return result;
  }
  if (Array.isArray(result.data)) {
    return result.data;
  }
  if (Array.isArray(result.complaints)) {
    return result.complaints;
  }
  return [];
}
