import { toast } from "sonner";

export function handleNetworkError(err) {
  // If the user's internet is genuinely offline, trigger the offline indicator
  if (!navigator.onLine) {
    window.dispatchEvent(
      new CustomEvent("app-offline-status", { detail: { offline: true } })
    );
    return;
  }

  // If we reach here, the user has internet, but the fetch failed
  // (e.g. ERR_CONNECTION_REFUSED, Server Down, CORS error)
  if (err instanceof TypeError || err.message?.toLowerCase().includes("fetch")) {
    toast.error("Unable to connect to the server. Retrying...", {
      id: "server-unreachable",
      duration: 4000,
    });
  }
}
