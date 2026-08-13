import { type Request, type Response, type NextFunction } from "express";
import { type EventService } from "@/services/event-service.js";
import { type CreateEventInput } from "@/schemas/event-schemas.js";
import { UnauthorizedError, BadRequestError } from "@/libs/errors.js";

export class EventController {
  constructor(private eventService: EventService) {}

  create = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const validatedData = req.body as CreateEventInput;
      const organizerId = req.user?.id;

      if (!organizerId) {
        throw new UnauthorizedError("User is not authenticated");
      }

      const event = await this.eventService.createEvent(
        validatedData,
        organizerId,
      );
      res.status(201).json({
        status: "success",
        data: event,
      });
    } catch (error) {
      next(error);
    }
  };

  getAll = async (
    _req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const events = await this.eventService.getAllEvents();
      res.status(200).json({
        status: "success",
        data: events,
      });
    } catch (error) {
      next(error);
    }
  };

  getById = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { id } = req.params;
      if (typeof id !== "string") {
        throw new BadRequestError("Invalid event ID");
      }
      const event = await this.eventService.getEventById(id);
      res.status(200).json({
        status: "success",
        data: event,
      });
    } catch (error) {
      next(error);
    }
  };
}
