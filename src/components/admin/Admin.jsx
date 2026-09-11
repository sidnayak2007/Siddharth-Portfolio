import AdminAbout from "./AdminAbout";
import AdminContact from "./AdminContact";
import AdminEducation from "./AdminEducation";
import AdminExperience from "./AdminExperience";
import AdminProjects from "./AdminProjects";
import AdminResume from "./AdminResume";
import AdminShell from "./AdminShell";
import AdminSkills from "./AdminSkills";
import { ADMIN_SECTIONS } from "./adminConfig";

import "../../css/admin.css";

const EDITORS = {
  about: AdminAbout,
  experience: AdminExperience,
  projects: AdminProjects,
  skills: AdminSkills,
  education: AdminEducation,
  resume: AdminResume,
  contact: AdminContact,
};

function AdminDashboard() {
  return (
    <AdminShell activeSection="dashboard">
      <div className="admin-page-heading">
        <div>
          <span className="admin-eyebrow">OVERVIEW</span>
          <h1>Dashboard</h1>
          <p>Manage every public portfolio section from one Firebase-connected workspace.</p>
        </div>
        <div className="admin-online">
          <span aria-hidden="true" />
          <div><small>CMS STATUS</small><strong>Ready</strong></div>
        </div>
      </div>

      <div className="admin-summary-grid">
        <article><span>EDITORS</span><strong>{ADMIN_SECTIONS.length}</strong><p>All portfolio content editors are connected.</p></article>
        <article><span>STORAGE</span><strong>ON</strong><p>Images and the resume PDF upload directly.</p></article>
        <article><span>GAME</span><strong>SAFE</strong><p>Player identity remains separate from Admin auth.</p></article>
      </div>

      <section className="admin-section-panel">
        <div className="admin-section-panel-header">
          <div><span className="admin-eyebrow">CONTENT</span><h2>Portfolio sections</h2></div>
          <span>{ADMIN_SECTIONS.length} editors</span>
        </div>
        <div className="admin-section-list">
          {ADMIN_SECTIONS.map((section) => (
            <button
              key={section.id}
              type="button"
              className="admin-section-row"
              onClick={() => window.location.assign("/admin/" + section.id)}
            >
              <span className="admin-section-number">{section.number}</span>
              <div className="admin-section-copy">
                <strong>{section.title}</strong>
                <p>{section.description}</p>
              </div>
              <span className="admin-section-status ready">Editor live</span>
              <span className="admin-section-arrow" aria-hidden="true">→</span>
            </button>
          ))}
        </div>
      </section>
    </AdminShell>
  );
}

function AdminNotFound() {
  return (
    <AdminShell activeSection="">
      <section className="admin-not-found">
        <span className="admin-eyebrow">ADMIN / 404</span>
        <h1>Section not found.</h1>
        <p>This route is not part of the portfolio CMS.</p>
        <button type="button" className="admin-primary-button" onClick={() => window.location.assign("/admin")}>
          Return to dashboard
        </button>
      </section>
    </AdminShell>
  );
}

export default function Admin() {
  const sectionId = window.location.pathname.split("/")[2]?.trim().toLowerCase() || "";
  if (!sectionId) return <AdminDashboard />;
  const Editor = EDITORS[sectionId];
  return Editor ? <Editor /> : <AdminNotFound />;
}
