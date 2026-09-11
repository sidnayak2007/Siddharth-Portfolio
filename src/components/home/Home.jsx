import {
  useMemo,
  useState,
} from "react";

import HomeBackground from "./HomeBackground";

import "../../css/home.css";

/*
=========================================================
HOME SECTIONS
=========================================================
*/

const menuItems = [
  {
    id: "about",
    label: "About",
    number: "01",
    title: "About Me",
    eyebrow: "Profile",
    description:
      "A little about who I am, what I study, what I enjoy building and the direction I am currently exploring.",
    primary: "#4f8edc",
    secondary: "#a9d4ff",
    soft: "#edf6ff",
  },

  {
    id: "experience",
    label: "Experience",
    number: "02",
    title: "Experience",
    eyebrow: "Journey",
    description:
      "Leadership, internships, responsibilities, events and experiences that have shaped the way I work.",
    primary: "#7b78da",
    secondary: "#c8c5ff",
    soft: "#f2f1ff",
  },

  {
    id: "projects",
    label: "Projects",
    number: "03",
    title: "Projects",
    eyebrow: "Selected Work",
    description:
      "Digital products, experiments and interactive experiences built from ideas, curiosity and AI-assisted development.",
    primary: "#7257dc",
    secondary: "#bcaeff",
    soft: "#f3f0ff",
  },

  {
    id: "skills",
    label: "Skills",
    number: "04",
    title: "Skills",
    eyebrow: "Capabilities",
    description:
      "Business thinking, communication, product ideas, digital tools and the technologies I use while building.",
    primary: "#279cae",
    secondary: "#9de1e6",
    soft: "#eefafb",
  },
{
  id: "education",
  label: "Education",
  number: "05",
  title: "Education",
  eyebrow: "Academic Journey",
  description:
    "My academic journey, qualifications, achievements and learning experiences that have shaped how I think and work.",
  primary: "#2563eb",
  secondary: "#93c5fd",
  soft: "#eff6ff",
},
  {
    id: "resume",
    label: "Resume",
    number: "06",
    title: "Resume",
    eyebrow: "Overview",
    description:
      "A concise overview of my education, experience, projects, achievements, skills and interests.",
    primary: "#c78b42",
    secondary: "#f1c98c",
    soft: "#fff7ea",
  },

  {
    id: "game",
    label: "Play",
    number: "07",
    title: "Keep It Together",
    eyebrow: "Playground",
    description:
      "Protect a moving balloon from flying office objects. Move the shield, intercept everything you can and survive for as long as possible.",
    primary: "#e26b8f",
    secondary: "#ffc1d2",
    soft: "#fff1f6",
  },
];

/*
=========================================================
HOME
=========================================================
*/

