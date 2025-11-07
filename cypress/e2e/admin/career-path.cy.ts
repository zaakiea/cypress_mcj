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
  describe("Validasi Fungsionalitas Filter", () => {
    /**
     * Helper untuk memilih opsi dari combobox filter di dalam popover.
     * @param label Teks label dari filter (e.g., "Tipe", "Karir Asal")
     * @param optionText Teks opsi yang ingin dipilih (e.g., "CROSS", "SHE Staff")
     */
    const selectFilterOption = (label: string, optionText: string) => {
      // 1. Klik combobox di dalam popover
      cy.get('div[role="dialog"][data-slot="popover-content"]').within(() => {
        cy.contains("label", label)
          .next('button[role="combobox"]')
          .click({ force: true });
      });
      // 2. Klik opsi (yang muncul di root body)
      // Tambahkan /i untuk case-insensitive match jika perlu
      cy.get('div[role="option"]')
        .contains(new RegExp(`^${optionText}$`, "i"))
        .click();
    };

    /**
     * Helper untuk menerapkan filter
     */
    const applyFilter = () => {
      cy.get('div[role="dialog"][data-slot="popover-content"]').within(() => {
        cy.contains("button", "Terapkan Filter").click();
      });
      cy.wait(500); // Tunggu data reload
    };

    /**
     * Helper untuk reset filter
     */
    const resetFilter = () => {
      cy.get('div[role="dialog"][data-slot="popover-content"]').within(() => {
        cy.contains("button", "Reset").click();
      });
      cy.wait(500); // Tunggu data reload
    };

    /**
     * Helper untuk memverifikasi isi kolom tabel.
     * Handle jika "No results found."
     * Kolom: 0 = Posisi Asal, 1 = Posisi Tujuan, 2 = Tipe
     * @param colIndex Index kolom (0-based)
     * @param text Teks yang diharapkan
     */
    const verifyColumnContains = (colIndex: number, text: string) => {
      cy.get("table tbody").then(($tbody) => {
        if ($tbody.text().includes("No results found")) {
          cy.contains("No results found.").should("be.visible");
        } else {
          cy.get("table tbody tr").each(($row) => {
            cy.wrap($row).find("td").eq(colIndex).should("contain.text", text);
          });
        }
      });
    };

    // --- Skenario Pengetesan ---

    beforeEach(() => {
      // Buka popover filter sebelum setiap tes di grup ini
      cy.contains("button", "Filter").click();
      // Pastikan popover terbuka
      cy.get('div[role="dialog"][data-slot="popover-content"]')
        .contains("h4", "Filter Data")
        .should("be.visible");
    });

    afterEach(() => {
      // Selalu reset filter setelah setiap tes untuk isolasi
      // (Ini mengasumsikan tombol Filter tetap terlihat/bisa diklik)
      cy.contains("button", "Filter").click();
      resetFilter();
      // Pastikan tombol filter kembali ke state default
      cy.contains("button", "Filter")
        .should("not.have.class", "bg-primary")
        .and("have.class", "border");
    });

    it("harus bisa filter Tipe: CROSS, Karir Asal: Semua, Karir Tujuan: Semua", () => {
      cy.log("Skenario 1: Filter Tipe CROSS");

      // 1. Set filter
      selectFilterOption("Tipe", "CROSS");

      // 2. Terapkan
      applyFilter();

      // 3. Verifikasi (Kolom Tipe adalah index 2)
      verifyColumnContains(0, "CROSS");
    });

    it("harus bisa filter Tipe: ALIGN, Karir Asal: Semua, Karir Tujuan: Semua", () => {
      cy.log("Skenario 2: Filter Tipe ALIGN");

      // 1. Set filter
      selectFilterOption("Tipe", "ALIGN");

      // 2. Terapkan
      applyFilter();

      // 3. Verifikasi (Kolom Tipe adalah index 2)
      verifyColumnContains(0, "ALIGN");
    });

    it("harus bisa filter Tipe: Semua, Karir Asal: SHE Staff, Karir Tujuan: Semua", () => {
      cy.log("Skenario 3: Filter Karir Asal 'SHE Staff'");

      // 1. Set filter
      selectFilterOption("Karir Asal", "SHE Staff");

      // 2. Terapkan
      applyFilter();

      // 3. Verifikasi (Kolom Posisi Asal adalah index 1)
      verifyColumnContains(1, "SHE Staff");
    });

    it("harus bisa filter Tipe: Semua, Karir Asal: Semua, Karir Tujuan: Comben Staff", () => {
      cy.log("Skenario 4: Filter Karir Tujuan 'Comben Staff'");

      // 1. Set filter
      selectFilterOption("Karir Tujuan", "Comben Staff");

      // 2. Terapkan
      applyFilter();

      // 3. Verifikasi (Kolom Posisi Tujuan adalah index 1)
      verifyColumnContains(2, "Comben Staff");
    });

    it("harus bisa filter kombinasi Tipe: CROSS, Karir Asal: SHE Staff, Karir Tujuan: Semua", () => {
      cy.log("Skenario 5: Filter Kombinasi (CROSS & SHE Staff)");

      // 1. Set filter
      selectFilterOption("Tipe", "CROSS");
      selectFilterOption("Karir Asal", "SHE Staff");

      // 2. Terapkan
      applyFilter();

      // 3. Verifikasi
      cy.get("table tbody").then(($tbody) => {
        if ($tbody.text().includes("No results found")) {
          cy.contains("No results found.").should("be.visible");
        } else {
          cy.get("table tbody tr").each(($row) => {
            // Cek Posisi Asal (index 0)
            cy.wrap($row).find("td").eq(1).should("contain.text", "SHE Staff");
            // Cek Tipe (index 2)
            cy.wrap($row).find("td").eq(0).should("contain.text", "CROSS");
          });
        }
      });
    });

    it("harus bisa me-reset filter", () => {
      cy.log("Skenario 6: Reset Filter");

      // 1. Set filter
      selectFilterOption("Tipe", "CROSS");
      selectFilterOption("Karir Asal", "SHE Staff");

      // 2. Terapkan
      applyFilter();

      // 3. Verifikasi filter aktif (tombol jadi primary)
      cy.contains("button", "Filter").should("have.class", "bg-primary");

      // 4. Buka popover lagi dan reset
      cy.contains("button", "Filter").click();
      resetFilter();

      // 5. Verifikasi tombol filter kembali ke state default
      cy.contains("button", "Filter")
        .should("not.have.class", "bg-primary")
        .and("have.class", "border");

      // 6. Verifikasi popover tertutup
      cy.get('div[role="dialog"][data-slot="popover-content"]').should(
        "not.exist"
      );
    });
  });
  // --- GRUP: Validasi Fungsionalitas CRUD (Create, Update, Delete) ---
  describe("Validasi Fungsionalitas CRUD", () => {
    // --- Data Uji ---
    const dataAsal = {
      role1: "A & P Staff", // Untuk tes sukses
      role2: "Acct Staff", // Untuk tes ganda
      role3: "GAS Staff", // Untuk tes error
    };
    const dataTujuan = {
      role1: "A & P Spv",
      role2: "Acct Spv",
      role3: "GAS Spv",
      role5: "GAS Staff", // Untuk tes error
      role4: "Buyer",
      editAsal: "Admin to BHRM",
      editTujuan: "Cashier",
    };

    // --- Helper Functions ---

    /**
     * Memilih item dari dropdown "Karir Asal"
     * @param optionText Teks dari opsi yang ingin dipilih
     */
    const selectOriginDropdown = (optionText: string) => {
      cy.get('div[role="dialog"]').within(() => {
        cy.contains("label", "Karir Asal")
          .next('button[role="combobox"]')
          .click();
      });
      // Opsi dropdown muncul di root body
      cy.get('div[role="option"]')
        .contains(new RegExp(`^${optionText}$`))
        .click();
    };

    /**
     * Mengisi form untuk satu blok "Karir Tujuan"
     * @param blockIndex Index blok (mulai dari 0)
     * @param tujuan Teks Karir Tujuan (e.g., "Acct Spv")
     * @param jenis Teks Jenis Path (e.g., "ALIGN" atau "CROSS")
     * @param periode Teks Periode (e.g., "SHORT_TERM" atau "LONG_TERM")
     */
    const fillDestinationBlock = (
      blockIndex: number,
      tujuan: string,
      jenis: "ALIGN" | "CROSS",
      periode: "SHORT_TERM" | "LONG_TERM"
    ) => {
      // Dapatkan blok tujuan yang spesifik

      // --- PERBAIKAN DI SINI ---
      const destinationBlock = cy
        .get('div[role="dialog"]')
        .find("h3:contains('Ke Karir Tujuan')") // 1. Cari h3
        .parent() // 2. Naik ke parent-nya (div.flex)
        .nextAll("div.relative.p-4") // 3. Cari semua saudara (blok tujuan)
        .eq(blockIndex); // 4. Pilih yang sesuai index
      // --- AKHIR PERBAIKAN ---

      // --- Isi Karir Tujuan ---
      destinationBlock.within(() => {
        cy.contains("label", "Karir Tujuan")
          .next('button[role="combobox"]')
          .click();
      });
      cy.get('div[role="option"]')
        .contains(new RegExp(`^${tujuan}$`))
        .click();

      // --- Isi Jenis Path ---
      destinationBlock.within(() => {
        cy.contains("label", "Jenis Path")
          .next('button[role="combobox"]')
          .click();
      });
      cy.get('div[role="option"]')
        .contains(new RegExp(`^${jenis}$`, "i")) // "Align" atau "Cross"
        .click();

      // --- Isi Periode ---
      destinationBlock.within(() => {
        cy.contains("label", "Periode").next('button[role="combobox"]').click();
      });
      // "Short Term" atau "Long Term"
      const periodeRegex =
        periode === "SHORT_TERM" ? "Short Term" : "Long Term";
      cy.get('div[role="option"]').contains(periodeRegex).click();
    };

    /**
     * Helper untuk memilih dropdown di dalam MODAL EDIT.
     * @param label Teks label (e.g., "Karir Asal", "Tipe")
     * @param optionText Teks opsi yang ingin dipilih
     */
    const selectEditDropdown = (label: string, optionText: string) => {
      cy.get('div[role="dialog"]').within(() => {
        cy.contains("label", label)
          .next('button[role="combobox"]')
          .click({ force: true });
      });
      // Opsi dropdown muncul di root body
      cy.get('div[role="option"]')
        .contains(new RegExp(`^${optionText}$`, "i")) // Case-insensitive, exact match
        .click();
    };

    /**
     * Helper untuk menyimpan perubahan dari modal EDIT.
     * Termasuk intercept, wait, dan verifikasi toast.
     */
    const saveEditChanges = () => {
      cy.intercept("PUT", "/api/admin/career-path/*").as("updateCareerPath");
      cy.intercept("GET", "/api/admin/career-path?*").as("getPathsAfterUpdate");

      cy.get('div[role="dialog"]').within(() => {
        cy.contains('button[type="submit"]', "Simpan Perubahan").click();
      });

      cy.wait("@updateCareerPath");
      cy.get('li[data-sonner-toast][data-type="success"]')
        .should("contain", "Jenjang karier berhasil diperbarui") // Asumsi pesan sukses
        .should("be.visible");
      cy.wait("@getPathsAfterUpdate");
    };
    // --- Skenario Pengetesan ---

    it("harus bisa membuat jenjang karir baru (1 Tujuan - ALIGN)", () => {
      // 1. Intercept API
      cy.intercept("POST", "/api/admin/career-path").as("createCareerPath");
      cy.intercept("GET", "/api/admin/career-path?*").as("getCareerPaths");

      // 2. Klik tombol Tambah
      cy.contains("button", "Buat Jenjang Karier").click();
      cy.get('div[role="dialog"]')
        .contains("h2", "Buat Jenjang Karier Baru")
        .should("be.visible");

      // 3. Isi Form
      selectOriginDropdown(dataAsal.role1);
      fillDestinationBlock(0, dataTujuan.role1, "ALIGN", "SHORT_TERM");

      // 4. Simpan
      cy.get('div[role="dialog"]')
        .contains('button[type="submit"]', "Simpan")
        .click();

      // 5. Verifikasi sukses
      cy.wait("@createCareerPath");
      cy.get('li[data-sonner-toast][data-type="success"]')
        .should("contain", "Jenjang karier berhasil dibuat.")
        .should("be.visible");
      cy.wait("@getCareerPaths");

      // 6. Verifikasi data muncul di tabel
      cy.get('input[placeholder="Search..."]').type(dataAsal.role1);
      cy.wait(500);
      cy.contains("td", dataAsal.role1).should("be.visible");
      cy.contains("td", dataTujuan.role1).should("be.visible");
      cy.contains("td", "ALIGN").should("be.visible");
    });

    it("harus bisa membuat jenjang karir baru (2 Tujuan - ALIGN & CROSS)", () => {
      // 1. Intercept API
      cy.intercept("POST", "/api/admin/career-path").as("createCareerPath");
      cy.intercept("GET", "/api/admin/career-path?*").as("getCareerPaths");

      // 2. Klik tombol Tambah
      cy.contains("button", "Buat Jenjang Karier").click();
      cy.get('div[role="dialog"]')
        .contains("h2", "Buat Jenjang Karier Baru")
        .should("be.visible");

      // 3. Isi Form
      selectOriginDropdown(dataAsal.role2);

      // 4. Isi Tujuan 1
      fillDestinationBlock(0, dataTujuan.role2, "ALIGN", "SHORT_TERM");

      // 5. Tambah Tujuan 2
      cy.get('div[role="dialog"]').contains("button", "Tambah Tujuan").click();

      // 6. Isi Tujuan 2
      fillDestinationBlock(1, dataTujuan.role4, "CROSS", "LONG_TERM");

      // 7. Simpan
      cy.get('div[role="dialog"]')
        .contains('button[type="submit"]', "Simpan")
        .click();

      // 8. Verifikasi sukses
      cy.wait("@createCareerPath");
      cy.get('li[data-sonner-toast][data-type="success"]')
        .should("contain", "Jenjang karier berhasil dibuat.")
        .should("be.visible");
      cy.wait("@getCareerPaths");

      // 9. Verifikasi data (kedua baris) muncul di tabel
      cy.get('input[placeholder="Search..."]').clear().type(dataAsal.role2);
      cy.wait(500);
      cy.contains("td", dataTujuan.role2).should("be.visible");
      cy.contains("td", dataTujuan.role4).should("be.visible");
      cy.contains("td", "ALIGN").should("be.visible");
      cy.contains("td", "CROSS").should("be.visible");
    });
    it("harus gagal jika karir asal dan tujuan sama", () => {
      // 1. Intercept API
      cy.intercept("POST", "/api/admin/career-path").as("createCareerPath");

      // 2. Klik tombol Tambah
      cy.contains("button", "Buat Jenjang Karier").click();
      cy.get('div[role="dialog"]')
        .contains("h2", "Buat Jenjang Karier Baru")
        .should("be.visible");

      // 3. Isi Form dengan data yang sama
      selectOriginDropdown(dataAsal.role3);
      fillDestinationBlock(0, dataTujuan.role5, "ALIGN", "SHORT_TERM"); // role3 == role3

      // 4. Simpan
      cy.get('div[role="dialog"]')
        .contains('button[type="submit"]', "Simpan")
        .click();

      // 5. Verifikasi error
      cy.wait("@createCareerPath");
      cy.get('li[data-sonner-toast][data-type="error"]')
        .should(
          "contain",
          "Tidak dapat membuat jenjang karier ke job role yang sama."
        )
        .should("exist"); // Gunakan "exist" karena modal mungkin menutupi

      // 6. Modal harus tetap terbuka
      cy.get('div[role="dialog"]')
        .contains("h2", "Buat Jenjang Karier Baru")
        .should("be.visible");

      // 7. Tutup modal
      cy.get('div[role="dialog"]')
        .contains('button[type="button"]', "Batal")
        .click();
    });

    it("harus gagal jika jenjang karir dengan periode yang sama sudah ada", () => {
      // 1. Intercept API
      cy.intercept("POST", "/api/admin/career-path").as("createCareerPath");

      // 2. Klik tombol Tambah
      cy.contains("button", "Buat Jenjang Karier").click();
      cy.get('div[role="dialog"]')
        .contains("h2", "Buat Jenjang Karier Baru")
        .should("be.visible");

      // 3. Isi Form dengan data yang sama
      selectOriginDropdown(dataAsal.role3);
      fillDestinationBlock(0, dataTujuan.role3, "ALIGN", "SHORT_TERM"); // role3 == role3

      // 4. Simpan
      cy.get('div[role="dialog"]')
        .contains('button[type="submit"]', "Simpan")
        .click();

      // 5. Verifikasi error
      cy.wait("@createCareerPath");
      cy.get('li[data-sonner-toast][data-type="error"]')
        .should(
          "contain",
          "Satu atau lebih jenjang karier yang diajukan (dengan periode yang sama) sudah ada."
        )
        .should("exist"); // Gunakan "exist" karena modal mungkin menutupi

      // 6. Modal harus tetap terbuka
      cy.get('div[role="dialog"]')
        .contains("h2", "Buat Jenjang Karier Baru")
        .should("be.visible");

      // 7. Tutup modal
      cy.get('div[role="dialog"]')
        .contains('button[type="button"]', "Batal")
        .click();
    });
    it("harus bisa mengedit data jenjang karir (Tipe, Periode, Tujuan, Asal)", () => {
      // Data yang diedit berasal dari tes "(2 Tujuan - ALIGN & CROSS)"
      // 1: Acct Staff -> Acct Spv (ALIGN, SHORT_TERM)
      // 2: Acct Staff -> Buyer (CROSS, LONG_TERM)

      // --- Skenario 1: Edit Tipe & Periode ---
      cy.log("--- Skenario Edit 1: Mengubah Tipe & Periode ---");
      cy.get('input[placeholder="Search..."]').clear().type(dataAsal.role2);
      cy.wait(500);

      // 1. Buka modal edit untuk baris "Acct Spv"
      cy.contains("tr", dataTujuan.role2) // Baris "Acct Spv"
        .find("button.hover\\:text-primary") // Tombol Edit
        .click();

      // 2. Verifikasi data awal di modal
      cy.get('div[role="dialog"]')
        .contains("h2", "Edit Jenjang Karier")
        .should("be.visible");
      // Verifikasi data yang sudah terisi (berdasarkan HTML yang Anda berikan)
      cy.get('div[role="dialog"]')
        .contains("label", "Karir Asal")
        .next("button")
        .should("contain", dataAsal.role2); // "Acct Staff"
      cy.get('div[role="dialog"]')
        .contains("label", "Karir Tujuan")
        .next("button")
        .should("contain", dataTujuan.role2); // "Acct Spv"
      cy.get('div[role="dialog"]')
        .contains("label", "Tipe")
        .next("button")
        .should("contain", "Align");
      cy.get('div[role="dialog"]')
        .contains("label", "Periode")
        .next("button")
        .should("contain", "Short Term");

      // 3. Ubah Tipe -> CROSS dan Periode -> Long Term
      selectEditDropdown("Tipe", "CROSS");
      selectEditDropdown("Periode", "Long Term");

      // 4. Simpan
      saveEditChanges();

      // 5. Verifikasi perubahan di tabel
      cy.get('input[placeholder="Search..."]').clear().type(dataAsal.role2);
      cy.wait(500);
      const row1 = cy.contains("tr", dataTujuan.role2); // Baris "Acct Spv"
      row1.contains("td", "CROSS").should("be.visible");

      // --- Skenario 2: Edit Karir Tujuan ---
      cy.log("--- Skenario Edit 2: Mengubah Karir Tujuan ---");
      // 1. Buka modal edit untuk baris "Buyer"
      cy.contains("tr", dataTujuan.role4) // Baris "Buyer"
        .find("button.hover\\:text-primary") // Tombol Edit
        .click();

      // 2. Ubah Karir Tujuan -> "Cashier"
      selectEditDropdown("Karir Tujuan", dataTujuan.editTujuan); // "Cashier"

      // 3. Simpan
      saveEditChanges();

      // 4. Verifikasi perubahan di tabel
      cy.get('input[placeholder="Search..."]').clear().type(dataAsal.role2);
      cy.wait(500);
      cy.contains("td", dataTujuan.role4).should("not.exist"); // "Buyer" hilang
      cy.contains("td", dataTujuan.editTujuan).should("be.visible"); // "Cashier" muncul

      // --- Skenario 3: Edit Karir Asal ---
      cy.log("--- Skenario Edit 3: Mengubah Karir Asal ---");
      // 1. Buka modal edit untuk baris "Cashier" (hasil Skenario 2)
      cy.contains("tr", dataTujuan.editTujuan)
        .find("button.hover\\:text-primary")
        .click();

      // 2. Ubah Karir Asal -> "Admin to BHRM"
      selectEditDropdown("Karir Asal", dataTujuan.editAsal); // "Admin to BHRM"

      // 3. Simpan
      saveEditChanges();

      // 4. Verifikasi perubahan di tabel
      // Data lama (Acct Staff) seharusnya sudah tidak ada untuk path ini
      cy.get('input[placeholder="Search..."]').clear().type(dataAsal.role2);
      cy.wait(500);
      cy.contains("td", dataTujuan.editTujuan).should("not.exist");

      // Data baru (Admin to BHRM) seharusnya muncul
      cy.get('input[placeholder="Search..."]')
        .clear()
        .type(dataTujuan.editAsal);
      cy.wait(500);
      cy.contains("td", dataTujuan.editAsal).should("be.visible");
      cy.contains("td", dataTujuan.editTujuan).should("be.visible");
    });
    it("harus bisa membuat jenjang karir baru (3 Tujuan sekaligus)", () => {
      // 1. Intercept API
      cy.intercept("POST", "/api/admin/career-path").as("createCareerPath");
      cy.intercept("GET", "/api/admin/career-path?*").as("getCareerPaths");

      // Gunakan data uji yang berbeda agar tidak konflik
      const asalRole = "Admin to ASPM";
      const tujuanRole1 = "Area Sales & Promotion Repr";
      const tujuanRole2 = "Area Sales & Promotion Spv";
      const tujuanRole3 = "Budget & Controller Spv";

      // 2. Klik tombol Tambah
      cy.contains("button", "Buat Jenjang Karier").click();
      cy.get('div[role="dialog"]')
        .contains("h2", "Buat Jenjang Karier Baru")
        .should("be.visible");

      // 3. Isi Karir Asal
      selectOriginDropdown(asalRole);

      // 4. Isi Tujuan 1
      fillDestinationBlock(0, tujuanRole1, "ALIGN", "SHORT_TERM");

      // 5. Tambah Tujuan 2
      cy.get('div[role="dialog"]').contains("button", "Tambah Tujuan").click();

      // 6. Isi Tujuan 2
      fillDestinationBlock(1, tujuanRole2, "CROSS", "LONG_TERM");

      // 7. Tambah Tujuan 3
      cy.get('div[role="dialog"]').contains("button", "Tambah Tujuan").click();

      // 8. Isi Tujuan 3
      fillDestinationBlock(2, tujuanRole3, "CROSS", "SHORT_TERM");

      // 9. Simpan
      cy.get('div[role="dialog"]')
        .contains('button[type="submit"]', "Simpan")
        .click();

      // 10. Verifikasi sukses
      cy.wait("@createCareerPath");
      cy.get('li[data-sonner-toast][data-type="success"]')
        .should("contain", "Jenjang karier berhasil dibuat.")
        .should("be.visible");
      cy.wait("@getCareerPaths");

      // 11. Verifikasi data (ketiga baris) muncul di tabel
      cy.get('input[placeholder="Search..."]').clear().type(asalRole);
      cy.wait(500);

      cy.log("Verifikasi 3 data baru muncul di tabel");
      cy.contains("td", tujuanRole1).should("be.visible");
      cy.contains("td", tujuanRole2).should("be.visible");
      cy.contains("td", tujuanRole3).should("be.visible");

      // Cleanup (Hapus 3 data tersebut agar tes bisa berulang)
      cy.log("Cleanup 3 data");
      // Hapus data 1
      cy.contains("tr", tujuanRole1)
        .find("button.hover\\:text-red-600")
        .click();
      cy.get('div[role="alertdialog"]').contains("button", "Hapus").click();
      cy.get('li[data-sonner-toast][data-type="success"]').should("be.visible");

      // Hapus data 2
      cy.contains("tr", tujuanRole2)
        .find("button.hover\\:text-red-600")
        .click();
      cy.get('div[role="alertdialog"]').contains("button", "Hapus").click();
      cy.get('li[data-sonner-toast][data-type="success"]').should("be.visible");

      // Hapus data 3
      cy.contains("tr", tujuanRole3)
        .find("button.hover\\:text-red-600")
        .click();
      cy.get('div[role="alertdialog"]').contains("button", "Hapus").click();
      cy.get('li[data-sonner-toast][data-type="success"]').should("be.visible");

      cy.get('input[placeholder="Search..."]').clear();
    });
  });
});
