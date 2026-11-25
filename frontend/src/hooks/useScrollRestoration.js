import { useEffect } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

/**
 * Persist and restore the scroll position of a route's actual scroll container.
 * New navigations start at the top; refreshes and browser history restore.
 */
export default function useScrollRestoration(containerRef, namespace = "page") {
  const location = useLocation();
  const navigationType = useNavigationType();
  const storageKey = `scroll:${namespace}:${location.pathname}${location.search}`;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;

    const previousScrollRestoration = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";

    let frameId;
    let restoreFrameId;
    let restoreTimeoutId;
    let resizeObserver;
    let userInterrupted = false;
    let observedScroll = false;

    const savePosition = () => {
      sessionStorage.setItem(storageKey, String(container.scrollTop));
    };

    const onScroll = () => {
      observedScroll = true;
      if (frameId) cancelAnimationFrame(frameId);
      frameId = requestAnimationFrame(savePosition);
    };

    const stopRestoring = () => {
      userInterrupted = true;
    };

    container.addEventListener("scroll", onScroll, { passive: true });
    container.addEventListener("wheel", stopRestoring, { passive: true });
    container.addEventListener("touchstart", stopRestoring, { passive: true });
    container.addEventListener("pointerdown", stopRestoring, { passive: true });
    window.addEventListener("pagehide", savePosition);

    const savedPosition = Number(sessionStorage.getItem(storageKey));
    const shouldRestore =
      navigationType === "POP" &&
      Number.isFinite(savedPosition) &&
      savedPosition > 0;

    if (!shouldRestore) {
      container.scrollTop = 0;
    } else {
      const restorePosition = () => {
        if (userInterrupted) return;
        container.scrollTop = savedPosition;
      };

      restoreFrameId = requestAnimationFrame(restorePosition);
      resizeObserver = new ResizeObserver(restorePosition);
      resizeObserver.observe(container);
      if (container.firstElementChild) {
        resizeObserver.observe(container.firstElementChild);
      }
      restoreTimeoutId = window.setTimeout(() => {
        resizeObserver?.disconnect();
      }, 4000);
    }

    return () => {
      if (observedScroll) savePosition();
      if (frameId) cancelAnimationFrame(frameId);
      if (restoreFrameId) cancelAnimationFrame(restoreFrameId);
      if (restoreTimeoutId) window.clearTimeout(restoreTimeoutId);
      resizeObserver?.disconnect();
      container.removeEventListener("scroll", onScroll);
      container.removeEventListener("wheel", stopRestoring);
      container.removeEventListener("touchstart", stopRestoring);
      container.removeEventListener("pointerdown", stopRestoring);
      window.removeEventListener("pagehide", savePosition);
      window.history.scrollRestoration = previousScrollRestoration;
    };
  }, [containerRef, navigationType, storageKey]);
}
