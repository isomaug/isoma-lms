import { useState, useEffect } from "react";

export default function LoadingScreen({
  title = "Loading...",
  message = "Please wait.",
  delay = 200, // Default 200ms delay to avoid blink
  fullScreen = true,
}) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShow(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  if (!show) return null;

  const containerClasses = fullScreen
    ? "fixed inset-0 h-screen w-screen flex flex-col items-center justify-center font-sans z-[99999] bg-background p-4 text-center"
    : "py-20 flex flex-col items-center justify-center font-sans w-full min-h-[75vh] bg-background text-center flex-1";

  return (
    <div className={containerClasses}>
      <div className="relative w-[5.5rem] h-[5.5rem] flex items-center justify-center mb-5">
        <div className="absolute inset-0 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
        <img
          src="/icon-512.png"
          alt="Your IT Guy"
          className="w-[4.5rem] h-[4.5rem] rounded-full object-cover border-2 border-primary/40 relative z-10"
        />
      </div>
      <h4 className="font-['Poppins',sans-serif] font-extrabold text-sm tracking-widest uppercase text-foreground drop-shadow-sm">
        YOUR IT GUY
      </h4>
      {message && (
        <p className="text-xs text-muted-foreground mt-1 font-semibold font-['Poppins',sans-serif] tracking-wide animate-pulse">
          {message}
        </p>
      )}
    </div>
  );
}
