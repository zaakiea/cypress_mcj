// ***********************************************************
// This example support/e2e.ts is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import "./commands";
Cypress.on("uncaught:exception", (err, runnable) => {
  // Kita return false di sini untuk mencegah
  // Cypress menggagalkan tes secara otomatis
  // jika error-nya adalah 'ResizeObserver'
  if (
    err.message.includes(
      "ResizeObserver loop completed with undelivered notifications"
    )
  ) {
    return false;
  }

  // Biarkan error lain yang tidak terkait tetap menggagalkan tes
  return true;
});
