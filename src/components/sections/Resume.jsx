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
  const cloudinaryPdf = /^https:\/\/res\.cloudinary\.com\/zsvjuaee\/image\/upload\//i.test(pdfUrl || "");
  const downloadUrl = cloudinaryPdf
    ? pdfUrl.replace("/image/upload/", "/image/upload/fl_attachment/")
    : pdfUrl;

  return (
    <PortfolioSection
      section="resume"
      number="07"
      eyebrow={data.eyebrow === "RESUME / 06" ? "RESUME / 07" : data.eyebrow}
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
        {pdfUrl && <div className="portfolio-resume-actions">
          <PortfolioLink href={pdfUrl}>View PDF</PortfolioLink>
          <a className="portfolio-link" href={downloadUrl} target="_blank" rel="noopener noreferrer" download={cloudinaryPdf ? undefined : "Siddharth-Nayak-Resume.pdf"}>Download PDF <span aria-hidden="true">↓</span></a>
        </div>}
      </div>

      {pdfUrl && <section className="portfolio-resume-document" aria-label="Resume PDF preview">
        <h2>Resume preview</h2>
        <p>If the preview is unavailable on your device, use View PDF above.</p>
        <iframe className="portfolio-resume-preview" src={`${pdfUrl}#toolbar=0`} title="Siddharth Nayak resume PDF" loading="lazy" />
      </section>}

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
