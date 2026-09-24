import {
  getApp,
  getApps,
  initializeApp,
} from "firebase/app";

import {
  getFirestore,
} from "firebase/firestore";

import {
  browserLocalPersistence,
  getAuth,
  setPersistence,
  signInAnonymously,
} from "firebase/auth";

/* =========================================================
   FIREBASE CONFIG
========================================================= */

const firebaseConfig = {
  apiKey:
    "AIzaSyBHTiv6kH3u4FXiPiFOMCB3NOhBkp5nhs4",

  authDomain:
    "siddharthnayak-portfolio.firebaseapp.com",

  projectId:
    "siddharthnayak-portfolio",

  messagingSenderId:
    "836526942462",

  appId:
    "1:836526942462:web:2a3d18951a730ab2395daf",

  measurementId:
    "G-CT75T9BZZW",
};

/* =========================================================
   PRIMARY FIREBASE APP
   GAME + PUBLIC PORTFOLIO
========================================================= */

const app =
  getApps().some(
    (firebaseApp) =>
      firebaseApp.name ===
      "[DEFAULT]"
  )
    ? getApp()
    : initializeApp(
        firebaseConfig
      );

export const auth =
  getAuth(app);

export const db =
  getFirestore(app);

/* =========================================================
   SECONDARY FIREBASE APP
   ADMIN ONLY
=========================================================

The Admin gets its own Firebase application instance.

This is important because Firebase Authentication stores
one active user per Auth instance.

Primary Auth:
Anonymous Keep It Together player

Admin Auth:
Email/password portfolio administrator

Logging into Admin will therefore NOT replace the game's
anonymous player anymore.
========================================================= */

const ADMIN_APP_NAME =
  "portfolio-admin";

const existingAdminApp =
  getApps().find(
    (firebaseApp) =>
      firebaseApp.name ===
      ADMIN_APP_NAME
  );

export const adminApp =
  existingAdminApp ||
  initializeApp(
    firebaseConfig,
    ADMIN_APP_NAME
  );

export const adminAuth =
  getAuth(adminApp);

export const adminDb =
  getFirestore(adminApp);

/* =========================================================
   ANONYMOUS GAME PLAYER
========================================================= */

export async function signInPlayer() {
  /*
  The primary Auth instance belongs only to the game.
  */

  if (
    auth.currentUser &&
    auth.currentUser.isAnonymous
  ) {
    return auth.currentUser;
  }

  /*
  The primary instance should normally never contain
  the Admin anymore, but if it somehow contains another
  non-anonymous account, do not reuse that account as a
  game player.
  */

  if (
    auth.currentUser &&
    !auth.currentUser.isAnonymous
  ) {
    throw new Error(
      "The game Firebase session is not anonymous."
    );
  }

  try {
    await setPersistence(
      auth,
      browserLocalPersistence
    );
  } catch (error) {
    console.warn(
      "Firebase player persistence could not be enabled:",
      error
    );
  }

  const result =
    await signInAnonymously(
      auth
    );

  return result.user;
}

/* =========================================================
   EXPORT PRIMARY APP
========================================================= */

export {
  app,
};

export const ADMIN_UID = "2GsnovCgxlYVz46LYSM2iRicMQk1";

export function isAuthorizedAdmin(user) {
  return Boolean(user && !user.isAnonymous && user.uid === ADMIN_UID);
}
