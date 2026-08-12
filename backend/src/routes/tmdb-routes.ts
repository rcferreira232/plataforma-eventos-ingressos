import { Router } from "express";
import { TMDBController } from "@/controllers/tmdb-controller";
import { authMiddleware } from "@/middlewares/auth-middleware";

const tmdbRouter: Router = Router();

tmdbRouter.get("/popular", authMiddleware(["ORGANIZER"]), TMDBController.getPopular);

export { tmdbRouter };
