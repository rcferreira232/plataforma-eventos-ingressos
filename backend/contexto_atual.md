# Contexto Atual do Projeto - Plataforma de Eventos e Ingressos

Este documento resume a estrutura atual do backend, as entidades configuradas, as rotas disponíveis e os padrões adotados. Pode ser utilizado como contexto em novos prompts.

---

## Tecnogias e Infraestrutura

- **Runtime & Linguagem**: Node.js + TypeScript (ESM)
- **Framework Web**: Express (Arquitetura MVC: Rotas -> Middlewares -> Controllers -> Services -> Repositories -> Prisma ORM)
- **Banco de Dados**: PostgreSQL + Prisma ORM (utilizando o adaptador `@prisma/adapter-pg`)
- **Validação**: Zod com middleware reutilizável (`validate-middleware.ts`)
- **Autenticação**: JWT (`jsonwebtoken`) com middleware de autorização baseado em papéis (RBAC - `auth-middleware.ts`)
- **Criptografia de Senhas**: `crypto.pbkdf2Sync` (salt + hash armazenados em `password`)
- **Testes**: Jest + Supertest (executados com suporte a ESM `--experimental-vm-modules`)
- **Integração Externa**: TMDB (The Movie Database) para catálogo de filmes/eventos (`tmdb-service.ts`)

---

## Padrões de Código e Convenções

1. **Nomenclatura de Métodos/Verbos**:
   - Para buscas/leituras: utiliza o prefixo `get` (`getAll`, `getById`, `getByEmail`) em vez de `list` ou `find`.
   - Para atualização total/parcial: utilização do verbo HTTP `PUT` em rotas de atualização.
   - Evitar o uso de `else` para manter o fluxo de controle limpo (early return).
   - Código autoexplicativo, evitando comentários desnecessários.

2. **Tratamento de Erros Centralizado**:
   - `errorHandler` em `src/middlewares/error-middleware.ts`.
   - Classes personalizadas estendendo `AppError`: `BadRequestError` (400), `UnauthorizedError` (401), `ForbiddenError` (403), `NotFoundError` (404), `ConflictError` (409) e `InternalServerError` (500).

3. **Validação de Requisições**:
   - Middleware `validate(schema)` intercepta o `req.body`, aplica a validação Zod e sobrescreve `req.body` com os dados sanitizados.

4. **Autenticação e RBAC**:
   - Middleware `authMiddleware(allowedRoles?: Role[])` valida o header `Authorization: Bearer <token>`, popula `req.user` (`{ id, email, role }`) e valida se a role do usuário possui acesso.

5. **Controle de Concorrência e Transações (Crítico)**:
   - Operações financeiras ou de reserva de lugares utilizam obrigatoriamente o `$transaction` do Prisma.
   - Uso de `Prisma.TransactionIsolationLevel.Serializable` e raw queries com `FOR UPDATE` (ex: lock na tabela `Event` durante a criação de reservas) para evitar condições de corrida (race conditions) e overbooking.
   - Checkout simulado também utiliza transação serializável com lock `FOR UPDATE` na tabela `Reservation`, garantindo emissão única de ingressos.
   - Portaria utiliza transação serializável com lock `FOR UPDATE` na tabela `Ticket` para marcar ingresso como `USED` no mesmo instante da validação.
   - **Garantia de Banco de Dados**: Utilização de constraint composta `@@unique([eventId, seatCode])` no schema para impedir assentos duplicados.
   - Captura de erros nativos do Prisma (ex: `P2002` disparado pela constraint de unicidade) traduzidos para `ConflictError`.

---

## Modelo de Dados (Prisma Schema)

### Papéis de Usuário (`Role`)

- `ORGANIZER`: Organizador de eventos.
- `CUSTOMER`: Cliente final/Comprador.
- `GATEKEEPER`: Portaria / Validador de ingressos.

### Entidades

1. **User**:
   - `id` (String / UUID/CUID)
   - `name` (String)
   - `email` (String, único)
   - `password` (String, salt:hash)
   - `role` (Enum `Role`, padrão `CUSTOMER`)

2. **Event**:
   - `id` (String)
   - `title` (String)
   - `date` (DateTime)
   - `location` (String)
   - `capacity` (Int)
   - `price` (Float)
   - `externalRef` (String?, referência opcional ao TMDB)
   - `organizerId` (String, FK -> `User`)

