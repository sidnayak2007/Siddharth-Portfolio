import { useEffect, useState } from "react";
import { doc, getDocFromServer } from "firebase/firestore";
import { adminAuth, adminDb, isAuthorizedAdmin } from "../../firebase/firebase";
import AdminAbout from "./AdminAbout";
import AdminContact from "./AdminContact";
import AdminCertifications from "./AdminCertifications";
import AdminEducation from "./AdminEducation";
import AdminExperience from "./AdminExperience";
import AdminProjects from "./AdminProjects";
import AdminResume from "./AdminResume";
import AdminShell from "./AdminShell";
import AdminSkills from "./AdminSkills";
import { ADMIN_SECTIONS } from "./adminConfig";
import { adminPath, getAdminSection } from "../../utils/adminPath";

import "../../css/admin.css";

const EDITORS = {
  about: AdminAbout,
  experience: AdminExperience,
  projects: AdminProjects,
  skills: AdminSkills,
  education: AdminEducation,
  certifications: AdminCertifications,
  resume: AdminResume,
  contact: AdminContact,
};

function AdminDashboard() {
  const [connection, setConnection] = useState("checking");

  useEffect(() => {
    let active = true;
    getDocFromServer(doc(adminDb, "portfolio", "about"))
      .then(() => { if (active) setConnection("connected"); })
      .catch(() => { if (active) setConnection("unavailable"); });
    return () => { active = false; };
  }, []);

  return (
    <AdminShell activeSection="dashboard">
      <div className="admin-page-heading">
        <div>
          <span className="admin-eyebrow">OVERVIEW</span>
          <h1>Welcome back</h1>
          <p>Manage your portfolio sections, preview changes, then publish when ready.</p>
        </div>
        <div className={`admin-online ${connection}`}>
          <span aria-hidden="true" />
          <div><small>FIRESTORE</small><strong>{connection === "checking" ? "Checking…" : connection === "connected" ? "Connected" : "Unavailable"}</strong></div>
        </div>
      </div>

      <div className="admin-summary-grid">
        <article><span>CONTENT SECTIONS</span><strong>{ADMIN_SECTIONS.length}</strong><p>Editors available in this CMS.</p></article>
        <article><span>ADMIN SESSION</span><strong>{isAuthorizedAdmin(adminAuth.currentUser) ? "Verified" : "Checking"}</strong><p>Access is checked against the Admin UID.</p></article>
        <article><span>FIRESTORE READ</span><strong>{connection === "checking" ? "Checking" : connection === "connected" ? "Online" : "Failed"}</strong><p>{connection === "unavailable" ? "Open an editor to see the connection error and retry." : "A server read checks whether content is reachable."}</p></article>
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
              onClick={() => window.location.assign(adminPath(section.id))}
            >
              <span className="admin-section-number">{section.number}</span>
              <div className="admin-section-copy">
                <strong>{section.title}</strong>
                <p>{section.description}</p>
              </div>
              <span className="admin-section-status ready">Open editor</span>
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
        <button type="button" className="admin-primary-button" onClick={() => window.location.assign(adminPath())}>
          Return to dashboard
        </button>
      </section>
    </AdminShell>
  );
}

export default function Admin() {
  const sectionId = getAdminSection() || "";
  if (!sectionId) return <AdminDashboard />;
  const Editor = EDITORS[sectionId];
  return Editor ? <Editor /> : <AdminNotFound />;
}
