import React, { useState, useEffect } from "react";
import { getMediaUrl } from "@/config";

/**
 * Optimizes external URLs (e.g. Unsplash) by appending sizing and modern format parameters,
 * and ensures relative media paths resolve against the backend base URL.
 */
function getOptimizedImageUrl(src, width = 1200) {
  if (!src || typeof src !== "string") return src;

  // Resolve relative backend /media/ paths
  const resolvedSrc = getMediaUrl(src);

  // Optimize Unsplash images
  if (resolvedSrc.includes("images.unsplash.com")) {
    try {
      const url = new URL(resolvedSrc);
      url.searchParams.set("w", width.toString());
      url.searchParams.set("auto", "format");
      url.searchParams.set("fit", "crop");
      url.searchParams.set("q", "80");
      return url.toString();
    } catch {
      return resolvedSrc;
    }
  }

  return resolvedSrc;
}

/**
 * SmartImage Component
 * Prevents top-to-bottom scanlines by keeping images hidden behind a skeleton loader
 * until fully downloaded, then smoothly fading them into view.
 */
export default function SmartImage({
  src,
  alt = "",
  className = "",
  containerClassName = "",
  aspectRatio,
  loading = "lazy",
  fetchPriority = "auto",
  fallbackSrc,
  optimizedWidth = 1200,
  ...props
}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(() => getOptimizedImageUrl(src, optimizedWidth));

  // Reset state if src changes
  useEffect(() => {
    setIsLoaded(false);
    setHasError(false);
    setCurrentSrc(getOptimizedImageUrl(src, optimizedWidth));
  }, [src, optimizedWidth]);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    if (fallbackSrc && currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
      return;
    }
    setHasError(true);
    setIsLoaded(true);
  };

  return (
    <div
      className={`relative overflow-hidden bg-muted/40 ${containerClassName}`}
      style={aspectRatio ? { aspectRatio } : undefined}
    >
      {/* Skeleton Pulse Loader */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-muted/60 animate-pulse z-0" />
      )}

      {/* Error Fallback */}
      {hasError ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted text-muted-foreground p-2 text-center text-xs">
          <svg
            className="w-6 h-6 opacity-40 mb-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <span className="opacity-60 font-mono text-[10px]">Image Unavailable</span>
        </div>
      ) : (
        <img
          src={currentSrc}
          alt={alt}
          loading={loading}
          fetchPriority={fetchPriority}
          onLoad={handleLoad}
          onError={handleError}
          className={`${className} transition-opacity duration-300 ease-in-out ${
            isLoaded ? "opacity-100" : "opacity-0"
          }`}
          {...props}
        />
      )}
    </div>
  );
}
