# Especificação de Arquitetura e Padrões - Backend (Node.js / Express)

## 1. Arquitetura

O projeto segue o padrão **MVC (Model-View-Controller)**, focado na simplicidade e na organização direta dos componentes da aplicação.

- **Model:** Camada responsável pelas regras de negócio e pela persistência de dados, interagindo diretamente com o banco de dados.
- **View:** Contextualizada como a resposta JSON da API, orquestrada pelos _Controllers_.
- **Controller:** Camada intermediária que gerencia o fluxo da requisição, validação de entrada e retorno da resposta HTTP.

## 2. Stack Tecnológica

- **Runtime:** Node.js
- **Linguagem:** TypeScript
- **Framework Web:** Express
- **ORM / Banco de Dados:** Prisma ORM com PostgreSQL / SQLite
- **Validação:** Zod
- **Testes:** Jest com Supertest

## 3. Estrutura de Pastas

```text
backend/
├── prisma/                # Esquema do Prisma, migrations e client
├── src/
│   ├── app.ts             # Configuração e montagem do app Express
│   ├── server.ts          # Ponto de entrada da aplicação
│   ├── config/            # Configurações da aplicação (env, variáveis, setup)
|   ├── libs/               # Bibliotecas auxiliares (ex: Prisma client)
│   ├── controllers/       # Processamento de requisições HTTP
│   ├── middlewares/       # Middlewares de autenticação, tratamento de erro e validação
│   ├── repositories/      # Camada de acesso a dados e abstração do Prisma
│   ├── routes/            # Definição das rotas da API
│   ├── schemas/           # Schemas de validação e contratos de entrada/saída
│   └── services/          # Lógica de negócio da aplicação
```

## 4. Regras de Implementação e Boas Práticas

Controllers: Responsáveis estritamente por extrair dados da requisição (body, query, params), validar entradas com Zod, chamar o Model correspondente e retornar a resposta HTTP estruturada.

Models: Responsáveis pela lógica de negócio e interação com o banco de dados via Prisma. Centralizam o acesso aos dados e asseguram a integridade das operações.

Tratamento de Erros: Utilizar classes de erro customizadas tratadas centralmente por um middleware de erro no Express.

Segurança e Concorrência: Garantir controle de transações no Prisma para assegurar a consistência dos dados, como em processos de venda de ingressos ou reservas.

## 5. Testes

Obrigatório: Toda feature crítica deve possuir testes automatizados.

Foco: Priorizar testes de integração utilizando Supertest para validar o fluxo completo da rota (requisição -> model -> banco).

Cobertura: 80% de cobertura de testes.

Isolamento: Testes devem rodar em bancos de dados isolados (containers efêmeros ou banco em memória/sqlite dedicado).

Cobertura mínima: Foco nos fluxos críticos (Criação de eventos, Reserva de assentos, Simulação de pagamento e Validação na portaria).
