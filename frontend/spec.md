# Especificação de Arquitetura e Padrões - Frontend (Next.js)

## 1. Arquitetura

O frontend é construído utilizando **Next.js (App Router)**, combinando Server Components.

- **Separação de Camadas:** Isolamento rigoroso entre UI Components, Custom Hooks para regras de estado/interface, TanStack React Query para chamadas e cache da API, e a camada de serviços HTTP (Axios/Fetch).
- **Integração Backend:** Conexão direta com a API REST Express em `http://localhost:3333` (definida via `NEXT_PUBLIC_API_URL`).

---

## 2. Stack Tecnológica

- **Framework:** Next.js (App Router)
- **Linguagem:** TypeScript (Strict Mode)
- **Estilização:** Tailwind CSS
- **Gerenciamento de Estado / Fetching:** TanStack React Query (v5)
- **Formulários e Validação:** React Hook Form + Zod
- **Leitura de QR Code:** `react-qr-reader`
- **HeroUi:** Biblioteca de componentes UI (Buttons, Modals, Inputs, Badges, Toasts)
- **Icons & Feedback Visual:** Lucide React + Sonner / React Hot Toast (mensagens amigáveis e feedback de erro)

---

## 3. Estrutura de Pastas

```text
src/
├── app/                        # Next.js App Router
│   ├── (auth)/                 # Grupo de rotas autenticação
│   │   ├── login/page.tsx      # POST /users/login
│   │   └── register/page.tsx   # POST /users
│   ├── organizer/              # Área exclusiva do ORGANIZER
│   │   ├── dashboard/page.tsx
│   │   ├── events/page.tsx
│   │   └── events/new/page.tsx # Criação de eventos (com integração TMDB)
│   ├── client/                 # Área exclusiva do CUSTOMER
│   │   ├── events/page.tsx     # Catálogo público / busca de eventos
│   │   ├── events/[id]/page.tsx# Detalhes, escolha de lugares e checkout
│   │   └── my-tickets/page.tsx # "Meus Ingressos" (QR Code e Share Link)
│   ├── gate/                   # Área exclusiva do GATEKEEPER
│   │   └── validate/page.tsx   # Validação de QR Code via câmera ou digitação
│   ├── tickets/
│   │   └── shared/[id]/page.tsx# Rota pública de ingresso compartilhado (valida HMAC)
│   ├── profile/page.tsx        # Perfil do usuário logado
│   ├── page.tsx                # Landing Page pública "MeuIngresso"
│   └── layout.tsx              # Layout raiz com Providers
├── components/                 # Componentes genéricos e reutilizáveis de UI
│   ├── ui/                     # Botões, Modais, Inputs, Badges, Toasts
│   ├── seat-map/               # Mapa de assentos interativo e seletor de pista
│   ├── checkout/               # Modal de simulação de pagamento (Confirm/Decline)
│   └── qr-code/                # Componentes leitor e gerador de QR Code
├── services/                   # Cliente Axios com Interceptors e endpoints da API
│   ├── api.ts                  # Instância do Axios com cabeçalhos de JWT
│   ├── auth.service.ts         # Login e registro
│   ├── users.service.ts        # CRUD de usuários
│   ├── events.service.ts       # Gestão e busca de eventos
│   ├── reservations.service.ts # Reservas e checkout simulado
│   └── tickets.service.ts      # "Meus ingressos", compartilhados e portaria
├── hooks/                      # Custom Hooks (useAuth, useCameraScanner, useCart)
├── providers/                  # Provedores de contexto (QueryProvider, AuthProvider)
├── types/                      # Interfaces TypeScript sincronizadas com a API
└── utils/                      # Formatação de moeda, datas e tratamento de erros API
```

## 4. Contratos de Dados e Tipagens

