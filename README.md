# Dewa Bike Tour Bali - Website & Google Sheets Database

Website resmi untuk **Dewa Bike Tour Bali**, dirancang berbasis HTML5/CSS3/Vanilla JS yang ringan, cepat, memiliki animasi lembut, siap di-hosting secara gratis di **GitHub Pages**, dan terintegrasi langsung dengan **Google Sheets** sebagai basis data reservasi.

---

## 📁 Struktur Direktori

```
dewa-bike-tour/
├── index.html                  # Halaman web utama
├── css/
│   └── style.css               # Styling, animasi, dan desain responsif
├── js/
│   ├── config.js               # Pengaturan URL Google Apps Script & WhatsApp
│   └── main.js                 # Logika interaktif, animasi scroll, dan pengiriman form
├── google-apps-script/
│   └── Code.gs                 # Skrip backend untuk Google Apps Script (Google Sheets)
└── README.md                   # Petunjuk setup & hosting
```

---

## 🚀 Langkah 1: Hubungkan ke Google Sheets (Database)

Hanya perlu waktu sekitar 3 menit:

1. **Buat Google Spreadsheet Baru**:
   - Kunjungi [Google Sheets](https://sheets.new).
   - Beri nama spreadsheet Anda, misalnya: `Dewa Bike Tour Bookings`.
   - Pada baris pertama (Baris 1), isi judul kolom berikut:
     | A1 | B1 | C1 | D1 | E1 | F1 | G1 | H1 | I1 |
     |---|---|---|---|---|---|---|---|---|
     | **Timestamp** | **Nama Lengkap** | **Email** | **No. WhatsApp** | **Paket Tour** | **Tanggal Tour** | **Jumlah Peserta** | **Lokasi Penjemputan** | **Catatan Tambahan** |

2. **Pasang Google Apps Script**:
   - Di Google Sheets, klik menu **Extensions** (Ekstensi) > **Apps Script**.
   - Hapus teks bawaan di editor, lalu salin dan tempelkan seluruh isi file [`google-apps-script/Code.gs`](google-apps-script/Code.gs).
   - Klik ikon **Save** (Simpan).

3. **Deploy (Terapkan) sebagai Web App**:
   - Klik tombol **Deploy** di pojok kanan atas > pilih **New deployment** (Penerapan baru).
   - Klik ikon gerigi (Settings) di sebelah kiri > pilih jenis **Web app**.
   - Isi konfigurasi:
     - **Description**: `Dewa Bike Tour Booking API`
     - **Execute as**: `Me (email anda)`
     - **Who has access**: **`Anyone` (Siapa saja)** *(PENTING: Jangan pilih "Only myself" agar formulir dari website bisa mengirim data)*.
   - Klik **Deploy**.
   - Jika Google meminta otorisasi akun (*Authorize access*), pilih akun Anda, klik *Advanced*, lalu *Go to Dewa Bike Tour (unsafe)*, dan klik *Allow*.
   - Salin **Web App URL** yang dihasilkan (URL yang berakhiran `/exec`).

4. **Tempelkan URL ke Website**:
   - Buka file [`js/config.js`](js/config.js).
   - Ganti nilai `GOOGLE_SHEET_WEBAPP_URL` dengan URL yang baru Anda salin tadi:
     ```javascript
     GOOGLE_SHEET_WEBAPP_URL: "https://script.google.com/macros/s/AKfycbx.../exec",
     ```
   - Sesuaikan juga nomor WhatsApp Anda pada `WHATSAPP_NUMBER`.

---

## 🌐 Langkah 2: Cara Hosting Gratis di GitHub Pages

1. **Buat Repository Baru di GitHub**:
   - Buka [github.com/new](https://github.com/new).
   - Beri nama repositori, misalnya: `dewa-bike-tour`.
   - Pilih **Public**.
   - Klik **Create repository**.

2. **Upload / Push File ke GitHub**:
   Jalankan perintah berikut di terminal komputer Anda (dari dalam folder `dewa-bike-tour`):
   ```bash
   git init
   git add .
   git commit -m "Peluncuran website Dewa Bike Tour Bali"
   git branch -M main
   git remote add origin https://github.com/USERNAME-ANDA/dewa-bike-tour.git
   git push -u origin main
   ```
   *(Atau Anda juga bisa langsung drag-and-drop semua file dan folder ke halaman GitHub via browser)*.

3. **Aktifkan Fitur GitHub Pages**:
   - Masuk ke tab **Settings** di repositori GitHub Anda.
   - Di menu sebelah kiri, klik **Pages**.
   - Pada bagian **Build and deployment > Branch**, pilih branch **`main`** dan folder **`/(root)`**.
   - Klik **Save**.
   - Tunggu 1–2 menit, website Anda sudah aktif dan online di URL:
     `https://USERNAME-ANDA.github.io/dewa-bike-tour/`

---

## ✨ Fitur-Fitur Unggulan

- **Animasi Halus & Interaktif**: Efek floating badge, paralaks hero, kartu interaktif yang terangkat saat di-hover, serta animasi muncul saat di-scroll (*scroll reveal*).
- **Auto Package Selection**: Saat calon tamu mengklik tombol *"Pesan Sekarang"* di salah satu kartu paket, halaman otomatis scroll ke formulir dan paket tersebut langsung terpilih otomatis.
- **Konfirmasi WhatsApp Otomatis**: Selain masuk ke Google Sheets, tamu disediakan tombol instan dengan draf teks rapi yang langsung menghubungkan ke WhatsApp admin untuk konfirmasi secepat kilat.
- **100% Responsif**: Tampilan sempurna di smartphone (HP), tablet, maupun laptop/PC desktop.
- **Tanpa Server Berbayar**: Menggunakan arsitektur statis yang cepat, aman dari hacking database SQL, dan hemat biaya 100%.
