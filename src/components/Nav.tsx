import { useEffect, useState } from "react";
import { LeafMark } from "./Plant";

const LINKS = [
  { href: "#why", label: "Why" },
  { href: "#features", label: "Features" },
  { href: "#how", label: "How it works" },
  { href: "#faq", label: "FAQ" },
];

interface NavProps {
  onStart: () => void;
  /** Show sign-in controls only when auth is configured. */
  authEnabled: boolean;
  email: string | null;
  onSignIn: () => void;
  onSignOut: () => void;
}

export function Nav({ onStart, authEnabled, email, onSignIn, onSignOut }: NavProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className="nav">
      <div className="nav-inner container">
        <a className="wordmark" href="#top" aria-label="ROOTED home">
          <LeafMark /> ROOTED
        </a>
        <nav id="site-nav" className={open ? "nav-links is-open" : "nav-links"} aria-label="Primary">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} onClick={() => setOpen(false)}>
              {l.label}
            </a>
          ))}
        </nav>
        {authEnabled && (
          email ? (
            <button type="button" className="btn btn-ghost btn-sm nav-auth" onClick={onSignOut} title={email}>
              Sign out
            </button>
          ) : (
            <button type="button" className="btn btn-ghost btn-sm nav-auth" onClick={onSignIn}>
              Sign in
            </button>
          )
        )}
        <button type="button" className="btn btn-primary btn-sm nav-cta" onClick={onStart}>
          {email ? "Check in" : "Start your journey"}
        </button>
        <button
          type="button"
          className="nav-toggle"
          aria-expanded={open}
          aria-controls="site-nav"
          onClick={() => setOpen((o) => !o)}
        >
          <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
          <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            {open ? <path d="M6 6l12 12M18 6 6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>
      </div>
    </header>
  );
}
