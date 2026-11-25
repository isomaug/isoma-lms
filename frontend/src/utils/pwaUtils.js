import { toast } from "sonner";

/**
 * Utility to unregister Service Workers, delete all Workbox/browser caches,
 * and perform a hard reload to get the latest app deployment.
 */
export async function clearCacheAndUpdateApp() {
  toast.loading("Purging cache & updating app...", { id: "pwa-update" });
  try {
    // 1. Unregister all service workers
    if ("serviceWorker" in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const registration of registrations) {
        await registration.unregister();
      }
    }

    // 2. Clear all CacheStorage entries
    if ("caches" in window) {
      const cacheNames = await caches.keys();
      for (const name of cacheNames) {
        await caches.delete(name);
      }
    }

    toast.success("Cache cleared! Loading fresh version...", { id: "pwa-update" });
    
    // 3. Hard reload the window
    setTimeout(() => {
      window.location.reload(true);
    }, 600);
  } catch (err) {
    console.error("Failed to clear cache:", err);
    window.location.reload(true);
  }
}
