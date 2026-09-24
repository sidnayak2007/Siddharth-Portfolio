import { resumeFallback } from "../../data/portfolioDefaults";
import { usePublicPortfolioDocument } from "../../hooks/usePublicPortfolioDocument";
import { safeHref } from "../../utils/url";
import {
  PortfolioCard,
  PortfolioEmpty,
  PortfolioLink,
  PortfolioSection,
} from "./PortfolioSectionUI";

export default function Resume({ onBack, previewData }) {
  const { data, loading, error, retry } = usePublicPortfolioDocument(
    "resume",
    resumeFallback,
    previewData
  );

  const timeline = Array.isArray(data.timeline)
    ? data.timeline.filter((item) => item && (item.title || item.description))
    : [];
  const pdfUrl = safeHref(data.pdfUrl);

  return (
    <PortfolioSection
      section="resume"
      number="06"
      eyebrow={data.eyebrow}
      heading={data.heading}
      intro={data.intro}
      onBack={onBack}
      loading={loading}
      error={error}
      onRetry={retry}
    >
      <div className="portfolio-panel portfolio-resume-download">
        <div>
          <h2>{data.title || "Resume"}</h2>
          <p>{data.description || "An overview of my education, experience and projects."}</p>
          {data.lastUpdated && <p>Updated {data.lastUpdated}</p>}
        </div>
        {pdfUrl && <PortfolioLink href={pdfUrl}>View resume</PortfolioLink>}
      </div>

      {timeline.length === 0 && !loading && (
        <PortfolioEmpty
          title="Resume timeline coming soon"
          message="Education, work and project milestones will appear here when added."
        />
      )}

      {timeline.map((item, index) => (
        <PortfolioCard
          key={item.id || `resume-${index}`}
          title={item.title || "Milestone"}
          meta={item.year}
        >
          {item.description && <p>{item.description}</p>}
        </PortfolioCard>
      ))}
    </PortfolioSection>
  );
}
