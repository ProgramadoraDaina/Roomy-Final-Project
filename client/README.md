# Roomy — client

Frontend de Roomy construido con [Next.js](https://nextjs.org/) **15.5.27** (App Router) + React 19 + TypeScript.

Next.js se actualizó desde **15.1.6** para incorporar parches de seguridad. La dependencia está declarada en `package.json` y la versión instalada queda registrada en el `pnpm-lock.yaml` del workspace. Next.js utiliza React para la interfaz y App Router para las rutas `/` y `/room/[code]`.

El workspace fija PostCSS **8.5.23** para Next.js mediante `overrides` en `pnpm-workspace.yaml`, corrigiendo las alertas de seguridad de esa dependencia. Tras cambiar versiones, ejecutá `pnpm install` en la raíz y conservá el lockfile actualizado.

## Desarrollo

```bash
pnpm install
cp .env.example .env   # NEXT_PUBLIC_API_URL, por defecto http://localhost:3001
pnpm dev
```

Abrí [http://localhost:3002](http://localhost:3002) (puerto fijo, para no chocar con el backend en `3001`). Necesita el backend corriendo para poder crear/unirse a salas.

Para comprobar la versión instalada, ejecutá `pnpm exec next --version` dentro de `client/`.

## Scripts

```bash
pnpm dev     # servidor de desarrollo de Next.js
pnpm build   # build de producción
pnpm start   # sirve el build de producción
pnpm lint    # oxlint
pnpm typecheck # genera los tipos de rutas de Next.js y comprueba TypeScript
```

## Estructura

```
src/
├── app/
│   ├── layout.tsx        # layout raíz
│   ├── globals.css       # estilos globales
│   ├── page.tsx          # "/" — crear/unirse a una sala
│   └── room/[code]/
│       └── page.tsx      # "/room/:code" — sala: usuarios + chat en vivo
└── lib/
    ├── api.ts            # llamadas REST al backend
    └── socket.ts         # conexión Socket.io al namespace /rooms
```
