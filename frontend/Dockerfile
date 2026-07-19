# Build stage
FROM node:24-alpine AS builder

WORKDIR /app

# Chromium for prerender. Above COPY so the layer stays cached across builds.
RUN apk add --no-cache chromium nss freetype harfbuzz ca-certificates ttf-freefont
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

COPY package.json package-lock.json ./

RUN npm install

COPY . .

ARG PUBLIC_API_BASE_URL
ARG PUBLIC_WS_BASE_URL

ENV PUBLIC_API_BASE_URL=$PUBLIC_API_BASE_URL
ENV PUBLIC_WS_BASE_URL=$PUBLIC_WS_BASE_URL

RUN npm run build
RUN npm run prerender

# Production stage
FROM nginx:alpine

COPY nginx.conf /etc/nginx/nginx.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]