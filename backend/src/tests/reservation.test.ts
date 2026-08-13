import request from "supertest";
import jwt from "jsonwebtoken";
import app from "@/app";
import { prisma } from "@/libs/prisma";
import { env } from "@/config/env";

describe("Testes de Integração de Reserva", () => {
  let customerToken: string;
  let secondCustomerToken: string;
  let eventId: string;
  let reservationToConfirmId: string;
  let reservationToDeclineId: string;

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

    const secondCustomer = await prisma.user.create({
      data: {
        name: "Second Customer",
        email: "customer2@example.com",
        password: "hashedpassword123",
        role: "CUSTOMER",
      },
    });

    customerToken = jwt.sign(
      { id: customer.id, email: customer.email, role: customer.role },
      env.jwtSecret,
    );

    secondCustomerToken = jwt.sign(
      {
        id: secondCustomer.id,
        email: secondCustomer.email,
        role: secondCustomer.role,
      },
      env.jwtSecret,
    );

    const event = await prisma.event.create({
      data: {
        title: "Evento Concorrente",
        date: new Date(),
        location: "Arena Central",
        capacity: 20,
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

  it("deve confirmar o checkout, atualizar reserva e emitir ingressos com codigo seguro", async () => {
    const createReservationResponse = await request(app)
      .post("/reservations")
      .set("Authorization", `Bearer ${customerToken}`)
      .send({
        eventId,
        quantity: 1,
        seatCode: "A-2",
      })
      .expect(201);

    reservationToConfirmId = createReservationResponse.body.data.id;

    const checkoutResponse = await request(app)
      .post(`/reservations/${reservationToConfirmId}/checkout`)
      .set("Authorization", `Bearer ${customerToken}`)
      .send({
        decision: "CONFIRM",
      })
      .expect(200);

    expect(checkoutResponse.body).toHaveProperty("status", "success");
    expect(checkoutResponse.body.data.reservation.status).toBe("CONFIRMED");
    expect(checkoutResponse.body.data.tickets).toHaveLength(1);

    const createdTickets = checkoutResponse.body.data.tickets as Array<{
      code: string;
    }>;

    for (const ticket of createdTickets) {
      expect(ticket.code).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
      );
    }

    const ticketsFromDb = await prisma.ticket.findMany({
      where: {
        reservationId: reservationToConfirmId,
      },
    });

    expect(ticketsFromDb).toHaveLength(1);
  });

  it("deve recusar o checkout e cancelar a reserva sem emitir ingressos", async () => {
    const createReservationResponse = await request(app)
      .post("/reservations")
      .set("Authorization", `Bearer ${customerToken}`)
      .send({
        eventId,
        quantity: 1,
        seatCode: "A-3",
      })
      .expect(201);

    reservationToDeclineId = createReservationResponse.body.data.id;

    const checkoutResponse = await request(app)
      .post(`/reservations/${reservationToDeclineId}/checkout`)
      .set("Authorization", `Bearer ${customerToken}`)
      .send({
        decision: "DECLINE",
      })
      .expect(200);

    expect(checkoutResponse.body).toHaveProperty("status", "success");
    expect(checkoutResponse.body.data.reservation.status).toBe("CANCELLED");
    expect(checkoutResponse.body.data.tickets).toHaveLength(0);

    const ticketsFromDb = await prisma.ticket.findMany({
      where: {
        reservationId: reservationToDeclineId,
      },
    });

    expect(ticketsFromDb).toHaveLength(0);
  });

  it("deve exibir os ingressos na area Meus Ingressos com link de compartilhamento", async () => {
    const myTicketsResponse = await request(app)
      .get("/tickets/me")
      .set("Authorization", `Bearer ${customerToken}`)
      .expect(200);

    expect(myTicketsResponse.body).toHaveProperty("status", "success");
    expect(Array.isArray(myTicketsResponse.body.data)).toBe(true);
    expect(myTicketsResponse.body.data.length).toBeGreaterThan(0);

    const firstTicket = myTicketsResponse.body.data[0] as {
      id: string;
      shareLink: string;
    };

    expect(firstTicket.id).toBeDefined();
    expect(firstTicket.shareLink).toMatch(/^\/tickets\/shared\/.+\?token=/);
  });

  it("deve permitir compartilhamento via link e negar token invalido", async () => {
    const myTicketsResponse = await request(app)
      .get("/tickets/me")
      .set("Authorization", `Bearer ${customerToken}`)
      .expect(200);

    const firstTicket = myTicketsResponse.body.data[0] as {
      id: string;
      shareLink: string;
    };

    const shareUrl = new URL(`http://localhost${firstTicket.shareLink}`);
    const token = shareUrl.searchParams.get("token");
    if (!token) {
      throw new Error("Expected share token in generated link");
    }

    const sharedTicketResponse = await request(app)
      .get(`/tickets/shared/${firstTicket.id}`)
      .query({ token })
      .expect(200);

    expect(sharedTicketResponse.body).toHaveProperty("status", "success");
    expect(sharedTicketResponse.body.data.id).toBe(firstTicket.id);

    await request(app)
      .get(`/tickets/shared/${firstTicket.id}`)
      .query({ token: "invalid-token" })
      .expect(403);
  });

  it("deve impedir checkout de reserva de outro cliente", async () => {
    const createReservationResponse = await request(app)
      .post("/reservations")
      .set("Authorization", `Bearer ${customerToken}`)
      .send({
        eventId,
        quantity: 1,
        seatCode: "A-4",
      })
      .expect(201);

    const foreignReservationId = createReservationResponse.body.data
      .id as string;

    await request(app)
      .post(`/reservations/${foreignReservationId}/checkout`)
      .set("Authorization", `Bearer ${secondCustomerToken}`)
      .send({
        decision: "CONFIRM",
      })
      .expect(403);
  });
});
