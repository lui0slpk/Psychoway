# ---- etapa de build ----
FROM node:24-slim AS build
WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY Frontend/package.json Frontend/
RUN corepack enable && pnpm install --filter ./Frontend --frozen-lockfile

COPY Frontend ./Frontend
RUN pnpm --dir Frontend build

# ---- servidor estático ----
FROM nginx:alpine
COPY --from=build /app/Frontend/build /usr/share/nginx/html
COPY Frontend/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]