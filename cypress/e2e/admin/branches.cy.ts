// cypress/e2e/admin/branches.cy.ts

describe("Manajemen Cabang (Admin)", () => {
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
    cy.url({ timeout: 10000 }).should("include", "/admin");
    cy.contains("h1", "Dashboard Admin").should("be.visible");

    // 5. Navigasi ke halaman Manajemen Cabang
    cy.get('a[href="/admin/branches"]').click();

    // 6. Pastikan halaman selesai loading
    cy.contains("h1", "Manajemen Cabang").should("be.visible");
  });

  // --- GRUP 1: Tes untuk memvalidasi semua elemen ADA di halaman ---
  describe("Validasi Tampilan (Display)", () => {
    it("harus menampilkan sidebar dengan link 'Branches' yang aktif", () => {
      // Memastikan link "Branches" aktif
      cy.get('a[href="/admin/branches"]')
        .should("be.visible")
        .and("have.class", "bg-blue-100"); // Class untuk link aktif

      // Memastikan link lain tidak aktif
      cy.get('a[href="/admin/employees"]')
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
      cy.get("table th").contains("ID Cabang").should("be.visible");
      cy.get("table th").contains("Nama Cabang").should("be.visible");
      cy.get("table th").contains("Lokasi").should("be.visible");
    });

    it("harus menampilkan data di tabel dan info paginasi", () => {
      // Cek data baris pertama
      cy.get("table tbody tr")
        .first()
        .should("contain", "N001")
        .and("contain", "ICBP-Noodle Head Office");

      // Cek data baris terakhir di halaman 1
      cy.get("table tbody tr")
        .last()
        .should("contain", "P001")
        .and("contain", "ICBP-Noodle Pekanbaru");

      // Cek info paginasi
      cy.contains("Showing 1 to 10 of 18 entries").should("be.visible");

      // Cek tombol paginasi
      cy.get("button").contains("1").should("be.visible");
      cy.get("button").contains("2").should("be.visible");
    });
  });

  // --- GRUP 2: Tes untuk memvalidasi FUNGSI (klik, navigasi, dll) ---
  describe("Validasi Fungsionalitas (Interactions)", () => {
    // Ini adalah tes yang sudah Anda miliki
    it("harus bisa memfilter tabel menggunakan pencarian [Nama Cabang]", () => {
      // 1. Cari data yang unik
      cy.get('input[placeholder="Search..."]').type("Tangerang");

      // 2. Pastikan hanya data yang dicari yang muncul
      cy.get("table tbody tr").should("have.length", 1);
      cy.contains("ICBP-Noodle Tangerang").should("be.visible");

      // 3. Pastikan data lain hilang
      cy.contains("ICBP-Noodle Head Office").should("not.exist");

      // 4. Hapus pencarian
      cy.get('input[placeholder="Search..."]').clear();

      // 5. Pastikan data kembali seperti semula
      cy.get("table tbody tr").should("have.length", 10);
      cy.contains("ICBP-Noodle Head Office").should("be.visible");
    });

    it("harus menampilkan 'No results found' jika pencarian tidak ditemukan", () => {
      // 1. Cari data yang tidak ada
      cy.get('input[placeholder="Search..."]').type("Data Tidak Ditemukan");

      // 2. Pastikan tabel kosong dan pesan muncul
      // (Berdasarkan komponen DataTable.tsx Anda)
      cy.get("table tbody tr").should("have.length", 1);
      cy.contains("No results found.").should("be.visible");

      // 3. Pastikan data lain hilang
      cy.contains("ICBP-Noodle Head Office").should("not.exist");
    });

    it("harus bisa memfilter dengan partial text dan case insensitive", () => {
      // 1. Cari dengan huruf kecil (case-insensitive)
      cy.get('input[placeholder="Search..."]').type("semarang");

      // 2. Pastikan data ditemukan
      cy.get("table tbody tr").should("have.length", 1);
      cy.contains("ICBP-Noodle Semarang").should("be.visible");

      // 3. Hapus pencarian
      cy.get('input[placeholder="Search..."]').clear();

      // 4. Cari dengan partial text
      cy.get('input[placeholder="Search..."]').type("Noodle");

      // 5. Pastikan semua 10 hasil di halaman itu muncul (karena semua mengandung "Noodle")
      cy.get("table tbody tr").should("have.length", 10);
    });

    it("harus bisa berpindah halaman menggunakan paginasi", () => {
      // 1. Cek data di halaman 1
      cy.contains("ICBP-Noodle Head Office").should("be.visible");
      const paginationText = "Showing 1 to 10 of 18 entries";
      cy.contains(paginationText).should("be.visible");

      // 2. Klik halaman 2
      // PERBAIKAN: Cari tombol "2" di sebelah teks paginasi
      cy.contains(paginationText)
        .next() // Pindah ke div pembungkus paginasi
        .find("button") // Cari tombol di dalamnya
        .contains("2") // Cari yang teksnya "2"
        .click();

      // 3. Pastikan data halaman 1 hilang
      cy.contains("ICBP-Noodle Head Office").should("not.exist");

      // 4. Pastikan info paginasi terupdate
      const newPaginationText = "Showing 11 to 18 of 18 entries";
      cy.contains(newPaginationText).should("be.visible");

      // 5. Klik halaman 1 (kembali)
      // PERBAIKAN: Cari tombol "1" di sebelah teks paginasi
      cy.contains(newPaginationText)
        .next() // Pindah ke div pembungkus paginasi
        .find("button") // Cari tombol di dalamnya
        .contains("1") // Cari yang teksnya "1"
        .click();

      // 6. Pastikan data halaman 1 muncul kembali
      cy.contains("ICBP-Noodle Head Office").should("be.visible");
      cy.contains(paginationText).should("be.visible");
    });

    it("harus bisa berpindah ke halaman terakhir", () => {
      // 1. Klik tombol "last page" (panah kanan double)
      cy.get("button svg.lucide-chevrons-right").parent().click();

      // 2. Pastikan data halaman 1 hilang
      cy.contains("ICBP-Noodle Head Office").should("not.exist");

      // 3. Pastikan info paginasi terupdate
      cy.contains("Showing 11 to 18 of 18 entries").should("be.visible");

      // 4. Klik tombol "first page" (panah kiri double)
      cy.get("button svg.lucide-chevrons-left").parent().click();

      // 5. Pastikan data halaman 1 muncul kembali
      cy.contains("ICBP-Noodle Head Office").should("be.visible");
    });
  });
});
