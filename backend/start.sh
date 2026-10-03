#!/bin/sh
# Container entrypoint: migrate, load registry snapshot if a CSV is provided, then serve.
set -e
alembic upgrade head
# SEBI_SYNC=1: pull the live registry from sebi.gov.in at start-up (~6 min; politely rate-limited).
# Better: run it from a daily scheduled job and keep SEBI_CSV pointing at the result.
if [ "$SEBI_SYNC" = "1" ]; then
  SEBI_CSV=${SEBI_CSV:-app/data/sebi_full.csv}
  python -m app.data.sebi_scrape --out "$SEBI_CSV"
  KNOWN_YAML=${KNOWN_YAML:-app/data/known_entities.yaml}
fi
if [ -n "$SEBI_CSV" ] && [ -f "$SEBI_CSV" ]; then
  python -m app.data.sebi_snapshot --csv "$SEBI_CSV" --known "${KNOWN_YAML:-app/data/known_entities.yaml}"
elif [ "$LOAD_SAMPLE_DATA" = "1" ]; then
  python -m app.data.sebi_snapshot --sample
fi
exec gunicorn app.main:app -k uvicorn.workers.UvicornWorker -w 2 -b 0.0.0.0:${PORT:-8000} --forwarded-allow-ips='*'
