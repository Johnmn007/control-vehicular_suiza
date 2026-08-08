FROM node:20-slim

WORKDIR /app

RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

COPY package.json ./
RUN npm install

COPY prisma ./prisma
COPY prisma.config.ts ./
ARG DATABASE_URL=postgresql://dummy:dummy@localhost:5432/dummy
RUN npx prisma generate

COPY tsconfig.json ./
COPY src ./src
RUN npx tsc

COPY .railway-rebuild ./

EXPOSE 3001

ENTRYPOINT ["node", "dist/server-diagnostic.js"]
