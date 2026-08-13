import { Prisma, type Reservation } from "@prisma/client";
import { type IReservationRepository } from "@/repositories/reservation-repository.js";
import { type ITicketRepository } from "@/repositories/ticket-repository.js";
import {
  type CreateReservationInput,
  type CheckoutReservationInput,
} from "@/schemas/reservation-schemas.js";
import {
  AppError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
} from "@/libs/errors.js";
import { isSeatWithinCapacity } from "@/utils/seat-utils.js";
import { prisma } from "@/libs/prisma.js";
import crypto from "crypto";

type CheckoutResult = {
  reservation: Reservation;
  tickets: Array<{
    id: string;
    code: string;
    status: string;
    reservationId: string;
    eventId: string;
  }>;
};

export class ReservationService {
  constructor(
    private reservationRepository: IReservationRepository,
    private ticketRepository: ITicketRepository,
  ) {}

  async createReservation(
    data: CreateReservationInput,
    userId: string,
  ): Promise<Reservation> {
    return this.runSerializableTransaction(async (tx) => {
      const lockedEvents = await tx.$queryRaw<
        Array<{ id: string; capacity: number }>
      >`
        SELECT "id", "capacity"
        FROM "Event"
        WHERE "id" = ${data.eventId}
        FOR UPDATE
      `;

      const event = lockedEvents[0];
      if (!event) {
        throw new NotFoundError("Event not found");
      }

      if (!isSeatWithinCapacity(data.seatCode, event.capacity)) {
        throw new AppError(
          `Seat code ${data.seatCode} is invalid or exceeds event capacity limits`,
          400,
        );
      }

      const quantity = 1;
      const occupiedQuantity =
        await this.reservationRepository.getOccupiedQuantity(data.eventId, tx);

      if (occupiedQuantity + quantity > event.capacity) {
        throw new ConflictError("No seats available for this event");
      }

      const existingSeat = await this.reservationRepository.getByEventSeat(
        data.eventId,
        data.seatCode,
        tx,
      );

      if (existingSeat) {
        throw new ConflictError("Seat already reserved");
      }

      try {
        return await this.reservationRepository.create(
          {
            userId,
            eventId: data.eventId,
            quantity: 1,
            seatCode: data.seatCode,
            status: "PENDING",
          },
          tx,
        );
      } catch (error) {
        if (this.isUniqueSeatConflict(error)) {
          throw new ConflictError("Seat already reserved");
        }

        throw error;
      }
    });
  }

  private isUniqueSeatConflict(error: unknown): boolean {
    if (typeof error !== "object" || error === null) {
      return false;
    }

    if (!("code" in error)) {
      return false;
    }

    return (error as { code?: string }).code === "P2002";
  }

  async checkoutReservation(
    reservationId: string,
    userId: string,
    data: CheckoutReservationInput,
  ): Promise<CheckoutResult> {
    return this.runSerializableTransaction(async (tx) => {
      const lockedReservations = await tx.$queryRaw<
        Array<{
          id: string;
          userId: string;
          eventId: string;
          quantity: number;
          status: "PENDING" | "CONFIRMED" | "CANCELLED";
        }>
      >`
        SELECT "id", "userId", "eventId", "quantity", "status"
        FROM "Reservation"
        WHERE "id" = ${reservationId}
        FOR UPDATE
      `;

      const lockedReservation = lockedReservations[0];
      if (!lockedReservation) {
        throw new NotFoundError("Reservation not found");
      }

      if (lockedReservation.userId !== userId) {
        throw new ForbiddenError(
          "Forbidden: reservation does not belong to user",
        );
      }

      if (lockedReservation.status !== "PENDING") {
        throw new ConflictError("Reservation already processed");
      }

      if (data.decision === "DECLINE") {
        const cancelledReservation =
          await this.reservationRepository.updateStatus(
            reservationId,
            "CANCELLED",
            tx,
          );

        return {
          reservation: cancelledReservation,
          tickets: [],
        };
      }

      const confirmedReservation =
        await this.reservationRepository.updateStatus(
          reservationId,
          "CONFIRMED",
          tx,
        );

      const createdTickets = [];
      const quantity = lockedReservation.quantity;
      for (let index = 0; index < quantity; index += 1) {
        const ticket = await this.ticketRepository.create(
          {
            reservationId: lockedReservation.id,
            eventId: lockedReservation.eventId,
            code: crypto.randomUUID(),
            status: "VALID",
          },
          tx,
        );

        createdTickets.push({
          id: ticket.id,
          code: ticket.code,
          status: ticket.status,
          reservationId: ticket.reservationId,
          eventId: ticket.eventId,
        });
      }

      return {
        reservation: confirmedReservation,
        tickets: createdTickets,
      };
    });
  }

  private async runSerializableTransaction<T>(
    operation: (tx: Prisma.TransactionClient) => Promise<T>,
    maxRetries = 3,
  ): Promise<T> {
    let attempt = 0;

    while (attempt < maxRetries) {
      try {
        return await prisma.$transaction(operation, {
          isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
        });
      } catch (error) {
        attempt += 1;

        if (this.isTransactionWriteConflict(error) && attempt < maxRetries) {
          continue;
        }

        throw error;
      }
    }

    throw new ConflictError("Transaction retry limit exceeded");
  }

  private isTransactionWriteConflict(error: unknown): boolean {
    if (typeof error !== "object" || error === null) {
      return false;
    }

    if (!("code" in error)) {
      return false;
    }

    return (error as { code?: string }).code === "P2034";
  }
}
