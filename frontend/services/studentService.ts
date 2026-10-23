import { StudentFormValues } from "@/lib/validations/student";

export interface StudentRecord {
  student_id: number;
  full_name: string;
  class_name: string;
  grade_level: number;
  status: "active" | "inactive";
}

const API_BASE_URL = "/api";

export const studentService = {
  async getAll(): Promise<StudentRecord[]> {
    const response = await fetch(`${API_BASE_URL}/students`);
    if (!response.ok) {
      throw new Error(`Failed to fetch students: ${response.statusText}`);
    }
    return response.json();
  },
  async create (data: StudentFormValues) {
    const response = await fetch(`${API_BASE_URL}/students`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Failed to add student");
    }
    return response.json();
  },
};
