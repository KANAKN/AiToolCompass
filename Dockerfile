FROM node:20-slim

RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

RUN npx prisma generate
RUN npm run build

RUN cp -r .next/static .next/standalone/.next/static
RUN cp -r public .next/standalone/public 2>/dev/null || true

ENV DATABASE_URL=file:/app/data/prod.db
ENV NODE_ENV=production

EXPOSE 3000

COPY start.sh /app/start.sh
RUN chmod +x /app/start.sh

CMD ["/app/start.sh"]
