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
    email: "john.doe@example.com",
    password: "password123",
    role: "CUSTOMER",
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
      expect(response.body.data.email).toBe(testUser.email);
      expect(response.body.data.role).toBe(testUser.role);
      expect(response.body.data).not.toHaveProperty("password");
      expect(response.body.data).toHaveProperty("createdAt");
      expect(response.body.data).toHaveProperty("updatedAt");
    });

    it("Deve falhar ao criar um novo usuário quando o nome estiver faltando", async () => {
      const response = await request(app)
        .post("/users")
        .send({
          email: "john.doe@example.com",
          password: "password123",
        })
        .expect(400);

      expect(response.body).toHaveProperty("status", "error");
      expect(response.body).toHaveProperty("message", "Validation failed");
      expect(response.body).toHaveProperty("errors");
      expect(response.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: "name",
            message: "Name is required",
          }),
        ]),
      );
    });

    it("Deve falhar ao criar um novo usuário quando o nome estiver vazio", async () => {
      const response = await request(app)
        .post("/users")
        .send({
          name: "",
          email: "john.doe@example.com",
          password: "password123",
        })
        .expect(400);

      expect(response.body).toHaveProperty("status", "error");
      expect(response.body).toHaveProperty("message", "Validation failed");
      expect(response.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: "name",
            message: "Name cannot be empty",
          }),
        ]),
      );
    });

    it("Deve falhar ao criar um novo usuário quando o email estiver faltando", async () => {
      const response = await request(app)
        .post("/users")
        .send({
          name: "John Doe",
          password: "password123",
        })
        .expect(400);

      expect(response.body).toHaveProperty("status", "error");
      expect(response.body).toHaveProperty("message", "Validation failed");
      expect(response.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: "email",
            message: "Email is required",
          }),
        ]),
      );
    });

    it("Deve falhar ao criar um novo usuário quando o formato do email for inválido", async () => {
      const response = await request(app)
        .post("/users")
        .send({
          name: "John Doe",
          email: "invalid-email",
          password: "password123",
        })
        .expect(400);

      expect(response.body).toHaveProperty("status", "error");
      expect(response.body).toHaveProperty("message", "Validation failed");
      expect(response.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: "email",
            message: "Invalid email format",
          }),
        ]),
      );
    });

    it("Deve falhar ao criar um novo usuário quando a senha estiver faltando", async () => {
      const response = await request(app)
        .post("/users")
        .send({
          name: "John Doe",
          email: "john.doe@example.com",
        })
        .expect(400);

      expect(response.body).toHaveProperty("status", "error");
      expect(response.body).toHaveProperty("message", "Validation failed");
      expect(response.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: "password",
            message: "Password is required",
          }),
        ]),
      );
    });

    it("Deve falhar ao criar um novo usuário quando a senha for muito curta", async () => {
      const response = await request(app)
        .post("/users")
        .send({
          name: "John Doe",
          email: "john.doe@example.com",
          password: "123",
        })
        .expect(400);

      expect(response.body).toHaveProperty("status", "error");
      expect(response.body).toHaveProperty("message", "Validation failed");
      expect(response.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: "password",
            message: "Password must be at least 6 characters long",
          }),
        ]),
      );
    });

    it("Deve falhar ao criar um novo usuário quando a role for inválida", async () => {
      const response = await request(app)
        .post("/users")
        .send({
          name: "John Doe",
          email: "john.doe@example.com",
          password: "password123",
          role: "INVALID_ROLE",
        })
        .expect(400);

      expect(response.body).toHaveProperty("status", "error");
      expect(response.body).toHaveProperty("message", "Validation failed");
      expect(response.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: "role",
          }),
        ]),
      );
    });

    it("Deve falhar ao criar um novo usuário quando o email já estiver em uso", async () => {
      await request(app).post("/users").send(testUser).expect(201);

      const response = await request(app)
        .post("/users")
        .send({
          ...testUser,
          name: "Other Name",
        })
        .expect(409);

      expect(response.body).toHaveProperty("status", "error");
      expect(response.body).toHaveProperty("message", "Email already in use");
    });
  });

  describe("GET /users", () => {
    it("Deve listar todos os usuários cadastrados", async () => {
      await request(app).post("/users").send(testUser).expect(201);
      await request(app)
        .post("/users")
        .send({
          name: "Jane Doe",
          email: "jane.doe@example.com",
          password: "password123",
          role: "ORGANIZER",
        })
        .expect(201);

      const response = await request(app).get("/users").expect(200);

      expect(response.body).toHaveProperty("status", "success");
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBe(2);
      expect(response.body.data[0]).not.toHaveProperty("password");
      expect(response.body.data[1]).not.toHaveProperty("password");
    });
  });

  describe("GET /users/:id", () => {
    it("Deve retornar o usuário correto quando o ID existir", async () => {
      const createResponse = await request(app)
        .post("/users")
        .send(testUser)
        .expect(201);

      const userId = createResponse.body.data.id;

      const response = await request(app).get(`/users/${userId}`).expect(200);

      expect(response.body).toHaveProperty("status", "success");
      expect(response.body.data).toHaveProperty("id", userId);
      expect(response.body.data.name).toBe(testUser.name);
      expect(response.body.data).not.toHaveProperty("password");
    });

    it("Deve retornar status 404 quando o ID não existir", async () => {
      const response = await request(app)
        .get("/users/non-existent-id")
        .expect(404);

      expect(response.body).toHaveProperty("status", "error");
      expect(response.body).toHaveProperty("message", "User not found");
    });
  });

  describe("PUT /users/:id", () => {
    it("Deve atualizar as informações do usuário com sucesso", async () => {
      const createResponse = await request(app)
        .post("/users")
        .send(testUser)
        .expect(201);

      const userId = createResponse.body.data.id;

      const response = await request(app)
        .put(`/users/${userId}`)
        .send({
          name: "John Updated",
          role: "ORGANIZER",
        })
        .expect(200);

      expect(response.body).toHaveProperty("status", "success");
      expect(response.body.data.name).toBe("John Updated");
      expect(response.body.data.role).toBe("ORGANIZER");
      expect(response.body.data).not.toHaveProperty("password");
    });

    it("Deve atualizar a senha do usuário com sucesso (gerando novo hash)", async () => {
      const createResponse = await request(app)
        .post("/users")
        .send(testUser)
        .expect(201);

      const userId = createResponse.body.data.id;

      const response = await request(app)
        .put(`/users/${userId}`)
        .send({
          password: "newpassword123",
        })
        .expect(200);

      expect(response.body).toHaveProperty("status", "success");
      expect(response.body.data).not.toHaveProperty("password");

      const userInDb = await prisma.user.findUnique({ where: { id: userId } });
      expect(userInDb).not.toBeNull();
      expect(userInDb!.password).not.toBe(testUser.password);
    });

    it("Deve falhar ao atualizar o e-mail para um e-mail já em uso", async () => {
      const user1 = await request(app)
        .post("/users")
        .send(testUser)
        .expect(201);
      const user2 = await request(app)
        .post("/users")
        .send({
          name: "Jane Doe",
          email: "jane.doe@example.com",
          password: "password123",
        })
        .expect(201);

      const userId = user2.body.data.id;

      const response = await request(app)
        .put(`/users/${userId}`)
        .send({
          email: testUser.email,
        })
        .expect(409);

      expect(response.body).toHaveProperty("status", "error");
      expect(response.body).toHaveProperty("message", "Email already in use");
    });

    it("Deve retornar status 404 para um ID inexistente", async () => {
      const response = await request(app)
        .put("/users/non-existent-id")
        .send({ name: "New Name" })
        .expect(404);

      expect(response.body).toHaveProperty("status", "error");
      expect(response.body).toHaveProperty("message", "User not found");
    });

    it("Deve falhar ao enviar dados com tipos inválidos", async () => {
      const createResponse = await request(app)
        .post("/users")
        .send(testUser)
        .expect(201);

      const userId = createResponse.body.data.id;

      const response = await request(app)
        .put(`/users/${userId}`)
        .send({
          role: "INVALID_ROLE",
        })
        .expect(400);

      expect(response.body).toHaveProperty("status", "error");
      expect(response.body).toHaveProperty("message", "Validation failed");
    });
  });

  describe("DELETE /users/:id", () => {
    it("Deve excluir o usuário com sucesso", async () => {
      const createResponse = await request(app)
        .post("/users")
        .send(testUser)
        .expect(201);

      const userId = createResponse.body.data.id;

      await request(app).delete(`/users/${userId}`).expect(204);

      const userInDb = await prisma.user.findUnique({ where: { id: userId } });
      expect(userInDb).toBeNull();
    });

    it("Deve retornar status 404 ao tentar excluir um usuário inexistente", async () => {
      const response = await request(app)
        .delete("/users/non-existent-id")
        .expect(404);

      expect(response.body).toHaveProperty("status", "error");
      expect(response.body).toHaveProperty("message", "User not found");
    });
  });
});