function Home({
  onOpenSection,
}) {
  const [
    activeId,
    setActiveId,
  ] = useState("projects");

  const [
    transitionKey,
    setTransitionKey,
  ] = useState(0);

  /*
  ========================================================
  ACTIVE ITEM
  ========================================================
  */

  const activeItem =
    useMemo(
      () =>
        menuItems.find(
          (item) =>
            item.id ===
            activeId
        ) ||
        menuItems.find(
          (item) =>
            item.id ===
            "projects"
        ) ||
        menuItems[0],
      [activeId]
    );

  /*
  ========================================================
  SELECT SECTION
  ========================================================
  */

  const changeSection =
    (id) => {
      const exists =
        menuItems.some(
          (item) =>
            item.id === id
        );

      if (
        !exists ||
        id === activeId
      ) {
        return;
      }

      setActiveId(
        id
      );

      setTransitionKey(
        (value) =>
          value + 1
      );
    };

  /*
  ========================================================
  OPEN SECTION
  ========================================================

  App.jsx owns portfolio navigation.

  Home only sends the selected section object upward.
  ========================================================
  */

  const openSection =
    (item) => {
      if (
        !item ||
        typeof onOpenSection !==
          "function"
      ) {
        return;
      }

      onOpenSection(
        item
      );
    };

  const handleOpen =
    () => {
      openSection(
        activeItem
      );
    };

  const openSectionById =
    (id) => {
      const item =
        menuItems.find(
          (entry) =>
            entry.id === id
        );

      if (
        item
      ) {
        openSection(
          item
        );

        return;
      }

      /*
      Contact is intentionally not part of
      the large PS5 card carousel.
      */
      if (
        id === "contact" &&
        typeof onOpenSection ===
          "function"
      ) {
        onOpenSection({
          id: "contact",
        });
      }
    };

  /*
  ========================================================
  ADMIN
  ========================================================
  */

  const handleAdminOpen =
    () => {
      window.location.href =
        "/admin";
    };

  /*
  ========================================================
  KEYBOARD CARD NAVIGATION
  ========================================================
  */

  const handleCardKeyDown =
    (
      event,
      index
    ) => {
      if (
        event.key !==
          "ArrowRight" &&
        event.key !==
          "ArrowLeft"
      ) {
        return;
      }

      event.preventDefault();

      const direction =
        event.key ===
        "ArrowRight"
          ? 1
          : -1;

      const nextIndex =
        (
          index +
          direction +
          menuItems.length
        ) %
        menuItems.length;

      changeSection(
        menuItems[
          nextIndex
        ].id
      );
    };

  return (
    <main
      className="ps-home"
      style={{
        "--active-primary":
          activeItem.primary,

        "--active-secondary":
          activeItem.secondary,

        "--active-soft":
          activeItem.soft,
      }}
    >
      <HomeBackground
        primary={
          activeItem.primary
        }
        secondary={
          activeItem.secondary
        }
        soft={
          activeItem.soft
        }
      />

      <div
        key={
          transitionKey
        }
        className="section-transition-flash"
        aria-hidden="true"
      />

      {/*
      =====================================================
      TOP BAR
      =====================================================
      */}

      <header className="ps-topbar">
        <button
          type="button"
          className="ps-profile"
          onClick={() => {
            openSectionById(
              "about"
            );
          }}
          aria-label="Open About section"
        >
          <div
            className="ps-profile-logo"
            aria-hidden="true"
          >
            <span>
              SN
            </span>
          </div>

          <div className="ps-profile-copy">
            <strong>
              Siddharth Nayak
            </strong>

            <span>
              Personal Portfolio
            </span>
          </div>
        </button>

        <nav
          className="ps-main-nav"
          aria-label="Portfolio navigation"
        >
          <button
            type="button"
            className={
              activeId ===
              "projects"
                ? "active"
                : ""
            }
            onClick={() =>
              changeSection(
                "projects"
              )
            }
            aria-current={
              activeId ===
              "projects"
                ? "page"
                : undefined
            }
          >
            Home
          </button>

          <button
            type="button"
            className={
              activeId ===
              "projects"
                ? "active"
                : ""
            }
            onClick={() =>
              changeSection(
                "projects"
              )
            }
          >
            Projects
          </button>

          <button
            type="button"
            className={
              activeId ===
              "experience"
                ? "active"
                : ""
            }
            onClick={() =>
              changeSection(
                "experience"
              )
            }
          >
            Experience
          </button>

          <button
            type="button"
            className={
              activeId ===
              "about"
                ? "active"
                : ""
            }
            onClick={() =>
              changeSection(
                "about"
              )
            }
          >
            About
          </button>
        </nav>

        <div className="ps-top-actions">
          <button
            type="button"
            className="ps-circle-button"
            aria-label="Open resume"
            title="Resume"
            onClick={() => {
              openSectionById(
                "resume"
              );
            }}
          >
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <rect
                x="6"
                y="3"
                width="12"
                height="18"
                rx="2"
              />

              <path d="M9 8h6" />
              <path d="M9 12h6" />
              <path d="M9 16h4" />
            </svg>
          </button>

          <button
            type="button"
            className="ps-circle-button ps-admin-button"
            aria-label="Open admin"
            title="Admin"
            onClick={
              handleAdminOpen
            }
          >
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle
                cx="12"
                cy="12"
                r="3"
              />

              <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.83 2.83-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1.03 1.56V21h-4v-.08A1.7 1.7 0 0 0 9 19.37a1.7 1.7 0 0 0-1.88.34l-.06.06-2.83-2.83.06-.06A1.7 1.7 0 0 0 4.63 15a1.7 1.7 0 0 0-1.55-1H3v-4h.08A1.7 1.7 0 0 0 4.63 9a1.7 1.7 0 0 0-.34-1.88l-.06-.06 2.83-2.83.06.06A1.7 1.7 0 0 0 9 4.63a1.7 1.7 0 0 0 1-1.55V3h4v.08a1.7 1.7 0 0 0 1.03 1.55 1.7 1.7 0 0 0 1.88-.34l.06-.06 2.83 2.83-.06.06A1.7 1.7 0 0 0 19.4 9c.23.61.82 1.01 1.47 1H21v4h-.13c-.65-.01-1.24.39-1.47 1Z" />
            </svg>
          </button>

          <button
            type="button"
            className="ps-contact-button"
            onClick={() => {
              openSectionById(
                "contact"
              );
            }}
          >
            Contact
          </button>
        </div>
      </header>

      {/*
      =====================================================
      DASHBOARD
      =====================================================
      */}

      <section className="ps-dashboard">
        <div className="ps-intro">
          <div className="ps-intro-top">
            <span className="ps-overline">
              Welcome to my portfolio
            </span>

            <span className="ps-online">
              <i />

              Available
            </span>
          </div>

          <h1>
            Siddharth Nayak
          </h1>

          <p>
            BBA Student

            <span>
              •
            </span>

            Builder

            <span>
              •
            </span>

            Product Thinker
          </p>
        </div>

        {/*
        ===================================================
        SECTION CARDS
        ===================================================
        */}

        <div
          className="ps-card-row"
          role="list"
          aria-label="Portfolio sections"
        >
          {menuItems.map(
            (
              item,
              index
            ) => {
              const isActive =
                item.id ===
                activeId;

              return (
                <button
                  key={
                    item.id
                  }
                  type="button"
                  role="listitem"
                  className={`ps-menu-card ${
                    isActive
                      ? "ps-menu-card-active"
                      : ""
                  }`}
                  onClick={() =>
                    changeSection(
                      item.id
                    )
                  }
                  onFocus={() =>
                    changeSection(
                      item.id
                    )
                  }
                  onKeyDown={(
                    event
                  ) =>
                    handleCardKeyDown(
                      event,
                      index
                    )
                  }
                  aria-label={`Select ${item.label}`}
                  aria-pressed={
                    isActive
                  }
                >
                  <div className="ps-card-art">
                    <div
                      className="ps-card-theme"
                      style={{
                        "--card-primary":
                          item.primary,

                        "--card-secondary":
                          item.secondary,
                      }}
                    />

                    <span className="ps-card-number">
                      {
                        item.number
                      }
                    </span>

                    {/*
                    ABOUT
                    */}

                    {item.id ===
                      "about" && (
                      <div
                        className="symbol symbol-about"
                        aria-hidden="true"
                      >
                        <div className="symbol-head" />

                        <div className="symbol-body" />
                      </div>
                    )}

                    {/*
                    EXPERIENCE
                    */}

                    {item.id ===
                      "experience" && (
                      <div
                        className="symbol symbol-experience"
                        aria-hidden="true"
                      >
                        <span />
                        <span />
                        <span />
                        <span />
                      </div>
                    )}

                    {/*
                    PROJECTS
                    */}

                    {item.id ===
                      "projects" && (
                      <div
                        className="symbol symbol-projects"
                        aria-hidden="true"
                      >
                        <div className="symbol-window symbol-window-back" />

                        <div className="symbol-window symbol-window-front">
                          <span />
                          <span />
                          <span />
                        </div>
                      </div>
                    )}

                    {/*
                    SKILLS
                    */}

                    {item.id ===
                      "skills" && (
                      <div
                        className="symbol symbol-skills"
                        aria-hidden="true"
                      >
                        <span />
                        <span />
                        <span />
                        <span />
                      </div>
                    )}
{/*
EDUCATION
*/}

{item.id ===
  "education" && (
  <div
    className="symbol symbol-education"
    aria-hidden="true"
  >
    <div className="education-book">
      <span />
      <span />
      <span />
    </div>

    <div className="education-cap">
      <span className="education-cap-top" />

      <span className="education-cap-band" />

      <span className="education-cap-tassel" />
    </div>
  </div>
)}
                    {/*
                    RESUME
                    */}

                    {item.id ===
                      "resume" && (
                      <div
                        className="symbol symbol-resume"
                        aria-hidden="true"
                      >
                        <div className="resume-photo" />

                        <span />
                        <span />
                        <span />
                        <span />
                      </div>
                    )}

                    {/*
                    GAME
                    */}

                    {item.id ===
                      "game" && (
                      <div
                        className="symbol symbol-game"
                        aria-hidden="true"
                      >
                        <div className="controller-body" />

                        <span className="controller-stick stick-left" />

                        <span className="controller-stick stick-right" />

                        <span className="controller-dot" />
                      </div>
                    )}

                    <div
                      className="ps-card-reflection"
                      aria-hidden="true"
                    />
                  </div>

                  <div className="ps-card-text">
                    <span>
                      {
                        item.label
                      }
                    </span>

                    {isActive && (
                      <i
                        aria-hidden="true"
                      />
                    )}
                  </div>
                </button>
              );
            }
          )}
        </div>

        {/*
        ===================================================
        ACTIVE SECTION INFORMATION
        ===================================================
        */}

        <div className="ps-feature">
          <div
            key={
              activeId
            }
            className="ps-feature-copy"
          >
            <div className="ps-feature-eyebrow">
              <span>
                {
                  activeItem.number
                }
              </span>

              <i />

              <span>
                {
                  activeItem.eyebrow
                }
              </span>
            </div>

            <h2>
              {
                activeItem.title
              }
            </h2>

            <p>
              {
                activeItem.description
              }
            </p>

            <button
              type="button"
              className="ps-open-button"
              onClick={
                handleOpen
              }
            >
              <span>
                {activeId ===
                "game"
                  ? "Play Game"
                  : "Explore"}
              </span>

              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M5 12h14" />

                <path d="m14 7 5 5-5 5" />
              </svg>
            </button>
          </div>

          {/*
          =================================================
          FEATURE VISUAL
          =================================================
          */}

          <div
            key={`visual-${activeId}`}
            className="ps-feature-visual"
            aria-hidden="true"
          >
            <div className="feature-orbit orbit-one" />

            <div className="feature-orbit orbit-two" />

            <div className="feature-floating-card floating-card-back" />

            <div className="feature-main-card">
              <div className="feature-card-glow" />

              <div className="feature-card-top">
                <span>
                  {
                    activeItem.eyebrow
                  }
                </span>

                <span>
                  {
                    activeItem.number
                  }
                </span>
              </div>

              <div className="feature-card-content">
                <span className="feature-mini">
                  {activeId ===
                  "game"
                    ? "Playground"
                    : "Portfolio"}
                </span>

                <strong>
                  {
                    activeItem.label
                  }
                </strong>

                <div className="feature-progress">
                  <span />
                </div>
              </div>

              <div className="feature-corner">
                <svg viewBox="0 0 24 24">
                  <path d="M5 19 19 5" />

                  <path d="M10 5h9v9" />
                </svg>
              </div>
            </div>

            <div className="feature-floating-card floating-card-front" />
          </div>
        </div>

        {/*
        ===================================================
        FOOTER
        ===================================================
        */}

        <footer className="ps-home-footer">
          <div className="ps-controls">
            <span>
              <i className="control-circle" />

              Select section
            </span>

            <span>
              <i className="control-cross">
                ×
              </i>

              {activeId ===
              "game"
                ? "Play"
                : "Open"}
            </span>
          </div>

          <div
            className="ps-pagination"
            aria-label="Section selector"
          >
            {menuItems.map(
              (item) => (
                <button
                  key={
                    item.id
                  }
                  type="button"
                  aria-label={`Select ${item.label}`}
                  aria-pressed={
                    item.id ===
                    activeId
                  }
                  className={
                    item.id ===
                    activeId
                      ? "active"
                      : ""
                  }
                  onClick={() =>
                    changeSection(
                      item.id
                    )
                  }
                />
              )
            )}
          </div>

          <button
            type="button"
            className="ps-scroll"
            onClick={() => {
              openSectionById(
                "projects"
              );
            }}
          >
            Explore portfolio

            <span
              aria-hidden="true"
            >
              ↓
            </span>
          </button>
        </footer>
      </section>
    </main>
  );
}

export default Home;