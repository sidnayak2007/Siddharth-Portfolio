import {
  useEffect,
  useState,
} from "react";

import {
  onAuthStateChanged,
} from "firebase/auth";

import {
  adminAuth,
} from "./firebase/firebase";

import Welcome from "./components/home/Welcome";
import Home from "./components/home/Home";

import About from "./components/sections/About";
import Experience from "./components/sections/experience";
import Projects from "./components/sections/Projects";
import Skills from "./components/sections/Skills";
import Education from "./components/sections/Education";
import Resume from "./components/sections/Resume";
import Contact from "./components/sections/Contact";
import Game from "./components/sections/Game";

import Admin from "./components/admin/Admin";
import AdminLogin from "./components/admin/AdminLogin";

function App() {
  const path =
    window.location.pathname;

  const isAdminPage =
    path === "/admin" ||
    path === "/admin/" ||
    path.startsWith("/admin/");

  const [
    started,
    setStarted,
  ] = useState(false);

  const [
    activeSection,
    setActiveSection,
  ] = useState(null);

  const [
    adminUser,
    setAdminUser,
  ] = useState(null);

  const [
    checkingAuth,
    setCheckingAuth,
  ] = useState(
    isAdminPage
  );

  /*
  ========================================================
  ADMIN AUTHENTICATION
  ========================================================

  The game uses Firebase Anonymous Authentication.

  Anonymous players must never be treated as portfolio
  administrators.

  Only a non-anonymous Firebase account is allowed through
  the admin UI check.
  ========================================================
  */

  useEffect(() => {
    /*
    The normal portfolio does not need an admin
    authentication listener.

    Game authentication is handled separately by the
    player system.
    */

    if (!isAdminPage) {
      return undefined;
    }

    const unsubscribe =
  onAuthStateChanged(
    adminAuth,
        (user) => {
          /*
          Anonymous Firebase users belong to the game.

          They are not admin users.
          */

          if (
            user &&
            !user.isAnonymous
          ) {
            setAdminUser(
              user
            );
          } else {
            setAdminUser(
              null
            );
          }

          setCheckingAuth(
            false
          );
        },
        (error) => {
          console.error(
            "Admin authentication check failed:",
            error
          );

          setAdminUser(
            null
          );

          setCheckingAuth(
            false
          );
        }
      );

    return unsubscribe;
  }, [isAdminPage]);

  /*
  ========================================================
  PORTFOLIO NAVIGATION
  ========================================================
  */

  const handleOpenSection =
    (section) => {
      setActiveSection(
        section
      );
    };

  const handleBackHome =
    () => {
      setActiveSection(
        null
      );
    };

  /*
  ========================================================
  ADMIN AREA
  ========================================================
  */

  if (isAdminPage) {
    if (checkingAuth) {
      return (
        <main
          style={{
            minHeight:
              "100vh",

            display:
              "grid",

            placeItems:
              "center",

            padding:
              "24px",

            background:
              "#f4f6f8",

            color:
              "#7d858d",

            fontSize:
              "12px",

            textAlign:
              "center",
          }}
        >
          Checking access...
        </main>
      );
    }

    if (!adminUser) {
      return (
        <AdminLogin
          onLogin={(
            user
          ) => {
            /*
            Extra protection in case AdminLogin is ever
            changed later.

            Never accept an anonymous Firebase account
            as an admin.
            */

            if (
              user &&
              !user.isAnonymous
            ) {
              setAdminUser(
                user
              );
            } else {
              setAdminUser(
                null
              );
            }
          }}
        />
      );
    }

    return (
      <Admin />
    );
  }

  /*
  ========================================================
  WELCOME SCREEN
  ========================================================
  */

  if (!started) {
    return (
      <Welcome
        onEnter={() =>
          setStarted(
            true
          )
        }
      />
    );
  }

  /*
  ========================================================
  PORTFOLIO SECTIONS
  ========================================================
  */

  if (activeSection) {
   const pages = {
  about:
    About,

  experience:
    Experience,

  projects:
    Projects,

  skills:
    Skills,

  education:
    Education,

  resume:
    Resume,

  contact:
    Contact,

  game:
    Game,
};
    const Page =
      pages[
        activeSection.id
      ];

    if (Page) {
      return (
        <Page
          onBack={
            handleBackHome
          }
        />
      );
    }
  }

  /*
  ========================================================
  HOME
  ========================================================
  */

  return (
    <Home
      onOpenSection={
        handleOpenSection
      }
    />
  );
}

export default App;