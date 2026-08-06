---
name: iot-dashboard-guidelines
description: Panduan wajib untuk UI, reka bentuk komponen, dan pantang larang dalam pembangunan IoT_Project.
---

# 🚀 IoT Dashboard Guidelines

Kemahiran (*skill*) ini adalah buku peraturan khusus untuk projek ini. Sila patuhi arahan di bawah setiap kali menulis atau mengubah suai kod dalam ruang kerja ini.

## 1. Tema & Warna (UI/UX)
- Projek ini menggunakan sistem **Dark Mode** (lalai) dan **Soft Light Mode**.
- **JANGAN** menggunakan warna statik/tegar (seperti `#000000`, `#ffffff` atau `rgba(...)`) di dalam fail `.tsx` (*inline styles*) melainkan terpaksa.
- **WAJIB** menggunakan pembolehubah CSS yang telah didaftarkan dalam `index.css` (contoh: `var(--bg-color)`, `var(--panel-bg)`, `var(--text-primary)`).
- Gaya antara muka perlulah kelihatan premium, minimalis, dan menggunakan efek kaca (*glassmorphism*).
- Ikon wajib didapatkan daripada pustaka `lucide-react`.

## 2. Penghalaan (Routing) & Autentikasi
- Pengurusan laluan (*Routing*) diuruskan di dalam `main.tsx` menggunakan `react-router-dom`.
- Pengesahan pengguna (*Authentication*) diuruskan secara eksklusif oleh `@clerk/clerk-react`.
- Kotak log masuk (*Clerk Sign-In Box*) di halaman `/login` **wajib** menggunakan logik tema keterbalikan (*inverse*): Jika tema aplikasi *Light*, kotak mesti *Dark*. Jika aplikasi *Dark*, kotak mesti *Light* (Lalai).
- Kotak log masuk juga **wajib** diletakkan bayang-bayang di belakangnya (*box-shadow*) melalui panggil CSS variable `var(--login-box-shadow)` dalam tetapan `appearance`.

## 3. Pembangunan Komponen & Widget
- Pembangunan widget carta dan jadual perlu responsif secara automatik kepada perubahan tema (Light/Dark).
- Kekalkan reka bentuk komponen agar sentiasa boleh diguna semula (*reusable*).

## 4. Pantang Larang Projek ⚠️
- **Dilarang** membuang atau mendedahkan konfigurasi di dalam `VITE_CLERK_PUBLISHABLE_KEY`.
- Sentiasa asingkan tetapan kepada `.env.development` (untuk kunci ujian/test) dan `.env.production` (untuk kunci sebenar/live).
- **Hanya ubah suai fail yang diminta**. Jangan sentuh logik pangkalan data, MQTT, atau komponen lain sekiranya pengguna hanya meminta suntingan antara muka (UI).
- **Peraturan Pengekodan (Git):** Selepas setiap perubahan selesai, AI **wajib** menolak (commit & push) kod ke GitHub menggunakan: `git add . ; git commit -m "..." ; git push`.
