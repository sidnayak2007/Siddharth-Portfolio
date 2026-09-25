import { experienceFallback } from "../../data/portfolioDefaults";
import { usePublicPortfolioDocument } from "../../hooks/usePublicPortfolioDocument";
import { safeHref } from "../../utils/url";
import PortfolioImage from "./PortfolioImage";
import {
  PortfolioCard,
  PortfolioEmpty,
  PortfolioMore,
  PortfolioSection,
  PortfolioTags,
} from "./PortfolioSectionUI";

function experiencePeriod(item) {
  return [item.startDate, item.current ? "Present" : item.endDate]
    .filter(Boolean)
    .join(" – ");
}

export default function Experience({ onBack, previewData }) {
  const { data, loading, error, retry } = usePublicPortfolioDocument(
    "experience",
    experienceFallback,
    previewData
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

        const responsibilities = Array.isArray(item.responsibilities)
          ? item.responsibilities.filter((value) => typeof value === "string" && value.trim())
          : [];
        const achievements = Array.isArray(item.achievements)
          ? item.achievements.filter((value) => typeof value === "string" && value.trim())
          : [];

        const media = Array.isArray(item.media)
          ? item.media.filter((asset) => asset && safeHref(asset.url))
          : [];
        const images = media.filter((asset) => asset.kind === "image" && !/\.pdf(?:[?#]|$)/i.test(asset.url));

        const hasDetails = Boolean(
          highlights.length ||
          responsibilities.length ||
          achievements.length ||
          images.length ||
          safeHref(item.certificateImageUrl)
        );

        const meta = [
          item.type,
          item.location,
          item.locationType,
          experiencePeriod(item),
        ]
          .filter(Boolean)
          .join(" · ");

        return (
          <PortfolioCard
            key={item.id || `experience-${index}`}
            className="portfolio-timeline-entry"
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
                {responsibilities.length > 0 && (
                  <div><strong>Responsibilities</strong><ul>{responsibilities.map((text, i) => <li key={`responsibility-${i}`}>{text}</li>)}</ul></div>
                )}

                {achievements.length > 0 && (
                  <div><strong>Achievements</strong><ul>{achievements.map((text, i) => <li key={`achievement-${i}`}>{text}</li>)}</ul></div>
                )}

                {highlights.length > 0 && (
                  <div><strong>Highlights</strong><ul>
                    {highlights.map((highlight, highlightIndex) => (
                      <li key={`${highlight}-${highlightIndex}`}>
                        {highlight}
                      </li>
                    ))}
                  </ul></div>
                )}

                {images.length > 0 && (
                  <div className="portfolio-gallery">
                    {images.map((asset, mediaIndex) => (
                      <PortfolioImage
                        key={asset.id || mediaIndex}
                        className="portfolio-gallery-item"
                        src={asset.url}
                        alt={asset.label || `${item.organization || "Experience"} image ${mediaIndex + 1}`}
                        caption={asset.label || asset.name || `Supporting image ${mediaIndex + 1}`}
                      />
                    ))}
                  </div>
                )}

                {safeHref(item.certificateImageUrl) && (
                  <PortfolioImage className="portfolio-detail-picture" src={item.certificateImageUrl} alt={`${item.organization || "Experience"} certificate`} caption="Certificate image" />
                )}

              </PortfolioMore>
            )}
          </PortfolioCard>
        );
      })}
    </PortfolioSection>
  );
}
