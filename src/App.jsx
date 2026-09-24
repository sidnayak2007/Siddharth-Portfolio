import { lazy, Suspense, useEffect, useState } from "react";
import Welcome from "./components/home/Welcome";
import Home from "./components/home/Home";
import { publicSections, SectionNavigationContext } from "./data/portfolioNavigation";
import { getAdminSection } from "./utils/adminPath";

const About = lazy(() => import("./components/sections/About"));
const Experience = lazy(() => import("./components/sections/experience"));
const Projects = lazy(() => import("./components/sections/Projects"));
const Skills = lazy(() => import("./components/sections/Skills"));
const Education = lazy(() => import("./components/sections/Education"));
const Certifications = lazy(() => import("./components/sections/Certifications"));
const Resume = lazy(() => import("./components/sections/Resume"));
const Contact = lazy(() => import("./components/sections/Contact"));
const Game = lazy(() => import("./components/sections/Game"));
const AdminRoute = lazy(() => import("./components/admin/AdminRoute"));

const pages = {
  about: About,
  experience: Experience,
  projects: Projects,
  skills: Skills,
  education: Education,
  certifications: Certifications,
  resume: Resume,
  game: Game,
  contact: Contact,
};

function LoadingPage({ label }) {
  return <main role="status" style={{ minHeight: "100dvh", display: "grid", placeItems: "center", padding: 24, background: "#fbfdff", color: "#52709c", fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}>Opening {label}…</main>;
}

export default function App() {
  const isAdminPage = getAdminSection() !== null;
  const [started, setStarted] = useState(false);
  const [activeSection, setActiveSection] = useState(null);

  useEffect(() => {
    if (isAdminPage) return undefined;
    // A fresh page load always begins at Welcome, even after Home was reloaded.
    // Same-document Back/Forward still uses the entries created below.
    window.history.replaceState(null, "");
    const syncHistory = () => {
      const view = window.history.state?.portfolioView;
      setStarted(Boolean(view));
      setActiveSection(publicSections.find((item) => item.id === view) || null);
    };
    window.addEventListener("popstate", syncHistory);
    return () => window.removeEventListener("popstate", syncHistory);
  }, [isAdminPage]);

  const openSection = (section) => {
    const item = publicSections.find((entry) => entry.id === section?.id);
    if (!item) return;
    window.history.pushState({ portfolioView: item.id }, "");
    setActiveSection(item);
  };

  const backHome = () => {
    window.history.pushState({ portfolioView: "home" }, "");
    setActiveSection(null);
  };

  if (isAdminPage) return <Suspense fallback={<LoadingPage label="Admin" />}><AdminRoute /></Suspense>;

  if (!started) return <Welcome onEnter={() => {
    window.history.pushState({ portfolioView: "home" }, "");
    setStarted(true);
  }} />;

  if (activeSection) {
    const Page = pages[activeSection.id];
    if (Page) {
      const index = publicSections.findIndex((item) => item.id === activeSection.id);
      const navigation = {
        previous: publicSections[(index - 1 + publicSections.length) % publicSections.length],
        next: publicSections[(index + 1) % publicSections.length],
        open: (id) => openSection(publicSections.find((item) => item.id === id)),
      };
      return <SectionNavigationContext.Provider value={navigation}>
        <Suspense fallback={<LoadingPage label={activeSection.label || "section"} />}>
          <Page onBack={backHome} onNavigate={navigation.open} />
        </Suspense>
      </SectionNavigationContext.Provider>;
    }
  }

  return <Home onOpenSection={openSection} />;
}
