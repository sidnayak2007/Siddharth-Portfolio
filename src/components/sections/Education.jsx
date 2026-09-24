import { educationFallback } from "../../data/portfolioDefaults";
import { usePublicPortfolioDocument } from "../../hooks/usePublicPortfolioDocument";
import { safeHref } from "../../utils/url";
import PortfolioImage from "./PortfolioImage";
import {
  PortfolioCard,
  PortfolioEmpty,
  PortfolioLink,
  PortfolioMore,
  PortfolioSection,
} from "./PortfolioSectionUI";

function shortText(value, limit = 175) {
  if (typeof value !== "string") return "";

  const text = value.trim();
  return text.length > limit
    ? `${text.slice(0, limit - 3).trimEnd()}…`
    : text;
}

function textList(value) {
  return Array.isArray(value)
    ? value.filter(
        (item) =>
          typeof item === "string" &&
          item.trim()
      )
    : [];
}

export default function Education({ onBack, previewData }) {
  const { data, loading, error, retry } =
    usePublicPortfolioDocument("education", educationFallback, previewData);

  const items = Array.isArray(data.items)
    ? data.items.filter(
        (item) =>
          item &&
          (item.institution || item.qualification)
      )
    : [];

  return (
    <PortfolioSection
      section="education"
      number="05"
      heading={data.heading}
      intro={data.intro}
      onBack={onBack}
      loading={loading}
      error={error}
      onRetry={retry}
    >
      {items.length === 0 && !loading && (
        <PortfolioEmpty
          title="Education coming soon"
          message="Institutions, qualifications and achievements will appear here when added."
        />
      )}

      {items.map((item, index) => {
        const highlights = textList(item.highlights);
        const awards = textList(item.awards);
        const achievements = textList(item.achievements);
        const certifications = textList(item.certifications);

        const media = Array.isArray(item.media)
          ? item.media.filter(
              (asset) =>
                asset &&
                safeHref(asset.url)
            )
          : [];

        const period = [
          item.startDate,
          item.current ? "Present" : item.endDate,
        ]
          .filter(Boolean)
          .join(" – ");

        const meta = [item.location, period]
          .filter(Boolean)
          .join(" · ");

        const longDescription =
          typeof item.description === "string" &&
          item.description.length > 175;

        const hasMore = Boolean(
          longDescription ||
          item.activities ||
          item.grade ||
          highlights.length ||
          awards.length ||
          achievements.length ||
          certifications.length ||
          media.length ||
          item.imageUrl
        );

        return (
          <PortfolioCard
            key={item.id || `education-${index}`}
            className="portfolio-timeline-entry"
            title={item.institution || "Institution"}
            subtitle={[
              item.qualification,
              item.field,
            ]
              .filter(Boolean)
              .join(" · ")}
            meta={meta}
            image={item.logoUrl || item.imageUrl}
            imageAlt={
              item.institution
                ? `${item.institution} logo`
                : "Institution image"
            }
            badge={
              item.current
                ? "Currently studying"
                : undefined
            }
          >
            {item.description && (
              <p>{shortText(item.description)}</p>
            )}

            {hasMore && (
              <PortfolioMore label="View education details">
                {longDescription && <p>{item.description}</p>}

                {item.grade && (
                  <p><strong>Grade:</strong> {item.grade}</p>
                )}

                {item.activities && (
                  <p><strong>Activities:</strong> {item.activities}</p>
                )}

                {highlights.length > 0 && (
                  <div>
                    <p><strong>Highlights</strong></p>
                    <ul>
                      {highlights.map((text, i) => (
                        <li key={`highlight-${i}`}>{text}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {certifications.length > 0 && (
                  <div>
                    <p><strong>Certifications</strong></p>
                    <ul>
                      {certifications.map((text, i) => (
                        <li key={`certificate-${i}`}>{text}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {awards.length > 0 && (
                  <div>
                    <p><strong>Awards</strong></p>
                    <ul>
                      {awards.map((text, i) => (
                        <li key={`award-${i}`}>{text}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {achievements.length > 0 && (
                  <div>
                    <p><strong>Achievements</strong></p>
                    <ul>{achievements.map((text, i) => <li key={`achievement-${i}`}>{text}</li>)}</ul>
                  </div>
                )}

                {item.imageUrl && (
                  <PortfolioImage
                    className="portfolio-detail-picture"
                    imageClassName="portfolio-detail-image"
                    src={item.imageUrl}
                    alt={`${item.institution || "Institution"} media`}
                  />
                )}

                {media.length > 0 && (
                  <div className="portfolio-links">
                    {media.map((asset, mediaIndex) => (
                      <PortfolioLink
                        href={asset.url}
                        key={asset.id || mediaIndex}
                      >
                        {asset.label ||
                          asset.name ||
                          "Education attachment"}
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
