/**
 * Applies browser favicon and page title dynamically:
 * - Landlord ERP (isomaug.com / :5176): uses Isoma's Royal Blue hexagon favicon (/favicon.svg).
 * - Tenant School (*.isomaug.com / :5177): uses the school's uploaded favicon/logo OR an
 *   auto-generated SVG data-URI favicon from the school's initials - NEVER Isoma's favicon.
 */
function buildInitialsFaviconDataUri(initials = "SC", bgColor = "#004880") {
  const clean = String(initials || "SC")
    .replace(/[^a-zA-Z0-9]/g, "")
    .slice(0, 2)
    .toUpperCase() || "SC";
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64"><rect width="64" height="64" rx="14" fill="${bgColor}"/><text x="32" y="42" text-anchor="middle" font-family="Montserrat, Arial, sans-serif" font-size="26" font-weight="700" fill="#ffffff">${clean}</text></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function setFaviconHref(href, type = "image/svg+xml") {
  if (typeof document === "undefined") return;
  const links = document.querySelectorAll(
    'link[rel="icon"], link[rel="shortcut icon"], link[rel="apple-touch-icon"]'
  );
  if (links.length === 0) {
    const link = document.createElement("link");
    link.rel = "icon";
    link.type = type;
    link.href = href;
    document.head.appendChild(link);
    return;
  }
  links.forEach((link) => {
    link.setAttribute("href", href);
    if (link.rel === "icon") {
      link.setAttribute("type", type);
    }
  });
}

export function applyTenantBranding(appMode, tenant) {
  if (typeof document === "undefined") return;

  if (appMode === "landlord") {
    document.title = "Isoma ERP | Isoma UG";
    setFaviconHref("/favicon-32.png", "image/png");
    return;
  }

  const schoolName = tenant?.name || "School Portal";
  document.title = `${schoolName} | School Portal`;

  const customFavicon = tenant?.favicon_url || tenant?.logo_url;
  if (customFavicon) {
    const isSvg = customFavicon.toLowerCase().endsWith(".svg");
    setFaviconHref(customFavicon, isSvg ? "image/svg+xml" : "image/png");
  } else {
    const initials = tenant?.initials || schoolName.slice(0, 2);
    setFaviconHref(buildInitialsFaviconDataUri(initials, "#004880"), "image/svg+xml");
  }
}
