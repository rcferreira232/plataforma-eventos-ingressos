import { z } from "zod";

export const createReservationSchema = z.object({
  eventId: z.string().min(1, "Event ID is required"),
  quantity: z
    .number()
    .int()
    .positive("Quantity must be a positive integer")
    .default(1),
  seatCode: z
    .string({ error: "Seat code is required" })
    .trim()
    .min(1, "Seat code is required")
    .regex(
      /^[A-Z]+-\d+$/,
      "Invalid seat code format. Must be like A-1 or B-10",
    ),
});

export type CreateReservationInput = z.infer<typeof createReservationSchema>;

export const checkoutReservationSchema = z.object({
  decision: z.enum(["CONFIRM", "DECLINE"]),
});

export type CheckoutReservationInput = z.infer<
  typeof checkoutReservationSchema
>;
