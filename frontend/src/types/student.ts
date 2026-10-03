export interface Student {
  id?: string;
  phone: string;
  name: string;
  hostel_name: string;
  block_number: string;
  room_number: string;
  status: string;
  created_at?: string;
}

export interface StudentFormData {
  phone: string;
  name: string;
  hostel_name: string;
  block_number: string;
  room_number: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  count?: number;
  storage_type?: string;
}

export interface ApiError {
  detail?: string | Array<{ msg: string; loc: string[] }>;
  message?: string;
}
