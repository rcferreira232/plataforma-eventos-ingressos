import crypto from "crypto";
import { type ITicketRepository } from "@/repositories/ticket-repository";
import { env } from "@/config/env";
import { ForbiddenError, NotFoundError } from "@/libs/errors";

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
}
