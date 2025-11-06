// cypress/e2e/admin/employees.cy.ts

describe("Admin - Manajemen Data Karyawan", () => {
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

    // 5. Navigasi ke halaman Data Karyawan
    cy.get('a[href="/admin/employees"]').click();

    // 6. Pastikan halaman selesai loading dan judulnya benar
    cy.contains("h1", "Data Karyawan").should("be.visible");
  });

  // --- GRUP 1: Validasi Tampilan Awal (Display) ---
  describe("Validasi Tampilan (Display)", () => {
    it("harus menampilkan judul halaman dan semua kontrol tabel", () => {
      // Judul
      cy.contains("h1", "Data Karyawan").should("be.visible");

      // Kontrol Tabel
      cy.contains("span", "Show").next("button").should("contain", "10");
      cy.get('input[placeholder="Search..."]').should("be.visible");
      cy.contains("button", "Filter").should("be.visible");
      cy.contains("button", "Sinkronisasi Data").should("be.visible");
      cy.contains("button", "Tambah Karyawan").should("be.visible");
    });

    it("harus menampilkan header tabel dengan benar", () => {
      // Header Tabel
      const headers = ["ID", "Nama", "Posisi", "Departemen", "Cabang", "Aksi"];
      headers.forEach((header) => {
        cy.get("table th").contains(header).should("be.visible");
      });
    });
  });

  // --- GRUP 2: Validasi Fungsionalitas (Interactions) ---
  describe("Validasi Fungsionalitas (Interactions)", () => {
    it("harus bisa mengubah jumlah [Show entries] per halaman", () => {
      // 1. Verifikasi nilai default adalah 10 dan 10 baris
      cy.contains("Show")
        .next('button[role="combobox"]')
        .as("selectShow") // Gunakan alias untuk kemudahan
        .should("contain", "10");

      cy.get("table tbody tr").should("have.length", 10);
      // Verifikasi total entri dari HTML Data Karyawan
      cy.contains("Showing 1 to 10 of 1632 entries").should("be.visible");

      // 2. Buka dropdown
      cy.get("@selectShow").click();

      // 3. Klik opsi "25"
      cy.get('div[role="option"]').contains("25").click();
      cy.wait(1000); // Tunggu data reload

      // 4. Verifikasi nilai berubah ke 25 dan 25 baris
      cy.get("@selectShow").should("contain", "25");
      // Asumsi API mengembalikan 25 baris
      cy.get("table tbody tr").should("have.length", 25);
      // Verifikasi info paginasi diperbarui
      cy.contains("Showing 1 to 25 of 1632 entries")
        .scrollIntoView()
        .should("be.visible");

      // 5. Buka dropdown lagi
      cy.get("@selectShow").click();

      // 6. Klik opsi "50"
      cy.get('div[role="option"]').contains("50").click();
      cy.wait(1000); // Tunggu data reload

      // 7. Verifikasi nilai berubah ke 50 dan 50 baris
      cy.get("@selectShow").should("contain", "50");
      // Asumsi API mengembalikan 50 baris
      cy.get("table tbody tr").should("have.length", 50);
      // Verifikasi info paginasi diperbarui
      cy.contains("Showing 1 to 50 of 1632 entries")
        .scrollIntoView()
        .should("be.visible");
    });
    it("harus bisa memfilter tabel menggunakan [Search] di berbagai kolom", () => {
      // Dapatkan input pencarian
      const searchInput = cy.get('input[placeholder="Search..."]');

      // Fungsi helper aman untuk verifikasi hasil pencarian
      const verifyColumnContains = (colIndex: number, text: string) => {
        cy.get("table tbody").then(($tbody) => {
          if ($tbody.text().includes("No results found")) {
            cy.contains("No results found.").should("be.visible");
          } else {
            // Lakukan query ulang tiap baris agar tidak 'detached'
            cy.get("table tbody tr").each(($row, index) => {
              cy.get("table tbody tr")
                .eq(index)
                .find("td")
                .eq(colIndex)
                .should("contain.text", text);
            });
          }
        });
      };

      // --- Skenario 1: Pencarian berdasarkan ID Jabatan (Kolom 0) ---
      const idJabatan = "401467";
      cy.log(`Mencari berdasarkan ID Jabatan: ${idJabatan}`);
      searchInput.clear().type(idJabatan);
      cy.wait(500);
      verifyColumnContains(0, idJabatan);

      // --- Skenario 2: Pencarian berdasarkan Nama Karyawan (Kolom 1) ---
      const namaKaryawan = "Yusneli";
      cy.log(`Mencari berdasarkan Nama Karyawan: ${namaKaryawan}`);
      searchInput.clear().type(namaKaryawan);
      cy.wait(500);
      verifyColumnContains(1, namaKaryawan);

      // --- Skenario 3: Pencarian berdasarkan Posisi (Kolom 2) ---
      const posisi = "Security Grp Leader";
      cy.log(`Mencari berdasarkan Posisi: ${posisi}`);
      searchInput.clear().type(posisi);
      cy.wait(500);
      verifyColumnContains(2, posisi);

      // --- Skenario 4: Pencarian berdasarkan Departemen (Kolom 3) ---
      const departemen = "ADM HR";
      cy.log(`Mencari berdasarkan Departemen: ${departemen}`);
      searchInput.clear().type(departemen);
      cy.wait(500);
      verifyColumnContains(3, departemen);

      // --- Skenario 5: Pencarian Teks Tidak Dikenal ---
      cy.log("Mencari berdasarkan Teks Tidak Dikenal");
      searchInput.clear().type("Posisi Tidak Dikenal");
      cy.wait(500);
      cy.contains("No results found.").should("be.visible");

      // Bersihkan input, pastikan data kembali muncul
      searchInput.clear();
      cy.wait(500);
      cy.get("table tbody tr").should("have.length.gt", 1);
    });

    it("harus bisa berpindah halaman menggunakan [Paginasi]", () => {
      // (Data dari HTML Data Karyawan: 1632 entries)
      const initialPaginationText = "Showing 1 to 10 of 1632 entries";

      // 1. Verifikasi status awal (Halaman 1)
      cy.log("State 1: Verifikasi Halaman 1");
      cy.contains(initialPaginationText).should("be.visible");

      cy.contains("button", /^1$/).should("have.class", "bg-primary");
      // -----------------

      cy.get("button svg.lucide-chevrons-left").parent().should("be.disabled");

      // 2. Klik halaman 2
      cy.log("State 2: Klik Halaman 2");
      // --- PERBAIKAN ---
      // Terapkan hal yang sama untuk tombol "2"
      cy.contains("button", /^2$/).click();
      // -----------------
      cy.wait(500); // Tunggu data reload

      // 3. Verifikasi status Halaman 2
      cy.log("State 3: Verifikasi Halaman 2");
      cy.contains("Showing 11 to 20 of 1632 entries").should("be.visible");
      // --- PERBAIKAN ---
      cy.contains("button", /^2$/).should("have.class", "bg-primary");
      cy.contains("button", /^1$/).should("not.have.class", "bg-primary");
      // -----------------
      cy.get("button svg.lucide-chevrons-left")
        .parent()
        .should("not.be.disabled");

      // 4. Klik halaman terakhir (Tombol >>)
      cy.log("State 4: Klik Halaman Terakhir (>>)");
      cy.get("button svg.lucide-chevrons-right").parent().click();
      cy.wait(1000); // Tunggu data reload

      // 5. Verifikasi Halaman Terakhir (Halaman 164 untuk 1632 data)
      cy.log("State 5: Verifikasi Halaman Terakhir (Halaman 164)");
      cy.contains("Showing 1631 to 1632 of 1632 entries").should("be.visible");
      cy.get("button svg.lucide-chevrons-right").parent().should("be.disabled");
      cy.get("button svg.lucide-chevrons-left")
        .parent()
        .should("not.be.disabled");

      // 6. Klik halaman pertama (Tombol <<)
      cy.log("State 6: Klik Halaman Pertama (<<)");
      cy.get("button svg.lucide-chevrons-left").parent().click();
      cy.wait(1000); // Tunggu data reload

      // 7. Verifikasi kembali ke Halaman 1
      cy.log("State 7: Verifikasi kembali ke Halaman 1");
      cy.contains(initialPaginationText).should("be.visible");
      // --- PERBAIKAN ---
      cy.contains("button", /^1$/).should("have.class", "bg-primary");
      // -----------------
      cy.get("button svg.lucide-chevrons-left").parent().should("be.disabled");
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
      cy.get('div[role="option"]').contains("ICBP-Noodle Semarang").click();

      // 5. Terapkan filter [Departemen]
      cy.get('div[role="dialog"]').within(() => {
        // Masuk lagi ke .within()
        cy.contains("label", "Departemen")
          .next('button[role="combobox"]')
          .click();
      }); // <-- Keluar dari .within() lagi

      // 6. Pilih (ADM HR)
      cy.get('div[role="option"]').contains("R&D QC/QA").click();

      // 7. Klik Terapkan
      cy.get('div[role="dialog"]').within(() => {
        // Masuk lagi ke .within()
        cy.contains("button", "Terapkan Filter").click();
      });

      cy.wait(500); // Tunggu data reload

      // 8. Verifikasi semua data di tabel
      cy.get("table tbody tr").each(($row) => {
        cy.wrap($row).find("td").eq(3).should("contain", "R&D QC/QA"); // Kolom Departemen
        cy.wrap($row)
          .find("td")
          .eq(4)
          .should("contain", "ICBP-Noodle Semarang"); // Kolom Cabang
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

    it("harus membuka modal [Tambah Karyawan] saat tombol diklik", () => {
      cy.contains("button", "Tambah Karyawan").click();

      // Asumsi: Membuka modal dialog untuk menambah data
      cy.get('div[role="dialog"]').within(() => {
        cy.contains("h2", "Tambah Karyawan").should("be.visible");
        cy.contains("label", "ID Karyawan").should("be.visible");
        // Tutup modal
        cy.get('button[data-slot="dialog-close"]').click();
      });
      cy.get('div[role="dialog"]').should("not.exist");
    });

    it("harus membuka modal [Edit Karyawan] saat tombol Aksi Edit diklik", () => {
      // 1. Cari baris untuk karyawan "A. Soleh"
      cy.contains("tr", "A. Soleh")
        .find("button.hover\\:text-primary") // Selector untuk tombol edit
        .click();

      // 2. Verifikasi modal edit muncul dengan data yang sudah terisi
      cy.get('div[role="dialog"]').within(() => {
        cy.contains("h2", "Edit Karyawan").should("be.visible");
        // Cek apakah input ID Karyawan berisi data yang benar dan disabled
        cy.get('input[name="employeeId"]')
          .should("have.value", "700961")
          .and("be.disabled");
        cy.get('input[name="fullName"]').should("have.value", "A. Soleh");
        // Tutup modal
        cy.get('button[data-slot="dialog-close"]').click();
      });
    });

    it("harus menampilkan dialog konfirmasi [Hapus] saat tombol Aksi Hapus diklik", () => {
      // 1. Cari baris untuk karyawan "Aan Andriani"
      cy.contains("tr", "Aan Andriani")
        .find("button.hover\\:text-red-600") // Selector untuk tombol hapus
        .click();

      // 2. Verifikasi alert dialog konfirmasi muncul
      cy.get('div[role="alertdialog"]').within(() => {
        cy.contains("h2", "Apakah Anda yakin?").should("be.visible");
        cy.contains(
          "p",
          "Tindakan ini akan menghapus karyawan: Aan Andriani."
        ).should("be.visible");

        // 3. Klik batal untuk menutup dialog
        cy.contains("button", "Batal").click();
      });

      // 4. Pastikan dialog hilang dan data masih ada
      cy.get('div[role="alertdialog"]').should("not.exist");
      cy.contains("td", "Aan Andriani").should("be.visible");
    });
  });
  // --- GRUP 3: Validasi Fungsionalitas CRUD (Create, Update, Delete) ---
  describe("Validasi Fungsionalitas CRUD (Create, Update, Delete)", () => {
    // Data yang akan digunakan untuk pengetesan
    const testData = {
      nama: "Test Karyawan 1",
      id: "210100",
      gender: "MALE", // Mapping "Laki-laki" ke "MALE" sesuai HTML
      tglLahir: "2000-01-01", // Format YYYY-MM-DD untuk input[type="date"]
      tglMasuk: "2023-01-01", // Format YYYY-MM-DD
      pendidikan: "S1",
      universitas: "Test University",
      jurusan: "Teknik Komputer",
      cabang: "ICBP-Noodle Semarang",
      departemen: "MKT Marketing",
      posisi: "A & P Staff",
      level: "STAFF",
    };
    const namaEdit = "Test Karyawan 1 (Edited)";

    // Helper untuk memilih opsi dropdown kustom (combobox)
    const selectDropdownOption = (label: string, optionText: string) => {
      cy.get('div[role="dialog"]').within(() => {
        cy.contains("label", label)
          .next('button[role="combobox"]')
          .click({ force: true }); // Gunakan force jika ada elemen lain yg menghalangi
      });
      // Opsi dropdown muncul di root body
      cy.get('div[role="option"]').contains(optionText).click();
    };

    it("harus bisa menambah data karyawan baru", () => {
      // 1. Intercept API call
      cy.intercept("POST", "/api/admin/employees").as("createEmployee");
      cy.intercept("GET", "/api/admin/employees?*").as(
        "getEmployeesAfterCreate"
      );

      // 2. Klik tombol Tambah Karyawan
      cy.contains("button", "Tambah Karyawan").click();

      // 3. Pastikan modal muncul
      cy.get('div[role="dialog"]')
        .contains("h2", "Tambah Karyawan Baru")
        .should("be.visible");

      // 4. Isi form di dalam modal
      cy.get('div[role="dialog"]').within(() => {
        cy.get('input[name="fullName"]').type(testData.nama);
        cy.get('input[name="employeeId"]').type(testData.id);
        cy.get('input[name="dateOfBirth"]').type(testData.tglLahir);
        cy.get('input[name="hireDate"]').type(testData.tglMasuk);
        cy.get('input[name="lastEducationSchool"]').type(testData.universitas);
        cy.get('input[name="lastEducationMajor"]').type(testData.jurusan);
      });

      // 5. Isi semua dropdown (combobox)
      // (Fungsi helper dipanggil di luar .within() karena dropdown option ada di body)
      selectDropdownOption("Jenis Kelamin", testData.gender);
      selectDropdownOption("Pendidikan Terakhir", testData.pendidikan);
      selectDropdownOption("Cabang", testData.cabang);

      cy.wait(500); // Tunggu departemen load
      selectDropdownOption("Departemen", testData.departemen);

      cy.wait(500); // Tunggu posisi load
      selectDropdownOption("Posisi", testData.posisi);

      selectDropdownOption("Level", testData.level);

      // 6. Klik Simpan
      cy.get('div[role="dialog"]').within(() => {
        cy.contains("button", "Simpan").click();
      });

      // 7. Verifikasi sukses (sesuai permintaan Anda)
      cy.wait("@createEmployee");
      // *** FIX: Gunakan selector spesifik untuk toast sukses ***
      cy.get('li[data-sonner-toast][data-type="success"]')
        .should("contain", "Karyawan berhasil dibuat")
        .should("be.visible");
      cy.wait("@getEmployeesAfterCreate");

      // 8. Verifikasi data baru ada di tabel (cek melalui pencarian)
      cy.get('input[placeholder="Search..."]').type(testData.id);
      cy.wait(500);
      cy.get("table tbody").contains("td", testData.nama).should("be.visible");
      cy.get("table tbody")
        .contains("td", testData.posisi)
        .should("be.visible");

      // 9. Bersihkan search
      cy.get('input[placeholder="Search..."]').clear();
    });
    it("harus gagal menambah data karyawan jika ID sudah ada", () => {
      // 1. Intercept API call
      cy.intercept("POST", "/api/admin/employees").as(
        "createDuplicateEmployee"
      );

      // 2. Klik tombol Tambah Karyawan
      cy.contains("button", "Tambah Karyawan").click();

      // 3. Pastikan modal muncul
      cy.get('div[role="dialog"]')
        .contains("h2", "Tambah Karyawan Baru")
        .should("be.visible");

      // 4. Isi form di dalam modal dengan ID yang sama
      // Gunakan nama yang berbeda untuk membedakan, tapi ID yang sama
      const duplicateName = testData.nama + " Duplikat";
      cy.get('div[role="dialog"]').within(() => {
        cy.get('input[name="fullName"]').type(duplicateName);
        cy.get('input[name="employeeId"]').type(testData.id); // <-- ID yang sama
        cy.get('input[name="dateOfBirth"]').type(testData.tglLahir);
        cy.get('input[name="hireDate"]').type(testData.tglMasuk);
        cy.get('input[name="lastEducationSchool"]').type(testData.universitas);
        cy.get('input[name="lastEducationMajor"]').type(testData.jurusan);
      });

      // 5. Isi semua dropdown (combobox)
      selectDropdownOption("Jenis Kelamin", testData.gender);
      selectDropdownOption("Pendidikan Terakhir", testData.pendidikan);
      selectDropdownOption("Cabang", testData.cabang);

      cy.wait(500); // Tunggu departemen load
      selectDropdownOption("Departemen", testData.departemen);

      cy.wait(500); // Tunggu posisi load
      selectDropdownOption("Posisi", testData.posisi);

      selectDropdownOption("Level", testData.level);

      // 6. Klik Simpan
      cy.get('div[role="dialog"]').within(() => {
        cy.contains("button", "Simpan").click();
      });

      // 7. Verifikasi error
      cy.wait("@createDuplicateEmployee");
      // Asumsi: Toast error akan muncul
      cy.get('li[data-sonner-toast][data-type="error"]')
        .should("contain", "ID Karyawan sudah digunakan.") // Asumsi pesan error
        .should("exist");

      // 8. Pastikan modal masih terbuka
      cy.get('div[role="dialog"]')
        .contains("h2", "Tambah Karyawan Baru")
        .should("be.visible");

      // 9. Tutup modal untuk cleanup
      cy.get('div[role="dialog"]').within(() => {
        // Klik tombol Batal atau tombol Close [X]
        cy.get('button[data-slot="dialog-close"]').click();
      });

      cy.get('div[role="dialog"]').should("not.exist");
    });
    it("harus bisa mengedit data karyawan", () => {
      // 1. Intercept API call (Asumsi ID Karyawan ada di URL)
      cy.intercept("PUT", `/api/admin/employees/${testData.id}`).as(
        "updateEmployee"
      );
      cy.intercept("GET", "/api/admin/employees?*").as(
        "getEmployeesAfterUpdate"
      );

      // 2. Cari data yang baru dibuat
      cy.get('input[placeholder="Search..."]').type(testData.id);
      cy.wait(1000); // Tunggu tabel update

      // 3. Klik tombol edit pada baris tersebut
      cy.contains("tr", testData.nama)
        .find("button.hover\\:text-primary") // Tombol Edit
        .click();

      // 4. Pastikan modal edit muncul
      cy.get('div[role="dialog"]')
        .contains("h2", "Edit Karyawan")
        .should("be.visible");

      // 5. Verifikasi ID tidak bisa diubah dan benar
      cy.get('input[name="employeeId"]')
        .should("have.value", testData.id)
        .and("be.disabled");

      // 6. Ubah data (contoh: Nama Lengkap)
      cy.get('input[name="fullName"]').clear().type(namaEdit);

      // 7. Klik Simpan
      cy.get('div[role="dialog"]').within(() => {
        cy.contains("button", "Simpan").click();
      });

      // 8. Verifikasi sukses
      cy.wait("@updateEmployee");
      cy.get('li[data-sonner-toast][data-type="success"]')
        .should("contain", "Karyawan berhasil diperbarui") // Asumsi pesan sukses
        .should("be.visible");
      cy.wait("@getEmployeesAfterUpdate");

      // 9. Verifikasi data telah berubah di tabel
      cy.get("table tbody").contains("td", namaEdit).should("be.visible");

      // 10. Bersihkan search
      cy.get('input[placeholder="Search..."]').clear();
    });

    it("harus bisa menghapus data karyawan", () => {
      // 1. Intercept API call
      cy.intercept("DELETE", `/api/admin/employees/${testData.id}`).as(
        "deleteEmployee"
      );
      cy.intercept("GET", "/api/admin/employees?*").as(
        "getEmployeesAfterDelete"
      );

      // 2. Cari data yang baru diedit
      cy.get('input[placeholder="Search..."]').type(testData.id);
      cy.wait(1000); // Tunggu tabel update

      // 3. Klik tombol hapus pada baris tersebut
      cy.contains("tr", namaEdit)
        .find("button.hover\\:text-red-600") // Tombol Hapus
        .click();

      // 4. Pastikan dialog konfirmasi muncul
      cy.get('div[role="alertdialog"]')
        .contains("h2", "Apakah Anda yakin?")
        .should("be.visible");
      cy.get('div[role="alertdialog"]')
        .contains(`Tindakan ini akan menghapus karyawan: ${namaEdit}`)
        .should("be.visible");

      // 5. Klik tombol "Hapus" (konfirmasi)
      cy.get('div[role="alertdialog"]').contains("button", "Hapus").click();

      // 6. Verifikasi sukses
      cy.wait("@deleteEmployee");
      cy.get('li[data-sonner-toast][data-type="success"]')
        .should("contain", "Karyawan berhasil dihapus") // Asumsi pesan sukses
        .should("be.visible");
      cy.wait("@getEmployeesAfterDelete");

      // 7. Verifikasi data hilang dari tabel
      cy.contains("No results found.").should("be.visible");

      // 8. Bersihkan search
      cy.get('input[placeholder="Search..."]').clear();
    });
  });
});
