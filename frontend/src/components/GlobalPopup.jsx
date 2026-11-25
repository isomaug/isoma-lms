import React, { useEffect, useState } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

const listeners = new Set();
let toastSeq = 0;

function emit(type, message) {
  const id = ++toastSeq;
  listeners.forEach((fn) => fn({ id, type, message }));
}

export const customToast = {
  success: (msg) => emit("success", msg),
  error: (msg) => emit("error", msg),
  info: (msg) => emit("info", msg),
};

export default function GlobalPopup() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const handler = (toast) => {
      setItems((prev) => [...prev.slice(-3), toast]);
      setTimeout(() => {
        setItems((prev) => prev.filter((item) => item.id !== toast.id));
      }, 3600);
    };
    listeners.add(handler);
    return () => listeners.delete(handler);
  }, []);

  if (items.length === 0) return null;

  return (
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
  );
}
