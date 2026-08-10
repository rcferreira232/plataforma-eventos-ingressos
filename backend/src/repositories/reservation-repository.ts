import { type Reservation, type Prisma } from "@/generated/prisma/client";
import { prisma } from "@/libs/prisma";

type TransactionClient = Prisma.TransactionClient;

export interface IReservationRepository {
  create(
    data: Prisma.ReservationUncheckedCreateInput,
    tx?: TransactionClient,
  ): Promise<Reservation>;
  getOccupiedQuantity(eventId: string, tx?: TransactionClient): Promise<number>;
  getByEventSeat(
    eventId: string,
    seatCode: string,
    tx?: TransactionClient,
  ): Promise<Reservation | null>;
}

export class PrismaReservationRepository implements IReservationRepository {
  create(
    data: Prisma.ReservationUncheckedCreateInput,
    tx: TransactionClient = prisma,
  ): Promise<Reservation> {
    return tx.reservation.create({ data });
  }

  async getOccupiedQuantity(
    eventId: string,
    tx: TransactionClient = prisma,
  ): Promise<number> {
    const aggregate = await tx.reservation.aggregate({
      where: {
        eventId,
        status: {
          in: ["PENDING", "CONFIRMED"],
        },
      },
      _sum: {
        quantity: true,
      },
    });

    return aggregate._sum.quantity ?? 0;
  }

  getByEventSeat(
    eventId: string,
    seatCode: string,
    tx: TransactionClient = prisma,
  ): Promise<Reservation | null> {
    return tx.reservation.findFirst({
      where: {
        eventId,
        seatCode,
        status: {
          in: ["PENDING", "CONFIRMED"],
        },
      },
    });
  }
}
