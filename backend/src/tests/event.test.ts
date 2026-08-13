import request from "supertest";
import app from "@/app";
import { prisma } from "@/libs/prisma";
import jwt from "jsonwebtoken";
import { env } from "@/config/env";

describe("Testes de Integração de Eventos", () => {
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
        name: "Test Organizer",
        email: "organizer.test@example.com",
        password: "hashedpassword123",
        role: "ORGANIZER",
      },
    });
    organizerId = organizer.id;

    const customer = await prisma.user.create({
      data: {
        name: "Test Customer",
        email: "customer.test@example.com",
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

  describe("POST /events", () => {
    const validEventPayload = {
      title: "Grande Show de Teste",
      date: new Date().toISOString(),
      location: "Teatro Municipal",
      capacity: 500,
      price: 120.5,
    };

    it("Deve permitir que um Organizador crie um evento com sucesso", async () => {
      const response = await request(app)
        .post("/events")
        .set("Authorization", `Bearer ${organizerToken}`)
        .send(validEventPayload)
        .expect(201);

      expect(response.body).toHaveProperty("status", "success");
      expect(response.body.data).toHaveProperty("id");
      expect(response.body.data.title).toBe(validEventPayload.title);
      expect(response.body.data.organizerId).toBe(organizerId);
    });

    it("Deve negar a criação de evento para usuários com papel CUSTOMER", async () => {
      const response = await request(app)
        .post("/events")
        .set("Authorization", `Bearer ${customerToken}`)
        .send(validEventPayload)
        .expect(403);

      expect(response.body).toHaveProperty("status", "error");
      expect(response.body.message).toMatch(/insufficient permissions/i);
    });

    it("Deve negar a requisição se não houver Token JWT", async () => {
      const response = await request(app)
        .post("/events")
        .send(validEventPayload)
        .expect(401);

      expect(response.body).toHaveProperty("status", "error");
      expect(response.body.message).toMatch(/authorization header/i);
    });

    it("Deve falhar ao tentar criar evento com dados incompletos ou inválidos", async () => {
      const invalidPayload = {
        title: "Show Sem Preço",
      };

      const response = await request(app)
        .post("/events")
        .set("Authorization", `Bearer ${organizerToken}`)
        .send(invalidPayload)
        .expect(400);

      expect(response.body).toHaveProperty("status", "error");
      expect(response.body.message).toBe("Validation failed");
      expect(response.body).toHaveProperty("errors");
    });
  });

  describe("GET /events", () => {
    it("Deve listar todos os eventos cadastrados", async () => {
      const response = await request(app).get("/events").expect(200);

      expect(response.body).toHaveProperty("status", "success");
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.data[0]).toHaveProperty("organizer");
    });
  });
});
