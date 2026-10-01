# Roomy — client

Frontend de Roomy construido con [Next.js](https://nextjs.org/) (App Router) + TypeScript.

## Desarrollo

```bash
pnpm install
cp .env.example .env   # NEXT_PUBLIC_API_URL, por defecto http://localhost:3001
pnpm dev
```

Abrí [http://localhost:3002](http://localhost:3002) (puerto fijo, para no chocar con el backend en `3001`). Necesita el backend corriendo para poder crear/unirse a salas.

## Scripts

```bash
pnpm dev     # servidor de desarrollo de Next.js
pnpm build   # build de producción
pnpm start   # sirve el build de producción
pnpm lint    # oxlint
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
