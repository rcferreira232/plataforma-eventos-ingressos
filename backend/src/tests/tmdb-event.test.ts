import request from "supertest";
import { app } from "@/app";
import { prisma } from "@/libs/prisma";
import jwt from "jsonwebtoken";
import { env } from "@/config/env";
import { TMDBService } from "@/services/external/tmdb-service";
import { jest } from "@jest/globals";

describe("Testes de Integração do TMDB e Eventos", () => {
  let organizerToken: string;
  let customerToken: string;
  let organizerId: string;

  beforeAll(async () => {
    await prisma.ticket.deleteMany();
    await prisma.reservation.deleteMany();
    await prisma.event.deleteMany();
    await prisma.user.deleteMany();

    const organizer = await prisma.user.create({
      data: {
        name: "Test Organizer TMDB",
        email: "organizer.tmdb@example.com",
        password: "hashedpassword123",
        role: "ORGANIZER",
      },
    });
    organizerId = organizer.id;

    const customer = await prisma.user.create({
      data: {
        name: "Test Customer TMDB",
        email: "customer.tmdb@example.com",
        password: "hashedpassword123",
        role: "CUSTOMER",
      },
    });

    organizerToken = jwt.sign(
      { id: organizer.id, email: organizer.email, role: organizer.role },
      env.jwtSecret,
    );

    customerToken = jwt.sign(
      { id: customer.id, email: customer.email, role: customer.role },
      env.jwtSecret,
    );
  });

  afterAll(async () => {
    await prisma.ticket.deleteMany();
    await prisma.reservation.deleteMany();
    await prisma.event.deleteMany();
    await prisma.user.deleteMany();
    await prisma.$disconnect();
  });

  describe("GET /tmdb/popular", () => {
    it("Deve retornar a lista de filmes populares quando acessado por um ORGANIZER", async () => {
      const mockPopularMovies = [
        {
          id: 969681,
          title: "Homem-Aranha",
          overview: "Sinopse do filme",
          posterPath: "/poster.jpg",
          backdropPath: "/backdrop.jpg",
          releaseDate: "2024-01-01",
          voteAverage: 8.5,
        },
      ];

      const spy = jest
        .spyOn(TMDBService, "getPopularMovies")
        .mockResolvedValue(mockPopularMovies);

      const response = await request(app)
        .get("/tmdb/popular?page=1")
        .set("Authorization", `Bearer ${organizerToken}`)
        .expect(200);

      expect(response.body).toEqual(mockPopularMovies);
      expect(spy).toHaveBeenCalledWith(1);
      spy.mockRestore();
    });

    it("Deve negar acesso ao endpoint de filmes populares para CUSTOMER", async () => {
      await request(app)
        .get("/tmdb/popular")
        .set("Authorization", `Bearer ${customerToken}`)
        .expect(403);
    });
  });

  describe("POST /events com dados do TMDB", () => {
    it("Deve criar um evento associado aos campos do TMDB", async () => {
      const payloadWithTmdb = {
        title: "Sessão Especial Homem-Aranha",
        date: new Date().toISOString(),
        location: "Cinema 1 - Shopping",
        capacity: 100,
        price: 25.0,
        externalId: "969681",
        overview: "Sinopse do filme do TMDB",
        posterPath: "/poster.jpg",
        backdropPath: "/backdrop.jpg",
        voteAverage: 8.5,
      };

      const response = await request(app)
        .post("/events")
        .set("Authorization", `Bearer ${organizerToken}`)
        .send(payloadWithTmdb)
        .expect(201);

      expect(response.body).toHaveProperty("status", "success");
      expect(response.body.data).toHaveProperty("id");
      expect(response.body.data.externalId).toBe("969681");
      expect(response.body.data.overview).toBe("Sinopse do filme do TMDB");
      expect(response.body.data.posterPath).toBe("/poster.jpg");
      expect(response.body.data.backdropPath).toBe("/backdrop.jpg");
      expect(response.body.data.voteAverage).toBe(8.5);
    });
  });
});
