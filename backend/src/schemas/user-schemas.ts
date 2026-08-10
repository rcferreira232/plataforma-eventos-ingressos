import { z } from "zod";

export const createUserSchema = z.object({
  name: z.string({ error: "Name is required" }).min(1, "Name cannot be empty"),
  email: z.string({ error: "Email is required" }).email("Invalid email format"),
  password: z
    .string({ error: "Password is required" })
    .min(6, "Password must be at least 6 characters long"),
  role: z.enum(["ORGANIZER", "CUSTOMER", "GATEKEEPER"]).default("CUSTOMER"),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;

export const updateUserSchema = z.object({
  name: z.string().min(1, "Name cannot be empty").optional(),
  email: z.string().email("Invalid email format").optional(),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters long")
    .optional(),
  role: z.enum(["ORGANIZER", "CUSTOMER", "GATEKEEPER"]).optional(),
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>;

export const loginUserSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

export type LoginUserInput = z.infer<typeof loginUserSchema>;
