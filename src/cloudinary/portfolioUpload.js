import { adminAuth, isAuthorizedAdmin } from "../firebase/firebase";

export const CLOUDINARY_CLOUD_NAME = "zsvjuaee";
export const CLOUDINARY_UPLOAD_PRESET = "siddharth_portfolio";

const FILE_RULES = {
  image: {
    types: new Set(["image/jpeg", "image/png", "image/webp"]),
    maxBytes: 8 * 1024 * 1024,
    description: "a JPG, PNG, or WebP image under 8 MB",
  },
};

export function validatePortfolioFile(file, kind = "image") {
  const rule = FILE_RULES[kind];
  if (!rule) throw new Error("Unsupported portfolio file type.");
  if (!file || !rule.types.has(file.type) || file.size <= 0 || file.size > rule.maxBytes) {
    throw new Error(`Choose ${rule.description}.`);
  }
}

export async function uploadPortfolioFile({ file, kind = "image", onProgress }) {
  if (!isAuthorizedAdmin(adminAuth.currentUser)) {
    throw new Error("Sign in to Admin before uploading a file.");
  }
  validatePortfolioFile(file, kind);

  const body = new FormData();
  body.append("file", file);
  body.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

  const { status, result } = await new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open("POST", `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`);
    request.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable) onProgress?.(Math.round((event.loaded / event.total) * 100));
    });
    request.addEventListener("load", () => {
      let payload = {};
      try { payload = JSON.parse(request.responseText); } catch { /* Invalid response is handled below. */ }
      resolve({ status: request.status, result: payload });
    });
    request.addEventListener("error", () => reject(new Error("Could not reach Cloudinary. Check your connection and try again.")));
    request.send(body);
  });
  if (status < 200 || status >= 300 || typeof result.secure_url !== "string") {
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
