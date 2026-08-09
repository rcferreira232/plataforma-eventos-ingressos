# Contexto

## Plataforma de Eventos e Ingressos (Back-End)

Plataforma de Eventos e Ingressos, onde um organizador publica eventos e um cliente compra ingressos.

O organizador monta um evento a partir de um catálogo de shows ou filmes vindo de uma API externa, definindo data, local, capacidade e preço. O cliente navega pelos eventos publicados, reserva seu lugar, paga de forma simulada, recebe um ingresso com código em QR e pode compartilhá-lo por link. Na entrada do evento, a portaria valida o ingresso.

## Requisitos Funcionais

- Gestão das chamadas para a API externa: Ticketmaster Discovery ou TMDB. Você pode usar uma, a outra, ou as duas.
  - [developer.ticketmaster.com/products-and-docs/apis/discovery-api/v2](https://developer.ticketmaster.com/products-and-docs/apis/discovery-api/v2)
  - [developer.themoviedb.org/docs](https://developer.themoviedb.org/docs)

- Autenticação com três papéis distintos: Organizador, que cria e gerencia eventos, Cliente, que reserva, paga e recebe ingressos, e Portaria, que valida ingressos na entrada.

- Armazenamento dos eventos, das reservas e dos ingressos.

- Garantia de que o mesmo lugar não seja vendido duas vezes.

- Geração do ingresso com um código em QR que não possa ser forjado.

- Implementação de lógica para permitir que o cliente compartilhe um ingresso via um link gerado pela aplicação.

- Validação do ingresso na portaria, garantindo que o mesmo ingresso não seja validado duas vezes.

- A cobrança deve ser simulada, sem transação financeira real. Se preferir, você pode usar o ambiente de testes de um provedor de pagamento de verdade.

Observação: A cobrança deve ser simulada, sem transação financeira real. Se preferir, você pode usar o ambiente de testes de um provedor de pagamento de verdade.
