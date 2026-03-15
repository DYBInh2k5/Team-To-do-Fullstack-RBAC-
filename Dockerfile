# ── Build stage ──────────────────────────────────────────────────────────────
FROM node:22-alpine AS builder
WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma
COPY prisma.config.ts ./

RUN npm ci

# Generate Prisma client for the target platform
RUN npx prisma generate

COPY tsconfig*.json ./
COPY nest-cli.json ./
COPY src ./src

RUN npm run build

# ── Runtime stage ─────────────────────────────────────────────────────────────
FROM node:22-alpine
WORKDIR /app

ENV NODE_ENV=production

# Copy only what is needed to run
COPY package*.json ./
COPY prisma ./prisma
COPY prisma.config.ts ./

# Install all deps (includes ts-node required by prisma.config.ts for migrations)
RUN npm ci

# Re-generate Prisma client for this final platform layer
RUN npx prisma generate

COPY --from=builder /app/dist ./dist

EXPOSE 3000

# Run migrations then start the app
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main"]
