import {
  useEffect,
  useState,
} from "react";

import {
  doc,
  getDoc,
} from "firebase/firestore";

import {
  db,
} from "../../firebase/firebase";

import {
  skillsFallback,
} from "../../data/portfolioDefaults";

import "../../css/skills.css";

/* =========================================================
   CONFIG
========================================================= */

const ACCENTS = [
  "cyan",
  "blue",
  "violet",
  "green",
];

/* =========================================================
   HELPERS
========================================================= */

function cleanText(
  value,
  fallback = ""
) {
  return typeof value ===
    "string"
    ? value.trim()
    : fallback;
}

function normalizeSkills(
  data
) {
  const source =
    data &&
    typeof data ===
      "object"
      ? data
      : {};

  const rawCategories =
    Array.isArray(
      source.categories
    )
      ? source.categories
      : skillsFallback.categories;

  return {
    eyebrow:
      cleanText(
        source.eyebrow,
        skillsFallback.eyebrow
      ),

    heading:
      cleanText(
        source.heading,
        skillsFallback.heading
      ),

    intro:
      cleanText(
        source.intro,
        skillsFallback.intro
      ),

    categories:
      rawCategories
        .map(
          (
            category,
            index
          ) => ({
            id:
              cleanText(
                category?.id
              ) ||
              `skill-category-${index + 1}`,

            title:
              cleanText(
                category?.title
              ),

            skills:
              Array.isArray(
                category?.skills
              )
                ? category.skills
                    .map(
                      (skill) =>
                        cleanText(
                          skill
                        )
                    )
                    .filter(
                      Boolean
                    )
                : [],

            accent:
              ACCENTS[
                index %
                  ACCENTS.length
              ],
          })
        )
        .filter(
          (category) =>
            category.title ||
            category.skills.length >
              0
        ),
  };
}

/* =========================================================
   SKILLS
========================================================= */

