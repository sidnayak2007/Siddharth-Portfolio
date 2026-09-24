import { useEffect, useRef, useState } from "react";
import { safeHref } from "../../utils/url";
import PortfolioImage from "./PortfolioImage";
import "../../css/portfolio-sections.css";

export function PortfolioLink({
  href,
  children,
  className = "",
  download = false,
}) {
  const url = safeHref(href);
  if (!url) return null;

  const external = /^https?:\/\//i.test(url);

  return (
    <a
      className={`portfolio-link ${className}`.trim()}
      href={url}
      target={external && !download ? "_blank" : undefined}
      rel={external && !download ? "noopener noreferrer" : undefined}
      download={download && !external ? true : undefined}
    >
      {children}
      <span aria-hidden="true">{external && !download ? "↗" : "→"}</span>
    </a>
  );
}

export function PortfolioSection({
  section,
  number,
  eyebrow,
  heading,
  intro,
  onBack,
  loading = false,
  error = "",
  onRetry,
  children,
}) {
  const [leaving, setLeaving] = useState(false);
  const leaveTimer = useRef(null);

  useEffect(() => () => window.clearTimeout(leaveTimer.current), []);

  const handleBack = () => {
    if (leaving || !onBack) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      onBack();
      return;
    }
    setLeaving(true);
    leaveTimer.current = window.setTimeout(onBack, 170);
  };

  return (
    <main className={`portfolio-section portfolio-section-${section}${leaving ? " portfolio-section-leaving" : ""}`}>
      <div className="portfolio-section-light" aria-hidden="true" />

      <div className="portfolio-section-shell">
        <header className="portfolio-section-nav">
          <button
            type="button"
            className="portfolio-back"
            onClick={handleBack}
          >
            <span aria-hidden="true">←</span>
            Back to home
          </button>

          <span className="portfolio-section-name">
            Siddharth Nayak <i aria-hidden="true">/</i> {section}
          </span>

          <span className="portfolio-section-number">{number}</span>
        </header>

        <div className="portfolio-section-heading">
          <span className="portfolio-eyebrow">{eyebrow || `Portfolio / ${number}`}</span>
          <h1>{heading || section}</h1>
          {intro && <p>{intro}</p>}
        </div>

        {error && (
          <div className="portfolio-notice" role="status">
            <span>{error}</span>
            {onRetry && (
              <button type="button" onClick={onRetry}>
                Try again
              </button>
            )}
          </div>
        )}

        {loading ? (
          <p className="portfolio-loading" role="status">
            Loading {section}…
          </p>
        ) : (
          <div className="portfolio-section-content">{children}</div>
        )}
      </div>
      {onBack && (
        <button type="button" className="portfolio-floating-back" onClick={handleBack} aria-label="Back to portfolio home">
          <span aria-hidden="true">←</span><span>Home</span>
        </button>
      )}
    </main>
  );
}

export function PortfolioCard({
  image,
  imageAlt = "",
  title,
  subtitle,
  meta,
  badge,
  children,
  className = "",
}) {
  const initial = String(title || "?").trim().charAt(0).toUpperCase();

  return (
    <article className={`portfolio-card ${className}`.trim()}>
      <div className="portfolio-card-header">
        <div className="portfolio-card-image">
          {image ? (
            <PortfolioImage src={image} alt={imageAlt || title || "Portfolio image"} compact />
          ) : (
            <span aria-hidden="true">{initial}</span>
          )}
        </div>

        <div className="portfolio-card-heading">
          {badge && <span className="portfolio-card-badge">{badge}</span>}
          <h2>{title}</h2>
          {subtitle && <p className="portfolio-card-subtitle">{subtitle}</p>}
          {meta && <p className="portfolio-card-meta">{meta}</p>}
        </div>
      </div>

      {children && <div className="portfolio-card-body">{children}</div>}
    </article>
  );
}

export function PortfolioTags({ items, label = "Skills" }) {
  const tags = Array.isArray(items)
    ? items.filter((item) => typeof item === "string" && item.trim())
    : [];

  if (!tags.length) return null;

  return (
    <div className="portfolio-tags" aria-label={label}>
      {tags.map((item, index) => (
        <span key={`${item}-${index}`}>{item}</span>
      ))}
    </div>
  );
}

export function PortfolioMore({ label = "View more", children }) {
  const [open, setOpen] = useState(false);
  if (!children) return null;

  return (
    <div className="portfolio-more">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        {open ? "Show less" : label}
        <span aria-hidden="true">{open ? "↑" : "↓"}</span>
      </button>

      {open && <div className="portfolio-more-content">{children}</div>}
    </div>
  );
}

export function PortfolioEmpty({ title, message }) {
  return (
    <div className="portfolio-empty">
      <span aria-hidden="true">✧</span>
      <h2>{title}</h2>
      <p>{message}</p>
    </div>
  );
}
