const rawEnv =
  import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || "";

export const API_BASE_URL = rawEnv.replace(/\/+$/, "");

export function getMediaUrl(url, fallback = "") {
  if (!url) return fallback;
  if (
    url.startsWith("http://") ||
    url.startsWith("https://") ||
    url.startsWith("data:")
  ) {
    return url;
  }
  const base = API_BASE_URL || "";
  return `${base}${url.startsWith("/") ? "" : "/"}${url}`;
}

export default { API_BASE_URL, getMediaUrl };
