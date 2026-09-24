import { certificationsFallback } from "../../data/portfolioDefaults";
import { usePublicPortfolioDocument } from "../../hooks/usePublicPortfolioDocument";
import { safeHref } from "../../utils/url";
import PortfolioImage from "./PortfolioImage";
import { PortfolioEmpty, PortfolioLink, PortfolioSection, PortfolioTags } from "./PortfolioSectionUI";
import "../../css/certifications.css";

function displayMonth(value) {
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(value || "")) return value || "";
  return new Intl.DateTimeFormat("en", { month: "short", year: "numeric", timeZone: "UTC" })
    .format(new Date(`${value}-01T00:00:00Z`));
}

export default function Certifications({ onBack, previewData }) {
  const { data, loading, error, retry } = usePublicPortfolioDocument(
    "certifications",
    certificationsFallback,
    previewData,
  );
  const items = Array.isArray(data.items)
    ? data.items.filter((item) => item && item.visible !== false && item.title)
    : [];

  return (
    <PortfolioSection
      section="certifications"
      number="06"
      eyebrow={data.eyebrow}
      heading={data.heading}
      intro={data.intro}
      onBack={onBack}
      loading={loading}
      error={error}
      onRetry={retry}
    >
      {items.length === 0 && !loading && (
        <PortfolioEmpty
          title="Certifications coming soon"
          message="Certificates and credentials will appear here when published."
        />
      )}

      {items.map((item, index) => {
        const issueDate = displayMonth(item.issuedOn);
        const expiryDate = displayMonth(item.expiresOn);
        return (
          <article className="portfolio-card certification-card" key={item.id || `certification-${index}`}>
            <div className="certification-card-media">
              {item.imageUrl ? (
                <PortfolioImage
                  className="certification-picture"
                  src={item.imageUrl}
                  alt={`${item.title} certificate`}
                />
              ) : (
                <div className="certification-placeholder" aria-hidden="true">
                  <span>✦</span>
                  <strong>Credential</strong>
                </div>
              )}
            </div>
            <div className="certification-card-copy">
              <span className="certification-kicker">CERTIFICATION / {String(index + 1).padStart(2, "0")}</span>
              <h2>{item.title}</h2>
              {item.issuer && <p className="certification-issuer">Issued by {item.issuer}</p>}
              {(issueDate || expiryDate) && (
                <p className="certification-date">
                  {issueDate && `Issued ${issueDate}`}
                  {issueDate && expiryDate && " · "}
                  {expiryDate && `Expires ${expiryDate}`}
                </p>
              )}
              {item.description && <p className="certification-description">{item.description}</p>}
              {item.credentialId && <p className="certification-id"><strong>Credential ID</strong> {item.credentialId}</p>}
              <PortfolioTags items={item.skills} label="Certification skills" />
              {(safeHref(item.credentialUrl) || safeHref(item.pdfUrl)) && (
                <div className="portfolio-links">
                  <PortfolioLink href={item.credentialUrl}>Verify credential</PortfolioLink>
                  <PortfolioLink href={item.pdfUrl}>View certificate PDF</PortfolioLink>
                </div>
              )}
            </div>
          </article>
        );
      })}
    </PortfolioSection>
  );
}
