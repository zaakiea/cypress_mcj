//cypress/e2e/auth/login_admin.cy.ts
describe("Pengujian Halaman Login Admin", () => {
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
      cy.get('input[id="employeeId"]').type(Cypress.env("TEST_ADMIN_ID"));
      cy.get('input[id="password"]').type("password-salah-12345");
      cy.get('button[type="submit"]').click();

      // Cek notifikasi alert (bukan toast)
      cy.get('div[role="alert"]')
        .should("be.visible")
        .and("contain", "Gagal Masuk");

      cy.url().should("include", "/login");
    });

    it("Harus menampilkan notifikasi alert untuk NIK yang tidak ada", () => {
      cy.get('input[id="employeeId"]').type("99999999"); // NIK palsu
      cy.get('input[id="password"]').type(Cypress.env("TEST_ADMIN_PASSWORD"));
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

      // Server harus menolak ini (kemungkinan karena validasi NIK gagal)
      cy.get('div[role="alert"]')
        .should("be.visible")
        .and("contain", "Gagal Masuk");
      cy.url().should("include", "/login");
    });

    it("Harus menampilkan validasi HTML5 untuk input yang hanya berisi spasi", () => {
      cy.get('input[id="employeeId"]').type("     "); // Input spasi
      cy.get('input[id="password"]').type("     "); // Input spasi
      cy.get('button[type="submit"]').click();

      // Browser harus menangkap ini sebagai field kosong karena atribut 'required'
      cy.get('div[role="alert"]')
        .should("be.visible")
        .and("contain", "Gagal Masuk");
      cy.url().should("include", "/login");
    });
  });

  // ------------------------------------------
  // SKENARIO 4: Percobaan Berhasil Login
  // ------------------------------------------
  context("SKENARIO 4: Percobaan Berhasil Login", () => {
    it("Harus berhasil login dengan kredensial admin yang valid", () => {
      const adminNik = Cypress.env("TEST_ADMIN_ID");
      const adminPassword = Cypress.env("TEST_ADMIN_PASSWORD");

      if (!adminNik || !adminPassword) {
        throw new Error(
          "Variabel TEST_ADMIN_ID dan TEST_ADMIN_PASSWORD tidak diatur di cypress.env.json"
        );
      }

      cy.get('input[id="employeeId"]').type(adminNik);
      cy.get('input[id="password"]').type(adminPassword);
      cy.get('button[type="submit"]').click();

      // Verifikasi redirect ke halaman admin
      cy.url({ timeout: 10000 }).should("include", "/admin");

      // Verifikasi elemen di dashboard admin
      cy.contains("h1", "Dashboard").should("be.visible");
      cy.contains("Dashboard Admin").should("be.visible"); // Sesuaikan dengan teks di dashboard admin

      // Pastikan alert error tidak ada
      cy.get('div[role="alert"]').should("not.exist");
    });
  });
});
