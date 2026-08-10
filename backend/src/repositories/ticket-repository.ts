import {
  type Prisma,
  type Ticket,
  type TicketStatus,
} from "@/generated/prisma/client";
import { prisma } from "@/libs/prisma";

type TransactionClient = Prisma.TransactionClient;

export type TicketWithDetails = Ticket & {
  event: {
    id: string;
    title: string;
    date: Date;
    location: string;
  };
  reservation: {
    id: string;
    quantity: number;
    status: string;
  };
};

export interface ITicketRepository {
  create(
    data: Prisma.TicketUncheckedCreateInput,
    tx?: TransactionClient,
  ): Promise<Ticket>;
  getById(id: string, tx?: TransactionClient): Promise<Ticket | null>;
  getByReservationId(
    reservationId: string,
    tx?: TransactionClient,
  ): Promise<Ticket[]>;
  getByUserId(userId: string): Promise<TicketWithDetails[]>;
  getShareTicketById(ticketId: string): Promise<TicketWithDetails | null>;
  getByCode(code: string, tx?: TransactionClient): Promise<Ticket | null>;
  updateStatus(
    id: string,
    status: TicketStatus,
    tx?: TransactionClient,
  ): Promise<Ticket>;
}

export class PrismaTicketRepository implements ITicketRepository {
  create(
    data: Prisma.TicketUncheckedCreateInput,
    tx: TransactionClient = prisma,
  ): Promise<Ticket> {
    return tx.ticket.create({ data });
  }

  getById(id: string, tx: TransactionClient = prisma): Promise<Ticket | null> {
    return tx.ticket.findUnique({ where: { id } });
  }

  getByReservationId(
    reservationId: string,
    tx: TransactionClient = prisma,
  ): Promise<Ticket[]> {
    return tx.ticket.findMany({
      where: { reservationId },
      orderBy: { createdAt: "asc" },
    });
  }

  getByUserId(userId: string): Promise<TicketWithDetails[]> {
    return prisma.ticket.findMany({
      where: {
        reservation: {
          userId,
        },
      },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            date: true,
            location: true,
          },
        },
        reservation: {
          select: {
            id: true,
            quantity: true,
            status: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  getShareTicketById(ticketId: string): Promise<TicketWithDetails | null> {
    return prisma.ticket.findUnique({
      where: { id: ticketId },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            date: true,
            location: true,
          },
        },
        reservation: {
          select: {
            id: true,
            quantity: true,
            status: true,
          },
        },
      },
    });
  }

  getByCode(
    code: string,
    tx: TransactionClient = prisma,
  ): Promise<Ticket | null> {
    return tx.ticket.findUnique({
      where: { code },
    });
  }

  updateStatus(
    id: string,
    status: TicketStatus,
    tx: TransactionClient = prisma,
  ): Promise<Ticket> {
    return tx.ticket.update({
      where: { id },
      data: { status },
    });
  }
}
