import request from "supertest";
import { app } from "@/app";
import { prisma } from "@/libs/prisma";

describe("Testes de Integração de Usuário", () => {
  beforeEach(async () => {
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await prisma.user.deleteMany();
    await prisma.$disconnect();
  });

  const testUser = {
    name: "John Doe",
  };

  describe("POST /users", () => {
    it("Deve criar um novo usuário com sucesso", async () => {
      const response = await request(app)
        .post("/users")
        .send(testUser)
        .expect(201);

      expect(response.body).toHaveProperty("status", "success");
      expect(response.body.data).toHaveProperty("id");
      expect(response.body.data.name).toBe(testUser.name);
      expect(response.body.data).toHaveProperty("createdAt");
      expect(response.body.data).toHaveProperty("updatedAt");
    });

    it("Deve falhar ao criar um novo usuário quando o nome estiver faltando", async () => {
      const response = await request(app).post("/users").send({}).expect(400);

      expect(response.body).toHaveProperty("status", "error");
      expect(response.body).toHaveProperty("message", "Validation failed");
      expect(response.body).toHaveProperty("errors");
      expect(Array.isArray(response.body.errors)).toBe(true);
      expect(response.body.errors[0]).toEqual(
        expect.objectContaining({
          path: "name",
        }),
      );
    });

    it("Deve falhar ao criar um novo usuário quando o nome estiver vazio", async () => {
      const response = await request(app)
        .post("/users")
        .send({ name: "" })
        .expect(400);

      expect(response.body).toHaveProperty("status", "error");
      expect(response.body).toHaveProperty("message", "Validation failed");
      expect(response.body).toHaveProperty("errors");
      expect(Array.isArray(response.body.errors)).toBe(true);
      expect(response.body.errors[0]).toEqual(
        expect.objectContaining({
          path: "name",
          message: "Name cannot be empty",
        }),
      );
    });

    it("Deve falhar ao criar um novo usuário quando o nome não for uma string", async () => {
      const response = await request(app)
        .post("/users")
        .send({ name: 123 })
        .expect(400);

      expect(response.body).toHaveProperty("status", "error");
      expect(response.body).toHaveProperty("message", "Validation failed");
      expect(response.body).toHaveProperty("errors");
      expect(Array.isArray(response.body.errors)).toBe(true);
      expect(response.body.errors[0].path).toBe("name");
    });
  });
});
