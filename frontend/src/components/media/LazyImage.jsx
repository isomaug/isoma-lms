import React, { useRef, useState, useEffect } from "react";

/**
 * LazyImage component uses IntersectionObserver to load the image only when it
 * enters the viewport. It also adds the native loading="lazy" attribute for
 * browsers that support it.
 *
 * Props are passed directly to the underlying <img> element.
 */
const LazyImage = ({ src, alt = "", ...rest }) => {
  const imgRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!imgRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsLoaded(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "200px" }
    );
    observer.observe(imgRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <img
      ref={imgRef}
      src={isLoaded ? src : undefined}
      data-src={src}
      alt={alt}
      loading="lazy"
      {...rest}
    />
  );
};

export default LazyImage;
