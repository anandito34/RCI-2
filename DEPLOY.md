# Panduan Deployment (Step-by-Step) — 100% GRATIS (Tanpa Kartu Kredit)

Aplikasi ini siap di-deploy dengan arsitektur:
- **Database (PostgreSQL)**: Neon.tech (Gratis, Tanpa CC)
- **Backend (FastAPI)**: Render Web Service (Gratis, Tanpa CC)
- **Frontend (React)**: Vercel (Gratis, Tanpa CC)

---

## 🚀 1. Persiapan GitHub
1. Buat repository baru di GitHub (kosong, jangan centang README/gitignore).
2. Buka terminal proyek ini, lalu jalankan:
   ```bash
   git branch -M main
   git remote add origin https://github.com/USERNAME/NAMA_REPO.git
   git push -u origin main
   ```

---

## 🐘 2. Buat Database (via Neon.tech)
Supaya tidak diminta kartu kredit oleh Render, kita pakai database terpisah:
1. Buka [neon.tech](https://neon.tech) dan daftar dengan GitHub/Google.
2. Buat project baru (nama bebas, e.g., `rci-db`).
3. Di *Dashboard* utama Neon, cari kotak **Connection Details**.
4. Di bagian *Connection string*, **copy URL-nya** (formatnya: `postgresql://user:password@hostname/dbname?sslmode=require`).
5. Simpan URL ini, kita akan memakainya di Render.

---

## ⚙️ 3. Deployment Backend (via Koyeb)

Karena Render sekarang mewajibkan kartu kredit untuk semua pendaftaran baru (meskipun gratis), kita akan memindahkan Backend kita ke **Koyeb** (100% Gratis Tanpa Kartu Kredit).

1. Buka [koyeb.com](https://app.koyeb.com/) dan daftar menggunakan akun GitHub Anda.
2. Di Dashboard Koyeb, klik **Create Web Service**.
3. Pilih opsi **GitHub** dan berikan akses ke repository project ini.
4. Pilih **Builder**: Pilih opsi **Dockerfile** (agar Koyeb memakai konfigurasi Docker yang nanti akan kita tambahkan).
   - Di bagian *Override Builder*, biarkan kosong/default.
5. Di bagian **Environment Variables**, klik *Add Variable* dan masukkan 5 rahasia ini:
   - `SECRET_KEY` = `rahasia_app_konsultasi_123`
   - `ALGORITHM` = `HS256`
   - `ACCESS_TOKEN_EXPIRE_MINUTES` = `60`
   - `DATABASE_URL` = *(Paste URL koneksi postgresql dari Neon.tech)*
   - `CORS_ORIGINS` = `https://your-frontend.vercel.app` (Biarkan default ini dulu)
6. Di bagian **Instance**, pilih opsi **Free / Eco** ($0/mo).
7. Di bagian **Regions**, pilih **Singapore (Sin)**.
8. Beri nama App Anda (misal: `rci-backend`) lalu klik **Deploy**.
9. Tunggu hingga statusnya *Healthy*. Catat **Public URL** backend Anda (misal: `https://rci-backend-blabla.koyeb.app`).

---

## 🌐 4. Deployment Frontend (via Vercel)

1. Buka [vercel.com](https://vercel.com) dan login/daftar.
2. Di beranda, klik **Add New...** > **Project**.
3. Hubungkan akun GitHub dan pilih repository project ini.
4. Di bagian **Environment Variables** (sebelum menekan Deploy), tambahkan dua baris ini:
   - `VITE_API_URL` = `https://rci-backend.onrender.com` (Ubah sesuai URL Backend Render Anda)
   - `VITE_WS_URL` = `wss://rci-backend.onrender.com` (Sama seperti atas, tapi ubah awalan `https` menjadi `wss`)
5. Klik **Deploy**.
6. Vercel akan otomatis mengenali Vite. Rute antar halaman juga sudah diatur aman dengan `vercel.json`!
7. Setelah selesai, catat **URL Frontend** Anda (misal: `https://rci-frontend.vercel.app`).

---

## 🔗 5. Finalisasi (Koneksikan Frontend & Backend)

Sekarang kita berikan akses ke Backend agar mau menerima request dari Vercel:
1. Kembali ke Dashboard Render > Pilih web service `rci-backend` > tab **Environment**.
2. Update nama variabel yang ada:
   - `CORS_ORIGINS` = `https://rci-frontend.vercel.app` (URL Vercel Anda, **TANPA tanda `/` di akhir**)
3. Klik **Save Changes** (Render akan me-restart backend otomatis sesuai pengaturan baru).

✅ **Selesai! Aplikasi Konsultasi Hukum 100% online siap dipakai!**
