# Siddharth Nayak — Interactive Portfolio

A personal portfolio website designed as an interactive digital experience rather than a traditional portfolio.

The website takes inspiration from modern console interfaces, especially the way users browse and select content, while maintaining its own visual identity and design language.

## Live Website

Coming soon:

https://siddharthnayakportfolio.com

## About the Project

This portfolio is being built for recruiters, hiring managers, and anyone interested in exploring my work.

Instead of using a traditional scrolling portfolio layout, the website uses an interactive navigation system where visitors can explore different parts of my professional profile.

The main experience includes:

- Interactive welcome screen
- Console-inspired portfolio navigation
- About Me
- Projects
- Skills
- Resume
- Contact
- Interactive portfolio game
- Game leaderboard

## Admin System

The portfolio will also include a private admin dashboard operated by me.

The admin system will allow me to update my portfolio without changing the website code manually.

Planned admin features include:

- Edit profile information
- Update About Me
- Add, edit, and remove projects
- Manage skills
- Manage education
- Manage experience
- Upload/update resume
- Manage contact and social links
- View and manage the game leaderboard

Changes made through the admin dashboard will be reflected on the public portfolio.

## Tech Stack

### Frontend

- React
- Vite
- JavaScript / JSX
- Tailwind CSS

### Development

- VS Code
- Git
- GitHub
- AI-assisted development

### Deployment

- Vercel
- Custom domain

### Planned Backend

- Authentication
- Database
- File storage
- API/services for portfolio content
- Game leaderboard storage

The exact backend services will be finalized during development.

## Project Structure

```text
Siddharth-Portfolio/
│
├── public/
│
├── src/
│   │
│   ├── assets/
│   │
│   ├── components/
│   │   ├── admin/
│   │   ├── common/
│   │   ├── home/
│   │   └── sections/
│   │
│   ├── pages/
│   │   ├── public/
│   │   └── admin/
│   │
│   ├── data/
│   ├── hooks/
│   ├── lib/
│   ├── services/
│   ├── context/
│   ├── utils/
│   │
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
│
├── .gitignore
├── eslint.config.js
├── index.html
├── package.json
├── package-lock.json
├── README.md
└── vite.config.js