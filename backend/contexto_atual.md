# Contexto Atual do Projeto - Backend (Plataforma de Eventos e Ingressos)

Este documento resume a estrutura atual do backend, as entidades configuradas, as rotas disponíveis, o modelo de assentos e o status da suíte de testes.

---

## Tecnologias e Infraestrutura

- **Runtime & Linguagem**: Node.js + TypeScript (ESM)
- **Framework Web**: Express (Arquitetura MVC: Rotas -> Middlewares -> Controllers -> Services -> Repositories -> Prisma ORM)
- **Banco de Dados**: PostgreSQL + Prisma ORM (utilizando o adaptador `@prisma/adapter-pg`)
- **Validação**: Zod com middleware reutilizável (`validate-middleware.ts`) e schemas strict (`/schemas`).
- **Autenticação**: JWT (`jsonwebtoken`) com middleware de autorização baseado em papéis (RBAC - `auth-middleware.ts`).
- **Criptografia de Senhas**: `crypto.pbkdf2Sync` (salt + hash armazenados em `password`).
- **Testes**: Jest + Supertest (suíte 100% passando).
- **Integração Externa**: TMDB (The Movie Database) para catálogo de filmes e criação rápida de eventos (`tmdb-service.ts`).

---

## Arquitetura de Seleção de Assentos e Concorrência

1. **Geração Dinâmica de Assentos (`seat-utils.ts`)**:
   - Mapeia fileiras (`A`, `B`, ..., `Z`, `AA`) e assentos por fileira (padrão 10 assentos/fileira).
   - Valida se o `seatCode` (ex: `A-1`, `A-10`, `B-5`) está dentro da capacidade total do evento através da função `isSeatWithinCapacity`.
   - Formato regex obrigatório: `/^[A-Z]+-\d+$/`.

2. **Garantia de Concorrência & Overbooking**:
   - Operação de reserva realizada dentro de transação serializável Prisma (`Prisma.TransactionIsolationLevel.Serializable`).
   - Bloqueio pessimista do evento via `SELECT ... FOR UPDATE`.
   - Constraint composta no schema Prisma: `@@unique([eventId, seatCode])`.
   - Tratamento de erro `P2002` para conflitos de assentos já reservados.

3. **Checkout e Emissão de Ingressos**:
   - Endpoint de checkout com decisão `CONFIRM` ou `DECLINE`.
   - Bloqueio pessimista da reserva via `SELECT ... FOR UPDATE` para evitar duplo checkout.
   - Emissão de ingressos com código único UUID v4 (`crypto.randomUUID()`).

4. **Portaria (`GATEKEEPER`) e Validação**:
   - Validação atômica e alteração de status do ingresso de `VALID` para `USED`.
   - Proteção contra dupla entrada simultânea com lock de linha na tabela `Ticket`.

---

## Modelo de Dados (Prisma Schema)

### Enum Roles
- `ORGANIZER`: Cria eventos e visualiza dados do catálogo/TMDB.
- `CUSTOMER`: Reserva assentos, realiza checkout e gerencia seus ingressos.
- `GATEKEEPER`: Valida ingressos na portaria.

### Entidades Core
1. **User**: `id`, `name`, `email` (único), `password`, `role`.
2. **Event**: `id`, `title`, `date`, `location`, `capacity`, `price`, `externalRef`, `organizerId`.
3. **Reservation**: `id`, `quantity`, `seatCode`, `status` (`PENDING`, `CONFIRMED`, `CANCELLED`), `userId`, `eventId`.
   - Constraints: `@@unique([eventId, seatCode])`.
4. **Ticket**: `id`, `reservationId`, `eventId`, `code` (UUID v4), `status` (`VALID`, `USED`, `CANCELLED`).
   - Token de compartilhamento HMAC SHA-256 (`/tickets/shared/:id?token=...`).

---

## Endpoints da API

- `POST /users/login`: Autentica usuário e retorna JWT.
- `POST /users`, `GET /users`, `GET /users/:id`, `PUT /users/:id`, `DELETE /users/:id`: CRUD de usuários.
- `POST /events` (`ORGANIZER`), `GET /events`, `GET /events/:id`: Gestão de eventos.
- `GET /tmdb/popular` (`ORGANIZER`): Consulta filmes populares na API do TMDB.
- `POST /reservations` (`CUSTOMER`): Reserva assento com validação de `seatCode`.
- `POST /reservations/:id/checkout` (`CUSTOMER`): Confirma ou recusa a compra.
- `GET /tickets/me` (`CUSTOMER`): Ingressos do usuário com `shareLink`.
- `GET /tickets/shared/:id?token=...`: Visualização pública de ingresso assinado.
- `POST /tickets/validate-entry` (`GATEKEEPER`): Validação de portaria.

---

## Status dos Testes Automáticos

- **Resultado**: 5/5 Suítes Passando, 41/41 Testes Passando.
- **Cobertura de Testes**:
  - `user.test.ts`: 18 testes de CRUD e validações de input.
  - `event.test.ts`: 5 testes de criação e listagem por permissão.
  - `tmdb-event.test.ts`: 3 testes de integração com TMDB.
  - `reservation.test.ts`: 8 testes de concorrência, reserva de assentos e checkout.
  - `gatekeeper-validation.test.ts`: 6 testes de validação de portaria e prevenção de dupla entrada.
