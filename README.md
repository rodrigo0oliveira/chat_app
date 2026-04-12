# Chat App

Aplicação de chat em tempo real desenvolvida como projeto acadêmico para a disciplina:

> **INTEGRAR INTERFACES E SERVIÇOS WEB — NOITE**

---

## Deploy

| Serviço | Plataforma | Link |
|---|---|---|
| Front-end | Vercel | [chat-app-three-beta-17.vercel.app](https://chat-app-three-beta-17.vercel.app/) |
| Back-end | Render | — |

---

## Equipe

| Nome | GitHub |
|---|---|
| Raffael Queiroga | [@queirogaraffael](https://github.com/queirogaraffael) |
| Rodrigo Oliveira | [@rodrigo0oliveira](https://github.com/rodrigo0oliveira) |

---

## Sobre o Projeto

O **Chat App** é uma plataforma de comunicação em tempo real que permite aos usuários:

- Criar e entrar em **salas públicas** de bate-papo
- Participar de **grupos** com múltiplos membros
- Trocar **mensagens diretas** com outros usuários
- Receber mensagens **instantaneamente** via WebSocket (protocolo STOMP)
- Autenticar-se de forma segura via **JWT (JSON Web Token)**

O projeto foi construído com uma arquitetura **cliente-servidor** desacoplada, onde o front-end e o back-end são aplicações independentes que se comunicam via API REST e WebSocket.

---

## Arquitetura Geral

```
┌──────────────────────────────────────────────────────────┐
│                       Chat App                            │
│                                                          │
│   ┌─────────────────────┐    ┌────────────────────────┐  │
│   │      Front-end      │    │       Back-end         │  │
│   │  React + TypeScript │    │  Node.js + Express     │  │
│   │       (Vite)        │    │   + MongoDB + STOMP    │  │
│   │                     │    │                        │  │
│   │  - SPA com rotas    │    │  - API REST (JWT)      │  │
│   │  - Axios (HTTP)     │◄──►│  - WebSocket (STOMP)  │  │
│   │  - STOMP Client     │    │  - Message Broker      │  │
│   └─────────────────────┘    │  - MongoDB Atlas       │  │
│                               └────────────────────────┘  │
└──────────────────────────────────────────────────────────┘
```

---

## Tecnologias

### Front-end
- **React 19** — Biblioteca de UI
- **TypeScript** — Tipagem estática
- **Vite** — Bundler e servidor de desenvolvimento
- **React Router DOM** — Roteamento client-side
- **Axios** — Requisições HTTP
- **@stomp/stompjs** — Cliente WebSocket com protocolo STOMP
- **Lucide React** — Ícones SVG
- **CSS Vanilla** — Estilização com glassmorphism e variáveis CSS

### Back-end
- **Node.js + Express** — Servidor HTTP e API REST
- **TypeScript** — Tipagem estática
- **MongoDB + Mongoose** — Banco de dados NoSQL
- **WebSocket (ws)** — Servidor WebSocket
- **STOMP** — Protocolo de mensageria sobre WebSocket (implementado manualmente)
- **JWT (jsonwebtoken)** — Autenticação
- **bcrypt** — Hash de senhas

---

## Estrutura do Repositório

```
chat_app/
├── front-end/        # Aplicação React (SPA)
│   ├── src/
│   │   ├── pages/    # Telas da aplicação
│   │   ├── components/
│   │   └── services/ # Axios, STOMP e gerenciamento de token
│   └── README.md     # Documentação do front-end
│
├── back-end/         # API REST + Servidor WebSocket
│   ├── src/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── middleware/
│   │   └── websocket/
│   └── README.md     # Documentação do back-end
│
├── docs/             # Documentação adicional (diagramas, modelos de dados)
└── test/             # Testes e coleções Postman
```

---

## Como Rodar o Projeto

### Pré-requisitos

- [Node.js](https://nodejs.org/) v18+
- [npm](https://www.npmjs.com/) v9+
- Conta no [MongoDB Atlas](https://www.mongodb.com/atlas) (ou MongoDB local)

### 1. Back-end

```bash
cd back-end

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Editar MONGO_URI e JWT_SECRET no .env

# Iniciar em modo desenvolvimento
npm run dev
```

O servidor sobe em `http://localhost:3000`.

### 2. Front-end

```bash
cd front-end

# Instalar dependências
npm install

# Configurar variáveis de ambiente
# Criar arquivo .env com:
# VITE_API_URL=http://localhost:3000
# VITE_WS_URL=ws://localhost:3000

# Iniciar em modo desenvolvimento
npm run dev
```

A interface estará disponível em `http://localhost:5173`.

---

## Comunicação em Tempo Real

A troca de mensagens utiliza o protocolo **STOMP sobre WebSocket**. Ao entrar em uma sala, o front-end:

1. Abre uma conexão WebSocket com o back-end
2. Autentica via frame `CONNECT` com o JWT no cabeçalho
3. Inscreve-se no tópico `/topic/rooms.<roomId>` para receber mensagens
4. Publica novas mensagens no destino `/app/chat.sendMessage`

O back-end conta com um **Message Broker in-memory** que distribui cada mensagem para todos os clientes inscritos na sala correspondente.

> Para mais detalhes sobre o protocolo STOMP e a arquitetura do broker, consulte o [`back-end/README.md`](./back-end/README.md).

---

## Autenticação

O fluxo de autenticação segue o padrão **JWT (JSON Web Token)**:

1. Usuário realiza login via `POST /auth/login`
2. O back-end retorna um token JWT
3. O front-end armazena o token no `localStorage`
4. Todas as requisições HTTP incluem o token no cabeçalho `Authorization: Bearer <token>`
5. A conexão WebSocket também é autenticada usando o mesmo token

---

## Documentação Adicional

| Documento | Descrição |
|---|---|
| [`back-end/README.md`](./back-end/README.md) | Arquitetura do back-end, API REST, protocolo STOMP e Message Broker |
| [`front-end/README.md`](./front-end/README.md) | Tecnologias, estrutura e serviços do front-end |
| [`docs/`](./docs/) | Diagramas e modelagem de dados |
| [`test/`](./test/) | Coleções Postman para testes da API |
