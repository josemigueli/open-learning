# Dockerfile para el Bot Grammy + Core SQLite

FROM node:22-alpine AS builder

WORKDIR /app

# Archivos de entorno y dependencias del workspace (Solo para Bot y Core)
COPY package.json package-lock.json ./
COPY packages/bot/package.json packages/bot/
COPY packages/core/package.json packages/core/

# Instalamos las dependencias
RUN npm ci

# Copiamos el código fuente, la configuración tsconfig global, scripts y DB si los hay
COPY packages/bot packages/bot/
COPY packages/core packages/core/
COPY tsconfig.json ./
COPY courses/examples courses/examples/

# Etapa 2: Imagen Final (más limpia)
FROM node:22-alpine AS runner

# Definimos que será entorno de Producción
ENV NODE_ENV=production

WORKDIR /app

# Copiamos todo lo compilado de la capa de 'builder' (incluyendo node_modules locales)
# Como la app en bot/index.ts usa `tsx src/index.ts`, lo corremos crudo sin pre-compilar.
COPY --from=builder /app /app/

# Creamos una carpeta para montar el volumen de SQLite
RUN mkdir -p /app/data

# Aseguramos permisos de persistencia
RUN chown -R node:node /app

USER node

# Cambiamos explícitamente al directorio del bot
WORKDIR /app/packages/bot

# El comando de arranque (`tsx src/index.ts`)
CMD ["npm", "run", "start"]
