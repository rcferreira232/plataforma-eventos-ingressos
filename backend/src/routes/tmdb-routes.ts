import { Router } from "express";
import { TMDBController } from "@/controllers/tmdb-controller.js";
import { authMiddleware } from "@/middlewares/auth-middleware.js";

const tmdbRouter: Router = Router();

tmdbRouter.get(
  "/popular",
  authMiddleware(["ORGANIZER"]),
  TMDBController.getPopular,
);

export { tmdbRouter };
