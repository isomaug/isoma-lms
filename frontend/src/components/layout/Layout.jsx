import React from "react";

/**
 * Lightweight wrapper for ported course pages so they render cleanly
 * inside the Isoma Royal Blue PortalLayout without duplicating chrome.
 */
export default function Layout({ children }) {
  return <div className="w-full">{children}</div>;
}
