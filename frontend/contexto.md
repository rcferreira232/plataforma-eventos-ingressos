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

## Nome do Site e Branding

- **Nome do Site:** MeuIngresso - A Melhor Plataforma para Amantes de Cinema.

---

## Branding e Identidade

- **Nome do Site:** MeuIngresso - A Melhor Plataforma para Amantes de Cinema[cite: 6].
- **Público-Alvo:** Fãs de cinema, frequentadores de shows e organizadores de eventos culturais[cite: 4, 6].
- **Estilo Visual:** Interface moderna e responsiva com Tailwind CSS, inspirada nas melhores práticas de experiência do usuário da Ingresso.com, Eventim e Sympla[cite: 5, 6].

---

## Perfis de Usuário e Fluxos de Navegação

### 1. Perfil Organizador (`ORGANIZER`)

- **Autenticação:** Acessa rotas protegidas sob `/organizer/*`[cite: 5].
- **Criação de Eventos:** Preenche informações do evento (`title`, `date`, `location`, `capacity`, `price`) e opcionalmente consulta dados da API TMDB (`externalRef`) para autocompletar título e cartaz[cite: 1, 3, 4].
- **Gestão:** Consulta a lista de eventos publicados e o total de ingressos/capacidade[cite: 1, 3, 5].

### 2. Perfil Cliente (`CUSTOMER`)

- **Navegação no Catálogo:** Explora os eventos disponíveis em cartaz na Landing Page ou na aba `/client/events`[cite: 5, 6].
- **Reserva de Ingresso:**
  - Escolhe o evento desejado[cite: 6].
  - Seleciona assentos marcados em um mapa interativo (`seatCode` ex: "A-10") ou informa a quantidade de ingressos de pista (`quantity`)[cite: 1, 6].
  - Envia a solicitação de reserva (`POST /reservations`), que inicia com o status `PENDING` no backend[cite: 1, 3].
- **Checkout Simulado:**
  - O cliente visualiza o resumo da reserva[cite: 6].
  - Escolhe entre **Confirmar Pagamento** (`CONFIRM`) ou **Recusar Pagamento** (`DECLINE`) no modal de simulação[cite: 1, 3, 6].
  - Em caso de confirmação, a reserva é atualizada para `CONFIRMED` e os ingressos com QR Code seguro (UUID v4) são gerados imediatamente[cite: 3, 4].
  - Em caso de recusa, a reserva muda para `CANCELLED`[cite: 3].
- **Área "Meus Ingressos" (`/client/my-tickets`):**
  - Exibe todos os ingressos do usuário logado (`GET /tickets/me`)[cite: 1, 3, 6].
  - Mostra o QR Code individual para ser apresentado na entrada[cite: 4, 6].
  - Disponibiliza botão para copiar o link de compartilhamento assinado (`shareLink`)[cite: 1, 3, 4, 6].

### 3. Perfil Portaria (`GATEKEEPER`)

- **Autenticação:** Acessa estritamente a rota `/gate/validate`[cite: 5].
- **Validação na Entrada:**
  - Utiliza a câmera do dispositivo móvel/notebook para escanear o QR Code ou digita manualmente o código do bilhete (`POST /tickets/validate-entry`)[cite: 1, 3, 6].
  - O sistema envia o código lido e o ID do evento selecionado para o backend[cite: 1, 3].
  - Exibe um retorno com alerta sonoro/visual diferenciando os 4 resultados possíveis[cite: 3, 6]:
    1. **VALID:** Ingresso validado com sucesso (status atualizado para `USED`)[cite: 3, 6].
    2. **ALREADY_USED:** Alerta de ingresso que já foi validado anteriormente[cite: 3, 6].
    3. **INVALID:** Código inexistente ou forjado[cite: 3, 4, 6].
    4. **WRONG_EVENT:** Ingresso válido, porém pertencente a outro evento/sessão[cite: 3, 6].

---

## Referências

- ingresso.com: mapa de assentos de cinema.
- eventim.com.br: pista e setores por quantidade.
- sympla.com.br: criação de evento e checkout.
