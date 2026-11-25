import React from "react";
import { Sun, Moon, Monitor } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

const MODES = [
  { value: "light", label: "Light theme", icon: Sun },
  { value: "dark", label: "Dark theme", icon: Moon },
  { value: "system", label: "System theme", icon: Monitor },
];

/**
 * Clean 3-button segmented theme switcher (Light / Dark / System) in Isoma Royal Blue.
 */
export default function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();

  return (
    <div
      role="group"
      aria-label="Color theme"
      className="inline-flex items-center rounded-lg border border-gray-200 bg-gray-50 p-0.5 gap-0.5"
    >
      {MODES.map((m) => {
        const Icon = m.icon;
        const active = theme === m.value;
        return (
          <button
            key={m.value}
            type="button"
            onClick={() => setTheme(m.value)}
            title={m.label}
            aria-label={m.label}
            aria-pressed={active}
            className={`inline-flex items-center justify-center w-7 h-7 rounded-md transition-colors ${
              active
                ? "bg-primary text-white shadow-sm"
                : "text-gray-500 hover:text-primary hover:bg-white"
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
          </button>
        );
      })}
    </div>
  );
}