```ts
export type Role = "ORGANIZER" | "CUSTOMER" | "GATEKEEPER";

// User
export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface AuthResponse {
  token: string;
  data: User;
}

// Event
export interface Event {
  id: string;
  title: string;
  date: string;
  location: string;
  capacity: number;
  price: number;
  externalRef?: string; // ID do TMDB
  organizerId: string;
  organizer?: User;
}

// Reservation
export type ReservationStatus = "PENDING" | "CONFIRMED" | "CANCELLED";

export interface Reservation {
  id: string;
  quantity: number;
  seatCode?: string;
  status: ReservationStatus;
  userId: string;
  eventId: string;
  event?: Event;
  createdAt: string;
}

export interface CheckoutDTO {
  decision: "CONFIRM" | "DECLINE";
}

// Ticket
export type TicketStatus = "VALID" | "USED" | "CANCELLED";
export type ValidationStatus =
  | "VALID"
  | "INVALID"
  | "ALREADY_USED"
  | "WRONG_EVENT";

export interface Ticket {
  id: string;
  reservationId: string;
  eventId: string;
  code: string; // UUID v4 gerado no backend
  status: TicketStatus;
  shareLink?: string; // Link assinado via HMAC gerado pelo backend
  event?: Event;
}

export interface ValidateEntry {
  code: string;
  eventId: string;
}

export interface ValidationResponse {
  validationStatus: ValidationStatus;
  message?: string;
  ticket?: Ticket;
}
```

## 5. Implementação

### Autenticação

- Amazenamento do token: Salvar o token JWT retornado em POST /users/login em LocalStorage.
- Cabeçalho de Requisição: Configurar o Axios para injetar automaticamente o cabeçalho Authorization: Bearer <token> em todas as requisições autenticadas.
- Tratamento de Sessão Expirada: Interceptar erros 401 Unauthorized na API para deslogar o usuário e redirecioná-lo para a tela /login.

### Tratamento de Concorrência e Erros HTTP

- Assentos Duplicados (HTTP 409 Conflict): Durante a criação de reserva (POST /reservations), se a API retornar erro 409 (concorrência de assento), o frontend deve interceptar a resposta, exibir um Toast de alerta "O assento selecionado acabou de ser reservado por outro cliente" e invalidar o cache da query no React Query.
- Bloqueio no Checkout: Somente o cliente dono da reserva pode realizar o checkout. Exibir feedback adequado se o checkout for negado.

### Telas de Portaria (/gate/validate)

- Modos de Entrada: Suportar leitura contínua pela câmera via WebRTC e campo de texto manual para o código do ingresso (code).

- Feedback Visual Claro: Exibir Badges/Cards estilizados de acordo com o validationStatus retornado pelo backend:
  - VALID: Verde (Entrada Liberada).
  - ALREADY_USED: Amarelo/Laranja (Ingresso Já Utilizado).
  - INVALID: Vermelho (Código de Ingresso Inválido).
  - WRONG_EVENT: Roxo/Vermelho (Ingresso Pertence a Outro Evento).

## 6. Rotas da Aplicação

### Rotas Públicas

- `/`: Landing Page pública do site **MeuIngresso**
- `/login`: Formulário de login do usuário
- `/register`: Formulário de cadastro de novos usuários
- `/tickets/shared/[id]`: Visualização pública de ingresso compartilhado por link HMAC

### Área do Organizador (`ORGANIZER`)

- `/organizer/dashboard`: Resumo e métricas dos eventos cadastrados
- `/organizer/events`: Lista de eventos criados pelo organizador
- `/organizer/events/new`: Formulário de criação de eventos com busca opcional no catálogo TMDB

### Área do Cliente (`CUSTOMER`)

- `/client/events`: Catálogo de filmes e shows disponíveis
- `/client/events/[id]`: Tela do evento com seleção visual de assentos (`seatCode`) ou quantidade de pista e modal de checkout
- `/client/my-tickets`: Área **Meus Ingressos** com listagem de bilhetes, QR Code e botão para copiar o `shareLink`

### Área da Portaria (`GATEKEEPER`)

- `/gate/validate`: Tela de validação de QR Code via câmera ou digitação manual de código

## 7. Boas Práticas e Regras de Implementação

- **Tipagem:** Sem erros de tipagem, nem mesmo warnings.

- **Evitar uso de comentarios:** O código deve ser autoexplicativo, evitando comentários desnecessários.

- **context_atual.md:** Sempre atualize o context_atual.md com as mudanças.

- **Componentização:** Priorizar componentes funcionais pequenos e reutilizáveis. Separar lógica de negócio em _Custom Hooks_.

- **Responsividade:** Garantir que todas as telas sejam responsivas, especialmente a tela de portaria, que pode ser acessada via dispositivos móveis.
