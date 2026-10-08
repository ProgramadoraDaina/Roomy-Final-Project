# Date2gether

Clon de Google Meet — proyecto final. Monorepo simple con dos partes:

- **Backend** (raíz del repo): NestJS + TypeScript + Socket.io + Drizzle ORM (PostgreSQL)
- **Frontend** (`client/`): Next.js 15.5.27 (App Router) + React 19 + TypeScript

Todo con **pnpm** como gestor de paquetes (no usar npm ni yarn).

Por ahora la base incluye **salas** (crear una sala, unirse por código) y **chat en tiempo real** dentro de cada sala. La videollamada (WebRTC) se agrega en una siguiente etapa.

## Stack

- [NestJS](https://nestjs.com/) — framework backend
- [Socket.io](https://socket.io/) (vía `@nestjs/websockets` + `@nestjs/platform-socket.io`) — WebSocket para salas y chat
- [Drizzle ORM](https://orm.drizzle.team/) + PostgreSQL — acceso a base de datos
- [Next.js](https://nextjs.org/) 15.5.27 (App Router) — frontend
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

Next.js se actualizó de **15.1.6 a 15.5.27** para incorporar parches de seguridad. La dependencia está declarada en `client/package.json` y la versión instalada queda registrada en `pnpm-lock.yaml`. La interfaz sigue usando React 19, con las rutas de Next.js App Router.

El workspace fija PostCSS **8.5.23** para Next.js mediante `overrides` en `pnpm-workspace.yaml`, corrigiendo las alertas de seguridad de esa dependencia. Tras cambiar versiones, ejecutá `pnpm install` en la raíz y conservá el lockfile actualizado.

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

## Hoja de ruta hacia una experiencia tipo Meet

Date2gether ya permite crear salas, entrar por código y chatear en tiempo real. Las salas y los mensajes se guardan en PostgreSQL; los participantes conectados se mantienen en memoria y se identifican en la interfaz por su nombre de invitado.

Las funcionalidades de esta hoja de ruta están **pendientes de implementación**. El objetivo de la primera entrega es que dos personas puedan crear una sala, compartir el enlace, entrar desde dispositivos distintos, verse, escucharse, silenciarse y salir correctamente.

### Validar la base actual

Antes de ampliar el sistema, comprobar el flujo existente con el backend y PostgreSQL:

- [ ] Crear una sala y entrar desde dos pestañas con nombres distintos.
- [ ] Verificar que los mensajes lleguen a ambos participantes en tiempo real.
- [ ] Volver a entrar y comprobar que se recupera el historial del chat.
- [ ] Salir de la sala y comprobar que se actualiza la lista de participantes.

### Entregas propuestas

| Orden | Funcionalidad | Alcance |
| ----- | ------------- | ------- |
| 1 | Pantalla previa | Previsualizar la cámara, elegir cámara y micrófono y entrar con audio o video apagados. Explicar cómo habilitar permisos cuando se rechazan. |
| 2 | Audio y video | Conectar dos participantes, transmitir sus medios y permitir silenciar el micrófono y apagar la cámara. |
| 3 | Interfaz de reunión | Mostrar una grilla de participantes, una barra inferior de controles y paneles laterales para chat y personas. Incluir un botón para copiar el enlace de invitación. |
| 4 | Compartir pantalla | Presentar una pantalla o ventana, detener la presentación y volver a la vista habitual de la reunión. |
| 5 | Autenticación e identidad | Implementar registro, inicio y cierre de sesión. Identificar al organizador, asociar mensajes con usuarios autenticados y permitir invitados mediante un enlace. |
| 6 | Anfitrión y acceso | Incorporar sala de espera, admitir o rechazar solicitudes, expulsar participantes, bloquear nuevos ingresos y finalizar la reunión para todos. Depende de la identidad y los permisos de la entrega anterior. |
| 7 | Reconexión y persistencia | Mostrar el estado de conexión, recuperar una sesión sin duplicar participantes y guardar quién creó la reunión y cuándo ingresó o salió cada persona. |

La pantalla previa es el siguiente avance visible recomendado. Permite probar dispositivos y permisos antes de conectar la primera videollamada. La autenticación puede desarrollarse en paralelo y debe estar lista antes de habilitar controles de anfitrión.

### Elegir cómo transportar audio y video

La arquitectura de medios debe definirse antes de implementar las conexiones entre participantes:

- **WebRTC directo, para aprender y construir una primera llamada:** usar el Gateway de Socket.io para intercambiar ofertas, respuestas y candidatos ICE entre los navegadores. Configurar servidores STUN/TURN y probar conexiones entre distintas redes. Referencias: [dispositivos multimedia](https://webrtc.org/getting-started/media-devices), [conexiones y señalización WebRTC](https://webrtc.org/getting-started/peer-connections).
- **Servidor de medios, para avanzar hacia reuniones grupales:** evaluar [LiveKit](https://github.com/livekit/livekit), que proporciona una SFU para recibir y distribuir audio y video entre participantes. Su SDK y servidor gestionan las conexiones de medios. NestJS puede seguir gestionando usuarios, permisos y datos del sistema.

Next.js se ocupa de la interfaz y las rutas. Socket.io mantiene el chat y los eventos de la sala, y puede actuar como canal de señalización si se elige WebRTC directo. El audio y el video se transportan con WebRTC, de forma directa o a través de la SFU seleccionada.

Para la pantalla previa, `getUserMedia()` permite obtener cámara y micrófono, y `enumerateDevices()` permite consultar los dispositivos disponibles. Las API del navegador se utilizan desde los componentes de cliente de Next.js.

### Identidad y datos de la reunión

- [ ] Asignar un ID único a cada participante. Dos personas llamadas “Alex” deben poder coexistir sin mezclar su presencia o sus mensajes.
- [ ] Separar la identidad del participante del nombre visible y de la conexión temporal del socket.
- [ ] Asociar cada mensaje con el usuario o participante que lo envió.
- [ ] Guardar el organizador, los participantes y sus horarios de ingreso y salida.
- [ ] Gestionar los estados activa y cerrada de la reunión y validar el acceso desde el backend.
- [ ] Diferenciar una sala inexistente de una sala cerrada y mostrar un mensaje claro en cada caso.

### Mejoras de participación y experiencia

- [ ] Levantar la mano y enviar reacciones para participar sin interrumpir.
- [ ] Fijar un participante para mantener su video destacado.
- [ ] Resaltar a la persona que está hablando.
- [ ] Conservar el borrador del chat y avisar cuando un mensaje no pudo enviarse.
- [ ] Ofrecer controles cómodos en pantallas pequeñas y permitir navegar con teclado.
- [ ] Explicar los errores de permisos o dispositivos y cómo continuar o resolverlos.
- [ ] Al abandonar la sala, cerrar las conexiones, liberar cámara y micrófono y actualizar la presencia.

### Criterios de aceptación

Cada funcionalidad debe tener un comportamiento concreto que pueda verificarse. Estos ejemplos sirven como base para pruebas manuales y, cuando corresponda, automatizadas:

| Situación | Resultado esperado |
| --------- | ------------------ |
| Rechazo el permiso de cámara | Puedo entrar con la cámara apagada y veo cómo habilitarla después. |
| Dos personas usan el mismo nombre | Ambas aparecen como participantes distintos y sus mensajes se atribuyen correctamente. |
| Dos dispositivos entran a la misma sala | Pueden verse y escucharse; verificar también desde redes distintas. |
| Silencio mi micrófono | Los demás dejan de escucharme y ven mi estado de micrófono apagado. |
| Comparto una pantalla y detengo la presentación | Los demás ven la presentación y luego recuperan la vista habitual de la reunión. |
| Se interrumpe temporalmente la conexión | Veo “Reconectando…” y vuelvo sin duplicar mi participante. |
| Un mensaje no pudo enviarse | Veo el estado de fallo y conservo el texto para volver a intentarlo. |
| Salgo de la sala | Se liberan cámara y micrófono y dejo de aparecer entre los participantes conectados. |
| El anfitrión finaliza la reunión | Todos salen y el mismo enlace informa que la reunión está cerrada. |
| Uso un teléfono o navego con teclado | Los controles principales siguen siendo accesibles y utilizables. |

### Etapa posterior

Planificar estas funciones después de completar y validar las reuniones básicas:

- [ ] Grabación de reuniones.
- [ ] Subtítulos.
- [ ] Fondos virtuales.
