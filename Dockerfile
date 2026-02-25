FROM node:20-slim

RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

RUN npx prisma generate
RUN npm run build

ENV DATABASE_URL=file:/app/data/prod.db

EXPOSE 3000

CMD npx prisma migrate deploy --schema /app/prisma/schema.prisma && npm start
