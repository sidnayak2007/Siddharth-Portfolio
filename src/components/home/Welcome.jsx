import { useEffect, useRef, useState } from "react";
import profileImage from "../../assets/profile.png";
import "../../css/welcome.css";

function Welcome({ onEnter }) {
  const [showIntro, setShowIntro] = useState(() =>
    typeof window !== "undefined" &&
    !window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches
  );
  const [leaving, setLeaving] = useState(false);
  const exitTimer = useRef(null);

  useEffect(() => {
    if (!showIntro) return undefined;

    const timer = window.setTimeout(() => setShowIntro(false), 1500);
    return () => window.clearTimeout(timer);
  }, [showIntro]);

  useEffect(() => () => {
    if (exitTimer.current !== null) window.clearTimeout(exitTimer.current);
  }, []);

  const handleEnter = () => {
    if (leaving || showIntro) return;

    const reducedMotion = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)"
    )?.matches;

    if (reducedMotion) {
      onEnter?.();
      return;
    }

    setLeaving(true);
    exitTimer.current = window.setTimeout(() => onEnter?.(), 620);
  };

  return (
    <main
      className={`welcome-page${showIntro ? " welcome-page-intro" : ""}${
        leaving ? " welcome-page-leaving" : ""
      }`}
    >
      <div className="welcome-ambient" aria-hidden="true" />

      {showIntro && (
        <section className="welcome-opening" aria-label="Welcome introduction">
          <div className="welcome-opening-inner">
            <span className="welcome-opening-mark">SN</span>
            <p>Welcome to my portfolio</p>
            <h2>Siddharth Nayak</h2>
            <span className="welcome-opening-line" aria-hidden="true" />
          </div>

          <button
            type="button"
            className="welcome-skip"
            onClick={() => setShowIntro(false)}
          >
            Skip intro <span aria-hidden="true">→</span>
          </button>
        </section>
      )}

      <div className="welcome-shell" aria-hidden={showIntro} inert={showIntro}>
        <header className="welcome-header">
          <span className="welcome-monogram" aria-hidden="true">SN</span>
          <span>Personal Portfolio</span>
        </header>

        <div className="welcome-layout">
          <section className="welcome-copy" aria-labelledby="welcome-title">
            <p className="welcome-eyebrow">Welcome to my portfolio</p>

            <h1 id="welcome-title">
              Hi, I’m <span>Siddharth Nayak.</span>
            </h1>

            <p className="welcome-description">
              I’m a BBA student at Manipal Academy of Higher Education,
              interested in finance, marketing and technology. I enjoy
              exploring new ideas and building practical projects that
              connect business with technology.
            </p>

            <button
              className="welcome-enter"
              type="button"
              onClick={handleEnter}
              disabled={leaving}
              aria-busy={leaving}
            >
              <span>{leaving ? "Entering Portfolio" : "Enter Portfolio"}</span>
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M5 12h14m-5-5 5 5-5 5" />
              </svg>
            </button>
          </section>

          <div className="welcome-portrait-stage">
            <div className="welcome-portrait-orbit" aria-hidden="true" />
            <div className="welcome-portrait-frame">
              <img
                className="welcome-portrait"
                src={profileImage}
                alt="Portrait of Siddharth Nayak"
                width="1254"
                height="1254"
                fetchPriority="high"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="welcome-exit-ring" aria-hidden="true" />
    </main>
  );
}

export default Welcome;