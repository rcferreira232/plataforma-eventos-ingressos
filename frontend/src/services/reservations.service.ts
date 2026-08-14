import { api } from "./api";
import type { Reservation, Ticket } from "@/types";

export interface CreateReservationPayload {
  eventId: string;
  quantity: number;
  seatCode?: string;
}

export interface CheckoutReservationPayload {
  decision: "CONFIRM" | "DECLINE";
}

export interface CheckoutResponse {
  reservation: Reservation;
  tickets?: Ticket[];
}

interface ApiResponse<T> {
  status: string;
  data: T;
}

export async function createReservation(
  payload: CreateReservationPayload,
): Promise<Reservation> {
  const response = await api.post<ApiResponse<Reservation>>(
    "/reservations",
    payload,
  );
  return response.data.data;
}

export async function getOccupiedSeats(eventId: string): Promise<string[]> {
  const response = await api.get<ApiResponse<string[]>>(
    `/reservations/occupied-seats/${eventId}`,
  );
  return response.data.data;
}

export async function checkoutReservation(
  reservationId: string,
  payload: CheckoutReservationPayload,
): Promise<CheckoutResponse> {
  const response = await api.post<ApiResponse<CheckoutResponse>>(
    `/reservations/${reservationId}/checkout`,
    payload,
  );
  return response.data.data;
}
