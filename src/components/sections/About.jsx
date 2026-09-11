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

import "../../css/about.css";

/* =========================================================
   DEFAULT ABOUT DATA
========================================================= */

const DEFAULT_ABOUT = {
  eyebrow:
    "ABOUT / 01",

  name:
    "Siddharth Nayak",

  headline:
    "Business, technology and ideas that become real things.",

  intro:
    "I’m a BBA student who enjoys turning ideas into things people can actually use, explore and interact with.",

  description:
    "Most of what I build starts with curiosity. I like experimenting with technology, design and AI to turn rough ideas into working digital experiences, while bringing a business and product perspective to the process.",

  tags: [
    "Business",
    "Product Thinking",
    "Technology",
    "Creative Building",
  ],

  stats: [
    {
      value: "BBA",
      label:
        "Current degree",
    },

    {
      value: "AI",
      label:
        "Assisted workflow",
    },

    {
      value: "∞",
      label:
        "Ideas in progress",
    },
  ],

  focus: [
    {
      number: "01",

      title:
        "Business",

      text:
        "Understanding how ideas create value, how products are positioned and how people make decisions.",
    },

    {
      number: "02",

      title:
        "Building",

      text:
        "Turning concepts into working websites, experiments and interactive digital experiences.",
    },

    {
      number: "03",

      title:
        "Technology",

      text:
        "Using modern tools and AI to explore what is possible without being limited by a traditional technical background.",
    },
  ],

  quote:
    "I care less about whether an idea starts perfectly and more about whether I can turn it into something real.",
};

/* =========================================================
   DATA HELPERS
========================================================= */

