import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";

import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytes,
} from "firebase/storage";

import {
  adminAuth,
  adminDb,
  adminStorage,
} from "./firebase";

/* =========================================================
   CONFIG
========================================================= */

const ALLOWED_SECTIONS =
  new Set([
    "about",
    "experience",
    "projects",
    "skills",
    "education",
    "resume",
    "contact",
  ]);

const IMAGE_TYPES =
  new Set([
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
  ]);

const MAX_IMAGE_SIZE =
  8 * 1024 * 1024;

const MAX_PDF_SIZE =
  15 * 1024 * 1024;

/* =========================================================
   HELPERS
========================================================= */

function assertSection(
  sectionId
) {
  if (
    !ALLOWED_SECTIONS.has(
      sectionId
    )
  ) {
    throw new Error(
      "Invalid portfolio section."
    );
  }
}

function assertAdminSession() {
  const user =
    adminAuth.currentUser;

  if (!user) {
    throw new Error(
      "Admin authentication is required."
    );
  }

  if (user.isAnonymous) {
    throw new Error(
      "Anonymous game players cannot edit the portfolio."
    );
  }

  return user;
}

function cloneValue(value) {
  if (
    value === undefined
  ) {
    return undefined;
  }

  if (
    value === null
  ) {
    return null;
  }

  if (
    Array.isArray(value)
  ) {
    return value.map(
      cloneValue
    );
  }

  if (
    typeof value ===
    "object"
  ) {
    const next = {};

    Object.entries(
      value
    ).forEach(
      ([
        key,
        item,
      ]) => {
        const cloned =
          cloneValue(
            item
          );

        if (
          cloned !==
          undefined
        ) {
          next[key] =
            cloned;
        }
      }
    );

    return next;
  }

  return value;
}

function mergeFallback(
  fallback,
  remote
) {
  const base =
    cloneValue(
      fallback
    ) || {};

  const data =
    cloneValue(
      remote
    ) || {};

  /*
  Keep the editor schema stable if an older
  Firestore document is missing a newer field.
  */

  return {
    ...base,
    ...data,
  };
}

function sanitizePathPart(
  value,
  fallback =
    "item"
) {
  const cleaned =
    String(
      value || fallback
    )
      .trim()
      .toLowerCase()
      .replace(
        /[^a-z0-9-_]+/g,
        "-"
      )
      .replace(
        /^-+|-+$/g,
        ""
      );

  return (
    cleaned ||
    fallback
  );
}

function sanitizeFileName(
  fileName
) {
  const source =
    String(
      fileName ||
        "file"
    );

  const extensionIndex =
    source.lastIndexOf(
      "."
    );

  const extension =
    extensionIndex >= 0
      ? source
          .slice(
            extensionIndex +
              1
          )
          .toLowerCase()
          .replace(
            /[^a-z0-9]/g,
            ""
          )
      : "";

  const base =
    (
      extensionIndex >= 0
        ? source.slice(
            0,
            extensionIndex
          )
        : source
    )
      .toLowerCase()
      .replace(
        /[^a-z0-9-_]+/g,
        "-"
      )
      .replace(
        /^-+|-+$/g,
        ""
      )
      .slice(
        0,
        80
      ) || "file";

  return extension
    ? `${base}.${extension}`
    : base;
}

function randomId() {
  if (
    typeof crypto !==
      "undefined" &&
    typeof crypto.randomUUID ===
      "function"
  ) {
    return crypto
      .randomUUID()
      .slice(
        0,
        12
      );
  }

  return Math.random()
    .toString(36)
    .slice(
      2,
      14
    );
}

/* =========================================================
   READ PORTFOLIO DOCUMENT
========================================================= */

export async function getPortfolioDocument(
  sectionId,
  fallback = {}
) {
  assertSection(
    sectionId
  );

  assertAdminSession();

  const documentRef =
    doc(
      adminDb,
      "portfolio",
      sectionId
    );

  const snapshot =
    await getDoc(
      documentRef
    );

  if (
    !snapshot.exists()
  ) {
    return cloneValue(
      fallback
    );
  }

  const remote =
    snapshot.data();

  /*
  updatedAt is Firestore metadata rather than
  editable portfolio content.
  */

  const content = {
    ...remote,
  };

  delete content.updatedAt;

  return mergeFallback(
    fallback,
    content
  );
}

/* =========================================================
   SAVE PORTFOLIO DOCUMENT
========================================================= */

