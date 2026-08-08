#!/bin/sh
set -ex

echo "=== Running Prisma migrations ===" >&2
npx prisma migrate deploy 2>&1
echo "=== Migrations complete ===" >&2

echo "=== Starting server ===" >&2
exec node dist/server.js 2>&1
