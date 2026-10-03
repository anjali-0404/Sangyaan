#!/usr/bin/env bash
# Start database + backend + frontend (+ optional ngrok tunnel) for local / friend testing.
#   ./run_all.sh          start everything and open an ngrok tunnel
#   ./run_all.sh --local  no tunnel
#   ./run_all.sh --stop   stop backend, frontend and tunnel (database container is left running)
set -u
ROOT="$(cd "$(dirname "$0")" && pwd)"
LOGS=/tmp/sangyan; mkdir -p "$LOGS"
export PATH="$HOME/.local/tess/bin:$PATH"   # user-local tesseract (OCR), if installed

stop() {
  pkill -f "uvicorn app.main:app" 2>/dev/null
  pkill -f "$ROOT/frontend/node_modules/.bin/vite" 2>/dev/null
  pkill -f "ngrok http" 2>/dev/null
  sleep 1
}

if [ "${1:-}" = "--stop" ]; then stop; echo "stopped"; exit 0; fi
stop

echo "[1/4] database"
docker start sangyan-pg >/dev/null 2>&1 || { echo "container sangyan-pg missing"; exit 1; }
for i in $(seq 1 20); do docker exec sangyan-pg pg_isready -U sangyan >/dev/null 2>&1 && break; sleep 1; done

echo "[2/4] backend  :8000"
cd "$ROOT/backend"
# --proxy-headers: trust X-Forwarded-For from the Vite proxy so rate limits are per real client
env -u DATABASE_URL nohup .venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 8000 \
  --proxy-headers --forwarded-allow-ips="*" > "$LOGS/backend.log" 2>&1 &
for i in $(seq 1 30); do curl -sf localhost:8000/healthz >/dev/null && break; sleep 1; done
curl -sf localhost:8000/healthz >/dev/null || { echo "backend failed, see $LOGS/backend.log"; exit 1; }

echo "[3/4] frontend :5173 (production build)"
cd "$ROOT/frontend"
npm run build >"$LOGS/build.log" 2>&1 || { echo "build failed, see $LOGS/build.log"; exit 1; }
nohup npm run preview >"$LOGS/frontend.log" 2>&1 &
for i in $(seq 1 30); do curl -sf localhost:5173/api/healthz >/dev/null && break; sleep 1; done
curl -sf localhost:5173/api/healthz >/dev/null || { echo "frontend failed, see $LOGS/frontend.log"; exit 1; }

echo "local:   http://localhost:5173"
if [ "${1:-}" = "--local" ]; then exit 0; fi

echo "[4/4] ngrok tunnel"
nohup ngrok http 5173 --log=stdout >"$LOGS/ngrok.log" 2>&1 &
URL=""
for i in $(seq 1 20); do
  URL=$(curl -s localhost:4040/api/tunnels | python3 -c "import sys,json;print(json.load(sys.stdin)['tunnels'][0]['public_url'])" 2>/dev/null) && [ -n "$URL" ] && break
  sleep 1
done
[ -n "$URL" ] && echo "PUBLIC:  $URL   <- send this to your friend" || { echo "ngrok failed:"; tail -5 "$LOGS/ngrok.log"; exit 1; }
