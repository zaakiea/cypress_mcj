// cypress/e2e/hrbranch/employees.cy.ts

describe("HR Branch - Manajemen Data Karyawan", () => {
  // ASUMSI UTAMA UNTUK TES INI:
  // Berdasarkan file `Mockup Data MCJ.csv` dan `login_hrbranch.cy.ts`,
  // kita asumsikan `TEST_HRBRANCH_ID` adalah pengguna yang terasosiasi
  // dengan cabang "ICBP-Noodle Head Office".
  const NAMA_CABANG_HR = "ICBP-Noodle Head Office";
  const NAMA_CABANG_LAIN = "ICBP-Noodle Tangerang"; // Cabang lain u/ tes negatif

  // Data dari cabang lain untuk pengujian negatif
  const NAMA_KARYAWAN_CABANG_LAIN = "Rian Saputra"; // Dari Tangerang
  const ID_KARYAWAN_CABANG_LAIN = "7320156"; // Dari Tangerang

  // Data dari cabang HR_BRANCH (Head Office) untuk pengujian positif
  const NAMA_KARYAWAN_SENDIRI = "Indra Gunawan";
  const ID_KARYAWAN_SENDIRI = "81234967";

  // Helper untuk memverifikasi data scoping di tabel
  const verifyBranchScoping = () => {
    cy.log(
      `Memverifikasi semua baris di tabel memiliki cabang "${NAMA_CABANG_HR}"`
    );
    // Tunggu data render
    cy.wait(250);

    cy.get("table tbody").then(($tbody) => {
      // Jika tabel kosong (misal setelah search negatif), lewati
      if ($tbody.text().includes("No results found")) {
        cy.log("Tabel kosong, verifikasi scoping dilewati.");
        return;
      }

      // Pastikan ada baris
      if ($tbody.find("tr").length > 0) {
        cy.get("table tbody tr").each(($row) => {
          // Kolom ke-5 (index 4) adalah "Cabang"
          cy.wrap($row).find("td").eq(4).should("have.text", NAMA_CABANG_HR);
        });
      }
    });
  };

  beforeEach(() => {
    // 1. Kunjungi halaman login
    cy.visit("/login");

    // 2. Ambil data login HR Branch dari cypress.env
    const hrBranchId = Cypress.env("TEST_HRBRANCH_ID");
    const hrBranchPassword = Cypress.env("TEST_HRBRANCH_PASSWORD");

    // 3. Lakukan login
    cy.get('input[id="employeeId"]').type(hrBranchId);
    cy.get('input[id="password"]').type(hrBranchPassword);
    cy.get('button[type="submit"]').click();

    // 4. Pastikan sudah di dashboard admin (sesuai login_hrbranch.cy.ts)
    cy.url({ timeout: 10000 }).should("include", "/admin");
    cy.contains("h1", "Dashboard Admin").should("be.visible");

    // 5. Navigasi ke halaman Data Karyawan
    cy.get('a[href="/admin/employees"]').click();

    // 6. Pastikan halaman selesai loading dan judulnya benar
    cy.contains("h1", "Data Karyawan").should("be.visible");
    cy.wait(1000); // Tunggu data awal load
  });

  // --- GRUP 1: Validasi Tampilan Awal (Display) ---
  describe("Validasi Tampilan (Display)", () => {
    it("harus menampilkan judul dan kontrol tabel (tanpa Sinkronisasi)", () => {
      // Judul
      cy.contains("h1", "Data Karyawan").should("be.visible");

      // Kontrol Tabel
      cy.contains("span", "Show").next("button").should("contain", "10");
      cy.get('input[placeholder="Search..."]').should("be.visible");
      cy.contains("button", "Filter").should("be.visible");
      cy.contains("button", "Tambah Karyawan").should("be.visible");

      // FSK: Validasi Izin
      cy.contains("button", "Sinkronisasi Data").should("not.exist");
    });

    it("harus menampilkan header tabel dengan benar", () => {
      // Header Tabel
      const headers = ["ID", "Nama", "Posisi", "Departemen", "Cabang", "Aksi"];
      headers.forEach((header) => {
        cy.get("table th").contains(header).should("be.visible");
      });
    });
  });

  // --- GRUP 2: Validasi Data Scoping (Sangat Penting) ---
  describe("Validasi Data Scoping (Hanya Cabang Sendiri)", () => {
    it("harus HANYA menampilkan karyawan dari cabangnya sendiri di tabel awal", () => {
      cy.log(`Hanya boleh menampilkan data untuk: ${NAMA_CABANG_HR}`);
      cy.get("table tbody").find("tr").should("have.length.gt", 0);
      cy.contains("td", NAMA_KARYAWAN_SENDIRI).should("be.visible");
      verifyBranchScoping();
    });

    it("harus TIDAK menampilkan karyawan dari cabang lain (via Search)", () => {
      const searchInput = cy.get('input[placeholder="Search..."]');

      // --- Skenario 1: Pencarian Negatif (Karyawan Cabang Lain) ---
      cy.log(`Mencari ${NAMA_KARYAWAN_CABANG_LAIN} (dari cabang lain)`);
      searchInput.clear().type(NAMA_KARYAWAN_CABANG_LAIN);
      cy.wait(500);
      cy.contains("No results found.").should("be.visible");
      verifyBranchScoping();

      // --- Skenario 2: Pencarian Negatif (ID Cabang Lain) ---
      cy.log(`Mencari ${ID_KARYAWAN_CABANG_LAIN} (dari cabang lain)`);
      searchInput.clear().type(ID_KARYAWAN_CABANG_LAIN);
      cy.wait(500);
      cy.contains("No results found.").should("be.visible");
      verifyBranchScoping();

      // --- Skenario 3: Pencarian Positif (Karyawan Cabang Sendiri) ---
      cy.log(`Mencari ${NAMA_KARYAWAN_SENDIRI} (dari cabang sendiri)`);
      searchInput.clear().type(NAMA_KARYAWAN_SENDIRI);
      cy.wait(500);
      cy.contains("td", NAMA_KARYAWAN_SENDIRI).should("be.visible");
      verifyBranchScoping();

      // Bersihkan input
      searchInput.clear();
      cy.wait(500);
      cy.get("table tbody tr").should("have.length.gt", 1);
      verifyBranchScoping();
    });
  });

  // --- GRUP 3: Validasi Fungsionalitas (Interactions) ---
  describe("Validasi Fungsionalitas (Interactions)", () => {
    it("harus bisa mengubah jumlah [Show entries] dan tetap scoped", () => {
      // 1. Verifikasi nilai default adalah 10 dan data scoped
      cy.contains("Show")
        .next('button[role="combobox"]')
        .as("selectShow")
        .should("contain", "10");
      cy.get("table tbody tr").should("have.length", 10);
      cy.contains(/Showing 1 to 10 of \d+ entries/).should("be.visible");
      verifyBranchScoping();

      // 2. Buka dropdown dan klik "25"
      cy.get("@selectShow").click();
      cy.get('div[role="option"]').contains("25").click();
      cy.wait(1000); // Tunggu data reload

      // 3. Verifikasi nilai berubah ke 25 dan data tetap scoped
      cy.get("@selectShow").should("contain", "25");
      cy.get("table tbody tr").should("have.length.gt", 10);
      cy.get("table tbody tr").should("have.length.at.most", 25);
      cy.contains(/Showing 1 to (\d+) of \d+ entries/).should("be.visible");
      verifyBranchScoping();

      // 2. Buka dropdown dan klik "50"
      cy.get("@selectShow").click();
      cy.get('div[role="option"]').contains("50").click();
      cy.wait(1000); // Tunggu data reload

      // 3. Verifikasi nilai berubah ke 50 dan data tetap scoped
      cy.get("@selectShow").should("contain", "50");
      cy.get("table tbody tr").should("have.length.gt", 10);
      cy.get("table tbody tr").should("have.length.at.most", 50);
      cy.contains(/Showing 1 to (\d+) of \d+ entries/).should("be.visible");
      verifyBranchScoping();
    });

    it("harus bisa berpindah halaman [Paginasi] dan tetap scoped", () => {
      // Asumsi 'Head Office' punya > 10 karyawan untuk memicu paginasi
      cy.contains(/Showing 1 to 10 of \d+ entries/).should("be.visible");
      verifyBranchScoping();

      // 1. Klik halaman 2
      cy.contains("button", /^2$/).click();
      cy.wait(500);

      // 2. Verifikasi status Halaman 2 dan data tetap scoped
      cy.contains(/Showing 11 to (\d+) of \d+ entries/).should("be.visible");
      cy.contains("button", /^2$/).should("have.class", "bg-primary");
      verifyBranchScoping();

      // 3. Klik halaman pertama (Tombol <<)
      cy.get("button svg.lucide-chevrons-left").parent().click();
      cy.wait(1000);

      // 4. Verifikasi kembali ke Halaman 1 dan data tetap scoped
      cy.contains(/Showing 1 to 10 of \d+ entries/).should("be.visible");
      cy.contains("button", /^1$/).should("have.class", "bg-primary");
      verifyBranchScoping();
    });

    // =================================================================
    // --- BLOK TES YANG DIPERBARUI ---
    // =================================================================
    it("harus memiliki filter [Cabang] yang scoped (Semua dan Cabang Sendiri)", () => {
      // 1. Buka popover filter
      cy.contains("button", "Filter").click();

      // 2. Dialog popover harus muncul
      cy.get('div[role="dialog"]').within(() => {
        cy.contains("h4", "Filter Data").should("be.visible");

        // --- PERBAIKAN (SESUAI FEEDBACK) ---
        // FSK: Validasi Scoping
        // Filter "Cabang" tidak di-disable, dan defaultnya "Semua"
        cy.contains("label", "Cabang")
          .next('button[role="combobox"]')
          .should("not.be.disabled") // Tidak di-disable
          .and("contain", "Semua") // **FIX 1:** Default adalah "Semua"
          .click(); // Buka combobox
      }); // Keluar .within() untuk cek opsi

      // 3. Verifikasi opsinya HANYA 2 (Semua dan Cabang Sendiri)
      cy.get('div[role="option"]')
        .should("have.length", 2) // **FIX 2:** Hanya ada 2 opsi
        .and("contain", "Semua") // **FIX 3:** Mengandung "Semua"
        .and("contain", NAMA_CABANG_HR); // **FIX 4:** Mengandung cabang HR

      // 4. Verifikasi negatif (tidak ada cabang lain)
      cy.get('div[role="option"]').should("not.contain", NAMA_CABANG_LAIN);

      // 5. Klik opsi cabang sendiri untuk mengetes filter
      cy.get('div[role="option"]').contains(NAMA_CABANG_HR).click();

      // 6. Masuk .within() lagi untuk filter Departemen
      cy.get('div[role="dialog"]').within(() => {
        // Terapkan filter [Departemen]
        cy.contains("label", "Departemen")
          .next('button[role="combobox"]')
          .click();
      });

      // 7. Pilih (ADM HR)
      cy.get('div[role="option"]').contains("ADM HR").click();

      // 8. Klik Terapkan
      cy.get('div[role="dialog"]').within(() => {
        cy.contains("button", "Terapkan Filter").click();
      });
      cy.wait(500);

      // 9. Verifikasi data: Semua harus 'ADM HR' DAN 'ICBP-Noodle Head Office'
      cy.get("table tbody tr").each(($row) => {
        cy.wrap($row).find("td").eq(3).should("contain", "ADM HR");
        cy.wrap($row).find("td").eq(4).should("contain", NAMA_CABANG_HR);
      });

      // 10. Tombol filter harus terlihat aktif
      cy.contains("button", "Filter").should("have.class", "bg-primary");

      // 11. Reset filter
      cy.contains("button", "Filter").click();
      cy.get('div[role="dialog"]').contains("button", "Reset").click();
      cy.wait(500);

      // 12. Tombol filter kembali normal
      cy.contains("button", "Filter").should("not.have.class", "bg-primary");
    });
    // =================================================================
    // --- AKHIR BLOK TES YANG DIPERBARUI ---
    // =================================================================

    it("harus membuka modal [Edit Karyawan] saat tombol Aksi Edit diklik", () => {
      cy.contains("tr", NAMA_KARYAWAN_SENDIRI)
        .find("button.hover\\:text-primary")
        .click();

      cy.get('div[role="dialog"]').within(() => {
        cy.contains("h2", "Edit Karyawan").should("be.visible");
        cy.get('input[name="employeeId"]')
          .should("have.value", ID_KARYAWAN_SENDIRI)
          .and("be.disabled");
        cy.get('input[name="fullName"]').should(
          "have.value",
          NAMA_KARYAWAN_SENDIRI
        );
        cy.get('button[data-slot="dialog-close"]').click();
      });
    });
  });

  // --- GRUP 4: Validasi Fungsionalitas CRUD (Dengan Scoping) ---
  describe("Validasi Fungsionalitas CRUD (Dengan Scoping)", () => {
    // Data yang akan digunakan untuk pengetesan
    const testData = {
      nama: "Test Karyawan HRBranch",
      id: "210200", // ID unik baru
      gender: "MALE",
      tglLahir: "2000-01-01",
      tglMasuk: "2023-01-01",
      pendidikan: "S1",
      universitas: "Test University",
      jurusan: "Teknik Komputer",
      departemen: "MKT Marketing", // Ada di Head Office
      posisi: "A & P Staff", // Ada di Head Office (diasumsikan)
      level: "STAFF",
    };
    const namaEdit = "Test Karyawan HRBranch (Edited)";

    // Helper untuk memilih opsi dropdown kustom (combobox)
    const selectDropdownOption = (label: string, optionText: string) => {
      cy.get('div[role="dialog"]').within(() => {
        cy.contains("label", label)
          .next('button[role="combobox"]')
          .click({ force: true });
      });
      cy.get('div[role="option"]').contains(optionText).click();
    };

    it("harus bisa menambah data karyawan baru (Form Cabang HANYA berisi 1 opsi)", () => {
      cy.intercept("POST", "/api/admin/employees").as("createEmployee");
      cy.intercept("GET", "/api/admin/employees?*").as("getEmployees");

      cy.contains("button", "Tambah Karyawan").click();

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
      selectDropdownOption("Jenis Kelamin", testData.gender);
      selectDropdownOption("Pendidikan Terakhir", testData.pendidikan);

      // FSK: Validasi Scoping di Form - Cabang
      // (Sesuai feedback pertama: form hanya berisi 1 opsi)
      cy.log("Verifikasi dan pilih 'Cabang'");
      cy.get('div[role="dialog"]').within(() => {
        cy.contains("label", "Cabang")
          .next('button[role="combobox"]')
          .should("not.be.disabled")
          .click({ force: true });
      });
      // Opsi dropdown ada di root body
      cy.get('div[role="option"]')
        .should("have.length", 1) // Hanya ada 1 opsi
        .and("contain", NAMA_CABANG_HR)
        .click();

      cy.wait(500); // Tunggu departemen load
      selectDropdownOption("Departemen", testData.departemen);

      cy.wait(500); // Tunggu posisi load
      selectDropdownOption("Posisi", testData.posisi);

      selectDropdownOption("Level", testData.level);

      // 6. Klik Simpan
      cy.get('div[role="dialog"]').within(() => {
        cy.contains("button", "Simpan").click();
      });

      // 7. Verifikasi sukses
      cy.wait("@createEmployee");
      cy.get('li[data-sonner-toast][data-type="success"]')
        .should("contain", "Karyawan berhasil dibuat")
        .should("be.visible");
      cy.wait("@getEmployees");

      // 8. Verifikasi data baru ada di tabel (dan scoped)
      cy.get('input[placeholder="Search..."]').type(testData.id);
      cy.wait(500);
      cy.get("table tbody").contains("td", testData.nama).should("be.visible");
      verifyBranchScoping();

      cy.get('input[placeholder="Search..."]').clear();
    });

    it("harus bisa mengedit data karyawan (Form Cabang HANYA berisi 1 opsi)", () => {
      cy.intercept("PUT", `/api/admin/employees/${testData.id}`).as(
        "updateEmployee"
      );
      cy.intercept("GET", "/api/admin/employees?*").as("getEmployees");

      cy.get('input[placeholder="Search..."]').type(testData.id);
      cy.wait(1000);

      cy.contains("tr", testData.nama)
        .find("button.hover\\:text-primary") // Tombol Edit
        .click();

      cy.get('div[role="dialog"]')
        .contains("h2", "Edit Karyawan")
        .should("be.visible");

      cy.get('div[role="dialog"]').within(() => {
        // Verifikasi ID
        cy.get('input[name="employeeId"]')
          .should("have.value", testData.id)
          .and("be.disabled");

        // FSK: Validasi Scoping di Form Edit
        cy.log("Verifikasi 'Cabang' combobox scoping saat Edit");
        cy.contains("label", "Cabang")
          .next('button[role="combobox"]')
          .should("not.be.disabled")
          .and("contain", NAMA_CABANG_HR) // Sudah terisi
          .click({ force: true });
      }); // Keluar .within() untuk cek option

      cy.get('div[role="option"]')
        .should("have.length", 1)
        .and("contain", NAMA_CABANG_HR)
        .click();

      // Masuk .within() lagi untuk lanjut edit
      cy.get('div[role="dialog"]').within(() => {
        // Ubah nama
        cy.get('input[name="fullName"]').clear().type(namaEdit);

        // Klik Simpan
        cy.contains("button", "Simpan").click();
      });

      // Verifikasi sukses
      cy.wait("@updateEmployee");
      cy.get('li[data-sonner-toast][data-type="success"]')
        .should("contain", "Karyawan berhasil diperbarui")
        .should("be.visible");
      cy.wait("@getEmployees");

      // Verifikasi data telah berubah di tabel
      cy.get("table tbody").contains("td", namaEdit).should("be.visible");
      verifyBranchScoping();

      cy.get('input[placeholder="Search..."]').clear();
    });

    it("harus bisa menghapus data karyawan (Izin ada)", () => {
      cy.intercept("DELETE", `/api/admin/employees/${testData.id}`).as(
        "deleteEmployee"
      );
      cy.intercept("GET", "/api/admin/employees?*").as("getEmployees");

      cy.get('input[placeholder="Search..."]').type(testData.id);
      cy.wait(1000);

      cy.contains("tr", namaEdit)
        .find("button.hover\\:text-red-600") // Tombol Hapus
        .click();

      cy.get('div[role="alertdialog"]')
        .contains("h2", "Apakah Anda yakin?")
        .should("be.visible");
      cy.get('div[role="alertdialog"]')
        .contains(`Tindakan ini akan menghapus karyawan: ${namaEdit}`)
        .should("be.visible");

      cy.get('div[role="alertdialog"]').contains("button", "Hapus").click();

      cy.wait("@deleteEmployee");
      cy.get('li[data-sonner-toast][data-type="success"]')
        .should("contain", "Karyawan berhasil dihapus")
        .should("be.visible");
      cy.wait("@getEmployees");

      // Verifikasi data hilang
      cy.contains("No results found.").should("be.visible");
      cy.get('input[placeholder="Search..."]').clear();
    });
  });
});
