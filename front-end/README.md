# Chat App — Front-end

Interface web em tempo real para o sistema de chat, desenvolvida com **React**, **TypeScript** e **Vite**.

---

## Índice

1. [Visão Geral](#visão-geral)
2. [Tecnologias Utilizadas](#tecnologias-utilizadas)
3. [Arquitetura do Projeto](#arquitetura-do-projeto)
4. [Estrutura de Pastas](#estrutura-de-pastas)
5. [Páginas e Funcionalidades](#páginas-e-funcionalidades)
6. [Serviços](#serviços)
7. [Variáveis de Ambiente](#variáveis-de-ambiente)
8. [Como Rodar Localmente](#como-rodar-localmente)
9. [Scripts Disponíveis](#scripts-disponíveis)

---

## Visão Geral

O front-end é uma **SPA (Single Page Application)** que se comunica com o back-end de duas formas:

| Canal | Protocolo | Finalidade |
|---|---|---|
| HTTP | REST/JSON | Autenticação, listagem de salas, histórico de mensagens |
| WebSocket | STOMP | Troca de mensagens em tempo real |

A autenticação é feita via **JWT (JSON Web Token)**, armazenado localmente no navegador e anexado automaticamente a cada requisição HTTP e à conexão WebSocket.

---

## Tecnologias Utilizadas

### Core

| Tecnologia | Versão | Função |
|---|---|---|
| [React](https://react.dev/) | ^19 | Biblioteca principal de UI |
| [TypeScript](https://www.typescriptlang.org/) | ~6.0 | Tipagem estática |
| [Vite](https://vite.dev/) | ^8.0 | Bundler e servidor de desenvolvimento |

### Roteamento

| Tecnologia | Versão | Função |
|---|---|---|
| [React Router DOM](https://reactrouter.com/) | ^7 | Roteamento client-side (SPA) |

### Comunicação com o Back-end

| Tecnologia | Versão | Função |
|---|---|---|
| [Axios](https://axios-http.com/) | ^1.15 | Cliente HTTP para chamadas REST |
| [@stomp/stompjs](https://stomp-js.github.io/stomp-websocket/) | ^7.3 | Cliente WebSocket com protocolo STOMP |

### UI / Ícones

| Tecnologia | Versão | Função |
|---|---|---|
| [Lucide React](https://lucide.dev/) | ^1.8 | Biblioteca de ícones SVG |
| CSS Vanilla | — | Estilização custom com variáveis CSS e glassmorphism |

### Qualidade de Código

| Tecnologia | Versão | Função |
|---|---|---|
| [ESLint](https://eslint.org/) | ^9 | Linting estático |
| [eslint-plugin-react-hooks](https://www.npmjs.com/package/eslint-plugin-react-hooks) | ^7 | Regras de hooks do React |
| [typescript-eslint](https://typescript-eslint.io/) | ^8 | Regras de lint com suporte a TypeScript |

---

## Arquitetura do Projeto

```
┌────────────────────────────────────────────────────┐
│                  React SPA (Vite)                   │
│                                                    │
│  Pages          Components          Services        │
│  ┌──────────┐   ┌────────────┐   ┌─────────────┐  │
│  │ Login    │   │ Layout     │   │ api.ts      │  │
│  │ PublicR  │   │ Sidebar    │   │  (Axios)    │  │
│  │ Groups   │   │ Navbar     │   ├─────────────┤  │
│  │ Direct   │   └────────────┘   │ websocket   │  │
│  │ Chat     │                    │  .ts(STOMP) │  │
│  └────┬─────┘                    ├─────────────┤  │
│       │                          │ token.ts    │  │
│       │                          │  (JWT)      │  │
│       └──────────────────────────┘             │  │
│                                                    │
│       REST (Axios) ──────────────► API Back-end    │
│       WebSocket (STOMP) ────────► WS Back-end      │
└────────────────────────────────────────────────────┘
```

O roteamento é controlado pelo **React Router DOM**. Rotas protegidas verificam a presença do JWT antes de renderizar. O `Layout` é um componente wrapper que envolve as páginas autenticadas, fornecendo sidebar e navbar comuns.

---

## Estrutura de Pastas

```
front-end/
├── public/                    # Assets estáticos
├── src/
│   ├── assets/                # Imagens e recursos do projeto
│   ├── components/
│   │   └── Layout/            # Componente de layout (sidebar + navbar)
│   ├── pages/
│   │   ├── Login/             # Tela de login e registro
│   │   ├── PublicRooms/       # Listagem e entrada em salas públicas
│   │   ├── Groups/            # Salas de grupo
│   │   ├── DirectMessages/    # Mensagens diretas entre usuários
│   │   └── Chat/              # Tela principal de chat em tempo real
│   ├── services/
│   │   ├── api.ts             # Instância Axios com interceptor de JWT
│   │   ├── token.ts           # Utilitários de leitura/escrita do token
│   │   └── websocket.ts       # Serviço STOMP (connect, subscribe, send)
│   ├── App.tsx                # Definição de rotas
│   ├── main.tsx               # Entry point do React
│   ├── index.css              # Estilos globais e variáveis CSS
│   └── App.css                # Estilos do componente App
├── index.html                 # HTML base do Vite
├── vite.config.ts             # Configuração do Vite
├── tsconfig.json              # Configuração TypeScript
├── tsconfig.app.json          # Configuração TypeScript (app)
├── tsconfig.node.json         # Configuração TypeScript (node/vite)
├── eslint.config.js           # Configuração do ESLint
└── package.json
```

---

## Páginas e Funcionalidades

### `/` — Login

Tela de entrada da aplicação. Permite que o usuário faça **login** ou **registro**. Após autenticação bem-sucedida, o JWT é armazenado via `tokenService` e o usuário é redirecionado para `/public-rooms`.

### `/public-rooms` — Salas Públicas

Lista todas as salas públicas disponíveis. O usuário pode clicar em uma sala para entrar, sendo redirecionado para a tela de chat.

### `/groups` — Grupos

Listagem e acesso a salas de grupo (canais com múltiplos membros).

### `/direct` — Mensagens Diretas

Canal de mensagens privadas entre dois usuários.

### `/chat/:roomId` — Chat

Tela principal de conversa em tempo real. Ao entrar:
1. Conecta-se ao broker WebSocket via STOMP (`wsService.connect()`)
2. Inscreve-se no destino `/topic/rooms.<roomId>` para receber mensagens
3. Exibe o histórico de mensagens carregado via REST
4. Permite envio de novas mensagens via `wsService.sendMessage()`

---

## Serviços

### `api.ts` — Axios

Cria uma instância configurada do Axios apontando para a URL base da API (`VITE_API_URL`). Um **interceptor de requisição** lê automaticamente o JWT do storage e o adiciona ao cabeçalho `Authorization: Bearer <token>` em todas as chamadas.

```ts
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
});
```

### `token.ts` — Gerenciamento de JWT

Módulo responsável por escrever, ler e remover o token de autenticação do `localStorage`. Centraliza o acesso ao token para evitar duplicação de lógica.

### `websocket.ts` — STOMP Client

Encapsula toda a lógica de WebSocket usando `@stomp/stompjs`:

| Método | Descrição |
|---|---|
| `connect(onConnect, onError)` | Abre a conexão STOMP com autenticação via JWT |
| `disconnect()` | Encerra a conexão e cancela subscrições ativas |
| `subscribeToRoom(roomId, cb)` | Inscreve-se em `/topic/rooms.<roomId>` |
| `sendMessage(roomId, content)` | Publica uma mensagem em `/app/chat.sendMessage` |

---

## Variáveis de Ambiente

Crie um arquivo `.env` na raiz do diretório `front-end/` com as seguintes variáveis:

```env
# URL base da API REST do back-end
VITE_API_URL=http://localhost:3000

# URL do servidor WebSocket
VITE_WS_URL=ws://localhost:3000
```

> **Atenção:** Todas as variáveis de ambiente do Vite **devem** começar com o prefixo `VITE_` para serem expostas ao código do navegador.

---

## Como Rodar Localmente

### Pré-requisitos

- [Node.js](https://nodejs.org/) v18 ou superior
- [npm](https://www.npmjs.com/) v9 ou superior
- Back-end do Chat App rodando (ver `back-end/README.md`)

### Passo a passo

```bash
# 1. Acesse o diretório do front-end
cd front-end

# 2. Instale as dependências
npm install

# 3. Configure as variáveis de ambiente
cp .env.example .env
# Edite o .env com as URLs corretas do back-end

# 4. Inicie o servidor de desenvolvimento
npm run dev
```

A aplicação estará disponível em `http://localhost:5173`.

---

## Scripts Disponíveis

| Script | Comando | Descrição |
|---|---|---|
| Desenvolvimento | `npm run dev` | Inicia o servidor de desenvolvimento com HMR |
| Build | `npm run build` | Compila TypeScript e gera bundle de produção |
| Preview | `npm run preview` | Serve o bundle de produção localmente |
| Lint | `npm run lint` | Executa o ESLint em todo o projeto |
