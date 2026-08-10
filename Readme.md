# Plataforma de Eventos e Ingressos

## Sobre o Projeto

Esta aplicação consiste em uma Plataforma de Eventos e Ingressos desenvolvida para gerenciar o ciclo completo de publicação de eventos, comercialização e validação de acessos. O sistema conecta organizadores, clientes e operadores de portaria em um ambiente integrado, simulando o fluxo real de grandes plataformas de entretenimento.

## Principais Funcionalidades

- Catálogo e Gestão de Eventos: Integração com APIs externas (como a TMDB para filmes) para que organizadores criem e gerenciem eventos definindo data, local, capacidade e preço.

- Fluxo de Reserva e Vendas: Navegação por eventos publicados e seleção de ingressos por quantidade/setor (pista), garantindo a integridade do estoque e evitando o overselling (venda dupla do mesmo lugar).

- Checkout Simulado: Processo de pagamento simulado que contempla tanto a confirmação quanto a recusa da transação.

- Ingressos Seguros com QR Code: Geração de bilhetes digitais exclusivos contendo códigos QR infalsificáveis, disponíveis na área "Meus Ingressos" do cliente e compartilháveis via link.

- Módulo de Portaria: Tela dedicada para a validação de bilhetes na entrada do evento via leitura de câmera ou digitação manual, com retornos claros para ingressos válidos, inválidos, já utilizados ou de eventos incorretos.

## Perfis de Acesso (Autenticação)

- Organizador: Responsável por gerenciar o catálogo e publicar os eventos.

- Cliente: Navega, realiza reservas, simula pagamentos e gerencia seus ingressos.

- Portaria: Valida o acesso do público na entrada dos eventos.

# Backend - Plataforma de Eventos e Ingressos

API REST em Node.js + TypeScript com Express, Prisma e PostgreSQL.

## Visao Geral

Este backend implementa:

- Autenticacao com JWT e RBAC (`ORGANIZER`, `CUSTOMER`, `GATEKEEPER`)
- Catalogo de eventos
- Reserva de ingressos com protecao contra concorrencia
- Checkout simulado com confirmacao/recusa de pagamento
- Emissao de ingressos com codigo seguro (UUID v4)
- Compartilhamento de ingresso por link assinado (HMAC)
- Validacao de ingresso na portaria com marcacao atomica de uso

## Arquitetura

Estrutura por camadas (MVC + Services + Repositories):

- `routes` -> `middlewares` -> `controllers` -> `services` -> `repositories` -> `Prisma`

## Requisitos

- Node.js 20+
- pnpm 10+
- Docker + Docker Compose

## Configuracao de Ambiente

1. Entre na pasta do backend:

```bash
cd backend
```

2. Crie o arquivo `.env` com os valores abaixo:

```env
APP_PORT=3000
JWT_SECRET=sua_chave_secreta_forte
TMDB_API_KEY=sua_chave_tmdb_opcional

POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=plataforma-ingressos
DB_PORT=4444

DATABASE_URL=postgresql://postgres:postgres@localhost:4444/plataforma-ingressos
```

Observacoes:

- `TMDB_API_KEY` e opcional para as rotas que nao dependem de `externalRef`.
- O `DATABASE_URL` precisa combinar com os dados do `docker-compose.yml`.

## Subir Banco de Dados

```bash
docker compose up -d
```

Para parar:

```bash
docker compose down
```

Para remover volume e resetar dados:

```bash
docker compose down -v
```

## Instalar Dependencias

```bash
pnpm install
```

## Preparar Banco com Prisma

Gerar client:

```bash
pnpm db:generate
```

Sincronizar schema no banco:

```bash
pnpm db:push
```

Popular dados iniciais:

```bash
pnpm prisma db seed
```

Opcional (inspecao visual):

```bash
pnpm db:studio
```

## Rodar Aplicacao

Modo desenvolvimento:

```bash
pnpm dev
```

A API sobe em:

- `http://localhost:3000` (ou a porta definida em `APP_PORT`)

Build + start:

```bash
pnpm build
pnpm start
```

## Rodar Testes

Typecheck:

```bash
pnpm typecheck
```

Suite completa:

```bash
pnpm test
```

Teste especifico de portaria:

```bash
pnpm test -- src/tests/gatekeeper-validation.test.ts
```

## Usuarios Seed

Depois do seed, os usuarios abaixo estao disponiveis:

- Organizer: `organizer@example.com` / `password123`
- Customer 1: `customer1@example.com` / `password123`
- Customer 2: `customer2@example.com` / `password123`
- Gatekeeper: `gatekeeper@example.com` / `password123`

## Endpoints Principais

### Usuarios

- `POST /users/login`
- `POST /users`
- `GET /users`
- `GET /users/:id`
- `PUT /users/:id`
- `DELETE /users/:id`

### Eventos

- `POST /events` (ORGANIZER)
- `GET /events`
- `GET /events/:id`

### Reservas e Checkout

- `POST /reservations` (CUSTOMER)
- `POST /reservations/:id/checkout` (CUSTOMER)

### Ingressos

- `GET /tickets/me` (CUSTOMER)
- `GET /tickets/shared/:id?token=...`
- `POST /tickets/validate-entry` (GATEKEEPER)

## Garantias de Consistencia

- Reserva e checkout com `Prisma.TransactionIsolationLevel.Serializable`
- Lock com `FOR UPDATE` para evitar corrida de concorrencia
- Constraint composta no banco para assento unico por evento: `@@unique([eventId, seatCode])`
- Validacao de portaria marca ingresso como `USED` na mesma transacao que valida

## Guia de Teste Manual da API

Consulte:

- `TESTES_MANUAIS_API.md`
