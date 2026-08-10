import { type Request, type Response, type NextFunction } from "express";
import { type TicketService } from "@/services/ticket-service";
import { type ValidateTicketEntryInput } from "@/schemas/ticket-schemas";
import { BadRequestError, UnauthorizedError } from "@/libs/errors";

export class TicketController {
  constructor(private ticketService: TicketService) {}

  getMyTickets = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new UnauthorizedError("User is not authenticated");
      }

      const tickets = await this.ticketService.getMyTickets(userId);
      res.status(200).json({
        status: "success",
        data: tickets,
      });
    } catch (error) {
      next(error);
    }
  };

  getSharedTicket = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const ticketId = req.params.id;
      if (typeof ticketId !== "string" || ticketId.length === 0) {
        throw new BadRequestError("Ticket ID is required");
      }

      const token = req.query.token;
      if (typeof token !== "string" || token.length === 0) {
        throw new BadRequestError("Share token is required");
      }

      const ticket = await this.ticketService.getSharedTicket(ticketId, token);
      res.status(200).json({
        status: "success",
        data: ticket,
      });
    } catch (error) {
      next(error);
    }
  };

  validateEntry = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const payload = req.body as ValidateTicketEntryInput;
      const result = await this.ticketService.validateTicketEntry(payload);

      res.status(200).json({
        status: "success",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };
}
