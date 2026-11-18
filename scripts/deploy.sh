#!/usr/bin/env bash
# Despliegue en WSL (o cualquier Linux con Docker).
#   ./scripts/deploy.sh            → build + arranque en http://localhost:3001/mcp
#   ./scripts/deploy.sh --tunnel   → además levanta un túnel cloudflared y muestra la URL pública
#   ./scripts/deploy.sh --down     → para y elimina los contenedores
set -euo pipefail
cd "$(dirname "$0")/.."

if ! command -v docker >/dev/null 2>&1; then
  echo "❌ Docker no está disponible en WSL. Instala Docker Desktop (con integración WSL) o docker-ce dentro de WSL." >&2
  exit 1
fi

case "${1:-}" in
  --down)
    docker compose --profile tunnel down
    exit 0
    ;;
  --tunnel)
    docker compose --profile tunnel up -d --build
    ;;
  *)
    docker compose up -d --build
    ;;
esac

echo -n "⏳ Esperando a que el servidor esté sano"
for _ in $(seq 1 30); do
  if curl -fsS "http://localhost:${PORT:-3001}/health" >/dev/null 2>&1; then
    echo -e "\n✅ MCP server listo en http://localhost:${PORT:-3001}/mcp"
    break
  fi
  echo -n "."; sleep 1
done

if [[ "${1:-}" == "--tunnel" ]]; then
  echo "⏳ Obteniendo URL del túnel…"
  for _ in $(seq 1 30); do
    url=$(docker compose logs tunnel 2>/dev/null | grep -oE 'https://[a-z0-9-]+\.trycloudflare\.com' | tail -1 || true)
    if [[ -n "$url" ]]; then
      echo "🌍 URL pública del conector: ${url}/mcp"
      echo "   Claude → Settings → Connectors → Add custom connector → pega esa URL"
      break
    fi
    sleep 1
  done
fi
