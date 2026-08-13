import crypto from "crypto";
import request from "supertest";
import jwt from "jsonwebtoken";
import { app } from "@/app";
import { prisma } from "@/libs/prisma";
import { env } from "@/config/env";

describe("Testes de Integração da Portaria", () => {
  let gatekeeperToken: string;
  let customerToken: string;
  let customerId: string;
  let organizerId: string;
  let eventAId: string;
  let eventBId: string;

  beforeEach(async () => {
    await prisma.ticket.deleteMany();
    await prisma.reservation.deleteMany();
    await prisma.event.deleteMany();
    await prisma.user.deleteMany();

    const organizer = await prisma.user.create({
      data: {
        name: "Organizer Gate",
        email: "organizer.gate@example.com",
        password: "hashedpassword123",
        role: "ORGANIZER",
      },
    });

    const customer = await prisma.user.create({
      data: {
        name: "Customer Gate",
        email: "customer.gate@example.com",
        password: "hashedpassword123",
        role: "CUSTOMER",
      },
    });

    const gatekeeper = await prisma.user.create({
      data: {
        name: "Gatekeeper",
        email: "gatekeeper@example.com",
        password: "hashedpassword123",
        role: "GATEKEEPER",
      },
    });

    organizerId = organizer.id;
    customerId = customer.id;

    gatekeeperToken = jwt.sign(
      { id: gatekeeper.id, email: gatekeeper.email, role: gatekeeper.role },
      env.jwtSecret,
    );

    customerToken = jwt.sign(
      { id: customer.id, email: customer.email, role: customer.role },
      env.jwtSecret,
    );

    const eventA = await prisma.event.create({
      data: {
        title: "Evento A",
        date: new Date(),
        location: "Local A",
        capacity: 100,
        price: 20,
        organizerId,
      },
    });

    const eventB = await prisma.event.create({
      data: {
        title: "Evento B",
        date: new Date(),
        location: "Local B",
        capacity: 100,
        price: 25,
        organizerId,
      },
    });

    eventAId = eventA.id;
    eventBId = eventB.id;
  });

  afterAll(async () => {
    await prisma.ticket.deleteMany();
    await prisma.reservation.deleteMany();
    await prisma.event.deleteMany();
    await prisma.user.deleteMany();
    await prisma.$disconnect();
  });

  const createValidTicket = async (): Promise<{ id: string; code: string }> => {
    const reservation = await prisma.reservation.create({
      data: {
        userId: customerId,
        eventId: eventAId,
        quantity: 1,
        seatCode: "A-1",
        status: "CONFIRMED",
      },
    });

    const ticket = await prisma.ticket.create({
      data: {
        reservationId: reservation.id,
        eventId: eventAId,
        code: crypto.randomUUID(),
        status: "VALID",
      },
    });

    return {
      id: ticket.id,
      code: ticket.code,
    };
  };

  it("deve validar ingresso valido e marcar como utilizado", async () => {
    const ticket = await createValidTicket();

    const response = await request(app)
      .post("/tickets/validate-entry")
      .set("Authorization", `Bearer ${gatekeeperToken}`)
      .send({
        code: ticket.code,
        eventId: eventAId,
      })
      .expect(200);

    expect(response.body).toHaveProperty("status", "success");
    expect(response.body.data.validationStatus).toBe("VALID");

    const ticketFromDb = await prisma.ticket.findUnique({
      where: { id: ticket.id },
    });
    expect(ticketFromDb?.status).toBe("USED");
  });

  it("deve retornar ja utilizado quando o ingresso ja foi usado", async () => {
    const ticket = await createValidTicket();

    await request(app)
      .post("/tickets/validate-entry")
      .set("Authorization", `Bearer ${gatekeeperToken}`)
      .send({
        code: ticket.code,
        eventId: eventAId,
      })
      .expect(200);

    const response = await request(app)
      .post("/tickets/validate-entry")
      .set("Authorization", `Bearer ${gatekeeperToken}`)
      .send({
        code: ticket.code,
        eventId: eventAId,
      })
      .expect(200);

    expect(response.body.data.validationStatus).toBe("ALREADY_USED");
  });

  it("deve retornar evento errado quando o ingresso pertence a outro evento", async () => {
    const ticket = await createValidTicket();

    const response = await request(app)
      .post("/tickets/validate-entry")
      .set("Authorization", `Bearer ${gatekeeperToken}`)
      .send({
        code: ticket.code,
        eventId: eventBId,
      })
      .expect(200);

    expect(response.body.data.validationStatus).toBe("WRONG_EVENT");

    const ticketFromDb = await prisma.ticket.findUnique({
      where: { id: ticket.id },
    });
    expect(ticketFromDb?.status).toBe("VALID");
  });

  it("deve retornar invalido quando o codigo nao existe", async () => {
    const response = await request(app)
      .post("/tickets/validate-entry")
      .set("Authorization", `Bearer ${gatekeeperToken}`)
      .send({
        code: crypto.randomUUID(),
        eventId: eventAId,
      })
      .expect(200);

    expect(response.body.data.validationStatus).toBe("INVALID");
  });

  it("deve impedir validacao dupla concorrente do mesmo ingresso", async () => {
    const ticket = await createValidTicket();

    const [responseA, responseB] = await Promise.all([
      request(app)
        .post("/tickets/validate-entry")
        .set("Authorization", `Bearer ${gatekeeperToken}`)
        .send({
          code: ticket.code,
          eventId: eventAId,
        }),
      request(app)
        .post("/tickets/validate-entry")
        .set("Authorization", `Bearer ${gatekeeperToken}`)
        .send({
          code: ticket.code,
          eventId: eventAId,
        }),
    ]);

    const validationStatuses = [
      responseA.body.data.validationStatus,
      responseB.body.data.validationStatus,
    ].sort();

    expect(validationStatuses).toEqual(["ALREADY_USED", "VALID"]);

    const ticketFromDb = await prisma.ticket.findUnique({
      where: { id: ticket.id },
    });
    expect(ticketFromDb?.status).toBe("USED");
  });

  it("deve negar validacao para usuario sem role GATEKEEPER", async () => {
    const ticket = await createValidTicket();

    await request(app)
      .post("/tickets/validate-entry")
      .set("Authorization", `Bearer ${customerToken}`)
      .send({
        code: ticket.code,
        eventId: eventAId,
      })
      .expect(403);
  });
});
