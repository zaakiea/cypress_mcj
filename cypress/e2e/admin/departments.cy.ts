// cypress/e2e/admin/departments.cy.ts

describe("Manajemen Departemen (Admin)", () => {
  beforeEach(() => {
    // 1. Kunjungi halaman login
    cy.visit("/login");

    // 2. Ambil data login admin dari cypress.env.json
    const adminId = Cypress.env("TEST_ADMIN_ID");
    const adminPassword = Cypress.env("TEST_ADMIN_PASSWORD");

    // 3. Lakukan loginw
    cy.get('input[id="employeeId"]').type(adminId);
    cy.get('input[id="password"]').type(adminPassword);
    cy.get('button[type="submit"]').click();

    // 4. Pastikan sudah redirect ke dashboard admin
    cy.url({ timeout: 10000 }).should("include", "/admin");
    cy.contains("h1", "Dashboard Admin").should("be.visible");

    // 5. Navigasi ke halaman Manajemen Departemen
    cy.get('a[href="/admin/departments"]').click();

    // 6. Pastikan halaman selesai loading (Judul dari page.tsx adalah "Departments")
    cy.contains("h1", "Data Departemen").should("be.visible");
  });

  // --- GRUP 1: Tes untuk memvalidasi semua elemen ADA di halaman ---
  describe("Validasi Tampilan (Display)", () => {
    it("harus menampilkan sidebar dengan link 'Departments' yang aktif", () => {
      // Memastikan link "Departments" aktif
      cy.get('a[href="/admin/departments"]')
        .should("be.visible")
        .and("have.class", "bg-blue-100"); // Class untuk link aktif

      // Memastikan link lain tidak aktif
      cy.get('a[href="/admin/branches"]')
        .should("be.visible")
        .and("not.have.class", "bg-blue-100");
    });

    it("harus menampilkan kontrol tabel (search dan show entries)", () => {
      // Cek dropdown "show entries"
      cy.contains("Show").next().should("contain", "10");

      // Cek input search
      cy.get('input[placeholder="Search..."]').should("be.visible");
    });

    it("harus menampilkan header tabel dengan benar", () => {
      // Berdasarkan API (id, name), header tabel seharusnya ini
      cy.get("table th").contains("ID Departemen").should("be.visible");
      cy.get("table th").contains("Nama Departemen").should("be.visible");
    });

    it("harus menampilkan data di tabel dan info paginasi", () => {
      // Cek data baris pertama (data ini ada di dashboard Anda)
      cy.get("table tbody tr").first().should("contain", "R&D QC/QA");

      // Cek data baris lain (asumsi)
      cy.get("table tbody tr").should("contain", "ADM HR");

      // Cek info paginasi (menggunakan regex agar lebih fleksibel)
      cy.contains(/Showing 1 to \d+ of \d+ entries/i).should("be.visible");
    });
  });

  // --- GRUP 2: Tes untuk memvalidasi FUNGSI (klik, navigasi, dll) ---
  describe("Validasi Fungsionalitas (Interactions)", () => {
    it("harus bisa memfilter tabel menggunakan pencarian [Nama Departemen]", () => {
      // 1. Cari data yang unik (case-insensitive)
      cy.get('input[placeholder="Search..."]').type("r&d qc");

      // 2. Pastikan hanya data yang dicari yang muncul
      cy.get("table tbody tr").should("have.length", 1);
      cy.contains("R&D QC/QA").should("be.visible");

      // 3. Pastikan data lain hilang
      cy.contains("ADM HR").should("not.exist");

      // 4. Hapus pencarian
      cy.get('input[placeholder="Search..."]').clear();

      // 5. Pastikan data kembali seperti semula (minimal lebih dari 1)
      cy.get("table tbody tr").should("have.length.greaterThan", 1);
      cy.contains("R&D QC/QA").should("be.visible");
      cy.contains("ADM HR").should("be.visible");
    });

    it("harus menampilkan 'No results found' saat mencari berdasarkan [ID Departemen]", () => {
      // Berdasarkan API (app/api/admin/departments/route.ts),
      // pencarian HANYA berdasarkan 'name', bukan 'id'.

      // 1. Cari berdasarkan ID Departemen (asumsi ID-nya 'D001')
      cy.get('input[placeholder="Search..."]').type("D001");

      // 2. Pastikan tabel menampilkan "No results found."
      cy.get("table tbody tr").should("have.length", 1);
      cy.contains("No results found.").should("be.visible");

      // 3. Pastikan data lain hilang
      cy.contains("R&D QC/QA").should("not.exist");
    });

    it("harus bisa berpindah halaman menggunakan paginasi (jika ada)", function () {
      // <-- UBAH INI
      // Tes ini akan otomatis diskip jika tidak ada cukup data untuk paginasi

      // Cek apakah paginasi (tombol "2") ada
      cy.get("body").then(($body) => {
        // Cari tombol "2" di area paginasi
        const $button2 = $body.find(
          'div.flex.items-center.gap-1 button:contains("2")'
        );

        if ($button2.length > 0) {
          // Jika tombol "2" ada, lanjutkan tes
          const paginationText = /Showing 1 to 10 of \d+ entries/i;
          cy.contains(paginationText).should("be.visible");

          // 1. Klik halaman 2
          cy.contains(paginationText)
            .next()
            .find("button")
            .contains("2")
            .click();

          // 2. Pastikan info paginasi terupdate
          const newPaginationText = /Showing 11 to \d+ of \d+ entries/i;
          cy.contains(newPaginationText).should("be.visible");

          // 3. Klik halaman 1 (kembali)
          cy.contains(newPaginationText)
            .next()
            .find("button")
            .contains("1")
            .click();

          // 4. Pastikan info paginasi kembali
          cy.contains(paginationText).should("be.visible");
        } else {
          // Jika tidak ada tombol "2", skip tes ini
          cy.log("Skipping pagination test: Not enough data.");
          this.skip(); // <-- 'this.skip()' sekarang akan berfungsi
        }
      });
    });
  });
});
