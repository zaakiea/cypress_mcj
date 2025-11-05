// cypress/e2e/admin/form.cy.ts
// cypress/e2e/admin/form.cy.ts

describe("Manajemen Formulir Karyawan", () => {
  // Sesuai instruksi Anda, beforeEach ini tidak diubah.
  beforeEach(() => {
    // 1. Kunjungi halaman login
    cy.visit("/login");

    // 2. Ambil data login admin
    const adminId = Cypress.env("TEST_ADMIN_ID");
    const adminPassword = Cypress.env("TEST_ADMIN_PASSWORD");

    cy.get('input[id="employeeId"]').type(adminId);
    cy.get('input[id="password"]').type(adminPassword);
    cy.get('button[type="submit"]').click();

    // 4. Pastikan sudah di dashboard admin
    cy.url({ timeout: 10000 }).should("include", "/admin");
    cy.contains("h1", "Dashboard Admin").should("be.visible");

    // 5. Navigasi ke halaman Manajemen Formulir
    cy.get('a[href="/admin/forms"]').click();

    // 6. Pastikan halaman selesai loading
    cy.contains("h1", "Manajemen Formulir Karyawan").should("be.visible");
  });

  // --- GRUP 1: Validasi Tampilan Awal ---
  describe("Validasi Tampilan (Display)", () => {
    it("harus menampilkan sidebar dengan link 'Form' yang aktif", () => {
      cy.get('a[href="/admin/forms"]')
        .should("be.visible")
        .and("have.class", "bg-blue-100"); // Link aktif

      cy.get('a[href="/admin/positions"]')
        .should("be.visible")
        .and("not.have.class", "bg-blue-100"); // Link tidak aktif
    });

    it("harus menampilkan semua kontrol tabel (Search, Filter, Show)", () => {
      cy.contains("Show").next().should("contain", "10");
      cy.get('input[placeholder="Search..."]').should("be.visible");
      cy.contains("button", "Filter").should("be.visible");
    });

    it("harus menampilkan header tabel dan data baris pertama", () => {
      cy.get("table th").contains("ID Karyawan").should("be.visible");
      cy.get("table th").contains("Nama Lengkap").should("be.visible");
      cy.get("table th").contains("Departemen").should("be.visible");
      cy.get("table th").contains("Cabang").should("be.visible");
      cy.get("table th").contains("Status").should("be.visible");
      cy.get("table th").contains("Aksi").should("be.visible");
    });

    it("harus menampilkan info paginasi yang benar (sesuai HTML)", () => {
      // Data di HTML Anda hanya 2, jadi paginasi dinonaktifkan
      cy.contains("Showing 1 to 2 of 2 entries").should("be.visible");
      cy.get("button").contains("2").should("not.exist");
      cy.get("button svg.lucide-chevrons-right").parent().should("be.disabled");
    });
  });

  // --- GRUP 2: Validasi Fungsionalitas Tabel ---
  describe("Validasi Fungsionalitas (Interactions)", () => {
    it("harus bisa memfilter tabel menggunakan [Search]", () => {
      // 1. Cari data spesifik (Test Employee 2)
      cy.get('input[placeholder="Search..."]').type("Test Employee 2");
      cy.wait(1000); // Tunggu debounce (750ms)

      // 2. Pastikan hanya data yang dicari yang muncul
      cy.get("table tbody tr").should("have.length", 1);
      cy.get("table tbody tr").first().should("contain", "918990");

      // 3. Pastikan data lain hilang
      cy.contains("112233").should("not.exist");

      // 4. Cari data yang tidak ada
      cy.get('input[placeholder="Search..."]').clear();
      cy.wait(1000);
      cy.get('input[placeholder="Search..."]').type("Karyawan Fiktif");
      cy.wait(1000);
      cy.contains("No results found.").should("be.visible");
    });

    it("harus bisa memfilter tabel menggunakan [Filter Cabang dan Departemen]", () => {
      // 1. Buka popover filter
      cy.contains("button", "Filter").click();

      // 2. Dialog popover harus muncul. Gunakan .within() untuk membatasi scope.
      cy.get('div[role="dialog"]').within(() => {
        // Asersi judul di dalam dialog
        cy.contains("h4", "Filter Data").should("be.visible");

        // 3. Terapkan filter [Cabang]
        // Cari label, lalu .next() untuk combobox
        // Perintah .contains() ini sekarang aman karena di dalam .within()
        cy.contains("label", "Cabang").next('button[role="combobox"]').click();
      }); // <-- Keluar dari .within() sementara untuk mencari <div role="option">

      // 4. Pilih opsi (Head Office) - Opsi ini muncul di root <body>, BUKAN di dalam dialog
      cy.get('div[role="option"]').contains("ICBP-Noodle Head Office").click();

      // 5. Terapkan filter [Departemen]
      cy.get('div[role="dialog"]').within(() => {
        // Masuk lagi ke .within()
        cy.contains("label", "Departemen")
          .next('button[role="combobox"]')
          .click();
      }); // <-- Keluar dari .within() lagi

      // 6. Pilih (ADM HR)
      cy.get('div[role="option"]').contains("ADM HR").click();

      // 7. Klik Terapkan
      cy.get('div[role="dialog"]').within(() => {
        // Masuk lagi ke .within()
        cy.contains("button", "Terapkan Filter").click();
      });

      cy.wait(500); // Tunggu data reload

      // 8. Verifikasi semua data di tabel adalah "ADM HR" DAN "Head Office"
      cy.get("table tbody tr").each(($row) => {
        cy.wrap($row).find("td").eq(2).should("contain", "ADM HR"); // Kolom Departemen
        cy.wrap($row).find("td").eq(3).should("contain", "Head Office"); // Kolom Cabang
      });

      // 9. Tombol filter harus terlihat aktif
      cy.contains("button", "Filter").should("have.class", "bg-primary");

      // 8. Reset filter
      cy.contains("button", "Filter").click();
      cy.get('div[role="dialog"]').contains("button", "Reset").click();
      cy.wait(500);

      // --- PERBAIKAN ---
      // Verifikasi bahwa tombol kembali ke status tidak aktif (tidak punya "bg-primary")
      cy.contains("button", "Filter").should("not.have.class", "bg-primary");
      // Anda juga bisa cek apakah ia kembali ke variant "outline"
      cy.contains("button", "Filter").should("have.class", "border");
    });

    it("harus bisa mengubah jumlah [Show entries] per halaman", () => {
      // Catatan: Tes ini hanya memvalidasi UI, karena data < 10
      cy.contains("Show")
        .next('button[role="combobox"]')
        .should("contain", "10");
      cy.get("table tbody tr").should("have.length", 2);

      // Buka dropdown
      cy.contains("Show").next('button[role="combobox"]').click();

      // Klik opsi "25"
      cy.get('div[role="option"]').contains("25").click();
      cy.wait(1000); // Tunggu data reload

      // Verifikasi nilai berubah ke 25, tapi data tetap 2
      cy.contains("Show")
        .next('button[role="combobox"]')
        .should("contain", "25");
      cy.get("table tbody tr").should("have.length", 2);
      cy.contains("Showing 1 to 2 of 2 entries").should("be.visible");
    });

    it("harus bisa mengganti urutan [Sorting] kolom 'Nama Lengkap'", () => {
      // Tes ini memvalidasi siklus 3-state (unsorted -> asc -> desc -> unsorted)
      cy.get("table th").contains("Nama Lengkap").as("headerNama");

      // Simpan data awal
      const firstRowText = "Test Employee"; // ID 112233
      const secondRowText = "Test Employee 2"; // ID 918990
      cy.get("table tbody tr:first-child td:nth-child(2)").should(
        "contain",
        firstRowText
      );

      // 1. Awalnya Unsorted (chevrons)
      cy.get("@headerNama")
        .find("svg.lucide-chevrons-up-down")
        .should("be.visible");

      // 2. Klik untuk sort Ascending (A-Z)
      cy.get("@headerNama").click();
      cy.wait(1000);
      cy.get("@headerNama").find("svg.lucide-arrow-up").should("be.visible");
      // Data tetap sama (Test Employee < Test Employee 2)
      cy.get("table tbody tr:first-child td:nth-child(2)").should(
        "contain",
        firstRowText
      );

      // 3. Klik untuk sort Descending (Z-A)
      cy.get("@headerNama").click();
      cy.wait(1000);
      cy.get("@headerNama").find("svg.lucide-arrow-down").should("be.visible");
      // Data harus berbalik
      cy.get("table tbody tr:first-child td:nth-child(2)").should(
        "contain",
        secondRowText
      );

      // 4. Klik lagi untuk Unsorted
      cy.get("@headerNama").click();
      cy.wait(1000);
      cy.get("@headerNama")
        .find("svg.lucide-chevrons-up-down")
        .should("be.visible");
      // Data kembali ke urutan default (by ID Karyawan)
      cy.get("table tbody tr:first-child td:nth-child(2)").should(
        "contain",
        firstRowText
      );
    });

    it("harus membuka modal [View Form] untuk Karyawan 1 (112233)", () => {
      const employeeId = "112233";
      const employeeName = "Test Employee";

      // 1. Cari baris berdasarkan ID, lalu klik tombol Aksi (mata)
      cy.contains("td", employeeId)
        .parent("tr")
        .find("button.hover\\:text-primary") // Selector untuk tombol 'lucide-eye'
        .click();

      // 2. Verifikasi modal (dialog) muncul
      cy.get('div[role="dialog"]').should("be.visible");

      // 3. Gunakan .within() untuk memvalidasi konten di dalam modal
      cy.get('div[role="dialog"]').within(() => {
        // a. Verifikasi judul popup dan ID Karyawan (SESUAI PERMINTAAN ANDA)
        cy.contains("h2", `Detail Formulir: ${employeeName}`).should(
          "be.visible"
        );
        cy.contains("p", `ID Karyawan: ${employeeId}`).should("be.visible");

        // b. Verifikasi data spesifik untuk karyawan ini (sesuai HTML)

        cy.contains("h3", "Preferensi Karir").scrollIntoView();
        cy.contains("h3", "Preferensi Karir").should("be.visible");
      });

      // 4. Tutup modal dengan mengklik tombol 'X'
      cy.get('button[data-slot="dialog-close"]').click();
      cy.get('div[role="dialog"]').should("not.exist");
    });

    it("harus membuka modal [View Form] untuk Karyawan 2 (918990)", () => {
      const employeeId = "918990";
      const employeeName = "Test Employee 2";

      // 1. Cari baris berdasarkan ID, lalu klik tombol Aksi (mata)
      cy.contains("td", employeeId)
        .parent("tr")
        .find("button.hover\\:text-primary") // Selector untuk tombol 'lucide-eye'
        .click();

      // 2. Verifikasi modal (dialog) muncul
      cy.get('div[role="dialog"]').should("be.visible");

      // 3. Gunakan .within() untuk memvalidasi konten di dalam modal
      cy.get('div[role="dialog"]').within(() => {
        // a. Verifikasi judul popup dan ID Karyawan (DINAMIS)
        cy.contains("h2", `Detail Formulir: ${employeeName}`).should(
          "be.visible"
        );
        cy.contains("p", `ID Karyawan: ${employeeId}`).should("be.visible");
        cy.contains("h3", "Preferensi Karir").scrollIntoView();
        cy.contains("h3", "Preferensi Karir").should("be.visible");
        // b. (Opsional) Kita bisa tambahkan cek data, tapi untuk
        //    tes ini, validasi judul dan ID sudah cukup.
      });

      // 4. Tutup modal dengan mengklik tombol 'X'
      cy.get('button[data-slot="dialog-close"]').click();
      cy.get('div[role="dialog"]').should("not.exist");
    });
  });
});
