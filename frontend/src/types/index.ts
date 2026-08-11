export type Role = "ORGANIZER" | "CUSTOMER" | "GATEKEEPER";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface AuthResponse {
  token: string;
  data: User;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  role?: Role;
}

export interface Event {
  id: string;
  title: string;
  date: string;
  location: string;
  capacity: number;
  price: number;
  externalRef?: string;
  organizerId: string;
  organizer?: User;
}

export type ReservationStatus = "PENDING" | "CONFIRMED" | "CANCELLED";

export interface Reservation {
  id: string;
  quantity: number;
  seatCode?: string;
  status: ReservationStatus;
  userId: string;
  eventId: string;
  event?: Event;
  createdAt: string;
}

export type TicketStatus = "VALID" | "USED" | "CANCELLED";
export type ValidationStatus =
  | "VALID"
  | "INVALID"
  | "ALREADY_USED"
  | "WRONG_EVENT";

export interface Ticket {
  id: string;
  reservationId: string;
  eventId: string;
  code: string;
  status: TicketStatus;
  shareLink?: string;
  event?: Event;
}

export interface ValidateEntryPayload {
  code: string;
  eventId: string;
}

export interface ValidationResponse {
  validationStatus: ValidationStatus;
  message?: string;
  ticket?: Ticket;
}

export interface CheckoutPayload {
  decision: "CONFIRM" | "DECLINE";
}
