import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import "../../css/welcome.css";

function Welcome({
  onEnter,
}) {
  const [
    stage,
    setStage,
  ] = useState("intro");

  const [
    leaving,
    setLeaving,
  ] = useState(false);

  const [
    photoAvailable,
    setPhotoAvailable,
  ] = useState(true);

  const introTimerRef =
    useRef(null);

  const exitTimerRef =
    useRef(null);

  /*
  ========================================================
  INTRO → PROFILE
  ========================================================

  The opening identity screen stays visible briefly,
  then reveals the main profile card.
  ========================================================
  */

  useEffect(() => {
    const prefersReducedMotion =
      window.matchMedia?.(
        "(prefers-reduced-motion: reduce)"
      )?.matches;

    introTimerRef.current =
      window.setTimeout(
        () => {
          setStage(
            "profile"
          );
        },
        prefersReducedMotion
          ? 100
          : 2000
      );

    return () => {
      if (
        introTimerRef.current
      ) {
        window.clearTimeout(
          introTimerRef.current
        );
      }

      if (
        exitTimerRef.current
      ) {
        window.clearTimeout(
          exitTimerRef.current
        );
      }
    };
  }, []);

  /*
  ========================================================
  SKIP INTRO
  ========================================================
  */

  const showProfileNow =
    useCallback(() => {
      if (
        stage === "profile" ||
        leaving
      ) {
        return;
      }

      if (
        introTimerRef.current
      ) {
        window.clearTimeout(
          introTimerRef.current
        );
      }

      setStage(
        "profile"
      );
    }, [
      stage,
      leaving,
    ]);

  /*
  ========================================================
  ENTER PORTFOLIO
  ========================================================
  */

  const handleEnter =
    useCallback(() => {
      if (leaving) {
        return;
      }

      setLeaving(true);

      const prefersReducedMotion =
        window.matchMedia?.(
          "(prefers-reduced-motion: reduce)"
        )?.matches;

      exitTimerRef.current =
        window.setTimeout(
          () => {
            onEnter?.();
          },
          prefersReducedMotion
            ? 50
            : 650
        );
    }, [
      leaving,
      onEnter,
    ]);

  /*
  ========================================================
  KEYBOARD
  ========================================================

  During the intro:
  Enter / Space skips directly to the profile.

  On the profile:
  Enter can enter the portfolio.
  ========================================================
  */

  useEffect(() => {
    const handleKeyDown =
      (event) => {
        if (
          event.key !==
            "Enter" &&
          event.key !==
            " "
        ) {
          return;
        }

        /*
        Never hijack keyboard interaction
        from an actual button.
        */
        if (
          event.target instanceof
            HTMLElement &&
          event.target.closest(
            "button"
          )
        ) {
          return;
        }

        event.preventDefault();

        if (
          stage ===
          "intro"
        ) {
          showProfileNow();

          return;
        }

        handleEnter();
      };

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [
    stage,
    showProfileNow,
    handleEnter,
  ]);

  return (
    <main
      className={[
        "corporate-welcome",

        stage ===
        "profile"
          ? "show-profile"
          : "show-intro",

        leaving
          ? "corporate-leaving"
          : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div
        className="corporate-background"
        aria-hidden="true"
      >
        <div className="corporate-grid" />

        <div className="corporate-glow corporate-glow-one" />

        <div className="corporate-glow corporate-glow-two" />

        <div className="corporate-circle corporate-circle-one" />

        <div className="corporate-circle corporate-circle-two" />

        <div className="corporate-aurora corporate-aurora-one" />

        <div className="corporate-aurora corporate-aurora-two" />
      </div>

      <section
        className="corporate-intro"
        aria-hidden={
          stage ===
          "profile"
        }
      >
        <div className="intro-topline">
          <span>
            PERSONAL PORTFOLIO
          </span>

          <span>
            2026
          </span>
        </div>

        <div className="intro-center">
          <span className="intro-eyebrow">
            WELCOME
          </span>

          <h1>
            Siddharth

            <br />

            Nayak
          </h1>

          <div
            className="intro-line"
            aria-hidden="true"
          />

          <p>
            Business

            <span>
              •
            </span>

            Marketing

            <span>
              •
            </span>

            Finance

            <span>
              •
            </span>

            Builder
          </p>
        </div>

        <div className="intro-footer">
          <span>
            BBA STUDENT
          </span>

          <button
            type="button"
            className="intro-skip"
            onClick={
              showProfileNow
            }
          >
            Skip Intro
          </button>

          <span>
            PORTFOLIO / 2026
          </span>
        </div>
      </section>

      <section
        className="corporate-profile-page"
        aria-hidden={
          stage !==
          "profile"
        }
      >
        <header className="profile-page-header">
          <div className="profile-page-brand">
            <span
              className="profile-page-dot"
              aria-hidden="true"
            />

            <span>
              PERSONAL PORTFOLIO
            </span>
          </div>

          <span className="profile-page-year">
            2026
          </span>
        </header>

        <section className="profile-page-stage">
          <article className="business-profile-card">
            <div className="business-card-header">
              <div>
                <span className="business-label">
                  PROFILE
                </span>

                <strong>
                  Personal Profile
                </strong>
              </div>

              <div className="business-status">
                <span
                  aria-hidden="true"
                />

                AVAILABLE
              </div>
            </div>

            <div className="business-divider" />

            <div className="business-identity">
              <div className="business-photo-wrap">
                <div
                  className="business-photo-ring"
                  aria-hidden="true"
                />

                <div className="business-photo-frame">
                  {photoAvailable ? (
                    <img
                      src="/profile.png"
                      alt="Siddharth Nayak"
                      className="business-photo"
                      onError={() => {
                        setPhotoAvailable(
                          false
                        );
                      }}
                    />
                  ) : (
                    <div
                      className="business-photo-fallback"
                      aria-label="Siddharth Nayak"
                    >
                      SN
                    </div>
                  )}
                </div>

                <span
                  className="business-photo-dot"
                  aria-hidden="true"
                />
              </div>

              <div className="business-name-block">
                <span className="business-student-label">
                  BBA STUDENT
                </span>

                <h1>
                  Siddharth

                  <br />

                  Nayak
                </h1>

                <p>
                  Exploring business,
                  marketing and finance
                  while building digital
                  products and ideas with
                  technology.
                </p>
              </div>
            </div>

            <div className="business-divider business-divider-wide" />

            <div className="business-details">
              <div className="business-detail-column">
                <span className="business-section-label">
                  FOCUS
                </span>

                <div className="business-interest-list">
                  <div>
                    <span>
                      01
                    </span>

                    <strong>
                      Marketing
                    </strong>
                  </div>

                  <div>
                    <span>
                      02
                    </span>

                    <strong>
                      Finance
                    </strong>
                  </div>

                  <div>
                    <span>
                      03
                    </span>

                    <strong>
                      Digital Products
                    </strong>
                  </div>
                </div>
              </div>

              <div className="business-detail-column">
                <span className="business-section-label">
                  INTERESTS
                </span>

                <div className="business-tags">
                  <span>
                    Strategy
                  </span>

                  <span>
                    Branding
                  </span>

                  <span>
                    Consumers
                  </span>

                  <span>
                    Analysis
                  </span>

                  <span>
                    Growth
                  </span>

                  <span>
                    AI
                  </span>
                </div>
              </div>
            </div>

            <div className="business-divider business-divider-bottom" />

            <div className="business-card-footer">
              <div className="business-profile-id">
                <span>
                  PROFILE ID
                </span>

                <strong>
                  SN / 2026
                </strong>
              </div>

              <button
                type="button"
                className="business-enter-button"
                onClick={
                  handleEnter
                }
                disabled={
                  leaving
                }
                aria-busy={
                  leaving
                }
              >
                <div>
                  <span>
                    {leaving
                      ? "OPENING"
                      : "CONTINUE"}
                  </span>

                  <strong>
                    {leaving
                      ? "Entering Portfolio"
                      : "Explore Portfolio"}
                  </strong>
                </div>

                <span
                  className="business-enter-arrow"
                  aria-hidden="true"
                >
                  →
                </span>
              </button>
            </div>

            <div
              className="business-card-shine"
              aria-hidden="true"
            />
          </article>

          <div
            className="business-page-keywords"
            aria-hidden="true"
          >
            <span>
              BUSINESS
            </span>

            <i />

            <span>
              MARKETING
            </span>

            <i />

            <span>
              FINANCE
            </span>

            <i />

            <span>
              BUILD
            </span>
          </div>
        </section>

        <footer className="profile-page-footer">
          <span>
            SIDDHARTH NAYAK
          </span>

          <span>
            PORTFOLIO / 2026
          </span>
        </footer>
      </section>

      <div
        className="corporate-exit"
        aria-hidden="true"
      />
    </main>
  );
}

export default Welcome;