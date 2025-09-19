# My Career Journey

**My Career Journey** adalah aplikasi web komprehensif yang dirancang untuk memfasilitasi manajemen dan pengembangan karier karyawan di Indofood CBP Noodle Division. Aplikasi ini menyediakan dua portal utama: satu untuk karyawan dalam mengelola data pribadi dan aspirasi karier mereka, dan satu lagi untuk administrator (Admin, HR, dan Pimpinan Departemen) untuk mengelola data karyawan, menganalisis kompetensi, serta merencanakan suksesi.

## Fitur Utama

Aplikasi ini dibagi menjadi dua portal utama dengan fungsionalitas yang disesuaikan untuk setiap peran pengguna.

### Portal Karyawan

- **Dashboard Personal**: Menampilkan ringkasan profil, status kelengkapan data, riwayat karier, dan prestasi.
- **Formulir Data Diri**: Sebuah formulir multi-langkah yang terstruktur bagi karyawan untuk mengisi riwayat karier, organisasi, kepanitiaan, proyek, GKM, dan prestasi lainnya.
- **Kuesioner Kompetensi**: Karyawan dapat mengisi kuesioner manajerial dan teknis yang hasilnya digunakan untuk analisis kesenjangan kompetensi.
- **Peluang Karier (Job Vacant)**: Sistem terpandu yang memungkinkan karyawan untuk menyatakan minat pada jenjang karier yang tersedia, baik yang sejalur (_align_) maupun lintas jalur (_cross_), setelah memenuhi prasyarat kelengkapan profil dan kesediaan relokasi.

### Portal Admin & Manajemen

- **Dashboard Analitik**: Menyajikan KPI utama seperti total karyawan, jumlah formulir terisi, dan lowongan aktif. Dilengkapi dengan visualisasi data interaktif mengenai distribusi karyawan, tren pengisian kuesioner, rekapitulasi kesediaan relokasi, dan rata-rata skor kompetensi per departemen.
- **Manajemen Data Master**: Fitur CRUD (Create, Read, Update, Delete) untuk data fundamental seperti Karyawan, Posisi, Jenjang Karier, dan Pengguna Sistem.
- **Kontrol Akses Berbasis Peran (RBAC)**: Sistem perizinan yang ketat memastikan bahwa setiap peran (Admin, HR Cabang, Pimpinan Departemen) hanya dapat mengakses data dan fitur yang relevan sesuai kewenangannya.
- **Analisis Hasil Kuesioner**: Administrator dapat melihat rekapitulasi hasil kuesioner kompetensi dari seluruh karyawan dan meninjau detail hasil per individu, termasuk analisis kesenjangan (_gap analysis_) dan rekomendasi pelatihan.
- **Sinkronisasi Data Karyawan**: Fitur untuk mengunggah file Excel, menganalisis perbedaan data, dan melakukan sinkronisasi massal (menambah, memperbarui, menghapus) data karyawan untuk memastikan konsistensi dengan sistem pusat.
- **Manajemen Lowongan Kerja**: Mengelola lowongan pekerjaan yang tersedia, mempublikasikannya, dan memantau daftar karyawan yang berminat pada setiap lowongan.

## Teknologi yang Digunakan

- **Framework**: Next.js (App Router)
- **Bahasa**: TypeScript
- **Database & ORM**: PostgreSQL dengan Prisma
- **Autentikasi**: NextAuth.js
- **Styling**: Tailwind CSS dengan shadcn/ui
- **Manajemen State**: React Hook Form
- **Validasi Skema**: Zod
- **Visualisasi Data**: Recharts
- **Notifikasi**: Sonner
- **Deployment**: Vercel (berdasarkan `vercel.json`)

## Memulai Proyek

### Prasyarat

- Node.js (versi \>=18.18.0)
- npm
- Database PostgreSQL

### Instalasi

1.  **Clone repositori:**

    ```bash
    git clone
    cd
    ```

2.  **Install dependensi:**

    ```bash
    npm install
    ```

3.  **Setup Variabel Lingkungan:**
    Buat file `.env` di root proyek dan isi variabel yang diperlukan sesuai dengan `prisma/schema.prisma`. Minimal, Anda memerlukan:

    ```env
    DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
    DIRECT_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
    NEXTAUTH_SECRET="your-super-secret-key"
    NEXTAUTH_URL="http://localhost:3000"
    INTERNAL_API_SECRET="your-internal-api-secret"
    CRON_SECRET="your-cron-secret"
    NODE_ENV="development"
    ```

4.  **Migrasi Database:**
    Terapkan skema database menggunakan Prisma.

    ```bash
    npx prisma migrate dev
    ```

5.  **Seed Database (Opsional):**
    Untuk mengisi database dengan data awal (termasuk pengguna, kuesioner, dll.), jalankan perintah seed.

    ```bash
    npm run seed
    ```

6.  **Jalankan Server Development:**

    ```bash
    npm run dev
    ```

    Aplikasi akan tersedia di [http://localhost:3000](https://www.google.com/search?q=http://localhost:3000).
