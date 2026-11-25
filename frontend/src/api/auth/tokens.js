const LMS_ACCESS = "isoma_lms_access";
const LMS_REFRESH = "isoma_lms_refresh";
const ACCESS = "access_token";
const REFRESH = "refresh_token";

export function setTokens({ access, refresh }) {
  if (access) {
    localStorage.setItem(LMS_ACCESS, access);
    localStorage.setItem(ACCESS, access);
  }
  if (refresh) {
    localStorage.setItem(LMS_REFRESH, refresh);
    localStorage.setItem(REFRESH, refresh);
  }
}

export function getAccessToken() {
  return localStorage.getItem(LMS_ACCESS) || localStorage.getItem(ACCESS);
}

export function getRefreshToken() {
  return localStorage.getItem(LMS_REFRESH) || localStorage.getItem(REFRESH);
}

export function clearTokens() {
  localStorage.removeItem(LMS_ACCESS);
  localStorage.removeItem(LMS_REFRESH);
  localStorage.removeItem(ACCESS);
  localStorage.removeItem(REFRESH);
}
