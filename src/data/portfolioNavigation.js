import { createContext } from "react";

export const SectionNavigationContext = createContext(null);

export const publicSections = [
  { id: "about", label: "About" },
  { id: "experience", label: "Experience" },
  { id: "projects", label: "Projects" },
  { id: "skills", label: "Skills" },
  { id: "education", label: "Education" },
  { id: "certifications", label: "Certifications" },
  { id: "game", label: "Game" },
  { id: "contact", label: "Contact" },
];
