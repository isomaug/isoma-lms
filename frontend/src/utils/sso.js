import { getAccessToken, getRefreshToken } from "@/api/auth/tokens";

function appendSSOTokens(targetUrl) {
  const access = getAccessToken();
  const refresh = getRefreshToken();

  if (access && refresh) {
    targetUrl.searchParams.set("token", access);
    targetUrl.searchParams.set("refresh", refresh);
  }

  return targetUrl.toString();
}

function buildSSOUrl(baseUrl, path = "/") {
  let targetUrl;
  try {
    if (path && (path.startsWith("http://") || path.startsWith("https://"))) {
      targetUrl = new URL(path);
    } else {
      const normalizedPath = (path || "/").startsWith("/")
        ? path || "/"
        : `/${path}`;
      targetUrl = new URL(`${baseUrl}${normalizedPath}`);
    }
  } catch {
    targetUrl = new URL(`${baseUrl}/`);
  }
  return appendSSOTokens(targetUrl);
}

/**
 * Generates an SSO URL for EkebuLive.
 * It appends the current user's tokens so they are automatically authenticated on the other domain.
 *
 * @param {string} path - Path on EkebuLive (e.g. "/live", "/live/slug", "/s/slug", "/").
 * @returns {string} - The full URL to EkebuLive with SSO tokens.
 */
export function getEkebuLiveSSOUrl(path = "/") {
  const isLocalhost =
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1");

  const defaultBaseUrl = isLocalhost
    ? "http://localhost:5174"
    : "https://www.ekebulive.com";

  const baseUrl = (
    import.meta.env.VITE_EKEBULIVE_URL || defaultBaseUrl
  ).replace(/\/+$/, "");

  return buildSSOUrl(baseUrl, path);
}

/**
 * Generates an SSO URL for Isoma Learning (learn.isomaug.com).
 *
 * @param {string} path - Path on Isoma Learning (e.g. "/courses", "/my-learning", "/").
 * @returns {string} - The full URL to Isoma Learning with SSO tokens.
 */
export function getIsomaLearnSSOUrl(path = "/") {
  const isLocalhost =
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1");

  const defaultBaseUrl = isLocalhost
    ? "http://localhost:5175"
    : "https://learn.isomaug.com";

  const baseUrl = (
    import.meta.env.VITE_ISOMA_LEARN_URL || defaultBaseUrl
  ).replace(/\/+$/, "");

  return buildSSOUrl(baseUrl, path);
}

/**
 * Generates an SSO URL for EkebuSente (standalone financial tracker).
 *
 * @param {string} path - Path on EkebuSente (e.g. "/", "/onboarding", "/strategy").
 * @returns {string} - The full URL to EkebuSente with SSO tokens.
 */
export function getEkebuSenteSSOUrl(path = "/") {
  const isLocalhost =
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1");

  const defaultBaseUrl = isLocalhost
    ? "http://localhost:5173"
    : "http://65.108.139.24:8092";

  const baseUrl = (
    import.meta.env.VITE_EKEBUSENTE_URL || defaultBaseUrl
  ).replace(/\/+$/, "");

  return buildSSOUrl(baseUrl, path);
}
