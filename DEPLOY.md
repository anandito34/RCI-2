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

## ⚙️ 3. Deployment Backend (via Back4App Containers)

Karena layanan lain (Render & Koyeb) saat ini sedang agresif mewajibkan kartu kredit untuk verifikasi bot, kita pindahkan backend kita ke **Back4App Containers** yang 100% Bebas Kartu Kredit.

1. Buka [back4app.com/containers](https://www.back4app.com/containers) dan klik **Start for Free**.
2. Daftar menggunakan akun GitHub Anda.
3. Setelah masuk Dashboard, klik tombol **Build a new app**.
4. Pilih opsi **Containers as a Service (CaaS)** (jika ditanya).
5. Hubungkan GitHub dan pilih repository project ini.
6. Pada pengisian "Create App":
   - **App Name**: `rci-backend` (atau nama unik lainnya)
   - **Branch**: `main`
   - *Root Directory* biarkan kosong.
   - **Port**: Isi dengan `8000` (Penting!)
7. *Scroll* ke bawah dan klik tombol **Environment Variables**, lalu masukkan 5 kunci rahasia ini:
   - `SECRET_KEY` = `rahasia_app_konsultasi_123`
   - `ALGORITHM` = `HS256`
   - `ACCESS_TOKEN_EXPIRE_MINUTES` = `60`
   - `DATABASE_URL` = *(Paste URL koneksi postgresql dari Neon.tech)*
   - `CORS_ORIGINS` = `https://your-frontend.vercel.app` (Biarkan default ini dulu)
8. Klik tombol **Deploy** atau **Create App** di paling bawah.
9. Tunggu beberapa menit hingga status aplikasinya berwarna Hijau (🟢 *Ready*).
10. Catat **URL Backend** Anda yang ada kotak hijau di kiri atas layar (formatnya `rci-backend-blabla.b4a.run`).

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
