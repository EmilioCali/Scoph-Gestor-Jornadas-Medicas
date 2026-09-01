#!/bin/sh
set -eu

PORT="${PORT:-10000}"
export PORT
envsubst '${PORT}' < /app/deploy/nginx.conf.template > /etc/nginx/nginx.conf

exec supervisord -c /app/deploy/supervisord.conf
