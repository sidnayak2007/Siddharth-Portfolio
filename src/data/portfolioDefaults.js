/* =========================================================
   PORTFOLIO DEFAULT CONTENT
========================================================= */

export function createContentId(prefix = "item") {
  const safePrefix = String(prefix || "item")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/g, "-")
    .replace(/^-+|-+$/g, "") || "item";

  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return `${safePrefix}-${crypto.randomUUID()}`;
  }

  return `${safePrefix}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 10)}`;
}

/* =========================================================
   ABOUT
========================================================= */

export const aboutFallback = {
  eyebrow: "ABOUT / 01",

  photoUrl: "",
  photoPath: "",
  photoName: "",
  location: "",
  links: [],

  name: "Siddharth Nayak",

  headline:
    "Business, technology and ideas that become real things.",

  intro:
    "I’m a BBA student who enjoys turning ideas into things people can actually use, explore and interact with.",

  description:
    "Most of what I build starts with curiosity. I like experimenting with technology, design and AI to turn rough ideas into working digital experiences, while bringing a business and product perspective to the process.",

  quote:
    "I care less about whether an idea starts perfectly and more about whether I can turn it into something real.",

  tags: [
    "Business",
    "Product Thinking",
    "Technology",
    "Creative Building",
  ],

  stats: [
    {
      value: "BBA",
      label: "Current degree",
    },
    {
      value: "AI",
      label: "Assisted workflow",
    },
    {
      value: "∞",
      label: "Ideas in progress",
    },
  ],

  focus: [
    {
      number: "01",
      title: "Business",
      text:
        "Understanding how ideas create value, how products are positioned and how people make decisions.",
    },
    {
      number: "02",
      title: "Building",
      text:
        "Turning concepts into working websites, experiments and interactive digital experiences.",
    },
    {
      number: "03",
      title: "Technology",
      text:
        "Using modern tools and AI to explore what is possible without being limited by a traditional technical background.",
    },
  ],
};

/* =========================================================
   EXPERIENCE
========================================================= */

export const experienceFallback = {
  eyebrow: "EXPERIENCE / 02",

  heading:
    "Experiences that shaped how I work.",

  intro:
    "A collection of internships, leadership roles, responsibilities and experiences that have helped me learn by doing.",

  items: [],
};

/* =========================================================
   PROJECTS
========================================================= */

export const projectsFallback = {
  eyebrow: "PROJECTS / 03",

  heading:
    "Things I’ve built.",

  intro:
    "A collection of projects, experiments and digital experiences created by turning ideas into something real.",

  items: [
    {
      id: "project-leya",

      title: "LEYA",

      type: "Digital Experience",

      description:
        "An interactive project focused on creating a memorable digital experience.",

      technologies: [],

      projectUrl: "",

      githubUrl: "",

      imageUrl: "",

      imagePath: "",

      featured: true,
    },

    {
      id:
        "project-college-simulator",

      title:
        "COLLEGE SIMULATOR",

      type:
        "Interactive Game",

      description:
        "A game concept inspired by everyday college life and experiences.",

      technologies: [],

      projectUrl: "",

      githubUrl: "",

      imageUrl: "",

      imagePath: "",

      featured: false,
    },

    {
      id: "project-portfolio",

      title: "PORTFOLIO",

      type: "Web Experience",

      description:
        "The interactive portfolio you're currently exploring.",

      technologies: [],

      projectUrl: "",

      githubUrl: "",

      imageUrl: "",

      imagePath: "",

      featured: false,
    },
  ],
};

/* =========================================================
   SKILLS
========================================================= */

export const skillsFallback = {
  eyebrow: "SKILLS / 04",

  heading:
    "What I work with.",

  intro:
    "A combination of business knowledge, creative thinking, modern web technologies and AI-assisted development.",

  categories: [
    {
      id:
        "skill-category-web",

      title: "Web",

      skills: [
        "React",
        "JavaScript",
        "Tailwind CSS",
        "Vercel",
      ],
    },

    {
      id:
        "skill-category-development",

      title:
        "Development",

      skills: [
        "Git",
        "GitHub",
        "VS Code",
        "AI-Assisted Development",
      ],
    },

    {
      id:
        "skill-category-creative",

      title:
        "Creative",

      skills: [
        "UI / UX",
        "Prototyping",
        "Digital Experiences",
        "Problem Solving",
      ],
    },

    {
      id:
        "skill-category-business",

      title:
        "Business",

      skills: [
        "Strategy",
        "Marketing",
        "Communication",
        "Business",
      ],
    },
  ],
};

/* =========================================================
   EDUCATION
========================================================= */

export const educationFallback = {
  eyebrow:
    "EDUCATION / 05",

  heading:
    "Learning that shaped how I think.",

  intro:
    "My academic journey across business, commerce and continuous learning.",

  items: [],
};

/* =========================================================
   RESUME
========================================================= */

export const resumeFallback = {
  eyebrow:
    "RESUME / 06",

  title: "Resume",
  description: "A full overview of my education, experience and projects.",
  lastUpdated: "",

  heading:
    "The story so far.",

  intro:
    "A snapshot of my education, experiences, projects and the things I continue to learn along the way.",

  pdfUrl: "",

  pdfPath: "",

  pdfName: "",

  timeline: [
    {
      id:
        "resume-education",

      year:
        "2025 — PRESENT",

      title:
        "BBA — Manipal Academy of Higher Education",

      description:
        "Building a foundation across business, marketing, finance and management while exploring technology and digital products alongside academics.",
    },

    {
      id:
        "resume-experience",

      year: "2026",

      title:
        "Internships & Practical Learning",

      description:
        "Applying classroom learning through practical work, projects and experiences that strengthen communication, problem solving and business thinking.",
    },

    {
      id:
        "resume-projects",

      year:
        "ONGOING",

      title:
        "Digital Products & Experiments",

      description:
        "Building websites, applications, games and interactive experiences using modern tools and AI-assisted development.",
    },

    {
      id:
        "resume-growth",

      year:
        "ONGOING",

      title:
        "Learning by Building",

      description:
        "Continuously experimenting with new ideas, improving existing projects and learning the tools required to turn concepts into working products.",
    },
  ],
};

/* =========================================================
   CONTACT
========================================================= */

export const contactFallback = {
  eyebrow:
    "CONTACT / 08",

  heading:
    "Let’s connect.",

  intro:
    "Have an opportunity, project, idea or just want to say hello? I’m always open to a good conversation.",

  availabilityHeading:
    "Open to opportunities",

  availabilityText:
    "Open to internships, collaborations, projects and professional conversations.",

  links: [],
};
