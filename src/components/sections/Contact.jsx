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
        return <PortfolioCard
          key={id}
          title={item.label || "Contact"}
          subtitle={item.value}
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
