# Panduan Deployment (Step-by-Step)

Aplikasi ini siap di-deploy dengan arsitektur terpisah:
- **Backend (FastAPI)**: Render (Gratis)
- **Frontend (React)**: Vercel (Gratis)
- **Database**: Render PostgreSQL

---

## 🚀 1. Persiapan GitHub
1. Buat repository baru di GitHub.
2. Push semua kode ke repository tersebut.
   ```bash
   git add .
   git commit -m "Ready for production"
   git branch -M main
   git push -u origin main
   ```

---

## 🐘 2. Deployment Backend (via Render)

Aplikasi sudah disiapkan dengan Blueprint `render.yaml` untuk 1-click deploy!

1. Buat akun di [Render](https://render.com).
2. Di dashboard Render, klik tombol **New** > **Blueprint**.
3. Hubungkan akun GitHub Anda dan pilih repository project ini.
4. Render akan otomatis membaca file `render.yaml`.
5. Klik **Approve** untuk membuat Web Service (Python) dan PostgreSQL database sekaligus.
6. Tunggu hingga deploy selesai, lalu catat **URL Backend** (misal: `https://rci-backend.onrender.com`).

---

## 🌐 3. Deployment Frontend (via Vercel)

1. Buat akun di [Vercel](https://vercel.com).
2. Klik **Add New...** > **Project**.
3. Hubungkan akun GitHub dan pilih repository project ini.
4. Di bagian **Environment Variables**, tambahkan:
   - `VITE_API_URL` = `https://rci-backend.onrender.com` (Ganti dengan URL dari Render)
   - `VITE_WS_URL` = `wss://rci-backend.onrender.com` (Ubah awalan https jadi wss)
5. Klik **Deploy**.
6. Vercel akan otomatis mengenali project Vite + React. Configuration route SPA sudah diatur via `vercel.json`!
7. Catat **URL Frontend** (misal: `https://rci-frontend.vercel.app`).

---

## 🔗 4. Koneksikan Ulang (Update CORS)

Supaya backend di Render bisa menerima request dari Vercel:
1. Buka dashboard Render > Pilih aplikasi `rci-backend` > tab **Environment**.
2. Tambahkan / Update variabel:
   - `CORS_ORIGINS` = `https://rci-frontend.vercel.app` (URL Vercel Anda, TANPA slash di akhir)
3. Save changes (Render akan me-restart backend otomatis).

✅ **Selesai! Aplikasi Anda sudah online sepenuhnya.**
