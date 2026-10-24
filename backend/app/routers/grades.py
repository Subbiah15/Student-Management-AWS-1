from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field

from app.db import get_db

router = APIRouter(prefix="/api/v1/grades", tags=["grades"])


class GradeCreate(BaseModel):
    student_id: int
    subject: str = Field(min_length=1, max_length=100)
    score: float = Field(ge=0, le=100)
    term: str = Field(min_length=1, max_length=20)
    exam_type: str = Field(default="End of Term", max_length=30)


@router.get("/")
async def list_grades(
    student_id: int | None = Query(default=None), db=Depends(get_db)
):
    rows = await db.fetch(
        """
        SELECT g.grade_id, g.student_id,
               s.first_name || ' ' || s.last_name AS student_name,
               c.class_name, c.grade_level, g.subject, g.score,
               g.grade_letter, g.term, g.exam_type, g.recorded_at
        FROM grades g
        JOIN students s ON s.student_id = g.student_id
        JOIN classes c ON c.class_id = s.class_id
        WHERE ($1::INTEGER IS NULL OR g.student_id = $1)
        ORDER BY g.term DESC, s.last_name, s.first_name, g.subject
        """,
        student_id,
    )
    return [dict(row) for row in rows]


@router.post("/")
async def create_grade(grade: GradeCreate, db=Depends(get_db)):
    try:
        row = await db.fetchrow(
            """
            INSERT INTO grades (student_id, subject, score, term, exam_type)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING grade_id, student_id, subject, score, grade_letter, term, exam_type, recorded_at
            """,
            grade.student_id,
            grade.subject.strip(),
            grade.score,
            grade.term.strip(),
            grade.exam_type.strip(),
        )
    except Exception as error:
        raise HTTPException(
            status_code=400,
            detail="Could not save grade; check the student and duplicate subject/term.",
        ) from error
    return dict(row)