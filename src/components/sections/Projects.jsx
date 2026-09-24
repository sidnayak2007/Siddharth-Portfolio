import { projectsFallback } from "../../data/portfolioDefaults";
import { usePublicPortfolioDocument } from "../../hooks/usePublicPortfolioDocument";
import { safeHref } from "../../utils/url";
import PortfolioImage from "./PortfolioImage";
import {
  PortfolioCard,
  PortfolioEmpty,
  PortfolioLink,
  PortfolioMore,
  PortfolioSection,
  PortfolioTags,
} from "./PortfolioSectionUI";

function shortDescription(value) {
  if (typeof value !== "string") return "";

  const text = value.trim();
  return text.length > 190
    ? `${text.slice(0, 187).trimEnd()}…`
    : text;
}

export default function Projects({ onBack, previewData }) {
  const { data, loading, error, retry } = usePublicPortfolioDocument(
    "projects",
    projectsFallback,
    previewData
  );

  const items = Array.isArray(data.items)
    ? data.items.filter((item) => item && item.visible !== false && (item.title || item.description))
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

        const skills = Array.isArray(item.skills) ? item.skills : [];

        const contributors = Array.isArray(item.contributors)
          ? item.contributors
          : [];

        const media = Array.isArray(item.media)
          ? item.media.filter((asset) => asset && safeHref(asset.url))
          : [];
        const gallery = media.filter((asset) => asset.kind === "image" || asset.path?.includes("/images/") || /\.(jpe?g|png|webp|gif)(?:\?|$)/i.test(asset.url));
        const attachments = media.filter((asset) => !gallery.includes(asset));

        const dates = [item.startDate, item.endDate]
          .filter(Boolean)
          .join(" – ");

        const hasMore = Boolean(
          item.details ||
          item.contribution ||
          item.aiProcess ||
          item.challenges ||
          (
            typeof item.description === "string" &&
            item.description.length > 190
          ) ||
          contributors.length ||
          media.length ||
          technologies.length > 6 ||
          skills.length
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

            {item.imageUrl && (
              <PortfolioImage
                className="portfolio-project-cover"
                imageClassName="portfolio-project-cover-image"
                src={item.imageUrl}
                alt={`${item.title || "Project"} cover`}
                caption="See full picture"
              />
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
                {item.details && <div className="portfolio-case-study-part"><h3>Overview</h3><p>{item.details}</p></div>}

                {!item.details && item.description?.length > 190 && (
                  <div className="portfolio-case-study-part"><h3>Overview</h3><p>{item.description}</p></div>
                )}
                {item.contribution && <div className="portfolio-case-study-part"><h3>My contribution</h3><p>{item.contribution}</p></div>}
                {item.aiProcess && <div className="portfolio-case-study-part"><h3>AI-assisted process</h3><p>{item.aiProcess}</p></div>}
                {item.challenges && <div className="portfolio-case-study-part"><h3>Challenges solved</h3><p>{item.challenges}</p></div>}
                {technologies.length > 0 && <div className="portfolio-case-study-part"><h3>Tools used</h3><PortfolioTags items={technologies} label="Tools used" /></div>}

                {skills.length > 0 && (
                  <div>
                    <strong>Associated skills</strong>
                    <PortfolioTags items={skills} label="Associated skills" />
                  </div>
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

                {gallery.length > 0 && (
                  <div className="portfolio-gallery">
                    {gallery.map((asset, mediaIndex) => (
                      <PortfolioImage
                        className="portfolio-gallery-item"
                        src={asset.url}
                        key={asset.id || mediaIndex}
                        alt={asset.label || `${item.title || "Project"} gallery image ${mediaIndex + 1}`}
                        caption={asset.label || asset.name || `Gallery image ${mediaIndex + 1}`}
                      />
                    ))}
                  </div>
                )}

                {attachments.length > 0 && (
                  <div className="portfolio-links">
                    {attachments.map((asset, mediaIndex) => <PortfolioLink key={asset.id || mediaIndex} href={asset.url}>{asset.label || asset.name || "Project attachment"}</PortfolioLink>)}
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
