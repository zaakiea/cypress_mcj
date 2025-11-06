// cypress/e2e/admin/career-path.cy.ts

describe("Manajemen Jenjang Karier", () => {
  // Variabel untuk menyimpan data unik yang akan di-tes
  // Kita gunakan data yang sudah ada sebagai referensi untuk combobox
  const testData = {
    fromPosition: "Area Sales & Promotion Repr",
    toPosition: "Whs RM Section Spv",
    type: "CROSS",
    newType: "ALIGN", // Untuk skenario edit
  };

  beforeEach(() => {
    // 1. Login sebagai admin
    cy.visit("/login");
    cy.get('input[id="employeeId"]').type(Cypress.env("TEST_ADMIN_ID"));
    cy.get('input[id="password"]').type(Cypress.env("TEST_ADMIN_PASSWORD"));
    cy.get('button[type="submit"]').click();
    cy.url().should("include", "/admin"); // 2. Navigasi ke halaman Jenjang Karier

    cy.visit("/admin/career-path"); // 3. Pastikan halaman selesai loading

    cy.contains("h1", "Manajemen Jenjang Karier").should("be.visible");
    cy.get("table").should("be.visible");
    cy.contains("Showing 1 to 10").should("be.visible");
  }); // --- GRUP 1: Tes untuk memvalidasi semua elemen ADA di halaman ---

  describe("Validasi Tampilan (Display)", () => {
    it("harus menampilkan semua elemen UI utama", () => {
      // Judul
      cy.contains("h1", "Manajemen Jenjang Karier").should("be.visible"); // Kontrol Atas

      cy.contains("Show").should("be.visible");
      cy.get('input[placeholder="Search..."]').should("be.visible");
      cy.contains("button", "Filter").should("be.visible");
      cy.contains("button", "Buat Jenjang Karier").should("be.visible"); // Tabel

      cy.get("table").should("be.visible");
      cy.get("th").contains("Tipe").should("be.visible");
      cy.get("th").contains("Karir Asal").should("be.visible");
      cy.get("th").contains("Karir Tujuan").should("be.visible");
      cy.get("th").contains("Aksi").should("be.visible"); // Paginasi

      cy.contains("Showing 1 to 10 of 540 entries").should("be.visible");
    });
  }); // --- GRUP 2: Tes untuk fungsionalitas interaktif ---

  describe("Validasi Fungsionalitas (Interactions)", () => {
    it("harus bisa berpindah halaman menggunakan [Paginasi]", () => {
      // (Data dari HTML Jenjang Karier: 540 entries)
      const initialPaginationText = "Showing 1 to 10 of 540 entries";
      const lastPage = 54;
      const lastPageStartEntry = 531; // (54-1)*10 + 1 // 1. Verifikasi status awal (Halaman 1)

      cy.log("State 1: Verifikasi Halaman 1");
      cy.contains(initialPaginationText).should("be.visible");
      cy.contains("button", /^1$/).should("have.class", "bg-primary");
      cy.get("button svg.lucide-chevrons-left").parent().should("be.disabled"); // 2. Klik halaman 2

      cy.log("State 2: Klik Halaman 2");
      cy.contains("button", /^2$/).click();
      cy.wait(500); // Tunggu data reload // 3. Verifikasi status Halaman 2

      cy.log("State 3: Verifikasi Halaman 2");
      cy.contains("Showing 11 to 20 of 540 entries").should("be.visible");
      cy.contains("button", /^2$/).should("have.class", "bg-primary");
      cy.contains("button", /^1$/).should("not.have.class", "bg-primary");
      cy.get("button svg.lucide-chevrons-left")
        .parent()
        .should("not.be.disabled"); // 4. Klik halaman terakhir (Tombol >>)

      cy.log("State 4: Klik Halaman Terakhir (>>)");
      cy.get("button svg.lucide-chevrons-right").parent().click();
      cy.wait(1000); // Tunggu data reload // 5. Verifikasi Halaman Terakhir (Halaman 54 untuk 540 data)

      cy.log(`State 5: Verifikasi Halaman Terakhir (Halaman ${lastPage})`);
      cy.contains(`Showing ${lastPageStartEntry} to 540 of 540 entries`).should(
        "be.visible"
      );
      cy.get("button svg.lucide-chevrons-right").parent().should("be.disabled");
      cy.get("button svg.lucide-chevrons-left")
        .parent()
        .should("not.be.disabled"); // 6. Klik halaman pertama (Tombol <<)

      cy.log("State 6: Klik Halaman Pertama (<<)");
      cy.get("button svg.lucide-chevrons-left").parent().click();
      cy.wait(1000); // Tunggu data reload // 7. Verifikasi kembali ke Halaman 1

      cy.log("State 7: Verifikasi kembali ke Halaman 1");
      cy.contains(initialPaginationText).should("be.visible");
      cy.contains("button", /^1$/).should("have.class", "bg-primary");
      cy.get("button svg.lucide-chevrons-left").parent().should("be.disabled");
    });
    it("harus bisa mengubah jumlah [Show entries] per halaman", () => {
      // 1. Verifikasi nilai default adalah 10 dan 10 baris
      cy.contains("Show")
        .next('button[role="combobox"]')
        .as("selectShow") // Gunakan alias
        .should("contain", "10");

      cy.get("table tbody tr").should("have.length", 10); // Verifikasi total entri dari HTML Career Path
      cy.contains("Showing 1 to 10 of 540 entries").should("be.visible"); // 2. Buka dropdown

      cy.get("@selectShow").click(); // 3. Klik opsi "25" (Selector dari employees.cy.ts example)

      cy.get('div[role="option"]').contains("25").click();
      cy.wait(1000); // Tunggu data reload // 4. Verifikasi nilai berubah ke 25 dan 25 baris

      cy.get("@selectShow").should("contain", "25");
      cy.get("table tbody tr").should("have.length", 25); // Verifikasi info paginasi diperbarui
      cy.contains("Showing 1 to 25 of 540 entries")
        .scrollIntoView()
        .should("be.visible"); // 5. Buka dropdown lagi

      cy.get("@selectShow").click(); // 6. Klik opsi "50"

      cy.get('div[role="option"]').contains("50").click();
      cy.wait(1000); // Tunggu data reload // 7. Verifikasi nilai berubah ke 50 dan 50 baris

      cy.get("@selectShow").should("contain", "50");
      cy.get("table tbody tr").should("have.length", 50); // Verifikasi info paginasi diperbarui
      cy.contains("Showing 1 to 50 of 540 entries")
        .scrollIntoView()
        .should("be.visible");
    });
    it("harus bisa memfilter tabel menggunakan Search", () => {
      // --- Definisikan semua search terms ---
      const searchTerm1 = "Gas Spv";
      const searchTerm2 = "IR Staff";
      const searchTerm3 = "Branch HR";
      const searchTerm4 = "ABC_123_XYZ_TIDAK_MUNGKIN_ADA";

      const searchInput = cy.get('input[placeholder="Search..."]');

      // --- Skenario 1: Tes searchTerm1 ---
      cy.log(`Mencari: ${searchTerm1}`);
      const searchTermRegex1 = new RegExp(searchTerm1, "i");
      searchInput.clear().type(searchTerm1);
      cy.wait(500); // Tunggu re-render/debounce

      // Guard Assertion: Tunggu baris pertama muncul & cocok (case-insensitive)
      cy.get('tbody[data-slot="table-body"] > tr[data-slot="table-row"]')
        .first()
        .invoke("text") // Ambil teks dari baris
        .should("match", searchTermRegex1); // Verifikasi dengan regex

      // Verifikasi semua baris yang tersisa (case-insensitive)
      cy.get('tbody[data-slot="table-body"] > tr[data-slot="table-row"]').each(
        ($row) => {
          cy.wrap($row).invoke("text").should("match", searchTermRegex1);
        }
      );

      // --- Skenario 2: Tes searchTerm2 ---
      cy.log(`Mencari: ${searchTerm2}`);
      const searchTermRegex2 = new RegExp(searchTerm2, "i");
      searchInput.clear().type(searchTerm2);
      cy.wait(500);

      // Verifikasi baris pertama
      cy.get('tbody[data-slot="table-body"] > tr[data-slot="table-row"]')
        .first()
        .invoke("text")
        .should("match", searchTermRegex2);

      // Verifikasi semua baris
      cy.get('tbody[data-slot="table-body"] > tr[data-slot="table-row"]').each(
        ($row) => {
          cy.wrap($row).invoke("text").should("match", searchTermRegex2);
        }
      );

      // --- Skenario 3: Tes searchTerm3 ---
      cy.log(`Mencari: ${searchTerm3}`);
      const searchTermRegex3 = new RegExp(searchTerm3, "i");
      searchInput.clear().type(searchTerm3);
      cy.wait(500);

      // Verifikasi baris pertama
      cy.get('tbody[data-slot="table-body"] > tr[data-slot="table-row"]')
        .first()
        .invoke("text")
        .should("match", searchTermRegex3);

      // Verifikasi semua baris
      cy.get('tbody[data-slot="table-body"] > tr[data-slot="table-row"]').each(
        ($row) => {
          cy.wrap($row).invoke("text").should("match", searchTermRegex3);
        }
      );

      // --- Skenario 4: Tes searchTerm4 (Data Tidak Ditemukan) ---
      cy.log(`Mencari: ${searchTerm4}`);
      searchInput.clear().type(searchTerm4);
      cy.wait(500);

      // Verifikasi pesan "No results found" (sesuai tes sebelumnya di file)
      cy.contains("No results found.").should("be.visible");

      // --- Skenario 5: Bersihkan filter ---
      cy.log("Membersihkan filter");
      searchInput.clear();
      cy.wait(500);

      // Pastikan data kembali seperti semula (lebih dari 1 baris)
      cy.get(
        'tbody[data-slot="table-body"] > tr[data-slot="table-row"]'
      ).should("have.length.gt", 1);
    });
  });
});
