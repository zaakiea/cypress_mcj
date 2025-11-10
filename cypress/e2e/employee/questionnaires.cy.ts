// cypress/e2e/employee/questionnaires.cy.ts

describe("Employee Questionnaire Flow", () => {
  // --- Variabel untuk kredensial login ---
  const testEmployeeNip = "T05";
  const testEmployeePassword = "T0510112025";

  beforeEach(() => {
    // 1. Kunjungi halaman login
    cy.visit("/login");

    // 2. Lakukan login menggunakan NIP dan password
    cy.get('input[id="employeeId"]').type(testEmployeeNip);
    cy.get('input[id="password"]').type(testEmployeePassword);
    cy.get('button[type="submit"]').click();

    // 3. Pastikan sudah redirect ke dashboard
    cy.url().should("include", "/dashboard");
  });

  /**
   * TEST CASE 1:
   * Menguji fitur aksesibilitas dan mengisi kuesioner pertama (Manajerial).
   */
  it("menguji fitur aksesibilitas dan kemudian mengisi serta mengirimkan kuesioner Manajerial.”", () => {
    // 4. Kunjungi halaman daftar kuesioner
    cy.visit("/questionnaire");

    // 5. Pilih kuesioner "Manajerial"
    cy.log("Starting Managerial Questionnaire Test");
    cy.contains("Kuesioner Mapping Kompetensi Manajerial").click();

    // 6. Handle popup petunjuk pengisian
    cy.contains("h2", "Petunjuk Pengisian Kuesioner Kompetensi").should(
      "be.visible"
    );
    cy.contains("button", "Saya Mengerti").click();
    cy.contains("h2", "Petunjuk Pengisian Kuesioner Kompetensi").should(
      "not.exist"
    );

    // --- Pengetesan Fitur Aksesibilitas ---
    cy.log("Testing Accessibility Controls...");
    const smallTextButton = cy.get(
      "button:has(svg.lucide-type.\\!h-\\[0\\.875rem\\])"
    );
    const mediumTextButton = cy.get("button:has(svg.lucide-type.\\!h-4)");
    const largeTextButton = cy.get(
      "button:has(svg.lucide-type.\\!h-\\[1\\.125rem\\])"
    );
    const boldButton = cy.get("button:has(svg.lucide-bold)");
    const infoButton = cy.contains("button", "Keterangan");

    mediumTextButton.click({ force: true });
    mediumTextButton.should("have.class", "bg-primary");
    largeTextButton.click({ force: true });
    largeTextButton.should("have.class", "bg-primary");
    smallTextButton.click({ force: true });
    smallTextButton.should("have.class", "bg-primary");
    boldButton.click({ force: true });
    boldButton.should("have.class", "bg-primary");
    boldButton.click({ force: true });
    boldButton.should("not.have.class", "bg-primary");
    infoButton.click();
    cy.contains("h2", "Petunjuk Pengisian Kuesioner Kompetensi").should(
      "be.visible"
    );
    cy.contains("button", "Saya Mengerti").click();
    cy.log("Accessibility Controls Test Complete.");
    // --- Akhir Pengetesan Fitur Aksesibilitas ---

    // [BARU] 11. Test validasi jawaban kosong
    cy.log("Testing empty answer validation...");
    cy.contains("button", "Selanjutnya").click();
    // Cek apakah toast error muncul
    cy.get('li[data-sonner-toast][data-type="error"]')
      .contains("Terdapat Jawaban Kosong")
      .should("be.visible");
    cy.contains("Harap lengkapi semua jawaban pada halaman ini.").should(
      "be.visible"
    );

    // 12. Fungsi rekursif untuk mengisi semua halaman
    function fillCurrentPage() {
      cy.get("form").should("be.visible");
      cy.get('div[role="radiogroup"]').should("have.length.gt", 0);

      cy.get('div[role="radiogroup"]').each(($group) => {
        cy.wrap($group).find('label[for$="-3"]').click();
      });

      cy.get("body").then(($body) => {
        const submitButton = $body.find(
          'button:contains("Submit"), button:contains("Kirim")'
        );
        if (submitButton.length > 0) {
          cy.log("Submitting Managerial questionnaire");
          cy.wrap(submitButton).first().click();

          // Handle popup konfirmasi
          cy.log("Handling submission confirmation modal");
          cy.contains("h2", "Konfirmasi Pengiriman").should("be.visible");
          cy.contains("button", "Ya, Kirim Jawaban").click();
        } else {
          cy.log("Proceeding to the next page (Managerial)");
          cy.contains("button", "Selanjutnya").click();
          fillCurrentPage();
        }
      });
    }

    // 13. Mulai proses pengisian
    fillCurrentPage();

    // Pastikan kembali ke halaman list kuesioner
    cy.url().should("include", "/questionnaire");

    // Cek status kartu Manajerial
    cy.log("Verifying Managerial questionnaire status is 'Selesai'");
    cy.contains("Kuesioner Mapping Kompetensi Manajerial")
      .closest("a") // Cari <a> parent terdekat
      .should("have.class", "pointer-events-none") // Pastikan kartu tidak bisa diklik
      .find("[data-slot='badge']") // Cari badge di dalam kartu
      .should("contain.text", "Selesai") // Pastikan teksnya "Selesai"
      .and("have.class", "bg-green-600"); // Pastikan warnanya hijau
  });

  /**
   * TEST CASE 2:
   * Mengisi dan men-submit kuesioner kedua (MFG).
   */
  it("harus mengizinkan karyawan untuk mengisi dan mengirimkan kuesioner Kompetensi MFG", () => {
    // 1. Kunjungi halaman daftar kuesioner
    cy.visit("/questionnaire");

    // 2. Pilih kuesioner "MFG"
    cy.log("Starting MFG Questionnaire Test");
    cy.contains("Kuesioner Mapping Kompetensi MFG").click();

    // 3. Handle popup petunjuk pengisian
    cy.contains("h2", "Petunjuk Pengisian Kuesioner Kompetensi").should(
      "be.visible"
    );
    cy.contains("button", "Saya Mengerti").click();
    cy.contains("h2", "Petunjuk Pengisian Kuesioner Kompetensi").should(
      "not.exist"
    );

    // [BARU] 4. Test validasi jawaban kosong
    cy.log("Testing empty answer validation (MFG)...");
    cy.contains("button", "Selanjutnya").click();
    // Cek apakah toast error muncul
    cy.get('li[data-sonner-toast][data-type="error"]')
      .contains("Terdapat Jawaban Kosong")
      .should("be.visible");
    cy.contains("Harap lengkapi semua jawaban pada halaman ini.").should(
      "be.visible"
    );

    // 5. Fungsi rekursif untuk mengisi semua halaman
    function fillCurrentPage() {
      cy.get("form").should("be.visible");
      cy.get('div[role="radiogroup"]').should("have.length.gt", 0);

      cy.get('div[role="radiogroup"]').each(($group) => {
        cy.wrap($group).find('label[for$="-4"]').click();
      });

      cy.get("body").then(($body) => {
        const submitButton = $body.find(
          'button:contains("Submit"), button:contains("Kirim")'
        );
        if (submitButton.length > 0) {
          cy.log("Submitting MFG questionnaire");
          cy.wrap(submitButton).first().click();

          // Handle popup konfirmasi
          cy.log("Handling submission confirmation modal");
          cy.contains("h2", "Konfirmasi Pengiriman").should("be.visible");
          cy.contains("button", "Ya, Kirim Jawaban").click();
        } else {
          cy.log("Proceeding to the next page (MFG)");
          cy.contains("button", "Selanjutnya").click();
          fillCurrentPage();
        }
      });
    }

    // 6. Mulai proses pengisian
    fillCurrentPage();

    // [MODIFIKASI] 7. Verifikasi setelah submit
    // Cek toast sukses yang baru

    // Pastikan kembali ke halaman list kuesioner
    cy.url().should("include", "/questionnaire");

    // Cek status kartu MFG
    cy.log("Verifying MFG questionnaire status is 'Selesai'");
    cy.contains("Kuesioner Mapping Kompetensi MFG")
      .closest("a") // Cari <a> parent terdekat
      .should("have.class", "pointer-events-none") // Pastikan kartu tidak bisa diklik
      .find("[data-slot='badge']") // Cari badge di dalam kartu
      .should("contain.text", "Selesai") // Pastikan teksnya "Selesai"
      .and("have.class", "bg-green-600"); // Pastikan warnanya hijau
  });
});
