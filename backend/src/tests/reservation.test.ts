import request from "supertest";
import jwt from "jsonwebtoken";
import { app } from "@/app";
import { prisma } from "@/libs/prisma";
import { env } from "@/config/env";

describe("Testes de Integração de Reserva", () => {
  let customerToken: string;
  let eventId: string;

  beforeAll(async () => {
    await prisma.ticket.deleteMany();
    await prisma.reservation.deleteMany();
    await prisma.event.deleteMany();
    await prisma.user.deleteMany();

    const organizer = await prisma.user.create({
      data: {
        name: "Organizer",
        email: "organizer@example.com",
        password: "hashedpassword123",
        role: "ORGANIZER",
      },
    });

    const customer = await prisma.user.create({
      data: {
        name: "Customer",
        email: "customer@example.com",
        password: "hashedpassword123",
        role: "CUSTOMER",
      },
    });

    customerToken = jwt.sign(
      { id: customer.id, email: customer.email, role: customer.role },
      env.jwtSecret,
    );

    const event = await prisma.event.create({
      data: {
        title: "Evento Concorrente",
        date: new Date(),
        location: "Arena Central",
        capacity: 2,
        price: 50,
        organizerId: organizer.id,
      },
    });

    eventId = event.id;
  });

  afterAll(async () => {
    await prisma.ticket.deleteMany();
    await prisma.reservation.deleteMany();
    await prisma.event.deleteMany();
    await prisma.user.deleteMany();
    await prisma.$disconnect();
  });

  it("deve listar os eventos publicados", async () => {
    const response = await request(app).get("/events").expect(200);

    expect(response.body).toHaveProperty("status", "success");
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: eventId,
          title: "Evento Concorrente",
        }),
      ]),
    );
  });

  it("deve buscar um evento publicado pelo id", async () => {
    const response = await request(app).get(`/events/${eventId}`).expect(200);

    expect(response.body).toHaveProperty("status", "success");
    expect(response.body.data).toHaveProperty("id", eventId);
    expect(response.body.data).toHaveProperty("title", "Evento Concorrente");
  });

  it("deve impedir duas reservas simultaneas para o mesmo assento", async () => {
    const payload = {
      eventId,
      quantity: 1,
      seatCode: "A-1",
    };

    const [firstResponse, secondResponse] = await Promise.all([
      request(app)
        .post("/reservations")
        .set("Authorization", `Bearer ${customerToken}`)
        .send(payload),
      request(app)
        .post("/reservations")
        .set("Authorization", `Bearer ${customerToken}`)
        .send(payload),
    ]);

    const responses = [firstResponse.status, secondResponse.status].sort();

    expect(responses).toEqual([201, 409]);

    const reservations = await prisma.reservation.findMany({
      where: {
        eventId,
        seatCode: "A-1",
      },
    });

    expect(reservations).toHaveLength(1);
  });
});
