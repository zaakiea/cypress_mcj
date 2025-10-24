// cypress/e2e/auth/login_admin.cy.ts
describe("Perjalanan Pengujian Halaman Login (ADMIN HO)", () => {
  beforeEach(() => {
    // Kunjungi halaman login sebelum setiap tes dijalankan
    // Ini akan menggunakan baseUrl dari cypress.config.ts (misal: https://www.mycareerjourney.my.id)
    cy.visit("/login");
  });

  // =====================================================================================
  // SKENARIO : Verifikasi Tampilan Awal Halaman Login
  // =====================================================================================
  it("seharusnya menampilkan semua elemen UI pada halaman login dengan benar", () => {
    cy.log("Memverifikasi elemen-elemen visual halaman login");

    // 1. Verifikasi logo Indofood terlihat
    cy.get('img[alt="Indofood CBP Noodle Division Logo"]').should("be.visible"); //

    // 2. Verifikasi teks h1
    cy.contains("h1", "Welcome to My Career Journey").should("be.visible"); //

    // 3. Verifikasi keberadaan field input (disesuaikan dengan placeholder kode)
    cy.get('input[placeholder=" NIK"]').should("be.visible"); //
    cy.get('input[placeholder="Masukkan Password"]').should("be.visible"); //

    // 4. Verifikasi keberadaan tombol Log In (disesuaikan dengan teks tombol kode)
    cy.contains("button", "Masuk").should("be.visible"); //
  });

  // =====================================================================================
  // SKENARIO : Percobaan Gagal - Input Kosong
  // =====================================================================================
  it("seharusnya menampilkan pesan validasi browser jika input dikosongkan", () => {
    cy.log("Memulai tes validasi input kosong");

    // Coba klik Masuk dengan form kosong
    cy.contains("button", "Masuk").click();

    // Verifikasi pesan validasi browser muncul di field NIK (karena ada atribut 'required')
    cy.get('input[placeholder="NIK"]').then(($input) => {
      // @ts-ignore
      // Pesan ini bisa bervariasi antar browser, "Please fill out this field" adalah standar umum
      expect($input[0].validationMessage).to.not.be.empty;
    });
  });

  // =====================================================================================
  // SKENARIO : Percobaan Gagal - Kredensial Salah
  // =====================================================================================
  it("seharusnya menampilkan pesan error jika kredensial yang dimasukkan salah", () => {
    cy.log("Memulai tes login dengan kredensial salah");

    cy.get('input[placeholder="NIK"]').type("id_salah");
    cy.get('input[placeholder="Masukkan Password"]').type("password_salah");
    cy.contains("button", "Masuk").click();

    // Verifikasi pesan error sesuai dengan 'errorMap' di kode
    cy.contains("Gagal Masuk").should("be.visible");
    cy.contains("NIK atau Password salah").should("be.visible");
  });

  // =====================================================================================
  // SKENARIO : Percobaan Gagal - Input Ekstrem (SQL Injection)
  // =====================================================================================
  it("seharusnya tidak berhasil login dengan percobaan SQL Injection dasar", () => {
    cy.log("Menguji input untuk SQL Injection");

    const sqlPayload = "' OR '1'='1";

    cy.get('input[placeholder="NIK"]').type(sqlPayload);
    cy.get('input[placeholder="Masukkan Password"]').type(sqlPayload);
    cy.contains("button", "Masuk").click();

    // Verifikasi aplikasi tidak crash dan menampilkan error yang wajar
    cy.contains("Gagal Masuk").should("be.visible");
    cy.url().should("include", "/login"); // Pastikan tidak berhasil masuk
  });

  // =====================================================================================
  // SKENARIO : Input String Sangat Panjang
  // =====================================================================================
  it("seharusnya bisa menangani input string yang sangat panjang tanpa crash", () => {
    cy.log("Menguji input dengan string 1000 karakter");

    const longString = "test".repeat(250); // 1000 karakter

    cy.get('input[placeholder="Masukkan NIK"]').type(longString);
    cy.get('input[placeholder="Masukkan Password"]').type(longString);
    cy.contains("button", "Masuk").click();

    // Verifikasi: Aplikasi tidak crash dan menampilkan pesan error yang wajar
    cy.contains("Gagal Masuk").should("be.visible");
    cy.contains("NIK atau Password salah").should("be.visible");
  });

  // =====================================================================================
  // SKENARIO : Input Berisi Karakter Internasional dan Simbol Campuran
  // =====================================================================================
  it("seharusnya bisa menangani input berisi karakter Unicode dan simbol-simbol aneh", () => {
    cy.log("Menguji input dengan karakter internasional dan simbol");

    const weirdString =
      '你好世界-안녕하세요-こんにちは-résumé-!@#$%^*()_+-=[]{}|;:",./<>?`~';

    cy.get('input[placeholder="Masukkan NIK"]').type(weirdString);
    cy.get('input[placeholder="Masukkan Password"]').type(weirdString);
    cy.contains("button", "Masuk").click();

    // Verifikasi: Aplikasi tidak crash dan menampilkan pesan error yang wajar
    cy.contains("Gagal Masuk").should("be.visible");
  });

  // =====================================================================================
  // SKENARIO : Percobaan Berhasil (ADMIN)
  // =====================================================================================
  it("seharusnya berhasil login sebagai ADMIN dan diarahkan ke /admin", () => {
    cy.log("Memulai tes login berhasil sebagai ADMIN");

    // Ambil kredensial dari cypress.env.json
    const employeeId = Cypress.env("TEST_ADMIN_ID");
    const password = Cypress.env("TEST_ADMIN_PASSWORD");

    // Pastikan environment variables sudah di-set
    if (!employeeId || !password) {
      throw new Error(
        "TEST_ADMIN_ID dan TEST_ADMIN_PASSWORD harus di-set di cypress.env.json"
      );
    }

    cy.get('input[placeholder="Masukkan NIK"]').type(employeeId);
    cy.get('input[placeholder="Masukkan Password"]').type(password);
    cy.contains("button", "Masuk").click();

    // Verifikasi pengalihan ke dashboard ADMIN (sesuai middleware.ts)
    cy.url().should("not.include", "/login");
    cy.url().should("include", "/admin");

    // Verifikasi konten di halaman admin
    cy.contains("h1", "Dashboard Admin").should("be.visible");
  });
});
