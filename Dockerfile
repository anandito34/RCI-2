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

# Back4App requires EXPOSE declaration to launch the container
EXPOSE 8000

# Jalankan Uvicorn server secara eksplisit pada port 8000 agar sesuai dengan EXPOSE Back4App
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
