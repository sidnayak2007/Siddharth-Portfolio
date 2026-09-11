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
  contactFallback,
} from "../../data/portfolioDefaults";

import "../../css/contact.css";

/* =========================================================
   HELPERS
========================================================= */

function getAccent(index) {
  const accents = [
    "emerald",
    "blue",
    "violet",
  ];

  return accents[
    index %
      accents.length
  ];
}

function getContactIcon(label) {
  const name =
    String(
      label || ""
    ).toLowerCase();

  if (
    name.includes(
      "linkedin"
    )
  ) {
    return "in";
  }

  if (
    name.includes(
      "github"
    )
  ) {
    return "<>";
  }

  if (
    name.includes(
      "email"
    ) ||
    name.includes(
      "mail"
    )
  ) {
    return "@";
  }

  if (
    name.includes(
      "phone"
    ) ||
    name.includes(
      "call"
    )
  ) {
    return "☎";
  }

  return "↗";
}

function normalizeContact(
  data
) {
  const source =
    data &&
    typeof data ===
      "object"
      ? data
      : {};

  return {
    eyebrow:
      typeof source.eyebrow ===
        "string" &&
      source.eyebrow.trim()
        ? source.eyebrow.trim()
        : contactFallback.eyebrow,

    heading:
      typeof source.heading ===
        "string" &&
      source.heading.trim()
        ? source.heading.trim()
        : contactFallback.heading,

    intro:
      typeof source.intro ===
        "string"
        ? source.intro.trim()
        : contactFallback.intro,

    availabilityHeading:
      typeof source.availabilityHeading ===
        "string"
        ? source.availabilityHeading.trim()
        : contactFallback.availabilityHeading,

    availabilityText:
      typeof source.availabilityText ===
        "string"
        ? source.availabilityText.trim()
        : contactFallback.availabilityText,

    links:
      Array.isArray(
        source.links
      )
        ? source.links
            .map(
              (
                item,
                index
              ) => ({
                id:
                  item?.id ||
                  `contact-${index}`,

                label:
                  typeof item?.label ===
                    "string"
                    ? item.label.trim()
                    : "",

                value:
                  typeof item?.value ===
                    "string"
                    ? item.value.trim()
                    : "",

                url:
                  typeof item?.url ===
                    "string"
                    ? item.url.trim()
                    : "",
              })
            )
            .filter(
              (item) =>
                item.label ||
                item.value ||
                item.url
            )
        : contactFallback.links,
  };
}

/* =========================================================
   CONTACT
========================================================= */

