import { jest, describe, it, expect, afterEach } from "@jest/globals";
import { TMDBService } from "@/services/external/tmdb-service.js";
import { AppError } from "@/libs/errors.js";
import { env } from "@/config/env.js";

describe("Testes Unitários de TMDBService", () => {
  const originalApiKey = env.tmdbApiKey;

  afterEach(() => {
    jest.restoreAllMocks();
    (env as any).tmdbApiKey = originalApiKey;
  });

  describe("getPopularMovies", () => {
    it("deve retornar lista de filmes formatada quando a resposta do TMDB for bem-sucedida", async () => {
      const mockMovies = {
        results: [
          {
            id: 101,
            title: "Filme Teste",
            overview: "Sinopse do filme",
            poster_path: "/poster.jpg",
            backdrop_path: "/backdrop.jpg",
            release_date: "2026-01-01",
            vote_average: 8.5,
          },
        ],
      };

      jest.spyOn(globalThis, "fetch").mockResolvedValueOnce({
        ok: true,
        json: async () => mockMovies,
      } as Response);

      const result = await TMDBService.getPopularMovies(1);
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: 101,
        title: "Filme Teste",
        overview: "Sinopse do filme",
        posterPath: "/poster.jpg",
        backdropPath: "/backdrop.jpg",
        releaseDate: "2026-01-01",
        voteAverage: 8.5,
      });
    });

    it("deve retornar lista vazia se tmdbApiKey não estiver configurada", async () => {
      (env as any).tmdbApiKey = "";
      const result = await TMDBService.getPopularMovies();
      expect(result).toEqual([]);
    });

    it("deve lançar AppError (502) quando a resposta do TMDB não for OK", async () => {
      jest.spyOn(globalThis, "fetch").mockResolvedValueOnce({
        ok: false,
        status: 500,
      } as Response);

      await expect(TMDBService.getPopularMovies()).rejects.toThrow(AppError);
    });
  });

  describe("searchMovies", () => {
    it("deve buscar filmes pelo termo especificado", async () => {
      const mockResponse = { results: [{ id: 1, title: "Avatar" }] };

      jest.spyOn(globalThis, "fetch").mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await TMDBService.searchMovies("Avatar");
      expect(result).toEqual([{ id: 1, title: "Avatar" }]);
    });

    it("deve retornar lista vazia se tmdbApiKey não estiver configurada ao buscar filmes", async () => {
      (env as any).tmdbApiKey = "";
      const result = await TMDBService.searchMovies("Batman");
      expect(result).toEqual([]);
    });

    it("deve lançar AppError (502) quando ocorrer erro na busca", async () => {
      jest.spyOn(globalThis, "fetch").mockRejectedValueOnce(new Error("Network Error"));

      await expect(TMDBService.searchMovies("Matrix")).rejects.toThrow(AppError);
    });
  });

  describe("getMovieDetails", () => {
    it("deve retornar detalhes do filme pelo ID", async () => {
      const mockMovie = { id: 550, title: "Clube da Luta" };

      jest.spyOn(globalThis, "fetch").mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockMovie,
      } as Response);

      const result = await TMDBService.getMovieDetails("550");
      expect(result).toEqual(mockMovie);
    });

    it("deve retornar null se o filme não for encontrado (404)", async () => {
      jest.spyOn(globalThis, "fetch").mockResolvedValueOnce({
        ok: false,
        status: 404,
      } as Response);

      const result = await TMDBService.getMovieDetails("9999999");
      expect(result).toBeNull();
    });

    it("deve retornar null se tmdbApiKey não estiver configurada", async () => {
      (env as any).tmdbApiKey = "";
      const result = await TMDBService.getMovieDetails("550");
      expect(result).toBeNull();
    });

    it("deve lançar AppError quando a resposta não for ok nem 404", async () => {
      jest.spyOn(globalThis, "fetch").mockResolvedValueOnce({
        ok: false,
        status: 500,
      } as Response);

      await expect(TMDBService.getMovieDetails("550")).rejects.toThrow(AppError);
    });
  });
});
