# Database Design

## Current Schema

Current tables:

- `teachers`
- `classes`
- `students`
- `grades`
- `school_fees`

`db/schema.sql` is an initial bootstrap, not a versioned migration system. It creates missing tables and indexes without dropping existing tables or records. It does not alter already-existing table definitions; use explicit, reviewed migrations for schema changes.

`db/seed.sql` inserts synthetic demonstration records. Treat these records as sample data, not institution records or live operational statistics.

## Current ERD

```mermaid
erDiagram
    TEACHERS ||--o{ CLASSES : teaches
    CLASSES ||--o{ STUDENTS : contains
    STUDENTS ||--o{ GRADES : earns
    STUDENTS ||--o{ SCHOOL_FEES : billed

    TEACHERS {
        int teacher_id PK
        varchar first_name
        varchar last_name
        varchar subject
        varchar email UK
        varchar phone
        date hired_date
        boolean is_active
        timestamp created_at
    }

    CLASSES {
        int class_id PK
        varchar class_name UK
        int grade_level
        int teacher_id FK
        varchar room_number
        int capacity
        timestamp created_at
    }

    STUDENTS {
        int student_id PK
        varchar first_name
        varchar last_name
        date date_of_birth
        char gender
        int class_id FK
        varchar parent_name
        varchar parent_phone
        text address
        date enrolled_at
        boolean is_active
        timestamp created_at
    }

    GRADES {
        int grade_id PK
        int student_id FK
        varchar subject
        numeric score
        char grade_letter
        varchar term
        varchar exam_type
        date recorded_at
        timestamp created_at
    }

    SCHOOL_FEES {
        int fee_id PK
        int student_id FK
        varchar term
        numeric amount
        numeric paid_amount
        numeric balance
        date due_date
        date paid_date
        varchar status
        varchar payment_method
        text notes
        timestamp created_at
    }
```

## Target Schema Additions

Security:

- `users`
- `roles`
- `user_roles`
- `refresh_tokens`

Audit:

- `audit_logs`

Academic:

- `subjects`
- `assessments`
- `assessment_scores`
- `report_cards`

Attendance:

- `attendance_sessions`
- `attendance_records`

Finance:

- `invoices`
- `payments`

Shared fields:

- `created_at`
- `updated_at`
- `deleted_at`
- `created_by`
- `updated_by`

## Target ERD

```mermaid
erDiagram
    USERS ||--o{ USER_ROLES : has
    ROLES ||--o{ USER_ROLES : assigned
    USERS ||--o{ REFRESH_TOKENS : owns
    USERS ||--o{ AUDIT_LOGS : performs

    TEACHERS ||--o| USERS : account
    TEACHERS ||--o{ CLASSES : teaches
    CLASSES ||--o{ STUDENTS : enrolls
    CLASSES ||--o{ ATTENDANCE_SESSIONS : tracks
    ATTENDANCE_SESSIONS ||--o{ ATTENDANCE_RECORDS : contains
    STUDENTS ||--o{ ATTENDANCE_RECORDS : marked

    SUBJECTS ||--o{ ASSESSMENTS : contains
    CLASSES ||--o{ ASSESSMENTS : assigned
    ASSESSMENTS ||--o{ ASSESSMENT_SCORES : scores
    STUDENTS ||--o{ ASSESSMENT_SCORES : receives
    STUDENTS ||--o{ REPORT_CARDS : receives

    STUDENTS ||--o{ INVOICES : billed
    INVOICES ||--o{ PAYMENTS : paid_by
```

## Migration Strategy

Adopt Alembic before adding new schema work.

Initial migration order:

1. Baseline existing schema.
2. Add auth tables.
3. Add audit logs.
4. Add shared audit fields and soft-delete fields.
5. Normalize academics.
6. Add attendance.
7. Split finance into invoices and payments.
8. Add reporting support tables if persisted report snapshots are needed.

## Indexing Strategy

Keep existing foreign-key indexes and add indexes based on access patterns:

- Student search: lower-cased name fields or trigram index if full-text search is required.
- Enrollment filters: `students(class_id, is_active, enrolled_at)`.
- Attendance analytics: `attendance_sessions(class_id, attendance_date)` and `attendance_records(student_id, status)`.
- Grade analytics: `assessment_scores(student_id, assessment_id)` and `assessments(term, subject_id)`.
- Finance summaries: `invoices(student_id, status, due_date)` and `payments(invoice_id, paid_at)`.
- Audit logs: `audit_logs(actor_user_id, created_at)` and `audit_logs(resource_type, resource_id)`.

## Transaction Rules

Use transactions for:

- Creating users with roles.
- Creating or updating students with class capacity checks.
- Recording payments and updating invoice state.
- Recording grades and report-card aggregates.
- Mutating business actions that also write audit logs.
