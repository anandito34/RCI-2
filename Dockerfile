# Gunakan image resmi Python yang ringan
FROM python:3.11-slim

# Set working directory di dalam container
WORKDIR /app

# Copy file requirements terlebih dahulu (untuk memanfaatkan cache layer Docker)
COPY backend/requirements.txt .

# Install dependencies sistem yang diperlukan oleh postgres (psycopg2)
RUN apt-get update && apt-get install -y gcc libpq-dev && rm -rf /var/lib/apt/lists/*

# Install python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy seluruh file backend ke dalam container
COPY backend/ .

# Expose port yang digunakan
EXPOSE 8000

# Jalankan Uvicorn server
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
