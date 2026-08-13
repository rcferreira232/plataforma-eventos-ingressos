# Workflow e Funcionalidades das Telas do Frontend

Este documento descreve detalhadamente o papel, fluxo de navegação e responsabilidade de cada tela da aplicação frontend da **Plataforma de Eventos e Ingressos**.

---

## 1. Área Pública e Autenticação

### 🏠 Landing Page (`/`)
- **Objetivo**: Apresentar a plataforma, suas principais funcionalidades (mapa de assentos, validação por QR Code, compartilhamento seguro) e os próximos eventos em destaque.
- **Funcionalidades**:
  - Hero banner com botões de chamada para ação (CTA) para login/cadastro.
  - Carrossel/Grid com prévia de eventos disponíveis.
  - Navegação principal rápida via cabeçalho (`SiteHeader`).

### 🔐 Tela de Login (`/(auth)/login`)
- **Objetivo**: Autenticar usuários cadastrados no sistema.
- **Funcionalidades**:
  - Formulário com validação Zod (E-mail e Senha).
  - Armazenamento do token JWT no `localStorage` / Cookie.
  - Redirecionamento dinâmico pós-login baseado no papel do usuário:
    - `ORGANIZER` -> `/organizer/dashboard`
    - `GATEKEEPER` -> `/gate/validate`
    - `CUSTOMER` -> `/client/events`

### 📝 Tela de Registro (`/(auth)/register`)
- **Objetivo**: Permitir o cadastro de novos clientes (`CUSTOMER`) ou organizadores (`ORGANIZER`).
- **Funcionalidades**:
  - Seleção do papel do usuário durante o cadastro.
  - Validação de formato de e-mail e força da senha.
  - Redirecionamento automático para a tela de login após criação da conta.

---

## 2. Área do Cliente (`CUSTOMER`)

### 🎟️ Catálogo de Eventos (`/client/events`)
- **Objetivo**: Exibir todos os eventos publicados e disponíveis para compra.
- **Funcionalidades**:
  - Listagem em cards dinâmicos com imagem, data, local e preço.
  - Filtro e pesquisa por título do evento.
  - Botão de ação para abrir os detalhes e selecionar assentos.

### 📍 Detalhes do Evento e Seleção de Assento (`/client/events/[id]`)
- **Objetivo**: Permitir que o cliente visualize as informações completas do evento, escolha seu assento no mapa e conclua a reserva.
- **Funcionalidades**:
  - **Mapa Interativo de Assentos (`SeatSelector`)**: Renderização gráfica das fileiras (A, B, C...) e cadeiras numeradas, destacando assentos livres, selecionados e já ocupados.
  - **Reserva do Assento**: Envio do `seatCode` para criação da reserva pendente.
  - **Modal de Checkout Simulado**: Confirmação ou cancelamento da reserva com pagamento simulado.
  - Emissão automática do ingresso com código UUID v4 após o pagamento.

### 💳 Meus Ingressos (`/client/my-tickets`)
- **Objetivo**: Centralizar todos os ingressos comprados pelo cliente.
- **Funcionalidades**:
  - Cards de ingressos contendo o QR Code individual para apresentação na portaria.
  - Status do ingresso (`VÁLIDO`, `UTILIZADO`, `CANCELADO`).
  - Botão **"Copiar Link de Compartilhamento"** para gerar a URL pública assinada com HMAC.

---

## 3. Área do Organizador (`ORGANIZER`)

### 📊 Dashboard do Organizador (`/organizer/dashboard`)
- **Objetivo**: Painel administrativo principal do organizador.
- **Funcionalidades**:
  - Métricas gerais (total de eventos criados, ingressos vendidos e receita acumulada).
  - Atalhos rápidos para criar novo evento e visualizar lista de eventos.

### ➕ Cadastro e Gestão de Eventos (`/organizer/events`)
- **Objetivo**: Permitir a criação de novos eventos manualmente ou importando dados do TMDB.
- **Funcionalidades**:
  - Integração com a API do TMDB para autopreenchimento de dados de filmes populares.
  - Formulário para definir título, data/hora, local, capacidade máxima de assentos e preço do ingresso.
  - Listagem dos eventos organizados pelo usuário logado.

---

## 4. Área da Portaria (`GATEKEEPER`)

### 🔍 Validação de Entradas (`/gate/validate`)
- **Objetivo**: Permitir que a equipe da portaria valide a entrada dos participantes no evento em tempo real.
- **Funcionalidades**:
  - **Leitor de QR Code integrado (`html5-qrcode`)**: Utiliza a câmera do dispositivo (smartphone ou computador) para escaneamento instantâneo do ingresso.
  - **Entrada Manual**: Campo de texto para digitação do código UUID do ingresso.
  - **Feedback Visual Instantâneo**:
    - 🟢 **VÁLIDO**: Entrada autorizada e status alterado para `USED`.
    - 🟡 **JÁ UTILIZADO**: Alerta de tentativa de entrada duplicada.
    - 🔴 **EVENTO ERRADO**: Ingresso pertence a outro evento.
    - ⚪ **INVÁLIDO**: Código inexistente.

---

## 5. Visualização Pública

### 🔗 Ingresso Compartilhado (`/tickets/shared/[id]`)
- **Objetivo**: Rota pública para exibição de ingresso recebido via link de compartilhamento.
- **Funcionalidades**:
  - Validação do token de assinatura HMAC na URL (`?token=...`).
  - Exibição dos dados do evento, titular do ingresso e QR Code válido.
  - Bloqueio de acesso em caso de token inválido ou adulterado.
