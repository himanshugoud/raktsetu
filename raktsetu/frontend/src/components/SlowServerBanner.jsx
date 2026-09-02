import { useEffect, useState } from "react";

// Shown app-wide whenever any API call has been pending for a few seconds
// — almost always because the free-tier backend was asleep and is waking
// up. Without this, that delay just looks like the app is broken.
export default function SlowServerBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function onSlow() {
      setVisible(true);
    }
    function onDone() {
      setVisible(false);
    }
    window.addEventListener("raktsetu:slow-request", onSlow);
    window.addEventListener("raktsetu:request-done", onDone);
    return () => {
      window.removeEventListener("raktsetu:slow-request", onSlow);
      window.removeEventListener("raktsetu:request-done", onDone);
    };
  }, []);

  if (!visible) return null;

  return (
        <div className="fixed top-0 left-0 right-0 z-[60] bg-[var(--color-crimson-600)] text-white text-sm px-4 py-2 text-center">
      <span className="inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin align-[-2px] mr-2" />
      Waking up the server — this can take up to a minute on the first request. Thanks for your patience.
    </div>
  );
}
