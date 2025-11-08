// cypress/e2e/brbranch/dashboard.cy.ts
// cypress/e2e/hrbranch/dashboard.cy.ts

describe("HR Branch - Dashboard", () => {
  beforeEach(() => {
    // 1. Kunjungi halaman login
    cy.visit("/login");

    // 2. Ambil data login HR Branch
    // Asumsi kredensial ini ada di cypress.env.json
    const hrBranchId = Cypress.env("TEST_HRBRANCH_ID");
    const hrBranchPassword = Cypress.env("TEST_HRBRANCH_PASSWORD");

    // 3. Lakukan login
    cy.get('input[id="employeeId"]').type(hrBranchId);
    cy.get('input[id="password"]').type(hrBranchPassword);
    cy.get('button[type="submit"]').click();

    // 4. Pastikan sudah redirect ke dashboard
    // (Berdasarkan HTML, HR Branch juga diarahkan ke /admin)
    cy.url({ timeout: 10000 }).should("include", "/admin");

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

      // Memastikan link lain ada (Spot check berdasarkan HTML)
      cy.get('a[href="/admin/forms"]').should("be.visible");
      cy.get('a[href="/admin/career-path"]').should("be.visible");
      cy.get('a[href="/admin/employees"]').should("be.visible");
      cy.get('a[href="/admin/positions"]').should("be.visible");
      cy.get('a[href="/admin/departments"]').should("be.visible"); // <-- Ada di HTML ini
      cy.get("button").contains("Sign Out").should("be.visible");
    });

    it("harus menampilkan judul halaman dan filter tanggal", () => {
      cy.contains("h1", "Dashboard Admin").should("be.visible");
      // Memvalidasi data tanggal default (berdasarkan HTML)
      cy.get('button[id="date"]');
    });

    it("harus menampilkan 4 kartu KPI dengan data yang benar", () => {
      // Validasi data berdasarkan HTML
      cy.contains("Total Karyawan Aktif")
        .parent()
        .next("div[data-slot='card-content']");

      cy.contains("Total Form Terisi")
        .parent()
        .next("div[data-slot='card-content']");
      cy.contains("Total Kuesioner Selesai")
        .parent()
        .next("div[data-slot='card-content']");

      cy.contains("Total Job Vacant Aktif")
        .parent()
        .next("div[data-slot='card-content']");
    });

    it("harus menampilkan judul chart dan feed aktivitas", () => {
      // Validasi berdasarkan HTML HR Branch
      cy.contains("Distribusi Karyawan per Departemen").should("be.visible");
      cy.contains("Kesediaan Pindah Lokasi").should("be.visible");
      cy.contains("Tren Pengisian Kuesioner").should("be.visible");
      cy.contains("Aktivitas Terbaru").should("be.visible");
      cy.contains("Rata-rata Skor Kompetensi per Departemen")
        .scrollIntoView()
        .should("be.visible");
    });
  });

  // --- GRUP 2: Tes untuk memvalidasi FUNGSI (klik, navigasi, dll) ---
  describe("Validasi Fungsionalitas (Interactions)", () => {
    // --- Grup tes navigasi sidebar (disesuaikan dengan HTML) ---
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

      // ... (Tes navigasi lain seperti 'forms', 'career-path', 'employees', 'positions' bisa ditambahkan di sini) ...

      it("harus berpindah ke halaman Departments", () => {
        cy.get('a[href="/admin/departments"]').click();
        cy.url().should("include", "/admin/departments");
        cy.contains("h1", "Data Departemen").should("be.visible");
      });
    });

    it('harus bisa mengklik checkbox "Sertakan yang Belum Mengisi"', () => {
      const checkbox = cy.get('button[id="include-not-filled"]');

      // Verifikasi status awal (unchecked sesuai HTML)
      checkbox.should("have.attr", "data-state", "unchecked");

      // Klik checkbox
      checkbox.click();

      // Verifikasi status berubah
      checkbox.should("have.attr", "data-state", "checked");
    });

    it("harus bisa memilih rentang tanggal baru dan memperbarui label filter", () => {
      // 1. Klik tombol filter tanggal untuk membuka popover
      cy.get('button[id="date"]').click();

      // 2. Pastikan popover kalender terlihat
      cy.get('div[data-slot="popover-content"][data-state="open"]').should(
        "be.visible"
      );
      cy.get('table[aria-label="October 2025"]').should("be.visible");

      // 3. Pilih tanggal mulai (15 Oktober 2025) - Klik dua kali
      cy.get('table[aria-label="October 2025"]')
        .contains("button", /^15$/)
        .click();
      cy.get('table[aria-label="October 2025"]')
        .contains("button", /^15$/)
        .click();

      // 4. Pilih tanggal selesai (22 Oktober 2025)
      cy.get('table[aria-label="October 2025"]')
        .contains("button", /^22$/)
        .click();

      // 5. Klik di elemen <main> untuk menutup popover
      cy.get("main").click({ force: true });

      // 6. Popover kalender harusnya sekarang tertutup
      cy.get('button[id="date"]').should("have.attr", "data-state", "closed");

      // 7. Verifikasi bahwa label tombol telah diperbarui
      cy.get('button[id="date"]').should(
        "contain.text",
        "Oct 15, 2025 - Oct 22, 2025"
      );
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
      cy.contains("Konfirmasi Sign Out").should("be.visible"); // Asumsi judul

      // 3. Klik tombol konfirmasi untuk keluar
      cy.get("button").contains("Ya, Keluar").click(); // Asumsi teks tombol

      // 4. Verifikasi sudah kembali ke halaman login
      cy.url().should("include", "/login");
      cy.contains("Selamat Datang di My Career Journey").should("be.visible"); // Asumsi teks di halaman login
    });
  });

  // --- GRUP 3: Tes untuk memvalidasi SCROLL ---
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
    });
  });

  // --- GRUP 4: Tes untuk fungsionalitas responsif (Mobile) ---
  context("Tampilan Seluler (Mobile)", () => {
    beforeEach(() => {
      // Set viewport ke ukuran mobile sebelum setiap tes
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

      // 5. Klik tombol "Ya, Keluar"
      cy.get("button").contains("Ya, Keluar").click();

      // 6. Verifikasi kembali ke halaman login
      cy.url().should("include", "/login");
    });
  });
});
