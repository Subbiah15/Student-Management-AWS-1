import { StudentFormValues } from "@/lib/validations/student";

export interface StudentRecord {
  student_id: number;
  first_name: string;
  last_name: string;
  full_name: string;
  date_of_birth: string;
  gender: "M" | "F" | "O";
  class_id: number;
  class_name: string;
  grade_level: number;
  parent_name: string | null;
  parent_phone: string | null;
  address: string | null;
  enrolled_at: string;
  is_active: boolean;
  status: "active" | "inactive";
}

const API_BASE_URL = "/api";

export const studentService = {
  async getAll(): Promise<StudentRecord[]> {
    const response = await fetch(`${API_BASE_URL}/students`);
    if (!response.ok) {
      const detail = await response.text();
      throw new Error(`Failed to fetch students (${response.status}): ${detail || response.statusText}`);
    }
    return response.json();
  },
  async getById(studentId: number): Promise<StudentRecord> {
    const response = await fetch(`${API_BASE_URL}/students/${studentId}`);
    if (!response.ok) throw new Error("Failed to load student profile");
    return response.json();
  },
  async create(data: StudentFormValues): Promise<StudentRecord> {
    const response = await fetch(`${API_BASE_URL}/students`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || "Failed to add student");
    }
    return response.json();
  },
  async update(studentId: number, data: Partial<StudentFormValues> & { address?: string }): Promise<StudentRecord> {
    const response = await fetch(`${API_BASE_URL}/students/${studentId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || "Failed to update student");
    }
    return response.json();
  },
  async archive(studentId: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/students/${studentId}`, { method: "DELETE" });
    if (!response.ok) throw new Error("Failed to archive student");
  },
};