function Skills({
  onBack,
}) {
  const [
    skillsData,
    setSkillsData,
  ] = useState(
    () =>
      normalizeSkills(
        skillsFallback
      )
  );

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  /* =========================================================
     LOAD FIRESTORE
  ========================================================= */

  useEffect(() => {
    let cancelled =
      false;

    async function loadSkills() {
      try {
        const skillsRef =
          doc(
            db,
            "portfolio",
            "skills"
          );

        const snapshot =
          await getDoc(
            skillsRef
          );

        if (cancelled) {
          return;
        }

        if (
          snapshot.exists()
        ) {
          setSkillsData(
            normalizeSkills(
              snapshot.data()
            )
          );
        } else {
          setSkillsData(
            normalizeSkills(
              skillsFallback
            )
          );
        }
      } catch (loadError) {
        if (cancelled) {
          return;
        }

        console.error(
          "Could not load skills:",
          loadError
        );

        setSkillsData(
          normalizeSkills(
            skillsFallback
          )
        );

        setError(
          "Skills could not be loaded from Firebase."
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadSkills();

    return () => {
      cancelled = true;
    };
  }, []);

  const categories =
    skillsData.categories;

  /*
  Featured cards are automatically generated
  from the Admin-managed categories.

  First skill = featured skill.
  Category title = featured category.
  */

  const featuredSkills =
    categories
      .slice(
        0,
        4
      )
      .map(
        (category) => ({
          label:
            category.title,

          value:
            category.skills[
              0
            ] ||
            "SKILL",
        })
      );

  const heroTags =
    categories
      .slice(
        0,
        4
      )
      .map(
        (category) =>
          category.title
      );

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <main
      className="skills-page"
      aria-busy={
        loading
      }
    >
      {/* =====================================================
          BACKGROUND
      ===================================================== */}

      <div
        className="skills-background"
        aria-hidden="true"
      >
        <div className="skills-grid" />

        <div className="skills-glow skills-glow-one" />

        <div className="skills-glow skills-glow-two" />

        <div className="skills-ring skills-ring-one" />

        <div className="skills-ring skills-ring-two" />
      </div>

      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="skills-header">
        <button
          type="button"
          className="skills-back"
          onClick={() => {
            onBack?.();
          }}
          aria-label="Back to portfolio home"
        >
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M19 12H5" />

            <path d="m11 18-6-6 6-6" />
          </svg>

          <span>
            Back
          </span>
        </button>

        <div className="skills-header-center">
          <span>
            TOOLKIT
          </span>

          <strong>
            Skills
          </strong>
        </div>

        <div
          className="skills-header-index"
          aria-label="Section 04"
        >
          <span>
            SECTION
          </span>

          <strong>
            04
          </strong>
        </div>
      </header>

      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="skills-hero">
        <div className="skills-hero-copy">
          <span className="skills-eyebrow">
            {
              skillsData.eyebrow
            }
          </span>

          <h1>
            {
              skillsData.heading
            }
          </h1>

          {skillsData.intro && (
            <p>
              {
                skillsData.intro
              }
            </p>
          )}

          {heroTags.length >
            0 && (
            <div
              className="skills-hero-tags"
              aria-label="Core skill areas"
            >
              {heroTags.map(
                (
                  tag,
                  index
                ) => (
                  <span
                    key={`${tag}-${index}`}
                  >
                    {
                      tag
                    }
                  </span>
                )
              )}
            </div>
          )}
        </div>

        {/* ===================================================
            HERO VISUAL
        =================================================== */}

        <aside
          className="skills-hero-visual"
          aria-label="Skills overview"
        >
          <div className="skills-visual-top">
            <span>
              TOOLKIT
            </span>

            <span>
              2026
            </span>
          </div>

          <div
            className="skills-core"
            aria-hidden="true"
          >
            <div className="skills-core-ring skills-core-ring-one" />

            <div className="skills-core-ring skills-core-ring-two" />

            <div className="skills-core-center">
              <span>
                SN
              </span>

              <strong>
                BUILD
              </strong>
            </div>

            <div className="skills-node skills-node-one">
              {categories[
                0
              ]?.title
                ?.slice(
                  0,
                  3
                )
                .toUpperCase() ||
                "WEB"}
            </div>

            <div className="skills-node skills-node-two">
              {categories[
                1
              ]?.title
                ?.slice(
                  0,
                  3
                )
                .toUpperCase() ||
                "DEV"}
            </div>

            <div className="skills-node skills-node-three">
              {categories[
                2
              ]?.title
                ?.slice(
                  0,
                  3
                )
                .toUpperCase() ||
                "UI"}
            </div>

            <div className="skills-node skills-node-four">
              {categories[
                3
              ]?.title
                ?.slice(
                  0,
                  3
                )
                .toUpperCase() ||
                "BIZ"}
            </div>
          </div>

          <div className="skills-visual-bottom">
            <span>
              LEARN
            </span>

            <i />

            <span>
              BUILD
            </span>

            <i />

            <span>
              ITERATE
            </span>
          </div>
        </aside>
      </section>

      {/* =====================================================
          FIREBASE ERROR
      ===================================================== */}

      {error && (
        <div
          className="skills-content-error"
          role="status"
        >
          {error}
        </div>
      )}

      {/* =====================================================
          FEATURED SKILLS
      ===================================================== */}

      {featuredSkills.length >
        0 && (
        <section
          className="skills-featured"
          aria-label="Core toolkit"
        >
          {featuredSkills.map(
            (
              skill,
              index
            ) => (
              <article
                className="skills-featured-item"
                key={`${skill.label}-${index}`}
              >
                <span>
                  {
                    skill.value
                  }
                </span>

                <strong>
                  {
                    skill.label
                  }
                </strong>
              </article>
            )
          )}
        </section>
      )}

      {/* =====================================================
          CATEGORY SECTION
      ===================================================== */}

      <section className="skills-section">
        <div className="skills-section-heading">
          <div>
            <span>
              CAPABILITIES
            </span>

            <h2>
              My toolkit
            </h2>
          </div>

          <p>
            Tools and capabilities
            organised by the areas
            where I use them.
          </p>
        </div>

        {categories.length >
        0 ? (
          <div className="skills-category-grid">
            {categories.map(
              (
                category,
                index
              ) => (
                <article
                  className={`skills-category-card skills-category-${category.accent}`}
                  key={
                    category.id
                  }
                >
                  {/* =========================================
                      CARD HEADER
                  ========================================= */}

                  <div className="skills-category-top">
                    <span className="skills-category-number">
                      {String(
                        index +
                          1
                      ).padStart(
                        2,
                        "0"
                      )}
                    </span>

                    <div
                      className="skills-category-icon"
                      aria-hidden="true"
                    >
                      <span />
                      <span />
                      <span />
                      <span />
                    </div>
                  </div>

                  {/* =========================================
                      COPY
                  ========================================= */}

                  <div className="skills-category-copy">
                    <h3>
                      {
                        category.title
                      }
                    </h3>
                  </div>

                  {/* =========================================
                      SKILLS
                  ========================================= */}

                  <div
                    className="skills-chip-list"
                    aria-label={`${category.title} skills`}
                  >
                    {category.skills.map(
                      (
                        skill,
                        skillIndex
                      ) => (
                        <span
                          key={`${category.id}-${skill}-${skillIndex}`}
                        >
                          {
                            skill
                          }
                        </span>
                      )
                    )}
                  </div>

                  <div
                    className="skills-category-orb"
                    aria-hidden="true"
                  />

                  <div
                    className="skills-category-shine"
                    aria-hidden="true"
                  />
                </article>
              )
            )}
          </div>
        ) : (
          <div className="skills-empty">
            <span>
              SKILLS
            </span>

            <h3>
              Skills are being
              updated.
            </h3>

            <p>
              New skills will appear
              here when they are
              added from the Admin
              panel.
            </p>
          </div>
        )}
      </section>

      {/* =====================================================
          CLOSING
      ===================================================== */}

      <section className="skills-closing">
        <div className="skills-closing-copy">
          <span>
            HOW I WORK
          </span>

          <h2>
            Learn fast.
            <br />

            Build faster.
          </h2>

          <p>
            I don&apos;t try to know
            every tool. I focus on
            understanding the
            problem, learning what I
            need and using the right
            combination of
            technology, AI and
            business thinking to
            solve it.
          </p>
        </div>

        <div
          className="skills-closing-visual"
          aria-hidden="true"
        >
          <div className="skills-closing-card skills-closing-card-back">
            <span>
              IDEA
            </span>
          </div>

          <div className="skills-closing-card skills-closing-card-middle">
            <span>
              BUILD
            </span>
          </div>

          <div className="skills-closing-card skills-closing-card-front">
            <span>
              SHIP
            </span>
          </div>
        </div>
      </section>

      {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer className="skills-footer">
        <span>
          SIDDHARTH NAYAK
        </span>

        <span>
          SKILLS / PORTFOLIO
        </span>

        <span>
          2026
        </span>
      </footer>
    </main>
  );
}

export default Skills;