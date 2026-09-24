import { adminAuth, isAuthorizedAdmin } from "../firebase/firebase";

export const CLOUDINARY_CLOUD_NAME = "zsvjuaee";
export const CLOUDINARY_UPLOAD_PRESET = "siddharth_portfolio";

const FILE_RULES = {
  image: {
    types: new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]),
    maxBytes: 8 * 1024 * 1024,
    description: "a JPG, PNG, WebP, or GIF under 8 MB",
  },
  pdf: {
    types: new Set(["application/pdf"]),
    maxBytes: 15 * 1024 * 1024,
    description: "a PDF under 15 MB",
  },
};

export function validatePortfolioFile(file, kind = "image") {
  const rule = FILE_RULES[kind];
  if (!rule) throw new Error("Unsupported portfolio file type.");
  if (!file || !rule.types.has(file.type) || file.size <= 0 || file.size > rule.maxBytes) {
    throw new Error(`Choose ${rule.description}.`);
  }
}

export async function uploadPortfolioFile({ file, kind = "image" }) {
  if (!isAuthorizedAdmin(adminAuth.currentUser)) {
    throw new Error("Sign in to Admin before uploading a file.");
  }
  validatePortfolioFile(file, kind);

  // Cloudinary treats PDFs as image assets. The preset must permit PDF uploads.
  const body = new FormData();
  body.append("file", file);
  body.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

  let response;
  try {
    response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      { method: "POST", body },
    );
  } catch {
    throw new Error("Could not reach Cloudinary. Check your connection and try again.");
  }

  const result = await response.json().catch(() => ({}));
  if (!response.ok || typeof result.secure_url !== "string") {
    throw new Error(result.error?.message || "Cloudinary upload failed. Please try again.");
  }

  const url = new URL(result.secure_url);
  if (url.protocol !== "https:" || url.hostname !== "res.cloudinary.com" ||
      !url.pathname.startsWith(`/${CLOUDINARY_CLOUD_NAME}/image/upload/`)) {
    throw new Error("Cloudinary returned an unexpected media URL.");
  }

  return {
    url: result.secure_url,
    name: file.name,
    kind,
    path: "",
  };
}
