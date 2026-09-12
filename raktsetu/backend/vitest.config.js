import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    setupFiles: ["./tests/setup.js"],
    testTimeout: 20000, // geo queries + bcrypt hashing can be slower than pure unit tests
  },
});