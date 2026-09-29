import { doc, getDocFromServer, serverTimestamp, setDoc, writeBatch } from "firebase/firestore";
import { adminAuth, adminDb, isAuthorizedAdmin } from "./firebase";

const ALLOWED_SECTIONS = new Set([
  "about", "experience", "projects", "skills", "education", "certifications", "resume", "contact",
]);

function assertSection(sectionId) {
  if (!ALLOWED_SECTIONS.has(sectionId)) throw new Error("Invalid portfolio section.");
}

function assertAdminSession() {
  if (!isAuthorizedAdmin(adminAuth.currentUser)) {
    throw new Error("This account is not authorised to edit the portfolio.");
  }
}

function cloneValue(value) {
  if (value === undefined || value === null) return value;
  if (Array.isArray(value)) return value.map(cloneValue);
  if (typeof value !== "object") return value;

  return Object.fromEntries(
    Object.entries(value)
      .map(([key, item]) => [key, cloneValue(item)])
      .filter(([, item]) => item !== undefined)
  );
}

export async function getPortfolioDocument(sectionId, fallback = {}) {
  assertSection(sectionId);
  assertAdminSession();

  const snapshot = await getDocFromServer(doc(adminDb, "portfolio", sectionId));
  const content = snapshot.exists() ? { ...snapshot.data() } : {};
  delete content.updatedAt;

  if (sectionId === "contact") {
    const privateSnapshot = await getDocFromServer(doc(adminDb, "portfolioPrivate", "contact"));
    const publicLinks = Array.isArray(content.links) ? content.links : [];
    const privateLinks = privateSnapshot.exists() && Array.isArray(privateSnapshot.data().links)
      ? privateSnapshot.data().links : [];

    content.links = [...publicLinks, ...privateLinks].sort((a, b) =>
      (Number.isInteger(a?.order) ? a.order : Number.MAX_SAFE_INTEGER)
      - (Number.isInteger(b?.order) ? b.order : Number.MAX_SAFE_INTEGER)
    );
  }

  if (sectionId === "certifications") {
    const privateSnapshot = await getDocFromServer(doc(adminDb, "portfolioPrivate", "certifications"));
    const publicItems = Array.isArray(content.items) ? content.items : [];
    const privateItems = privateSnapshot.exists() && Array.isArray(privateSnapshot.data().items)
      ? privateSnapshot.data().items : [];
    content.items = [...publicItems, ...privateItems].sort((a, b) =>
      (Number.isInteger(a?.order) ? a.order : Number.MAX_SAFE_INTEGER)
      - (Number.isInteger(b?.order) ? b.order : Number.MAX_SAFE_INTEGER)
    );
  }

  return { ...cloneValue(fallback), ...cloneValue(content) };
}

export async function savePortfolioDocument(sectionId, value) {
  assertSection(sectionId);
  assertAdminSession();
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("Portfolio content must be an object.");
  }

  const cleanValue = cloneValue(value);
  const documentRef = doc(adminDb, "portfolio", sectionId);

  if (sectionId === "contact") {
    const links = Array.isArray(cleanValue.links) ? cleanValue.links : [];
    const batch = writeBatch(adminDb);
    batch.set(documentRef, {
      ...cleanValue,
      links: links.filter((item) => item.visible !== false),
      updatedAt: serverTimestamp(),
    }, { merge: true });
    batch.set(doc(adminDb, "portfolioPrivate", "contact"), {
      links: links.filter((item) => item.visible === false),
      updatedAt: serverTimestamp(),
    }, { merge: true });
    await batch.commit();
    return cleanValue;
  }

  if (sectionId === "certifications") {
    const items = Array.isArray(cleanValue.items) ? cleanValue.items : [];
    const orderedItems = items.map((item, order) => ({ ...item, order }));
    const batch = writeBatch(adminDb);
    batch.set(documentRef, {
      ...cleanValue,
      items: orderedItems.filter((item) => item.visible !== false),
      updatedAt: serverTimestamp(),
    }, { merge: true });
    batch.set(doc(adminDb, "portfolioPrivate", "certifications"), {
      items: orderedItems.filter((item) => item.visible === false),
      updatedAt: serverTimestamp(),
    }, { merge: true });
    await batch.commit();
    return { ...cleanValue, items: orderedItems };
  }

  // Merge keeps unedited fields from older portfolio documents intact.
  await setDoc(documentRef, { ...cleanValue, updatedAt: serverTimestamp() }, { merge: true });
  return cleanValue;
}
