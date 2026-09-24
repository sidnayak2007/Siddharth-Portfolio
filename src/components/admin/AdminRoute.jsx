import { lazy, Suspense, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { adminAuth, isAuthorizedAdmin } from "../../firebase/firebase";

const Admin = lazy(() => import("./Admin"));
const AdminLogin = lazy(() => import("./AdminLogin"));

function AdminLoading({ label }) {
  return <main role="status" style={{ minHeight: "100dvh", display: "grid", placeItems: "center", padding: 24, background: "#f4f6f8", color: "#7d858d", fontSize: 12 }}> {label} </main>;
}

export default function AdminRoute() {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => onAuthStateChanged(adminAuth,
    (account) => {
      setUser(isAuthorizedAdmin(account) ? account : null);
      setChecking(false);
    },
    (error) => {
      console.error("Admin authentication check failed:", error);
      setUser(null);
      setChecking(false);
    },
  ), []);

  if (checking) return <AdminLoading label="Checking access…" />;
  return <Suspense fallback={<AdminLoading label="Opening Admin…" />}>
    {user ? <Admin /> : <AdminLogin onLogin={(account) => setUser(isAuthorizedAdmin(account) ? account : null)} />}
  </Suspense>;
}
