# Plataforma de Eventos e Ingressos

## Sobre o Projeto

Esta aplicação consiste em uma Plataforma de Eventos e Ingressos desenvolvida para gerenciar o ciclo completo de publicação de eventos, comercialização e validação de acessos. O sistema conecta organizadores, clientes e operadores de portaria em um ambiente integrado, simulando o fluxo real de grandes plataformas de entretenimento.

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
