#!/bin/sh
set -ex

echo "=== DIAGNOSTIC START ===" >&2
echo "PWD: $(pwd)" >&2
echo "ls:" >&2
ls -la /app/ >&2
echo "=== Running diagnostic server ===" >&2
exec node dist/server-diagnostic.js 2>&1
