import {
  useCallback,
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

import "../../css/education.css";

/*
=========================================================
DEFAULT EDUCATION DATA
=========================================================

This is only shown until education content is created
from the Admin panel.

Once portfolio/education exists in Firestore,
Firestore becomes the source of truth.
=========================================================
*/

const DEFAULT_EDUCATION = {
  eyebrow: "EDUCATION",

  heading:
    "Learning that shaped how I think.",

  intro:
    "My academic journey across business, commerce and continuous learning.",

  items: [],
};

/*
=========================================================
HELPERS
=========================================================
*/

function safeText(
  value,
  fallback = ""
) {
  return typeof value ===
    "string"
    ? value.trim()
    : fallback;
}

function normalizeHighlights(
  value
) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) =>
      safeText(item)
    )
    .filter(Boolean);
}

function normalizeEducationItem(
  item,
  index
) {
  if (
    !item ||
    typeof item !== "object"
  ) {
    return null;
  }

  return {
    id:
      safeText(item.id) ||
      `education-${index + 1}`,

    institution:
      safeText(
        item.institution
      ),

    qualification:
      safeText(
        item.qualification
      ),

    field:
      safeText(
        item.field
      ),

    location:
      safeText(
        item.location
      ),

    startDate:
      safeText(
        item.startDate
      ),

    endDate:
      safeText(
        item.endDate
      ),

    current:
      Boolean(
        item.current
      ),

    description:
      safeText(
        item.description
      ),

    highlights:
      normalizeHighlights(
        item.highlights
      ),

    imageUrl:
      safeText(
        item.imageUrl
      ),

    imagePath:
      safeText(
        item.imagePath
      ),

    imageAlt:
      safeText(
        item.imageAlt
      ),
  };
}

function normalizeEducation(
  data
) {
  const source =
    data &&
    typeof data ===
      "object"
      ? data
      : {};

  const rawItems =
    Array.isArray(
      source.items
    )
      ? source.items
      : [];

  return {
    eyebrow:
      safeText(
        source.eyebrow,
        DEFAULT_EDUCATION.eyebrow
      ),

    heading:
      safeText(
        source.heading,
        DEFAULT_EDUCATION.heading
      ),

    intro:
      safeText(
        source.intro,
        DEFAULT_EDUCATION.intro
      ),

    items:
      rawItems
        .map(
          normalizeEducationItem
        )
        .filter(Boolean),
  };
}

/*
=========================================================
EDUCATION
=========================================================
*/

