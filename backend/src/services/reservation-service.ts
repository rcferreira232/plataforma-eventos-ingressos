import { Prisma, type Reservation } from "@/generated/prisma/client";
import { type IReservationRepository } from "@/repositories/reservation-repository";
import { type CreateReservationInput } from "@/schemas/reservation-schemas";
import { ConflictError, NotFoundError } from "@/libs/errors";
import { prisma } from "@/libs/prisma";

export class ReservationService {
  constructor(private reservationRepository: IReservationRepository) {}

  async createReservation(
    data: CreateReservationInput,
    userId: string,
  ): Promise<Reservation> {
    return prisma.$transaction(
      async (tx) => {
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

        const quantity = data.quantity ?? 1;
        const occupiedQuantity =
          await this.reservationRepository.getOccupiedQuantity(
            data.eventId,
            tx,
          );

        if (occupiedQuantity + quantity > event.capacity) {
          throw new ConflictError("No seats available for this event");
        }

        if (data.seatCode) {
          const existingSeat = await this.reservationRepository.getByEventSeat(
            data.eventId,
            data.seatCode,
            tx,
          );

          if (existingSeat) {
            throw new ConflictError("Seat already reserved");
          }
        }

        try {
          return await this.reservationRepository.create(
            {
              userId,
              eventId: data.eventId,
              quantity,
              seatCode: data.seatCode ?? null,
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
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      },
    );
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
}
