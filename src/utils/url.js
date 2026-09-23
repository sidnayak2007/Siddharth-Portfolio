export function safeHref(value) {
  if (typeof value !== "string") return "";

  const url = value.trim();
  return /^(https?:\/\/|mailto:|tel:)/i.test(url) ? url : "";
}
