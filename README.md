# Siddharth Nayak Portfolio

A React and Vite portfolio with a white, console-inspired interface, circular navigation, and the **KEEP IT TOGETHER** game. The game uses Firebase Authentication and Firestore for player records and its leaderboard. A private, LinkedIn-style Admin CMS manages the public portfolio content.

## Run locally

```bash
npm ci
npm run dev
```

Open the URL printed by Vite. The Admin dashboard is at `/Siddharth-Portfolio/admin` on the same origin. Sign in with the authorized Firebase Admin account.

## Content and media

- The eight Admin editors manage About, Experience, Projects, Skills, Education, Certifications, Resume, and Contact. Each editor loads content from Cloud Firestore, supports a live preview, and publishes changes when **Save changes** is clicked.
- Certifications have a separate public page and Admin editor. Each entry can include an image, PDF, issuer, dates, credential ID, verification link, skills, and a visibility setting. Unpublished entries are kept in an Admin-only Firestore document. Public portfolio images open in a full-picture viewer.
- Images and PDFs selected in Admin upload directly to Cloudinary with cloud name `zsvjuaee` and unsigned preset `siddharth_portfolio`. The returned HTTPS media URL is saved to Firestore only after **Save changes** is clicked. Images are limited to 8 MB and PDFs to 15 MB in the browser.
- The PDF fields also accept a public HTTPS PDF link when a document is hosted elsewhere.
- Removing or replacing media in the CMS updates the portfolio reference when saved. It does not delete the underlying Cloudinary asset; asset cleanup is done in Cloudinary's Media Library.
- Firebase Storage is not used. The Firestore rules in `firestore.rules` protect Admin writes and game data.

Cloudinary's unsigned preset is a public client-side identifier. Keep its allowed formats, size limits, and other upload safeguards configured in the Cloudinary Console. No API secret belongs in browser code.

## Main files

| File | Purpose |
| --- | --- |
| `src/App.jsx` | Public navigation and protected Admin route |
| `src/components/home/` | Welcome screen and circular navigation |
| `src/components/sections/` | Public portfolio sections and game |
| `src/components/admin/` | Admin dashboard and section editors |
| `src/components/admin/AdminEditorUI.jsx` | Shared media upload and editor controls |
| `src/cloudinary/portfolioUpload.js` | Cloudinary validation and unsigned upload |
| `src/firebase/firebase.js` | Separate Firebase app instances for Admin and anonymous game players |
| `src/firebase/portfolioService.js` | Admin Firestore reads and writes |
| `src/firebase/playerService.js` | Game leaderboard data |

## Checks and deployment

```bash
npm run lint
npm run build
```

The GitHub Actions workflow in `.github/workflows/deploy.yml` builds and publishes the static site to GitHub Pages when `main` is pushed. Vite's base path is `/Siddharth-Portfolio/`.
