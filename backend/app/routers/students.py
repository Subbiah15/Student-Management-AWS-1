from fastapi import APIRouter, Depends, HTTPException
from app.db import get_db
from pydantic import BaseModel
from datetime import date

router = APIRouter(
    prefix="/api/v1/students",
    tags=["students"]
)

class StudentCreate(BaseModel):
    first_name: str
    last_name: str
    date_of_birth: date
    gender: str
    class_id: int
    parent_name: str | None = None
    parent_phone: str | None = None
    address: str | None = None


class StudentUpdate(BaseModel):
    first_name: str | None = None
    last_name: str | None = None
    date_of_birth: date | None = None
    gender: str | None = None
    class_id: int | None = None
    parent_name: str | None = None
    parent_phone: str | None = None
    address: str | None = None


student_record_query = """
    SELECT s.student_id,
           s.first_name,
           s.last_name,
           s.first_name || ' ' || s.last_name AS full_name,
           s.date_of_birth,
           s.gender,
           s.class_id,
           c.class_name,
           c.grade_level,
           s.parent_name,
           s.parent_phone,
           s.address,
           s.enrolled_at,
           s.is_active,
           CASE WHEN s.is_active THEN 'active' ELSE 'inactive' END AS status
    FROM students s
    JOIN classes c ON c.class_id = s.class_id
"""


@router.get("/")
async def list_students(db=Depends(get_db)):
    rows = await db.fetch(
        student_record_query + " ORDER BY c.grade_level, c.class_name, s.last_name"
    )
    return [dict(row) for row in rows]


@router.get("/{student_id}")
async def get_student(student_id: int, db=Depends(get_db)):
    row = await db.fetchrow(
        student_record_query + " WHERE s.student_id = $1", student_id
    )
    if row is None:
        raise HTTPException(status_code=404, detail="Student not found")
    return dict(row)


@router.get("/{student_id}/grades")
async def student_grades(student_id: int, db=Depends(get_db)):
    query = """
        SELECT
            s.first_name || ' ' || s.last_name  AS student_name,
            g.subject,
            g.score,
            g.grade_letter,
            g.term,
            g.exam_type
        FROM grades g
        JOIN students s ON g.student_id = s.student_id
        WHERE g.student_id = $1
        ORDER BY g.subject;
    """
    rows = await db.fetch(query, student_id)
    return [dict(row) for row in rows]


@router.put("/{student_id}")
async def update_student(student_id: int, student: StudentUpdate, db=Depends(get_db)):
    values = student.model_dump(exclude_unset=True)
    if not values:
        raise HTTPException(status_code=400, detail="No student fields supplied")

    allowed_fields = {
        "first_name",
        "last_name",
        "date_of_birth",
        "gender",
        "class_id",
        "parent_name",
        "parent_phone",
        "address",
    }
    fields = [field for field in values if field in allowed_fields]
    assignments = ", ".join(
        f"{field} = ${index}" for index, field in enumerate(fields, start=2)
    )
    row = await db.fetchrow(
        f"UPDATE students SET {assignments} WHERE student_id = $1 RETURNING student_id",
        student_id,
        *(values[field] for field in fields),
    )
    if row is None:
        raise HTTPException(status_code=404, detail="Student not found")

    updated = await db.fetchrow(
        student_record_query + " WHERE s.student_id = $1", student_id
    )
    return dict(updated)


@router.delete("/{student_id}")
async def archive_student(student_id: int, db=Depends(get_db)):
    row = await db.fetchrow(
        "UPDATE students SET is_active = FALSE WHERE student_id = $1 "
        "AND is_active = TRUE RETURNING student_id",
        student_id,
    )
    if row is None:
        raise HTTPException(status_code=404, detail="Active student not found")
    return {"message": "Student archived", "student_id": student_id}


@router.post("/")
async def add_student(student: StudentCreate, db=Depends(get_db)):
    query = """
        INSERT INTO students (first_name, last_name, date_of_birth, gender, class_id, parent_name, parent_phone, address)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING student_id;
    """
    try:
        new_id = await db.fetchval(
            query,
            student.first_name, student.last_name, student.date_of_birth,
            student.gender, student.class_id, student.parent_name, student.parent_phone, student.address
        )
        created = await db.fetchrow(
            student_record_query + " WHERE s.student_id = $1", new_id
        )
        return dict(created)
    except Exception as e:
        raise HTTPException(status_code=400, detail="Could not create student record") from e
