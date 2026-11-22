FROM node:26.13.1@sha256:e18c3ccdf7d71619990b0e85639f506e2028a95410999cab24cc373cbd10e0ac AS build

COPY ./ /app

WORKDIR /app
RUN npm ci

RUN npm run build

FROM nginx:alpine-slim@sha256:f45171d36c76a8b2f5ef97108a3a8a2294248a6578a0a180edc2d78f7d2edc26
COPY --from=build /app/dist /usr/share/nginx/html/ui/marketplace/ui
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 8080
