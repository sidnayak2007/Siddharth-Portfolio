import { contactFallback } from "../../data/portfolioDefaults";
import { usePublicPortfolioDocument } from "../../hooks/usePublicPortfolioDocument";
import { safeHref } from "../../utils/url";
import {
  PortfolioCard,
  PortfolioEmpty,
  PortfolioLink,
  PortfolioSection,
} from "./PortfolioSectionUI";

export default function Contact({ onBack }) {
  const { data, loading, error, retry } = usePublicPortfolioDocument(
    "contact",
    contactFallback
  );

  const links = Array.isArray(data.links)
    ? data.links.filter((item) => item && safeHref(item.url))
    : [];

  return (
    <PortfolioSection
      section="contact"
      number="08"
      eyebrow={data.eyebrow === "CONTACT / 07" ? "CONTACT / 08" : data.eyebrow}
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

      {links.map((item, index) => (
        <PortfolioCard
          key={item.id || `contact-${index}`}
          title={item.label || "Contact"}
          subtitle={item.value}
        >
          <div className="portfolio-links">
            <PortfolioLink href={item.url}>
              {item.label || item.value || "Open link"}
            </PortfolioLink>
          </div>
        </PortfolioCard>
      ))}
    </PortfolioSection>
  );
}
