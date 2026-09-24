const basePath = import.meta.env.BASE_URL.replace(/\/?$/, "/");

export function portfolioPath() {
  return basePath;
}

export function adminPath(sectionId = "") {
  return `${basePath}admin${sectionId ? `/${sectionId}` : ""}`;
}

export function getAdminSection(pathname = window.location.pathname) {
  const prefix = `${basePath}admin`;
  if (pathname !== prefix && pathname !== `${prefix}/` && !pathname.startsWith(`${prefix}/`)) {
    return null;
  }
  const remainder = pathname.slice(prefix.length).replace(/^\/+|\/+$/g, "");
  return remainder.toLowerCase();
}
