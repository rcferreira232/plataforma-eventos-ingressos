FROM node:20-alpine

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate

COPY package.json pnpm-lock.yaml* ./

RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm prisma generate

EXPOSE 3333

CMD ["sh", "-c", "npx prisma db push && npx prisma db seed && pnpm dev"]