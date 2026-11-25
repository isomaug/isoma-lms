/**
 * Determines whether this single React app is running in:
 * - "landlord" mode (isomaug.com or local :5176)
 * - "tenant" mode (learn.isomaug.com, *.isomaug.com, custom domain, or local :5177)
 */
export function getAppMode() {
  if (typeof window === "undefined") return "landlord";
  const envMode = (import.meta.env.VITE_APP_MODE || "").toLowerCase();
  if (envMode === "tenant" || envMode === "landlord") return envMode;

  const { hostname, port } = window.location;
  if (port === "5177") return "tenant";
  if (hostname === "isomaug.com" || hostname === "www.isomaug.com") return "landlord";
  if (hostname === "localhost" || hostname === "127.0.0.1") {
    const params = new URLSearchParams(window.location.search);
    return params.get("tenant") ? "tenant" : "landlord";
  }
  return "tenant";
}

export function getActiveTenantSlug() {
  if (typeof window === "undefined") return "stmarys";
  const params = new URLSearchParams(window.location.search);
  const fromQuery = params.get("tenant");
  if (fromQuery) {
    sessionStorage.setItem("isoma_active_tenant", fromQuery.toLowerCase());
    return fromQuery.toLowerCase();
  }
  const { hostname } = window.location;
  if (hostname.endsWith(".isomaug.com")) {
    return hostname.replace(".isomaug.com", "").toLowerCase();
  }
  return (
    sessionStorage.getItem("isoma_active_tenant") ||
    import.meta.env.VITE_DEFAULT_TENANT ||
    "stmarys"
  );
}

export function getTenantPortalUrl(subdomain, path = "/") {
  if (typeof window === "undefined") return `https://${subdomain}.isomaug.com${path}`;
  const { hostname } = window.location;
  if (hostname === "localhost" || hostname === "127.0.0.1") {
    const sep = path.includes("?") ? "&" : "?";
    return `http://127.0.0.1:5177${path}${sep}tenant=${encodeURIComponent(subdomain)}`;
  }
  return `https://${subdomain}.isomaug.com${path}`;
}
