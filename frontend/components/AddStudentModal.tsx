"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { UserPlus, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { studentSchema, StudentFormValues } from "@/lib/validations/student";
import { studentService } from "@/services/studentService";
import type { StudentRecord } from "@/services/studentService";

export default function AddStudentModal({
  classes,
  onCreated,
}: {
  classes: { class_id: number; class_name: string }[];
  onCreated: (student: StudentRecord) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<StudentFormValues>({
    resolver: zodResolver(studentSchema),
  });

  const onSubmit = async (data: StudentFormValues) => {
    try {
      const newStudent = await studentService.create(data);
      onCreated(newStudent);
      toast.success("Student added successfully!");
      reset();
      setIsOpen(false);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  if (!isOpen)
    return (
      <button
        onClick={() => setIsOpen(true)}
        type="button"
        className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        <UserPlus size={17} /> Add student
      </button>
    );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#142d28]/60 p-4 backdrop-blur-sm">
      <div role="dialog" aria-modal="true" aria-labelledby="add-student-title" className="my-auto w-full max-w-xl overflow-hidden rounded-lg border border-border bg-card shadow-2xl">
        <div className="flex items-center justify-between border-b border-border px-5 py-4 sm:px-6">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">Student directory</p>
            <h2 id="add-student-title" className="mt-1 text-lg font-semibold text-foreground">Register a student</h2>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            type="button"
            aria-label="Close registration form"
            className="flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X size={19} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-5 p-5 sm:p-6"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="first_name" className="mb-1.5 block text-sm font-medium text-foreground">
                First Name
              </label>
              <input id="first_name"
                {...register("first_name")}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none transition focus-visible:ring-2 focus-visible:ring-ring"
              />
              {errors.first_name && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.first_name.message}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="last_name" className="mb-1.5 block text-sm font-medium text-foreground">
                Last Name
              </label>
              <input id="last_name"
                {...register("last_name")}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none transition focus-visible:ring-2 focus-visible:ring-ring"
              />
              {errors.last_name && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.last_name.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="parent_name" className="mb-1.5 block text-sm font-medium text-foreground">Parent/guardian</label>
              <input id="parent_name" {...register("parent_name")} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring" />
            </div>
            <div>
              <label htmlFor="parent_phone" className="mb-1.5 block text-sm font-medium text-foreground">Guardian contact</label>
              <input id="parent_phone" type="tel" {...register("parent_phone")} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring" />
            </div>
          </div>

          <div>
            <label htmlFor="address" className="mb-1.5 block text-sm font-medium text-foreground">Address</label>
            <textarea id="address" rows={2} {...register("address")} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring" />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="date_of_birth" className="mb-1.5 block text-sm font-medium text-foreground">
                Date of Birth
              </label>
              <input id="date_of_birth"
                type="date"
                {...register("date_of_birth")}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none transition focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
            <div>
              <label htmlFor="gender" className="mb-1.5 block text-sm font-medium text-foreground">Gender</label>
              <select id="gender"
                {...register("gender")}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none transition focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="M">Male</option>
                <option value="F">Female</option>
                <option value="O">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="class_id" className="mb-1.5 block text-sm font-medium text-foreground">
              Class Assignment
            </label>
            <select id="class_id"
              {...register("class_id", { valueAsNumber: true })}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none transition focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="">Select a Class</option>
              {classes.map((c) => (
                <option key={c.class_id} value={c.class_id}>
                  {c.class_name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col-reverse gap-2 border-t border-border pt-4 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="h-10 rounded-md border border-border px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted sm:min-w-28"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex h-10 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50 sm:min-w-36"
            >
              {isSubmitting ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</>
              ) : (
                  "Save student"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
