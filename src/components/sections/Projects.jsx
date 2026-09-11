import "../../css/projects.css";

/* =========================================================
   PROJECT DATA
========================================================= */

const projects = [
  {
    number: "01",

    title: "LEYA",

    type: "Digital Experience",

    description:
      "An interactive project focused on creating a memorable digital experience.",

    label: "Featured Project",

    accent: "violet",
  },

  {
    number: "02",

    title: "COLLEGE SIMULATOR",

    type: "Interactive Game",

    description:
      "A game concept inspired by everyday college life and experiences.",

    label: "Game Experiment",

    accent: "blue",
  },

  {
    number: "03",

    title: "PORTFOLIO",

    type: "Web Experience",

    description:
      "The interactive portfolio you're currently exploring.",

    label: "Current Build",

    accent: "pink",
  },
];

/* =========================================================
   PROJECTS
========================================================= */

function Projects({
  onBack,
}) {
  return (
    <main className="projects-page">
      {/*
      =====================================================
      BACKGROUND
      =====================================================
      */}

      <div
        className="projects-background"
        aria-hidden="true"
      >
        <div className="projects-grid" />

        <div className="projects-glow projects-glow-one" />

        <div className="projects-glow projects-glow-two" />

        <div className="projects-orbit projects-orbit-one" />

        <div className="projects-orbit projects-orbit-two" />
      </div>

      {/*
      =====================================================
      HEADER
      =====================================================
      */}

      <header className="projects-header">
        <button
          type="button"
          className="projects-back"
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

        <div className="projects-header-center">
          <span>
            SELECTED WORK
          </span>

          <strong>
            Projects
          </strong>
        </div>

        <div
          className="projects-header-index"
          aria-label="Section 03"
        >
          <span>
            SECTION
          </span>

          <strong>
            03
          </strong>
        </div>
      </header>

      {/*
      =====================================================
      HERO
      =====================================================
      */}

      <section className="projects-hero">
        <div className="projects-hero-copy">
          <span className="projects-eyebrow">
            PROJECTS / 03
          </span>

          <h1>
            Things I’ve
            <br />

            built.
          </h1>

          <p>
            A collection of projects,
            experiments and digital
            experiences created by
            turning ideas into something
            real.
          </p>
        </div>

        <aside
          className="projects-hero-panel"
          aria-label="Projects overview"
        >
          <div className="projects-hero-panel-top">
            <span>
              PROJECT INDEX
            </span>

            <span>
              2026
            </span>
          </div>

          <div className="projects-hero-number">
            {String(
              projects.length
            ).padStart(
              2,
              "0"
            )}
          </div>

          <div className="projects-hero-panel-bottom">
            <span>
              Selected
            </span>

            <strong>
              Projects
            </strong>
          </div>

          <div
            className="projects-panel-symbol"
            aria-hidden="true"
          >
            <span />

            <span />

            <span />
          </div>
        </aside>
      </section>

      {/*
      =====================================================
      PROJECT LIST
      =====================================================
      */}

      <section
        className="projects-section"
        aria-labelledby="projects-list-heading"
      >
        <div className="projects-section-heading">
          <div>
            <span>
              SELECTED WORK
            </span>

            <h2 id="projects-list-heading">
              Project archive
            </h2>
          </div>

          <p>
            Experiments across digital
            products, games and web
            experiences.
          </p>
        </div>

        <div className="projects-list">
          {projects.map(
            (project) => (
              <article
                className={`project-card project-card-${project.accent}`}
                key={
                  project.number
                }
              >
                {/*
                ===========================================
                CARD TOP
                ===========================================
                */}

                <div className="project-card-top">
                  <span className="project-number">
                    {
                      project.number
                    }
                  </span>

                  <span className="project-label">
                    {
                      project.label
                    }
                  </span>
                </div>

                {/*
                ===========================================
                VISUAL
                ===========================================
                */}

                <div
                  className="project-visual"
                  aria-hidden="true"
                >
                  <div className="project-visual-grid" />

                  <div className="project-orb project-orb-large" />

                  <div className="project-orb project-orb-small" />

                  <div className="project-window project-window-back">
                    <div />

                    <span />

                    <span />
                  </div>

                  <div className="project-window project-window-front">
                    <div className="project-window-bar">
                      <i />

                      <i />

                      <i />
                    </div>

                    <div className="project-window-content">
                      <span />

                      <strong>
                        {
                          project.number
                        }
                      </strong>

                      <span />
                    </div>
                  </div>

                  <div className="project-visual-ring" />
                </div>

                {/*
                ===========================================
                CONTENT
                ===========================================
                */}

                <div className="project-card-content">
                  <span className="project-type">
                    {
                      project.type
                    }
                  </span>

                  <h3>
                    {
                      project.title
                    }
                  </h3>

                  <p>
                    {
                      project.description
                    }
                  </p>
                </div>

                {/*
                ===========================================
                FOOTER
                ===========================================
                */}

                <div className="project-card-footer">
                  <span>
                    PROJECT
                  </span>

                  <div
                    className="project-card-arrow"
                    aria-hidden="true"
                  >
                    ↗
                  </div>
                </div>

                <div
                  className="project-card-shine"
                  aria-hidden="true"
                />
              </article>
            )
          )}
        </div>
      </section>

      {/*
      =====================================================
      CLOSING STRIP
      =====================================================
      */}

      <section className="projects-closing">
        <div>
          <span>
            BUILD / TEST / ITERATE
          </span>

          <h2>
            Ideas are more useful
            when they become real.
          </h2>
        </div>

        <div
          className="projects-closing-mark"
          aria-hidden="true"
        >
          <span>
            SN
          </span>
        </div>
      </section>

      {/*
      =====================================================
      FOOTER
      =====================================================
      */}

      <footer className="projects-footer">
        <span>
          SIDDHARTH NAYAK
        </span>

        <span>
          PROJECTS / PORTFOLIO
        </span>

        <span>
          2026
        </span>
      </footer>
    </main>
  );
}

export default Projects;