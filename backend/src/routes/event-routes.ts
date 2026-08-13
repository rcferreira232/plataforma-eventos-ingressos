import { Router } from "express";
import { PrismaEventRepository } from "@/repositories/event-repository.js";
import { EventService } from "@/services/event-service.js";
import { EventController } from "@/controllers/event-controller.js";

import { validate } from "@/middlewares/validate-middleware.js";
import { authMiddleware } from "@/middlewares/auth-middleware.js";
import { createEventSchema } from "@/schemas/event-schemas.js";

const eventRouter: Router = Router();

const eventRepository = new PrismaEventRepository();
const eventService = new EventService(eventRepository);
const eventController = new EventController(eventService);

eventRouter.post(
  "/",
  authMiddleware(["ORGANIZER"]),
  validate(createEventSchema),
  eventController.create,
);

eventRouter.get("/", eventController.getAll);
eventRouter.get("/:id", eventController.getById);

export { eventRouter };
