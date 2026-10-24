export interface AttendanceRecord {
  student_id: number;
  full_name: string;
  class_id: number;
  class_name: string;
  grade_level: number;
  attendance_date: string;
  status: "present" | "absent" | "late" | "excused" | "unmarked";
}

export const attendanceService = {
  async getByDate(date: string, classId?: number): Promise<AttendanceRecord[]> {
    const params = new URLSearchParams({ attendance_date: date });
    if (classId) params.set("class_id", String(classId));
    const response = await fetch(`/api/attendance?${params.toString()}`);
    if (!response.ok) throw new Error(`Failed to load attendance (${response.status})`);
    return response.json();
  },
  async save(date: string, records: Pick<AttendanceRecord, "student_id" | "status">[]): Promise<void> {
    const response = await fetch("/api/attendance", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ attendance_date: date, records }),
    });
    if (!response.ok) {
      const detail = await response.json().catch(() => ({}));
      throw new Error(detail.detail || "Could not save attendance");
    }
  },
};