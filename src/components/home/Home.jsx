import { useState } from "react";
import HomeBackground from "./HomeBackground";
import "../../css/home.css";

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
    label: "Game",
    number: "07",
    title: "Keep It Together",
    eyebrow: "Playground",
    description:
      "Protect a moving balloon from flying office objects. Move the shield, intercept everything you can and survive for as long as possible.",
    primary: "#e26b8f",
    secondary: "#ffc1d2",
    soft: "#fff1f6",
  },
  {
    id: "contact", label: "Contact", number: "08", title: "Contact",
    primary: "#4c8bca", secondary: "#9bc9ef", soft: "#edf7ff",
  },
];

function Home({ onOpenSection }) {
  const [activeId, setActiveId] = useState("projects");
  const activeItem = menuItems.find((item) => item.id === activeId) || menuItems[0];

  const handleKeyDown = (event, index) => {
    if (!["ArrowRight", "ArrowLeft", "ArrowUp", "ArrowDown"].includes(event.key)) return;
    event.preventDefault();
    const step = event.key === "ArrowRight" || event.key === "ArrowDown" ? 1 : -1;
    const next = menuItems[(index + step + menuItems.length) % menuItems.length];
    setActiveId(next.id);
    document.getElementById(`portfolio-card-${next.id}`)?.focus();
  };

  return (
    <main className="ps-home" style={{ "--active-primary": activeItem.primary, "--active-secondary": activeItem.secondary, "--active-soft": activeItem.soft }}>
      <HomeBackground primary={activeItem.primary} secondary={activeItem.secondary} soft={activeItem.soft} />
      <header className="ps-home-header">
        <span className="ps-home-welcome">Welcome to Portfolio</span>
        <button type="button" className="ps-home-admin" onClick={() => { window.location.href = "/admin"; }} aria-label="Open admin">Admin</button>
      </header>
      <section className="ps-home-content" aria-label="Siddharth Nayak portfolio">
        <div className="ps-wheel" aria-label="Portfolio sections">
          <div className="ps-wheel-ring" aria-hidden="true" />
          <div className="ps-wheel-center" aria-live="polite">
            <span className="ps-center-mark">SN</span>
            <strong>Siddharth Nayak</strong>
            <span className="ps-center-selected">{activeItem.label}</span>
          </div>
          {menuItems.map((item, index) => (
            <button id={`portfolio-card-${item.id}`} key={item.id} type="button"
              className={`ps-menu-card ${activeId === item.id ? "ps-menu-card-active" : ""}`}
              style={{ "--angle": `${index * 45 - 90}deg`, "--counter-angle": `${90 - index * 45}deg`, "--card-primary": item.primary, "--card-secondary": item.secondary }}
              onClick={() => setActiveId(item.id)}
              onKeyDown={(event) => handleKeyDown(event, index)}
              aria-label={`Select ${item.label}`} aria-pressed={activeId === item.id}>
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

                    {item.id === "contact" && (
                      <svg className="symbol symbol-contact" viewBox="0 0 80 80" fill="none" aria-hidden="true">
                        <rect x="9" y="19" width="62" height="43" rx="10" fill="#dceeff" stroke="#5796cf" strokeWidth="3" />
                        <path d="m12 23 28 22 28-22" stroke="#5796cf" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="m12 59 18-17m38 17L50 42" stroke="#9cc9ed" strokeWidth="2" />
                      </svg>
                    )}
                    <div
                      className="ps-card-reflection"
                      aria-hidden="true"
                    />
                  </div>
              <span className="ps-card-text">{item.label}</span>
            </button>
          ))}
        </div>
        <button className="ps-open-button" type="button" onClick={() => onOpenSection?.(activeItem)}>
          Explore {activeItem.label}
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14m-5-5 5 5-5 5" /></svg>
        </button>
      </section>
    </main>
  );
}

export default Home;
