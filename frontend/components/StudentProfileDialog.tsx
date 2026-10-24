"use client"

import { useState } from "react"
import { LoaderCircle, X } from "lucide-react"
import { toast } from "sonner"
import type { ClassOption } from "@/services/classService"
import type { StudentRecord } from "@/services/studentService"
import { studentService } from "@/services/studentService"

interface StudentProfileDialogProps {
  student: StudentRecord
  classes: ClassOption[]
  mode: "view" | "edit"
  onClose: () => void
  onSaved: (student: StudentRecord) => void
}

export function StudentProfileDialog({ student, classes, mode, onClose, onSaved }: StudentProfileDialogProps) {
  const [isEditing, setIsEditing] = useState(mode === "edit")
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState("")
  const [form, setForm] = useState({
    first_name: student.first_name,
    last_name: student.last_name,
    date_of_birth: student.date_of_birth.slice(0, 10),
    gender: student.gender,
    class_id: student.class_id,
    parent_name: student.parent_name ?? "",
    parent_phone: student.parent_phone ?? "",
    address: student.address ?? "",
  })

  const updateField = (field: keyof typeof form, value: string) => {
    setForm((current) => ({
      ...current,
      [field]: field === "class_id" ? Number(value) : value,
    }))
  }

  const saveStudent = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSaving(true)
    setError("")
    try {
      const updatedStudent = await studentService.update(student.student_id, form)
      onSaved(updatedStudent)
      toast.success("Student details updated")
      onClose()
    } catch (saveError) {
      const message = saveError instanceof Error ? saveError.message : "Could not save student details"
      setError(message)
      toast.error(message)
    } finally {
      setIsSaving(false)
    }
  }

  const fields = [
    ["Parent/guardian", student.parent_name || "Not provided"],
    ["Contact number", student.parent_phone || "Not provided"],
    ["Date of birth", student.date_of_birth.slice(0, 10)],
    ["Address", student.address || "Not provided"],
    ["Enrollment date", student.enrolled_at.slice(0, 10)],
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/45 p-4" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section role="dialog" aria-modal="true" aria-labelledby="student-profile-title" className="my-auto w-full max-w-2xl overflow-hidden rounded-lg border border-border bg-card shadow-2xl">
        <header className="flex items-start justify-between border-b border-border px-5 py-4 sm:px-6">
          <div>
            <p className="font-mono text-xs text-muted-foreground">STU{String(student.student_id).padStart(4, "0")} · {student.class_name}</p>
            <h2 id="student-profile-title" className="mt-1 text-xl font-semibold text-foreground">{isEditing ? "Edit student record" : student.full_name}</h2>
            {!isEditing && <p className="mt-1 text-sm text-muted-foreground">Student profile and guardian information</p>}
          </div>
          <button type="button" onClick={onClose} aria-label="Close student profile" className="rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground"><X className="h-4 w-4" /></button>
        </header>

        {isEditing ? (
          <form onSubmit={saveStudent} className="space-y-5 p-5 sm:p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-1.5 text-sm font-medium">First name<input required minLength={2} value={form.first_name} onChange={(event) => updateField("first_name", event.target.value)} className="h-10 w-full rounded-md border border-input bg-background px-3 font-normal" /></label>
              <label className="space-y-1.5 text-sm font-medium">Last name<input required minLength={2} value={form.last_name} onChange={(event) => updateField("last_name", event.target.value)} className="h-10 w-full rounded-md border border-input bg-background px-3 font-normal" /></label>
              <label className="space-y-1.5 text-sm font-medium">Date of birth<input required type="date" value={form.date_of_birth} onChange={(event) => updateField("date_of_birth", event.target.value)} className="h-10 w-full rounded-md border border-input bg-background px-3 font-normal" /></label>
              <label className="space-y-1.5 text-sm font-medium">Gender<select value={form.gender} onChange={(event) => updateField("gender", event.target.value)} className="h-10 w-full rounded-md border border-input bg-background px-3 font-normal"><option value="M">Male</option><option value="F">Female</option><option value="O">Other</option></select></label>
              <label className="space-y-1.5 text-sm font-medium">Class<select required value={form.class_id} onChange={(event) => updateField("class_id", event.target.value)} className="h-10 w-full rounded-md border border-input bg-background px-3 font-normal">{classes.map((item) => <option key={item.class_id} value={item.class_id}>{item.class_name}</option>)}</select></label>
              <label className="space-y-1.5 text-sm font-medium">Parent/guardian<input value={form.parent_name} onChange={(event) => updateField("parent_name", event.target.value)} className="h-10 w-full rounded-md border border-input bg-background px-3 font-normal" /></label>
              <label className="space-y-1.5 text-sm font-medium">Guardian contact<input type="tel" value={form.parent_phone} onChange={(event) => updateField("parent_phone", event.target.value)} className="h-10 w-full rounded-md border border-input bg-background px-3 font-normal" /></label>
              <label className="space-y-1.5 text-sm font-medium sm:col-span-2">Address<textarea rows={2} value={form.address} onChange={(event) => updateField("address", event.target.value)} className="w-full rounded-md border border-input bg-background px-3 py-2 font-normal" /></label>
            </div>
            {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
            <footer className="flex justify-end gap-2 border-t border-border pt-4">
              <button type="button" onClick={() => mode === "edit" ? onClose() : setIsEditing(false)} className="h-10 rounded-md border border-border px-4 text-sm font-medium hover:bg-muted">Cancel</button>
              <button type="submit" disabled={isSaving} className="inline-flex h-10 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground disabled:opacity-60">{isSaving && <LoaderCircle className="h-4 w-4 animate-spin" />}Save changes</button>
            </footer>
          </form>
        ) : (
          <div className="p-5 sm:p-6">
            <div className="mb-5 grid grid-cols-2 gap-3 rounded-md bg-muted/60 p-4 sm:grid-cols-3">
              <div><p className="text-xs text-muted-foreground">Class</p><p className="mt-1 text-sm font-medium">{student.class_name}</p></div>
              <div><p className="text-xs text-muted-foreground">Grade level</p><p className="mt-1 text-sm font-medium">{student.grade_level}</p></div>
              <div><p className="text-xs text-muted-foreground">Status</p><p className="mt-1 text-sm font-medium capitalize">{student.status}</p></div>
            </div>
            <dl className="grid gap-x-6 gap-y-4 sm:grid-cols-2">{fields.map(([label, value]) => <div key={label}><dt className="text-xs text-muted-foreground">{label}</dt><dd className="mt-1 text-sm text-foreground">{value}</dd></div>)}</dl>
            <footer className="mt-6 flex justify-end border-t border-border pt-4"><button type="button" onClick={() => setIsEditing(true)} className="h-10 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground">Edit record</button></footer>
          </div>
        )}
      </section>
    </div>
  )
}
