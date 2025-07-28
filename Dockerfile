FROM node:22.17 as build

COPY ./ /app

WORKDIR /app
RUN --mount=type=secret,id=github_token --mount=type=secret,id=common_repository_token NODE_AUTH_TOKEN=$(cat /run/secrets/github_token) COMMON_REPOSITORY_TOKEN=$(cat /run/secrets/common_repository_token) npm ci

RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html/ui/makretpace-ui/ui
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 8080
