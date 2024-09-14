# Stage 1: Build the React app
FROM node:18 AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY . .
RUN npm run build

# Static files

FROM alpine:latest

WORKDIR /app/dist
COPY --from=builder /app/dist .