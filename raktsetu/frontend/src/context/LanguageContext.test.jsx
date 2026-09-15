import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LanguageProvider, useLanguage } from "./LanguageContext.jsx";

// A minimal component that exposes the context's values to the DOM so
// tests can assert on them without needing a real page.
function Probe() {
  const { lang, toggleLang, t } = useLanguage();
  return (
    <div>
      <span data-testid="lang">{lang}</span>
      <span data-testid="translated">{t("nav_home")}</span>
      <span data-testid="missing-key">{t("this_key_does_not_exist")}</span>
      <button onClick={toggleLang}>toggle</button>
    </div>
  );
}

function renderProbe() {
  return render(
    <LanguageProvider>
      <Probe />
    </LanguageProvider>
  );
}

describe("LanguageContext", () => {
  it("defaults to English", () => {
    renderProbe();
    expect(screen.getByTestId("lang")).toHaveTextContent("en");
    expect(screen.getByTestId("translated")).toHaveTextContent("Home");
  });

  it("falls back to the key itself when a translation is missing, rather than rendering blank", () => {
    renderProbe();
    expect(screen.getByTestId("missing-key")).toHaveTextContent("this_key_does_not_exist");
  });

  it("switches every translated string to Hindi when toggled", async () => {
    const user = userEvent.setup();
    renderProbe();

    await user.click(screen.getByRole("button", { name: /toggle/i }));

    expect(screen.getByTestId("lang")).toHaveTextContent("hi");
    expect(screen.getByTestId("translated")).toHaveTextContent("होम");
  });

  it("persists the chosen language across a remount, so a reload doesn't reset it", async () => {
    const user = userEvent.setup();
    const { unmount } = renderProbe();

    await user.click(screen.getByRole("button", { name: /toggle/i }));
    expect(screen.getByTestId("lang")).toHaveTextContent("hi");

    unmount();
    renderProbe(); // simulates the app re-mounting, e.g. after a page reload

    expect(screen.getByTestId("lang")).toHaveTextContent("hi");
  });
});
