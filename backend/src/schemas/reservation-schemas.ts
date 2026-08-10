import { z } from "zod";

export const createReservationSchema = z
  .object({
    eventId: z.string().min(1, "Event ID is required"),
    quantity: z
      .number()
      .int()
      .positive("Quantity must be a positive integer")
      .default(1),
    seatCode: z.string().trim().min(1, "Seat code is required").optional(),
  })
  .superRefine((data, ctx) => {
    if (!data.seatCode) {
      return;
    }

    if (data.quantity !== 1) {
      ctx.issues.push({
        code: "custom",
        message: "Quantity must be 1 when reserving a specific seat",
        path: ["quantity"],
        input: data.quantity,
      });
    }
  });

export type CreateReservationInput = z.infer<typeof createReservationSchema>;

export const checkoutReservationSchema = z.object({
  decision: z.enum(["CONFIRM", "DECLINE"]),
});

export type CheckoutReservationInput = z.infer<
  typeof checkoutReservationSchema
>;
