"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { ArrowRight, BookOpen, ClipboardCheck, GraduationCap, LoaderCircle, Plus, Users } from "lucide-react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Button } from "@/components/ui/button"
import { AttendanceRecord, attendanceService } from "@/services/attendanceService"
import { ClassOption, classService } from "@/services/classService"
import { GradeRecord, gradeService } from "@/services/gradeService"
import { StudentRecord, studentService } from "@/services/studentService"

const localDate = () => {
  const date = new Date()
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
}

export default function Home() {
  const [students, setStudents] = useState<StudentRecord[]>([])
  const [classes, setClasses] = useState<ClassOption[]>([])
  const [grades, setGrades] = useState<GradeRecord[]>([])
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    Promise.all([
      studentService.getAll(),
      classService.getAll(),
      gradeService.getAll(),
      attendanceService.getByDate(localDate()),
    ])
      .then(([studentData, classData, gradeData, attendanceData]) => {
        setStudents(studentData)
        setClasses(classData)
        setGrades(gradeData)
        setAttendance(attendanceData)
      })
      .catch((loadError) => setError(loadError instanceof Error ? loadError.message : "Could not load the student overview"))
      .finally(() => setIsLoading(false))
  }, [])

  const activeStudents = students.filter((student) => student.status === "active")
  const markedAttendance = attendance.filter((record) => record.status !== "unmarked")
  const attendanceRate = markedAttendance.length
    ? Math.round(markedAttendance.filter((record) => record.status === "present" || record.status === "late").length / markedAttendance.length * 100)
    : null
  const averageScore = grades.length ? grades.reduce((sum, grade) => sum + Number(grade.score), 0) / grades.length : null

  const subjectAverages = useMemo(() => {
    const totals = new Map<string, { score: number; count: number }>()
    grades.forEach((grade) => {
      const current = totals.get(grade.subject) ?? { score: 0, count: 0 }
      current.score += Number(grade.score)
      current.count += 1
      totals.set(grade.subject, current)
    })
    return [...totals.entries()]
      .map(([subject, total]) => ({ subject, average: total.score / total.count }))
      .sort((a, b) => b.average - a.average)
      .slice(0, 5)
  }, [grades])

  const recentStudents = [...activeStudents]
    .sort((a, b) => b.student_id - a.student_id)
    .slice(0, 5)

  return (
    <DashboardLayout title="Student overview" subtitle="Enrollment, attendance, and learning progress">
      <div className="space-y-5">
        <section className="flex flex-col gap-4 rounded-lg border border-[#d8e5dc] bg-[#e9f1ec] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div>
            <p className="text-xs font-semibold uppercase text-primary">Student management</p>
            <h2 className="mt-1 text-xl font-semibold text-foreground">Every student record, in one place.</h2>
            <p className="mt-1 text-sm text-muted-foreground">Track enrollment, attendance, and assessment results.</p>
          </div>
          <Button asChild className="shrink-0"><Link href="/students"><Plus className="mr-2 h-4 w-4" />Add a student</Link></Button>
        </section>

        {error && <div role="alert" className="rounded-md border border-destructive/30 bg-card p-4 text-sm text-destructive">{error}</div>}
        {isLoading ? <div className="flex items-center justify-center gap-2 rounded-md border border-border bg-card p-10 text-sm text-muted-foreground"><LoaderCircle className="h-4 w-4 animate-spin" />Loading student overview…</div> : <>
          <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <article className="rounded-md border border-border bg-card p-4"><div className="flex items-center justify-between"><p className="text-xs text-muted-foreground">Active students</p><Users className="h-4 w-4 text-primary" /></div><p className="mt-3 text-2xl font-semibold">{activeStudents.length}</p><p className="mt-1 text-xs text-muted-foreground">{students.length - activeStudents.length} archived records</p></article>
            <article className="rounded-md border border-border bg-card p-4"><div className="flex items-center justify-between"><p className="text-xs text-muted-foreground">Class groups</p><BookOpen className="h-4 w-4 text-chart-2" /></div><p className="mt-3 text-2xl font-semibold">{classes.length}</p><p className="mt-1 text-xs text-muted-foreground">{classes.reduce((sum, item) => sum + item.student_count, 0)} active enrollments</p></article>
            <article className="rounded-md border border-border bg-card p-4"><div className="flex items-center justify-between"><p className="text-xs text-muted-foreground">Today’s attendance</p><ClipboardCheck className="h-4 w-4 text-chart-3" /></div><p className="mt-3 text-2xl font-semibold">{attendanceRate === null ? "Not recorded" : `${attendanceRate}%`}</p><p className="mt-1 text-xs text-muted-foreground">{markedAttendance.length} marked records</p></article>
            <article className="rounded-md border border-border bg-card p-4"><div className="flex items-center justify-between"><p className="text-xs text-muted-foreground">Assessment average</p><GraduationCap className="h-4 w-4 text-chart-4" /></div><p className="mt-3 text-2xl font-semibold">{averageScore === null ? "—" : `${averageScore.toFixed(1)}%`}</p><p className="mt-1 text-xs text-muted-foreground">{grades.length} saved assessments</p></article>
          </section>

          <section className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
            <article className="rounded-md border border-border bg-card p-5">
              <div className="flex items-center justify-between"><div><h2 className="font-semibold">Subject performance</h2><p className="mt-1 text-xs text-muted-foreground">Average score from saved assessments</p></div><Button asChild variant="outline" size="sm"><Link href="/grades">View grades<ArrowRight className="ml-2 h-4 w-4" /></Link></Button></div>
              {subjectAverages.length ? <div className="mt-5 space-y-4">{subjectAverages.map((item) => <div key={item.subject}><div className="mb-1 flex justify-between gap-4 text-sm"><span className="truncate">{item.subject}</span><span className="font-medium">{item.average.toFixed(1)}%</span></div><div className="h-2 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${Math.max(0, Math.min(100, item.average))}%` }} /></div></div>)}</div> : <div className="mt-6 rounded-md bg-muted/50 p-6 text-center text-sm text-muted-foreground">No grades have been recorded yet.</div>}
            </article>

            <article className="rounded-md border border-border bg-card">
              <div className="flex items-center justify-between border-b border-border p-5"><div><h2 className="font-semibold">Recently enrolled</h2><p className="mt-1 text-xs text-muted-foreground">Latest student records</p></div><Button asChild variant="ghost" size="sm"><Link href="/students">All students<ArrowRight className="ml-2 h-4 w-4" /></Link></Button></div>
              {recentStudents.length ? <ul className="divide-y divide-border">{recentStudents.map((student) => <li key={student.student_id} className="flex items-center gap-3 px-5 py-3"><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">{student.first_name[0]}{student.last_name[0]}</div><div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{student.full_name}</p><p className="truncate text-xs text-muted-foreground">{student.class_name} · Grade {student.grade_level}</p></div><span className="font-mono text-[10px] text-muted-foreground">{String(student.student_id).padStart(4, "0")}</span></li>)}</ul> : <p className="p-8 text-center text-sm text-muted-foreground">No active student records.</p>}
            </article>
          </section>

          <section className="rounded-md border border-border bg-card">
            <div className="flex items-center justify-between border-b border-border p-5"><div><h2 className="font-semibold">Classes at a glance</h2><p className="mt-1 text-xs text-muted-foreground">Current enrollment and available capacity</p></div><Button asChild variant="outline" size="sm"><Link href="/classes">Manage classes<ArrowRight className="ml-2 h-4 w-4" /></Link></Button></div>
            <div className="grid gap-px bg-border sm:grid-cols-2 xl:grid-cols-3">{classes.map((item) => <Link key={item.class_id} href={`/students?class_id=${item.class_id}`} className="bg-card p-4 transition-colors hover:bg-muted/40"><div className="flex items-center justify-between gap-3"><span className="text-sm font-medium">{item.class_name}</span><span className="text-xs text-muted-foreground">{item.student_count}/{item.capacity}</span></div><p className="mt-1 text-xs text-muted-foreground">Grade {item.grade_level} · {item.teacher_name}</p></Link>)}</div>
          </section>
        </>}
      </div>
    </DashboardLayout>
  )
}
