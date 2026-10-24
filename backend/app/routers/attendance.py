from datetime import date
from typing import Literal

from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel

from app.db import get_db

router = APIRouter(prefix="/api/v1/attendance", tags=["attendance"])


class AttendanceEntry(BaseModel):
    student_id: int
    status: Literal["present", "absent", "late", "excused", "unmarked"]


class AttendanceBatch(BaseModel):
    attendance_date: date
    records: list[AttendanceEntry]


@router.get("/")
async def list_attendance(
    attendance_date: date = Query(default_factory=date.today),
    class_id: int | None = Query(default=None),
    db=Depends(get_db),
):
    rows = await db.fetch(
        """
        SELECT s.student_id,
               s.first_name || ' ' || s.last_name AS full_name,
               c.class_id, c.class_name, c.grade_level,
               a.attendance_date,
               COALESCE(a.status, 'unmarked') AS status
        FROM students s
        JOIN classes c ON c.class_id = s.class_id
        LEFT JOIN student_attendance a
          ON a.student_id = s.student_id AND a.attendance_date = $1
        WHERE s.is_active = TRUE AND ($2::INTEGER IS NULL OR c.class_id = $2)
        ORDER BY c.grade_level, c.class_name, s.last_name, s.first_name
        """,
        attendance_date,
        class_id,
    )
    return [dict(row) for row in rows]


@router.put("/")
async def save_attendance(batch: AttendanceBatch, db=Depends(get_db)):
    async with db.transaction():
        for record in batch.records:
            if record.status == "unmarked":
                await db.execute(
                    "DELETE FROM student_attendance WHERE student_id = $1 AND attendance_date = $2",
                    record.student_id,
                    batch.attendance_date,
                )
            else:
                await db.execute(
                    """
                    INSERT INTO student_attendance (student_id, attendance_date, status)
                    VALUES ($1, $2, $3)
                    ON CONFLICT (student_id, attendance_date)
                    DO UPDATE SET status = EXCLUDED.status, updated_at = NOW()
                    """,
                    record.student_id,
                    batch.attendance_date,
                    record.status,
                )
    return {"saved": len(batch.records), "attendance_date": batch.attendance_date}