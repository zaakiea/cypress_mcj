// cypress/e2e/admin/user-management.cy.ts
describe("Manajemen Pengguna (Admin)", () => {
  beforeEach(() => {
    cy.visit("/login");

    const adminId = Cypress.env("TEST_ADMIN_ID");
    const adminPassword = Cypress.env("TEST_ADMIN_PASSWORD");

    cy.get('input[id="employeeId"]').type(adminId);
    cy.get('input[id="password"]').type(adminPassword);
    cy.get('button[type="submit"]').click();

    cy.url({ timeout: 10000 }).should("include", "/admin");
    cy.contains("h1", "Dashboard Admin").should("be.visible");

    cy.get('a[href="/admin/users"]').click();

    cy.contains("h1", "Manajemen Pengguna").should("be.visible");
  });

  describe("Validasi Tampilan (Display)", () => {
    it("harus menampilkan sidebar dengan link 'User Management' yang aktif", () => {
      // Memastikan link "User Management" aktif
      cy.get('a[href="/admin/users"]')
        .should("be.visible")
        .and("have.class", "bg-blue-100"); // Link aktif

      // Memastikan link lain tidak aktif
      cy.get('a[href="/admin/employees"]')
        .should("be.visible")
        .and("not.have.class", "bg-blue-100"); // Link tidak aktif
    });

    it("harus menampilkan kontrol tabel (Search, Show)", () => {
      // Kontrol yang ADA
      cy.contains("Show").next().should("contain", "10");
      cy.get('input[placeholder="Search..."]').should("be.visible");
    });

    it("harus menampilkan header tabel dengan benar", () => {
      cy.get("table th").contains("ID Karyawan").should("be.visible");
      cy.get("table th").contains("Nama").should("be.visible");
      cy.get("table th").contains("Peran").should("be.visible");
      cy.get("table th").contains("Level").should("be.visible");
      cy.get("table th").contains("Cabang").should("be.visible");
      cy.get("table th").contains("Aksi").should("be.visible");
    });
  });

  // --- GRUP 2: Validasi Fungsionalitas Tabel ---
  describe("Validasi Fungsionalitas (Interactions)", () => {
    it("harus bisa memfilter tabel menggunakan [Search]", () => {
      // 1. Cari data unik (case-insensitive)
      cy.get('input[placeholder="Search..."]').type("hr cabang head office");
      cy.wait(1000); // Tunggu debounce (750ms)

      // 2. Pastikan hanya data yang dicari yang muncul
      cy.get("table tbody tr").should("have.length", 1);
      cy.get("table tbody tr")
        .first()
        .should("contain", "HR001HO")
        .and("contain", "HR_BRANCH");

      // 3. Pastikan data lain hilang
      cy.contains("Test Admin").should("not.exist");

      // 4. Cari data yang tidak ada
      cy.get('input[placeholder="Search..."]').clear();
      cy.wait(1000); // Tunggu debounce setelah clear

      cy.get('input[placeholder="Search..."]').type("Pengguna Fiktif");
      cy.wait(1000); // Tunggu debounce setelah type

      cy.contains("No results found.").should("be.visible");
    });

    it("harus bisa mengubah jumlah [Show entries] per halaman", () => {
      // 1. Verifikasi nilai default adalah 10 dan 10 baris
      cy.contains("Show")
        .next('button[role="combobox"]')
        .should("contain", "10");
      cy.get("table tbody tr").should("have.length", 10);
      cy.contains("Showing 1 to 10 of 88 entries").should("be.visible");

      // 2. Buka dropdown
      cy.contains("Show").next('button[role="combobox"]').click();

      // 3. Klik opsi "25"
      cy.get('div[role="option"]').contains("25").click();
      cy.wait(1000); // Tunggu data reload

      // 4. Verifikasi nilai berubah ke 25 dan 25 baris
      cy.contains("Show")
        .next('button[role="combobox"]')
        .should("contain", "25");
      cy.get("table tbody tr").should("have.length", 25);
      cy.contains("Showing 1 to 25 of 88 entries")
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
      cy.contains("Showing 1 to 50 of 88 entries")
        .scrollIntoView()
        .should("be.visible");
    });

    it("harus bisa berpindah halaman menggunakan [Paginasi]", function () {
      const paginationText = "Showing 1 to 10 of 88 entries";
      cy.contains(paginationText).should("be.visible");

      // 1. Klik halaman 2
      cy.contains(paginationText)
        .next() // Pindah ke div pembungkus paginasi
        .find("button")
        .contains("2")
        .click();
      cy.wait(1000); // Tunggu data reload

      // 2. Cek teks paginasi baru
      cy.contains("Showing 11 to 20 of 88 entries").should("be.visible");

      // 3. Klik halaman terakhir
      cy.get("button svg.lucide-chevrons-right").parent().click();
      cy.contains("Showing 81 to 88 of 88 entries").should("be.visible");

      // 4. Klik halaman pertama
      cy.get("button svg.lucide-chevrons-left").parent().click();
      cy.contains(paginationText).should("be.visible");
      cy.get("table tbody tr").first().should("contain", "Head Office");
    });
  });
  // --- GRUP 3: Skenario Edit Peran (Sesuai Permintaan) ---
  describe("Skenario Edit Peran Pengguna", () => {
    // Fungsi helper untuk mengedit pengguna
    const editUserRole = (
      userId: string, // <-- PERUBAHAN: Tambahkan userId
      userName: string,
      oldRole: string,
      newRole: string
    ) => {
      // 1. Cari pengguna
      cy.get('input[placeholder="Search..."]').clear().type(userName);
      cy.wait(1000); // Tunggu debounce

      // 2. Verifikasi 1 hasil & klik tombol edit
      cy.get("table tbody tr").should("have.length", 1);
      cy.contains("td", userName)
        .parent("tr")
        .within(() => {
          cy.contains(oldRole).should("be.visible");
          cy.get("button.hover\\:text-primary").click(); // Klik tombol edit
        });

      // 3. Di dalam modal, ubah peran
      cy.get('div[role="dialog"]').within(() => {
        cy.contains(`Edit Peran Pengguna untuk ${userName}`).should(
          "be.visible"
        );

        // Klik tombol combobox berdasarkan labelnya
        cy.contains("label", "Peran Sistem")
          .next('button[role="combobox"]')
          .click();
      });

      // 4. Pilih peran baru (di luar modal)
      cy.get('div[role="option"]').contains(newRole).click();

      // 5. Simpan
      cy.get('div[role="dialog"]').within(() => {
        cy.contains("button", "Simpan").click();
      });

      // 6. Verifikasi notifikasi
      // --- PERBAIKAN: Gunakan format notifikasi yang diminta ---
      cy.contains(`User ${userId} role updated.`).should("be.visible");
      cy.wait(1000); // Tunggu notifikasi hilang

      // 7. Verifikasi data di tabel (masih terfilter)
      cy.get("table tbody tr").should("have.length", 1);
      cy.contains("td", userName)
        .parent("tr")
        .contains(newRole)
        .should("be.visible");
    };

    it("harus bisa mencari dan mengubah peran 'Aida Ai' menjadi HR_BRANCH", () => {
      editUserRole("90902", "Aida Ai", "EMPLOYEE", "HR_BRANCH");
    });

    it("harus bisa mencari dan mengubah peran 'Wesa Sandhika' menjadi ADMIN", () => {
      editUserRole("90901", "Wesa Sandhika", "EMPLOYEE", "ADMIN");
    });

    it("harus bisa mencari dan mengubah peran 'Yanto Prasetyo' menjadi HD", () => {
      editUserRole("90903", "Yanto Prasetyo", "EMPLOYEE", "HD");
    });
  });
});
