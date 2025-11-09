// cypress/e2e/admin/positions.cy.ts

describe("Manajemen Posisi (Admin)", () => {
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

    // 5. Navigasi ke halaman Manajemen Posisi
    cy.get('a[href="/admin/positions"]').click();

    // 6. Pastikan halaman selesai loading
    // Judul "Data Posisi" diambil dari HTML yang Anda berikan
    cy.contains("h1", "Data Posisi").should("be.visible");
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
      cy.contains("button", "Buat Posisi").should("be.visible");
    });

    it("harus menampilkan header tabel", () => {
      cy.get("table th").contains("Nama Posisi").should("be.visible");
      cy.get("table th").contains("Level").should("be.visible");
      cy.get("table th").contains("Departemen").should("be.visible");
      cy.get("table th").contains("Cabang").should("be.visible");
      cy.get("table th").contains("Aksi").should("be.visible");
    });
  });

  // --- GRUP 2: Validasi Fungsionalitas Tabel ---
  describe("Validasi Fungsionalitas (Interactions)", () => {
    it("harus bisa memfilter tabel menggunakan [Search]", () => {
      // 1. Cari data spesifik
      cy.get('input[placeholder="Search..."]').type("A & P Admin");
      // Tunggu debounce/loading
      cy.wait(500);

      // 2. Pastikan hanya data yang dicari yang muncul
      cy.get("table tbody tr").should("contain", "A & P Admin");
      // Cek bahwa data di Cabang Bandung (yang namanya sama) juga muncul
      cy.get("table tbody tr").should("contain", "ICBP-Noodle Bandung");

      // 3. Cari data yang tidak ada
      cy.get('input[placeholder="Search..."]')
        .clear()
        .type("Posisi Tidak Dikenal");
      cy.wait(500);
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
      // 1. Verifikasi nilai default adalah 10 dan 10 baris
      cy.contains("Show")
        .next('button[role="combobox"]')
        .should("contain", "10");
      cy.get("table tbody tr").should("have.length", 10);
      cy.contains("Showing 1 to 10 of 3942 entries").should("be.visible");

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
      cy.contains("Showing 1 to 25 of 3942 entries")
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
      cy.contains("Showing 1 to 50 of 3942 entries")
        .scrollIntoView()
        .should("be.visible");
    });

    it("harus bisa mengganti urutan [Sorting] kolom 'Nama Posisi'", () => {
      // 1. Simpan selector sebagai alias
      cy.get("table th").contains("Nama Posisi").as("headerNamaPosisi");

      // 2. Awalnya sorted ascending (panah atas)
      cy.get("@headerNamaPosisi")
        .find("svg.lucide-arrow-up")
        .should("be.visible");
      cy.get("@headerNamaPosisi")
        .find("svg.lucide-arrow-down")
        .should("not.exist");

      // 3. Klik untuk meng-unsort
      cy.get("@headerNamaPosisi").click();
      // PERBAIKAN: Tambahkan wait untuk render ulang
      cy.wait(1000);

      // 4. Verifikasi tidak ada panah (status unsorted)
      cy.get("@headerNamaPosisi")
        .find("svg.lucide-arrow-up")
        .should("not.exist");
      cy.get("@headerNamaPosisi")
        .find("svg.lucide-arrow-down")
        .should("not.exist");

      // 5. Klik lagi untuk sort ascending
      cy.get("@headerNamaPosisi").click();
      // PERBAIKAN: Tambahkan wait untuk render ulang
      cy.wait(1000);

      // 6. Verifikasi panah atas (asc) muncul kembali
      cy.get("@headerNamaPosisi")
        .find("svg.lucide-arrow-up")
        .should("be.visible");
      cy.get("@headerNamaPosisi")
        .find("svg.lucide-arrow-down")
        .should("not.exist");

      // PERBAIKAN: Hapus semua baris kode tambahan yang salah di bawah ini
    });

    it("harus bisa berpindah halaman menggunakan [Paginasi]", () => {
      const paginationText = "Showing 1 to 10 of";
      cy.contains(paginationText).should("be.visible");

      // 1. Klik halaman 2
      cy.contains(paginationText)
        .next() // Pindah ke div pembungkus paginasi
        .find("button")
        .contains("2")
        .click();

      // 2. Cek teks paginasi baru
      cy.contains("Showing 11 to 20 of").should("be.visible");

      // 3. Klik halaman terakhir
      cy.get("button svg.lucide-chevrons-right").parent().click();
      cy.contains("Showing 3941 to 3942 of 3942 entries").should("be.visible");

      // 4. Klik halaman pertama
      cy.get("button svg.lucide-chevrons-left").parent().click();
      cy.contains(paginationText).should("be.visible");
    });
  });
  describe("Validasi Fungsionalitas CRUD (Create, Update, Delete)", () => {
    // =====================================================================================
    // SKENARIO 2: Membuat Posisi Baru (Happy Path)
    // =====================================================================================
    it("seharusnya bisa menambah posisi baru", () => {
      cy.log("Memulai tes pembuatan posisi baru");
      const namaPosisiBaru = "Staff IT Cypress";

      cy.contains("button", "Buat Posisi").click();

      // Gunakan cy.within() untuk memastikan semua perintah dijalankan di dalam modal
      cy.get('[role="dialog"]').within(() => {
        cy.contains("h2", "Buat Posisi Baru").should("be.visible");

        // 1. Isi Nama Posisi
        cy.get('input[placeholder="Contoh: Staff HR"]').type(namaPosisiBaru);

        // 2. Cari berdasarkan label, lalu klik tombol combobox
        cy.contains("label", "Level")
          .parent()
          .find('button[role="combobox"]')
          .click();
      });
      // Klik option di luar 'within' untuk menangani 'portal'
      cy.get('[role="option"]').contains("STAFF").click();

      // Lanjutkan dengan pola yang sama
      cy.get('[role="dialog"]').within(() => {
        cy.contains("label", "Cabang")
          .parent()
          .find('button[role="combobox"]')
          .click();
      });
      cy.get('[role="option"]').contains("ICBP-Noodle Head Office").click();

      cy.get('[role="dialog"]').within(() => {
        const departemenDropdown = cy
          .contains("label", "Departemen")
          .parent()
          .find('button[role="combobox"]');
        departemenDropdown.should("not.be.disabled").click();
      });
      cy.get('[role="option"]').contains("MKT Marketing").click();

      cy.get('[role="dialog"]').within(() => {
        cy.contains("button", "Simpan").click();
      });

      // PERBAIKAN: Gunakan backticks (`) untuk template literal
      cy.contains(`Posisi "${namaPosisiBaru}" telah disimpan.`).should(
        "be.visible"
      );

      // Verifikasi data muncul di tabel
      cy.get('input[placeholder="Search..."]').type(namaPosisiBaru);
      cy.contains("td", namaPosisiBaru).should("be.visible");
    });

    // =====================================================================================
    // SKENARIO 3: Mencari dan Mengubah Semua Data Posisi
    // =====================================================================================
    it("seharusnya bisa mencari posisi dan mengedit semua datanya", () => {
      // --- Data Awal & Data Baru ---
      const namaPosisiLama = "Staff IT Cypress";
      const namaPosisiBaru = "Admin Jual Beli";
      const levelBaru = "MANAGER";
      const cabangBaru = "ICBP-Noodle DKI";
      const departemenBaru = "ADM HR";

      // 1. Cari posisi yang ingin diedit
      cy.get('input[placeholder="Search..."]').type(namaPosisiLama);
      cy.contains("td", namaPosisiLama).should("be.visible");

      // 2. Klik tombol edit (tombol pertama di baris)
      cy.contains("td", namaPosisiLama)
        .parent("tr")
        .find("button")
        .first()
        .click();

      // 3. Lakukan perubahan di dalam modal
      cy.get('[role="dialog"]').within(() => {
        cy.contains("h2", "Edit Posisi").should("be.visible");
        cy.get('input[placeholder="Contoh: Staff HR"]')
          .clear()
          .type(namaPosisiBaru);

        // Klik pemicu dropdown di dalam modal
        cy.contains("label", "Level")
          .parent()
          .find('button[role="combobox"]')
          .click();
      });
      // Klik pilihan di luar 'within'
      cy.get('[role="option"]').contains(levelBaru).click();

      // Ulangi pola yang sama untuk dropdown lainnya
      cy.get('[role="dialog"]').within(() => {
        cy.contains("label", "Cabang")
          .parent()
          .find('button[role="combobox"]')
          .click();
      });
      cy.get('[role="option"]').contains(cabangBaru).click();

      cy.get('[role="dialog"]').within(() => {
        const departemenDropdown = cy
          .contains("label", "Departemen")
          .parent()
          .find('button[role="combobox"]');
        departemenDropdown
          .should("not.be.disabled", { timeout: 10000 })
          .click();
      });
      cy.get('[role="option"]').contains(departemenBaru).click();

      // Simpan perubahan di dalam modal
      cy.get('[role="dialog"]').within(() => {
        cy.contains("button", "Simpan").click();
      });

      // 4. Verifikasi notifikasi dan data di tabel
      // PERBAIKAN: Gunakan backticks (`) untuk template literal
      cy.contains(`Posisi "${namaPosisiBaru}" telah disimpan.`).should(
        "be.visible"
      );

      // Verifikasi data di tabel sudah ter-update
      cy.get('input[placeholder="Search..."]').clear().type(namaPosisiBaru);
      cy.contains("td", namaPosisiBaru)
        .parent("tr")
        .within(() => {
          cy.contains(levelBaru).should("be.visible");
          cy.contains(cabangBaru).should("be.visible");
          cy.contains(departemenBaru).should("be.visible");
        });
    });

    // =====================================================================================
    // SKENARIO 4: Mencari dan Menghapus Posisi
    // =====================================================================================
    it("seharusnya bisa mencari posisi lalu menghapusnya", () => {
      cy.log("Memulai tes penghapusan data");
      const namaPosisiTarget = "Admin Jual Beli";

      // 1. Cari posisi yang ingin dihapus
      cy.get('input[placeholder="Search..."]').type(namaPosisiTarget);
      cy.contains("td", namaPosisiTarget).should("be.visible");

      // 2. Klik tombol hapus (tombol terakhir di baris)
      cy.contains("td", namaPosisiTarget)
        .parent("tr")
        .find("button")
        .last()
        .click();

      // 3. Gunakan cy.within() untuk berinteraksi di dalam dialog
      cy.get('[role="alertdialog"]').within(() => {
        // PERBAIKAN: Judul dialog yang benar adalah "Konfirmasi Hapus"
        cy.contains("h2", "Apakah Anda yakin?").should("be.visible");

        // Klik tombol Hapus di dalam dialog
        cy.contains("button", "Hapus").click();
      });

      // 4. Verifikasi notifikasi dan pastikan data hilang
      cy.log("Memverifikasi hasil penghapusan");
      cy.contains("Posisi berhasil dihapus").should("be.visible");

      // Pastikan tabel kembali ke "No results found" untuk pencarian ini
      cy.contains("td", namaPosisiTarget).should("not.exist");
      cy.contains("No results found.").should("be.visible");
    });
  });
});
