import { env } from "@/config/env";
import { AppError } from "@/libs/errors";

const TMDB_BASE_URL = "https://api.themoviedb.org/3";

export interface TMDBMovie {
  id: number;
  title: string;
  overview: string;
  release_date: string;
}

export class TMDBService {
  private static get headers() {
    return {
      accept: "application/json",
      Authorization: `Bearer ${env.tmdbApiKey}`,
    };
  }

  static async searchMovies(query: string): Promise<TMDBMovie[]> {
    if (!env.tmdbApiKey) {
      console.warn("TMDB API Key is not set. Returning empty list.");
      return [];
    }

    try {
      const response = await fetch(
        `${TMDB_BASE_URL}/search/movie?query=${encodeURIComponent(
          query
        )}&include_adult=false&language=pt-BR&page=1`,
        {
          method: "GET",
          headers: this.headers,
        }
      );

      if (!response.ok) {
        throw new Error(`TMDB responded with status: ${response.status}`);
      }

      const data = (await response.json()) as any;
      return data.results as TMDBMovie[];
    } catch (error) {
      console.error("Error fetching from TMDB:", error);
      throw new AppError("Failed to fetch data from TMDB", 502);
    }
  }

  static async getMovieDetails(externalId: string): Promise<TMDBMovie | null> {
    if (!env.tmdbApiKey) {
      return null;
    }

    try {
      const response = await fetch(
        `${TMDB_BASE_URL}/movie/${externalId}?language=pt-BR`,
        {
          method: "GET",
          headers: this.headers,
        }
      );

      if (response.status === 404) {
        return null;
      }

      if (!response.ok) {
        throw new Error(`TMDB responded with status: ${response.status}`);
      }

      const data = await response.json();
      return data as TMDBMovie;
    } catch (error) {
      console.error("Error fetching details from TMDB:", error);
      throw new AppError("Failed to fetch movie details from TMDB", 502);
    }
  }
}
