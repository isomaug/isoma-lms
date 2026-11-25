import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CheckCircle2,
  AlertCircle,
  Info,
  X,
  XCircle,
  FilePenLine,
  ArrowRight,
} from "lucide-react";

const toastListeners = new Set();
const modalListeners = new Set();
let toastSeq = 0;

function emitToast(type, message) {
  const id = ++toastSeq;
  toastListeners.forEach((fn) => fn({ id, type, message }));
}

function emitModal(payload) {
  modalListeners.forEach((fn) => fn(payload));
}

export const customToast = {
  success: (msg) => emitToast("success", msg),
  error: (msg) => emitToast("error", msg),
  info: (msg) => emitToast("info", msg),
};

export const statusModal = {
  success: (opts) => emitModal({ variant: "success", ...opts }),
  rejected: (opts) => emitModal({ variant: "rejected", ...opts }),
  draft: (opts) => emitModal({ variant: "draft", ...opts }),
  close: () => emitModal(null),
};

export default function GlobalPopup() {
  const [items, setItems] = useState([]);
  const [modal, setModal] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const toastHandler = (toast) => {
      setItems((prev) => [...prev.slice(-3), toast]);
      setTimeout(() => {
        setItems((prev) => prev.filter((item) => item.id !== toast.id));
      }, 3600);
    };
    const modalHandler = (payload) => {
      setModal(payload);
    };
    toastListeners.add(toastHandler);
    modalListeners.add(modalHandler);
    return () => {
      toastListeners.delete(toastHandler);
      modalListeners.delete(modalHandler);
    };
  }, []);

  function handlePrimaryAction() {
    if (!modal) return;
    const { nextRoute, onNext } = modal;
    setModal(null);
    if (onNext) onNext();
    if (nextRoute) navigate(nextRoute);
  }

  function handleSecondaryAction() {
    if (!modal) return;
    const { onSecondary } = modal;
    setModal(null);
    if (onSecondary) onSecondary();
  }

  const modalConfig = modal
    ? {
        success: {
          Icon: CheckCircle2,
          ring: "bg-emerald-50 text-emerald-600 border-emerald-200",
          accent: "from-emerald-500 via-emerald-400 to-emerald-600",
          badge: "SUCCESS",
          badgeColor: "text-emerald-700",
          btnClass: "bg-primary hover:bg-primary-hover text-white",
          defaultTitle: "Registration Successful",
          defaultNextLabel: "Continue to Next Step",
        },
        rejected: {
          Icon: XCircle,
          ring: "bg-red-50 text-red-600 border-red-200",
          accent: "from-red-500 via-rose-400 to-red-600",
          badge: "REJECTED",
          badgeColor: "text-red-600",
          btnClass: "bg-red-600 hover:bg-red-700 text-white",
          defaultTitle: "Action Rejected",
          defaultNextLabel: "Review & Fix",
        },
        draft: {
          Icon: FilePenLine,
          ring: "bg-amber-50 text-amber-600 border-amber-200",
          accent: "from-amber-500 via-amber-400 to-primary",
          badge: "SAVED AS DRAFT",
          badgeColor: "text-amber-700",
          btnClass: "bg-primary hover:bg-primary-hover text-white",
          defaultTitle: "Saved as Draft",
          defaultNextLabel: "Continue",
        },
      }[modal.variant || "success"]
    : null;

  return (
    <>
      {/* Global Centered Status Modal (Success / Rejected / Draft) */}
      {modal && modalConfig && (
        <div
          className="fixed inset-0 z-[250] bg-black/50 backdrop-blur-[2px] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="page-enter w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
            <div className={`h-1.5 bg-gradient-to-r ${modalConfig.accent}`} />
            <div className="p-6 sm:p-7 text-center space-y-4">
              <div className="flex justify-center">
                <div
                  className={`w-14 h-14 rounded-2xl border flex items-center justify-center shadow-xs ${modalConfig.ring}`}
                >
                  <modalConfig.Icon className="w-7 h-7" />
                </div>
              </div>

              <div className="space-y-1.5">
                <p
                  className={`text-[10px] font-bold uppercase tracking-widest ${modalConfig.badgeColor}`}
                >
                  {modalConfig.badge}
                </p>
                <h3 className="text-lg font-bold text-gray-900 leading-snug">
                  {modal.title || modalConfig.defaultTitle}
                </h3>
                {modal.message && (
                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                    {modal.message}
                  </p>
                )}
              </div>

              {modal.details && (
                <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-left text-xs text-gray-700 space-y-1">
                  {Array.isArray(modal.details)
                    ? modal.details.map((line, i) => (
                        <p key={i} className="leading-snug">
                          {line}
                        </p>
                      ))
                    : modal.details}
                </div>
              )}

              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2.5">
                {modal.secondaryLabel && (
                  <button
                    type="button"
                    onClick={handleSecondaryAction}
                    className="flex-1 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-xs font-semibold text-gray-700 hover:border-primary hover:text-primary transition-colors"
                  >
                    {modal.secondaryLabel}
                  </button>
                )}
                <button
                  type="button"
                  onClick={handlePrimaryAction}
                  className={`flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg px-5 py-2.5 text-xs font-semibold transition-colors ${modalConfig.btnClass}`}
                >
                  <span>{modal.nextLabel || modalConfig.defaultNextLabel}</span>
                  {(modal.nextRoute || modal.variant !== "rejected") && (
                    <ArrowRight className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Corner Toast Notifications */}
      {items.length > 0 && (
        <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-[calc(100vw-2rem)]">
          {items.map((item) => {
            const Icon =
              item.type === "success"
                ? CheckCircle2
                : item.type === "error"
                  ? AlertCircle
                  : Info;
            const tone =
              item.type === "success"
                ? "border-emerald-200 bg-white text-gray-800"
                : item.type === "error"
                  ? "border-red-200 bg-white text-red-700"
                  : "border-primary/20 bg-white text-gray-800";
            const iconTone =
              item.type === "success"
                ? "text-emerald-600"
                : item.type === "error"
                  ? "text-red-500"
                  : "text-primary";

            return (
              <div
                key={item.id}
                className={`flex items-center gap-2.5 rounded-xl border px-3.5 py-2.5 shadow-lg text-xs font-medium ${tone}`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${iconTone}`} />
                <span className="flex-1 leading-snug">{item.message}</span>
                <button
                  type="button"
                  onClick={() =>
                    setItems((prev) => prev.filter((t) => t.id !== item.id))
                  }
                  className="text-gray-400 hover:text-gray-600"
                  aria-label="Dismiss notification"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
