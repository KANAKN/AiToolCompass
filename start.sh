#!/bin/sh
set -e

echo "=== Running migrations ==="
npx prisma migrate deploy --schema /app/prisma/schema.prisma

echo "=== Seeding database if empty ==="
TOOL_COUNT=$(node -e "
const { PrismaClient } = require('/app/node_modules/@prisma/client');
const prisma = new PrismaClient();
prisma.tool.count().then(function(n){ console.log(n); return prisma.\$disconnect(); }).catch(function(){ console.log(0); });
")
echo "Current tool count: $TOOL_COUNT"
if [ "$TOOL_COUNT" = "0" ]; then
  echo "=== Running seed ==="
  cd /app && npx tsx prisma/seed.ts
fi

echo "=== Starting Next.js on port ${PORT:-3000} ==="
exec env HOSTNAME=0.0.0.0 node /app/.next/standalone/server.js
