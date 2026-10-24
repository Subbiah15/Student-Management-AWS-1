"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Search, MoreHorizontal, Users, Eye, Pencil, GraduationCap, ClipboardCheck, Archive, RotateCw } from "lucide-react"
import { StudentRecord, studentService } from "@/services/studentService"
import { ClassOption, classService } from "@/services/classService"
import AddStudentModal from "@/components/AddStudentModal"
import { StudentProfileDialog } from "@/components/StudentProfileDialog"
import { toast } from "sonner"


export default function StudentsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [students, setStudents] = useState<StudentRecord[]>([])
  const [classes, setClasses] = useState<ClassOption[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState("")
  const [selectedStudent, setSelectedStudent] = useState<StudentRecord | null>(null)
  const [dialogMode, setDialogMode] = useState<"view" | "edit">("view")
  const [classFilter, setClassFilter] = useState("")

  const loadDirectory = async () => {
    setIsLoading(true)
    setLoadError("")
    try {
      const [studentData, classData] = await Promise.all([
        studentService.getAll(),
        classService.getAll(),
      ])
      setStudents(studentData)
      setClasses(classData)
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "Unable to load student records.")
    } finally {
      setIsLoading(false)
    }
  }

  const filteredStudents = students.filter(
    (student: StudentRecord) =>
      student.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.student_id.toString().includes(searchQuery.toLowerCase()) ||
      student.grade_level.toString().includes(searchQuery.toLowerCase())
  ).filter((student) => !classFilter || student.class_id === Number(classFilter))

  useEffect(() => {
    void loadDirectory()
    const queryClassId = new URLSearchParams(window.location.search).get("class_id")
    if (queryClassId) setClassFilter(queryClassId)
  }, [])

  const archiveStudent = async (student: StudentRecord) => {
    if (!window.confirm(`Archive ${student.full_name}? Their grades and attendance will be kept.`)) return
    try {
      await studentService.archive(student.student_id)
      setStudents((current) => current.map((item) => item.student_id === student.student_id
        ? { ...item, is_active: false, status: "inactive" }
        : item))
      toast.success(`${student.full_name} archived`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not archive student")
    }
  }

  return (
    <DashboardLayout title="Students" subtitle="Manage student records">
      <div className="mb-5 flex flex-col gap-4 rounded-lg border border-border bg-card p-4 shadow-[0_2px_10px_rgb(27_57_46/4%)] sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search by name, ID, or grade"
            aria-label="Search students by name, ID, or grade"
            className="h-10 border-border bg-background pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <select aria-label="Filter by class" value={classFilter} onChange={(event) => setClassFilter(event.target.value)} className="h-10 rounded-md border border-input bg-background px-3 text-sm">
          <option value="">All classes</option>
          {classes.map((item) => <option key={item.class_id} value={item.class_id}>{item.class_name}</option>)}
        </select>
        <AddStudentModal classes={classes} onCreated={(student) => setStudents((current) => [...current, student])} />
      </div>

      {/* Students Table */}
      <div className="overflow-hidden rounded-lg border border-border bg-card shadow-[0_2px_10px_rgb(27_57_46/4%)]">
        <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-border bg-muted/60 hover:bg-muted/60">
              <TableHead className="whitespace-nowrap text-xs font-semibold uppercase tracking-wide text-muted-foreground">Student ID</TableHead>
              <TableHead className="whitespace-nowrap text-xs font-semibold uppercase tracking-wide text-muted-foreground">Student</TableHead>
              <TableHead className="whitespace-nowrap text-xs font-semibold uppercase tracking-wide text-muted-foreground">Class</TableHead>
              <TableHead className="whitespace-nowrap text-xs font-semibold uppercase tracking-wide text-muted-foreground">Grade</TableHead>
              {/* <TableHead className="text-muted-foreground hidden lg:table-cell">Parent</TableHead> */}
              <TableHead className="whitespace-nowrap text-xs font-semibold uppercase tracking-wide text-muted-foreground">Status</TableHead>
              <TableHead className="text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-28 text-center text-sm text-muted-foreground">Loading student records...</TableCell>
              </TableRow>
            ) : loadError ? (
              <TableRow>
                <TableCell colSpan={6} className="h-28 text-center text-sm text-destructive">
                  <div className="flex flex-col items-center gap-2"><span>{loadError}</span><Button variant="outline" size="sm" onClick={() => void loadDirectory()}><RotateCw className="mr-2 h-4 w-4" />Retry</Button></div>
                </TableCell>
              </TableRow>
            ) : filteredStudents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-48">
                  <div className="flex flex-col items-center justify-center gap-2 text-center">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
                      <Users className="h-5 w-5" />
                    </div>
                    <p className="font-medium text-foreground">No students found</p>
                    <p className="text-sm text-muted-foreground">Try another search or add a student record.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredStudents.map((student) => (
              <TableRow key={student.student_id} className="border-border transition-colors hover:bg-muted/40">
                <TableCell className="whitespace-nowrap font-mono text-xs text-muted-foreground">STU{String(student.student_id).padStart(4, "0")}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                      {student.full_name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>
                    <div>
                      <p className="whitespace-nowrap font-medium text-card-foreground">{student.full_name}</p>
                      {/* <p className="text-xs text-muted-foreground md:hidden">{student.email}</p> */}
                    </div>
                  </div>
                </TableCell>
                {/* <TableCell className="hidden md:table-cell">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Mail className="h-3 w-3" />
                      {student.email}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Phone className="h-3 w-3" />
node_modules
                      {student.phone}
                    </div>
                  </div>
                </TableCell> */}
                <TableCell className="whitespace-nowrap text-card-foreground">{student.class_name}</TableCell>
                {/* <TableCell className="hidden lg:table-cell text-muted-foreground">{student.parentName}</TableCell> */}
                <TableCell className="text-card-foreground">{student.grade_level}</TableCell>
                <TableCell>
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                      student.status === "active"
                        ? "bg-emerald-50 text-emerald-800"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${student.status === "active" ? "bg-emerald-600" : "bg-muted-foreground"}`} />
                    {student.status === "active" ? "Active" : "Inactive"}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" aria-label={`Actions for ${student.full_name}`} className="text-muted-foreground">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-popover border-border">
                      <DropdownMenuItem onSelect={() => { setSelectedStudent(student); setDialogMode("view") }}><Eye className="mr-2 h-4 w-4" />View profile</DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => { setSelectedStudent(student); setDialogMode("edit") }}><Pencil className="mr-2 h-4 w-4" />Edit details</DropdownMenuItem>
                      <DropdownMenuItem asChild><Link href={`/grades?student_id=${student.student_id}`}><GraduationCap className="mr-2 h-4 w-4" />View grades</Link></DropdownMenuItem>
                      <DropdownMenuItem asChild><Link href={`/attendance?student_id=${student.student_id}`}><ClipboardCheck className="mr-2 h-4 w-4" />View attendance</Link></DropdownMenuItem>
                      {student.status === "active" && <DropdownMenuItem className="text-destructive focus:text-destructive" onSelect={() => void archiveStudent(student)}><Archive className="mr-2 h-4 w-4" />Archive student</DropdownMenuItem>}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        </div>
      </div>

      {/* Pagination Info */}
      <div className="mt-3 flex items-center justify-between px-1 text-xs text-muted-foreground">
        <p>{isLoading ? "Loading records" : `Showing ${filteredStudents.length} of ${students.length} students`}</p>
        {!isLoading && !loadError && <p>Student directory</p>}
      </div>

      {selectedStudent && (
        <StudentProfileDialog
          student={selectedStudent}
          classes={classes}
          mode={dialogMode}
          onClose={() => setSelectedStudent(null)}
          onSaved={(updatedStudent) => {
            setStudents((current) => current.map((student) => student.student_id === updatedStudent.student_id ? updatedStudent : student))
          }}
        />
      )}
    </DashboardLayout>
  )
}
