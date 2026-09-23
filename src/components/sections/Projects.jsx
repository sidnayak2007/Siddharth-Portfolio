import { projectsFallback } from "../../data/portfolioDefaults";
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

function shortDescription(value) {
  if (typeof value !== "string") return "";

  const text = value.trim();
  return text.length > 190
    ? `${text.slice(0, 187).trimEnd()}…`
    : text;
}

export default function Projects({ onBack }) {
  const { data, loading, error, retry } = usePublicPortfolioDocument(
    "projects",
    projectsFallback
  );

  const items = Array.isArray(data.items)
    ? data.items.filter((item) => item && (item.title || item.description))
    : [];

  return (
    <PortfolioSection
      section="projects"
      number="03"
      heading={data.heading}
      intro={data.intro}
      onBack={onBack}
      loading={loading}
      error={error}
      onRetry={retry}
    >
      {items.length === 0 && !loading && (
        <PortfolioEmpty
          title="Projects coming soon"
          message="Completed work and current builds will appear here when added."
        />
      )}

      {items.map((item, index) => {
        const technologies = Array.isArray(item.technologies)
          ? item.technologies
          : [];

        const contributors = Array.isArray(item.contributors)
          ? item.contributors
          : [];

        const media = Array.isArray(item.media)
          ? item.media.filter((asset) => asset && safeHref(asset.url))
          : [];

        const dates = [item.startDate, item.endDate]
          .filter(Boolean)
          .join(" – ");

        const hasMore = Boolean(
          item.details ||
          (
            typeof item.description === "string" &&
            item.description.length > 190
          ) ||
          contributors.length ||
          media.length ||
          item.imageUrl ||
          technologies.length > 6
        );

        return (
          <PortfolioCard
            key={item.id || `project-${index}`}
            title={item.title || "Project"}
            subtitle={item.type}
            meta={dates}
            image={item.imageUrl}
            imageAlt={
              item.title
                ? `${item.title} project image`
                : "Project image"
            }
            badge={item.featured ? "Featured project" : undefined}
          >
            {item.description && (
              <p>{shortDescription(item.description)}</p>
            )}

            <PortfolioTags
              items={technologies.slice(0, 6)}
              label="Technologies and skills"
            />

            {(safeHref(item.projectUrl) || safeHref(item.githubUrl)) && (
              <div className="portfolio-links">
                <PortfolioLink href={item.projectUrl}>Live demo</PortfolioLink>
                <PortfolioLink href={item.githubUrl}>GitHub</PortfolioLink>
              </div>
            )}

            {hasMore && (
              <PortfolioMore label="View project details">
                {item.imageUrl && (
                  <img
                    className="portfolio-detail-image"
                    src={item.imageUrl}
                    alt={`${item.title || "Project"} preview`}
                    loading="lazy"
                  />
                )}

                {item.details && <p>{item.details}</p>}

                {!item.details && item.description?.length > 190 && (
                  <p>{item.description}</p>
                )}

                {technologies.length > 6 && (
                  <PortfolioTags
                    items={technologies.slice(6)}
                    label="Additional technologies"
                  />
                )}

                {contributors.length > 0 && (
                  <p>
                    <strong>Contributors: </strong>
                    {contributors
                      .filter(
                        (name) =>
                          typeof name === "string" &&
                          name.trim()
                      )
                      .join(", ")}
                  </p>
                )}

                {media.length > 0 && (
                  <div className="portfolio-links">
                    {media.map((asset, mediaIndex) => (
                      <PortfolioLink
                        href={asset.url}
                        key={asset.id || mediaIndex}
                      >
                        {asset.label || asset.name || "Project attachment"}
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