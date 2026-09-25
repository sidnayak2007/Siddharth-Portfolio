import { useState } from "react";
import { resumeFallback } from "../../data/portfolioDefaults";
import { usePublicPortfolioDocument } from "../../hooks/usePublicPortfolioDocument";
import { safeHref } from "../../utils/url";
import PortfolioImage from "./PortfolioImage";
import {
  PortfolioCard,
  PortfolioEmpty,
  PortfolioSection,
} from "./PortfolioSectionUI";

function isResumeImage(asset) {
  const url = safeHref(asset?.url);
  return Boolean(url && asset?.kind === "image" && !/\.pdf(?:[?#]|$)/i.test(url));
}

function downloadHref(url, name, index) {
  if (!url) return "";
  const cloudinaryPrefix = "https://res.cloudinary.com/zsvjuaee/image/upload/";
  const attachmentUrl = url.startsWith(cloudinaryPrefix)
    ? `${cloudinaryPrefix}fl_attachment:${encodeURIComponent(name || `Resume-page-${index + 1}`)}/${url.slice(cloudinaryPrefix.length)}`
    : url;
  return attachmentUrl;
}

function ResumeImage({ asset, index }) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const url = safeHref(asset.url);
  const name = asset.name || `Resume-page-${index + 1}.jpg`;
  return (
    <article className="portfolio-resume-page">
      <h3>{asset.label || `Page ${index + 1}`}</h3>
      {!loaded && !failed && <p className="portfolio-resume-image-status" role="status">Loading page image…</p>}
      {failed && <p className="portfolio-resume-image-status" role="alert">This page image could not be loaded. Try again later.</p>}
      {!failed && <PortfolioImage
        className="portfolio-resume-image"
        imageClassName="portfolio-resume-image-full"
        src={url}
        alt={`Resume page ${index + 1}`}
        caption="Enlarge resume page"
        original
        onLoad={() => setLoaded(true)}
        onImageError={() => setFailed(true)}
      />}
      <a className="portfolio-link" href={downloadHref(url, name, index)} download={name} target="_blank" rel="noopener noreferrer">
        Download page <span aria-hidden="true">↓</span>
      </a>
    </article>
  );
}

export default function Resume({ onBack, previewData }) {
  const { data, loading, error, retry } = usePublicPortfolioDocument(
    "resume",
    resumeFallback,
    previewData
  );

  const timeline = Array.isArray(data.timeline)
    ? data.timeline.filter((item) => item && (item.title || item.description))
    : [];
  const resumeImages = Array.isArray(data.resumeImages)
    ? data.resumeImages.filter(isResumeImage)
    : [];

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
      </div>

      {resumeImages.length > 0 && (
        <section className="portfolio-resume-document" aria-label="Resume images">
          <h2>Resume</h2>
          <p>Select a page to enlarge it, or download the original image.</p>
          <div className="portfolio-resume-pages">
            {resumeImages.map((asset, index) => (
              <ResumeImage key={asset.id || asset.path || asset.url} asset={asset} index={index} />
            ))}
          </div>
        </section>
      )}

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