function Education({
  onBack,
}) {
  const [
    education,
    setEducation,
  ] = useState(
    DEFAULT_EDUCATION
  );

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  /*
  ========================================================
  LOAD EDUCATION
  ========================================================
  */

  const loadEducation =
    useCallback(
      async () => {
        setLoading(true);
        setError("");

        try {
          const educationRef =
            doc(
              db,
              "portfolio",
              "education"
            );

          const snapshot =
            await getDoc(
              educationRef
            );

          if (
            snapshot.exists()
          ) {
            setEducation(
              normalizeEducation(
                snapshot.data()
              )
            );
          } else {
            setEducation(
              DEFAULT_EDUCATION
            );
          }
        } catch (loadError) {
          console.error(
            "Could not load education:",
            loadError
          );

          setEducation(
            DEFAULT_EDUCATION
          );

          setError(
            "Education content could not be loaded right now."
          );
        } finally {
          setLoading(false);
        }
      },
      []
    );

  useEffect(() => {
    let cancelled =
      false;

    async function run() {
      setLoading(true);
      setError("");

      try {
        const educationRef =
          doc(
            db,
            "portfolio",
            "education"
          );

        const snapshot =
          await getDoc(
            educationRef
          );

        if (cancelled) {
          return;
        }

        if (
          snapshot.exists()
        ) {
          setEducation(
            normalizeEducation(
              snapshot.data()
            )
          );
        } else {
          setEducation(
            DEFAULT_EDUCATION
          );
        }
      } catch (loadError) {
        if (cancelled) {
          return;
        }

        console.error(
          "Could not load education:",
          loadError
        );

        setEducation(
          DEFAULT_EDUCATION
        );

        setError(
          "Education content could not be loaded right now."
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    run();

    return () => {
      cancelled = true;
    };
  }, []);

  /*
  ========================================================
  RENDER
  ========================================================
  */

  return (
    <main
      className="education-page"
      aria-busy={
        loading
      }
    >
      {/*
      =====================================================
      BACKGROUND
      =====================================================
      */}

      <div
        className="education-background"
        aria-hidden="true"
      >
        <div className="education-grid" />

        <div className="education-glow education-glow-one" />

        <div className="education-glow education-glow-two" />

        <div className="education-orbit education-orbit-one" />

        <div className="education-orbit education-orbit-two" />
      </div>

      {/*
      =====================================================
      HEADER
      =====================================================
      */}

      <header className="education-header">
        <button
          type="button"
          className="education-back"
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

        <div className="education-header-center">
          <span>
            ACADEMIC JOURNEY
          </span>

          <strong>
            Education
          </strong>
        </div>

        <div
          className="education-header-index"
          aria-label="Education section"
        >
          <span>
            SECTION
          </span>

          <strong>
            EDU
          </strong>
        </div>
      </header>

      {/*
      =====================================================
      HERO
      =====================================================
      */}

      <section className="education-hero">
        <div className="education-hero-copy">
          <span className="education-eyebrow">
            {
              education.eyebrow
            }
          </span>

          <h1>
            {
              education.heading
            }
          </h1>

          <p>
            {
              education.intro
            }
          </p>
        </div>

        <aside
          className="education-hero-card"
          aria-label="Education overview"
        >
          <div className="education-hero-card-top">
            <span>
              ACADEMIC RECORD
            </span>

            <span>
              SN
            </span>
          </div>

          <div className="education-hero-number">
            {String(
              education.items
                .length
            ).padStart(
              2,
              "0"
            )}
          </div>

          <div className="education-hero-card-bottom">
            <span>
              Education
            </span>

            <strong>
              Entries
            </strong>
          </div>

          <div
            className="education-hero-symbol"
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
      ERROR
      =====================================================
      */}

      {error && (
        <div
          className="education-error"
          role="alert"
        >
          <div>
            <strong>
              Could not load Education.
            </strong>

            <span>
              {error}
            </span>
          </div>

          <button
            type="button"
            onClick={
              loadEducation
            }
          >
            Try again
          </button>
        </div>
      )}

      {/*
      =====================================================
      LOADING
      =====================================================
      */}

      {loading ? (
        <section
          className="education-loading"
          aria-live="polite"
        >
          <div className="education-loading-ring" />

          <span>
            Loading education...
          </span>
        </section>
      ) : (
        <section
          className="education-content"
          aria-labelledby="education-list-heading"
        >
          <div className="education-section-heading">
            <div>
              <span>
                EDUCATION
              </span>

              <h2 id="education-list-heading">
                Academic journey
              </h2>
            </div>

            <p>
              Institutions,
              qualifications and
              experiences that have
              contributed to my
              academic development.
            </p>
          </div>

          {education.items
            .length === 0 ? (
            <div className="education-empty">
              <span>
                EDUCATION
              </span>

              <h3>
                Education details
                are being updated.
              </h3>

              <p>
                Academic entries
                will appear here
                once they are added
                from the portfolio
                admin panel.
              </p>
            </div>
          ) : (
            <div className="education-list">
              {education.items.map(
                (
                  item,
                  index
                ) => {
                  const dateLabel =
                    item.current
                      ? [
                          item.startDate,
                          "Present",
                        ]
                          .filter(
                            Boolean
                          )
                          .join(
                            " — "
                          )
                      : [
                          item.startDate,
                          item.endDate,
                        ]
                          .filter(
                            Boolean
                          )
                          .join(
                            " — "
                          );

                  return (
                    <article
                      className="education-card"
                      key={
                        item.id
                      }
                    >
                      <div className="education-card-number">
                        {String(
                          index +
                            1
                        ).padStart(
                          2,
                          "0"
                        )}
                      </div>

                      {/*
                      =====================================
                      IMAGE
                      =====================================
                      */}

                      {item.imageUrl && (
                        <div className="education-card-image-wrap">
                          <img
                            className="education-card-image"
                            src={
                              item.imageUrl
                            }
                            alt={
                              item.imageAlt ||
                              item.institution ||
                              "Education"
                            }
                            loading="lazy"
                            decoding="async"
                          />

                          <div
                            className="education-card-image-shine"
                            aria-hidden="true"
                          />
                        </div>
                      )}

                      {/*
                      =====================================
                      INFORMATION
                      =====================================
                      */}

                      <div className="education-card-body">
                        <div className="education-card-meta">
                          {dateLabel && (
                            <span className="education-date">
                              {
                                dateLabel
                              }
                            </span>
                          )}

                          {item.current && (
                            <span className="education-current">
                              CURRENT
                            </span>
                          )}
                        </div>

                        <div className="education-card-title">
                          <span>
                            {
                              item.qualification ||
                              "Education"
                            }
                          </span>

                          <h3>
                            {
                              item.institution
                            }
                          </h3>
                        </div>

                        {item.field && (
                          <p className="education-field">
                            {
                              item.field
                            }
                          </p>
                        )}

                        {item.location && (
                          <div className="education-location">
                            <svg
                              viewBox="0 0 24 24"
                              aria-hidden="true"
                            >
                              <path d="M12 21s6-5.1 6-11a6 6 0 1 0-12 0c0 5.9 6 11 6 11Z" />

                              <circle
                                cx="12"
                                cy="10"
                                r="2"
                              />
                            </svg>

                            <span>
                              {
                                item.location
                              }
                            </span>
                          </div>
                        )}

                        {item.description && (
                          <p className="education-description">
                            {
                              item.description
                            }
                          </p>
                        )}

                        {item.highlights
                          .length >
                          0 && (
                          <div className="education-highlights">
                            {item.highlights.map(
                              (
                                highlight,
                                highlightIndex
                              ) => (
                                <div
                                  className="education-highlight"
                                  key={`${item.id}-${highlightIndex}`}
                                >
                                  <span
                                    aria-hidden="true"
                                  />

                                  <p>
                                    {
                                      highlight
                                    }
                                  </p>
                                </div>
                              )
                            )}
                          </div>
                        )}
                      </div>

                      <div
                        className="education-card-decoration"
                        aria-hidden="true"
                      >
                        <span />

                        <span />
                      </div>
                    </article>
                  );
                }
              )}
            </div>
          )}
        </section>
      )}

      {/*
      =====================================================
      CLOSING
      =====================================================
      */}

      <section className="education-closing">
        <div>
          <span>
            LEARN / APPLY / GROW
          </span>

          <h2>
            Learning becomes
            valuable when it
            changes how you think.
          </h2>
        </div>

        <div
          className="education-closing-mark"
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

      <footer className="education-footer">
        <span>
          SIDDHARTH NAYAK
        </span>

        <span>
          EDUCATION / PORTFOLIO
        </span>

        <span>
          2026
        </span>
      </footer>
    </main>
  );
}

export default Education;