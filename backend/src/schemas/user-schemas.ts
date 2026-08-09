import { z } from "zod";

export const createUserSchema = z.object({
  name: z.string({ error: "Name is required" }).min(1, "Name cannot be empty"),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
