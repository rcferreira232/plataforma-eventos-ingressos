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

## Dia 10/08/2026

Notas: Como ontem consegui gerar todas as configs que precisava, gerar código de uma classe inteira mais teste no padrão que eu queria, hoje resolvi criar 5 prompts maiores para ver se com meus spec e contexto a IA iria conseguir manter o mesmo padrão e gerar código funcional.

Prompt 1: Expansão do Schema e Validações Base

Objetivo: Completar o banco de dados e adicionar a camada de validação que faltou no setup inicial.
Atue como um Desenvolvedor Backend Sênior especialista em Node.js e TypeScript. O projeto já possui a infraestrutura básica configurada (Express, TypeScript, Prisma com PostgreSQL, Jest/Supertest e middleware de erro centralizado). O CRUD da entidade User já está com uma implementação básica seguindo o padrão MVC.
Tarefas desta etapa:

1. Atualize o arquivo schema.prisma para incluir as seguintes entidades e suas relações com a entidade User já existente: Eventos, Reservas/Assentos e Ingressos.
2. Crie um middleware de validação de requisições utilizando o Zod.
3. Crie um script seed.ts para popular o banco de dados.

Prompt 2: Autenticação e Integração Externa (Organizador)

Objetivo: Proteger as rotas e conectar a plataforma com o catálogo de shows/filmes.
Tarefas desta etapa:

1. Implemente o middleware de autenticação (ex: JWT) que valide adequadamente os três papéis do sistema.
2. Crie um serviço utilitário para consumir a API externa do TMDB ou Ticketmaster Discovery.
3. Desenvolva o Controller e o Model para a criação e gerenciamento de Eventos pelo Organizador.
4. Crie um teste de integração (Jest + Supertest) isolado para a rota de criação de eventos.

Prompt 3: Busca de Eventos e Sistema de Reservas (Cliente)

Objetivo: Implementar a parte mais crítica do sistema, garantindo a integridade dos assentos.

Agora vamos construir o fluxo de navegação e reserva de ingressos para o Cliente.

Tarefas desta etapa:

1. Crie a rota e o Controller para o Cliente listar/buscar os eventos publicados.
2. Desenvolva a lógica de reserva no Model (seleção de lugar no mapa ou quantidade de pista).
3. Requisito Crítico: Utilize obrigatoriamente o controle de transações do Prisma para garantir que o mesmo lugar não seja vendido ou reservado duas vezes.
4. Escreva testes de integração que foquem em cenários de concorrência (ex: duas requisições simultâneas tentando reservar o mesmo assento exato).
5. Retorne os Controllers, Models e Testes de integração relacionados exclusivamente ao fluxo de listagem e reserva de assentos.

Prompt 4: Checkout Simulado, Emissão e Visualização

Objetivo: Finalizar a compra do cliente e gerar os artefatos.

Com a reserva garantida, precisamos processar o pagamento e emitir os ingressos.

Tarefas desta etapa:

1. Crie um endpoint de pagamento simulado que aceite confirmação ou recusa.
2. Em caso de pagamento confirmado, atualize a reserva e gere o(s) Ingresso(s) no banco de dados.
3. O código do ingresso gerado deve ser impossível de ser forjado (ex: UUID v4 ou hash seguro).
4. Crie a lógica para que o cliente possa compartilhar o ingresso via um link gerado pela aplicação.
5. Crie a rota da área "Meus Ingressos" para exibição ao cliente.

Retorne os Controllers e Models responsáveis pelo pagamento simulado, pela emissão segura dos ingressos e pelas rotas de visualização do cliente.

Prompt 5: Validação da Portaria e Fechamento

Objetivo: Garantir a entrada segura no evento e documentar a solução.

Tarefas desta etapa:

1. Desenvolver endpoint da Portaria para validação de ingresso.
2. Retorno claro para válido, inválido, já utilizado e evento errado.
3. Utilizar transações no Prisma para impedir validação dupla.
4. Escrever testes de integração de todos os cenários de portaria.
5. Criar documentação de setup e execução (`README.md`) e guia de testes manuais (`TESTES_MANUAIS_API.md`).

