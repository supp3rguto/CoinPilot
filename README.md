# ✈️ CoinPilot - Dashboard de Logística e Precificação Dinâmica

![Badge Angular](https://img.shields.io/badge/Angular-DD0031?style=for-the-badge&logo=angular&logoColor=white)
![Badge Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![Badge Socket.io](https://img.shields.io/badge/Socket.io-black?style=for-the-badge&logo=socket.io&badgeColor=010101)

Este projeto é uma plataforma web full-stack para a **simulação, monitoramento e gestão financeira de uma operação logística em tempo real**.
A aplicação demonstra o uso de **WebSockets** para transmitir dados de alta frequência (preços, vendas, status) entre um servidor simulador e um dashboard reativo, sem a necessidade de recarregar a página.

## 🎓 Contexto do Projeto

O objetivo foi criar uma prova de conceito (PoC) de um sistema "Backend-for-Frontend" (BFF) capaz de gerenciar estados complexos e entregá-los ao cliente com latência mínima.

## ✨ Funcionalidades Principais

* **Simulador de Precificação Estocástica:** O backend utiliza um algoritmo que altera os preços base das rotas considerando variáveis dinâmicas como **Horário de Pico**, **Clima** (Chuva) e **Eventos Locais**.
* **Dashboard em Tempo Real:** Visualização gráfica instantânea da flutuação de preços utilizando a biblioteca **ngx-charts**.
* **Gestão de Rotas (CRUD):** Interface para adicionar e remover rotas da simulação dinamicamente, utilizando formulários reativos.
* **Ledger Financeiro ao Vivo:** Simulação automática de vendas com feed de transações, cálculo de lucro, receita e custos operacionais atualizados a cada venda.
* **Controle Remoto do Servidor:** A página de configurações permite "pausar" ou "ativar" módulos específicos do backend (ex: parar a chuva ou pausar vendas) via comandos WebSocket.

## 📸 Galeria do Sistema

| Dashboard Principal | Gerenciador de Rotas |
|:---:|:---:|
| ![Dashboard](screenshots/dashboard.png) | ![Rotas](screenshots/routes.png) |
| **Monitoramento Financeiro** | **Configurações do Sistema** |
| ![Financeiro](screenshots/financial.png) | ![Configurações](screenshots/settings.png) |

## 🚀 Arquitetura e Tecnologias

A solução segue uma arquitetura **orientada a eventos**, onde o backend atua como a fonte da verdade e "empurra" (push) atualizações para o frontend.

### 🐍 Backend (Node.js)

O backend é um servidor de simulação contínua desenvolvido em **Node.js**.

* **Express:** Framework para criar os endpoints REST (POST/DELETE) utilizados na gestão de rotas.
* **Socket.io:** Biblioteca principal para estabelecer a comunicação bidirecional em tempo real (WebSockets).
* **Lógica de Estado:** Mantém o estado da simulação (clima, hora, ledger financeiro) em memória, persistindo os dados entre as conexões dos clientes.

### ⚛️ Frontend (Angular)

A interface é uma **Single-Page Application (SPA)** moderna e responsiva.

* **Angular 17+:** Utilizando a nova arquitetura de **Standalone Components**.
* **Angular Material:** Biblioteca de componentes de UI (Sidenav, Cards, Table, Slide Toggles) para um design profissional.
* **RxJS & Services:** Gerenciamento de estado global para garantir que os dados do gráfico e tabelas persistam durante a navegação entre as páginas.
* **Ngx-Charts:** Para renderização de gráficos vetoriais responsivos.

## 💻 Como Usar

A interface é dividida em quatro módulos principais acessíveis pela barra lateral:

1.  **Dashboard:**
    Acompanhe a flutuação de preços. Use o toggle "Ver Todas" para comparar todas as rotas ou selecione uma específica no dropdown.

2.  **Rotas:**
    Adicione novas rotas definindo "Origem", "Destino" e "Preço Base". As novas rotas entram imediatamente na simulação de preços e vendas.

3.  **Financeiro:**
    Visualize o "pulso" do negócio. Acompanhe o lucro total, receita e um feed das últimas transações geradas pelo simulador de vendas.

4.  **Configurações:**
    Atue como um "operador do sistema". Ligue ou desligue a simulação de Chuva, Eventos ou Vendas e veja o impacto imediato no Dashboard e no Financeiro.

## 👨‍💻 Autor

**Augusto Ortigoso Barbosa**

* **GitHub:** [github.com/supp3rguto](https://github.com/supp3rguto)
* **LinkedIn:** [linkedin.com/in/augusto-barbosa-769602194](https://www.linkedin.com/in/augusto-barbosa-769602194)
