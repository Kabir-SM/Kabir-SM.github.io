import Link from "next/link";
import type { ReactNode } from "react";

export function LegalPage({
  eyebrow,
  title,
  introduction,
  children,
}: {
  eyebrow: string;
  title: string;
  introduction: string;
  children: ReactNode;
}) {
  return (
    <div className="legal-shell">
      <a className="skip-link" href="#legal-content">Skip to content</a>
      <header className="legal-header">
        <Link className="brand" href="/" aria-label="Kabir Marwaha portfolio home">
          <span className="brand-mark">KM</span>
          <span>Kabir Marwaha</span>
        </Link>
        <Link className="legal-back" href="/">← Back to portfolio</Link>
      </header>

      <main className="legal-main" id="legal-content">
        <header className="legal-hero">
          <p className="legal-eyebrow">{eyebrow}</p>
          <h1>{title}</h1>
          <p>{introduction}</p>
          <span className="legal-updated">Last updated / August 18, 2026</span>
        </header>
        <div className="legal-content">{children}</div>
      </main>

      <footer className="legal-footer">
        <p>© 2026 Kabir Marwaha. Built with intention.</p>
        <nav aria-label="Legal and portfolio links">
          <Link href="/privacy">Privacy Policy</Link>
          <Link href="/terms">Terms of Use</Link>
          <Link href="/">Portfolio</Link>
        </nav>
      </footer>
    </div>
  );
}

export function LegalSection({ number, title, children }: { number: string; title: string; children: ReactNode }) {
  return (
    <section className="legal-section">
      <span className="legal-section-number">{number}</span>
      <div>
        <h2>{title}</h2>
        {children}
      </div>
    </section>
  );
}
