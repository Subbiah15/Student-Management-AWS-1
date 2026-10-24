export interface GradeRecord {
  grade_id: number;
  student_id: number;
  student_name: string;
  class_name: string;
  grade_level: number;
  subject: string;
  score: number;
  grade_letter: string;
  term: string;
  exam_type: string;
  recorded_at: string;
}

export interface GradeInput {
  student_id: number;
  subject: string;
  score: number;
  term: string;
  exam_type: string;
}

export const gradeService = {
  async getAll(studentId?: number): Promise<GradeRecord[]> {
    const query = studentId ? `?student_id=${studentId}` : "";
    const response = await fetch(`/api/grades${query}`);
    if (!response.ok) throw new Error(`Failed to load grades (${response.status})`);
    return response.json();
  },
  async create(grade: GradeInput): Promise<GradeRecord> {
    const response = await fetch("/api/grades", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(grade),
    });
    if (!response.ok) {
      const detail = await response.json().catch(() => ({}));
      throw new Error(detail.detail || "Could not save grade");
    }
    return response.json();
  },
};