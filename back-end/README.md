# Chat App — Back-end

API REST + WebSocket em tempo real com Node.js, Express, MongoDB e protocolo STOMP.

---

## Índice

1. [Visão Geral](#visão-geral)
2. [Conceitos Fundamentais](#conceitos-fundamentais)
   - [WebSocket](#websocket)
   - [STOMP](#stomp)
   - [Message Broker](#message-broker)
3. [Arquitetura do Projeto](#arquitetura-do-projeto)
4. [Fluxo Completo de uma Mensagem](#fluxo-completo-de-uma-mensagem)
5. [Estrutura de Pastas](#estrutura-de-pastas)
6. [Referência da API REST](#referência-da-api-rest)
7. [Como Rodar](#como-rodar)

---

## Visão Geral

O back-end expõe dois canais de comunicação:

| Canal | Protocolo | Finalidade |
|---|---|---|
| HTTP | REST/JSON | Autenticação, listagem de salas, histórico de mensagens |
| WebSocket | STOMP | Troca de mensagens em tempo real |

Ambos compartilham o **mesmo servidor HTTP** (o WebSocket é _upgraded_ a partir de uma conexão HTTP normal).

---

## Conceitos Fundamentais

### WebSocket

HTTP é um protocolo **request-response**: o cliente sempre inicia, o servidor sempre responde. Isso é ineficiente para chat — você precisaria ficar perguntando ao servidor a cada segundo se chegou uma mensagem nova (_polling_).

**WebSocket** resolve isso abrindo uma **conexão persistente e bidirecional** entre cliente e servidor. Após o _handshake_ inicial via HTTP (`Upgrade: websocket`), ambos os lados podem enviar dados a qualquer momento, sem overhead de cabeçalhos HTTP.

```
Cliente                      Servidor
  |--- HTTP GET (Upgrade) --->|
  |<-- 101 Switching Proto ---|
  |<======= WS frame ========>|   (bidirecional, persistente)
```

No Node.js usamos a biblioteca `ws`:

```ts
// src/index.ts
const wss = new WebSocketServer({ server }); // mesmo servidor HTTP
wss.on('connection', (ws) => {
  new StompHandler(ws, connectionId);
});
```

---

### STOMP

WebSocket é apenas um **transporte** — ele entrega bytes brutos sem nenhuma semântica de mensageria. O protocolo **STOMP** (Simple Text Oriented Messaging Protocol) adiciona uma camada de convenção em cima do WebSocket com:

- **Frames** com comando, cabeçalhos e corpo (similar ao HTTP)
- **Destinos** (`/topic/rooms.123`) para roteamento de mensagens
- **Subscriptions** para que um cliente declare interesse em um destino
- **Autenticação** via cabeçalhos no frame `CONNECT`

#### Estrutura de um Frame STOMP

```
COMMAND
header1:valor1
header2:valor2

corpo da mensagem
^@ ← NULL byte (terminador)
```

#### Comandos usados neste projeto

| Comando | Direção | Descrição |
|---|---|---|
| `CONNECT` | Cliente → Servidor | Abre sessão STOMP, envia JWT no cabeçalho `authorization` |
| `CONNECTED` | Servidor → Cliente | Confirma conexão autenticada |
| `SUBSCRIBE` | Cliente → Servidor | Inscreve-se em um destino (ex: `/topic/rooms.abc`) |
| `SEND` | Cliente → Servidor | Envia mensagem para um destino (ex: `/app/chat.sendMessage`) |
| `MESSAGE` | Servidor → Cliente | Servidor entrega mensagem para os inscritos |
| `DISCONNECT` | Cliente → Servidor | Encerra sessão STOMP |
| `ERROR` | Servidor → Cliente | Notifica erro ao cliente |

#### Parser implementado manualmente

Em vez de usar uma biblioteca pronta, este projeto tem um parser e serializador STOMP próprio (`StompParser`). Isso deixa claro o que acontece por baixo dos panos:

```ts
// src/websocket/stomp/StompParser.ts
static parse(rawMessage: string): StompFrame {
  // 1. Remove o NULL byte final
  // 2. Separa a primeira linha como COMMAND
  // 3. Lê as linhas seguintes como "chave:valor" até linha vazia
  // 4. O restante é o BODY
}

static serialize(command, headers, body): string {
  // Monta a string: COMMAND\nheader:valor\n\nbody\0
}
```

---

### Message Broker

Um **Message Broker** é um intermediário que desacopla quem **publica** mensagens de quem as **recebe**.

Sem broker, para enviar uma mensagem para 100 usuários em uma sala você precisaria de uma lista de conexões WebSocket e iterar sobre ela no mesmo lugar em que valida e salva a mensagem. Isso mistura responsabilidades.

Com broker:
- O `StompHandler` (SEND) chama `broker.publish(destino, mensagem)`
- O `InMemoryBroker` cuida de entregar para todos os inscritos naquele destino
- O `StompHandler` (SUBSCRIBE) registrou um callback no broker na hora que o cliente se inscreveu

```
Cliente A (SEND)
    │
    ▼
StompHandler.handleSend()
    │ salva no MongoDB
    │
    ▼
InMemoryBroker.publish("/topic/rooms.XYZ", mensagem)
    │
    ├──► callback do Cliente B (inscrito) ──► ws.send(MESSAGE frame)
    ├──► callback do Cliente C (inscrito) ──► ws.send(MESSAGE frame)
    └──► callback do Cliente D (inscrito) ──► ws.send(MESSAGE frame)
```

#### InMemoryBroker

A implementação usa um `Map` aninhado:

```ts
// Map<destination, Map<connectionId, callback>>
private topics: Map<string, Map<string, SubscriberCallback>>
```

- `subscribe(destination, connectionId, callback)` → registra o callback
- `unsubscribe(destination, connectionId)` → remove o callback
- `publish(destination, message)` → itera os callbacks e chama cada um

> **Limitação:** Por ser _in-memory_, se o servidor reiniciar todas as subscrições são perdidas. Em produção você usaria um broker externo como **Redis Pub/Sub** ou **RabbitMQ/Kafka**.

---

## Arquitetura do Projeto

```
┌─────────────────────────────────────────────────────┐
│                     Express App                      │
│                                                      │
│  REST Routes         WebSocket (ws://)               │
│  ┌──────────┐        ┌──────────────────────────┐   │
│  │ /auth    │        │  StompHandler              │   │
│  │ /rooms   │        │  - handleConnect (JWT)     │   │
│  │ /messages│        │  - handleSubscribe         │   │
│  └────┬─────┘        │  - handleSend              │   │
│       │              │  - handleDisconnect         │   │
│       │              └────────────┬────────────────┘   │
│       │                           │                    │
│  ┌────▼──────────────────────────▼────────────────┐  │
│  │              Services                            │  │
│  │  MessageService   RoomService   AuthService      │  │
│  └────────────────────┬────────────────────────────┘  │
│                        │                               │
│  ┌─────────────────────▼──────────────────────────┐  │
│  │             InMemoryBroker                       │  │
│  │  topics: Map<destination, Map<id, callback>>     │  │
│  └─────────────────────────────────────────────────┘  │
│                                                      │
│  ┌───────────────────────────────────────────────┐   │
│  │                   MongoDB                      │   │
│  │  Users  │  Rooms  │  RoomMembers  │  Messages  │   │
│  └───────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

---

## Fluxo Completo de uma Mensagem

### 1. Conexão e autenticação

```
Cliente                               Servidor
  |                                      |
  |-- WS Upgrade (HTTP) --------------> |
  |<- 101 Switching Protocols ----------|
  |                                      |
  |-- STOMP CONNECT                      |
  |   authorization: Bearer <JWT> -----> |
  |                               verifica JWT
  |<- CONNECTED ----------------------- |
```

### 2. Inscrição em uma sala

```
Cliente                               Servidor
  |-- STOMP SUBSCRIBE                    |
  |   destination: /topic/rooms.XYZ      |
  |   id: sub-0 ------------------------>|
  |                               broker.subscribe("/topic/rooms.XYZ", connId, cb)
  |<- RECEIPT (opcional) -------------- |
```

### 3. Envio de mensagem

```
Cliente A                          Servidor                      Cliente B
  |-- STOMP SEND                     |                               |
  |   destination: /app/chat.send    |                               |
  |   { roomId, content } ---------> |                               |
  |                            valida membership                     |
  |                            salva no MongoDB                      |
  |                            broker.publish("/topic/rooms.XYZ")    |
  |                                  |--> MESSAGE frame -----------> |
  |<- RECEIPT (opcional) ----------- |                               |
```

### 4. Histórico (REST)

```
Cliente                               Servidor
  |-- GET /messages/:roomId/messages -> |
  |   Authorization: Bearer <JWT>        |
  |                             Message.find({ roomId })
  |                             .populate('senderId', 'username')
  |<- 200 [ { ...msg, senderUsername } ]|
```

---

## Estrutura de Pastas

```
src/
├── index.ts                  # Entry point: Express + WebSocket server
├── controllers/
│   ├── auth/
│   │   └── authController.ts
│   └── chat/
│       ├── MessageController.ts
│       └── RoomController.ts
├── services/
│   ├── auth/
│   │   └── auth.ts
│   └── chat/
│       ├── MessageService.ts  # saveAndPublishMessage, getRoomMessages
│       └── RoomService.ts
├── models/
│   ├── User.ts
│   ├── Room.ts
│   ├── RoomMember.ts
│   └── Message.ts
├── routes/
│   ├── message.ts
│   ├── room.ts
│   ├── auth/
│   └── user/
├── middleware/
│   └── auth.ts               # JWT middleware para rotas REST
├── dtos/
│   └── chat.dto.ts           # Tipos de entrada/saída da API
└── websocket/
    ├── StompHandler.ts        # Lógica STOMP por conexão WebSocket
    ├── broker/
    │   ├── MessageBroker.ts   # Interface do broker
    │   └── InMemoryBroker.ts  # Implementação em memória (singleton)
    └── stomp/
        └── StompParser.ts     # Parser e serializer de frames STOMP

public/
├── client.html               # Página de listagem de salas
├── chat.html                 # Página de chat da sala
└── js/
    ├── stomp.js              # connect() / disconnect() + estado global
    ├── rooms.js              # getPublicRooms() / joinRoom() / subscribeRoom()
    ├── messages.js           # sendMessage() / showReceivedMessage() / findMessagesByRoomId()
    └── chat.js               # Lógica exclusiva da página chat.html
```

---

## Referência da API REST

### Auth

| Método | Rota | Descrição |
|---|---|---|
| `POST` | `/auth/register` | Cria um novo usuário |
| `POST` | `/auth/login` | Retorna JWT |

### Rooms

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/rooms/public` | Lista salas públicas |
| `POST` | `/rooms` | Cria uma sala |

### Messages

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/messages/:roomId/messages` | Histórico paginado da sala (com `?limit=` e `?before=`) |

> Todas as rotas (exceto `/auth`) exigem o cabeçalho `Authorization: Bearer <token>`.

---

## Como Rodar

```bash
# Instalar dependências
npm install

# Copiar e configurar variáveis de ambiente
cp .env.example .env
# Editar MONGO_URI e JWT_SECRET no .env

# Desenvolvimento (watch mode)
npm run dev

# Build de produção
npm run build
npm start
```

O servidor sobe em `http://localhost:3000`. Acesse `http://localhost:3000/client.html` para testar via browser.
