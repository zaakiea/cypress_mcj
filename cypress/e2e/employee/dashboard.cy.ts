// cypress/e2e/employee/dashboard.cy.ts

describe("Dasbor Karyawan", () => {
  // Blok ini berjalan sebelum SETIAP tes (it) di file ini
  beforeEach(() => {
    // 1. Kunjungi halaman login
    cy.visit("/login");

    // 2. Ambil data login dari cypress.env.json
    const employeeNik = Cypress.env("TEST_EMPLOYEE_ID");
    const employeePassword = Cypress.env("TEST_EMPLOYEE_PASSWORD");

    // 3. Lakukan login
    cy.get('input[id="employeeId"]').type(employeeNik);
    cy.get('input[id="password"]').type(employeePassword);
    cy.get('button[type="submit"]').click();

    // 4. Pastikan sudah redirect ke dashboard
    cy.url().should("include", "/dashboard");

    // 5. Pastikan halaman sudah selesai loading dengan memverifikasi elemen
    // (Ini juga berfungsi sebagai assertion bahwa login berhasil)
    cy.contains("Karyawan Head Office").should("be.visible");
  });

  // --- GRUP 1: Tes untuk memvalidasi semua elemen ADA di halaman ---
  describe("Validasi Tampilan (Display)", () => {
    it("harus menampilkan navigasi sidebar yang aktif", () => {
      // Memastikan link "Dashboard" aktif
      cy.get('a[href="/dashboard"]')
        .should("be.visible")
        .and("have.class", "bg-blue-100"); // Class untuk link aktif

      // Memastikan link lain ada dan tidak aktif
      cy.get('a[href="/form"]')
        .should("be.visible")
        .and("not.have.class", "bg-blue-100");
      cy.get('a[href="/questionnaire"]').should("be.visible");
      cy.get('a[href="/job-vacant"]').should("be.visible");
      cy.get("button").contains("Sign Out").should("be.visible");
    });

    it("harus menampilkan kartu profil karyawan dengan data yang benar", () => {
      cy.contains("Karyawan Head Office").should("be.visible");
      cy.contains("NIK: EMP001HO").should("be.visible");

      // Validasi data key-value
      cy.contains("Posisi").next().should("contain", "QC Process Spv");
      cy.contains("Departemen").next().should("contain", "R&D QC/QA");
      cy.contains("Cabang").next().should("contain", "ICBP-Noodle Head Office");
    });

    it('harus menampilkan kartu peringatan "Lengkapi Profil"', () => {
      cy.contains("Lengkapi Profil Anda").should("be.visible");
      cy.contains("Data diri Anda belum lengkap.").should("be.visible");
      cy.get('a[href="/form"]')
        .contains("Lengkapi Formulir Data Diri")
        .should("be.visible");
    });

    it("harus menampilkan kartu minat karir dan prestasi", () => {
      cy.contains("Minat Karir Anda").should("be.visible");
      cy.contains("Anda belum memilih minat karir.").should("be.visible");
      cy.get('a[href="/job-vacant"]')
        .contains("Lihat Peluang Karir")
        .should("be.visible");

      cy.contains("Rekap Prestasi").should("be.visible");
      cy.contains("Partisipasi GKM").prev().should("contain", "0");
      cy.contains("Karyawan Teladan").prev().should("contain", "0");
    });

    it("harus menampilkan semua kartu riwayat", () => {
      cy.contains("Riwayat Karir").should("be.visible");
      cy.contains("Riwayat Organisasi").should("be.visible");
      cy.contains("Riwayat Kepanitiaan").should("be.visible");
      cy.contains("Riwayat Proyek").should("be.visible");

      // Verifikasi pesan "empty state"
      cy.get('div:contains("Tidak ada riwayat untuk ditampilkan.")').should(
        "have.length.at.least",
        4
      );
    });
  });

  // --- GRUP 2: Tes untuk memvalidasi FUNGSI (klik, navigasi, dll) ---
  describe("Validasi Fungsionalitas (Interactions)", () => {
    // Tes fungsionalitas navigasi sidebar
    it("harus berpindah ke halaman Form saat link di sidebar diklik", () => {
      cy.get('aside a[href="/form"]').click();

      // Verifikasi URL dan konten halaman baru
      cy.url().should("include", "/form");
      cy.contains("Formulir Data Diri").should("be.visible");
    });

    it("harus berpindah ke halaman Kuesioner saat link di sidebar diklik", () => {
      cy.get('a[href="/questionnaire"]').click();

      // Verifikasi URL dan konten halaman baru
      cy.url().should("include", "/questionnaire");
      cy.contains("Kuesioner Kompetensi").should("be.visible");
    });

    it("harus berpindah ke halaman Lowongan Pekerjaan saat link di sidebar diklik", () => {
      cy.get('aside a[href="/job-vacant"]').click();

      // Verifikasi URL dan konten halaman baru
      cy.url().should("include", "/job-vacant");
      cy.contains("Peluang Karier Untuk Anda").should("be.visible");
    });

    // Tes fungsionalitas link di dalam konten dashboard
    it('harus berpindah ke halaman Form dari kartu peringatan "Lengkapi Profil"', () => {
      // Ini adalah link yang sama dengan di sidebar, tapi kita tes dari entry point yang berbeda
      cy.get('a[href="/form"]').contains("Lengkapi Formulir Data Diri").click();

      // Verifikasi URL dan konten halaman baru
      cy.url().should("include", "/form");
      cy.contains("Formulir Data Diri").should("be.visible");
    });

    it('harus berpindah ke halaman Lowongan Pekerjaan dari kartu "Minat Karir"', () => {
      cy.get('a[href="/job-vacant"]').contains("Lihat Peluang Karir").click();

      // Verifikasi URL dan konten halaman baru
      cy.url().should("include", "/job-vacant");
      cy.contains("Peluang Karier Untuk Anda").should("be.visible");
    });

    // Tes fungsionalitas Logo
    it("harus tetap di halaman dasbor saat mengklik logo", () => {
      // Cari logo di dalam sidebar dan klik
      cy.get('aside div.justify-center a[href="/"]').click();

      // URL harus tetap /dashboard (karena sudah login)
      cy.url().should("include", "/dashboard");
      // Pastikan kartu profil masih ada
      cy.contains("Karyawan Head Office").should("be.visible");
    });

    // Tes fungsionalitas Logout
    it("harus berhasil Sign Out", () => {
      // 1. Klik tombol Sign Out di sidebar
      cy.get("button").contains("Sign Out").click();

      // 2. Modal konfirmasi akan muncul
      // (Saya asumsikan teks modalnya seperti ini, sesuaikan jika berbeda)
      cy.get('div[role="alertdialog"]').should(
        "have.attr",
        "data-state",
        "open"
      );
      cy.contains("Konfirmasi Sign Out").should("be.visible");
      cy.contains("Apakah Anda yakin ingin keluar dari sesi ini?").should(
        "be.visible"
      );

      // 3. Klik tombol konfirmasi untuk keluar
      // (Saya asumsikan ada tombol "Keluar" atau "Ya", sesuaikan selector-nya)
      // 4. Lanjutkan sisa tes...
      cy.get("button").contains("Ya, Keluar").click();

      // 4. Verifikasi sudah kembali ke halaman login
      cy.url().should("include", "/login");
      cy.get('img[alt="Indofood CBP Noodle Division Logo"]').should(
        "be.visible"
      );
      cy.contains(
        '[data-slot="card-title"]',
        "Selamat Datang di My Career Journey"
      ).should("be.visible");
      cy.contains(
        '[data-slot="card-description"]',
        "Masukkan Nomor Induk Karyawan dan Kata Sandi untuk Masuk."
      ).should("be.visible");
      cy.contains('label[for="employeeId"]', "Nomor Induk Karyawan").should(
        "be.visible"
      );
      cy.get('input[id="employeeId"]')
        .should("be.visible")
        .and("have.attr", "placeholder", "NIK");
      cy.contains('label[for="password"]', "Kata Sandi").should("be.visible");
      cy.get('input[id="password"]')
        .should("be.visible")
        .and("have.attr", "placeholder", "Masukkan Kata Sandi");
      cy.get('button[type="submit"]')
        .should("be.visible")
        .and("contain", "Masuk");
    });
  });

  // --- GRUP 3: Tes untuk fungsionalitas responsif (Mobile) ---
  context("Tampilan Seluler (Mobile)", () => {
    beforeEach(() => {
      // Set viewport ke ukuran mobile sebelum setiap tes di grup 'context' ini
      cy.viewport("iphone-6"); // 375px x 667px
    });

    // Ganti kode di dalam tes "harus menampilkan dan menyembunyikan sidebar..."
    it("harus menampilkan dan menyembunyikan sidebar saat tombol menu di-klik", () => {
      // 1. Pastikan sidebar <aside> awalnya tersembunyi
      cy.get("aside").should("have.class", "-translate-x-full");

      // 2. Klik tombol di <header> untuk MEMBUKA sidebar
      cy.get('header button[aria-controls="sidebar"]')
        .should("be.visible")
        .click();

      // 3. Verifikasi sidebar <aside> sekarang terlihat
      //    (Tunggu animasinya selesai)
      cy.get("aside").should("not.have.class", "-translate-x-full");

      // 4. (PERBAIKAN) Klik di area <main> (di luar sidebar) untuk MENUTUP sidebar
      //    Kita gunakan { force: true } karena overlay mungkin tidak dianggap 'actionable'
      cy.get("main").click({ force: true });

      // 5. Verifikasi sidebar <aside> tersembunyi kembali
      cy.get("aside").should("have.class", "-translate-x-full");
    });
    it("harus bisa logout dari sidebar mobile", () => {
      // 1. Buka sidebar mobile dengan mengklik tombol di <header>
      cy.get('header button[aria-controls="sidebar"]')
        .should("be.visible")
        .click();

      // 2. Sidebar terlihat
      cy.get("aside").should("not.have.class", "-translate-x-full");

      // 3. Klik tombol Sign Out yang ada DI DALAM <aside>
      cy.get("aside button").contains("Sign Out").click();

      // 4. Modal konfirmasi akan muncul
      cy.get('div[role="alertdialog"]').should(
        "have.attr",
        "data-state",
        "open"
      );
      cy.contains("Konfirmasi Sign Out").should("be.visible");
      cy.contains("Apakah Anda yakin ingin keluar dari sesi ini?").should(
        "be.visible"
      );

      // 5. Klik tombol "Ya, Keluar"
      cy.get("button").contains("Ya, Keluar").click();

      // 6. Verifikasi kembali ke halaman login
      cy.url().should("include", "/login");
    });
  });
});
