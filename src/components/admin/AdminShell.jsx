import { useState } from "react";
import { signOut } from "firebase/auth";

import { adminAuth } from "../../firebase/firebase";
import { ADMIN_SECTIONS } from "./adminConfig";
import { adminPath, portfolioPath } from "../../utils/adminPath";

function DashboardIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
    </svg>
  );
}

export default function AdminShell({ activeSection = "dashboard", dirty = false, children }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const go = (path) => {
    if (dirty && !window.confirm("You have unsaved changes. Leave this editor?")) return;
    window.__portfolioAdminNavigationConfirmed = true;
    window.location.assign(path);
  };

  const handleLogout = async () => {
    if (dirty && !window.confirm("You have unsaved changes. Leave this editor and log out?")) return;
    window.__portfolioAdminNavigationConfirmed = true;
    try {
      await signOut(adminAuth);
      window.location.assign(portfolioPath());
    } catch (error) {
      window.__portfolioAdminNavigationConfirmed = false;
      console.error("Admin logout failed:", error);
    }
  };

  return (
    <main className="admin-page">
      <div className="admin-background" aria-hidden="true">
        <div className="admin-background-grid" />
        <div className="admin-background-glow admin-background-glow-one" />
        <div className="admin-background-glow admin-background-glow-two" />
      </div>

      <header className="admin-header">
        <button type="button" className="admin-brand" onClick={() => go(adminPath())}>
          <div className="admin-brand-mark">SN</div>
          <div className="admin-brand-copy">
            <strong>Portfolio Admin</strong>
            <span>Content Management</span>
          </div>
        </button>

        <div className="admin-header-actions">
          <button type="button" className="admin-header-button admin-menu-button" aria-expanded={menuOpen} aria-controls="admin-sidebar" onClick={() => setMenuOpen((open) => !open)}>
            {menuOpen ? "Close menu" : "Menu"}
          </button>
          <button type="button" className="admin-header-button" onClick={() => go(portfolioPath())}>
            Preview Portfolio
          </button>
          <button type="button" className="admin-header-button admin-logout-button" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      <div className="admin-shell">
        {menuOpen && <button type="button" className="admin-sidebar-backdrop" aria-label="Close navigation" onClick={() => setMenuOpen(false)} />}
        <aside id="admin-sidebar" className={`admin-sidebar ${menuOpen ? "admin-sidebar-open" : ""}`}>
          <div className="admin-sidebar-heading"><span>NAVIGATION</span></div>
          <nav className="admin-sidebar-nav" aria-label="Admin navigation">
            <button
              type="button"
              className={"admin-sidebar-item " + (activeSection === "dashboard" ? "active" : "")}
              onClick={() => go(adminPath())}
            >
              <DashboardIcon />
              <span>Dashboard</span>
            </button>

            <div className="admin-sidebar-divider" />

            {ADMIN_SECTIONS.map((section) => (
              <button
                key={section.id}
                type="button"
                className={"admin-sidebar-item " + (activeSection === section.id ? "active" : "")}
                onClick={() => go(adminPath(section.id))}
                aria-current={activeSection === section.id ? "page" : undefined}
              >
                <span className="admin-sidebar-number">{section.number}</span>
                <span>{section.title}</span>
              </button>
            ))}
          </nav>

          <div className="admin-sidebar-footer">
            <span>FIREBASE CMS</span>
            <strong>7 EDITORS</strong>
          </div>
        </aside>

        <section className="admin-main">{children}</section>
      </div>
    </main>
  );
}
