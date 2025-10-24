// cypress.config.ts
import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: "https://www.mycareerjourney.my.id",
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