function Contact({
  onBack,
}) {
  const [
    contact,
    setContact,
  ] = useState(
    contactFallback
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

    async function loadContact() {
      try {
        const contactRef =
          doc(
            db,
            "portfolio",
            "contact"
          );

        const snapshot =
          await getDoc(
            contactRef
          );

        if (cancelled) {
          return;
        }

        if (
          snapshot.exists()
        ) {
          setContact(
            normalizeContact(
              snapshot.data()
            )
          );
        } else {
          setContact(
            contactFallback
          );
        }
      } catch (loadError) {
        if (cancelled) {
          return;
        }

        console.error(
          "Could not load contact:",
          loadError
        );

        setError(
          "Contact information could not be loaded from Firebase."
        );

        setContact(
          contactFallback
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadContact();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main
      className="contact-page"
      aria-busy={
        loading
      }
    >
      {/* =====================================================
          BACKGROUND
      ===================================================== */}

      <div
        className="contact-background"
        aria-hidden="true"
      >
        <div className="contact-grid" />

        <div className="contact-glow contact-glow-one" />

        <div className="contact-glow contact-glow-two" />

        <div className="contact-ring contact-ring-one" />

        <div className="contact-ring contact-ring-two" />
      </div>

      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="contact-header">
        <button
          type="button"
          className="contact-back"
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

        <div className="contact-header-center">
          <span>
            CONNECT
          </span>

          <strong>
            Contact
          </strong>
        </div>

        <div className="contact-header-index">
          <span>
            SECTION
          </span>

          <strong>
            07
          </strong>
        </div>
      </header>

      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="contact-hero">
        <div className="contact-hero-copy">
          <span className="contact-eyebrow">
            {
              contact.eyebrow
            }
          </span>

          <h1>
            {
              contact.heading
            }
          </h1>

          {contact.intro && (
            <p>
              {
                contact.intro
              }
            </p>
          )}

          <div
            className="contact-availability"
            aria-label="Availability status"
          >
            <span
              className="contact-availability-dot"
              aria-hidden="true"
            />

            <div>
              <span>
                CURRENT STATUS
              </span>

              <strong>
                {
                  contact.availabilityHeading
                }
              </strong>

              {contact.availabilityText && (
                <small className="contact-availability-text">
                  {
                    contact.availabilityText
                  }
                </small>
              )}
            </div>
          </div>
        </div>

        {/* ===================================================
            HERO VISUAL
        =================================================== */}

        <aside
          className="contact-hero-card"
          aria-label="Contact profile"
        >
          <div className="contact-card-top">
            <span>
              CONTACT CARD
            </span>

            <span>
              2026
            </span>
          </div>

          <div
            className="contact-card-visual"
            aria-hidden="true"
          >
            <div className="contact-card-ring contact-card-ring-one" />

            <div className="contact-card-ring contact-card-ring-two" />

            <div className="contact-card-center">
              <span>
                SN
              </span>

              <strong>
                HELLO
              </strong>
            </div>

            <div className="contact-signal contact-signal-one">
              IN
            </div>

            <div className="contact-signal contact-signal-two">
              GH
            </div>

            <div className="contact-signal contact-signal-three">
              @
            </div>
          </div>

          <div className="contact-card-bottom">
            <div>
              <span>
                NAME
              </span>

              <strong>
                Siddharth Nayak
              </strong>
            </div>

            <div>
              <span>
                STATUS
              </span>

              <strong>
                {
                  contact.availabilityHeading ||
                  "Available"
                }
              </strong>
            </div>
          </div>

          <div
            className="contact-card-shine"
            aria-hidden="true"
          />
        </aside>
      </section>

      {/* =====================================================
          FIREBASE LOAD ERROR
      ===================================================== */}

      {error && (
        <div
          className="contact-content-error"
          role="status"
        >
          {error}
        </div>
      )}

      {/* =====================================================
          CONTACT LINKS
      ===================================================== */}

      <section
        className="contact-channels"
        aria-labelledby="contact-channels-heading"
      >
        <div className="contact-section-heading">
          <div>
            <span>
              CHANNELS
            </span>

            <h2 id="contact-channels-heading">
              Find me online.
            </h2>
          </div>

          <p>
            Choose whichever channel makes
            the most sense for the
            conversation.
          </p>
        </div>

        {contact.links.length >
        0 ? (
          <div className="contact-channel-grid">
            {contact.links.map(
              (
                channel,
                index
              ) => {
                const external =
                  /^https?:\/\//i.test(
                    channel.url
                  );

                const accent =
                  getAccent(
                    index
                  );

                return (
                  <a
                    className={`contact-channel-card contact-channel-${accent}`}
                    key={
                      channel.id
                    }
                    href={
                      channel.url
                    }
                    target={
                      external
                        ? "_blank"
                        : undefined
                    }
                    rel={
                      external
                        ? "noreferrer"
                        : undefined
                    }
                  >
                    <div className="contact-channel-top">
                      <span className="contact-channel-number">
                        {String(
                          index +
                            1
                        ).padStart(
                          2,
                          "0"
                        )}
                      </span>

                      <div
                        className="contact-channel-icon"
                        aria-hidden="true"
                      >
                        {getContactIcon(
                          channel.label
                        )}
                      </div>
                    </div>

                    <div className="contact-channel-copy">
                      <span>
                        CONTACT
                      </span>

                      <h3>
                        {
                          channel.label
                        }
                      </h3>

                      {channel.value && (
                        <p>
                          {
                            channel.value
                          }
                        </p>
                      )}
                    </div>

                    <div className="contact-channel-footer">
                      <div>
                        <span>
                          OPEN
                        </span>

                        <strong>
                          {
                            channel.value ||
                            channel.label
                          }
                        </strong>
                      </div>

                      <div
                        className="contact-channel-arrow"
                        aria-hidden="true"
                      >
                        ↗
                      </div>
                    </div>

                    <div
                      className="contact-channel-orb"
                      aria-hidden="true"
                    />

                    <div
                      className="contact-channel-shine"
                      aria-hidden="true"
                    />
                  </a>
                );
              }
            )}
          </div>
        ) : (
          <div className="contact-empty-links">
            Contact links are being
            updated.
          </div>
        )}
      </section>

      {/* =====================================================
          MESSAGE
      ===================================================== */}

      <section className="contact-message">
        <div className="contact-message-copy">
          <span>
            SAY HELLO
          </span>

          <h2>
            Good ideas usually
            start with a
            conversation.
          </h2>

          <p>
            Whether it&apos;s an internship,
            collaboration, project or
            simply something interesting
            to discuss — feel free to reach
            out.
          </p>
        </div>

        <div
          className="contact-message-visual"
          aria-hidden="true"
        >
          <div className="contact-message-bubble contact-message-bubble-back">
            <span />
            <span />
          </div>

          <div className="contact-message-bubble contact-message-bubble-front">
            <div>
              <span />
              <span />
              <span />
            </div>

            <strong>
              HI
            </strong>
          </div>
        </div>
      </section>

      {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer className="contact-footer">
        <span>
          SIDDHARTH NAYAK
        </span>

        <span>
          CONTACT / PORTFOLIO
        </span>

        <span>
          2026
        </span>
      </footer>
    </main>
  );
}

export default Contact;