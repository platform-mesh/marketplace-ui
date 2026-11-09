FROM node:26.12.1@sha256:97fa0f1b59035c6072721a88d55be1371c7cb1cc942b521e1cc5c72ec87655f4 AS build

COPY ./ /app

WORKDIR /app
RUN npm ci

RUN npm run build

FROM nginx:alpine-slim@sha256:f45171d36c76a8b2f5ef97108a3a8a2294248a6578a0a180edc2d78f7d2edc26
COPY --from=build /app/dist /usr/share/nginx/html/ui/marketplace/ui
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 8080
