# Plataforma de Eventos e Ingressos (MeuIngresso)

## Sobre o Projeto

Esta aplicação consiste em uma Plataforma de Eventos e Ingressos desenvolvida para gerenciar o ciclo completo de publicação de eventos, comercialização e validação de acessos. O sistema conecta organizadores, clientes e operadores de portaria em um ambiente integrado.

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

## Pré-requisitos

Para rodar o projeto do zero, você precisará de:

- **Node.js**: `v22.x` ou superior
- **Gerenciador de Pacotes**: `pnpm` (recomendado v10) ou `npm`
- **Docker & Docker Compose**: instalados e ativos na sua máquina
- **Git**: para clonar o repositório

```bash
git clone <URL_DO_REPOSITORIO>
cd plataforma-eventos-ingressos
```

## Opção 1: Executando Localmente do Zero (Backend e Frontend Separados)

Se você deseja executar o Backend e Frontend individualmente em suas próprias janelas de terminal (para desenvolvimento ou debug), siga este passo a passo:

Observações: Execute primeiramente de forma local, sem Docker Compose, para garantir que tudo funcione corretamente antes de usar a opção de orquestração. Executar diretamente com Docker Compose é mais rápido, mas pode gerar certos inconvenientes em relação a permissões de arquivos (tendo que usar `sudo`pois o Docker Compose cria arquivos com permissões de root).

### Passo 1. Configurar Variáveis de Ambiente Globais

Copie o arquivo `.env.example` da raiz para `.env`:

```bash
cp .env.example .env
```

### Passo 2: Subindo o Banco PostgreSQL

Você pode utilizar o container Docker de PostgreSQL configurado na raiz:

```bash
# Na raiz do projeto:
docker compose up -d postgres
```

> O banco ficará acessível localmente na porta `4444` (ou na porta definida em seu `.env`).

---

### Passo 3: Configurando e Rodando o Backend

1. **Acesse a pasta do backend:**

   ```bash
   cd backend
   ```

2. **Crie o arquivo de ambiente `.env`:**
   Copie a partir de `.env.example`:

   ```bash
   cp .env.example .env
   ```

   _Conteúdo de exemplo do `backend/.env`:_

   ```env
   APP_PORT=3333
   POSTGRES_USER=plataforma-ingressos
   POSTGRES_PASSWORD=plataforma-ingressos
   POSTGRES_DB=plataforma-ingressos
   DB_PORT=4444
   DATABASE_URL="postgresql://plataforma-ingressos:plataforma-ingressos@localhost:4444/plataforma-ingressos?schema=public"
   JWT_SECRET="seu_jwt_secret_super_seguro"
   TMDB_API_KEY="sua_chave"
   ALLOW_ORIGIN="http://localhost:3000"
   ```

3. **Instale as dependências:**

   ```bash
   pnpm install
   ```

4. **Prepare o Banco de Dados (Prisma):**

   ```bash
   # Gera o Prisma Client
   pnpm db:generate

   # Sincroniza as tabelas com o PostgreSQL
   pnpm db:push

   # Popula o banco com os usuários e eventos de teste
   pnpm prisma db seed
   ```

5. **Inicie o servidor backend em desenvolvimento:**
   ```bash
   pnpm dev
   ```
   > Backend rodando em: `http://localhost:3333`

---

### Passo 4: Configurando e Rodando o Frontend

1. **Abra uma nova janela de terminal e acesse a pasta do frontend:**

   ```bash
   cd frontend
   ```

2. **Crie o arquivo de ambiente `.env`:**

   ```bash
   cp .env.example .env
   ```

   _Conteúdo do `frontend/.env`:_

   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3333
   ```

3. **Instale as dependências:**

   ```bash
   pnpm install
   ```

4. **Inicie o servidor frontend em desenvolvimento:**
   ```bash
   pnpm dev
   ```
   > Frontend rodando em: `http://localhost:3000`

---

## Opção 2: Executando TUDO com Docker Compose

Esta opção constrói os contêineres do PostgreSQL, Backend e Frontend de forma orquestrada.

### 1. Configurar Variáveis de Ambiente Globais

Copie o arquivo `.env.example` da raiz para `.env`:

```bash
cp .env.example .env
```

Observação: Faça apenas se tiver pulado a etapa de configuração local.

_(Opcional)_ Se possuir uma API Key do TMDB, defina `TMDB_API_KEY=sua_chave` no arquivo `.env`. Caso contrário, pode afetar a funcionalidade de alguns recursos.

### 3. Subir todos os serviços

```bash
docker compose up --build -d
```

### 4. Executar Comandos do Prisma

Caso precisa rodar os comandos do Prisma, execute os seguintes comandos:

```bash
docker compose exec backend pnpm db:generate
docker compose exec backend pnpm db:push
docker compose exec backend pnpm prisma db seed
```

### Acessar as Aplicações:

- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:3333](http://localhost:3333)

Para parar os contêineres:

```bash
docker compose down
```

## Usuários e Credenciais do Seed

Após rodar o comando `pnpm prisma db seed`, os seguintes usuários padrão estarão prontos para uso em ambos os ambientes (senha para todos: `password123`):

| Papel (`Role`) | E-mail                   | Senha         | Função no Sistema                                                         |
| :------------- | :----------------------- | :------------ | :------------------------------------------------------------------------ |
| **ORGANIZER**  | `organizer@example.com`  | `password123` | Cria novos eventos e consulta catálogo TMDB.                              |
| **CUSTOMER**   | `customer@example.com`   | `password123` | Navega por eventos, reserva assentos, faz checkout e visualiza ingressos. |
| **CUSTOMER**   | `customer2@example.com`  | `password123` | Segundo cliente para testes de concorrência e compra simultânea.          |
| **GATEKEEPER** | `gatekeeper@example.com` | `password123` | Opera a tela de validação por leitor de QR Code na portaria.              |

---

## Testes do Backend

Para executar os testes (no diretório `backend`):

```bash
# Executa todos os testes de integração
pnpm test

# Validação de tipagem TypeScript
pnpm typecheck
```

---

## Documentações Adicionais

- **[Documentação e Contexto do Backend](._docs/backend/contexto_atual.md)**: Detalhes das rotas, modelos Prisma, transações e utilitários de assentos.
- **[Guia de Testes Manuais da API](._docs/backend/TESTES_MANUAIS_API.md)**: Collection de exemplos cURL / Postman / Bruno para chamada direta dos endpoints.
- **[Documentação do Frontend](._docs/frontend/contexto_atual.md)**: Arquitetura, dependências e padrões do Next.js.
- **[Workflow e Guia das Telas](._docs/frontend/Frontend-workflow.md)**: Descrição detalhada do que cada tela faz e suas regras de negócio.

## Deploy

### Backend:

- https://plataforma-eventos-ingressos-sigma.vercel.app/

### Frontend:

- https://meuingresso-zeta.vercel.app/
