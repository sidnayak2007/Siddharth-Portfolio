import {
  experienceFallback,
  projectsFallback,
  skillsFallback,
} from "../../data/portfolioDefaults";
import { usePublicPortfolioDocument } from "../../hooks/usePublicPortfolioDocument";
import {
  PortfolioCard,
  PortfolioEmpty,
  PortfolioMore,
  PortfolioSection,
  PortfolioTags,
} from "./PortfolioSectionUI";

function normaliseSkill(value) {
  if (typeof value === "string") {
    return {
      name: value,
      experienceIds: [],
      projectIds: [],
    };
  }

  if (!value || typeof value !== "object") return null;

  return {
    name: typeof value.name === "string" ? value.name : "",
    experienceIds: Array.isArray(value.experienceIds)
      ? value.experienceIds
      : [],
    projectIds: Array.isArray(value.projectIds)
      ? value.projectIds
      : [],
  };
}

const skillGroups = ["Finance", "Technical Skills", "Professional Skills"];

function groupFor(category) {
  if (skillGroups.includes(category.group)) return category.group;
  const title = String(category.title || "").toLowerCase();
  if (/finance|account|investment|banking/.test(title)) return "Finance";
  if (/web|develop|technical|technology|software|program|cod(e|ing)|digital tool/.test(title)) return "Technical Skills";
  return "Professional Skills";
}

export default function Skills({ onBack, previewData }) {
  const { data, loading, error, retry } = usePublicPortfolioDocument(
    "skills",
    skillsFallback,
    previewData
  );

  const { data: experience } = usePublicPortfolioDocument(
    "experience",
    experienceFallback
  );

  const { data: projects } = usePublicPortfolioDocument(
    "projects",
    projectsFallback
  );

  const categories = Array.isArray(data.categories)
    ? data.categories.filter(
        (category) => category && typeof category === "object"
      )
    : [];

  const experienceItems = Array.isArray(experience.items)
    ? experience.items
    : [];

  const projectItems = Array.isArray(projects.items)
    ? projects.items
    : [];

  return (
    <PortfolioSection
      section="skills"
      number="04"
      heading={data.heading}
      intro={data.intro}
      onBack={onBack}
      loading={loading}
      error={error}
      onRetry={retry}
    >
      {categories.length === 0 && !loading && (
        <PortfolioEmpty
          title="Skills coming soon"
          message="Skills and tools will be grouped here when added."
        />
      )}

      {skillGroups.filter((group) => categories.some((category) => groupFor(category) === group)).map((group) => (
        <section className="portfolio-skill-group" key={group} aria-label={group}>
          <h2>{group}</h2>
          {categories.filter((category) => groupFor(category) === group).map((category, index) => {
        const skills = (
          Array.isArray(category.skills) ? category.skills : []
        )
          .map(normaliseSkill)
          .filter((skill) => skill?.name?.trim());

        const associations = skills
          .map((skill) => {
            const roles = experienceItems
              .filter(
                (entry) =>
                  entry &&
                  skill.experienceIds.includes(entry.id)
              )
              .map((entry) =>
                [entry.role, entry.organization]
                  .filter(Boolean)
                  .join(" at ")
              );

            const builds = projectItems
              .filter(
                (entry) =>
                  entry &&
                  skill.projectIds.includes(entry.id)
              )
              .map((entry) => entry.title)
              .filter(Boolean);

            return {
              name: skill.name,
              roles,
              builds,
            };
          })
          .filter(
            (skill) =>
              skill.roles.length ||
              skill.builds.length
          );

        return (
          <PortfolioCard
            key={category.id || `skill-category-${index}`}
            title={category.title || "Skills"}
            subtitle={`${skills.length} ${
              skills.length === 1 ? "skill" : "skills"
            }`}
          >
            {skills.length ? (
              <PortfolioTags
                items={skills.map((skill) => skill.name)}
                label={category.title || "Skills"}
              />
            ) : (
              <p>No skills have been added to this category yet.</p>
            )}

            {associations.length > 0 && (
              <PortfolioMore label="View related work">
                <ul>
                  {associations.map((skill, skillIndex) => (
                    <li key={`${skill.name}-${skillIndex}`}>
                      <strong>{skill.name}</strong>
                      {skill.roles.length > 0 &&
                        ` · Experience: ${skill.roles.join(", ")}`}
                      {skill.builds.length > 0 &&
                        ` · Projects: ${skill.builds.join(", ")}`}
                    </li>
                  ))}
                </ul>
              </PortfolioMore>
            )}
          </PortfolioCard>
        );
          })}
        </section>
      ))}
    </PortfolioSection>
  );
}
