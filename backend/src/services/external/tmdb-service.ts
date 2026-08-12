import { env } from "@/config/env";
import { AppError } from "@/libs/errors";
import { TMDBMovie, TMDBMovieDTO } from "@/interface/tmdb";

export class TMDBService {
  private static get headers() {
    return {
      accept: "application/json",
      Authorization: `Bearer ${env.tmdbApiKey}`,
    };
  }

  static async getPopularMovies(page: number = 1): Promise<TMDBMovieDTO[]> {
    if (!env.tmdbApiKey) {
      console.warn("TMDB API Key is not set. Returning empty list.");
      return [];
    }

    try {
      const response = await fetch(
        `${env.tmdbBaseUrl}/movie/popular?language=pt-BR&page=${page}`,
        {
          method: "GET",
          headers: this.headers,
        },
      );

      if (!response.ok) {
        throw new Error(`TMDB responded with status: ${response.status}`);
      }

      const data = (await response.json()) as { results: any[] };
      return (data.results || []).map((movie: any) => ({
        id: movie.id,
        title: movie.title ?? "",
        overview: movie.overview ?? "",
        posterPath: movie.poster_path ?? null,
        backdropPath: movie.backdrop_path ?? null,
        releaseDate: movie.release_date ?? "",
        voteAverage: movie.vote_average ?? 0,
      }));
    } catch (error) {
      console.error("Error fetching popular movies from TMDB:", error);
      throw new AppError("Failed to fetch popular movies from TMDB", 502);
    }
  }

  static async searchMovies(query: string): Promise<TMDBMovie[]> {
    if (!env.tmdbApiKey) {
      console.warn("TMDB API Key is not set. Returning empty list.");
      return [];
    }

    try {
      const response = await fetch(
        `${env.tmdbBaseUrl}/search/movie?query=${encodeURIComponent(
          query,
        )}&include_adult=false&language=pt-BR&page=1`,
        {
          method: "GET",
          headers: this.headers,
        },
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
        `${env.tmdbBaseUrl}/movie/${externalId}?language=pt-BR`,
        {
          method: "GET",
          headers: this.headers,
        },
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
