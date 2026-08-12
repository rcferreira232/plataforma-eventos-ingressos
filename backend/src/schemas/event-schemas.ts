import { z } from "zod";

export const createEventSchema = z.object({
  title: z.string().min(1, "Title is required"),
  date: z
    .string()
    .datetime({ message: "Invalid date format, must be ISO 8601" }),
  location: z.string().min(1, "Location is required"),
  capacity: z.number().int().positive("Capacity must be a positive integer"),
  price: z.number().nonnegative("Price must be a non-negative number"),
  externalRef: z.string().optional(),
  externalId: z.string().optional().nullable(),
  overview: z.string().optional().nullable(),
  posterPath: z.string().optional().nullable(),
  backdropPath: z.string().optional().nullable(),
  voteAverage: z.number().optional().nullable(),
});

export type CreateEventInput = z.infer<typeof createEventSchema>;

export const updateEventSchema = createEventSchema.partial();
export type UpdateEventInput = z.infer<typeof updateEventSchema>;
