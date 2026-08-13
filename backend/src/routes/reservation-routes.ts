import { Router } from "express";
import { PrismaReservationRepository } from "@/repositories/reservation-repository.js";
import { PrismaTicketRepository } from "@/repositories/ticket-repository.js";
import { ReservationService } from "@/services/reservation-service.js";
import { ReservationController } from "@/controllers/reservation-controller.js";
import { authMiddleware } from "@/middlewares/auth-middleware.js";
import { validate } from "@/middlewares/validate-middleware.js";
import {
  createReservationSchema,
  checkoutReservationSchema,
} from "@/schemas/reservation-schemas.js";

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
