FROM node:24.22.3@sha256:9d266751ca3d7fdbe651c878ffd5ad0a42fed49a18c283509267c97f025b7496 AS build

COPY ./ /app

WORKDIR /app
RUN npm ci

RUN npm run build

FROM nginx:alpine-slim@sha256:5bfced78d24d644270bedb0a9968697042e38d5c03fb6354603df025279c1cbe
COPY --from=build /app/dist /usr/share/nginx/html/ui/marketplace/ui
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 8080