export async function savePortfolioDocument(
  sectionId,
  value
) {
  assertSection(
    sectionId
  );

  assertAdminSession();

  if (
    !value ||
    typeof value !==
      "object" ||
    Array.isArray(value)
  ) {
    throw new Error(
      "Portfolio content must be an object."
    );
  }

  const cleanValue =
    cloneValue(
      value
    );

  const documentRef =
    doc(
      adminDb,
      "portfolio",
      sectionId
    );

  /*
  setDoc without merge keeps Firestore aligned
  with the current editor schema rather than
  leaving deleted legacy fields behind.
  */

  await setDoc(
    documentRef,
    {
      ...cleanValue,

      updatedAt:
        serverTimestamp(),
    }
  );

  /*
  Return the editable content only.

  We intentionally do not return updatedAt,
  otherwise Firestore metadata would become
  part of the Admin dirty-state comparison.
  */

  return cleanValue;
}

/* =========================================================
   VALIDATE UPLOAD
========================================================= */

function validateUpload(
  file,
  kind
) {
  if (
    !file ||
    typeof file !==
      "object"
  ) {
    throw new Error(
      "Choose a file to upload."
    );
  }

  if (
    kind === "pdf"
  ) {
    if (
      file.type !==
      "application/pdf"
    ) {
      throw new Error(
        "Only PDF files are allowed."
      );
    }

    if (
      file.size >
      MAX_PDF_SIZE
    ) {
      throw new Error(
        "The PDF must be 15 MB or smaller."
      );
    }

    return;
  }

  if (
    kind !== "image"
  ) {
    throw new Error(
      "Unsupported upload type."
    );
  }

  if (
    !IMAGE_TYPES.has(
      file.type
    )
  ) {
    throw new Error(
      "Use a JPG, PNG, WebP or GIF image."
    );
  }

  if (
    file.size >
    MAX_IMAGE_SIZE
  ) {
    throw new Error(
      "The image must be 8 MB or smaller."
    );
  }
}

/* =========================================================
   UPLOAD PORTFOLIO FILE
========================================================= */

export async function uploadPortfolioFile({
  sectionId,
  itemId,
  file,
  kind = "image",
}) {
  assertSection(
    sectionId
  );

  assertAdminSession();

  validateUpload(
    file,
    kind
  );

  const safeSection =
    sanitizePathPart(
      sectionId,
      "portfolio"
    );

  const safeItem =
    sanitizePathPart(
      itemId,
      "item"
    );

  const safeName =
    sanitizeFileName(
      file.name
    );

  const folder =
    kind === "pdf"
      ? "documents"
      : "images";

  const storagePath =
    [
      "portfolio",
      safeSection,
      folder,
      safeItem,
      `${Date.now()}-${randomId()}-${safeName}`,
    ].join("/");

  const storageRef =
    ref(
      adminStorage,
      storagePath
    );

  const snapshot =
    await uploadBytes(
      storageRef,
      file,
      {
        contentType:
          file.type,

        customMetadata: {
          section:
            safeSection,

          item:
            safeItem,

          uploadedBy:
            adminAuth
              .currentUser
              ?.uid ||
            "",
        },
      }
    );

  const url =
    await getDownloadURL(
      snapshot.ref
    );

  /*
  AdminEditorUI expects this exact shape.
  */

  return {
    url,

    path:
      storagePath,

    name:
      file.name ||
      safeName,
  };
}

/* =========================================================
   DELETE PORTFOLIO FILE
========================================================= */

export async function deletePortfolioFile(
  storagePath
) {
  assertAdminSession();

  if (
    typeof storagePath !==
      "string" ||
    !storagePath.trim()
  ) {
    return;
  }

  const cleanPath =
    storagePath.trim();

  /*
  Never let this helper delete anything outside
  the portfolio upload directory.
  */

  if (
    !cleanPath.startsWith(
      "portfolio/"
    )
  ) {
    throw new Error(
      "Refusing to delete a file outside the portfolio folder."
    );
  }

  const storageRef =
    ref(
      adminStorage,
      cleanPath
    );

  try {
    await deleteObject(
      storageRef
    );
  } catch (error) {
    /*
    If the file has already been deleted there is
    nothing left to clean up.
    */

    if (
      error?.code ===
      "storage/object-not-found"
    ) {
      return;
    }

    throw error;
  }
}