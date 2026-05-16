import { z } from "zod"

export const LoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
})

export const SignupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

export const TransactionSchema = z.object({
  amount: z.coerce.number().positive("Amount must be a positive number"),
  description: z.string().min(1, "Description is required").max(200, "Description is too long"),
  type: z.enum(["INCOME", "EXPENSE"]),
  categoryId: z.string().nullable().optional(),
  date: z.coerce.date(),
})

export const CategorySchema = z.object({
  name: z.string().min(1, "Name is required").max(50, "Name is too long"),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Invalid color"),
  icon: z.string().min(1, "Icon is required"),
  budget: z.coerce.number().positive("Budget must be positive").nullable().optional(),
})

export const UpdateProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
})

export const ChangePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(6, "New password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
