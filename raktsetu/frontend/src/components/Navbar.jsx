import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useLanguage } from "../context/LanguageContext.jsx";

export default function Navbar() {
  const { donor, logout } = useAuth();
  const { lang, toggleLang, t } = useLanguage();
  const navigate = useNavigate();

  const linkClass = ({ isActive }) =>
    `text-sm font-medium transition-colors ${
      isActive ? "text-[var(--color-crimson-600)]" : "text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
    }`;

  return (
    <header className="sticky top-0 z-50 backdrop-blur bg-[var(--color-bg)]/85 border-b border-[var(--color-line)]">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="shrink-0">
            <path
              d="M12 2.5C12 2.5 4.5 11 4.5 15.5C4.5 19.64 7.86 23 12 23C16.14 23 19.5 19.64 19.5 15.5C19.5 11 12 2.5 12 2.5Z"
              fill="var(--color-crimson-500)"
              className="transition-transform group-hover:scale-110"
            />
          </svg>
          <span className="font-display text-lg font-semibold tracking-tight text-[var(--color-ink)]">
            RaktSetu
          </span>
        </Link>

                <nav className="hidden md:flex items-center gap-7">
          <NavLink to="/" end className={linkClass}>{t("nav_home")}</NavLink>
          {donor && (
            <>
              <NavLink to="/dashboard" className={linkClass}>{t("nav_dashboard")}</NavLink>
              <NavLink to="/requests/new" className={linkClass}>{t("nav_request")}</NavLink>
            </>
          )}
        </nav>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleLang}
            className="text-xs font-mono border border-[var(--color-line)] rounded-full px-2.5 py-1 text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] hover:border-[var(--color-ink-muted)] transition-colors"
            aria-label="Toggle language"
          >
            {lang === "en" ? "हिं" : "EN"}
          </button>
          {donor ? (
            <>
              <span className="hidden sm:inline-flex badge badge-crimson font-mono">{donor.bloodType}</span>
              <button
                onClick={() => {
                  logout();
                  navigate("/");
                }}
                className="btn btn-secondary !py-2 !px-4 text-sm"
              >
                {t("nav_logout")}
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost !py-2 !px-4 text-sm">{t("nav_login")}</Link>
              <Link to="/register" className="btn btn-primary !py-2 !px-4 text-sm">{t("nav_become_donor")}</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
