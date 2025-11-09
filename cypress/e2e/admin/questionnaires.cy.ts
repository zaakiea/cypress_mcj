// cypress/e2e/admin/questionnaires.cy.ts
// cypress/e2e/admin/questionnaires.cy.ts

describe("Admin - Hasil Kuesioner Kompetensi", () => {
  // Logika login dan navigasi ini diadaptasi dari contoh form.cy.ts Anda
  beforeEach(() => {
    // 1. Kunjungi halaman login
    cy.visit("/login");

    // 2. Ambil data login admin dari cypress.env
    const adminId = Cypress.env("TEST_ADMIN_ID");
    const adminPassword = Cypress.env("TEST_ADMIN_PASSWORD");

    // 3. Lakukan login
    cy.get('input[id="employeeId"]').type(adminId);
    cy.get('input[id="password"]').type(adminPassword);
    cy.get('button[type="submit"]').click();

    // 4. Pastikan sudah di dashboard admin
    cy.url({ timeout: 10000 }).should("include", "/admin");
    cy.contains("h1", "Dashboard Admin").should("be.visible");

    // 5. Navigasi ke halaman Hasil Kuesioner
    // (Menggunakan selector dari HTML yang Anda berikan)
    cy.get('a[href="/admin/questionnaires"]').click();

    // 6. Pastikan halaman selesai loading dan judulnya benar
    cy.contains("h1", "Hasil Kuesioner Kompetensi").should("be.visible");
  });

  // --- GRUP 1: Validasi Tampilan Awal (Display) ---
  describe("Validasi Tampilan (Display)", () => {
    it('harus menampilkan sidebar dengan link "Questionnaires" yang aktif', () => {
      // Verifikasi link 'Questionnaires' aktif (sesuai HTML)
      cy.get('a[href="/admin/questionnaires"]')
        .should("be.visible")
        .and("have.class", "bg-blue-100"); // Link aktif

      // Verifikasi link lain tidak aktif
      cy.get('a[href="/admin/forms"]')
        .should("be.visible")
        .and("not.have.class", "bg-blue-100");
    });

    it("harus menampilkan judul halaman dan kontrol tabel (Search, Filter, Show)", () => {
      cy.contains("h1", "Hasil Kuesioner Kompetensi").should("be.visible");

      // Kontrol tabel
      cy.contains("Show").next().should("contain", "10");
      cy.get('input[placeholder="Search..."]').should("be.visible");
      cy.contains("button", "Filter").should("be.visible");
    });

    it("harus menampilkan header tabel kuesioner dengan benar", () => {
      // Header Tabel
      cy.get("table th").contains("Nama").should("be.visible");
      cy.get("table th").contains("Jabatan").should("be.visible");
      cy.get("table th").contains("Cabang").should("be.visible");
      cy.get("table th").contains("Departemen").should("be.visible");
      cy.get("table th").contains("Nilai").should("be.visible");
      cy.get("table th").contains("Aksi").should("be.visible");
    });
  });

  // --- GRUP 2: Validasi Fungsionalitas (Interactions) ---
  describe("Validasi Fungsionalitas (Interactions)", () => {
    it("harus bisa memfilter tabel menggunakan [Search]", () => {
      // 1. Cari data spesifik
      cy.get('input[placeholder="Search..."]').type("Ahmad Fauzan");
      cy.wait(500); // Tunggu debounce/network

      // 2. Pastikan hanya data yang dicari yang muncul
      cy.get("table tbody tr").should("have.length", 1);
      cy.get("table tbody tr").first().should("contain", "Ahmad Fauzan");

      // 3. Pastikan data lain hilang
      cy.contains("Test Employee 2").should("not.exist");

      // 4. Hapus pencarian dan cari data kedua
      cy.get('input[placeholder="Search..."]').clear().type("ADM Fin.& Acct.");
      cy.wait(500);

      // 5. Verifikasi data kedua
      cy.get("table tbody tr").should("have.length", 1);
      cy.get("table tbody tr").first().should("contain", "Ahmad Fauzan");
      cy.get('input[placeholder="Search..."]').clear();
      cy.wait(1000); // Tunggu debounce setelah clear
      cy.get('input[placeholder="Search..."]').type("Pengguna Fiktif");
      cy.wait(1000); // Tunggu debounce setelah type

      cy.contains("No results found.").should("be.visible");
    });

    it("harus bisa memfilter tabel menggunakan [Filter Cabang, Departemen, dan Jabatan]", () => {
      // 1. Buka popover filter
      cy.contains("button", "Filter").click();

      // 2. Dialog popover harus muncul. Gunakan .within() untuk membatasi scope.
      cy.get('div[role="dialog"]').within(() => {
        // Asersi judul di dalam dialog
        cy.contains("h4", "Filter Data").should("be.visible");

        // 3. Terapkan filter [Cabang]
        cy.contains("label", "Cabang").next('button[role="combobox"]').click();
      });

      // 4. Pilih opsi (Head Office) - Sesuai data 'Test Employee 2'
      cy.get('div[role="option"]').contains("ICBP-Noodle Head Office").click();

      // 5. Terapkan filter [Departemen]
      cy.get('div[role="dialog"]').within(() => {
        cy.contains("label", "Departemen")
          .next('button[role="combobox"]')
          .click();
      });

      // 6. Pilih Sesuai data 'Test Employee 2'
      cy.get('div[role="option"]').contains("ADM Fin.& Acct.").click();

      // 7. Terapkan filter [Jabatan] (Filter tambahan)
      cy.get('div[role="dialog"]').within(() => {
        cy.contains("label", "Jabatan") // Asumsi labelnya "Jabatan"
          .next('button[role="combobox"]')
          .click();
      });

      // 8. Pilih Finance Staff
      cy.get('div[role="option"]').contains("Finance Staff").click();

      // 9. Klik Terapkan
      cy.get('div[role="dialog"]').within(() => {
        cy.contains("button", "Terapkan Filter").click();
      });

      cy.wait(500); // Tunggu data reload

      // 10. Verifikasi semua data di tabel
      cy.get("table tbody tr").should("have.length", 1);
      cy.contains("td", "Ahmad Fauzan").should("be.visible");
      cy.contains("td", "Test Karyawan 2").should("not.exist");

      // Verifikasi lebih detail per kolom
      cy.get("table tbody tr").each(($row) => {
        // Kolom di questionnaires.cy.ts:
        // 0: Nama
        // 1: Jabatan
        // 2: Cabang
        // 3: Departemen
        cy.wrap($row).find("td").eq(1).should("contain", "Finance Staff");
        cy.wrap($row).find("td").eq(2).should("contain", "Head Office");
        cy.wrap($row).find("td").eq(3).should("contain", "ADM Fin.& Acct.");
      });

      // 11. Tombol filter harus terlihat aktif (berwarna biru)
      cy.contains("button", "Filter").should("have.class", "bg-primary");

      // 12. Reset filter
      cy.contains("button", "Filter").click();
      cy.get('div[role="dialog"]').contains("button", "Reset").click();
      cy.wait(500);

      // 13. Verifikasi tombol kembali ke status tidak aktif (outline)
      cy.contains("button", "Filter").should("not.have.class", "bg-primary");
      cy.contains("button", "Filter").should("have.class", "border");

      // 14. Verifikasi data kembali seperti semula
      cy.get("table tbody tr").should("have.length.gte", 4);
      cy.contains("td", "Test Karyawan 1").should("be.visible");
      cy.contains("td", "Test Karyawan 2").should("be.visible");
      cy.contains("td", "Test Karyawan 3").should("be.visible");
    });

    it('harus bisa mengganti urutan [Sorting] kolom "Nama"', () => {
      // Tes ini memvalidasi siklus 3-state (asc -> desc -> unsorted)
      cy.get("table th").contains("Nama").as("headerNama");

      // Simpan data awal
      const firstRowText = "Ahmad Fauzan";
      const secondRowText = "Test Karyawan 3";

      // --- PERBAIKAN 1: Verifikasi Status Awal (Ascending) ---
      // Berdasarkan HTML, status awal adalah 'arrow-up' (Ascending)
      cy.log("State 1: Initial (Ascending)");
      cy.get("@headerNama").find("svg.lucide-arrow-up").should("be.visible");
      cy.get("@headerNama").find("svg.lucide-arrow-down").should("not.exist");
      cy.get("@headerNama")
        .find("svg.lucide-chevrons-up-down")
        .should("not.exist");
      // Verifikasi data urut A-Z
      cy.get("table tbody tr:first-child td:first-child").should(
        "contain",
        firstRowText
      );

      // --- PERBAIKAN 2: Klik untuk sort Descending (Z-A) ---
      cy.log("State 2: Click to Descending");
      cy.get("@headerNama").click();
      cy.wait(500); // Tunggu data reload
      // Ikon harus berubah menjadi 'arrow-down'
      cy.get("@headerNama").find("svg.lucide-arrow-down").should("be.visible");
      cy.get("@headerNama").find("svg.lucide-arrow-up").should("not.exist");

      // Data harus berbalik (Test Employee 2 > Karyawan Tangerang)
      cy.get("table tbody tr:first-child td:first-child").should(
        "contain",
        secondRowText
      );

      // --- PERBAIKAN 3: Klik untuk Unsorted ---
      cy.log("State 3: Click to Unsorted");
      cy.get("@headerNama").click();
      cy.wait(500); // Tunggu data reload
      // Ikon harus berubah menjadi 'chevrons-up-down'
      cy.get("@headerNama")
        .find("svg.lucide-chevrons-up-down")
        .should("be.visible");
      cy.get("@headerNama").find("svg.lucide-arrow-down").should("not.exist");

      // Data kembali ke urutan default (atau mungkin urutan unsorted,
      // tapi kita asumsikan kembali ke default seperti 'firstRowText')
      cy.get("table tbody tr:first-child td:first-child").should(
        "contain",
        firstRowText
      );

      // --- (Opsional) Verifikasi kembali ke Ascending ---
      cy.log("State 4: Click back to Ascending");
      cy.get("@headerNama").click();
      cy.wait(500);
      cy.get("@headerNama").find("svg.lucide-arrow-up").should("be.visible");
      cy.get("table tbody tr:first-child td:first-child").should(
        "contain",
        firstRowText
      );
    });

    it("harus bernavigasi ke halaman detail saat tombol [Aksi] diklik", () => {
      // 1. Cari baris
      cy.contains("td", "Ahmad Fauzan")
        .parent("tr")
        .find("td")
        .last() // Dapatkan sel 'Aksi'
        .find("button") // Dapatkan tombol 'mata'
        .click();

      // 2. Verifikasi URL berubah ke halaman detail
      // Asumsi URL-nya adalah /admin/questionnaires/[employeeId]
      cy.url().should("include", "/admin/questionnaires/");
      cy.url().should(
        "not.eq",
        Cypress.config().baseUrl + "/admin/questionnaires"
      );

      // 3. (Opsional) Verifikasi judul di halaman detail
      cy.contains("h1", "Detail Hasil Kompetensi").should("be.visible");
    });
  });
});
