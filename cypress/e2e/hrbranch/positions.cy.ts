// cypress/e2e/hrbranch/positions.cy.ts

describe("HR Branch - Manajemen Data Posisi", () => {
  // Asumsi dari Mockup Data MCJ.csv
  const NAMA_CABANG_HR = "ICBP-Noodle Head Office";
  const NAMA_CABANG_LAIN = "ICBP-Noodle Tangerang";

  // Data Posisi dari cabang lain (untuk tes negatif)
  //
  const NAMA_POSISI_CABANG_LAIN = "qwredqwdasfasfas"; // Dari Tangerang

  // Data Posisi dari cabang HR_BRANCH (Head Office)
  //
  const NAMA_POSISI_SENDIRI = "Finance Spv"; // Dari Head Office
  const NAMA_DEPT_SENDIRI = "ADM Fin.& Acct."; // Dari Head Office

  // Asumsi dari admin/positions.cy.ts dan page.tsx
  // 0: Nama Posisi, 1: Level, 2: Departemen, 3: Cabang
  const COL_INDEX_CABANG = 3;

  // Helper untuk memverifikasi data scoping di tabel
  const verifyBranchScoping = () => {
    cy.log(
      `Memverifikasi semua baris di tabel memiliki cabang "${NAMA_CABANG_HR}"`
    );
    cy.wait(250);

    cy.get("table tbody").then(($tbody) => {
      if ($tbody.text().includes("No results found")) {
        cy.log("Tabel kosong, verifikasi scoping dilewati.");
        return;
      }

      if ($tbody.find("tr").length > 0) {
        cy.get("table tbody tr").each(($row) => {
          // Verifikasi kolom "Cabang" (indeks 3)
          cy.wrap($row)
            .find("td")
            .eq(COL_INDEX_CABANG)
            .should("have.text", NAMA_CABANG_HR);
        });
      }
    });
  };

  beforeEach(() => {
    // 1. Kunjungi halaman login
    cy.visit("/login");

    // 2. Ambil data login HR Branch
    const hrBranchId = Cypress.env("TEST_HRBRANCH_ID");
    const hrBranchPassword = Cypress.env("TEST_HRBRANCH_PASSWORD");

    cy.get('input[id="employeeId"]').type(hrBranchId);
    cy.get('input[id="password"]').type(hrBranchPassword);
    cy.get('button[type="submit"]').click();

    // 4. Pastikan sudah di dashboard admin
    cy.url({ timeout: 10000 }).should("include", "/admin");
    cy.contains("h1", "Dashboard Admin").should("be.visible");

    // 5. Navigasi ke halaman Manajemen Posisi
    cy.get('a[href="/admin/positions"]').click();

    // 6. Pastikan halaman selesai loading
    cy.contains("h1", "Data Posisi").should("be.visible"); //
    cy.wait(1000); // Tunggu data awal load
  });

  // --- GRUP 1: Validasi Tampilan Awal ---
  describe("Validasi Tampilan (Display)", () => {
    it("harus menampilkan sidebar dengan link 'Positions' yang aktif", () => {
      cy.get('a[href="/admin/positions"]')
        .should("be.visible")
        .and("have.class", "bg-blue-100");

      cy.get('a[href="/admin/employees"]')
        .should("be.visible")
        .and("not.have.class", "bg-blue-100");
    });

    it("harus menampilkan semua kontrol tabel (Search, Filter, Buat)", () => {
      cy.contains("Show").next().should("contain", "10");
      cy.get('input[placeholder="Search..."]').should("be.visible");
      cy.contains("button", "Filter").should("be.visible");
      // HR_BRANCH memiliki izin 'create' untuk 'position'
      cy.contains("button", "Buat Posisi").should("be.visible"); //
    });

    it("harus menampilkan header tabel", () => {
      cy.get("table th").contains("Nama Posisi").should("be.visible"); //
      cy.get("table th").contains("Level").should("be.visible"); //
      cy.get("table th").contains("Departemen").should("be.visible"); //
      cy.get("table th").contains("Cabang").should("be.visible"); //
      cy.get("table th").contains("Aksi").should("be.visible"); //
    });
  });

  // --- GRUP 2: Validasi Fungsionalitas (Dengan Scoping) ---
  describe("Validasi Fungsionalitas (Dengan Scoping)", () => {
    it("harus HANYA menampilkan posisi dari cabangnya sendiri", () => {
      cy.get("table tbody").find("tr").should("have.length.gt", 0);
      // Panggil helper untuk cek SEMUA baris
      verifyBranchScoping();
    });

    it("harus bisa memfilter tabel menggunakan [Search] (Test Negatif)", () => {
      // --- Skenario 1: Pencarian Negatif (Posisi Cabang Lain) ---
      cy.log(`Mencari ${NAMA_POSISI_CABANG_LAIN} (dari cabang lain)`);
      cy.get('input[placeholder="Search..."]').type(NAMA_POSISI_CABANG_LAIN);
      cy.wait(500);
      cy.contains("No results found.").should("be.visible");
      verifyBranchScoping();

      // --- Skenario 2: Pencarian Positif (Posisi Cabang Sendiri) ---
      cy.log(`Mencari ${NAMA_POSISI_SENDIRI} (dari cabang sendiri)`);
      cy.get('input[placeholder="Search..."]')
        .clear()
        .type(NAMA_POSISI_SENDIRI);
      cy.wait(500);
      cy.contains("td", NAMA_POSISI_SENDIRI).should("be.visible");
      verifyBranchScoping(); // Pastikan hasil pencarian tetap scoped
    });

    it("harus memiliki filter [Cabang] yang scoped (Semua dan Cabang Sendiri)", () => {
      // 1. Buka popover filter
      cy.contains("button", "Filter").click();

      // 2. Dialog popover harus muncul
      cy.get('div[role="dialog"]').within(() => {
        cy.contains("h4", "Filter Data").should("be.visible");
        // 3. FSK: Validasi Scoping Filter Cabang
        cy.contains("label", "Cabang").next('button[role="combobox"]').click();
      });

      // 4. Verifikasi opsinya HANYA 2 (Semua dan Cabang Sendiri)
      cy.get('div[role="option"]')
        .should("have.length", 2)
        .and("contain", "Semua")
        .and("contain", NAMA_CABANG_HR);

      // 5. Verifikasi negatif (tidak ada cabang lain)
      cy.get('div[role="option"]').should("not.contain", NAMA_CABANG_LAIN);

      // 6. Klik opsi cabang sendiri
      cy.get('div[role="option"]').contains(NAMA_CABANG_HR).click();

      // 7. Klik Terapkan
      cy.get('div[role="dialog"]').within(() => {
        cy.contains("button", "Terapkan Filter").click();
      });
      cy.wait(500);

      // 8. Verifikasi semua data di tabel adalah dari Cabang HR
      verifyBranchScoping();
      cy.contains("button", "Filter").should("have.class", "bg-primary");
    });

    it("harus bisa mengubah jumlah [Show entries] dan tetap scoped", () => {
      cy.contains("Show")
        .next('button[role="combobox"]')
        .as("selectShow")
        .should("contain", "10");
      cy.get("table tbody tr").should("have.length.at.most", 10);
      verifyBranchScoping();

      cy.get("@selectShow").click();
      cy.get('div[role="option"]').contains("25").click();
      cy.wait(1000);

      cy.get("@selectShow").should("contain", "25");
      cy.get("table tbody tr").should("have.length.gt", 10);
      verifyBranchScoping(); // Verifikasi ulang setelah reload
    });

    it("harus bisa berpindah halaman [Paginasi] dan tetap scoped", () => {
      cy.contains(/Showing 1 to 10 of \d+ entries/).should("be.visible");
      verifyBranchScoping();

      // 1. Klik halaman 2 (jika ada)
      cy.get("body").then(($body) => {
        if ($body.find('button:contains("2")').length > 0) {
          cy.contains("button", /^2$/).click();
          cy.wait(500);
          cy.contains(/Showing 11 to \d+ of \d+ entries/).should("be.visible");
          verifyBranchScoping(); // Verifikasi di halaman 2
        } else {
          cy.log("Paginasi tidak ada (data <= 10), tes dilewati.");
        }
      });
    });
  });

  // --- GRUP 3: Validasi Fungsionalitas CRUD (Dengan Scoping) ---
  describe("Validasi Fungsionalitas CRUD (Dengan Scoping)", () => {
    const namaPosisiBaru = "Test Posisi HRBranch";
    const namaPosisiEdit = "Test Posisi HRBranch (Edited)";

    // Helper dari admin/positions.cy.ts
    const selectDropdownOption = (label: string, optionText: string) => {
      cy.get('[role="dialog"]').within(() => {
        cy.contains("label", label)
          .parent()
          .find('button[role="combobox"]')
          .click();
      });
      cy.get('[role="option"]').contains(optionText).click();
    };

    it("seharusnya bisa menambah posisi baru (Form Cabang HANYA 1 opsi)", () => {
      cy.intercept("POST", "/api/admin/positions").as("createPosition");
      cy.intercept("GET", "/api/admin/positions?*").as("getPositions");

      cy.contains("button", "Buat Posisi").click(); //

      cy.get('[role="dialog"]').within(() => {
        cy.contains("h2", "Buat Posisi Baru").should("be.visible"); //
        // 1. Isi Nama Posisi
        cy.get('input[placeholder="Contoh: Staff HR"]').type(namaPosisiBaru); //
      });

      // 2. Pilih Level
      selectDropdownOption("Level", "STAFF");

      // 3. FSK: Validasi Scoping di Form - Cabang
      cy.log("Verifikasi dan pilih 'Cabang'");
      cy.get('[role="dialog"]').within(() => {
        cy.contains("label", "Cabang")
          .parent()
          .find('button[role="combobox"]')
          .click();
      });
      // Opsi dropdown ada di root body
      cy.get('[role="option"]')
        .should("have.length", 1) // Hanya ada 1 opsi
        .and("contain", NAMA_CABANG_HR)
        .click();

      // 4. Pilih Departemen (yang sudah ter-filter oleh cabang)
      cy.wait(500); // Tunggu departemen load
      selectDropdownOption("Departemen", NAMA_DEPT_SENDIRI);

      // 5. Simpan
      cy.get('[role="dialog"]').within(() => {
        cy.contains("button", "Simpan").click(); //
      });

      // 6. Verifikasi sukses
      cy.wait("@createPosition");
      cy.contains(`Posisi "${namaPosisiBaru}" telah disimpan.`).should(
        "be.visible"
      ); //
      cy.wait("@getPositions");

      // 7. Verifikasi data baru ada di tabel (dan scoped)
      cy.get('input[placeholder="Search..."]').type(namaPosisiBaru);
      cy.wait(500);
      cy.get("table tbody").contains("td", namaPosisiBaru).should("be.visible");
      verifyBranchScoping();
    });

    it("seharusnya bisa... mengedit semua datanya (Form Cabang HANYA 1 opsi)", () => {
      cy.intercept("PUT", `/api/admin/positions/*`).as("updatePosition");
      cy.intercept("GET", "/api/admin/positions?*").as("getPositions");

      // 1. Cari posisi yang ingin diedit
      cy.get('input[placeholder="Search..."]').clear().type(namaPosisiBaru);
      cy.contains("td", namaPosisiBaru).should("be.visible");

      // 2. Klik tombol edit
      cy.contains("td", namaPosisiBaru)
        .parent("tr")
        .find("button")
        .first() // Asumsi tombol Edit
        .click();

      // 3. Lakukan perubahan di dalam modal
      cy.get('[role="dialog"]').within(() => {
        cy.contains("h2", "Edit Posisi").should("be.visible"); //
        cy.get('input[placeholder="Contoh: Staff HR"]') //
          .clear()
          .type(namaPosisiEdit);
      });

      // 4. FSK: Validasi Scoping di Form - Cabang
      cy.get('[role="dialog"]').within(() => {
        cy.contains("label", "Cabang")
          .parent()
          .find('button[role="combobox"]')
          .should("contain", NAMA_CABANG_HR) // Sudah terisi
          .click();
      });
      cy.get('[role="option"]')
        .should("have.length", 1)
        .and("contain", NAMA_CABANG_HR)
        .click();

      // 5. Simpan
      cy.get('[role="dialog"]').within(() => {
        cy.contains("button", "Simpan").click(); //
      });

      // 6. Verifikasi notifikasi dan data di tabel
      cy.wait("@updatePosition");
      cy.contains(`Posisi "${namaPosisiEdit}" telah disimpan.`).should(
        "be.visible"
      ); //
      cy.wait("@getPositions");

      // 7. Verifikasi data di tabel sudah ter-update
      cy.get('input[placeholder="Search..."]').clear().type(namaPosisiEdit);
      cy.get("table tbody").contains("td", namaPosisiEdit).should("be.visible");
      verifyBranchScoping();
    });

    it("seharusnya bisa... menghapusnya", () => {
      cy.intercept("DELETE", `/api/admin/positions/*`).as("deletePosition");
      cy.intercept("GET", "/api/admin/positions?*").as("getPositions");

      // 1. Cari posisi yang ingin dihapus
      cy.get('input[placeholder="Search..."]').clear().type(namaPosisiEdit);
      cy.contains("td", namaPosisiEdit).should("be.visible");

      // 2. Klik tombol hapus
      cy.contains("td", namaPosisiEdit)
        .parent("tr")
        .find("button.hover\\:text-red-600") //
        .click();

      // 3. Konfirmasi di dialog
      cy.get('[role="alertdialog"]').within(() => {
        cy.contains("h2", "Apakah Anda yakin?").should("be.visible"); //
        cy.contains("button", "Hapus").click(); //
      });

      // 4. Verifikasi notifikasi dan pastikan data hilang
      cy.wait("@deletePosition");
      cy.contains("Posisi berhasil dihapus").should("be.visible"); //
      cy.wait("@getPositions");

      cy.contains("td", namaPosisiEdit).should("not.exist");
      cy.contains("No results found.").should("be.visible");
    });
  });
});
