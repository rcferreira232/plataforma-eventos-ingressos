import { prisma } from "../src/libs/prisma.js";
import crypto from "crypto";

async function main() {
  console.log("Starting seed...");

  const hashPassword = (password: string) => {
    const salt = crypto.randomBytes(16).toString("hex");
    const hash = crypto
      .pbkdf2Sync(password, salt, 1000, 64, "sha512")
      .toString("hex");
    return `${salt}:${hash}`;
  };

  const organizer = await prisma.user.upsert({
    where: { email: "organizer@example.com" },
    update: {},
    create: {
      email: "organizer@example.com",
      name: "Alice Organizer",
      password: hashPassword("password123"),
      role: "ORGANIZER",
    },
  });
  console.log(`Created Organizer: ${organizer.email}`);

  const customer1 = await prisma.user.upsert({
    where: { email: "customer1@example.com" },
    update: {},
    create: {
      email: "customer1@example.com",
      name: "Bob Customer",
      password: hashPassword("password123"),
      role: "CUSTOMER",
    },
  });
  console.log(`Created Customer 1: ${customer1.email}`);

  const customer2 = await prisma.user.upsert({
    where: { email: "customer2@example.com" },
    update: {},
    create: {
      email: "customer2@example.com",
      name: "Charlie Customer",
      password: hashPassword("password123"),
      role: "CUSTOMER",
    },
  });
  console.log(`Created Customer 2: ${customer2.email}`);

  const gatekeeper = await prisma.user.upsert({
    where: { email: "gatekeeper@example.com" },
    update: {},
    create: {
      email: "gatekeeper@example.com",
      name: "Dave Gatekeeper",
      password: hashPassword("password123"),
      role: "GATEKEEPER",
    },
  });
  console.log(`Created Gatekeeper: ${gatekeeper.email}`);

  const existingEvent = await prisma.event.findFirst({
    where: { organizerId: organizer.id },
  });

  if (!existingEvent) {
    const event = await prisma.event.create({
      data: {
        title: "Super Mega Festival 2026",
        date: new Date("2026-12-31T20:00:00Z"),
        location: "Estádio Nacional",
        capacity: 50000,
        price: 150.0,
        externalRef: "tm-123456",
        organizerId: organizer.id,
      },
    });
    console.log(`Created Event: ${event.title}`);
  } else {
    console.log(`Event already exists: ${existingEvent.title}`);
  }

  console.log("Seed completed!");
}

main()
  .catch((e) => {
    console.error("Error during seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
