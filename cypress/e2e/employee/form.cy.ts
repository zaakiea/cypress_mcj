// cypress/e2e/employee/form.cy.ts

/**
 * Catatan: Pastikan Anda sudah mengkonfigurasi 'resetEmployeeForm'
 * di dalam 'cypress.config.ts' agar tes ini bisa diulang.
 */
describe("Formulir Data Diri - Skenario Pengisian Lengkap", () => {
  beforeEach(() => {
    // 1. Ambil NIP/ID Karyawan dari .env
    // Gunakan SATU variabel ini untuk semuanya
    const testEmployeeNip = Cypress.env("TEST_EMPLOYEE2_ID");
    const testEmployeePassword = Cypress.env("TEST_EMPLOYEE2_PASSWORD");

    if (!testEmployeeNip || !testEmployeePassword) {
      throw new Error(
        "TEST_EMPLOYEE2_ID dan TEST_EMPLOYEE2_PASSWORD harus ada di cypress.env.json"
      );
    }

    // --- SOLUSI REPEATABLE TEST ---
    // 2. Panggil task reset menggunakan NIP yang benar
    cy.task("resetEmployeeForm", testEmployeeNip).then((result) => {
      if (!result) {
        throw new Error(
          `Gagal mereset data untuk NIP: ${testEmployeeNip}. Cek log server task.`
        );
      }
    });

    // --- Login sebagai karyawan ---
    cy.visit("/login");

    // 3. Lakukan login menggunakan NIP yang sama
    cy.get('input[id="employeeId"]').type(testEmployeeNip);
    cy.get('input[id="password"]').type(testEmployeePassword);
    cy.get('button[type="submit"]').click();

    // 4. Pastikan sudah redirect ke dashboard
    cy.url().should("include", "/dashboard");

    // Kunjungi halaman form
    cy.visit("/form");
  });

  it('should fill out and submit the entire form with all dynamic fields ("Ya")', () => {
    // Verifikasi kita di halaman pertama
    cy.contains("h1", "Formulir Data Diri").should("be.visible");

    // --- Step 1: Riwayat Karier Internal ---
    cy.log("Mengisi Step 1: Riwayat Karier");
    cy.contains("div", "Riwayat Karier Internal").should("be.visible");

    // --- PERUBAHAN DI SINI: MENGISI TANGGAL ---
    // Mengisi data di dalam card "Posisi Saat Ini"
    cy.contains("h4", "Posisi Saat Ini")
      .parent() // Target <div> flex
      .parent() // Target <div> p-6 (card body)
      .within(() => {
        cy.contains("label", "Tanggal Mulai")
          .parent()
          .find('input[type="date"]')
          .type("2020-01-01"); // Isi dengan tanggal mulai

        cy.contains("label", "Tanggal Berakhir")
          .parent()
          .find('input[type="date"]')
          .type("2025-01-01"); // Isi dengan tanggal berakhir (contoh)
      });
    // --- AKHIR PERUBAHAN ---

    cy.contains("button", "Selanjutnya").click();

    // --- Step 2: Riwayat Organisasi Internal ---
    cy.log("Mengisi Step 2: Riwayat Organisasi");
    cy.contains("div", "Riwayat Organisasi Internal").should("be.visible");
    cy.contains("button", "Ya").click();

    // --- PERBAIKAN SELEKTOR .within() ---
    cy.contains("h4", "Organisasi #1")
      .parent() // Target <div> flex
      .parent() // Target <div> p-6 (card body)
      .within(() => {
        cy.get('input[name="organizationHistories.0.organization"]').type(
          "Koperasi Karyawan Sejahtera"
        );
        cy.get('input[name="organizationHistories.0.role"]').type("Bendahara");
        cy.contains("label", "Tanggal Mulai")
          .parent()
          .find('input[type="date"]')
          .type("2023-01-15");
        cy.contains("label", "Tanggal Berakhir")
          .parent()
          .find('input[type="date"]')
          .type("2024-01-15");
      });
    cy.contains("button", "Selanjutnya").click();

    // --- Step 3: Riwayat Kepanitiaan ---
    cy.log("Mengisi Step 3: Riwayat Kepanitiaan");
    cy.contains("div", "Riwayat Kepanitiaan").should("be.visible");
    cy.contains("button", "Ya").click();

    // --- PERBAIKAN SELEKTOR .within() ---
    cy.contains("h4", "Kepanitiaan #1")
      .parent() // Target <div> flex
      .parent() // Target <div> p-6 (card body)
      .within(() => {
        cy.get('input[name="committeeHistories.0.eventName"]').type(
          "HUT Indofood 2024"
        );
        cy.get('input[name="committeeHistories.0.role"]').type(
          "Ketua Pelaksana"
        );
        cy.get('input[name="committeeHistories.0.year"]').type("2024");
      });
    cy.contains("button", "Selanjutnya").click();

    // --- Step 4: Riwayat Proyek ---
    cy.log("Mengisi Step 4: Riwayat Proyek");
    cy.contains("div", "Riwayat Proyek").should("be.visible");
    cy.contains("button", "Ya").click();

    // --- PERBAIKAN DI SINI ---
    cy.contains("h4", "Proyek #1")
      .parent()
      .parent()
      .within(() => {
        cy.get('input[name="projectHistories.0.projectName"]').type(
          "Implementasi Sistem ERP"
        );
        cy.get('input[name="projectHistories.0.year"]').type("2023");
        // 1. Klik tombol combobox DI DALAM .within()
        cy.contains("label", "Peran dalam Proyek")
          .parent()
          .find('button[role="combobox"]')
          .click();
      }); // 2. Keluar dari .within()

    // 3. Klik option DI LUAR .within() (karena list ada di <body>)
    cy.contains('[role="option"]', "PIC").click();

    // 4. Masuk lagi ke .within() untuk mengisi deskripsi
    cy.contains("h4", "Proyek #1")
      .parent()
      .parent()
      .within(() => {
        cy.get('textarea[name="projectHistories.0.description"]').type(
          "Bertanggung jawab atas modul HRIS."
        );
      });
    cy.contains("button", "Selanjutnya").click();

    // --- Step 5: Riwayat GKM ---
    cy.log("Mengisi Step 5: Riwayat GKM");
    cy.contains("div", "Riwayat GKM").should("be.visible");
    cy.contains("button", "Ya").click();

    // --- PERBAIKAN SELEKTOR .within() ---
    cy.contains("div", "Riwayat GKM")
      .parents('[data-slot="card"]')
      .within(() => {
        cy.get('input[name="gkmHistory.participationCount"]').type("3");
        // 1. Klik tombol combobox DI DALAM .within()
        cy.contains("label", "Jabatan Tertinggi")
          .parent()
          .find('button[role="combobox"]')
          .click();
      });

    // --- PERBAIKAN DI SINI (STEP 5) ---
    // 2. Cari option di 'body' untuk MEMAKSA scope global
    cy.get("body").contains('[role="option"]', "KETUA").click();

    cy.contains("button", "Selanjutnya").click();

    // --- Step 6: Prestasi Karyawan Teladan ---
    cy.log("Mengisi Step 6: Karyawan Teladan");
    cy.contains("div", "Prestasi Karyawan Teladan").should("be.visible");
    cy.contains("button", "Ya").click();

    cy.contains("div", "Prestasi Karyawan Teladan")
      .parents('[data-slot="card"]')
      .within(() => {
        cy.get('input[name="bestEmployeeScore.count"]').type("2");
      });
    cy.contains("button", "Selanjutnya").click();

    // --- Step 7: Preferensi Pengembangan Karier ---
    cy.log("Mengisi Step 7: Preferensi Karier");
    cy.contains("div", "Preferensi Pengembangan Karier").should("be.visible");

    cy.get('textarea[name="careerPreference.preferredMentor"]').type(
      "Mentor yang saya harapkan adalah Pak Budi dari Divisi IT."
    );

    cy.get('textarea[name="careerPreference.preferredTraining"]').type(
      "Saya membutuhkan pelatihan terkait Cloud Computing dan DevOps."
    );

    // --- Submit Form ---
    cy.log("Konfirmasi Penyimpanan");
    cy.contains("button", "Simpan Semua Perubahan").click();
    cy.log("Mengklik tombol konfirmasi di modal");
    cy.contains("button", "Ya, Saya Yakin dan Simpan").click();

    // --- Verifikasi ---
    cy.contains('[data-slot="card-title"]', "Terima Kasih!").should(
      "be.visible"
    );
    cy.contains(
      '[data-slot="card-description"]',
      "Anda telah berhasil mengisi formulir data diri."
    ).should("be.visible");
  });
});
