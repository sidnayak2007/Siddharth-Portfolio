import { useState } from "react";
import { contactFallback } from "../../data/portfolioDefaults";
import { usePublicPortfolioDocument } from "../../hooks/usePublicPortfolioDocument";
import { safeHref } from "../../utils/url";
import {
  PortfolioCard,
  PortfolioEmpty,
  PortfolioLink,
  PortfolioSection,
} from "./PortfolioSectionUI";

function contactPlatform(item) {
  const label = String(item.label || "").toLowerCase();
  const url = String(item.url || "").toLowerCase();
  if (url.includes("linkedin.com") || label.includes("linkedin")) return "linkedin";
  if (url.includes("whatsapp") || url.includes("wa.me") || label.includes("whatsapp")) return "whatsapp";
  if (url.startsWith("mailto:") || url.includes("gmail.com") || label.includes("gmail") || label.includes("email")) return "gmail";
  return "";
}

function ContactPlatformLogo({ platform }) {
  if (platform === "linkedin") return (
    <span className="portfolio-contact-logo portfolio-contact-logo-linkedin" aria-hidden="true">
      <svg viewBox="0 0 32 32" focusable="false">
        <rect width="32" height="32" rx="6" fill="#0A66C2" />
        <path fill="#fff" d="M8 12h4v13H8zm2-6a2.3 2.3 0 1 1 0 4.6A2.3 2.3 0 0 1 10 6m5 6h3.8v1.8h.1a4.2 4.2 0 0 1 3.8-2.1c4.1 0 4.8 2.7 4.8 6.2V25h-4v-6.3c0-1.5 0-3.4-2.1-3.4s-2.4 1.6-2.4 3.3V25h-4z" />
      </svg>
    </span>
  );
  if (platform === "whatsapp") return (
    <span className="portfolio-contact-logo portfolio-contact-logo-whatsapp" aria-hidden="true">
      <svg viewBox="0 0 32 32" focusable="false">
        <circle cx="16" cy="16" r="15" fill="#25D366" />
        <path fill="#fff" d="M8.1 24.5 9.2 20a10 10 0 1 1 3.7 3.7zm5-4.2c2.1 1.3 4.8 2.2 7.4.1.5-.4 1-1.3.8-1.8-.1-.3-1.2-.8-2.1-1.2-.7-.3-1.2-.5-1.5.1l-.9 1.1c-.3.3-.5.4-.9.2-1.1-.5-2.5-1.3-3.7-3-.3-.4-.1-.7.1-.9l.7-.8c.2-.3.2-.5.1-.8l-.9-2.1c-.2-.5-.5-.5-.8-.5h-.7c-.3 0-.7.1-1 .5-.4.4-1.2 1.2-1.2 2.8s1.2 3.1 1.4 3.3c.2.3 2.3 3.5 5.2 4.8" />
      </svg>
    </span>
  );
  if (platform === "gmail") return (
    <span className="portfolio-contact-logo portfolio-contact-logo-gmail" aria-hidden="true">
      <svg viewBox="0 0 40 32" focusable="false">
        <path fill="#4285F4" d="M4 7.4 8 10v17H4a3 3 0 0 1-3-3V9.7c0-2.4 1.6-3.4 3-2.3" />
        <path fill="#34A853" d="M32 10 36 7.4c1.4-1.1 3 .1 3 2.3V24a3 3 0 0 1-3 3h-4z" />
        <path fill="#FBBC04" d="M32 10v17h4a3 3 0 0 0 3-3V12l-7-2" />
        <path fill="#EA4335" d="M4 7.4 20 19 36 7.4c1.5-1.1 3.4-.1 3.4 2.2v2.1L20 25 1 11.7V9.6c0-2.3 1.5-3.3 3-2.2" />
        <path fill="#C5221F" d="M4 27h4V10L4 7.4c-1.4-1.1-3 .1-3 2.3V24a3 3 0 0 0 3 3" />
      </svg>
    </span>
  );
  return null;
}

export default function Contact({ onBack, previewData }) {
  const [copyState, setCopyState] = useState({ id: null, message: "" });
  const { data, loading, error, retry } = usePublicPortfolioDocument(
    "contact",
    contactFallback,
    previewData
  );

  const links = Array.isArray(data.links)
    ? data.links.filter((item) => item && item.visible !== false && safeHref(item.url))
    : [];

  return (
    <PortfolioSection
      section="contact"
      number="09"
      eyebrow={["CONTACT / 07", "CONTACT / 08"].includes(data.eyebrow) ? "CONTACT / 09" : data.eyebrow}
      heading={data.heading}
      intro={data.intro}
      onBack={onBack}
      loading={loading}
      error={error}
      onRetry={retry}
    >
      {(data.availabilityHeading || data.availabilityText) && (
        <div className="portfolio-panel portfolio-availability">
          {data.availabilityHeading && <h2>{data.availabilityHeading}</h2>}
          {data.availabilityText && <p>{data.availabilityText}</p>}
        </div>
      )}

      {links.length === 0 && !loading && (
        <PortfolioEmpty
          title="Contact links coming soon"
          message="Professional contact options will appear here when added."
        />
      )}

      {links.map((item, index) => {
        const id = item.id || `contact-${index}`;
        const platform = contactPlatform(item);
        return <PortfolioCard
          key={id}
          title={item.label || "Contact"}
          subtitle={item.value}
          headerVisual={platform ? <ContactPlatformLogo platform={platform} /> : undefined}
        >
          <div className="portfolio-links">
            <PortfolioLink href={item.url}>
              {item.label || item.value || "Open link"}
            </PortfolioLink>
            {item.value && (
              <button
                type="button"
                className="portfolio-copy-button"
                aria-label={`Copy ${item.label || "contact detail"}`}
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(item.value);
                    setCopyState({ id, message: "Copied" });
                  } catch {
                    setCopyState({ id, message: "Could not copy" });
                  }
                }}
              >
                {copyState.id === id ? copyState.message : "Copy detail"}
              </button>
            )}
          </div>
          {copyState.id === id && <span className="portfolio-visually-hidden" role="status">{copyState.message}</span>}
        </PortfolioCard>;
      })}
    </PortfolioSection>
  );
}