function safeText(
  value,
  fallback
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

function normalizeTags(
  value
) {
  if (
    !Array.isArray(value)
  ) {
    return DEFAULT_ABOUT.tags;
  }

  const tags =
    value
      .map((tag) =>
        String(
          tag ?? ""
        ).trim()
      )
      .filter(Boolean)
      .slice(0, 12);

  return tags.length > 0
    ? tags
    : DEFAULT_ABOUT.tags;
}

function normalizeStats(
  value
) {
  if (
    !Array.isArray(value)
  ) {
    return DEFAULT_ABOUT.stats;
  }

  const stats =
    value
      .map(
        (
          item,
          index
        ) => ({
          value:
            safeText(
              item?.value,
              DEFAULT_ABOUT
                .stats[
                index
              ]?.value ||
                ""
            ),

          label:
            safeText(
              item?.label,
              DEFAULT_ABOUT
                .stats[
                index
              ]?.label ||
                ""
            ),
        })
      )
      .filter(
        (item) =>
          item.value ||
          item.label
      )
      .slice(0, 8);

  return stats.length > 0
    ? stats
    : DEFAULT_ABOUT.stats;
}

function normalizeFocus(
  value
) {
  if (
    !Array.isArray(value)
  ) {
    return DEFAULT_ABOUT.focus;
  }

  const focus =
    value
      .map(
        (
          item,
          index
        ) => ({
          number:
            safeText(
              item?.number,
              String(
                index + 1
              ).padStart(
                2,
                "0"
              )
            ),

          title:
            safeText(
              item?.title,
              DEFAULT_ABOUT
                .focus[
                index
              ]?.title ||
                "Focus"
            ),

          text:
            safeText(
              item?.text,
              DEFAULT_ABOUT
                .focus[
                index
              ]?.text ||
                ""
            ),
        })
      )
      .filter(
        (item) =>
          item.title ||
          item.text
      )
      .slice(0, 8);

  return focus.length > 0
    ? focus
    : DEFAULT_ABOUT.focus;
}

function normalizeAboutData(
  data
) {
  if (
    !data ||
    typeof data !==
      "object"
  ) {
    return DEFAULT_ABOUT;
  }

  return {
    eyebrow:
      safeText(
        data.eyebrow,
        DEFAULT_ABOUT.eyebrow
      ),

    name:
      safeText(
        data.name,
        DEFAULT_ABOUT.name
      ),

    headline:
      safeText(
        data.headline,
        DEFAULT_ABOUT.headline
      ),

    intro:
      safeText(
        data.intro,
        DEFAULT_ABOUT.intro
      ),

    description:
      safeText(
        data.description,
        DEFAULT_ABOUT.description
      ),

    quote:
      safeText(
        data.quote,
        DEFAULT_ABOUT.quote
      ),

    tags:
      normalizeTags(
        data.tags
      ),

    stats:
      normalizeStats(
        data.stats
      ),

    focus:
      normalizeFocus(
        data.focus
      ),
  };
}

/* =========================================================
   ABOUT
========================================================= */

function About({
  onBack,
}) {
  const [
    about,
    setAbout,
  ] = useState(
    DEFAULT_ABOUT
  );

  const [
    loading,
    setLoading,
  ] = useState(true);

  /*
  ========================================================
  LOAD FIRESTORE CONTENT
  ========================================================

  Firestore content overrides the local fallback.

  If Firestore is unavailable or access is denied,
  visitors still receive the complete local version.
  ========================================================
  */

  useEffect(() => {
    let cancelled =
      false;

    const loadAbout =
      async () => {
        setLoading(
          true
        );

        try {
          const reference =
            doc(
              db,
              "portfolio",
              "about"
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
            setAbout(
              normalizeAboutData(
                snapshot.data()
              )
            );

            return;
          }

          setAbout(
            DEFAULT_ABOUT
          );
        } catch (error) {
          console.error(
            "Failed to load About data:",
            error
          );

          if (
            !cancelled
          ) {
            setAbout(
              DEFAULT_ABOUT
            );
          }
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

    void loadAbout();

    return () => {
      cancelled = true;
    };
  }, []);

  const displayName =
    about.name ||
    DEFAULT_ABOUT.name;

  const displayNameUpper =
    displayName.toUpperCase();

  return (
    <main
      className="about-page"
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
        className="about-background"
        aria-hidden="true"
      >
        <div className="about-background-grid" />

        <div className="about-background-orb about-background-orb-one" />

        <div className="about-background-orb about-background-orb-two" />
      </div>

      {/*
      =====================================================
      HEADER
      =====================================================
      */}

      <header className="about-header">
        <button
          type="button"
          className="about-back"
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

        <div className="about-header-center">
          <span>
            PROFILE
          </span>

          <strong>
            {displayName}
          </strong>
        </div>

        <div
          className="about-header-index"
          aria-label="Section 01"
        >
          <span>
            SECTION
          </span>

          <strong>
            01
          </strong>
        </div>
      </header>

      {/*
      =====================================================
      HERO
      =====================================================
      */}

      <section className="about-hero">
        <div className="about-hero-copy">
          <span className="about-eyebrow">
            {about.eyebrow}
          </span>

          <h1>
            {about.headline}
          </h1>

          <p className="about-intro">
            {about.intro}
          </p>

          <p className="about-description">
            {about.description}
          </p>

          <div
            className="about-tags"
            aria-label="Areas of interest"
          >
            {about.tags.map(
              (
                tag,
                index
              ) => (
                <span
                  key={`${tag}-${index}`}
                >
                  {tag}
                </span>
              )
            )}
          </div>
        </div>

        {/*
        ===================================================
        PROFILE CARD
        ===================================================
        */}

        <aside
          className="about-profile-card"
          aria-label={`${displayName} profile card`}
        >
          <div className="about-profile-top">
            <span>
              PROFILE CARD
            </span>

            <span>
              {loading
                ? "SYNCING"
                : "SN / 2026"}
            </span>
          </div>

          <div
            className="about-profile-visual"
            aria-hidden="true"
          >
            <div className="about-profile-ring about-profile-ring-one" />

            <div className="about-profile-ring about-profile-ring-two" />

            <div className="about-profile-monogram">
              <span>
                SN
              </span>
            </div>

            <div className="about-profile-line about-profile-line-one" />

            <div className="about-profile-line about-profile-line-two" />
          </div>

          <div className="about-profile-bottom">
            <div>
              <span>
                NAME
              </span>

              <strong>
                {displayName}
              </strong>
            </div>

            <div>
              <span>
                MODE
              </span>

              <strong>
                Builder
              </strong>
            </div>
          </div>
        </aside>
      </section>

      {/*
      =====================================================
      STATS
      =====================================================
      */}

      <section
        className="about-stats"
        aria-label="Profile highlights"
      >
        {about.stats.map(
          (
            item,
            index
          ) => (
            <article
              className="about-stat"
              key={`${item.label}-${index}`}
            >
              <strong>
                {item.value}
              </strong>

              <span>
                {item.label}
              </span>
            </article>
          )
        )}
      </section>

      {/*
      =====================================================
      FOCUS
      =====================================================
      */}

      <section className="about-focus">
        <div className="about-section-heading">
          <span>
            WHAT DRIVES ME
          </span>

          <h2>
            Three things that shape
            <br />

            how I approach work.
          </h2>
        </div>

        <div className="about-focus-grid">
          {about.focus.map(
            (
              item,
              index
            ) => (
              <article
                className="about-focus-card"
                key={`${item.number}-${item.title}-${index}`}
              >
                <div className="about-focus-number">
                  {item.number}
                </div>

                <div className="about-focus-content">
                  <h3>
                    {item.title}
                  </h3>

                  <p>
                    {item.text}
                  </p>
                </div>

                <div
                  className="about-focus-arrow"
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
      QUOTE
      =====================================================
      */}

      <section className="about-quote">
        <span
          className="about-quote-mark"
          aria-hidden="true"
        >
          “
        </span>

        <blockquote>
          {about.quote}
        </blockquote>

        <div className="about-quote-signature">
          <span>
            {displayNameUpper}
          </span>

          <i />

          <span>
            ABOUT
          </span>
        </div>
      </section>

      {/*
      =====================================================
      FOOTER
      =====================================================
      */}

      <footer className="about-footer">
        <span>
          {displayNameUpper}
        </span>

        <span>
          ABOUT / PORTFOLIO
        </span>

        <span>
          2026
        </span>
      </footer>
    </main>
  );
}

export default About;