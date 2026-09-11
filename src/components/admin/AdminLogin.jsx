import { useState } from "react";

import {
  signInWithEmailAndPassword,
} from "firebase/auth";

import {
  adminAuth,
} from "../../firebase/firebase";

import "../../css/admin-login.css";

function getLoginErrorMessage(error) {
  switch (error?.code) {
    case "auth/too-many-requests":
      return "Too many login attempts. Please try again later.";

    case "auth/network-request-failed":
      return "Network error. Check your connection and try again.";

    case "auth/user-disabled":
      return "This admin account is currently disabled.";

    default:
      /*
      Keep credential errors intentionally generic.

      We do not want the login screen revealing whether
      a particular email address exists.
      */
      return "Incorrect email or password.";
  }
}

function AdminLogin({
  onLogin,
}) {
  const [
    email,
    setEmail,
  ] = useState("");

  const [
    password,
    setPassword,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  /*
  ========================================================
  ADMIN LOGIN
  ========================================================

  The public game will use Firebase Anonymous Auth.

  An anonymous Firebase user must NEVER be accepted
  as an administrator.

  Email/password authentication runs on the isolated
  Admin Firebase app, so it never replaces the game's
  anonymous player session.
  ========================================================
  */

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    if (loading) {
      return;
    }

    const cleanEmail =
      email.trim().toLowerCase();

    if (
      !cleanEmail ||
      !password
    ) {
      setError(
        "Enter your email and password."
      );

      return;
    }

    setLoading(true);
    setError("");

    try {
      const result =
        await signInWithEmailAndPassword(
          adminAuth,
          cleanEmail,
          password
        );

      /*
      Extra protection.

      Email/password accounts should never be
      anonymous, but we verify it anyway because
      the game also uses Firebase Authentication.
      */
      if (
        !result.user ||
        result.user.isAnonymous
      ) {
        throw new Error(
          "Anonymous users cannot access the admin area."
        );
      }

      if (
        typeof onLogin ===
        "function"
      ) {
        onLogin(result.user);
      }
    } catch (loginError) {
      console.error(
        "Admin login failed:",
        loginError
      );

      setError(
        getLoginErrorMessage(
          loginError
        )
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="admin-login-page">
      <div
        className="admin-login-background"
        aria-hidden="true"
      >
        <div className="admin-login-grid" />

        <div className="admin-login-glow admin-login-glow-one" />

        <div className="admin-login-glow admin-login-glow-two" />
      </div>

      <button
        type="button"
        className="admin-login-back"
        onClick={() => {
          window.location.href =
            "/";
        }}
        aria-label="Return to portfolio"
      >
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d="M19 12H5" />

          <path d="m11 18-6-6 6-6" />
        </svg>

        <span>
          Portfolio
        </span>
      </button>

      <section
        className="admin-login-card"
        aria-labelledby="admin-login-title"
      >
        <div
          className="admin-login-mark"
          aria-hidden="true"
        >
          SN
        </div>

        <span className="admin-login-eyebrow">
          PRIVATE ACCESS
        </span>

        <h1 id="admin-login-title">
          Admin
        </h1>

        <p>
          Sign in to manage portfolio content.
        </p>

        <form
          className="admin-login-form"
          onSubmit={handleSubmit}
        >
          <label>
            <span>
              Email
            </span>

            <input
              type="email"
              value={email}
              onChange={(event) => {
                setEmail(
                  event.target.value
                );

                if (error) {
                  setError("");
                }
              }}
              placeholder="Admin email"
              autoComplete="email"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck="false"
              inputMode="email"
              disabled={loading}
              required
            />
          </label>

          <label>
            <span>
              Password
            </span>

            <input
              type="password"
              value={password}
              onChange={(event) => {
                setPassword(
                  event.target.value
                );

                if (error) {
                  setError("");
                }
              }}
              placeholder="Password"
              autoComplete="current-password"
              disabled={loading}
              required
            />
          </label>

          {error && (
            <div
              className="admin-login-error"
              role="alert"
              aria-live="polite"
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            className="admin-login-submit"
            disabled={loading}
            aria-busy={loading}
          >
            <span>
              {loading
                ? "Signing in..."
                : "Sign in"}
            </span>

            {!loading && (
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M5 12h14" />

                <path d="m14 7 5 5-5 5" />
              </svg>
            )}
          </button>
        </form>

        <div className="admin-login-footer">
          <span>
            Portfolio Management
          </span>

          <span>
            Secure access
          </span>
        </div>
      </section>
    </main>
  );
}

export default AdminLogin;
