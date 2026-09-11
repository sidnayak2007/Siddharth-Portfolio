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

import "../../css/experience.css";

/* =========================================================
   DEFAULT EXPERIENCE
========================================================= */

const DEFAULT_EXPERIENCE = {
  eyebrow:
    "EXPERIENCE / 02",

  heading:
    "Experiences that shaped how I work.",

  intro:
    "A collection of internships, leadership roles, responsibilities and experiences that have helped me learn by doing.",

  items: [],
};

/* =========================================================
   DATA HELPERS
========================================================= */

function safeText(
  value,
  fallback = ""
) {
  if (
    typeof value !==
    "string"
  ) {
    return fallback;
  }

  const cleaned =
    value.trim();

  return cleaned ||
    fallback;
}

function normalizeHighlights(
  value
) {
  if (
    !Array.isArray(value)
  ) {
    return [];
  }

  return value
    .map((highlight) =>
      safeText(
        highlight
      )
    )
    .filter(Boolean)
    .slice(0, 20);
}

function normalizeItem(
  item,
  index
) {
  const fallbackId =
    `experience-${index}`;

  return {
    id:
      safeText(
        item?.id,
        fallbackId
      ),

    role:
      safeText(
        item?.role
      ),

    organization:
      safeText(
        item?.organization
      ),

    type:
      safeText(
        item?.type
      ),

    location:
      safeText(
        item?.location
      ),

    startDate:
      safeText(
        item?.startDate
      ),

    endDate:
      safeText(
        item?.endDate
      ),

    current:
      Boolean(
        item?.current
      ),

    summary:
      safeText(
        item?.summary
      ),

    highlights:
      normalizeHighlights(
        item?.highlights
      ),
  };
}

function normalizeExperienceData(
  data
) {
  if (
    !data ||
    typeof data !==
      "object"
  ) {
    return DEFAULT_EXPERIENCE;
  }

  const items =
    Array.isArray(
      data.items
    )
      ? data.items
          .map(
            normalizeItem
          )
          .filter(
            (item) =>
              item.role ||
              item.organization ||
              item.summary ||
              item.highlights.length >
                0
          )
      : [];

  return {
    eyebrow:
      safeText(
        data.eyebrow,
        DEFAULT_EXPERIENCE.eyebrow
      ),

    heading:
      safeText(
        data.heading,
        DEFAULT_EXPERIENCE.heading
      ),

    intro:
      safeText(
        data.intro,
        DEFAULT_EXPERIENCE.intro
      ),

    items,
  };
}

/* =========================================================
   EXPERIENCE
========================================================= */

