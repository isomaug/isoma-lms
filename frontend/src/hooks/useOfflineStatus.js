import { useState, useEffect } from "react";

export function useOfflineStatus() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    const handleAppOfflineStatus = (e) => {
      setIsOffline(e.detail.offline);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    window.addEventListener("app-offline-status", handleAppOfflineStatus);

    // Initial check
    if (!navigator.onLine) {
      setIsOffline(true);
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("app-offline-status", handleAppOfflineStatus);
    };
  }, []);

  return isOffline;
}
