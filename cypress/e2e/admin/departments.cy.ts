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
  // --- GRUP 1: Validasi Tampilan Awal ---
  describe("Validasi Tampilan (Display)", () => {
    it("harus menampilkan sidebar dengan link 'Departments' yang aktif", () => {
      cy.get('a[href="/admin/departments"]')
        .should("be.visible")
        .and("have.class", "bg-blue-100"); // Link aktif

      cy.get('a[href="/admin/positions"]')
        .should("be.visible")
        .and("not.have.class", "bg-blue-100"); // Link tidak aktif
    });

    it("harus menampilkan semua kontrol tabel (Search, Filter)", () => {
      cy.contains("Show").next().should("contain", "10");
      cy.get('input[placeholder="Search..."]').should("be.visible");
      cy.contains("button", "Filter").should("be.visible");
    });

    it("harus menampilkan header tabel dan data baris pertama", () => {
      cy.get("table th").contains("Nama Departemen").should("be.visible");
      cy.get("table th").contains("Cabang").should("be.visible");

      // Validasi data baris pertama (sesuai screenshot)
      const firstRow = cy.get("table tbody tr").first();
      firstRow.should("contain", "ADM Fin.& Acct.");
      firstRow.should("contain", "ICBP-Noodle Head Office");
    });

    it("harus menampilkan info paginasi yang benar", () => {
      // Sesuai screenshot
      cy.contains("Showing 1 to 10 of 234 entries").should("be.visible");
      cy.get("button").contains("2").should("be.visible");
      cy.get("button").contains("3").should("be.visible");
    });
  });

  // --- GRUP 2: Validasi Fungsionalitas Tabel ---
  describe("Validasi Fungsionalitas (Interactions)", () => {
    it("harus bisa memfilter tabel menggunakan [Search]", () => {
      // 1. Cari data spesifik (case-insensitive)
      cy.get('input[placeholder="Search..."]').type("adm fin");

      cy.wait(1000); // Tunggu 1 detik agar aman

      // 2. Pastikan hanya data yang dicari yang muncul
      // Sekarang .each() akan berjalan pada tabel yang SUDAH di-filter
      cy.get("table tbody tr").each(($row) => {
        cy.wrap($row).find("td").first().should("contain", "ADM Fin.");
      });

      // 3. Cari data yang tidak ada
      // --- PERBAIKAN: Pisahkan .clear() dan .type() DAN tambahkan wait() ---

      // Ambil input, bersihkan, dan tunggu render ulang
      cy.get('input[placeholder="Search..."]').clear();
      cy.wait(1000); // Tunggu debounce setelah clear

      // Ambil input LAGI (elemen yang baru), lalu ketik
      cy.get('input[placeholder="Search..."]').type("Departemen Fiktif");
      cy.wait(1000); // Tunggu debounce setelah type

      cy.contains("No results found.").should("be.visible");
    });

    it("harus bisa memfilter tabel menggunakan [Filter Cabang]", () => {
      // 1. Buka popover filter
      cy.contains("button", "Filter").click();

      // 2. Dialog popover harus muncul. Gunakan .within()
      cy.get('div[role="dialog"]').within(() => {
        cy.contains("h4", "Filter Data").should("be.visible");

        // 3. Terapkan filter [Cabang]
        cy.contains("label", "Cabang").next('button[role="combobox"]').click();
      });

      // 4. Pilih opsi (Head Office) - Opsi ini muncul di root <body>
      cy.get('div[role="option"]').contains("ICBP-Noodle Head Office").click();

      // 5. Klik Terapkan
      cy.get('div[role="dialog"]').within(() => {
        cy.contains("button", "Terapkan Filter").click();
      });

      cy.wait(500); // Tunggu data reload

      // 6. Verifikasi semua data di tabel adalah "Head Office"
      cy.get("table tbody tr").each(($row) => {
        cy.wrap($row).find("td").eq(1).should("contain", "Head Office");
      });

      // 7. Tombol filter harus terlihat aktif (bg-primary)
      cy.contains("button", "Filter").should("have.class", "bg-primary");
    });

    it("harus bisa mengubah jumlah [Show entries] per halaman", () => {
      // 1. Verifikasi nilai default adalah 10 dan 10 baris
      cy.contains("Show")
        .next('button[role="combobox"]')
        .should("contain", "10");
      cy.get("table tbody tr").should("have.length", 10);
      cy.contains("Showing 1 to 10 of 234 entries").should("be.visible");

      // 2. Buka dropdown
      cy.contains("Show").next('button[role="combobox"]').click();

      // 3. Klik opsi "25" (ini ada di luar tombol)
      cy.get('div[role="option"]').contains("25").click();
      cy.wait(1000); // Tunggu data reload

      // 4. Verifikasi nilai berubah ke 25 dan 25 baris
      cy.contains("Show")
        .next('button[role="combobox"]')
        .should("contain", "25");
      cy.get("table tbody tr").should("have.length", 25);
      cy.contains("Showing 1 to 25 of 234 entries")
        .scrollIntoView()
        .should("be.visible");

      // 5. Buka dropdown lagi
      cy.contains("Show").next('button[role="combobox"]').click();

      // 6. Klik opsi "50"
      cy.get('div[role="option"]').contains("50").click();
      cy.wait(1000); // Tunggu data reload

      // 7. Verifikasi nilai berubah ke 50 dan 50 baris
      cy.contains("Show")
        .next('button[role="combobox"]')
        .should("contain", "50");
      cy.get("table tbody tr").should("have.length", 50);
      cy.contains("Showing 1 to 50 of 234 entries")
        .scrollIntoView()
        .should("be.visible");
    });

    it("harus bisa mengganti urutan [Sorting] kolom 'Nama Departemen' dan tabel berubah", () => {
      cy.get("table th").contains("Nama Departemen").as("headerNama");

      // 1. Awalnya sorted ascending (panah atas)
      cy.get("@headerNama").find("svg.lucide-arrow-up").should("be.visible");

      // 2. Klik untuk meng-unsort
      cy.get("@headerNama").click();
      cy.wait(1000); // Tunggu render ulang

      // 3. Verifikasi tidak ada panah (status unsorted)
      cy.get("@headerNama").find("svg.lucide-arrow-up").should("not.exist");
      cy.get("@headerNama").find("svg.lucide-arrow-down").should("not.exist");

      // 4. Klik lagi untuk sort ascending
      cy.get("@headerNama").click();
      cy.wait(1000); // Tunggu render ulang

      // 5. Verifikasi panah atas (asc) muncul kembali
      cy.get("@headerNama").find("svg.lucide-arrow-up").should("be.visible");
    });
    it("harus bisa mengganti urutan [Sorting] kolom 'Cabang' dan memverifikasi data", () => {
      // INI ADALAH TES SORTING YANG LEBIH BAIK KARENA DATANYA BERBEDA

      cy.get("table th").contains("Cabang").as("headerCabang");

      // 1. Simpan data baris pertama (saat unsorted)
      cy.get("table tbody tr:first-child td:nth-child(2)")
        .invoke("text")
        .as("barisPertamaAwal"); // Teksnya "ICBP-Noodle Head Office"

      // 2. Verifikasi state awal (Unsorted)
      cy.get("@headerCabang")
        .find("svg.lucide-chevrons-up-down")
        .should("be.visible");

      // 3. Klik untuk sort ascending (A-Z)
      cy.get("@headerCabang").click();
      cy.wait(1000); // Tunggu data di-fetch ulang

      // 4. Verifikasi ikon (panah atas) dan data berubah
      cy.get("@headerCabang").find("svg.lucide-arrow-up").should("be.visible");
      cy.get("table tbody tr:first-child td:nth-child(2)")
        .invoke("text")
        .should("not.eq", "ICBP-Noodle Head Office"); // Pastikan data berubah
      cy.get("table tbody tr:first-child td:nth-child(2)").should(
        "contain",
        "Bandung"
      ); // "Bandung" harusnya jadi yang pertama

      // 5. Klik untuk sort descending (Z-A)
      cy.get("@headerCabang").click();
      cy.wait(1000);

      // 6. Verifikasi ikon (panah bawah) dan data berubah
      cy.get("@headerCabang")
        .find("svg.lucide-arrow-down")
        .should("be.visible");
      cy.get("table tbody tr:first-child td:nth-child(2)").should(
        "contain",
        "Tj. Api Api"
      );
    });
    it("harus bisa berpindah halaman menggunakan [Paginasi]", function () {
      const paginationText = "Showing 1 to 10 of 234 entries";
      cy.contains(paginationText).should("be.visible");

      // 1. Klik halaman 2
      cy.contains(paginationText)
        .next() // Pindah ke div pembungkus paginasi
        .find("button")
        .contains("2")
        .click();

      // 2. Cek teks paginasi baru
      cy.contains("Showing 11 to 20 of 234 entries").should("be.visible");
      // Pastikan data baris pertama BUKAN lagi "Head Office"
      cy.get("table tbody tr").first().should("not.contain", "Head Office");

      // 3. Klik halaman terakhir (234 entries / 10 = 24 pages)
      cy.get("button svg.lucide-chevrons-right").parent().click();
      cy.contains("Showing 231 to 234 of 234 entries").should("be.visible");

      // 4. Klik halaman pertama
      cy.get("button svg.lucide-chevrons-left").parent().click();
      cy.contains(paginationText).should("be.visible");
      cy.get("table tbody tr").first().should("contain", "Head Office");
    });
  });
});
