import { z } from "zod";

export const validateTicketEntrySchema = z.object({
  code: z.string().trim().min(1, "Ticket code is required"),
  eventId: z.string().trim().min(1, "Event ID is required"),
});

export type ValidateTicketEntryInput = z.infer<
  typeof validateTicketEntrySchema
>;
