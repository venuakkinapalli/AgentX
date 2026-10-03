export interface Complaint {
  id: string;
  complaint_id?: string;
  student_phone: string;
  student_name?: string;
  room_number?: string;
  problem: string;
  description?: string | null;
  photo_url?: string | null;
  status: string;
  created_at?: string | null;
}

export interface ComplaintListResponse {
  success: boolean;
  count: number;
  data: Complaint[];
}
