import { useState } from "react";
import { contactFallback } from "../../data/portfolioDefaults";
import { usePublicPortfolioDocument } from "../../hooks/usePublicPortfolioDocument";
import { safeHref } from "../../utils/url";
import gmailLogo from "../../assets/download.png";
import whatsappLogo from "../../assets/download (7).jpeg";
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
  if (platform === "whatsapp" || platform === "gmail") {
    const isWhatsapp = platform === "whatsapp";
    return (
      <span className={`portfolio-contact-logo portfolio-contact-logo-${platform}`} aria-hidden="true">
        <img src={isWhatsapp ? whatsappLogo : gmailLogo} alt="" />
      </span>
    );
  }
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
