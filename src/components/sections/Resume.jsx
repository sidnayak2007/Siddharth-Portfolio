import { resumeImageFallback } from "../../data/portfolioDefaults";
import { usePublicPortfolioDocument } from "../../hooks/usePublicPortfolioDocument";
import { PortfolioEmpty, PortfolioSection } from "./PortfolioSectionUI";
import "../../css/resume.css";

export default function Resume({ onBack, previewData }) {
  const { data, loading, error, retry } = usePublicPortfolioDocument(
    "resume",
    resumeImageFallback,
    previewData,
  );
  const previousImage = data.resumeImages?.[0];
  const source = data.imageUrl ?? (typeof previousImage === "string" ? previousImage : previousImage?.url);
  const imageUrl = typeof source === "string" && /^https:\/\//i.test(source)
    ? source
    : "";

  return (
    <PortfolioSection
      section="resume"
      number="CV"
      eyebrow="RESUME"
      heading="Resume"
      onBack={onBack}
      loading={loading}
      error={error}
      onRetry={retry}
    >
      {imageUrl ? (
        <div className="resume-image-frame">
          <img src={imageUrl} alt="Siddharth Nayak's complete resume" />
        </div>
      ) : !loading && (
        <PortfolioEmpty
          title="Resume image coming soon"
          message="The resume will appear here once it is uploaded in Admin."
        />
      )}
    </PortfolioSection>
  );
}
