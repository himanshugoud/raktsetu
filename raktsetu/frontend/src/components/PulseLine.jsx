// The signature visual element of RaktSetu: a continuous ECG trace that
// flatlines, then spikes into a heartbeat — literalizing "a pulse means
// someone is available to help." Pure SVG + CSS, no dependencies.
// One repeating "tile": flat line with a single heartbeat blip, 1200 units wide.
// Two identical copies are placed side by side and scrolled left by exactly one
// tile-width, so the moment the first tile fully exits, the second is sitting
// exactly where the first started — a perfectly seamless, unbroken loop.
function PulseTile({ color }) {
  return (
    <svg viewBox="0 0 1200 80" preserveAspectRatio="none" className="pulse-svg-tile">
      <line x1="0" y1="40" x2="1200" y2="40" stroke="var(--color-line)" strokeWidth="1" />
      <path
        d="M0,40 L220,40 L250,40 L270,10 L295,70 L320,40 L360,40 L1200,40"
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function PulseLine({ className = "", color = "var(--color-crimson-500)" }) {
  return (
    <div className={`pulse-line-wrap ${className}`} aria-hidden="true">
      <div className="pulse-track">
        <PulseTile color={color} />
        <PulseTile color={color} />
      </div>
      <style>{`
        .pulse-line-wrap {
          width: 100%;
          height: 40px;
          overflow: hidden;
        }
        .pulse-track {
          display: flex;
          width: 200%;
          height: 100%;
          animation: pulse-scroll 6s linear infinite;
          will-change: transform;
        }
        .pulse-svg-tile {
          width: 50%;
          height: 100%;
          flex: 0 0 50%;
          display: block;
        }
        @keyframes pulse-scroll {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        @media (prefers-reduced-motion: reduce) {
          .pulse-track { animation: none; }
        }
      `}</style>
    </div>
  );
}
