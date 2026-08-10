import crypto from "crypto";
import { Prisma } from "@/generated/prisma/client";
import { type ITicketRepository } from "@/repositories/ticket-repository";
import { env } from "@/config/env";
import { ForbiddenError, NotFoundError } from "@/libs/errors";
import { prisma } from "@/libs/prisma";
import { type ValidateTicketEntryInput } from "@/schemas/ticket-schemas";

type TicketView = {
  id: string;
  code: string;
  status: string;
  reservationId: string;
  event: {
    id: string;
    title: string;
    date: Date;
    location: string;
  };
  shareLink: string;
};

type GateValidationStatus =
  | "VALID"
  | "INVALID"
  | "ALREADY_USED"
  | "WRONG_EVENT";

type GateValidationResult = {
  validationStatus: GateValidationStatus;
  message: string;
  ticketId?: string;
  eventId?: string;
  code: string;
};

export class TicketService {
  constructor(private ticketRepository: ITicketRepository) {}

  async getMyTickets(userId: string): Promise<TicketView[]> {
    const tickets = await this.ticketRepository.getByUserId(userId);

    return tickets.map((ticket) => ({
      id: ticket.id,
      code: ticket.code,
      status: ticket.status,
      reservationId: ticket.reservation.id,
      event: ticket.event,
      shareLink: this.buildShareLink(ticket.id, ticket.code),
    }));
  }

  async getSharedTicket(ticketId: string, token: string): Promise<TicketView> {
    const ticket = await this.ticketRepository.getShareTicketById(ticketId);
    if (!ticket) {
      throw new NotFoundError("Ticket not found");
    }

    this.validateShareToken(ticket.id, ticket.code, token);

    return {
      id: ticket.id,
      code: ticket.code,
      status: ticket.status,
      reservationId: ticket.reservation.id,
      event: ticket.event,
      shareLink: this.buildShareLink(ticket.id, ticket.code),
    };
  }

  async validateTicketEntry(
    payload: ValidateTicketEntryInput,
  ): Promise<GateValidationResult> {
    return this.runSerializableTransaction(async (tx) => {
      const lockedTickets = await tx.$queryRaw<
        Array<{
          id: string;
          code: string;
          status: "VALID" | "USED" | "CANCELLED";
          eventId: string;
        }>
      >`
        SELECT "id", "code", "status", "eventId"
        FROM "Ticket"
        WHERE "code" = ${payload.code}
        FOR UPDATE
      `;

      const ticket = lockedTickets[0];

      console.log(payload.code, ticket);

      if (!ticket) {
        return {
          validationStatus: "INVALID",
          message: "Ticket code is invalid",
          code: payload.code,
        };
      }

      if (ticket.eventId !== payload.eventId) {
        return {
          validationStatus: "WRONG_EVENT",
          message: "Ticket belongs to a different event",
          ticketId: ticket.id,
          eventId: ticket.eventId,
          code: ticket.code,
        };
      }

      if (ticket.status === "USED") {
        return {
          validationStatus: "ALREADY_USED",
          message: "Ticket has already been used",
          ticketId: ticket.id,
          eventId: ticket.eventId,
          code: ticket.code,
        };
      }

      if (ticket.status !== "VALID") {
        return {
          validationStatus: "INVALID",
          message: "Ticket is not valid for entry",
          ticketId: ticket.id,
          eventId: ticket.eventId,
          code: ticket.code,
        };
      }

      await this.ticketRepository.updateStatus(ticket.id, "USED", tx);

      return {
        validationStatus: "VALID",
        message: "Ticket validated and entry allowed",
        ticketId: ticket.id,
        eventId: ticket.eventId,
        code: ticket.code,
      };
    });
  }

  buildShareLink(ticketId: string, ticketCode: string): string {
    const token = this.generateShareToken(ticketId, ticketCode);
    return `/tickets/shared/${ticketId}?token=${token}`;
  }

  private generateShareToken(ticketId: string, ticketCode: string): string {
    return crypto
      .createHmac("sha256", env.jwtSecret)
      .update(`${ticketId}:${ticketCode}`)
      .digest("hex");
  }

  private validateShareToken(
    ticketId: string,
    ticketCode: string,
    token: string,
  ): void {
    const expectedToken = this.generateShareToken(ticketId, ticketCode);
    const tokenBuffer = Buffer.from(token, "utf8");
    const expectedBuffer = Buffer.from(expectedToken, "utf8");

    if (tokenBuffer.length !== expectedBuffer.length) {
      throw new ForbiddenError("Invalid share token");
    }

    if (!crypto.timingSafeEqual(tokenBuffer, expectedBuffer)) {
      throw new ForbiddenError("Invalid share token");
    }
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

    throw new Error("Transaction retry limit exceeded");
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
