import { mutate } from "swr";
import { apiGet } from "../api";

/**
 * Silently warms up the SWR cache for critical pages in the background
 * once the main thread is idle.
 */
export function prefetchCriticalRoutes() {
  const routesToPrefetch = [
    "/api/posts/",
    "/api/scholarships/",
    "/api/profile/",
  ];

  const doPrefetch = () => {
    routesToPrefetch.forEach((route) => {
      // Use mutate to fetch and populate SWR cache directly without mounting components
      mutate(
        route,
        () => apiGet(route).catch(() => null), // fail silently
        { populateCache: true, revalidate: false }
      );
    });
  };

  if ("requestIdleCallback" in window) {
    window.requestIdleCallback(doPrefetch, { timeout: 2000 });
  } else {
    // Fallback for Safari
    setTimeout(doPrefetch, 2000);
  }
}