O resultado em si foi muito bom, tive que fazer alguns ajustes incrementais nos spec a medida a medida que a IA gerava o código, mas no geral consegui gerar todo o backend funcional com testes. Mesmo com testes eu decidi fazer uma rodada de testes manuais para garantir que tudo estava funcionando como esperado, usei o Bruno (Similar ao Postman) para fazer os testes manuais, deixarei um .md com os testes manuais que fiz para que fique registrado. Percebi alguns alguns pontos de melhoria, como algumas rotas e ações que poderiam exigir algum tipo de permissão específica e não tem, como get /user que qualquer um pode acessar, put /user que tambem poderia exigir permissão, POST /reservations/:id/checkout com "decision": "DECLINE" continua ocupando o assento, podia ter algumas rotas extras apenas para o organizador, mas o basico do desafio foi cumprido, caso sobre tempo eu volto e termino de implementar essas melhorias. Abaixo segue um resumo do que foi feito:

- Expansão do Domínio e Banco de Dados:
  - Atualização do schema do Prisma com as entidades `Event`, `Reservation` e `Ticket`.
  - Implementação de restrições críticas no banco, como `@@unique([eventId, seatCode])` para evitar reservas duplicadas do mesmo assento.
  - Criação do script de seed (`seed.ts`) para popular o banco de dados.
- Autenticação e Validação:
  - Criação de middleware de validação de requisições utilizando Zod.
  - Implementação de autenticação JWT com Role-Based Access Control (RBAC) suportando os papéis `ORGANIZER`, `CUSTOMER` e `GATEKEEPER`.
- Lógica de Negócio e Funcionalidades (Core):
  - Desenvolvimento da integração com a API externa (TMDB) para gestão de eventos.
  - Implementação do sistema de reservas e checkout simulado.
  - Aplicação de mecanismos avançados de concorrência usando transações do Prisma (`Serializable`) e locks no nível do banco (`FOR UPDATE`) para evitar overbooking.
  - Construção do fluxo de emissão de ingressos com códigos seguros (UUID v4) e geração de links de compartilhamento protegidos por HMAC SHA-256.
  - Criação da rota de validação da Portaria para verificação de ingressos (status: `VALID`, `INVALID`, `ALREADY_USED`, `WRONG_EVENT`) com validação atômica em transação.
- Testes e Documentação:
  - Escrita de testes de integração utilizando Jest + Supertest cobrindo cenários complexos de concorrência e autorização.
  - Elaboração da documentação do projeto, incluindo o `README.md` atualizado e o guia detalhado de testes manuais (`TESTES_MANUAIS_API.md`).

## Dia 11/08/2026

- Início do desenvolvimento do frontend.
  - Criação da estrutura de pastas do frontend.
  - Decisão de das libs a serem utilizadas.
  - Styling com Tailwind CSS global.
  - Provider de React Query.
  - Auth Service.
  - Use auth hook.
  - Meta tags.
  - Definição de rotas e páginas.
  - Definição da biblioteca de UI a ser utilizada (Shadcn).
  - Figma com protótipos clone do ingresso.com (Base do layout do site).
  - Componentes básicos.
    - Menu de navegação lateral.
    - Topbar.
    - Rodapé.

Notas: O frontend ainda está em desenvolvimento, mas já consegui criar a estrutura de pastas, definir as libs que irei utilizar, criar o styling global com Tailwind CSS, definir as rotas e páginas, definir a biblioteca de UI (Shadcn) e criar alguns componentes básicos. Demorei muito para decidir a biblioteca de UI, tentei usar a HeroUI, mas não gostei muito do resultado principalmente por causa do layout escolhido de base, então resolvi usar a Shadcn. Instalei a lib ele adicionou libs a mais, alterou globals.css e adcionei o button padrão da lib. Daqui para frente irei criar os componentes: site-header, site-footer e nav-menu, e depois integrei eles com meu root layout. Teve outras coisas como types da api no arquivo `types/index.ts`, provider do react-query, api.ts para fazer as chamadas à API, auth.service para gerenciar a autenticação e use-auth hook, mas esse foram menos trabalhosos.

Observação: Como a shadcn adicionou muitos estilos, usei IA para adaptar para minha paleta de cores, como já tinha muitos estilos definidos e fiz a base do site-header, site-footer e nav-menu, pedi para IA melhorar o site-header, site-footer e nav-menu para ficar mais parecido com o layout do ingresso.com, e depois pedi para IA melhorar o layout do site-header, site-footer e nav-menu para ficar mais parecido com o layout do ingresso.com.
