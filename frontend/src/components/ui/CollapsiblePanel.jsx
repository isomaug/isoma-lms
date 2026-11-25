import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

/**
 * CollapsiblePanel - Full-width single-column expandable section toggled with a chevron.
 */
export default function CollapsiblePanel({
  title,
  subtitle,
  icon: Icon,
  badge,
  defaultOpen = false,
  children,
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="w-full bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="w-full flex items-center justify-between gap-3 px-5 py-4 md:px-6 text-left hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3 min-w-0">
          {Icon && (
            <div className="w-9 h-9 rounded-lg border border-gray-200 bg-white text-primary flex items-center justify-center shrink-0">
              <Icon className="w-4 h-4" />
            </div>
          )}
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">{title}</p>
            {subtitle && (
              <p className="text-[11px] text-gray-500 truncate mt-0.5">{subtitle}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2.5 shrink-0">
          {badge && (
            <span className="text-xs font-bold text-primary">{badge}</span>
          )}
          <ChevronDown
            className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
              open ? "rotate-180 text-primary" : ""
            }`}
          />
        </div>
      </button>

      {open && (
        <div className="border-t border-gray-100 px-5 py-5 md:px-6">
          {children}
        </div>
      )}
    </div>
  );
}
