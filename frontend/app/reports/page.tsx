"use client"

import { useState } from "react"
import { Download, FileSpreadsheet, LoaderCircle } from "lucide-react"
import { toast } from "sonner"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Button } from "@/components/ui/button"
import { attendanceService } from "@/services/attendanceService"
import { gradeService } from "@/services/gradeService"
import { studentService } from "@/services/studentService"

function downloadCsv(filename: string, rows: (string | number | null)[][]) {
  const csv = rows.map((row) => row.map((value) => `"${String(value ?? "").replaceAll('"', '""')}"`).join(",")).join("\r\n")
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }))
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

function localDate() {
  const date = new Date()
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
}

export default function ReportsPage() {
  const [date, setDate] = useState(localDate)
  const [loadingReport, setLoadingReport] = useState("")

  const withLoading = async (name: string, action: () => Promise<void>) => {
    setLoadingReport(name)
    try {
      await action()
      toast.success(`${name} downloaded`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : `Could not generate ${name.toLowerCase()}`)
    } finally {
      setLoadingReport("")
    }
  }

  const exportEnrollment = () => withLoading("Enrollment roster", async () => {
    const students = await studentService.getAll()
    downloadCsv("student-enrollment.csv", [["Student ID", "First name", "Last name", "Date of birth", "Gender", "Class", "Grade level", "Parent/guardian", "Contact", "Status"], ...students.map((student) => [student.student_id, student.first_name, student.last_name, student.date_of_birth, student.gender, student.class_name, student.grade_level, student.parent_name, student.parent_phone, student.status])])
  })

  const exportGrades = () => withLoading("Academic results", async () => {
    const grades = await gradeService.getAll()
    downloadCsv("student-academic-results.csv", [["Student ID", "Student", "Class", "Subject", "Score", "Grade", "Term", "Assessment", "Recorded"], ...grades.map((grade) => [grade.student_id, grade.student_name, grade.class_name, grade.subject, grade.score, grade.grade_letter, grade.term, grade.exam_type, grade.recorded_at])])
  })

  const exportAttendance = () => withLoading("Attendance register", async () => {
    const records = await attendanceService.getByDate(date)
    downloadCsv(`student-attendance-${date}.csv`, [["Date", "Student ID", "Student", "Class", "Status"], ...records.map((record) => [record.attendance_date, record.student_id, record.full_name, record.class_name, record.status])])
  })

  const reports = [
    { title: "Enrollment roster", detail: "Student identity, class assignment, guardian contact, and active status.", action: exportEnrollment },
    { title: "Academic results", detail: "Saved subject scores, grades, terms, and assessment types.", action: exportGrades },
    { title: "Attendance register", detail: "Daily attendance status for active students on the selected date.", action: exportAttendance },
  ]

  return (
    <DashboardLayout title="Student reports" subtitle="Export enrollment, attendance, and academic records">
      <div className="space-y-5">
        <section className="flex flex-col gap-3 rounded-md border border-border bg-card p-4 sm:flex-row sm:items-end sm:justify-between">
          <div><h2 className="text-sm font-semibold">Attendance report date</h2><p className="mt-1 text-xs text-muted-foreground">Choose the day to include in the register export.</p></div>
          <label className="space-y-1.5 text-sm font-medium">Date<input type="date" value={date} onChange={(event) => setDate(event.target.value)} className="block h-10 rounded-md border border-input bg-background px-3" /></label>
        </section>
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {reports.map((report) => <article key={report.title} className="flex min-h-52 flex-col rounded-md border border-border bg-card p-5"><div className="flex items-start gap-3"><div className="rounded-md bg-primary/10 p-2.5 text-primary"><FileSpreadsheet className="h-5 w-5" /></div><div><h2 className="font-semibold">{report.title}</h2><p className="mt-1 text-sm leading-6 text-muted-foreground">{report.detail}</p></div></div><Button className="mt-auto self-start" onClick={() => void report.action()} disabled={!!loadingReport}>{loadingReport === report.title ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}Download CSV</Button></article>)}
        </section>
      </div>
    </DashboardLayout>
  )
}
