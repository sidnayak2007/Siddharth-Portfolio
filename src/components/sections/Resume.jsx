import "../../css/resume.css";

/* =========================================================
   RESUME DATA
========================================================= */

const timeline = [
  {
    number: "01",
    period: "2025 — PRESENT",
    type: "Education",

    title:
      "BBA — Manipal Academy of Higher Education",

    description:
      "Building a foundation across business, marketing, finance and management while exploring technology and digital products alongside academics.",

    tags: [
      "Business",
      "Marketing",
      "Finance",
    ],
  },

  {
    number: "02",
    period: "2026",
    type: "Experience",

    title:
      "Internships & Practical Learning",

    description:
      "Applying classroom learning through practical work, projects and experiences that strengthen communication, problem solving and business thinking.",

    tags: [
      "Learning",
      "Communication",
      "Strategy",
    ],
  },

  {
    number: "03",
    period: "ONGOING",
    type: "Projects",

    title:
      "Digital Products & Experiments",

    description:
      "Building websites, applications, games and interactive experiences using modern tools and AI-assisted development.",

    tags: [
      "React",
      "AI",
      "Product",
    ],
  },

  {
    number: "04",
    period: "ONGOING",
    type: "Growth",

    title:
      "Learning by Building",

    description:
      "Continuously experimenting with new ideas, improving existing projects and learning the tools required to turn concepts into working products.",

    tags: [
      "Build",
      "Iterate",
      "Learn",
    ],
  },
];

/* =========================================================
   SUMMARY DATA
========================================================= */

const overview = [
  {
    value: "BBA",
    label: "Current Degree",
  },

  {
    value: "2026",
    label: "Portfolio",
  },

  {
    value: "AI",
    label: "Assisted Workflow",
  },

  {
    value: "∞",
    label: "Still Learning",
  },
];

/* =========================================================
   RESUME
========================================================= */

