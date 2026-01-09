import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:5000",   // <<< άλλαξέ το αν τρέχει αλλού
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
