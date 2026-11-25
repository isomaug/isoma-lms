import { handleNetworkError } from "@/utils/networkErrorHandler";
import { API_BASE_URL } from "@/config";
import {
  getAccessToken,
  getRefreshToken,
  setTokens,
  clearTokens,
} from "@/api/auth/tokens";

const BASE_URL = API_BASE_URL;

async function refreshAccessToken() {
  const refresh = getRefreshToken();
  if (!refresh) return null;

  const res = await fetch(`${BASE_URL}/api/auth/refresh/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh }),
  });

  if (!res.ok) return null;

  const data = await res.json(); // { access: "..." }
  setTokens({ access: data.access, refresh });
  return data.access;
}

export async function apiFetch(path, options = {}) {
  const headers = new Headers(options.headers || {});
  if (
    !headers.has("Content-Type") &&
    options.body &&
    !(options.body instanceof FormData)
  ) {
    headers.set("Content-Type", "application/json");
  }

  const access = getAccessToken();
  if (access) headers.set("Authorization", `Bearer ${access}`);

  const rawWsId = localStorage.getItem('ekebu_active_workspace_id');
  const activeWsId = rawWsId && rawWsId !== 'undefined' && rawWsId !== 'null' && rawWsId !== 'global' ? rawWsId : null;
  if (activeWsId && typeof path === 'string' && path.includes('/finance/') && !headers.has("X-Workspace-Id")) {
    headers.set("X-Workspace-Id", activeWsId);
  }

  try {
    let res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

    // Refresh once on 401 and retry
    if (res.status === 401) {
      const refresh = getRefreshToken();
      if (!access && !refresh) {
        // The user was never logged in, so this is just an unauthorized request, not an expired session.
        return res;
      }

      const newAccess = await refreshAccessToken();
      if (!newAccess) {
        clearTokens();
        window.dispatchEvent(new CustomEvent("session-expired"));
        return res;
      }

      headers.set("Authorization", `Bearer ${newAccess}`);
      res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
    }

    // Clear offline status on success
    window.dispatchEvent(
      new CustomEvent("app-offline-status", { detail: { offline: false } })
    );
    return res;
  } catch (err) {
    if (!options.silentOffline) {
      handleNetworkError(err);
    }
    throw err;
  }
}

export const swrFetcher = async (url) => {
  const separator = url.includes("?") ? "&" : "?";
  const urlWithCacheBuster = `${url}${separator}t=${new Date().getTime()}`;
  const res = await apiFetch(urlWithCacheBuster);
  if (!res.ok) {
    throw new Error(`API Error ${res.status}: ${res.statusText}`);
  }
  return res.json();
};
