from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from app.db import get_db

router = APIRouter(
    prefix="/api/v1/classes",
    tags=["classes"]
)

@router.get("/")
async def list_classes(db=Depends(get_db)):
    query = """
        SELECT
            c.class_id,
            c.class_name,
            c.grade_level,
            c.room_number,
            c.capacity,
            t.first_name || ' ' || t.last_name  AS teacher_name,
            t.subject                            AS teacher_subject,
            COUNT(s.student_id) FILTER (WHERE s.is_active = TRUE)::INTEGER AS student_count
        FROM classes c
        JOIN teachers t ON c.teacher_id = t.teacher_id
        LEFT JOIN students s ON s.class_id = c.class_id
        GROUP BY c.class_id, t.teacher_id
        ORDER BY c.grade_level, c.class_name
    """
    rows = await db.fetch(query)
    return [dict(row) for row in rows]


class ClassCreate(BaseModel):
    class_name: str = Field(min_length=2, max_length=50)
    grade_level: int = Field(ge=1, le=12)
    teacher_id: int
    room_number: str | None = Field(default=None, max_length=10)
    capacity: int = Field(default=30, gt=0)


@router.post("/")
async def create_class(item: ClassCreate, db=Depends(get_db)):
    try:
        row = await db.fetchrow(
            """
            INSERT INTO classes (class_name, grade_level, teacher_id, room_number, capacity)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING class_id
            """,
            item.class_name.strip(),
            item.grade_level,
            item.teacher_id,
            item.room_number,
            item.capacity,
        )
    except Exception as error:
        raise HTTPException(
            status_code=400,
            detail="Could not create class; check that its name is unique and teacher exists.",
        ) from error
    return {"class_id": row["class_id"], "message": "Class created"}