// cypress/e2e/admin/dashboard.cy.ts

describe("Dasbor Admin", () => {
  beforeEach(() => {
    // 1. Kunjungi halaman login
    cy.visit("/login");

    // 2. Ambil data login admin dari cypress.env.json
    const adminId = Cypress.env("TEST_ADMIN_ID");
    const adminPassword = Cypress.env("TEST_ADMIN_PASSWORD");

    // 3. Lakukan login
    cy.get('input[id="employeeId"]').type(adminId);
    cy.get('input[id="password"]').type(adminPassword);
    cy.get('button[type="submit"]').click();

    // 4. Pastikan sudah redirect ke dashboard admin
    cy.url().should("include", "/admin");

    // 5. Pastikan halaman selesai loading
    cy.contains("h1", "Dashboard Admin").should("be.visible");
  });

  // --- GRUP 1: Tes untuk memvalidasi semua elemen ADA di halaman ---
  describe("Validasi Tampilan (Display)", () => {
    it("harus menampilkan navigasi sidebar yang aktif", () => {
      // Memastikan link "Dashboard" aktif
      cy.get('a[href="/admin"]')
        .should("be.visible")
        .and("have.class", "bg-blue-100"); // Class untuk link aktif

      // Memastikan link lain ada (Spot check)
      cy.get('a[href="/admin/forms"]').should("be.visible");
      cy.get('a[href="/admin/employees"]').should("be.visible");
      cy.get('a[href="/admin/users"]').should("be.visible");
      cy.get("button").contains("Sign Out").should("be.visible");
    });

    it("harus menampilkan judul halaman dan filter tanggal", () => {
      cy.contains("h1", "Dashboard Admin").should("be.visible");
      // Memvalidasi data tanggal default (berdasarkan HTML)
      cy.get('button[id="date"]').should(
        "contain",
        "Oct 06, 2025 - Nov 04, 2025"
      );
    });

    it("harus menampilkan 4 kartu KPI dengan data yang benar", () => {
      // Menggunakan .next() lebih stabil daripada cy.contains("1629")
      cy.contains("Total Karyawan Aktif")
        .parent() // <-- Naik ke <div data-slot="card-header">
        .next() // <-- Pindah ke sibling-nya, yaitu <div data-slot="card-content">
        .should("contain", "1629"); // <-- Cek angka di dalam card-content

      cy.contains("Total Form Terisi").parent().next().should("contain", "1");

      cy.contains("Total Kuesioner Selesai")
        .parent()
        .next()
        .should("contain", "2");

      cy.contains("Total Job Vacant Aktif")
        .parent()
        .next()
        .should("contain", "31");
    });

    it("harus menampilkan judul chart dan feed aktivitas", () => {
      cy.contains("Distribusi Karyawan per Cabang").should("be.visible");
      cy.contains("Kesediaan Pindah Lokasi").should("be.visible");
      cy.contains("Tren Pengisian Kuesioner").should("be.visible");
      cy.contains("Aktivitas Terbaru").should("be.visible");

      // Validasi salah satu item di feed
      cy.contains("Karyawan Tangerang telah menyelesaikan kuesioner").should(
        "be.visible"
      );
    });
  });

  // --- GRUP 2: Tes untuk memvalidasi FUNGSI (klik, navigasi, dll) ---
  describe("Validasi Fungsionalitas (Interactions)", () => {
    // --- PENAMBAHAN: Grup tes navigasi sidebar ---
    describe("Validasi Navigasi Sidebar", () => {
      it("harus kembali ke Dashboard saat link Dashboard diklik", () => {
        // Klik link lain dulu
        cy.get('a[href="/admin/forms"]').click();
        cy.contains("h1", "Manajemen Formulir Karyawan").should("be.visible");

        // Klik link Dashboard
        cy.get('a[href="/admin"]').click();
        cy.url().should("include", "/admin");
        cy.contains("h1", "Dashboard Admin").should("be.visible");
      });

      it("harus berpindah ke halaman Form", () => {
        cy.get('a[href="/admin/forms"]').click();
        cy.url().should("include", "/admin/forms");
        cy.contains("h1", "Manajemen Formulir Karyawan").should("be.visible");
      });

      it("harus berpindah ke halaman Questionnaires", () => {
        cy.get('a[href="/admin/questionnaires"]').click();
        cy.url().should("include", "/admin/questionnaires");
        cy.contains("h1", "Hasil Kuesioner Kompetensi").should("be.visible");
      });

      it("harus berpindah ke halaman Career Path", () => {
        cy.get('a[href="/admin/career-path"]').click();
        cy.url().should("include", "/admin/career-path");
        cy.contains("h1", "Manajemen Jenjang Karier").should("be.visible");
      });

      it("harus berpindah ke halaman Job Vacant", () => {
        cy.get('a[href="/admin/job-vacancies"]').click();
        cy.url().should("include", "/admin/job-vacancies");
        cy.contains("h1", "Manajemen Lowongan Pekerjaan").should("be.visible");
      });

      it("harus berpindah ke halaman Employees", () => {
        cy.get('a[href="/admin/employees"]').click();
        cy.url().should("include", "/admin/employees");
        // Judul dari file page.tsx adalah "Employee Database"
        cy.contains("h1", "Data Karyawan").should("be.visible");
      });

      it("harus berpindah ke halaman Positions", () => {
        cy.get('a[href="/admin/positions"]').click();
        cy.url().should("include", "/admin/positions");
        cy.contains("h1", "Data Posisi").should("be.visible");
      });

      it("harus berpindah ke halaman Departments", () => {
        cy.get('a[href="/admin/departments"]').click();
        cy.url().should("include", "/admin/departments");
        cy.contains("h1", "Data Departemen").should("be.visible");
      });

      it("harus berpindah ke halaman Branches", () => {
        cy.get('a[href="/admin/branches"]').click();
        cy.url().should("include", "/admin/branches");
        cy.contains("h1", "Manajemen Cabang").should("be.visible");
      });

      it("harus berpindah ke halaman User Management", () => {
        cy.get('a[href="/admin/users"]').click();
        cy.url().should("include", "/admin/users");
        cy.contains("h1", "Manajemen Pengguna").should("be.visible");
      });
    });
    it('harus bisa mengklik checkbox "Sertakan yang Belum Mengisi"', () => {
      const checkbox = cy.get('button[id="include-not-filled"]');

      // Verifikasi status awal
      checkbox.should("have.attr", "data-state", "unchecked");

      // Klik checkbox
      checkbox.click();

      // Verifikasi status berubah
      checkbox.should("have.attr", "data-state", "checked");
    });

    it("harus berhasil Sign Out", () => {
      // 1. Klik tombol Sign Out di sidebar
      cy.get("aside button").contains("Sign Out").click();

      // 2. Modal konfirmasi akan muncul
      cy.get('div[role="alertdialog"]').should(
        "have.attr",
        "data-state",
        "open"
      );
      cy.contains("Konfirmasi Sign Out").should("be.visible");

      // 3. Klik tombol konfirmasi untuk keluar
      cy.get("button").contains("Ya, Keluar").click();

      // 4. Verifikasi sudah kembali ke halaman login
      cy.url().should("include", "/login");
      cy.contains("Selamat Datang di My Career Journey").should("be.visible"); // Asumsi teks di halaman login
    });
  });

  // --- GRUP 3: Tes untuk memvalidasi SCROLL (Sesuai permintaan) ---
  describe("Validasi Halaman (Scroll)", () => {
    it("harus bisa scroll ke bawah dan melihat chart Kompetensi per Departemen", () => {
      // 1. Cari judul chart yang ada di paling bawah
      const lastChartTitle = cy.contains(
        "Rata-rata Skor Kompetensi per Departemen"
      );

      // 2. Scroll ke elemen tersebut
      lastChartTitle.scrollIntoView();

      // 3. Pastikan elemen itu sekarang terlihat
      lastChartTitle.should("be.visible");

      // 4. Validasi data di dalam chart tersebut
      cy.contains("R&D QC/QA").should("be.visible");
      cy.contains("ADM HR").should("be.visible");
    });
  });

  // --- GRUP 4: Tes untuk fungsionalitas responsif (Mobile) ---
  context("Tampilan Seluler (Mobile)", () => {
    beforeEach(() => {
      // Set viewport ke ukuran mobile sebelum setiap tes di grup 'context' ini
      cy.viewport("iphone-6"); // 375px x 667px
    });

    it("harus menampilkan dan menyembunyikan sidebar saat tombol menu di-klik", () => {
      // 1. Pada tampilan mobile, sidebar <aside> harus tersembunyi
      cy.get("aside").should("have.class", "-translate-x-full");

      // 2. Cari tombol hamburger (hanya terlihat di mobile) dan klik
      cy.get('header button[aria-controls="sidebar"]')
        .should("be.visible")
        .click();

      // 3. Sidebar <aside> sekarang harus terlihat
      cy.get("aside").should("not.have.class", "-translate-x-full");

      // 4. Klik di area <main> (di luar sidebar) untuk MENUTUP
      cy.get("main").click({ force: true });

      // 5. Sidebar <aside> harus tersembunyi kembali
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
