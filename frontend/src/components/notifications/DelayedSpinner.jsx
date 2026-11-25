import React from "react";
import { createPortal } from "react-dom";

export default function DelayedSpinner({
  delay = 0,
  message = "",
  fullScreen = true,
}) {
  const containerClasses = fullScreen
    ? "fixed inset-0 z-[999999] min-h-[100dvh] w-full bg-background flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-200 font-['Poppins',sans-serif]"
    : "flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-200 min-h-[calc(100vh-5rem)] bg-background w-full font-['Poppins',sans-serif]";

  const loader = (
    <div className={containerClasses}>
      <div className="relative w-[5.5rem] h-[5.5rem] flex items-center justify-center mb-5">
        <div className="absolute inset-0 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
        <img
          src="/icon-512.png"
          alt="Your IT Guy"
          className="w-[4.5rem] h-[4.5rem] rounded-full object-cover border-2 border-primary/40 relative z-10"
          onError={(e) => {
            e.currentTarget.src = "/ekebu-profile-pic.png";
          }}
        />
      </div>
      <h4
        className="font-['Poppins',sans-serif] font-extrabold text-sm tracking-widest uppercase text-foreground drop-shadow-sm"
      >
        YOUR IT GUY
      </h4>
      {message && (
        <p className="text-xs text-muted-foreground mt-1 font-semibold font-['Poppins',sans-serif] tracking-wide animate-pulse">
          {message}
        </p>
      )}
    </div>
  );

  if (fullScreen && typeof document !== "undefined") {
    return createPortal(loader, document.body);
  }

  return loader;
}
