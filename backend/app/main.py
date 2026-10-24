import asyncio

from app.routers import attendance, classes, grades, students, teachers
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .db import create_db_pool, get_db

app = FastAPI(
    title="Student Management API",
    description="API for student records, classes, attendance, and grades.",
    version="1.0.0",
)

origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup():
    # Don't just crash. Retry.
    retries = 10
    while retries > 0:
        try:
            # Store the pool in the app state so it's accessible globally
            app.state.db_pool = await create_db_pool()
            await app.state.db_pool.execute(
                """
                CREATE TABLE IF NOT EXISTS student_attendance (
                    attendance_id SERIAL PRIMARY KEY,
                    student_id INTEGER NOT NULL REFERENCES students(student_id) ON DELETE CASCADE,
                    attendance_date DATE NOT NULL,
                    status VARCHAR(12) NOT NULL CHECK (status IN ('present', 'absent', 'late', 'excused')),
                    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
                    UNIQUE (student_id, attendance_date)
                )
                """
            )
            print("Successfully connected to the database pool.")
            break
        except Exception as e:
            retries -= 1
            print(f"Database not ready. Retrying in 2 seconds... {retries} attempts left")
            await asyncio.sleep(2)

    if retries == 0:
        raise RuntimeError("Could not connect to database after 10 attempts.")


@app.on_event("shutdown")
async def shutdown():
    # Clean up the pool when the app stops
    await app.state.db_pool.close()

app.include_router(students.router)
app.include_router(classes.router)
app.include_router(teachers.router)
app.include_router(grades.router)
app.include_router(attendance.router)

@app.get("/")
async def read_root():
    return {"message": "Aroyehun School Management System API online"}