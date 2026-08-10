import { Router } from "express";
import { PrismaReservationRepository } from "@/repositories/reservation-repository";
import { ReservationService } from "@/services/reservation-service";
import { ReservationController } from "@/controllers/reservation-controller";
import { authMiddleware } from "@/middlewares/auth-middleware";
import { validate } from "@/middlewares/validate-middleware";
import { createReservationSchema } from "@/schemas/reservation-schemas";

const reservationRouter: Router = Router();

const reservationRepository = new PrismaReservationRepository();
const reservationService = new ReservationService(reservationRepository);
const reservationController = new ReservationController(reservationService);

reservationRouter.post(
  "/",
  authMiddleware(["CUSTOMER"]),
  validate(createReservationSchema),
  reservationController.create,
);

export { reservationRouter };
