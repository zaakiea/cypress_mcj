//cypress/e2e/auth/login_employee.cy.ts
describe("Pengujian Halaman Login Employee", () => {
  beforeEach(() => {
    // Kunjungi halaman login sebelum setiap tes
    cy.visit("/login");
  });
  context("SKENARIO 4: Percobaan Berhasil Login Employee", () => {
    it("Harus berhasil login dengan kredensial employee yang valid", () => {
      const employeeNik = Cypress.env("TEST_EMPLOYEE2_ID");
      const employeePassword = Cypress.env("TEST_EMPLOYEE2_PASSWORD");

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
