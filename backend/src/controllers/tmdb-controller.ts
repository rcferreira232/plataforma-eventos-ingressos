import { Request, Response, NextFunction } from "express";
import { TMDBService } from "../services/external/tmdb-service.js";

export class TMDBController {
  static async getPopular(req: Request, res: Response, next: NextFunction) {
    try {
      const page = req.query.page ? Number(req.query.page) : 1;
      const movies = await TMDBService.getPopularMovies(page);
      return res.status(200).json(movies);
    } catch (error) {
      next(error);
    }
  }
}
