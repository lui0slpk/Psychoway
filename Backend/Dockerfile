# ---- etapa de dependencias ----
FROM node:24-slim AS deps
WORKDIR /app

# workspace raíz para que pnpm resuelva con el lockfile correcto
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY Backend/package.json Backend/
RUN corepack enable && pnpm install --filter ./Backend --frozen-lockfile

# ---- etapa final (runtime) ----
FROM node:24-slim
WORKDIR /app
ENV NODE_ENV=production

# deps ya resueltas + código del backend
COPY --from=deps /app/node_modules ./node_modules
COPY Backend ./

EXPOSE 5000
CMD ["node", "server.js"]