function Experience({
  onBack,
}) {
  const [
    experience,
    setExperience,
  ] = useState(
    DEFAULT_EXPERIENCE
  );

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  const [
    reloadKey,
    setReloadKey,
  ] = useState(0);

  /*
  ========================================================
  LOAD FIRESTORE CONTENT
  ========================================================

  The Admin Experience editor writes to:

  portfolio / experience

  The schema is preserved exactly.

  If Firestore fails, the page stays usable and
  presents a retry state rather than crashing.
  ========================================================
  */

  useEffect(() => {
    let cancelled =
      false;

    const loadExperience =
      async () => {
        setLoading(
          true
        );

        setError(
          ""
        );

        try {
          const reference =
            doc(
              db,
              "portfolio",
              "experience"
            );

          const snapshot =
            await getDoc(
              reference
            );

          if (cancelled) {
            return;
          }

          if (
            snapshot.exists()
          ) {
            setExperience(
              normalizeExperienceData(
                snapshot.data()
              )
            );
          } else {
            setExperience(
              DEFAULT_EXPERIENCE
            );
          }
        } catch (loadError) {
          console.error(
            "Failed to load Experience:",
            loadError
          );

          if (
            cancelled
          ) {
            return;
          }

          setExperience(
            DEFAULT_EXPERIENCE
          );

          setError(
            "Experience could not be loaded right now. Please check your connection and try again."
          );
        } finally {
          if (
            !cancelled
          ) {
            setLoading(
              false
            );
          }
        }
      };

    void loadExperience();

    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  /*
  ========================================================
  RELOAD
  ========================================================
  */

  const handleReload =
    () => {
      setReloadKey(
        (value) =>
          value + 1
      );
    };

  return (
    <main
      className="experience-page"
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
        className="experience-background"
        aria-hidden="true"
      >
        <div className="experience-grid" />

        <div className="experience-glow experience-glow-one" />

        <div className="experience-glow experience-glow-two" />
      </div>

      {/*
      =====================================================
      HEADER
      =====================================================
      */}

      <header className="experience-header">
        <button
          type="button"
          className="experience-back"
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

        <div className="experience-header-center">
          <span>
            EXPERIENCE
          </span>

          <strong>
            Portfolio
          </strong>
        </div>

        <div
          className="experience-header-index"
          aria-label="Section 02"
        >
          <span>
            SECTION
          </span>

          <strong>
            02
          </strong>
        </div>
      </header>

      {/*
      =====================================================
      HERO
      =====================================================
      */}

      <section className="experience-hero">
        <span className="experience-eyebrow">
          {
            experience.eyebrow
          }
        </span>

        <h1>
          {
            experience.heading
          }
        </h1>

        <p>
          {
            experience.intro
          }
        </p>
      </section>

      {/*
      =====================================================
      EXPERIENCE CONTENT
      =====================================================
      */}

      <section
        className="experience-content"
        aria-live="polite"
      >
        {loading ? (
          <ExperienceState
            label="EXPERIENCE"
            title="Loading experience..."
            text="Fetching the latest saved Experience content."
            loading
          />
        ) : error ? (
          <ExperienceState
            label="UNAVAILABLE"
            title="Couldn’t load Experience."
            text={error}
            actionLabel="Try again"
            onAction={
              handleReload
            }
          />
        ) : experience.items
            .length === 0 ? (
          <ExperienceState
            label="EXPERIENCE"
            title="Nothing added yet."
            text="Experience entries will appear here once they are added from the admin dashboard."
          />
        ) : (
          <div className="experience-list">
            {experience.items.map(
              (
                item,
                index
              ) => {
                const startLabel =
                  item.startDate ||
                  "—";

                const endLabel =
                  item.current
                    ? "Present"
                    : item.endDate ||
                      "—";

                const itemNumber =
                  String(
                    index + 1
                  ).padStart(
                    2,
                    "0"
                  );

                return (
                  <article
                    className="experience-item"
                    key={
                      item.id
                    }
                  >
                    {/*
                    =========================================
                    NUMBER
                    =========================================
                    */}

                    <div className="experience-item-number">
                      {
                        itemNumber
                      }
                    </div>

                    {/*
                    =========================================
                    DATE / STATUS
                    =========================================
                    */}

                    <div className="experience-item-side">
                      <div className="experience-date-range">
                        <span>
                          {
                            startLabel
                          }
                        </span>

                        <i
                          aria-hidden="true"
                        />

                        <span>
                          {
                            endLabel
                          }
                        </span>
                      </div>

                      <span
                        className={`experience-status ${
                          item.current
                            ? "current"
                            : "completed"
                        }`}
                      >
                        <i
                          aria-hidden="true"
                        />

                        {item.current
                          ? "Current"
                          : "Completed"}
                      </span>
                    </div>

                    {/*
                    =========================================
                    MAIN CONTENT
                    =========================================
                    */}

                    <div className="experience-item-main">
                      {(item.type ||
                        item.location) && (
                        <div className="experience-item-meta">
                          {item.type && (
                            <span>
                              {
                                item.type
                              }
                            </span>
                          )}

                          {item.location && (
                            <span>
                              {
                                item.location
                              }
                            </span>
                          )}
                        </div>
                      )}

                      {item.role && (
                        <h2>
                          {
                            item.role
                          }
                        </h2>
                      )}

                      {item.organization && (
                        <h3>
                          {
                            item.organization
                          }
                        </h3>
                      )}

                      {item.summary && (
                        <p className="experience-summary">
                          {
                            item.summary
                          }
                        </p>
                      )}

                      {item.highlights
                        .length >
                        0 && (
                        <ul className="experience-highlights">
                          {item.highlights.map(
                            (
                              highlight,
                              highlightIndex
                            ) => (
                              <li
                                key={`${item.id}-highlight-${highlightIndex}`}
                              >
                                <span
                                  aria-hidden="true"
                                />

                                <p>
                                  {
                                    highlight
                                  }
                                </p>
                              </li>
                            )
                          )}
                        </ul>
                      )}
                    </div>

                    {/*
                    =========================================
                    DECORATIVE ARROW
                    =========================================
                    */}

                    <div
                      className="experience-item-arrow"
                      aria-hidden="true"
                    >
                      ↗
                    </div>
                  </article>
                );
              }
            )}
          </div>
        )}
      </section>

      {/*
      =====================================================
      FOOTER
      =====================================================
      */}

      <footer className="experience-footer">
        <span>
          SIDDHARTH NAYAK
        </span>

        <span>
          EXPERIENCE / PORTFOLIO
        </span>

        <span>
          2026
        </span>
      </footer>
    </main>
  );
}

/* =========================================================
   LOADING / ERROR / EMPTY STATE
========================================================= */

function ExperienceState({
  label,
  title,
  text,
  actionLabel,
  onAction,
  loading = false,
}) {
  return (
    <div
      className={`experience-state ${
        loading
          ? "experience-state-loading"
          : ""
      }`}
    >
      <span className="experience-state-label">
        {label}
      </span>

      {loading && (
        <div
          className="experience-state-loader"
          aria-hidden="true"
        >
          <span />

          <span />

          <span />
        </div>
      )}

      <h2>
        {title}
      </h2>

      <p>
        {text}
      </p>

      {actionLabel &&
        onAction && (
          <button
            type="button"
            className="experience-retry"
            onClick={
              onAction
            }
          >
            <span>
              {
                actionLabel
              }
            </span>

            <span
              aria-hidden="true"
            >
              ↻
            </span>
          </button>
        )}
    </div>
  );
}

export default Experience;