"use client"

import { useEffect, useMemo, useState } from "react"
import { Download, LoaderCircle, Plus, Search, X } from "lucide-react"
import { toast } from "sonner"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { GradeRecord, gradeService } from "@/services/gradeService"
import { StudentRecord, studentService } from "@/services/studentService"

const gradeLetter = (score: number) => score >= 90 ? "A" : score >= 80 ? "B" : score >= 70 ? "C" : score >= 60 ? "D" : score >= 50 ? "E" : "F"

function downloadCsv(grades: GradeRecord[]) {
  const columns = ["Student ID", "Student", "Class", "Subject", "Score", "Letter", "Term", "Assessment"]
  const rows = grades.map((grade) => [grade.student_id, grade.student_name, grade.class_name, grade.subject, grade.score, grade.grade_letter, grade.term, grade.exam_type])
  const escapeCsv = (value: string | number) => `"${String(value).replaceAll('"', '""')}"`
  const csv = [columns, ...rows].map((row) => row.map(escapeCsv).join(",")).join("\r\n")
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }))
  const link = document.createElement("a")
  link.href = url
  link.download = "student-grades.csv"
  link.click()
  URL.revokeObjectURL(url)
}

export default function GradesPage() {
  const [grades, setGrades] = useState<GradeRecord[]>([])
  const [students, setStudents] = useState<StudentRecord[]>([])
  const [search, setSearch] = useState("")
  const [studentId, setStudentId] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const [error, setError] = useState("")
  const [form, setForm] = useState({ student_id: "", subject: "", score: "", term: "Term 1 2026", exam_type: "End of Term" })

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)
    setError("")
    gradeService.getAll(studentId ? Number(studentId) : undefined)
      .then((data) => { if (!cancelled) setGrades(data) })
      .catch((loadError) => { if (!cancelled) setError(loadError instanceof Error ? loadError.message : "Could not load grades") })
      .finally(() => { if (!cancelled) setIsLoading(false) })
    return () => { cancelled = true }
  }, [studentId, refreshKey])

  useEffect(() => {
    studentService.getAll()
      .then((data) => setStudents(data.filter((student) => student.status === "active")))
      .catch(() => setError("Could not load the student list"))
    const queryStudentId = new URLSearchParams(window.location.search).get("student_id")
    if (queryStudentId) {
      setStudentId(queryStudentId)
      setForm((current) => ({ ...current, student_id: queryStudentId }))
    }
  }, [])

  const filteredGrades = useMemo(
    () => grades.filter((grade) => `${grade.student_name} ${grade.class_name} ${grade.subject} ${grade.term}`.toLowerCase().includes(search.toLowerCase())),
    [grades, search]
  )
  const average = grades.length ? grades.reduce((sum, grade) => sum + Number(grade.score), 0) / grades.length : 0
  const highPerformers = new Set(grades.filter((grade) => Number(grade.score) >= 90).map((grade) => grade.student_id)).size
  const subjects = new Set(grades.map((grade) => grade.subject)).size

  const saveGrade = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSaving(true)
    try {
      await gradeService.create({
        student_id: Number(form.student_id),
        subject: form.subject.trim(),
        score: Number(form.score),
        term: form.term.trim(),
        exam_type: form.exam_type.trim(),
      })
      toast.success("Grade recorded")
      setIsOpen(false)
      setForm((current) => ({ ...current, subject: "", score: "" }))
      setRefreshKey((current) => current + 1)
    } catch (saveError) {
      toast.error(saveError instanceof Error ? saveError.message : "Could not record grade")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <DashboardLayout title="Academic progress" subtitle="Review and record student assessment results">
      <div className="space-y-5">
        <section className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-md border border-border bg-card p-4"><p className="text-xs text-muted-foreground">Assessment average</p><p className="mt-1 text-2xl font-semibold">{grades.length ? `${average.toFixed(1)}%` : "—"}</p><p className="mt-1 text-xs text-muted-foreground">Across {grades.length} recorded marks</p></div>
          <div className="rounded-md border border-border bg-card p-4"><p className="text-xs text-muted-foreground">Students with an A</p><p className="mt-1 text-2xl font-semibold">{highPerformers}</p><p className="mt-1 text-xs text-muted-foreground">At least one score of 90% or higher</p></div>
          <div className="rounded-md border border-border bg-card p-4"><p className="text-xs text-muted-foreground">Subjects recorded</p><p className="mt-1 text-2xl font-semibold">{subjects}</p><p className="mt-1 text-xs text-muted-foreground">From saved assessments</p></div>
        </section>

        <section className="flex flex-col gap-3 rounded-md border border-border bg-card p-4 sm:flex-row sm:items-center">
          <div className="relative flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input aria-label="Search grades" placeholder="Search student, class, subject, or term" value={search} onChange={(event) => setSearch(event.target.value)} className="pl-9" /></div>
          <select aria-label="Filter grades by student" value={studentId} onChange={(event) => setStudentId(event.target.value)} className="h-10 rounded-md border border-input bg-background px-3 text-sm"><option value="">All students</option>{students.map((student) => <option key={student.student_id} value={student.student_id}>{student.full_name}</option>)}</select>
          <Button variant="outline" onClick={() => downloadCsv(filteredGrades)} disabled={!filteredGrades.length}><Download className="mr-2 h-4 w-4" />Export CSV</Button>
          <Button onClick={() => { setForm((current) => ({ ...current, student_id: studentId || current.student_id || String(students[0]?.student_id ?? "") })); setIsOpen(true) }} disabled={!students.length}><Plus className="mr-2 h-4 w-4" />Enter grade</Button>
        </section>

        <section className="overflow-hidden rounded-md border border-border bg-card">
          {error ? <div role="alert" className="flex flex-col items-center gap-3 p-10 text-sm text-destructive"><p>{error}</p><Button variant="outline" onClick={() => setRefreshKey((current) => current + 1)}>Retry</Button></div> : isLoading ? <div className="flex items-center justify-center gap-2 p-10 text-sm text-muted-foreground"><LoaderCircle className="h-4 w-4 animate-spin" />Loading assessments…</div> : filteredGrades.length === 0 ? <p className="p-12 text-center text-sm text-muted-foreground">No assessments match this filter yet.</p> : <div className="overflow-x-auto"><table className="w-full min-w-[720px] text-left text-sm"><thead className="bg-muted/60 text-xs uppercase text-muted-foreground"><tr><th className="px-4 py-3 font-medium">Student</th><th className="px-4 py-3 font-medium">Class</th><th className="px-4 py-3 font-medium">Subject</th><th className="px-4 py-3 font-medium">Assessment</th><th className="px-4 py-3 font-medium">Term</th><th className="px-4 py-3 text-right font-medium">Score</th></tr></thead><tbody>{filteredGrades.map((grade) => <tr key={grade.grade_id} className="border-t border-border"><td className="px-4 py-3 font-medium">{grade.student_name}<span className="ml-2 font-mono text-xs text-muted-foreground">STU{String(grade.student_id).padStart(4, "0")}</span></td><td className="px-4 py-3 text-muted-foreground">{grade.class_name}</td><td className="px-4 py-3">{grade.subject}</td><td className="px-4 py-3 text-muted-foreground">{grade.exam_type}</td><td className="px-4 py-3 text-muted-foreground">{grade.term}</td><td className="px-4 py-3 text-right font-semibold">{Number(grade.score).toFixed(1)}% <span className="ml-1 rounded bg-muted px-1.5 py-0.5 text-xs">{grade.grade_letter || gradeLetter(Number(grade.score))}</span></td></tr>)}</tbody></table></div>}
        </section>
      </div>

      {isOpen && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4" onMouseDown={(event) => event.target === event.currentTarget && setIsOpen(false)}><section role="dialog" aria-modal="true" aria-labelledby="grade-dialog-title" className="w-full max-w-lg rounded-lg border border-border bg-card shadow-2xl"><header className="flex items-start justify-between border-b border-border p-5"><div><p className="text-xs font-semibold uppercase text-primary">Academic record</p><h2 id="grade-dialog-title" className="mt-1 text-lg font-semibold">Enter assessment grade</h2></div><button type="button" aria-label="Close grade form" onClick={() => setIsOpen(false)} className="rounded p-2 text-muted-foreground hover:bg-muted"><X className="h-4 w-4" /></button></header><form onSubmit={saveGrade} className="grid gap-4 p-5"><label className="space-y-1.5 text-sm font-medium">Student<select required value={form.student_id} onChange={(event) => setForm({ ...form, student_id: event.target.value })} className="h-10 w-full rounded-md border border-input bg-background px-3">{students.map((student) => <option key={student.student_id} value={student.student_id}>{student.full_name} · {student.class_name}</option>)}</select></label><label className="space-y-1.5 text-sm font-medium">Subject<input required maxLength={100} value={form.subject} onChange={(event) => setForm({ ...form, subject: event.target.value })} className="h-10 w-full rounded-md border border-input bg-background px-3" /></label><div className="grid gap-4 sm:grid-cols-2"><label className="space-y-1.5 text-sm font-medium">Score (0–100)<input required type="number" min="0" max="100" step="0.01" value={form.score} onChange={(event) => setForm({ ...form, score: event.target.value })} className="h-10 w-full rounded-md border border-input bg-background px-3" /></label><label className="space-y-1.5 text-sm font-medium">Term<input required maxLength={20} value={form.term} onChange={(event) => setForm({ ...form, term: event.target.value })} className="h-10 w-full rounded-md border border-input bg-background px-3" /></label></div><label className="space-y-1.5 text-sm font-medium">Assessment type<input required maxLength={30} value={form.exam_type} onChange={(event) => setForm({ ...form, exam_type: event.target.value })} className="h-10 w-full rounded-md border border-input bg-background px-3" /></label><footer className="mt-1 flex justify-end gap-2 border-t border-border pt-4"><Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button><Button type="submit" disabled={isSaving}>{isSaving && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}Save grade</Button></footer></form></section></div>}
    </DashboardLayout>
  )
}
