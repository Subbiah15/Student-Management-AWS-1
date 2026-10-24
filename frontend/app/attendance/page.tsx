"use client"

import { useEffect, useMemo, useState } from "react"
import { CalendarCheck, Check, ClipboardList, LoaderCircle, Save } from "lucide-react"
import { toast } from "sonner"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Button } from "@/components/ui/button"
import { ClassOption, classService } from "@/services/classService"
import { AttendanceRecord, attendanceService } from "@/services/attendanceService"

const today = () => {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`
}

const statusLabels: Record<AttendanceRecord["status"], string> = {
  present: "Present",
  absent: "Absent",
  late: "Late",
  excused: "Excused",
  unmarked: "Unmarked",
}

export default function AttendancePage() {
  const [date, setDate] = useState(today)
  const [classId, setClassId] = useState("")
  const [classes, setClasses] = useState<ClassOption[]>([])
  const [records, setRecords] = useState<AttendanceRecord[]>([])
  const [studentFilter, setStudentFilter] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    classService.getAll().then(setClasses).catch(() => setError("Could not load classes."))
    const query = new URLSearchParams(window.location.search)
    const queryClassId = query.get("class_id")
    const queryStudentId = query.get("student_id")
    if (queryClassId) setClassId(queryClassId)
    if (queryStudentId) setStudentFilter(queryStudentId)
  }, [])

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)
    setError("")
    attendanceService.getByDate(date, classId ? Number(classId) : undefined)
      .then((data) => { if (!cancelled) setRecords(data) })
      .catch((loadError) => { if (!cancelled) setError(loadError instanceof Error ? loadError.message : "Could not load attendance.") })
      .finally(() => { if (!cancelled) setIsLoading(false) })
    return () => { cancelled = true }
  }, [date, classId])

  const visibleRecords = studentFilter
    ? records.filter((record) => record.student_id === Number(studentFilter))
    : records

  const counts = useMemo(() => visibleRecords.reduce((result, record) => {
    result[record.status] += 1
    return result
  }, { present: 0, absent: 0, late: 0, excused: 0, unmarked: 0 }), [visibleRecords])

  const updateStatus = (studentId: number, status: AttendanceRecord["status"]) => {
    setRecords((current) => current.map((record) => record.student_id === studentId ? { ...record, status } : record))
  }

  const save = async () => {
    setIsSaving(true)
    try {
      await attendanceService.save(date, visibleRecords.map(({ student_id, status }) => ({ student_id, status })))
      toast.success("Attendance saved")
    } catch (saveError) {
      toast.error(saveError instanceof Error ? saveError.message : "Could not save attendance")
    } finally {
      setIsSaving(false)
    }
  }

  const markAllPresent = () => {
    const visibleIds = new Set(visibleRecords.map((record) => record.student_id))
    setRecords((current) => current.map((record) => visibleIds.has(record.student_id) ? { ...record, status: "present" } : record))
  }

  return (
    <DashboardLayout title="Attendance" subtitle="Record daily attendance by class">
      <div className="space-y-5">
        <section className="flex flex-col gap-4 rounded-lg border border-border bg-card p-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="grid w-full gap-3 sm:max-w-xl sm:grid-cols-2">
            <label className="space-y-1.5 text-sm font-medium">Attendance date<input type="date" value={date} onChange={(event) => setDate(event.target.value)} className="h-10 w-full rounded-md border border-input bg-background px-3" /></label>
            <label className="space-y-1.5 text-sm font-medium">Class<select value={classId} onChange={(event) => setClassId(event.target.value)} className="h-10 w-full rounded-md border border-input bg-background px-3"><option value="">All classes</option>{classes.map((item) => <option key={item.class_id} value={item.class_id}>{item.class_name}</option>)}</select></label>
          </div>
          <div className="flex flex-wrap gap-2"><Button variant="outline" onClick={markAllPresent} disabled={!records.length || isLoading}><Check className="mr-2 h-4 w-4" />Mark all present</Button><Button onClick={() => void save()} disabled={!records.length || isLoading || isSaving}>{isSaving ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}Save attendance</Button></div>
        </section>

        <section className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {(["present", "absent", "late", "excused", "unmarked"] as const).map((status) => <div key={status} className="rounded-md border border-border bg-card p-3"><p className="text-xs text-muted-foreground">{statusLabels[status]}</p><p className="mt-1 text-xl font-semibold text-foreground">{counts[status]}</p></div>)}
        </section>

        <section className="overflow-hidden rounded-lg border border-border bg-card">
          <div className="flex items-center gap-2 border-b border-border px-4 py-3"><CalendarCheck className="h-4 w-4 text-primary" /><h2 className="text-sm font-semibold">Student register</h2><span className="ml-auto text-xs text-muted-foreground">{visibleRecords.length} students</span></div>
          {error ? <p role="alert" className="p-6 text-sm text-destructive">{error}</p> : isLoading ? <div className="flex items-center justify-center gap-2 p-10 text-sm text-muted-foreground"><LoaderCircle className="h-4 w-4 animate-spin" />Loading attendance…</div> : visibleRecords.length === 0 ? <p className="p-10 text-center text-sm text-muted-foreground">No active students match this filter.</p> : <div className="overflow-x-auto"><table className="w-full min-w-[620px] text-left text-sm"><thead className="bg-muted/60 text-xs uppercase text-muted-foreground"><tr><th className="px-4 py-3 font-medium">Student</th><th className="px-4 py-3 font-medium">Class</th><th className="px-4 py-3 font-medium">Status</th></tr></thead><tbody>{visibleRecords.map((record) => <tr key={record.student_id} className="border-t border-border"><td className="px-4 py-3 font-medium">{record.full_name}</td><td className="px-4 py-3 text-muted-foreground">{record.class_name}</td><td className="px-4 py-3"><select aria-label={`Attendance for ${record.full_name}`} value={record.status} onChange={(event) => updateStatus(record.student_id, event.target.value as AttendanceRecord["status"])} className="h-9 w-36 rounded-md border border-input bg-background px-2 text-sm">{Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></td></tr>)}</tbody></table></div>}
        </section>
        <p className="flex items-center gap-2 text-xs text-muted-foreground"><ClipboardList className="h-3.5 w-3.5" />Unmarked entries remain unchanged until you select a status and save.</p>
      </div>
    </DashboardLayout>
  )
}
