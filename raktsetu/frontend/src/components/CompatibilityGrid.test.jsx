import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CompatibilityGrid from "./CompatibilityGrid.jsx";

describe("CompatibilityGrid", () => {
  it("defaults to AB+ (the universal recipient), matching all 8 donor types", () => {
    render(<CompatibilityGrid />);
    expect(screen.getByText(/8 of 8 types/i)).toBeInTheDocument();
  });

  it("updates the compatible donor count when the recipient type changes", async () => {
    const user = userEvent.setup();
    render(<CompatibilityGrid />);

    // O- can only receive from O- donors — the strictest case.
    await user.selectOptions(screen.getByLabelText(/patient needs/i), "O-");

    expect(screen.getByText(/1 of 8 types/i)).toBeInTheDocument();
  });

  it("exposes match status to screen readers, not just through color", async () => {
    const user = userEvent.setup();
    render(<CompatibilityGrid />);
    await user.selectOptions(screen.getByLabelText(/patient needs/i), "O-");

    // Exactly one donor type (O-) is compatible; the sr-only text makes
    // that same information available to screen readers, rather than
    // relying only on the cell's color/opacity styling.
    expect(screen.getAllByText(", compatible donor")).toHaveLength(1);
    expect(screen.getAllByText(", not compatible")).toHaveLength(7);
  });

  it("marks the recipient's own cell with a 'needs' badge", async () => {
    const user = userEvent.setup();
    render(<CompatibilityGrid />);
    await user.selectOptions(screen.getByLabelText(/patient needs/i), "B+");

    expect(screen.getByText("needs")).toBeInTheDocument();
  });
});
