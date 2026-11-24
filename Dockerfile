# =============================================================================
# Build du front (Vite) puis service par Caddy, qui relaie aussi /api vers l'API
# =============================================================================
FROM node:26-slim AS build

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

COPY . .
# Vérification des types (appli et config Vite), puis build : le manifeste, le service worker et
# les icônes de la PWA sont générés ici
RUN npm run build

FROM caddy:2-alpine AS runtime

COPY Caddyfile /etc/caddy/Caddyfile
COPY --from=build /app/dist /srv

EXPOSE 80
