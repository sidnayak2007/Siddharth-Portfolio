import profileImage from "../../assets/profile.png";
import { aboutFallback } from "../../data/portfolioDefaults";
import { usePublicPortfolioDocument } from "../../hooks/usePublicPortfolioDocument";
import {
  PortfolioLink,
  PortfolioMore,
  PortfolioSection,
  PortfolioTags,
  safeHref,
} from "./PortfolioSectionUI";

export default function About({ onBack }) {
  const { data: about, loading, error, retry } =
    usePublicPortfolioDocument("about", aboutFallback);

  const links = Array.isArray(about.links) ? about.links : [];
  const focus = Array.isArray(about.focus) ? about.focus : [];
  const stats = Array.isArray(about.stats) ? about.stats : [];

  const hasMore = Boolean(
    about.description || about.quote || focus.length || stats.length
  );

  return (
    <PortfolioSection
      section="about"
      number="01"
      heading="About"
      intro="The person behind the projects."
      onBack={onBack}
      loading={loading}
      error={error}
      onRetry={retry}
    >
      <article className="portfolio-card portfolio-about-card">
        <div className="portfolio-profile">
          <img
            className="portfolio-profile-photo"
            src={about.photoUrl || profileImage}
            alt={about.name ? `Portrait of ${about.name}` : "Profile portrait"}
          />

          <div className="portfolio-profile-info">
            <h2>{about.name || aboutFallback.name}</h2>
            {about.headline && (
              <p><strong>{about.headline}</strong></p>
            )}
            {about.location && <p>{about.location}</p>}
            {about.intro && <p>{about.intro}</p>}
          </div>
        </div>

        <PortfolioTags items={about.tags} label="Areas of interest" />

        {links.length > 0 && (
          <div className="portfolio-links" aria-label="Professional links">
            {links
              .filter(
                (link) =>
                  link &&
                  link.visible !== false &&
                  safeHref(link.url)
              )
              .map((link, index) => (
                <PortfolioLink
                  href={link.url}
                  key={link.id || index}
                >
                  {link.label || "Professional link"}
                </PortfolioLink>
              ))}
          </div>
        )}

        {hasMore && (
          <PortfolioMore label="View more about me">
            {about.description && <p>{about.description}</p>}
            {about.quote && <p>“{about.quote}”</p>}

            {focus.length > 0 && (
              <ul>
                {focus
                  .filter((item) => item?.title || item?.text)
                  .map((item, index) => (
                    <li key={`${item.title || "focus"}-${index}`}>
                      <strong>{item.title}</strong>
                      {item.title && item.text ? " — " : ""}
                      {item.text}
                    </li>
                  ))}
              </ul>
            )}

            {stats.length > 0 && (
              <PortfolioTags
                label="Profile highlights"
                items={stats
                  .filter((item) => item?.value)
                  .map((item) =>
                    [item.value, item.label].filter(Boolean).join(" · ")
                  )}
              />
            )}
          </PortfolioMore>
        )}
      </article>
    </PortfolioSection>
  );
}