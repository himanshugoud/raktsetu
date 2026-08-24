import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="max-w-md mx-auto px-5 py-24 text-center">
      <span className="eyebrow">404</span>
      <h1 className="font-display text-3xl font-semibold mt-2 mb-4">Page not found</h1>
      <p className="text-[var(--color-ink-muted)] mb-8">
        The page you're looking for doesn't exist or has moved.
      </p>
      <Link to="/" className="btn btn-primary">Back to home</Link>
    </div>
  );
}
