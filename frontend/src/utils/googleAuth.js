/** Public OAuth client id. Empty means Google sign-in is not configured. */
export function googleOAuthClientId() {
  const primary = import.meta.env.GOOGLE_OAUTH_CLIENT_ID;
  const legacy = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  return String(primary || legacy || "").trim();
}

export function googleSignInConfigured() {
  return Boolean(googleOAuthClientId());
}
