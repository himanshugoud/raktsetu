import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import Login from "./Login.jsx";
import { AuthProvider } from "../context/AuthContext.jsx";
import { LanguageProvider } from "../context/LanguageContext.jsx";

// The real client makes a real HTTP request — mocked here so this test
// exercises Login's own logic (form handling, error display, redirect)
// without depending on a running backend.
vi.mock("../api/client.js", () => ({
  default: { post: vi.fn(), get: vi.fn().mockRejectedValue(new Error("no session")) },
}));
import client from "../api/client.js";

function renderLogin() {
  return render(
    <LanguageProvider>
      <AuthProvider>
        <MemoryRouter initialEntries={["/login"]}>
          <Routes>
            <Route path="/login" element={<Login />} />
            {/* Stands in for the real Dashboard page — just enough to prove navigate() fired. */}
            <Route path="/dashboard" element={<div>Dashboard Page</div>} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    </LanguageProvider>
  );
}

async function fillAndSubmit(user, { email = "donor@example.com", password = "correct-password" } = {}) {
  await user.type(screen.getByLabelText(/email/i), email);
  await user.type(screen.getByLabelText(/password/i), password);
  await user.click(screen.getByRole("button", { name: /log in|sign in|login/i }));
}

describe("Login", () => {
  it("shows the server's error message, announced for screen readers, on failed login", async () => {
    client.post.mockRejectedValueOnce({
      response: { data: { message: "Invalid email or password." } },
    });
    const user = userEvent.setup();
    renderLogin();

    await fillAndSubmit(user, { password: "wrong-password" });

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("Invalid email or password.");
  });

  it("redirects to the dashboard and stores the session on successful login", async () => {
    client.post.mockResolvedValueOnce({
      data: { token: "fake-jwt-token", donor: { name: "Test Donor", email: "donor@example.com" } },
    });
    const user = userEvent.setup();
    renderLogin();

    await fillAndSubmit(user);

    await waitFor(() => expect(screen.getByText("Dashboard Page")).toBeInTheDocument());
    expect(localStorage.getItem("raktsetu_token")).toBe("fake-jwt-token");
  });
});
