# Stage 1 — Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ARG VITE_TMDB_API_KEY
ENV VITE_TMDB_API_KEY=$VITE_TMDB_API_KEY
RUN npm run build

# Stage 2 — Serve
FROM httpd:2.4-alpine
COPY --from=builder /app/dist/ /usr/local/apache2/htdocs/
