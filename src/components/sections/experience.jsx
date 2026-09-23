import { experienceFallback } from "../../data/portfolioDefaults";
import { usePublicPortfolioDocument } from "../../hooks/usePublicPortfolioDocument";
import {
  PortfolioCard,
  PortfolioEmpty,
  PortfolioLink,
  PortfolioMore,
  PortfolioSection,
  PortfolioTags,
  safeHref,
} from "./PortfolioSectionUI";

function experiencePeriod(item) {
  return [item.startDate, item.current ? "Present" : item.endDate]
    .filter(Boolean)
    .join(" – ");
}

export default function Experience({ onBack }) {
  const { data, loading, error, retry } = usePublicPortfolioDocument(
    "experience",
    experienceFallback
  );

  const items = Array.isArray(data.items)
    ? data.items.filter((item) => item && (item.role || item.organization))
    : [];

  return (
    <PortfolioSection
      section="experience"
      number="02"
      heading={data.heading}
      intro={data.intro}
      onBack={onBack}
      loading={loading}
      error={error}
      onRetry={retry}
    >
      {items.length === 0 && !loading && (
        <PortfolioEmpty
          title="Experience coming soon"
          message="Internships, roles and responsibilities will appear here when added."
        />
      )}

      {items.map((item, index) => {
        const highlights = Array.isArray(item.highlights)
          ? item.highlights.filter(
              (value) => typeof value === "string" && value.trim()
            )
          : [];

        const media = Array.isArray(item.media)
          ? item.media.filter((asset) => asset && safeHref(asset.url))
          : [];

        const hasDetails = Boolean(
          highlights.length ||
          media.length ||
          safeHref(item.certificateUrl)
        );

        const meta = [
          item.type,
          item.location,
          experiencePeriod(item),
        ]
          .filter(Boolean)
          .join(" · ");

        return (
          <PortfolioCard
            key={item.id || `experience-${index}`}
            title={item.role || "Position"}
            subtitle={item.organization}
            image={item.logoUrl}
            imageAlt={item.organization ? `${item.organization} logo` : ""}
            meta={meta}
            badge={item.current ? "Current position" : undefined}
          >
            {item.summary && <p>{item.summary}</p>}

            <PortfolioTags
              items={item.skills}
              label="Associated skills"
            />

            {hasDetails && (
              <PortfolioMore label="View role details">
                {highlights.length > 0 && (
                  <ul>
                    {highlights.map((highlight, highlightIndex) => (
                      <li key={`${highlight}-${highlightIndex}`}>
                        {highlight}
                      </li>
                    ))}
                  </ul>
                )}

                {(media.length > 0 || safeHref(item.certificateUrl)) && (
                  <div className="portfolio-links">
                    {safeHref(item.certificateUrl) && (
                      <PortfolioLink href={item.certificateUrl}>
                        Certificate
                      </PortfolioLink>
                    )}

                    {media.map((asset, mediaIndex) => (
                      <PortfolioLink
                        href={asset.url}
                        key={asset.id || mediaIndex}
                      >
                        {asset.label || asset.name || "Attached media"}
                      </PortfolioLink>
                    ))}
                  </div>
                )}
              </PortfolioMore>
            )}
          </PortfolioCard>
        );
      })}
    </PortfolioSection>
  );
}