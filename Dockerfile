# Gunakan image resmi Python yang ringan
FROM python:3.11-slim

# Set working directory di dalam container
WORKDIR /app

# Copy seluruh file backend ke dalam container (langsung ke root /app)
COPY backend/ .

# Install dependencies sistem yang diperlukan oleh postgres (psycopg2)
RUN apt-get update && apt-get install -y gcc libpq-dev && rm -rf /var/lib/apt/lists/*

# Install python dependencies dari requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Jalankan Uvicorn server menggunakan port dari environment variable (wajib untuk layanan cloud seperti Back4App)
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}"]
