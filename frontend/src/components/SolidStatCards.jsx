import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { customToast } from "./GlobalPopup";

const SOLID_PALETTES = [
  "bg-[#004880] hover:bg-[#00325c] text-white",
  "bg-[#059669] hover:bg-[#047857] text-white",
  "bg-[#4338ca] hover:bg-[#3730a3] text-white",
  "bg-[#0d9488] hover:bg-[#0f766e] text-white",
];

/**
 * Reusable solid-color clickable KPI counter cards for Landlord and all 16 Tenant role dashboards.
 */
export default function SolidStatCards({ items = [] }) {
  const navigate = useNavigate();

  function handleClick(item) {
    if (item.href) {
      window.open(item.href, "_blank", "noopener,noreferrer");
      return;
    }
    if (item.to) {
      navigate(item.to);
      return;
    }
    if (item.onClick) {
      item.onClick();
      return;
    }
    customToast.info(`${item.label} details will open once this ERP module is activated.`);
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 md:gap-4">
      {items.map((item, idx) => {
        const Icon = item.icon;
        const palette = item.colorClass || SOLID_PALETTES[idx % SOLID_PALETTES.length];
        return (
          <button
            key={item.label}
            type="button"
            onClick={() => handleClick(item)}
            className={`group text-left rounded-xl p-4 md:p-5 shadow-sm transition-all duration-200 active:scale-[0.98] flex flex-col justify-between ${palette}`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="w-10 h-10 rounded-lg bg-white/15 flex items-center justify-center shrink-0">
                {Icon && <Icon className="w-5 h-5 text-white" />}
              </div>
              <ArrowUpRight className="w-4 h-4 text-white/75 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </div>

            <div className="mt-4">
              <p className="text-2xl md:text-3xl font-bold tracking-tight leading-none">
                {item.value}
              </p>
              <p className="text-xs font-semibold text-white/95 mt-1.5">
                {item.label}
              </p>
              {item.sub && (
                <p className="text-[11px] text-white/75 mt-0.5 truncate">
                  {item.sub}
                </p>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
