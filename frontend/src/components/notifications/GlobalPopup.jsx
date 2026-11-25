import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { toast as sonnerToast } from "sonner";
import { Check, CheckCircle2, XCircle, Info, X, Lock } from "lucide-react";

const popupToastOptions = {
  duration: Infinity,
  unstyled: true,
  className: "!fixed !inset-0 !m-0 !p-0 !w-auto !max-w-none !transform-none !bg-transparent !border-0 !shadow-none !left-0 !top-0",
};

export function GlobalPopup({
  t,
  type,
  message,
  title,
  onConfirm,
  onCancel,
  confirmText,
  cancelText,
}) {
  // Dismiss automatically after a delay unless it's a confirmation popup
  useEffect(() => {
    if (type === "confirm") return;
    const timer = setTimeout(() => {
      sonnerToast.dismiss(t);
    }, type === "info" ? 4500 : 3500);
    return () => clearTimeout(timer);
  }, [t, type]);

  if (typeof document === "undefined") return null;

  const heading =
    title ||
    (type === "error"
      ? "Error"
      : type === "info"
      ? "Notice"
      : type === "confirm"
      ? "Confirm Action"
      : message === "Lesson Completed!"
      ? "Lesson Completed!"
      : "Success");

  const displayMessage =
    message === "Lesson Completed!" && !title
      ? "Great job! Keep up the momentum and continue learning."
      : message;

  return createPortal(
    <div
      onClick={() => {
        if (type !== "confirm") sonnerToast.dismiss(t);
      }}
      className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-black/35 backdrop-blur-[2px] px-6 text-center pointer-events-auto transition-opacity"
    >
      <motion.div
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.88, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 12 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="bg-card border border-border rounded-lg p-6 max-w-sm w-full space-y-4 shadow-2xl flex flex-col items-center relative font-['Poppins',sans-serif] backdrop-blur-sm"
      >
        <button
          onClick={() => {
            sonnerToast.dismiss(t);
            if (onCancel) onCancel();
          }}
          className="absolute top-3 right-3 text-muted-foreground/70 hover:text-foreground transition-colors p-1.5 rounded-md hover:bg-muted cursor-pointer"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        <div
          className={`w-14 h-14 rounded-full flex items-center justify-center mb-1 shadow-md ${
            type === "error"
              ? "bg-rose-600 text-white"
              : type === "info"
              ? "bg-blue-600 text-white"
              : type === "confirm"
              ? "bg-amber-600 text-white"
              : "bg-emerald-600 text-white"
          }`}
        >
          {type === "error" ? (
            <X className="w-7 h-7 text-white stroke-[2.5]" />
          ) : type === "info" ? (
            <Info className="w-7 h-7 text-white stroke-[2.5]" />
          ) : type === "confirm" ? (
            <Lock className="w-7 h-7 text-white stroke-[2.5]" />
          ) : (
            <Check className="w-7 h-7 text-white stroke-[2.5]" />
          )}
        </div>

        <div className="space-y-1.5 text-center">
          <h2 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
            {heading}
          </h2>

          <p className="text-sm text-muted-foreground max-w-xs leading-relaxed font-medium">
            {displayMessage}
          </p>
        </div>

        {type === "confirm" && (
          <div className="flex w-full items-center gap-2 pt-2 border-t border-border/60">
            <button
              type="button"
              onClick={() => {
                sonnerToast.dismiss(t);
                if (onCancel) onCancel();
              }}
              className="flex-1 py-2 px-3 text-xs font-semibold rounded-md border border-border bg-background hover:bg-muted text-foreground transition-colors cursor-pointer"
            >
              {cancelText || "Cancel"}
            </button>
            <button
              type="button"
              onClick={() => {
                sonnerToast.dismiss(t);
                if (onConfirm) onConfirm();
              }}
              className="flex-1 py-2 px-3 text-xs font-semibold rounded-md bg-amber-600 hover:bg-amber-700 text-white transition-colors shadow-sm cursor-pointer"
            >
              {confirmText || "Approve & Lock"}
            </button>
          </div>
        )}
      </motion.div>
    </div>,
    document.body
  );
}

// Wrapper to replace sonner's toast
const toastMethods = {
  success: (msg, title) =>
    sonnerToast.custom(
      (t) => <GlobalPopup t={t} type="success" message={msg} title={title} />,
      popupToastOptions
    ),
  error: (msg, title) =>
    sonnerToast.custom(
      (t) => <GlobalPopup t={t} type="error" message={msg} title={title} />,
      popupToastOptions
    ),
  info: (msg, title) =>
    sonnerToast.custom(
      (t) => <GlobalPopup t={t} type="info" message={msg} title={title} />,
      { ...popupToastOptions, duration: 4500 }
    ),
  confirm: (
    msg,
    {
      title = "Confirm Action",
      onConfirm,
      onCancel,
      confirmText = "Approve & Lock",
      cancelText = "Cancel",
    } = {}
  ) =>
    sonnerToast.custom(
      (t) => (
        <GlobalPopup
          t={t}
          type="confirm"
          message={msg}
          title={title}
          onConfirm={onConfirm}
          onCancel={onCancel}
          confirmText={confirmText}
          cancelText={cancelText}
        />
      ),
      { ...popupToastOptions, duration: Infinity }
    ),
  dismiss: sonnerToast.dismiss,
  promise: sonnerToast.promise,
  loading: sonnerToast.loading,
  custom: sonnerToast.custom,
};

function baseCustomToast(msg, optionsOrTitle) {
  if (typeof optionsOrTitle === "object" && optionsOrTitle !== null) {
    const description = optionsOrTitle.description;
    if (description) {
      return toastMethods.info(description, typeof msg === "string" ? msg : undefined);
    }
  }
  const title = typeof optionsOrTitle === "string" ? optionsOrTitle : undefined;
  return toastMethods.info(msg, title);
}

export const customToast = Object.assign(baseCustomToast, toastMethods);
