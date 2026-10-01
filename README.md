# Roomy

Clon de Google Meet — proyecto final. Monorepo simple con dos partes:

- **Backend** (raíz del repo): NestJS + TypeScript + Socket.io + Drizzle ORM (PostgreSQL)
- **Frontend** (`client/`): Next.js + TypeScript

Todo con **pnpm** como gestor de paquetes (no usar npm ni yarn).

Por ahora la base incluye **salas** (crear una sala, unirse por código) y **chat en tiempo real** dentro de cada sala. La videollamada (WebRTC) se agrega en una siguiente etapa.

## Stack

- [NestJS](https://nestjs.com/) — framework backend
- [Socket.io](https://socket.io/) (vía `@nestjs/websockets` + `@nestjs/platform-socket.io`) — WebSocket para salas y chat
- [Drizzle ORM](https://orm.drizzle.team/) + PostgreSQL — acceso a base de datos
- [Next.js](https://nextjs.org/) (App Router) — frontend
- pnpm — gestor de paquetes (no usar npm ni yarn)

## Requisitos

- Node.js 20+
- pnpm (`corepack enable` o `npm i -g pnpm`)
- Docker (para levantar PostgreSQL local) — o un Postgres propio

## Puesta en marcha

```bash
# 1. Instalar dependencias
pnpm install

# 2. Copiar variables de entorno
cp .env.example .env

# 3. Levantar PostgreSQL con Docker
docker compose up -d

# 4. Generar y aplicar las migraciones de la base de datos
pnpm db:generate
pnpm db:migrate

# 5. Levantar el servidor en modo desarrollo
pnpm start:dev
```

El servidor queda escuchando en `http://localhost:3001` (configurable en `.env` con `PORT`).

### Frontend (Next.js)

En otra terminal:

```bash
cd client
pnpm install
cp .env.example .env   # NEXT_PUBLIC_API_URL, por defecto http://localhost:3001
pnpm dev
```

El frontend queda en `http://localhost:3002` (puerto fijo, para no chocar con el backend en `3001`). Necesita el backend corriendo para poder crear/unirse a salas.

## Estructura del proyecto

```
src/                            # backend (NestJS)
├── main.ts                     # bootstrap de Nest
├── app.module.ts                # módulo raíz
├── db/
│   ├── schema.ts                # tablas de Drizzle (rooms, messages)
│   └── drizzle.module.ts        # provider global de la conexión a la DB
├── common/
│   └── generate-room-code.ts    # genera códigos tipo "abc-defg-hij"
└── modules/
    ├── rooms/                   # API REST para crear/consultar salas
    │   ├── dto/
    │   ├── rooms.controller.ts
    │   ├── rooms.service.ts
    │   └── rooms.module.ts
    └── chat/                    # WebSocket Gateway: salas + chat en vivo
        ├── dto/
        ├── chat.gateway.ts
        ├── chat.service.ts
        └── chat.module.ts

client/                         # frontend (Next.js)
└── src/
    ├── app/
    │   ├── layout.tsx            # layout raíz
    │   ├── page.tsx              # "/" — crear/unirse a una sala
    │   └── room/[code]/page.tsx  # "/room/:code" — sala: usuarios + chat en vivo
    └── lib/
        ├── api.ts                # llamadas REST al backend
        └── socket.ts             # conexión Socket.io al namespace /rooms
```

## API REST

| Método | Ruta          | Descripción                          |
| ------ | ------------- | ------------------------------------- |
| POST   | `/rooms`      | Crea una sala. Body: `{ "name": string }` |
| GET    | `/rooms/:code`| Devuelve la sala por su código        |

## WebSocket (namespace `/rooms`)

Conectate al namespace `/rooms` (ej. `io("http://localhost:3001/rooms")`).

### Eventos que el cliente envía

| Evento      | Payload                          | Descripción                              |
| ----------- | --------------------------------- | ----------------------------------------- |
| `joinRoom`  | `{ code: string, userName: string }` | Une el socket a la sala con ese código |
| `sendMessage` | `{ content: string }`           | Envía un mensaje de chat a la sala actual |
| `leaveRoom` | —                                  | Sale de la sala actual                    |

### Eventos que el servidor emite

| Evento        | Payload                                | Cuándo                                          |
| ------------- | ---------------------------------------- | ------------------------------------------------ |
| `roomHistory` | `Message[]`                              | Al unirte, historial de chat de la sala          |
| `roomUsers`   | `string[]` (nombres)                     | Al unirte, lista de usuarios ya conectados       |
| `userJoined`  | `{ userName: string }`                   | A los demás, cuando alguien se une               |
| `userLeft`    | `{ userName: string }`                   | A los demás, cuando alguien se va o se desconecta |
| `newMessage`  | `Message`                                | A toda la sala, cuando llega un mensaje nuevo    |
| `error`       | `{ message: string }`                    | Sala inexistente, o mensaje sin haberte unido    |

## Scripts útiles

```bash
pnpm start:dev     # servidor en modo watch
pnpm build         # compila a dist/
pnpm start:prod    # corre la build compilada

pnpm db:generate   # genera migraciones SQL a partir de src/db/schema.ts
pnpm db:migrate    # aplica las migraciones pendientes a la DB
pnpm db:studio     # abre Drizzle Studio para inspeccionar la DB
```

Dentro de `client/`:

```bash
pnpm dev           # servidor de desarrollo de Next.js
pnpm build         # build de producción
pnpm start         # sirve el build de producción
```

## Próximos pasos sugeridos

- Autenticación de usuarios (hoy el chat usa solo un `userName` de invitado, sin login)
- Señalización WebRTC sobre este mismo Gateway para habilitar video/audio en vivo
- Persistir quién está en cada sala también en la base de datos (hoy es solo en memoria del proceso)
