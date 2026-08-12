import { api } from "./api";
import type { Ticket } from "@/types";

interface ApiResponse<T> {
  status: string;
  data: T;
}

export interface ValidateTicketEntryPayload {
  code: string;
  eventId: string;
}

export type GateValidationStatus =
  | "VALID"
  | "INVALID"
  | "ALREADY_USED"
  | "WRONG_EVENT";

export interface GateValidationResult {
  validationStatus: GateValidationStatus;
  message: string;
  ticketId?: string;
  eventId?: string;
  code: string;
}

export async function getMyTickets(): Promise<Ticket[]> {
  const response = await api.get<ApiResponse<Ticket[]>>("/tickets/me");
  return response.data.data;
}

export async function getSharedTicket(
  ticketId: string,
  token: string
): Promise<Ticket> {
  const response = await api.get<ApiResponse<Ticket>>(
    `/tickets/shared/${ticketId}`,
    {
      params: { token },
    }
  );
  return response.data.data;
}

export async function validateTicketEntry(
  payload: ValidateTicketEntryPayload
): Promise<GateValidationResult> {
  const response = await api.post<ApiResponse<GateValidationResult>>(
    "/tickets/validate-entry",
    payload
  );
  return response.data.data;
}
