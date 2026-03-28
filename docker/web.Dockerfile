# Construcción (Multi-stage)
FROM node:22-alpine AS builder

WORKDIR /app

# Archivos de entorno y dependencias del workspace
COPY package.json package-lock.json tsconfig.json ./
COPY packages/web/package.json packages/web/
COPY packages/core/package.json packages/core/

# Instalamos todo (incluyendo devDependencies para poder buildear)
RUN npm ci

# Copiamos el código fuente de los paquetes requeridos
COPY packages/web packages/web/
COPY packages/core packages/core/

# Construimos la app React (Vite)
RUN npm run build --workspace=@open-learning/web

# Etapa de Servidor con Nginx
FROM nginx:alpine

# Copiamos la configuración personalizada de Nginx para SPA (React Router)
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

# Copiamos los archivos generados en el stage anterior
COPY --from=builder /app/packages/web/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
