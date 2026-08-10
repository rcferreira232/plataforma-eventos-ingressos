import { Router } from "express";
import { PrismaEventRepository } from "@/repositories/event-repository";
import { EventService } from "@/services/event-service";
import { EventController } from "@/controllers/event-controller";

import { validate } from "@/middlewares/validate-middleware";
import { authMiddleware } from "@/middlewares/auth-middleware";
import { createEventSchema } from "@/schemas/event-schemas";

const eventRouter: Router = Router();

const eventRepository = new PrismaEventRepository();
const eventService = new EventService(eventRepository);
const eventController = new EventController(eventService);

eventRouter.post(
  "/",
  authMiddleware(["ORGANIZER"]),
  validate(createEventSchema),
  eventController.create
);

eventRouter.get("/", eventController.getAll);
eventRouter.get("/:id", eventController.getById);

export { eventRouter };
