"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { BookOpen, LoaderCircle, MapPin, Plus, Search, Users, X } from "lucide-react"
import { toast } from "sonner"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ClassOption, classService, TeacherOption } from "@/services/classService"

export default function ClassesPage() {
  const [classes, setClasses] = useState<ClassOption[]>([])
  const [teachers, setTeachers] = useState<TeacherOption[]>([])
  const [search, setSearch] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [form, setForm] = useState({ class_name: "", grade_level: "", teacher_id: "", room_number: "", capacity: "30" })

  const loadClasses = async () => {
    setIsLoading(true)
    setError("")
    try {
      setClasses(await classService.getAll())
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Could not load classes")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadClasses()
    classService.getTeachers().then(setTeachers).catch(() => setError("Could not load class teachers"))
  }, [])

  const filteredClasses = useMemo(() => classes.filter((item) => `${item.class_name} ${item.teacher_name} ${item.grade_level}`.toLowerCase().includes(search.toLowerCase())), [classes, search])
  const totalStudents = classes.reduce((sum, item) => sum + item.student_count, 0)
  const totalCapacity = classes.reduce((sum, item) => sum + item.capacity, 0)

  const createClass = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSaving(true)
    try {
      await classService.create({
        class_name: form.class_name.trim(),
        grade_level: Number(form.grade_level),
        teacher_id: Number(form.teacher_id),
        room_number: form.room_number.trim(),
        capacity: Number(form.capacity),
      })
      toast.success("Class created")
      setIsOpen(false)
      setForm({ class_name: "", grade_level: "", teacher_id: "", room_number: "", capacity: "30" })
      await loadClasses()
    } catch (saveError) {
      toast.error(saveError instanceof Error ? saveError.message : "Could not create class")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <DashboardLayout title="Classes" subtitle="Class groups and student enrollment">
      <div className="space-y-5">
        <section className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-md border border-border bg-card p-4"><p className="text-xs text-muted-foreground">Classes</p><p className="mt-1 text-2xl font-semibold">{classes.length}</p></div>
          <div className="rounded-md border border-border bg-card p-4"><p className="text-xs text-muted-foreground">Active students</p><p className="mt-1 text-2xl font-semibold">{totalStudents}</p></div>
          <div className="rounded-md border border-border bg-card p-4"><p className="text-xs text-muted-foreground">Available seats</p><p className="mt-1 text-2xl font-semibold">{Math.max(0, totalCapacity - totalStudents)}</p></div>
        </section>

        <section className="flex flex-col gap-3 rounded-md border border-border bg-card p-4 sm:flex-row sm:items-center">
          <div className="relative flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input aria-label="Search classes" placeholder="Search class, grade, or teacher" value={search} onChange={(event) => setSearch(event.target.value)} className="pl-9" /></div>
          <Button onClick={() => setIsOpen(true)} disabled={!teachers.length}><Plus className="mr-2 h-4 w-4" />Add class</Button>
        </section>

        {error ? <section role="alert" className="flex flex-col items-center gap-3 rounded-md border border-border bg-card p-10 text-center text-sm text-destructive"><p>{error}</p><Button variant="outline" onClick={() => void loadClasses()}>Retry</Button></section> : isLoading ? <section className="flex items-center justify-center gap-2 rounded-md border border-border bg-card p-12 text-sm text-muted-foreground"><LoaderCircle className="h-4 w-4 animate-spin" />Loading classes…</section> : filteredClasses.length === 0 ? <section className="rounded-md border border-border bg-card p-12 text-center text-sm text-muted-foreground">No classes match this search.</section> : <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{filteredClasses.map((item) => {
          const occupancy = item.capacity ? Math.min(100, Math.round(item.student_count / item.capacity * 100)) : 0
          return <article key={item.class_id} className="rounded-md border border-border bg-card p-5">
            <div className="flex items-start justify-between gap-3"><div><p className="text-xs font-medium uppercase text-muted-foreground">Grade {item.grade_level}</p><h2 className="mt-1 text-lg font-semibold">{item.class_name}</h2></div><span className="rounded bg-secondary px-2 py-1 text-xs font-medium">{item.student_count}/{item.capacity}</span></div>
            <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${occupancy}%` }} /></div>
            <p className="mt-2 text-xs text-muted-foreground">{occupancy}% capacity used</p>
            <dl className="mt-5 space-y-3 text-sm"><div className="flex items-center gap-2 text-muted-foreground"><Users className="h-4 w-4" /><span>{item.teacher_name}</span></div><div className="flex items-center gap-2 text-muted-foreground"><MapPin className="h-4 w-4" /><span>{item.room_number || "Room not assigned"}</span></div><div className="flex items-center gap-2 text-muted-foreground"><BookOpen className="h-4 w-4" /><span>{item.student_count} enrolled students</span></div></dl>
            <div className="mt-5 flex gap-2 border-t border-border pt-4"><Button asChild variant="outline" className="flex-1"><Link href={`/students?class_id=${item.class_id}`}>View students</Link></Button><Button asChild className="flex-1"><Link href={`/attendance?class_id=${item.class_id}`}>Attendance</Link></Button></div>
          </article>
        })}</section>}
      </div>

      {isOpen && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4" onMouseDown={(event) => event.target === event.currentTarget && setIsOpen(false)}><section role="dialog" aria-modal="true" aria-labelledby="class-dialog-title" className="w-full max-w-lg rounded-lg border border-border bg-card shadow-2xl"><header className="flex items-start justify-between border-b border-border p-5"><div><p className="text-xs font-semibold uppercase text-primary">Class setup</p><h2 id="class-dialog-title" className="mt-1 text-lg font-semibold">Add a class</h2></div><button type="button" aria-label="Close class form" onClick={() => setIsOpen(false)} className="rounded p-2 text-muted-foreground hover:bg-muted"><X className="h-4 w-4" /></button></header><form onSubmit={createClass} className="grid gap-4 p-5"><label className="space-y-1.5 text-sm font-medium">Class name<input required minLength={2} maxLength={50} value={form.class_name} onChange={(event) => setForm({ ...form, class_name: event.target.value })} placeholder="Grade 7A" className="h-10 w-full rounded-md border border-input bg-background px-3" /></label><div className="grid gap-4 sm:grid-cols-2"><label className="space-y-1.5 text-sm font-medium">Grade level<input required type="number" min="1" max="12" value={form.grade_level} onChange={(event) => setForm({ ...form, grade_level: event.target.value })} className="h-10 w-full rounded-md border border-input bg-background px-3" /></label><label className="space-y-1.5 text-sm font-medium">Capacity<input required type="number" min="1" value={form.capacity} onChange={(event) => setForm({ ...form, capacity: event.target.value })} className="h-10 w-full rounded-md border border-input bg-background px-3" /></label></div><label className="space-y-1.5 text-sm font-medium">Class teacher<select required value={form.teacher_id} onChange={(event) => setForm({ ...form, teacher_id: event.target.value })} className="h-10 w-full rounded-md border border-input bg-background px-3"><option value="">Select a teacher</option>{teachers.map((teacher) => <option key={teacher.teacher_id} value={teacher.teacher_id}>{teacher.full_name} · {teacher.subject}</option>)}</select></label><label className="space-y-1.5 text-sm font-medium">Room<input maxLength={10} value={form.room_number} onChange={(event) => setForm({ ...form, room_number: event.target.value })} className="h-10 w-full rounded-md border border-input bg-background px-3" /></label><footer className="mt-1 flex justify-end gap-2 border-t border-border pt-4"><Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button><Button type="submit" disabled={isSaving}>{isSaving && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}Save class</Button></footer></form></section></div>}
    </DashboardLayout>
  )
}