3. **Reservation**:
   - `id` (String, `@default(cuid())`)
   - `quantity` (Int)
   - `seatCode` (String?, opcional)
   - `status` (Enum `ReservationStatus`: `PENDING`, `CONFIRMED`, `CANCELLED` | Padrão: `PENDING`)
   - `userId` (String, FK -> `User`)
   - `eventId` (String, FK -> `Event`)
   - `createdAt` (DateTime, padrão: `now()`)
   - `updatedAt` (DateTime, `@updatedAt`)
   - **Constraints e Índices**:
     - `@@unique([eventId, seatCode])`: Previne reserva em duplicidade do mesmo assento no mesmo evento.
     - `@@index([eventId])` e `@@index([userId])`: Otimização de consultas para listagem de reservas.

4. **Ticket**:
   - `id` (String)
   - `reservationId` (String, FK -> `Reservation`)
   - `eventId` (String, FK -> `Event`)
   - `code` (String, único - UUID v4 para QR Code)
   - `status` (Enum `TicketStatus`: `VALID`, `USED`, `CANCELLED`)
   - Compartilhamento com token HMAC SHA-256 (`/tickets/shared/:id?token=...`) para evitar falsificação de links.

---

## Rotas Implementadas

### Usuários e Autenticação (`/users`)

- `POST /users/login`: Autentica usuário com email e senha, retornando token JWT.
- `POST /users`: Cria novo usuário (validação com Zod).
- `GET /users`: Lista todos os usuários (sem a senha).
- `GET /users/:id`: Busca usuário pelo ID.
- `PUT /users/:id`: Atualiza dados/senha de um usuário.
- `DELETE /users/:id`: Exclui usuário pelo ID.

### Eventos (`/events`)

- `POST /events`: Cria novo evento (**Restrito a `ORGANIZER`** via JWT). Opcionalmente valida `externalRef` na API do TMDB.
- `GET /events`: Lista todos os eventos cadastrados (inclui dados do organizador). Funciona como catálogo para o Cliente.
- `GET /events/:id`: Busca evento pelo ID.

### Reservas (`/reservations`)

- `POST /reservations`: Cria uma nova reserva de ingressos (por quantidade de pista ou seleção de assento via `seatCode`). Requer autenticação de `CUSTOMER`. Possui controle de transação, constraint de unicidade no banco (`@@unique([eventId, seatCode])`) e lock (`FOR UPDATE`) contra concorrência para evitar overbooking e double-booking de assentos.
- `POST /reservations/:id/checkout`: Endpoint de checkout simulado para confirmar (`CONFIRM`) ou recusar (`DECLINE`) pagamento. Em confirmação, atualiza reserva para `CONFIRMED` e emite ingressos `VALID`; em recusa, atualiza para `CANCELLED` e não gera ingressos.

### Ingressos (`/tickets`)

- `GET /tickets/me`: Área "Meus Ingressos" do cliente autenticado (`CUSTOMER`), retornando os ingressos com dados do evento e `shareLink`.
- `GET /tickets/shared/:id?token=...`: Visualização pública de ingresso via link compartilhável assinado com HMAC.
- `POST /tickets/validate-entry`: Endpoint da Portaria (`GATEKEEPER`) para validação de ingresso por `code` e `eventId`.
  - Retorno claro via `validationStatus`: `VALID`, `INVALID`, `ALREADY_USED`, `WRONG_EVENT`.
  - Em caso `VALID`, o ingresso é atualizado para `USED` de forma atômica na mesma transação.

---

## Status Atual e Testes

- **Typecheck**: `pnpm typecheck` zerado.
- **Suíte de Testes**: Testes de integração passando (`pnpm test`), agora cobrindo:
  - `user.test.ts`: Autenticação e CRUD.
  - `event.test.ts`: Criação e listagem.
  - `reservation.test.ts`: Concorrência de reservas, checkout simulado (confirmação/recusa), emissão segura de ingressos (UUID v4), rota "Meus Ingressos", compartilhamento de ingresso e bloqueio de checkout por usuário não proprietário.
  - `gatekeeper-validation.test.ts`: Fluxo completo da portaria (`VALID`, `INVALID`, `ALREADY_USED`, `WRONG_EVENT`), concorrência para impedir validação dupla e verificação de RBAC para role `GATEKEEPER`.
