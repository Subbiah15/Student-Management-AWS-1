import * as z from "zod";

export const studentSchema = z.object({
  first_name: z.string().trim().min(2, "Enter at least 2 characters"),
  last_name: z.string().trim().min(2, "Enter at least 2 characters"),
  date_of_birth: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date of birth",
  }),
  gender: z.enum(["M", "F", "O"]),
  class_id: z.coerce.number().min(1, "Please select a class"),
  parent_name: z.string().optional(),
  parent_phone: z.string().optional(),
  address: z.string().optional(),
});

export type StudentFormValues = z.infer<typeof studentSchema>;