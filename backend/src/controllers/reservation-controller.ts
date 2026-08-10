import { type Request, type Response, type NextFunction } from "express";
import { type ReservationService } from "@/services/reservation-service";
import { type CreateReservationInput } from "@/schemas/reservation-schemas";
import { UnauthorizedError } from "@/libs/errors";

export class ReservationController {
  constructor(private reservationService: ReservationService) {}

  create = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        throw new UnauthorizedError("User is not authenticated");
      }

      const validatedData = req.body as CreateReservationInput;
      const reservation = await this.reservationService.createReservation(
        validatedData,
        userId,
      );

      res.status(201).json({
        status: "success",
        data: reservation,
      });
    } catch (error) {
      next(error);
    }
  };
}
