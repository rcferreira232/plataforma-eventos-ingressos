# Contexto

## Plataforma de Eventos e Ingressos (Front-End)

Plataforma de Eventos e Ingressos, onde um organizador publica eventos e um cliente compra ingressos.

O organizador monta um evento a partir de um catálogo de shows ou filmes vindo de uma API externa, definindo data, local, capacidade e preço. O cliente navega pelos eventos publicados, reserva seu lugar, paga de forma simulada, recebe um ingresso com código em QR e pode compartilhá-lo por link. Na entrada do evento, a portaria valida o ingresso.

## Requisitos Funcionais

- Navegação e busca pelos eventos publicados (shows ou filmes em cartaz), com data, local e preço.
- Criação e gerenciamento dos eventos pelo organizador.
- Fluxo de reserva, com seleção do lugar num mapa de assentos (cinema, teatro) ou da quantidade de ingressos (pista). Implemente um dos dois, ou os dois.
- Pagamento simulado, contemplando a confirmação e também a recusa.
- Área de "Meus ingressos", exibindo o ingresso e o seu código em QR.
- Tela de portaria, para validar o ingresso na entrada do evento, com retorno claro: válido, inválido, já utilizado ou evento errado.
- Leitura do QR pela câmera na portaria, tendo a digitação manual do código como alternativa.

## 5. Nome do Site e Branding

- **Nome do Site:** MeuIngresso - A Melhor Plataforma para Amantes de Cinema.

## Referências

Para ver como esses fluxos costumam ser resolvidos. Não copie; use como ponto de partida.

- ingresso.com: mapa de assentos de cinema.
- eventim.com.br: pista e setores por quantidade.
- sympla.com.br: criação de evento e checkout.
