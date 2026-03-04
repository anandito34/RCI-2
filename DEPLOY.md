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

## ⚙️ 3. Deployment Backend (via Render)

*Catatan: Kita tidak menggunakan menu "Blueprint" karena Render mewajibkan kartu kredit untuk Blueprint. Kita akan membuat "Web Service" manual (Bebas Kartu Kredit).*

1. Buka [render.com](https://render.com) dan daftar/login.
2. Di dashboard Render, klik tombol **New** > **Web Service**.
3. Hubungkan akun GitHub Anda dan pilih repository project ini.
4. Di bagian pengisian formulir rincian Web Service, isi seperti ini:
   - **Name**: `rci-backend`
   - **Region**: `Singapore (AWS)`
   - **Branch**: `main`
   - **Root Directory**: `backend` (⚠️ **Sangat Penting!** Ketik kata `backend` di sini)
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - **Instance Type**: Pilih yang `Free` ($0/month)
5. Jangan klik Deploy dulu! *Scroll* ke bawah dan klik tombol **Advanced** > **Add Environment Variable**. Masukkan kelima Variabel ini:
   - `SECRET_KEY` = `bebas-isi-apa-saja-yang-rumit`
   - `ALGORITHM` = `HS256`
   - `ACCESS_TOKEN_EXPIRE_MINUTES` = `60`
   - `DATABASE_URL` = *(Paste URL koneksi dari Neon.tech)*
   - `CORS_ORIGINS` = `https://your-frontend.vercel.app` (Biarkan default ini dulu, nanti diganti dengan URL Vercel)
6. Setelah semua terisi, klik **Create Web Service**.
7. Tunggu Render melakukan deploy sampai selesai.
8. Catat **URL Backend** aplikasi Anda yang muncul di sudut kiri atas (misal: `https://rci-backend.onrender.com`).

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
