// cypress/e2e/admin/job-vacant.cy.ts

describe("Admin - Manajemen Lowongan Pekerjaan", () => {
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

    // 5. Navigasi ke halaman Lowongan Pekerjaan
    // Asumsi link navigasi ada di sidebar
    cy.get('a[href="/admin/job-vacancies"]').click();

    // 6. Pastikan halaman selesai loading dan judulnya benar
    cy.contains("h1", "Manajemen Lowongan Pekerjaan").should("be.visible");
  });

  // --- GRUP 1: Validasi Tampilan Awal (Display) ---
  describe("Validasi Tampilan (Display)", () => {
    it("harus menampilkan judul halaman dan semua kontrol tabel", () => {
      // Judul
      cy.contains("h1", "Manajemen Lowongan Pekerjaan").should("be.visible");

      // Kontrol Tabel
      cy.contains("span", "Show").next("button").should("contain", "10");
      cy.get('input[placeholder="Search..."]').should("be.visible");
      cy.contains("button", "Filter").should("be.visible");
      cy.contains("button", "Sinkronisasi Posisi Pensiun").should("be.visible");
      cy.contains("button", "Buat Lowongan").should("be.visible");
    });

    it("harus menampilkan header tabel dengan benar", () => {
      // Header Tabel
      const headers = ["Job Role", "Status", "Peminat", "Aksi"];
      headers.forEach((header) => {
        cy.get("table th").contains(header).should("be.visible");
      });
    });
  });

  // --- GRUP 2: Validasi Fungsionalitas (Interactions) ---
  describe("Validasi Fungsionalitas (Interactions)", () => {
    it("harus bisa mengubah jumlah [Show entries] per halaman", () => {
      // 1. Verifikasi nilai default adalah 10 dan <=10 baris
      cy.contains("Show")
        .next('button[role="combobox"]')
        .as("selectShow")
        .should("contain", "10");
      cy.get("table tbody tr")
        .should("have.length.at.least", 1)
        .and("have.length.at.most", 10);

      // 2. Ubah ke 25
      cy.get("@selectShow").click();
      cy.get('div[role="option"]').contains("25").click();
      cy.wait(500);

      cy.get("@selectShow").should("contain", "25");
      cy.get("table tbody tr")
        .should("have.length.at.least", 1)
        .and("have.length.at.most", 25);

      // 3. Ubah ke 50
      cy.get("@selectShow").click();
      cy.get('div[role="option"]').contains("50").click();
      cy.wait(500);

      cy.get("@selectShow").should("contain", "50");
      cy.get("table tbody tr")
        .should("have.length.at.least", 1)
        .and("have.length.at.most", 50);
    });

    it("harus bisa memfilter tabel menggunakan [Search]", () => {
      const searchInput = cy.get('input[placeholder="Search..."]');

      // 1. Cari data spesifik
      const searchTerm = "A & P Coord";
      searchInput.type(searchTerm);
      cy.wait(500);
      cy.get("table tbody tr").should("have.length", 1);
      cy.get("table tbody").contains("td", searchTerm).should("be.visible");

      // 2. Cari data yang tidak ada
      searchInput.clear().type("XYZ_TIDAK_ADA_DATA");
      cy.wait(500);
      cy.contains("No results found.").should("be.visible"); // Asumsi pesan ini muncul

      // 3. Hapus search
      searchInput.clear();
      cy.wait(500);
      cy.get("table tbody tr").should("have.length.gt", 1);
    });

    it("harus bisa memfilter tabel berdasarkan [Status]", () => {
      // *** PERBAIKAN ***
      // Gunakan data statis dari tes "Validasi Tampilan"
      const publishedJob = "Marketing EDP Spv";

      // --- Helper ---
      const selectFilterOption = (optionText: string) => {
        cy.get('div[role="dialog"][data-slot="popover-content"]').within(() => {
          cy.contains("label", "Status")
            .next('button[role="combobox"]')
            .click({ force: true });
        });
        // Opsi (Published/Draft) muncul di root body
        cy.get('div[role="option"]').contains(optionText).click();
      };

      const applyFilter = () => {
        cy.get('div[role="dialog"][data-slot="popover-content"]').within(() => {
          cy.contains("button", "Terapkan Filter").click();
        });
        cy.wait(500); // Tunggu data reload
      };

      const resetFilter = () => {
        cy.get('div[role="dialog"][data-slot="popover-content"]').within(() => {
          cy.contains("button", "Reset").click();
        });
        cy.wait(500); // Tunggu data reload
      };

      // --- Skenario 1: Filter "Published" ---
      cy.log("Skenario 1: Filter Status Published");
      cy.contains("button", "Filter").click();
      selectFilterOption("Published");
      applyFilter();

      // Verifikasi: Tombol filter aktif
      cy.contains("button", "Filter").should("have.class", "bg-primary");

      // Verifikasi: Semua baris di tabel harus "Published"
      cy.get("table tbody").then(($tbody) => {
        if ($tbody.text().includes("No results found")) {
          cy.contains("No results found.").should("be.visible");
        } else {
          cy.get("table tbody tr").each(($row) => {
            cy.wrap($row).contains("span", "Published").should("be.visible");
          });
        }
      });

      // --- Skenario 2: Filter "Draft" ---
      cy.log("Skenario 2: Filter Status Draft");
      cy.contains("button", "Filter").click(); // Buka popover lagi
      selectFilterOption("Draft");
      applyFilter();

      // Verifikasi: Semua baris di tabel harus "Draft" (jika ada)
      // dan data "Published" (A & P Admin) tidak boleh ada
      cy.get("table tbody").then(($tbody) => {
        if ($tbody.text().includes("No results found")) {
          cy.contains("No results found.").should("be.visible");
        } else {
          cy.get("table tbody tr").each(($row) => {
            cy.wrap($row).contains("span", "Draft").should("be.visible");
          });
        }
      });

      // --- Skenario 3: Reset Filter ---
      cy.log("Skenario 3: Reset Filter");
      cy.contains("button", "Filter").click(); // Buka popover lagi
      resetFilter();

      // Verifikasi: Tombol filter kembali non-aktif
      cy.contains("button", "Filter").should("not.have.class", "bg-primary");
    });

    // it("harus bisa berpindah halaman menggunakan [Paginasi]", () => {
    //   // 1. Verifikasi Halaman 1
    //   cy.contains("Showing 1 to 10 of 35 entries").should("be.visible");
    //   cy.contains("button", /^1$/).should("have.class", "bg-primary");
    //   cy.get("button svg.lucide-chevrons-left").parent().should("be.disabled");

    //   // 2. Klik halaman 2
    //   cy.contains("button", /^2$/).click();
    //   cy.wait(500);
    //   cy.contains("Showing 11 to 20 of 35 entries").should("be.visible");
    //   cy.contains("button", /^2$/).should("have.class", "bg-primary");

    //   // 3. Klik halaman terakhir (Tombol >>)
    //   cy.get("button svg.lucide-chevrons-right").parent().click();
    //   cy.wait(500);
    //   cy.contains("Showing 31 to 35 of 35 entries").should("be.visible");
    //   cy.contains("button", /^4$/).should("have.class", "bg-primary");
    //   cy.get("button svg.lucide-chevrons-right").parent().should("be.disabled");
    // });
    it("harus bisa melihat detail lowongan (klik tombol mata) dan kembali", () => {
      const jobRole = "Marketing EDP Spv";
      const jobDesc = "Lowongan untuk Marketing EDP Spv";

      // 1. Cari data
      cy.get('input[placeholder="Search..."]').clear().type(jobRole);
      cy.wait(500);

      // 2. Klik tombol lihat (mata)
      cy.get("table tbody")
        .contains("tr", jobRole)
        .find("button svg.lucide-eye") // Selector untuk ikon mata
        .parent() // Ambil parent <button>
        .click();

      // 3. Verifikasi pindah halaman
      cy.url().should("include", "/admin/job-vacancies/");
      cy.url().should(
        "not.eq",
        Cypress.config().baseUrl + "/admin/job-vacancies"
      );

      // 4. Verifikasi konten halaman detail (berdasarkan HTML baru)
      cy.log("Verifikasi halaman detail lowongan");

      // Cek Judul Job Role
      cy.get('div[data-slot="card-title"].font-semibold.text-2xl')
        .contains(jobRole)
        .should("be.visible");

      // Cek Deskripsi
      cy.get('div[data-slot="card-description"]')
        .contains(jobDesc)
        .should("be.visible");

      // Cek Badge Status
      cy.get('span[data-slot="badge"]')
        .contains("Published")
        .should("be.visible");

      // Cek Kartu KPI
      cy.contains("div[data-slot='card-title']", "Total Peminat")
        .should("be.visible")
        .parent() // Ke card-header
        .next("div[data-slot='card-content']"); // Ke card-content

      cy.contains("div[data-slot='card-title']", "Bersedia Relokasi")
        .should("be.visible")
        .parent()
        .next("div[data-slot='card-content']");

      // Cek Tabel Peminat
      cy.get('div[data-slot="card-title"]')
        .contains("Daftar Peminat")
        .should("be.visible");

      // 5. Klik tombol "Kembali"
      cy.contains("button", "Kembali").click();

      // 6. Verifikasi kembali ke halaman utama
      cy.url().should("eq", Cypress.config().baseUrl + "/admin/job-vacancies");
      cy.contains("h1", "Manajemen Lowongan Pekerjaan").should("be.visible");
    });

    it("harus membuka modal [Sinkronisasi Posisi Pensiun]", () => {
      cy.contains("button", "Sinkronisasi Posisi Pensiun").click();

      // Asumsi modal sinkronisasi muncul (berdasarkan tes sebelumnya)
      cy.get('div[role="dialog"]')
        .contains("h2", "Sinkronisasi Posisi Pensiun") // Asumsi judul modal
        .should("be.visible");

      // Tutup modal
      cy.get('div[role="dialog"]')
        .find('button[data-slot="dialog-close"]') // Tombol X
        .click();
      cy.get('div[role="dialog"]').should("not.exist");
    });
  });
  // cypress/e2e/admin/job-vacancies.cy.ts

  // ... (Blok describe 'Admin - Manajemen Lowongan Pekerjaan' dan 'Validasi Tampilan' dan 'Validasi Fungsionalitas (Interactions)' tetap di atas) ...

  // --- GRUP 3: Validasi Fungsionalitas Read dan Update ---
  describe("Validasi Fungsionalitas Read dan Update", () => {
    // --- Data Uji (berdasarkan HTML yang Anda berikan) ---
    const dataAwal = {
      role: "Marketing EDP Spv",
      desc: "Lowongan untuk Marketing EDP Spv",
      status: "Published",
      state: "checked",
    };

    const dataEdit = {
      role: "SHE Spv",
      desc: "Deskripsi telah diubah oleh tes otomatis Cypress.",
      status: "Draft",
      state: "unchecked",
    };

    /**
     * Helper untuk memilih dropdown di dalam MODAL EDIT.
     * @param label Teks label (e.g., "Job Role")
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
     */
    const saveEditChanges = () => {
      cy.intercept("PUT", "/api/admin/job-vacancies/*").as("updateVacancy");
      cy.intercept("GET", "/api/admin/job-vacancies?*").as("getVacancies");

      cy.get('div[role="dialog"]').within(() => {
        cy.contains('button[type="submit"]', "Simpan").click();
      });

      cy.wait("@updateVacancy");
      cy.get('li[data-sonner-toast][data-type="success"]')
        .should("contain", "Lowongan berhasil diperbarui") // Asumsi pesan sukses
        .should("be.visible");
      cy.wait("@getVacancies");
    };

    it("harus bisa mengedit lowongan (Deskripsi, Status, dan Job Role)", () => {
      // --- Skenario 1: Edit Deskripsi & Un-publish (Published -> Draft) ---
      cy.log("--- Skenario 1: Edit Deskripsi & Ubah status ke Draft ---");

      // 1. Cari data awal
      cy.get('input[placeholder="Search..."]').clear().type(dataAwal.role);
      cy.wait(500);

      // 2. Klik tombol edit
      cy.get("table tbody")
        .contains("tr", dataAwal.role)
        .find("button svg.lucide-square-pen") // Ikon Edit
        .parent()
        .click();

      // 3. Verifikasi data di dalam modal
      cy.contains("h2", "Edit Lowongan").should("be.visible");
      cy.get('textarea[name="description"]').should(
        "have.value",
        dataAwal.desc
      );
      cy.get('button[role="switch"]').should(
        "have.attr",
        "data-state",
        dataAwal.state
      );

      // 4. Lakukan Edit (Deskripsi dan Status)
      cy.get('textarea[name="description"]').clear().type(dataEdit.desc);
      cy.get('button[role="switch"]').click(); // Un-publish

      // 5. Simpan
      saveEditChanges();

      // 6. Verifikasi perubahan di tabel
      cy.get('input[placeholder="Search..."]').clear().type(dataAwal.role);
      cy.wait(500);
      cy.get("table tbody")
        .contains("tr", dataAwal.role)
        .contains("span", dataEdit.status) // Status "Draft"
        .should("be.visible");

      // --- Skenario 2: Edit Job Role & Re-publish (Draft -> Published) ---
      cy.log("--- Skenario 2: Edit Job Role & Ubah status ke Published ---");

      // 1. Buka modal edit lagi
      cy.get("table tbody")
        .contains("tr", dataAwal.role)
        .find("button svg.lucide-square-pen") // Ikon Edit
        .parent()
        .click();

      // 2. Verifikasi data (hasil editan skenario 1)
      cy.contains("h2", "Edit Lowongan").should("be.visible");
      cy.get('textarea[name="description"]').should(
        "have.value",
        dataEdit.desc
      );
      cy.get('button[role="switch"]').should(
        "have.attr",
        "data-state",
        dataEdit.state
      );

      // 3. Lakukan Edit (Job Role dan Status)
      selectEditDropdown("Job Role", dataEdit.role); // Ubah ke "SHE Spv"
      cy.get('button[role="switch"]').click(); // Re-publish

      // 4. Simpan
      saveEditChanges();

      // 5. Verifikasi perubahan di tabel
      cy.get('input[placeholder="Search..."]').clear().type(dataEdit.role);
      cy.wait(500);
      // Data baru ("SHE Spv") harus ada
      cy.get("table tbody")
        .contains("tr", dataEdit.role)
        .contains("span", dataAwal.status) // Status "Published"
        .should("be.visible");

      // Data lama ("IR Staff") harus hilang
      cy.get('input[placeholder="Search..."]').clear().type(dataAwal.role);
      cy.wait(500);
      cy.get("table tbody").contains(dataAwal.role).should("not.exist");

      // --- Skenario 3: Cleanup (Kembalikan data seperti semula) ---
      cy.log("--- Skenario 3: Cleanup (Kembalikan data) ---");
      // 1. Buka modal edit "SHE Spv"
      cy.get('input[placeholder="Search..."]').clear().type(dataEdit.role);
      cy.wait(500);
      cy.get("table tbody")
        .contains("tr", dataEdit.role)
        .find("button svg.lucide-square-pen") // Ikon Edit
        .parent()
        .click();

      // 2. Kembalikan semua data
      selectEditDropdown("Job Role", dataAwal.role); // Kembalikan ke "IR Staff"
      cy.get('textarea[name="description"]').clear().type(dataAwal.desc);
      // Status sudah "checked" (Published), jadi tidak perlu diklik

      // 3. Simpan
      saveEditChanges();

      // 4. Verifikasi data kembali normal
      cy.get('input[placeholder="Search..."]').clear().type(dataAwal.role);
      cy.wait(500);
      cy.get("table tbody")
        .contains("tr", dataAwal.role)
        .contains("span", dataAwal.status) // Status "Published"
        .should("be.visible");

      // Hapus pencarian
      cy.get('input[placeholder="Search..."]').clear();
    });
  });
});