function Resume({
  onBack,
}) {
  return (
    <main className="resume-page">
      {/*
      =====================================================
      BACKGROUND
      =====================================================
      */}

      <div
        className="resume-background"
        aria-hidden="true"
      >
        <div className="resume-grid" />

        <div className="resume-glow resume-glow-one" />

        <div className="resume-glow resume-glow-two" />

        <div className="resume-ring resume-ring-one" />

        <div className="resume-ring resume-ring-two" />
      </div>

      {/*
      =====================================================
      HEADER
      =====================================================
      */}

      <header className="resume-header">
        <button
          type="button"
          className="resume-back"
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

        <div className="resume-header-center">
          <span>
            PROFILE
          </span>

          <strong>
            Resume
          </strong>
        </div>

        <div
          className="resume-header-index"
          aria-label="Section 05"
        >
          <span>
            SECTION
          </span>

          <strong>
            05
          </strong>
        </div>
      </header>

      {/*
      =====================================================
      HERO
      =====================================================
      */}

      <section className="resume-hero">
        <div className="resume-hero-copy">
          <span className="resume-eyebrow">
            RESUME / 05
          </span>

          <h1>
            The story
            <br />

            so far.
          </h1>

          <p>
            A snapshot of my education,
            experiences, projects and the
            things I continue to learn
            along the way.
          </p>

          <div className="resume-hero-tags">
            <span>
              Business
            </span>

            <span>
              Marketing
            </span>

            <span>
              Finance
            </span>

            <span>
              Technology
            </span>
          </div>
        </div>

        {/*
        ===================================================
        PROFILE DOCUMENT VISUAL
        ===================================================
        */}

        <aside
          className="resume-document"
          aria-label="Resume overview"
        >
          <div className="resume-document-top">
            <span>
              RESUME
            </span>

            <span>
              2026
            </span>
          </div>

          <div className="resume-document-profile">
            <div
              className="resume-document-avatar"
              aria-hidden="true"
            >
              SN
            </div>

            <div>
              <span>
                BBA STUDENT
              </span>

              <strong>
                Siddharth Nayak
              </strong>

              <p>
                Business × Technology
              </p>
            </div>
          </div>

          <div className="resume-document-lines">
            <span />

            <span />

            <span />

            <span />
          </div>

          <div className="resume-document-columns">
            <div>
              <span />

              <span />

              <span />
            </div>

            <div>
              <span />

              <span />

              <span />
            </div>
          </div>

          <div className="resume-document-bottom">
            <span>
              SN / PORTFOLIO
            </span>

            <strong>
              05
            </strong>
          </div>

          <div
            className="resume-document-shine"
            aria-hidden="true"
          />
        </aside>
      </section>

      {/*
      =====================================================
      OVERVIEW
      =====================================================
      */}

      <section
        className="resume-overview"
        aria-label="Resume overview"
      >
        {overview.map(
          (item) => (
            <article
              className="resume-overview-item"
              key={
                item.label
              }
            >
              <strong>
                {
                  item.value
                }
              </strong>

              <span>
                {
                  item.label
                }
              </span>
            </article>
          )
        )}
      </section>

      {/*
      =====================================================
      JOURNEY
      =====================================================
      */}

      <section className="resume-journey">
        <div className="resume-section-heading">
          <div>
            <span>
              JOURNEY
            </span>

            <h2>
              Experience &
              <br />

              education.
            </h2>
          </div>

          <p>
            My path is still being built.
            These are the areas currently
            shaping how I think, work and
            create.
          </p>
        </div>

        <div className="resume-timeline">
          {timeline.map(
            (item) => (
              <article
                className="resume-timeline-item"
                key={
                  item.number
                }
              >
                <div className="resume-timeline-number">
                  {
                    item.number
                  }
                </div>

                <div className="resume-timeline-period">
                  <span>
                    {
                      item.period
                    }
                  </span>

                  <i
                    aria-hidden="true"
                  />
                </div>

                <div className="resume-timeline-content">
                  <span className="resume-timeline-type">
                    {
                      item.type
                    }
                  </span>

                  <h3>
                    {
                      item.title
                    }
                  </h3>

                  <p>
                    {
                      item.description
                    }
                  </p>

                  <div className="resume-timeline-tags">
                    {item.tags.map(
                      (tag) => (
                        <span
                          key={
                            tag
                          }
                        >
                          {
                            tag
                          }
                        </span>
                      )
                    )}
                  </div>
                </div>

                <div
                  className="resume-timeline-arrow"
                  aria-hidden="true"
                >
                  ↗
                </div>
              </article>
            )
          )}
        </div>
      </section>

      {/*
      =====================================================
      RESUME FILE PLACEHOLDER
      =====================================================

      There is no verified resume PDF in the uploaded
      project yet, so this intentionally does NOT pretend
      a download exists.
      =====================================================
      */}

      <section className="resume-download">
        <div className="resume-download-copy">
          <span>
            FULL RESUME
          </span>

          <h2>
            Resume document.
          </h2>

          <p>
            The downloadable resume will
            be available here once the
            final PDF is added to the
            project.
          </p>
        </div>

        <div
          className="resume-download-status"
          aria-label="Resume download coming soon"
        >
          <div
            className="resume-download-icon"
            aria-hidden="true"
          >
            <svg viewBox="0 0 24 24">
              <path d="M6 3h8l4 4v14H6z" />

              <path d="M14 3v5h5" />

              <path d="M9 13h6" />

              <path d="M9 17h4" />
            </svg>
          </div>

          <div>
            <span>
              DOCUMENT
            </span>

            <strong>
              Coming Soon
            </strong>
          </div>
        </div>
      </section>

      {/*
      =====================================================
      CLOSING
      =====================================================
      */}

      <section className="resume-closing">
        <span>
          CURRENT STATUS
        </span>

        <h2>
          Still learning.
          <br />

          Still building.
        </h2>

        <div className="resume-closing-footer">
          <p>
            Every project adds another
            line to the story.
          </p>

          <div
            className="resume-closing-mark"
            aria-hidden="true"
          >
            SN
          </div>
        </div>
      </section>

      {/*
      =====================================================
      FOOTER
      =====================================================
      */}

      <footer className="resume-footer">
        <span>
          SIDDHARTH NAYAK
        </span>

        <span>
          RESUME / PORTFOLIO
        </span>

        <span>
          2026
        </span>
      </footer>
    </main>
  );
}

export default Resume;