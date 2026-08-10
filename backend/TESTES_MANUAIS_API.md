# Testes Manuais da API (Postman, Insomnia ou curl)

Este guia cobre o fluxo completo e os cenarios de portaria.

## 1. Preparacao

1. Suba o banco:

```bash
docker compose up -d
```

2. Prepare prisma e seed:

```bash
pnpm db:generate
pnpm db:push
pnpm prisma db seed
```

3. Rode a API:

```bash
pnpm dev
```

Base URL sugerida:

- `http://localhost:3000`

Use Postman ou Insomnia para criar uma collection com variaveis de ambiente, eu usei o Bruno com as seguintes variaveis:

```text
  base_url
  CUSTOMER_TOKEN
  id_user
  id_reservation
  id_event
  id_ticket
  ORGANIZER_TOKEN
  GATEKEEPER_TOKEN
  organizer_email
  customer1_email
  gatekeeper_email
  share_link
  ticket_code
```

Ajuda bastante para manter o fluxo de testes manual organizado e com menos chance de erro.

## 2. Login e Tokens

`POST /users/login`

- script: Assim que usuários forem logados, guarde os tokens nas variaveis de ambiente. Eu seto o token que vem do data para todos os perfil para que sempre tenha token nas variaveis de ambiente, mas o ideal é setar cada token no perfil correto. Se um usuário ORGANIZER logar, o token dele vai para variavel ORGANIZER_TOKEN, CUSTOMER... e GATEKEEPER.

```js
const body = res.getBody();

bru.setEnvVar("ORGANIZER_TOKEN", body.data.token);
bru.setEnvVar("CUSTOMER_TOKEN", body.data.token);
bru.setEnvVar("GATEKEEPER_TOKEN", body.data.token);
```

Body:

```json
{
  "email": "{{organizer_email}}",
  "password": "password123"
}
```

Guarde `data.token` como `ORGANIZER_TOKEN`.

O seed gera 3 users, armazene os emails nas variaveis de ambiente. Eu fiz um login para cada usuário.

## 3 Body dos endpoints de user:

- `POST /users/login`
- `POST /users`
- `GET /users`
- `GET /users/:id`
- `PUT /users/:id`
- `DELETE /users/:id`

- Criar usuário: POST /users

```js
{{base_url}}/users
```

```json
{
  "email": "r@example.com",
  "name": "Rafael Organizer",
  "password": "password123",
  "role": "ORGANIZER"
}
```

- Listar todos os usuários: GET /users

```js
{{base_url}}/users
```

- Listar usuário por id: GET /users/:id

```js
{{base_url}}/users/{{id_user}}
```

- Atualizar usuário: PUT /users/:id

```js
{{base_url}}/users/{{id_user}}
```

```json
{
  "email": "r@g.com",
  "name": "Rafael Organizer",
  "password": "password123",
  "role": "ORGANIZER"
}
```

- Deletar usuário: DELETE /users/:id

```js
{{base_url}}/users/{{id_user}}
```

## 4 Body dos endpoints de event:

- `POST /events` (ORGANIZER)
- `GET /events`
- `GET /events/:id`

1. Criar evento: POST /events

```js
{{base_url}}/events
```

```json
{
  "title": "Teste",
  "date": "2026-12-31T20:00:00Z",
  "location": "Estádio Nacional",
  "capacity": 50000,
  "price": 150.0,
  "organizerId": "{{id_user}}"
}
```

2. Listar eventos: GET /events

```js
{{base_url}}/events
```

3. Listar evento por id: GET /events/:id

```js
{{base_url}}/events/{{id_event}}
```

## 5 Body dos endpoints de reservation:

- `POST /reservations` (CUSTOMER)
- `POST /reservations/:id/checkout` (CUSTOMER)

1. Criar reserva: POST /reservations

```js
{{base_url}}/reservations
```

```json
{
  "eventId": "{{id_event}}",
  "quantity": 1,
  "seatCode": "A-10"
}
```

2. Checkout confirmado: POST /reservations/:id/checkout

```js
{{base_url}}/reservations/{{id_reservation}}/checkout
```

```json
{
  "decision": "CONFIRM"
}

// ou

{
  "decision": "DECLINE"
}
```

## 6 body dos endpoints de ticket:

- `GET /tickets/me` (CUSTOMER)
- `GET /tickets/shared/:id?token=...`
- `POST /tickets/validate-entry` (GATEKEEPER)

1. Listar meus ingressos: GET /tickets/me

```js
{{base_url}}/tickets/me
```

2. Abrir ingresso compartilhado: GET /tickets/shared/:id?token=...

```
{{base_url}}{{share_link}}
```

3. Validar ingresso na portaria: POST /tickets/validate-entry

```js
{{base_url}}/tickets/validate-entry
```

```json
{
  "code": "{{ticket_code}}",
  "eventId": "{{id_event}}"
}
```
