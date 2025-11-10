// cypress/e2e/employee/job-vacant.cy.ts

describe("Pengujian Halaman Job Vacant Employee", () => {
  context("SKENARIO: Alur E2E Pemilihan Minat Karier", () => {
    it("Harus memungkinkan karyawan menyelesaikan alur pemilihan minat karier 4 tahap", () => {
      // ------------------------------------------
      // TAHAP 1: LOGIN
      // ------------------------------------------
      cy.visit("/login");

      const employeeNik = Cypress.env("TEST_EMPLOYEE5_ID");
      const employeePassword = Cypress.env("TEST_EMPLOYEE5_PASSWORD");

      if (!employeeNik || !employeePassword) {
        throw new Error(
          "Variabel TEST_EMPLOYEE_ID dan TEST_EMPLOYEE_PASSWORD tidak diatur di cypress.env.json"
        );
      }

      cy.get('input[id="employeeId"]').type(employeeNik);
      cy.get('input[id="password"]').type(employeePassword);
      cy.get('button[type="submit"]').click();

      // Verifikasi redirect ke dashboard
      cy.url({ timeout: 10000 }).should("include", "/dashboard");

      // ------------------------------------------
      // TAHAP 2: NAVIGASI KE JOB VACANT
      // ------------------------------------------
      cy.contains("a", "Job Vacant").click();
      cy.url().should("include", "/job-vacant");

      // ------------------------------------------
      // TAHAP 3: PERSETUJUAN RELOKASI
      // ------------------------------------------
      // Tunggu hingga kartu relokasi muncul
      // --- FIX 1: Menggunakan selector [data-slot="card-title"] ---
      cy.contains('[data-slot="card-title"]', "Selamat Datang di Job Vacant", {
        timeout: 10000,
      }).should("be.visible");

      cy.contains("p", "Apakah Anda bersedia untuk relokasi?").should(
        "be.visible"
      );
      cy.contains("button", "Ya, Saya Bersedia").click();

      // Verifikasi notifikasi toast sukses
      cy.contains("Preferensi Disimpan").should("be.visible");

      // ------------------------------------------
      // TAHAP 4: TAHAP 1 (SEJALUR - JANGKA PENDEK)
      // ------------------------------------------
      // Tunggu hingga tahap 1 dimuat (ini menggunakan h2, jadi sudah benar)
      cy.contains("h2", "Tahap 1: Jenjang Karier Sejalur (Jangka Pendek)", {
        timeout: 10000,
      }).should("be.visible");

      // Pilih opsi pertama (misal: QC Auditor Spv)
      cy.contains('[data-slot="card-title"]', "QC Auditor Spv")
        .parents('[data-slot="card"]')
        .contains("button", "Saya Tertarik")
        .click();

      // Konfirmasi pilihan di dialog (ini menggunakan h2, jadi sudah benar)
      cy.contains("h2", "Konfirmasi Minat Karier").should("be.visible");
      cy.contains('[role="alertdialog"]', "QC Auditor Spv").should(
        "be.visible"
      );
      cy.get('[role="alertdialog"]')
        .contains("button", "Ya, Saya Yakin")
        .click();

      // Verifikasi toast sukses
      cy.contains("Pilihan Disimpan").should("be.visible");

      // ------------------------------------------
      // TAHAP 5: TAHAP 2 (SEJALUR - JANGKA PANJANG)
      // ------------------------------------------
      // Tunggu hingga tahap 2 dimuat
      cy.contains("h2", "Tahap 2: Jenjang Karier Sejalur (Jangka Panjang)", {
        timeout: 10000,
      }).should("be.visible");

      // Pilih opsi (misal: QC PD Spv)
      cy.contains('[data-slot="card-title"]', "QC PD Spv")
        .parents('[data-slot="card"]')
        .contains("button", "Saya Tertarik")
        .click();

      // Konfirmasi pilihan di dialog
      cy.contains("h2", "Konfirmasi Minat Karier").should("be.visible");
      cy.contains('[role="alertdialog"]', "QC PD Spv").should("be.visible");
      cy.get('[role="alertdialog"]')
        .contains("button", "Ya, Saya Yakin")
        .click();

      // Verifikasi toast sukses
      cy.contains("Pilihan Disimpan").should("be.visible");

      // ------------------------------------------
      // TAHAP 6: LAYAR TRANSISI
      // ------------------------------------------
      // Tunggu hingga layar transisi dimuat
      // --- FIX 2: Menggunakan selector [data-slot="card-title"] ---
      cy.contains(
        '[data-slot="card-title"]',
        "Tahap Selanjutnya: Karier Lintas Jalur",
        {
          timeout: 10000,
        }
      ).should("be.visible");
      cy.contains("button", "Lanjutkan ke Jenjang Karier Cross").click();

      // ------------------------------------------
      // TAHAP 7: TAHAP 3 (LINTAS JALUR - JANGKA PENDEK)
      // ------------------------------------------
      // Tunggu hingga tahap 3 dimuat
      cy.contains(
        "h2",
        "Tahap 3: Jenjang Karier Lintas Jalur (Jangka Pendek)",
        {
          timeout: 10000,
        }
      ).should("be.visible");

      // Pilih opsi (misal: Acct Spv)
      cy.contains('[data-slot="card-title"]', "Acct Spv")
        .parents('[data-slot="card"]')
        .contains("button", "Saya Tertarik")
        .click();

      // Konfirmasi pilihan di dialog
      cy.contains("h2", "Konfirmasi Minat Karier").should("be.visible");
      cy.contains('[role="alertdialog"]', "Acct Spv").should("be.visible");
      cy.get('[role="alertdialog"]')
        .contains("button", "Ya, Saya Yakin")
        .click();

      // Verifikasi toast sukses
      cy.contains("Pilihan Disimpan").should("be.visible");

      // ------------------------------------------
      // TAHAP 8: TAHAP 4 (LINTAS JALUR - JANGKA PANJANG)
      // ------------------------------------------
      // Tunggu hingga tahap 4 dimuat
      cy.contains(
        "h2",
        "Tahap 4: Jenjang Karier Lintas Jalur (Jangka Panjang)",
        {
          timeout: 10000,
        }
      ).should("be.visible");

      // Pilih opsi (misal: Acct Staff)
      cy.contains('[data-slot="card-title"]', "Acct Staff")
        .parents('[data-slot="card"]')
        .contains("button", "Saya Tertarik")
        .click();

      // Konfirmasi pilihan di dialog
      cy.contains("h2", "Konfirmasi Minat Karier").should("be.visible");
      cy.contains('[role="alertdialog"]', "Acct Staff").should("be.visible");
      cy.get('[role="alertdialog"]')
        .contains("button", "Ya, Saya Yakin")
        .click();

      // ------------------------------------------
      // TAHAP 9: LAYAR SELESAI
      // ------------------------------------------
      // Verifikasi layar "Terima Kasih!"
      // --- FIX 3: Menggunakan selector [data-slot="card-title"] ---
      cy.contains('[data-slot="card-title"]', "Terima Kasih!", {
        timeout: 10000,
      }).should("be.visible");
      cy.contains(
        "Anda telah berhasil melengkapi semua pilihan minat karier Anda."
      ).should("be.visible");
      cy.contains("Pilihan Anda telah kami simpan.").should("be.visible");
    });
  });
});
