# Especificação de Arquitetura e Padrões - Frontend (Next.js)

## 1. Arquitetura

O frontend é construído utilizando o **Next.js**, aproveitando o modelo de rotas baseado no App Router, renderização híbrida (Server Components e Client Components) e otimização automática de performance.

- **Separação de Camadas:** Isolamento entre componentes visuais (UI components), gerenciamento de estado global/local, e camada de serviços/comunicação com a API do backend.

## 2. Stack Tecnológica

- **Framework:** Next.js (App Router)[cite: 1]
- **Linguagem:** TypeScript
- **Estilização:** Tailwind CSS
- **Gerenciamento de Estado / Fetching:** TanStack React Query (para cache e sincronização de dados com a API) ou hooks nativos com Context API para autenticação.
- **Validação de Formulários:** Zod + React Hook Form
- **Leitura de QR Code:** Bibliotecas compatíveis com WebRTC/câmera (ex: `html5-qrcode` ou `react-qr-reader`) para a tela de portaria.

## 3. Estrutura de Pastas

```text
src/
├── app/ # App Router do Next.js (páginas e rotas)
│ ├── (auth)/ # Rotas de login / autenticação
│ ├── organizer/ # Painel do Organizador (criação e gestão de eventos)
│ ├── client/ # Navegação de eventos, catálogo e "Meus Ingressos"
│ ├── gate/ # Tela de portaria (validação de QR Code por câmera ou manual)
| ├── page.tsx # Página inicial (landing page pública)
│ └── layout.tsx # Layout global
├── components/ # Componentes reutilizáveis de UI (botões, modais, cards)
├── services/ # Clientes HTTP configurados (Axios/Fetch) para comunicação com o backend
├── hooks/ # Custom hooks (ex: autenticação, escaneamento de câmera)
├── types/ # Tipagens globais e DTOs compartilhados com a API
└── utils/ # Funções utilitárias e formatadores (moeda, data, máscaras)
```

## 4. Regras de Implementação e Boas Práticas

- **Componentização:** Priorizar componentes funcionais pequenos e reutilizáveis. Separar lógica de negócio em _Custom Hooks_.
- **Perfis de Acesso (Papéis):** Garantir o redirecionamento e proteção de rotas com base nos três papéis exigidos[cite: 1]:
  1. _Organizador:_ Acesso à criação e gerenciamento de eventos[cite: 1].
  2. _Cliente:_ Acesso à listagem, compra simulada e aba "Meus Ingressos" (com exibição do QR Code e link de compartilhamento)[cite: 1].
  3. _Portaria:_ Acesso exclusivo à tela de validação de bilhetes via câmera ou código manual[cite: 1].
- **UX no Fluxo de Compra:** Clareza no feedback de carregamento durante requisições de pagamento simulado (confirmação ou recusa)[cite: 1].
- **Tratamento de Erros:** Exibição de mensagens amigáveis ao usuário via Toasts/Modais em caso de falhas de rede ou regras de negócio negadas pela API.

## 5. Testes

- **Testes de Componentes e Integração (Opcionais):** Utilizar Jest / Vitest junto com React Testing Library para validar componentes críticos de formulários, fluxo de reserva e renderização do QR Code.
- **Testes E2E (Opcionais):** Utilizar Playwright ou Cypress para simular o fluxo de ponta a ponta (Cliente compra -> Organizador vê -> Portaria valida).
