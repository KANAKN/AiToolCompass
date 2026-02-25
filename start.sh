#!/bin/sh
set -e

echo "=== Running migrations ==="
npx prisma migrate deploy --schema /app/prisma/schema.prisma

echo "=== Starting Next.js on port ${PORT:-3000} ==="
exec env HOSTNAME=0.0.0.0 node /app/.next/standalone/server.js