- **Seed Script**: `prisma/seed.ts` configurado via `prisma.config.ts` populando dados iniciais (1 Organizador, 2 Clientes, 1 Portaria e 1 Evento).

## Documentação

- `README.md`: passo a passo de configuração, banco, seed, execução e testes automatizados.
- `TESTES_MANUAIS_API.md`: roteiro de testes manuais da API (Postman/Insomnia/curl), incluindo fluxo de portaria.

---

## Prompts usados

### Prompt 1:

Expansão do Schema e Validações Base
Objetivo: Completar o banco de dados e adicionar a camada de validação que faltou no setup inicial.
Atue como um Desenvolvedor Backend Sênior especialista em Node.js e TypeScript. O projeto já possui a infraestrutura básica configurada (Express, TypeScript, Prisma com PostgreSQL, Jest/Supertest e middleware de erro centralizado). O CRUD da entidade User já está com uma implementação básica seguindo o padrão MVC.
Tarefas desta etapa:

1. Atualize o arquivo schema.prisma para incluir as seguintes entidades e suas relações com a entidade User já existente: Eventos, Reservas/Assentos e Ingressos.
2. Crie um middleware de validação de requisições utilizando o Zod.
3. Crie um script seed.ts para popular o banco de dados.

### Prompt 2:

Autenticação e Integração Externa (Organizador)
Objetivo: Proteger as rotas e conectar a plataforma com o catálogo de shows/filmes.
Tarefas desta etapa:

1. Implemente o middleware de autenticação (ex: JWT) que valide adequadamente os três papéis do sistema.
2. Crie um serviço utilitário para consumir a API externa do TMDB ou Ticketmaster Discovery.
3. Desenvolva o Controller e o Model para a criação e gerenciamento de Eventos pelo Organizador.
4. Crie um teste de integração (Jest + Supertest) isolado para a rota de criação de eventos.

### Prompt 3:

Busca de Eventos e Sistema de Reservas (Cliente)

Objetivo: Implementar a parte mais crítica do sistema, garantindo a integridade dos assentos.

Agora vamos construir o fluxo de navegação e reserva de ingressos para o Cliente.

Tarefas desta etapa:

1. Crie a rota e o Controller para o Cliente listar/buscar os eventos publicados.
2. Desenvolva a lógica de reserva no Model (seleção de lugar no mapa ou quantidade de pista).
3. Requisito Crítico: Utilize obrigatoriamente o controle de transações do Prisma para garantir que o mesmo lugar não seja vendido ou reservado duas vezes.
4. Escreva testes de integração que foquem em cenários de concorrência (ex: duas requisições simultâneas tentando reservar o mesmo assento exato).
5. Retorne os Controllers, Models e Testes de integração relacionados exclusivamente ao fluxo de listagem e reserva de assentos.

### Prompt 4:

Checkout Simulado, Emissão e Visualização

Objetivo: Finalizar a compra do cliente e gerar os artefatos.

Com a reserva garantida, precisamos processar o pagamento e emitir os ingressos.

Tarefas desta etapa:

1. Crie um endpoint de pagamento simulado que aceite confirmação ou recusa.
2. Em caso de pagamento confirmado, atualize a reserva e gere o(s) Ingresso(s) no banco de dados.
3. O código do ingresso gerado deve ser impossível de ser forjado (ex: UUID v4 ou hash seguro).
4. Crie a lógica para que o cliente possa compartilhar o ingresso via um link gerado pela aplicação.
5. Crie a rota da área "Meus Ingressos" para exibição ao cliente.

Retorne os Controllers e Models responsáveis pelo pagamento simulado, pela emissão segura dos ingressos e pelas rotas de visualização do cliente.

### Prompt 5:

Validação da Portaria e Fechamento

Objetivo: Garantir a entrada segura no evento e documentar a solução.

Tarefas desta etapa:

1. Desenvolver endpoint da Portaria para validação de ingresso.
2. Retorno claro para válido, inválido, já utilizado e evento errado.
3. Utilizar transações no Prisma para impedir validação dupla.
4. Escrever testes de integração de todos os cenários de portaria.
5. Criar documentação de setup e execução (`README.md`) e guia de testes manuais (`TESTES_MANUAIS_API.md`).
