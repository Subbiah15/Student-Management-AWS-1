export interface ClassOption {
  class_id: number;
  class_name: string;
  grade_level: number;
  room_number: string | null;
  capacity: number;
  teacher_name: string;
  student_count: number;
}

export interface TeacherOption {
  teacher_id: number;
  full_name: string;
  subject: string;
}

const API_BASE_URL = "/api";


export const classService = {
  getAll: async (): Promise<ClassOption[]> => {
    const response = await fetch(`${API_BASE_URL}/classes`);
    if (!response.ok) throw new Error(`Failed to load classes (${response.status})`);
    return response.json();
  },
  create: async (data: { class_name: string; grade_level: number; teacher_id: number; room_number: string; capacity: number }) => {
    const response = await fetch(`${API_BASE_URL}/classes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const detail = await response.json().catch(() => ({}));
      throw new Error(detail.detail || "Could not create class");
    }
    return response.json();
  },
  getTeachers: async (): Promise<TeacherOption[]> => {
    const response = await fetch(`${API_BASE_URL}/teachers`);
    if (!response.ok) throw new Error(`Failed to load teachers (${response.status})`);
    return response.json();
  },
};