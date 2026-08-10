import { Router } from "express";
import { PrismaReservationRepository } from "@/repositories/reservation-repository";
import { PrismaTicketRepository } from "@/repositories/ticket-repository";
import { ReservationService } from "@/services/reservation-service";
import { ReservationController } from "@/controllers/reservation-controller";
import { authMiddleware } from "@/middlewares/auth-middleware";
import { validate } from "@/middlewares/validate-middleware";
import {
  createReservationSchema,
  checkoutReservationSchema,
} from "@/schemas/reservation-schemas";

const reservationRouter: Router = Router();

const reservationRepository = new PrismaReservationRepository();
const ticketRepository = new PrismaTicketRepository();
const reservationService = new ReservationService(
  reservationRepository,
  ticketRepository,
);
const reservationController = new ReservationController(reservationService);

reservationRouter.post(
  "/",
  authMiddleware(["CUSTOMER"]),
  validate(createReservationSchema),
  reservationController.create,
);

reservationRouter.post(
  "/:id/checkout",
  authMiddleware(["CUSTOMER"]),
  validate(checkoutReservationSchema),
  reservationController.checkout,
);

export { reservationRouter };
