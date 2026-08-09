# Relatório de Desenvolvimento

## Dia 08/08/2026

- Tomada de decisão:
  - Tecnologias iniciais que irei utilizar no desafio (Backend: Nodejs/Express, Frontend: Nextjs).
  - Definição da arquitetura (backend).
  - Definição da estrutura de pastas backend e frontend (Mutaveis com avanço do projeto).
  - Definição de padrões dos specs backend e frontend (Mutaveis com avanço do projeto).

Notas: Essa foi uma tomada de decisão inicial, que pode ser alterada com o avanço do projeto. Minha idéia com a escolha de tecnologias foi garantir um desenvolvimento um pouco mais rápido. Não quis utilizar nenhum framework muito robusto, como Nestjs, Django ou Springboot, pois acredito que para o desafio não é necessário. Fiquei entre o Express e Fastapi, mas optei pelo Express, pois tinha um projeto Nodejs usando Fastify que resolvi adaptar para express. No frontend pensei seriamente em usar o React puro, pois como backend era um servidor Express não seria necessário usar Nextjs, mas optei pelo Nextjs para agilizar o desenvolvimento (Pode mudar com o tempo).

## Dia 09/08/2026

- Início do desenvolvimento do backend.
  - Criação do projeto Nodejs com Typescript e Express.
  - Criação da estrutura de pastas do backend.
  - Adptação do projeto Nodejs com Fastify.
  - Configuração do Prisma ORM com PostgreSQL.
  - Configuração do Typescript e alias de pastas.
  - Configuração do Jest e Supertest para testes automatizados.
  - Dockercompose para banco PostgreSQL.
  - Criação da primeira Classe: User
  - Middleware de erro para padronizar o tratamento de erros.

Notas: Eu tinha um projeto Nodejs com Fastify que tinha uma estrutura de pastas muito boa e que usava clean architecture, então resolvi adaptar para o Express. Optei por não usar clean architecture, mas sim o MVC para agilizar o desenvolvimento. Fiz as cofigurações iniciais do projeto, como Typescript, Jest, Supertest, Dockercompose e Prisma ORM. Criei a primeira classe User para estabelher um padrão para guiar a IA no desenvolvimento (Apenas o Create do User e Teste). No /libs criei uma classe AppError para padronizar o tratamento de erros, e usei gemini para criar um middleware de erro que padroniza o tratamento de erros. Por fim, como eu já tinha definido grande parte dos padrões e já tinha um quantide boa de código, criei um context.md e passei um prompt para a IA gerar o restante do CRUD da classe User.

Modelos de IA usados: Gemini 3.5 Flash e ChatGPT (pequenos erros).

Observação: Minha ideia agora é usar (context.md + spec.md) para guiar a IA no desenvolvimento do backend, e usar o relatorio.md para registrar o que foi feito e decisões tomadas. Acredito que com isso conseguirei ter um backend funcional em pouco tempo.
