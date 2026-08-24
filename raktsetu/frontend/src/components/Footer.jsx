import PulseLine from "./PulseLine.jsx";

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-[var(--color-line)]">
      <PulseLine className="opacity-60" />
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="font-display text-base font-semibold">RaktSetu</span>
          <span className="text-[var(--color-ink-faint)] text-sm">— रक्त सेतु, a bridge to blood</span>
        </div>
        <p className="text-sm text-[var(--color-ink-faint)] font-mono">
          Built for emergencies. Not a substitute for calling emergency services.
        </p>
      </div>
    </footer>
  );
}
