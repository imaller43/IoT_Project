---
name: iot-dashboard-guidelines
description: Panduan wajib untuk UI, reka bentuk komponen, dan pantang larang dalam pembangunan IoT_Project.
---

# 🚀 IoT Dashboard Guidelines

Kemahiran (*skill*) ini adalah buku peraturan khusus untuk projek ini. Sila patuhi arahan di bawah setiap kali menulis atau mengubah suai kod dalam ruang kerja ini.

## 1. Asas Projek (Project Fundamentals)
- **Framework Frontend**: React (dengan TypeScript) menggunakan Vite.
- **Pangkalan Data (Backend)**: InfluxDB (Data Historik & Analisis Time-Series) & MQTT Broker (Data Masa Nyata).
- **Perkakasan & Middleware**: Projek ini menggunakan **Raspberry Pi 4 Model B** yang bertindak bersama **Node-RED** sebagai middleware untuk mengawal dan memantau status GPIO (*switch state*).
- **Pengesahan (Authentication)**: Clerk (Autentikasi selamat tanpa *backend server* peribadi).

## 2. Tema & Warna (UI/UX)
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
- **Wajib** meletakkan efek *radial-gradient* bercahaya (aura) di belakang kotak log masuk melalui pembolehubah `var(--login-aura)` supaya antaramuka nampak lebih premium dan tidak tenggelam.

## 3. Prestasi Data (Data Performance) & Downsampling
- Pangkalan data InfluxDB boleh memulangkan puluhan ribu baris data jika julat masa terlalu panjang, yang akan menyebabkan pelayar (browser) *hang*.
- **Wajib menggunakan `aggregateWindow`** dalam pertanyaan Flux untuk graf sejarah (`fetchHistoricalData`) berdasarkan julat masa:
  - `-30m` & `-1h` = `1m`
  - `-3h` = `2m`
  - `-6h` = `5m`
  - `-12h` = `10m`
  - `-24h` = `20m`
  - `-3d` = `1h`
  - `-7d` = `2h`
- Peraturan ini bertujuan memastikan data graf sentiasa berada di bawah 200 titik (data points) pada satu-satu masa.

## 4. Pembangunan Komponen & Widget
- Pembangunan widget carta dan jadual perlu responsif secara automatik kepada perubahan tema (Light/Dark).
- **Responsif Mobile**: Wajib memastikan susun atur grid (`top-grid`, `middle-grid`, `bottom-grid`, `switch-grid`) responsif terhadap saiz skrin. Jangan *hardcode* `grid-template-columns: repeat(3, 1fr)` tanpa `media queries` kerana ia akan memecahkan susun atur pada peranti mudah alih (walaupun dalam mod desktop/tablet). 
- Gunakan `@media (max-width: 1024px)` untuk menukar grid kepada `1fr` supaya ia tersusun menegak (stacked) untuk paparan kecil.
- Pastikan elemen `header` atau bekas utama (`container`) sentiasa menggunakan `width: 100%` supaya ia tidak mengecut ke sebelah kiri skrin ketika skrol mendatar (*horizontal overflow*).
- Kekalkan reka bentuk komponen agar sentiasa boleh diguna semula (*reusable*).

## 5. MQTT & Logik Suis Pintar (Hardware Override)
- **Topik Pengasingan (Decoupled Topics)**: Untuk mengelakkan gelung suap balik (*feedback loop*) dan menyokong pengesahan perkakasan, kawalan suis dan maklum balas status diasingkan.
  - Dashboard *publish* (menghantar) ke: `sapura/bilik1/switch/interrupt`
  - Node-RED / Perkakasan *publish* status fizikal sebenar ke: `sapura/bilik1/switch/interrupt1`
- **Hardware Override (Pintas Perkakasan)**:
  - Jika suis fizikal ditekan (ON), Node-RED akan menghantar status aktif ke `interrupt1`.
  - Dashboard akan mengesan status ini, lalu menghidupkan butang UI dan menjadikannya **TIDAK AKTIF (disabled)** dengan amaran "Override Aktif". 
  - Selagi suis fizikal ON, aplikasi web tidak dapat mengawal lampu tersebut.
  - Apabila suis fizikal dilepaskan (OFF), UI akan menetapkan semula (*reset*) kedudukan suis perisian kepada OFF secara automatik, dan menyegerakkan kembali status tersebut ke Node-RED.

## 6. Pantang Larang Projek ⚠️
- **Dilarang** membuang atau mendedahkan konfigurasi di dalam `VITE_CLERK_PUBLISHABLE_KEY`.
- Sentiasa asingkan tetapan kepada `.env.development` (untuk kunci ujian/test) dan `.env.production` (untuk kunci sebenar/live).
- **Hanya ubah suai fail yang diminta**. Jangan sentuh logik pangkalan data, MQTT, atau komponen lain sekiranya pengguna hanya meminta suntingan antara muka (UI).
- **Peraturan Pengekodan (Git):** Selepas setiap perubahan selesai, AI **wajib** menolak (commit & push) kod ke GitHub menggunakan: `git add . ; git commit -m "..." ; git push`.
