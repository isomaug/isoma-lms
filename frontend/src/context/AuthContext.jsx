import React, { createContext, useContext, useEffect, useState } from "react";
import { getActiveTenantSlug, getAppMode } from "../utils/appMode";

const AuthContext = createContext(null);

const ACCESS_KEY = "isoma_lms_access";
const REFRESH_KEY = "isoma_lms_refresh";

const DEFAULT_TENANT = {
  name: "ISOMA UG",
  initials: "IU",
  subdomain: "root",
  primary_domain: "isomaug.com",
  tier: "OPEN_ACADEMY",
  phone: "+256778261026",
  email: "isomaug@gmail.com",
  is_public_academy: false,
};

export function AuthProvider({ children }) {
  const appMode = getAppMode();
  const tenantSlug = appMode === "tenant" ? getActiveTenantSlug() : null;

  const [user, setUser] = useState(null);
  const [tenant, setTenant] = useState(DEFAULT_TENANT);
  const [previewRole, setPreviewRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ssoToken = params.get("token");
    const ssoRefresh = params.get("refresh");
    if (ssoToken && ssoRefresh) {
      localStorage.setItem(ACCESS_KEY, ssoToken);
      localStorage.setItem(REFRESH_KEY, ssoRefresh);
      params.delete("token");
      params.delete("refresh");
      const clean = params.toString();
      window.history.replaceState(
        {},
        "",
        `${window.location.pathname}${clean ? `?${clean}` : ""}`
      );
    }

    async function hydrate() {
      try {
        const url =
          appMode === "tenant" && tenantSlug
            ? `/api/tenant/context/?tenant=${encodeURIComponent(tenantSlug)}`
            : "/api/tenant/context/";
        const tenantRes = await fetch(url);
        if (tenantRes.ok) {
          setTenant(await tenantRes.json());
        }
      } catch {
        // Fallback to default metadata
      }

      const token = localStorage.getItem(ACCESS_KEY);
      if (token) {
        try {
          const meRes = await fetch("/api/auth/me/", {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (meRes.ok) {
            setUser(await meRes.json());
          } else {
            localStorage.removeItem(ACCESS_KEY);
            localStorage.removeItem(REFRESH_KEY);
          }
        } catch {
          // Offline or backend unavailable
        }
      }
      setLoading(false);
    }

    hydrate();
  }, [appMode, tenantSlug]);

  async function login(email, password) {
    const res = await fetch("/api/auth/login/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.detail || "Unable to sign in.");
    }
    localStorage.setItem(ACCESS_KEY, data.access);
    localStorage.setItem(REFRESH_KEY, data.refresh);
    setUser(data.user);
    setPreviewRole(null);
    return data.user;
  }

  function logout() {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
    setUser(null);
    setPreviewRole(null);
  }

  const effectiveRole =
    previewRole ||
    (user?.role === "SUPER_ADMIN" ? "PRINCIPAL" : user?.role) ||
    "PRINCIPAL";

  return (
    <AuthContext.Provider
      value={{
        appMode,
        tenantSlug,
        user,
        tenant,
        effectiveRole,
        previewRole,
        setPreviewRole,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
