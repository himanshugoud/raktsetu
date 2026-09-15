import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

// Unmounts any rendered component after each test, and clears localStorage
// so language preference / auth state from one test never leaks into the
// next (LanguageContext and AuthContext both read/write localStorage).
afterEach(() => {
  cleanup();
  localStorage.clear();
});