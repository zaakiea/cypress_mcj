//cypress/e2e/auth/login_employee.cy.ts
describe("Pengujian Halaman Login Employee", () => {
  beforeEach(() => {
    // Kunjungi halaman login sebelum setiap tes
    cy.visit("/login");
  });

  // ------------------------------------------
  // SKENARIO 1: Verifikasi Tampilan Awal Halaman Login
  // ------------------------------------------
  context("SKENARIO 1: Verifikasi Tampilan Awal", () => {
    it("Harus menampilkan semua elemen login dengan benar", () => {
      cy.get('img[alt="Indofood CBP Noodle Division Logo"]').should(
        "be.visible"
      );
      cy.contains(
        '[data-slot="card-title"]',
        "Selamat Datang di My Career Journey"
      ).should("be.visible");
      cy.contains(
        '[data-slot="card-description"]',
        "Masukkan Nomor Induk Karyawan dan Kata Sandi untuk Masuk."
      ).should("be.visible");
      cy.contains('label[for="employeeId"]', "Nomor Induk Karyawan").should(
        "be.visible"
      );
      cy.get('input[id="employeeId"]')
        .should("be.visible")
        .and("have.attr", "placeholder", "NIK");
      cy.contains('label[for="password"]', "Kata Sandi").should("be.visible");
      cy.get('input[id="password"]')
        .should("be.visible")
        .and("have.attr", "placeholder", "Masukkan Kata Sandi");
      cy.get('button[type="submit"]')
        .should("be.visible")
        .and("contain", "Masuk");
    });
  });

  // ------------------------------------------
  // SKENARIO 2: Percobaan Gagal - Berbagai Input Tidak Valid
  // ------------------------------------------
  context("SKENARIO 2: Percobaan Gagal - Input Tidak Valid", () => {
    it("Harus menampilkan validasi HTML5 saat submit form kosong", () => {
      cy.get('button[type="submit"]').click();
      cy.get('input[id="employeeId"]').should(
        "have.prop",
        "validationMessage",
        "Please fill out this field."
      );
      cy.get('input[id="employeeId"]:invalid').should("exist");
    });

    it("Harus menampilkan validasi HTML5 jika hanya password yang kosong", () => {
      cy.get('input[id="employeeId"]').type("123456"); // NIK diisi
      cy.get('button[type="submit"]').click();
      cy.get('input[id="employeeId"]:invalid').should("not.exist");
      cy.get('input[id="password"]').should(
        "have.prop",
        "validationMessage",
        "Please fill out this field."
      );
      cy.get('input[id="password"]:invalid').should("exist");
    });

    it("Harus menampilkan notifikasi alert untuk password yang salah", () => {
      cy.get('input[id="employeeId"]').type(Cypress.env("TEST_EMPLOYEE_ID"));
      cy.get('input[id="password"]').type("password-salah-12345");
      cy.get('button[type="submit"]').click();

      // Cek notifikasi alert
      cy.get('div[role="alert"]')
        .should("be.visible")
        .and("contain", "Gagal Masuk");

      cy.url().should("include", "/login");
    });

    it("Harus menampilkan notifikasi alert untuk NIK yang tidak ada", () => {
      cy.get('input[id="employeeId"]').type("99999999"); // NIK palsu
      cy.get('input[id="password"]').type(
        Cypress.env("TEST_EMPLOYEE_PASSWORD")
      );
      cy.get('button[type="submit"]').click();

      // Cek notifikasi alert
      cy.get('div[role="alert"]')
        .should("be.visible")
        .and("contain", "Gagal Masuk");

      cy.url().should("include", "/login");
    });
  });

  // ------------------------------------------
  // SKENARIO 3: PENGUJIAN EKSTREM & KEAMANAN
  // ------------------------------------------
  context("SKENARIO 3: Pengujian Ekstrem & Keamanan", () => {
    it("Harus gagal pada percobaan basic SQL injection (' OR '1'='1')", () => {
      cy.get('input[id="employeeId"]').type("' OR '1'='1");
      cy.get('input[id="password"]').type("' OR '1'='1");
      cy.get('button[type="submit"]').click();

      // Server harus menolak ini dan menampilkan alert
      cy.get('div[role="alert"]')
        .should("be.visible")
        .and("contain", "Gagal Masuk");
      cy.url().should("include", "/login");
    });

    it("Harus gagal pada percobaan SQL injection dengan komentar (--)", () => {
      cy.get('input[id="employeeId"]').type("12345' -- "); // NIK dengan komentar SQL
      cy.get('input[id="password"]').type("passwordapapun");
      cy.get('button[type="submit"]').click();

      // Server harus menolak ini dan menampilkan alert
      cy.get('div[role="alert"]')
        .should("be.visible")
        .and("contain", "Gagal Masuk");
      cy.url().should("include", "/login");
    });

    it("Harus gagal dengan input emoji", () => {
      cy.get('input[id="employeeId"]').type("😀😀😀");
      cy.get('input[id="password"]').type("🔑🔑🔑");
      cy.get('button[type="submit"]').click();

      // Server harus menolak ini
      cy.get('div[role="alert"]')
        .should("be.visible")
        .and("contain", "Gagal Masuk");
      cy.url().should("include", "/login");
    });

    it("Harus gagal dengan input karakter Unicode dan simbol campuran", () => {
      cy.get('input[id="employeeId"]').type("üñîçødé!@#");
      cy.get('input[id="password"]').type("®™€§¥");
      cy.get('button[type="submit"]').click();

      // Server harus menolak ini
      cy.get('div[role="alert"]')
        .should("be.visible")
        .and("contain", "Gagal Masuk");
      cy.url().should("include", "/login");
    });

    it("Harus gagal dengan input string yang sangat panjang", () => {
      const longString = "1".repeat(2000); // 2000 karakter
      cy.get('input[id="employeeId"]').type(longString);
      cy.get('input[id="password"]').type("password");
      cy.get('button[type="submit"]').click();

      // Server harus menolak ini
      cy.get('div[role="alert"]')
        .should("be.visible")
        .and("contain", "Gagal Masuk");
      cy.url().should("include", "/login");
    });

    it("Harus menampilkan validasi HTML5 untuk input yang hanya berisi spasi", () => {
      cy.get('input[id="employeeId"]').type("     "); // Input spasi
      cy.get('input[id="password"]').type("     "); // Input spasi
      cy.get('button[type="submit"]').click();

      // Browser harus menangkap ini sebagai field kosong
      cy.get('div[role="alert"]')
        .should("be.visible")
        .and("contain", "Gagal Masuk");
      cy.url().should("include", "/login");
    });
  });

  // ------------------------------------------
  // SKENARIO 4: Percobaan Berhasil Login
  // ------------------------------------------
  context("SKENARIO 4: Percobaan Berhasil Login Employee", () => {
    it("Harus berhasil login dengan kredensial employee yang valid", () => {
      const employeeNik = Cypress.env("TEST_EMPLOYEE_ID");
      const employeePassword = Cypress.env("TEST_EMPLOYEE_PASSWORD");

      if (!employeeNik || !employeePassword) {
        throw new Error(
          "Variabel TEST_EMPLOYEE_ID dan TEST_EMPLOYEE_PASSWORD tidak diatur di cypress.env.json"
        );
      }

      cy.get('input[id="employeeId"]').type(employeeNik);
      cy.get('input[id="password"]').type(employeePassword);
      cy.get('button[type="submit"]').click();

      // Verifikasi redirect ke halaman employee dashboard
      cy.url({ timeout: 10000 }).should("include", "/dashboard");

      // 3. Verifikasi elemen di dashboard employee (berdasarkan HTML Anda)
      cy.contains(`NIK: ${employeeNik}`).should("be.visible");
      cy.get('[data-slot="card-title"]').should("be.visible"); // Cek judul kartu (nama karyawan)
      cy.contains("Posisi").should("be.visible");
      cy.contains("Departemen").should("be.visible");
      cy.contains("Cabang").should("be.visible");

      // 4. Pastikan alert error TIDAK ada
      cy.get('div[role="alert"]').should("not.exist");
    });
  });
});
