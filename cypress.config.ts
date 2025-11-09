// cypress.config.ts
import { defineConfig } from "cypress";
import { prisma } from "./lib/prisma";
import dotenv from "dotenv"; // 1. Impor dotenv

// 2. Muat variabel dari file .env di root project Anda
dotenv.config();

export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:3000",
    setupNodeEvents(on, config) {
      // implement node event listeners
      //  here
      on("task", {
        /**
         * Task untuk mereset data formulir karyawan berdasarkan employeeId.
         * Ini akan menghapus semua data terkait dari tabel-tabel riwayat.
         */
        async resetEmployeeForm(employeeId: string) {
          console.log(
            `[Cypress Task] Mereset data form untuk ID: ${employeeId}`
          );

          if (!employeeId) {
            console.error("[Cypress Task] Employee ID tidak boleh kosong.");
            return null;
          }

          try {
            // (Logika ini sekarang seharusnya bisa terhubung ke DB)
            const employee = await prisma.employee.findUnique({
              where: { employeeId: employeeId },
            });

            if (!employee) {
              console.warn(
                `[Cypress Task] Karyawan ${employeeId} tidak ditemukan. Melanjutkan...`
              );
              return true;
            }

            // Transaksi Anda sudah terlihat benar sesuai skema
            await prisma.$transaction([
              prisma.organizationHistory.deleteMany({
                where: { employeeId: employeeId },
              }),
              prisma.committeeHistory.deleteMany({
                where: { employeeId: employeeId },
              }),
              prisma.projectHistory.deleteMany({
                where: { employeeId: employeeId },
              }),
              prisma.gkmHistory.deleteMany({
                where: { employeeId: employeeId },
              }),
              prisma.bestEmployeeScore.deleteMany({
                where: { employeeId: employeeId },
              }),
              prisma.careerPreference.deleteMany({
                where: { employeeId: employeeId },
              }),
            ]);

            console.log(
              `[Cypress Task] Reset data form berhasil untuk ID: ${employeeId}`
            );
            return true;
          } catch (error) {
            console.error(
              `[Cypress Task] Gagal total saat mereset data untuk ${employeeId}:`,
              error // Ini akan print error Prisma yang sebenarnya di terminal Anda
            );
            return null;
          }
        },
      });

      return config;
    },
  },
  viewportWidth: 1920,
  viewportHeight: 1080,
});
