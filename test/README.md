# Testes – Chat APP

Este diretório contém a coleção Postman e o ambiente de variáveis para testar a API REST do Chat APP.

---

## Estrutura

```
postman/
├── collection/
│   └── Chat APP.postman_collection.json       # Coleção com todas as requisições HTTP
└── environment/
    └── chat-websocket-environment.postman_environment.json  # Variáveis de ambiente
```

---

## Requisições disponíveis

### Auth
| Nome       | Método | Endpoint            | Descrição                                                     |
|------------|--------|---------------------|---------------------------------------------------------------|
| Register   | POST   | `/auth/register`    | Cria um novo usuário com `username`, `email` e `password`     |
| Login      | POST   | `/auth/login`       | Autentica o usuário e salva o `authToken` automaticamente     |

> O endpoint **Login** possui um script de teste que extrai o token JWT da resposta e o salva na variável de ambiente `authToken` automaticamente. Não é necessário copiar o token manualmente.

---

### User
| Nome    | Método | Endpoint        | Auth     | Descrição                          |
|---------|--------|-----------------|----------|------------------------------------|
| Profile | GET    | `/user/profile` | Bearer   | Retorna os dados do usuário logado |

---

### Rooms
| Nome         | Método | Endpoint        | Auth   | Descrição                                          |
|--------------|--------|-----------------|--------|----------------------------------------------------|
| All Rooms    | GET    | `/rooms`        | Bearer | Lista todas as salas disponíveis                   |
| Public Rooms | GET    | `/rooms/public` | Bearer | Lista apenas as salas públicas                     |
| Direct Room  | POST   | `/rooms/direct` | Bearer | Cria ou retorna uma sala de conversa direta (DM)   |
| Public room  | POST   | `/rooms/group`  | Bearer | Cria uma sala de grupo com nome e lista de membros |

---

### Messages
| Nome     | Método | Endpoint                        | Auth   | Descrição                           |
|----------|--------|---------------------------------|--------|-------------------------------------|
| Messages | GET    | `/messages/:roomId/messages`    | Bearer | Lista as mensagens de uma sala      |

---

### API Test
| Nome     | Método | Endpoint  | Descrição                        |
|----------|--------|-----------|----------------------------------|
| API Test | GET    | `/test`   | Verifica se a API está no ar     |

---

## Variáveis de ambiente

O arquivo de ambiente `chat-websocket-environment.postman_environment.json` define as seguintes variáveis:

| Variável         | Descrição                                                      |
|------------------|----------------------------------------------------------------|
| `baseUrl`        | URL base da API (ex: `http://localhost:8080`)                  |
| `authToken`      | Token JWT preenchido automaticamente após o Login              |
| `roomIdMessages` | ID de uma sala para buscar mensagens                           |
| `targetUserId`   | ID do usuário alvo para criar uma sala de DM                   |
| `groupName`      | Nome do grupo a ser criado                                     |
| `userId1`        | ID do primeiro membro do grupo                                 |
| `userId2`        | ID do segundo membro do grupo                                  |
| `userId3`        | ID do terceiro membro do grupo                                 |

---

## Como rodar a coleção

### 1. Importe a coleção e o ambiente no Postman

1. Abra o **Postman**
2. Clique em **Import** (canto superior esquerdo)
3. Importe o arquivo:
   - `postman/collection/Chat APP.postman_collection.json`
4. Repita o processo e importe o ambiente:
   - `postman/environment/chat-websocket-environment.postman_environment.json`

### 2. Selecione o ambiente

No canto superior direito do Postman, selecione o ambiente **`chat-websocket-environment`** no seletor de ambientes.

### 3. Configure a URL base

Com o ambiente selecionado, clique no ícone de olho 👁 (Environment Quick Look) ou acesse **Environments** e defina a variável `baseUrl` com a URL onde a API está rodando, por exemplo:

```
http://localhost:8080
```

### 4. Execute o fluxo de autenticação primeiro

Antes de executar qualquer requisição autenticada, execute **Register** e depois **Login** na pasta **Auth**.

> Após o **Login**, o token JWT é automaticamente salvo na variável `authToken` via script de teste, e será injetado nas demais requisições automaticamente.

### 5. Preencha as variáveis conforme necessário

Algumas requisições dependem de variáveis adicionais que precisam ser preenchidas manualmente:

- **Messages**: defina `roomIdMessages` com o ID da sala desejada
- **Direct Room**: defina `targetUserId` com o ID do usuário destino
- **Public room (group)**: defina `groupName`, `userId1`, `userId2` e `userId3`

---

## Requisições WebSocket não inclusas

As requisições WebSocket (envio de mensagens em tempo real, inscrição em salas, etc.) **não estão presentes nesta coleção**.

O Postman **não oferece suporte ao protocolo STOMP**, que é o protocolo de mensageria utilizado neste projeto sobre WebSocket. Por isso, essas interações não podem ser testadas via Postman.

Para testar a comunicação em tempo real, utilize ferramentas como:
- A própria interface web da aplicação
- [STOMP.js](https://stomp-js.github.io/) em um cliente customizado
- Ferramentas como **wscat** ou **WebSocket King** (apenas para WebSocket puro, sem STOMP)
