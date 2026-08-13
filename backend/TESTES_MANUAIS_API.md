# Testes Manuais da API (Postman, Insomnia, Bruno ou curl)

Este guia cobre o fluxo completo e os cenários de teste manual atualizados da API.

---

## 1. Preparação do Ambiente

1. Suba o banco de dados via Docker Compose (raiz do projeto):

```bash
docker compose up --build postgres
```

2. Execute as migrações, geração do Prisma Client e o Seed:

```bash
pnpm db:generate
pnpm db:push
pnpm prisma db seed
```

3. Inicie o servidor de desenvolvimento backend:

```bash
pnpm dev
```

Base URL: `http://localhost:3000`

---

## 2. Usuários Pré-Cadastrados pelo Seed

- **Organizador**: `organizer@example.com` / `password123` (`ROLE: ORGANIZER`)
- **Cliente 1**: `customer@example.com` / `password123` (`ROLE: CUSTOMER`)
- **Cliente 2**: `customer2@example.com` / `password123` (`ROLE: CUSTOMER`)
- **Portaria**: `gatekeeper@example.com` / `password123` (`ROLE: GATEKEEPER`)

---

## 3. Fluxo de Autenticação

### Login de Usuário

`POST /users/login`

**Body**:

```json
{
  "email": "organizer@example.com",
  "password": "password123"
}
```

_Armazene o `data.token` gerado nos headers `Authorization: Bearer <TOKEN>` das requisições subsequentes._

---

## 4. Gestão de Eventos e TMDB (`ORGANIZER`)

### Consultar Filmes Populares do TMDB

`GET /tmdb/popular?page=1`

- Header: `Authorization: Bearer <ORGANIZER_TOKEN>`

### Criar Evento

`POST /events`

- Header: `Authorization: Bearer <ORGANIZER_TOKEN>`

**Body (Com referência ao TMDB)**:

```json
{
  "title": "Avatar: O Caminho da Água",
  "date": "2026-12-31T20:00:00Z",
  "location": "Cinema IMAX Sala 1",
  "capacity": 50,
  "price": 45.0,
  "externalRef": "76600"
}
```

### Listar Eventos (Público / Cliente)

`GET /events`

---

## 5. Fluxo de Reserva e Seleção de Assentos (`CUSTOMER`)

### Criar Reserva de Assento

`POST /reservations`

- Header: `Authorization: Bearer <CUSTOMER_TOKEN>`

_Nota: O `seatCode` deve seguir o padrão `Fila-Número` (ex: `A-1`, `A-10`, `B-5`) e estar dentro da capacidade do evento (50 lugares = Filas A a E)._

**Body**:

```json
{
  "eventId": "<ID_DO_EVENTO>",
  "quantity": 1,
  "seatCode": "A-1"
}
```

### Checkout Simulado

`POST /reservations/:id/checkout`

- Header: `Authorization: Bearer <CUSTOMER_TOKEN>`

**Body (Confirmação)**:

```json
{
  "decision": "CONFIRM"
}
```

**Body (Recusa)**:

```json
{
  "decision": "DECLINE"
}
```

---

## 6. Gestão e Compartilhamento de Ingressos (`CUSTOMER`)

### Meus Ingressos

`GET /tickets/me`

- Header: `Authorization: Bearer <CUSTOMER_TOKEN>`

_Retorna a lista de ingressos do cliente com `id`, `code` (UUID) e `shareLink`._

### Acessar Ingresso Compartilhado (Público)

`GET /tickets/shared/:id?token=<HMAC_TOKEN>`

---

## 7. Validação de Portaria (`GATEKEEPER`)

### Validar Entrada na Portaria

`POST /tickets/validate-entry`

- Header: `Authorization: Bearer <GATEKEEPER_TOKEN>`

**Body**:

```json
{
  "code": "<UUID_DO_INGRESSO>",
  "eventId": "<ID_DO_EVENTO>"
}
```

**Respostas Possíveis (`validationStatus`)**:

- `VALID`: Entrada liberada, status do ingresso alterado para `USED`.
- `ALREADY_USED`: Ingresso já foi utilizado anteriormente.
- `WRONG_EVENT`: Ingresso pertence a outro evento.
- `INVALID`: Código de ingresso inexistente.
