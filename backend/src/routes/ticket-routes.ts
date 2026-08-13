import { Router } from "express";
import { PrismaTicketRepository } from "@/repositories/ticket-repository.js";
import { TicketService } from "@/services/ticket-service.js";
import { TicketController } from "@/controllers/ticket-controller.js";
import { authMiddleware } from "@/middlewares/auth-middleware.js";
import { validate } from "@/middlewares/validate-middleware.js";
import { validateTicketEntrySchema } from "@/schemas/ticket-schemas.js";

const ticketRouter: Router = Router();

const ticketRepository = new PrismaTicketRepository();
const ticketService = new TicketService(ticketRepository);
const ticketController = new TicketController(ticketService);

ticketRouter.get(
  "/me",
  authMiddleware(["CUSTOMER"]),
  ticketController.getMyTickets,
);
ticketRouter.get("/shared/:id", ticketController.getSharedTicket);
ticketRouter.post(
  "/validate-entry",
  authMiddleware(["GATEKEEPER"]),
  validate(validateTicketEntrySchema),
  ticketController.validateEntry,
);

export { ticketRouter };
