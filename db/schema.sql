-- =============================================================================
-- School Management System — Initial schema bootstrap
-- =============================================================================

-- ---------------------------------------------------------------------------
-- TEACHERS
-- Must be created before classes (classes reference teacher_id)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS teachers (
    teacher_id   SERIAL        PRIMARY KEY,
    first_name   VARCHAR(50)   NOT NULL,
    last_name    VARCHAR(50)   NOT NULL,
    subject      VARCHAR(100)  NOT NULL,
    email        VARCHAR(150)  NOT NULL UNIQUE,
    phone        VARCHAR(20),
    hired_date   DATE          NOT NULL,
    is_active    BOOLEAN       NOT NULL DEFAULT TRUE,
    created_at   TIMESTAMP     NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- CLASSES
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS classes (
    class_id      SERIAL       PRIMARY KEY,
    class_name    VARCHAR(50)  NOT NULL UNIQUE,   -- e.g. "Grade 5A"
    grade_level   INTEGER      NOT NULL CHECK (grade_level BETWEEN 1 AND 12),
    teacher_id    INTEGER      NOT NULL REFERENCES teachers(teacher_id) ON DELETE RESTRICT,
    room_number   VARCHAR(10),
    capacity      INTEGER      NOT NULL DEFAULT 30 CHECK (capacity > 0),
    created_at    TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- STUDENTS
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS students (
    student_id    SERIAL       PRIMARY KEY,
    first_name    VARCHAR(50)  NOT NULL,
    last_name     VARCHAR(50)  NOT NULL,
    date_of_birth DATE         NOT NULL,
    gender        CHAR(1)      CHECK (gender IN ('M', 'F', 'O')),
    class_id      INTEGER      NOT NULL REFERENCES classes(class_id) ON DELETE RESTRICT,
    parent_name   VARCHAR(100),
    parent_phone  VARCHAR(20),
    address       TEXT,
    enrolled_at   DATE         NOT NULL DEFAULT CURRENT_DATE,
    is_active     BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- GRADES
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS grades (
    grade_id      SERIAL          PRIMARY KEY,
    student_id    INTEGER         NOT NULL REFERENCES students(student_id) ON DELETE CASCADE,
    subject       VARCHAR(100)    NOT NULL,
    score         NUMERIC(5, 2)   NOT NULL CHECK (score BETWEEN 0 AND 100),
    grade_letter  CHAR(2)         GENERATED ALWAYS AS (
                      CASE
                          WHEN score >= 90 THEN 'A'
                          WHEN score >= 80 THEN 'B'
                          WHEN score >= 70 THEN 'C'
                          WHEN score >= 60 THEN 'D'
                          WHEN score >= 50 THEN 'E'
                          ELSE 'F'
                      END
                  ) STORED,
    term          VARCHAR(20)     NOT NULL,  -- e.g. 'Term 1 2024'
    exam_type     VARCHAR(30)     NOT NULL DEFAULT 'End of Term',
    recorded_at   DATE            NOT NULL DEFAULT CURRENT_DATE,
    created_at    TIMESTAMP       NOT NULL DEFAULT NOW(),

    -- A student should only have one record per subject per term per exam type
    UNIQUE (student_id, subject, term, exam_type)
);

-- ---------------------------------------------------------------------------
-- SCHOOL FEES
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS school_fees (
    fee_id        SERIAL          PRIMARY KEY,
    student_id    INTEGER         NOT NULL REFERENCES students(student_id) ON DELETE CASCADE,
    term          VARCHAR(20)     NOT NULL,
    amount        NUMERIC(10, 2)  NOT NULL CHECK (amount > 0),
    paid_amount   NUMERIC(10, 2)  NOT NULL DEFAULT 0 CHECK (paid_amount >= 0),
    balance       NUMERIC(10, 2)  GENERATED ALWAYS AS (amount - paid_amount) STORED,
    due_date      DATE            NOT NULL,
    paid_date     DATE,
    status        VARCHAR(20)     NOT NULL DEFAULT 'unpaid'
                                  CHECK (status IN ('unpaid', 'partial', 'paid')),
    payment_method VARCHAR(30),   -- e.g. 'bank transfer', 'cash', 'online'
    notes         TEXT           DEFAULT NULL,
    created_at    TIMESTAMP       NOT NULL DEFAULT NOW(),

    -- One fee record per student per term
    UNIQUE (student_id, term)
);

CREATE TABLE IF NOT EXISTS student_attendance (
    attendance_id   SERIAL       PRIMARY KEY,
    student_id      INTEGER      NOT NULL REFERENCES students(student_id) ON DELETE CASCADE,
    attendance_date DATE         NOT NULL,
    status          VARCHAR(12)  NOT NULL CHECK (status IN ('present', 'absent', 'late', 'excused')),
    updated_at      TIMESTAMP    NOT NULL DEFAULT NOW(),
    UNIQUE (student_id, attendance_date)
);

-- ---------------------------------------------------------------------------
-- INDEXES — speed up the most common queries
-- ---------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_students_class_id      ON students(class_id);
CREATE INDEX IF NOT EXISTS idx_grades_student_id      ON grades(student_id);
CREATE INDEX IF NOT EXISTS idx_grades_term            ON grades(term);
CREATE INDEX IF NOT EXISTS idx_school_fees_student_id ON school_fees(student_id);
CREATE INDEX IF NOT EXISTS idx_school_fees_status     ON school_fees(status);
CREATE INDEX IF NOT EXISTS idx_classes_teacher_id     ON classes(teacher_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date         ON student_attendance(attendance_date);
CREATE INDEX IF NOT EXISTS idx_attendance_student_id   ON student_attendance(student_id);

-- ---------------------------------------------------------------------------
-- COMMENTS — self-documenting schema
-- ---------------------------------------------------------------------------
COMMENT ON TABLE teachers    IS 'Staff who are assigned to teach one or more classes';
COMMENT ON TABLE classes     IS 'Class groups e.g. Grade 5A, each managed by one teacher';
COMMENT ON TABLE students    IS 'Enrolled students, each belonging to one class';
COMMENT ON TABLE grades      IS 'Academic scores per student per subject per term';
COMMENT ON TABLE school_fees IS 'Fee billing and payment tracking per student per term';
