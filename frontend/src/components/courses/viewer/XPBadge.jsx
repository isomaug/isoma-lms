import React from "react";
import { FaStar } from "react-icons/fa";

export default function XPBadge({ xpData }) {
  if (!xpData) return null;

  const { total_xp, level, level_title } = xpData;

  // Max 5 stars
  const displayLevel = Math.min(level, 5);

  return (
    <>
      {/* Mobile Compact View */}
      <div className="flex sm:hidden items-center gap-1 bg-amber-500/10 border border-amber-500/30 rounded-lg px-2 py-1 text-amber-500 font-extrabold text-[11px] shrink-0">
        <FaStar className="w-3 h-3 text-amber-500" />
        <span>{total_xp} XP</span>
      </div>

      {/* Desktop Full View */}
      <div className="hidden sm:flex items-center gap-3 bg-card border border-border rounded-full px-4 py-1.5 shadow-sm hover:border-amber-500/30 transition-colors shrink-0">
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <FaStar
              key={i}
              className={`w-3.5 h-3.5 transition-all duration-500 ${
                i < displayLevel 
                  ? "text-amber-500 drop-shadow-[0_0_4px_rgba(245,158,11,0.8)] scale-110" 
                  : "text-muted-foreground/20 scale-90"
              }`}
            />
          ))}
        </div>

        <div className="flex flex-col border-l border-border pl-2.5 text-left">
          <span className="text-[10px] font-bold text-foreground uppercase tracking-wider leading-none mb-0.5 line-clamp-1">
            {level_title}
          </span>
          <span className="text-[10px] font-bold text-amber-500 leading-none">
            {total_xp} XP
          </span>
        </div>
      </div>
    </>
  );
}
