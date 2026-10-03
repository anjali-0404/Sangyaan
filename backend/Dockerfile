FROM python:3.11-slim
RUN apt-get update && apt-get install -y --no-install-recommends tesseract-ocr tesseract-ocr-hin tesseract-ocr-eng \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /srv
COPY pyproject.toml ./
RUN pip install --no-cache-dir "fastapi>=0.115" "uvicorn[standard]>=0.30" "gunicorn>=22" "pydantic>=2.7" \
    "pydantic-settings>=2.3" "httpx>=0.27" "sqlalchemy>=2.0" "alembic>=1.13" "psycopg[binary]>=3.1" \
    "rapidfuzz>=3.9" "pyyaml>=6" "slowapi>=0.1.9" "python-multipart>=0.0.9" "tldextract>=5.1" "pillow>=10" \
    "pytesseract>=0.3.10"
COPY . .
RUN useradd -m app && chown -R app /srv
USER app
EXPOSE 8000
CMD ["./start.sh"]
