import {
  type Reservation,
  type Prisma,
  type ReservationStatus,
} from "@prisma/client";
import { prisma } from "@/libs/prisma";

type TransactionClient = Prisma.TransactionClient;

export interface IReservationRepository {
  create(
    data: Prisma.ReservationUncheckedCreateInput,
    tx?: TransactionClient,
  ): Promise<Reservation>;
  getById(id: string, tx?: TransactionClient): Promise<Reservation | null>;
  updateStatus(
    id: string,
    status: ReservationStatus,
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

  getById(
    id: string,
    tx: TransactionClient = prisma,
  ): Promise<Reservation | null> {
    return tx.reservation.findUnique({
      where: { id },
    });
  }

  updateStatus(
    id: string,
    status: ReservationStatus,
    tx: TransactionClient = prisma,
  ): Promise<Reservation> {
    return tx.reservation.update({
      where: { id },
      data: { status },
    });
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
