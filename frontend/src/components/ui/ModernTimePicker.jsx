import React, { useEffect, useMemo, useRef, useState } from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { Clock, X } from "lucide-react";
import { cn } from "@/lib/utils";

function parseTime(value) {
  if (!value || typeof value !== "string") return { h: null, m: null };
  const m = value.trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!m) return { h: null, m: null };
  const h = Math.min(23, Math.max(0, parseInt(m[1], 10)));
  const min = Math.min(59, Math.max(0, parseInt(m[2], 10)));
  if (Number.isNaN(h) || Number.isNaN(min)) return { h: null, m: null };
  return { h, m: min };
}

function formatTime(h, m) {
  if (h == null || m == null) return "";
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function formatDisplay(h, m) {
  if (h == null || m == null) return "";
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, "0")} ${period}`;
}

function TimeColumn({ label, values, selected, onSelect }) {
  const listRef = useRef(null);

  useEffect(() => {
    if (selected == null || !listRef.current) return;
    const el = listRef.current.querySelector(`[data-val="${selected}"]`);
    if (el) {
      el.scrollIntoView({ block: "center", behavior: "auto" });
    }
  }, [selected]);

  return (
    <div className="flex min-w-0 flex-1 flex-col">
      <div className="mb-1.5 text-center text-[10px] font-extrabold uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      <div
        ref={listRef}
        className="h-48 overflow-y-auto overscroll-contain rounded-xl border border-border bg-background p-1"
      >
        {values.map((v) => {
          const active = selected === v;
          return (
            <button
              key={v}
              type="button"
              data-val={v}
              onClick={() => onSelect(v)}
              className={cn(
                "flex h-9 w-full items-center justify-center rounded-lg text-sm font-bold transition-colors",
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground hover:bg-muted"
              )}
            >
              {String(v).padStart(2, "0")}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Modern rounded time picker. Value/onChange use "HH:mm" (24h).
 * Solid colors only - no glow effects.
 */
export default function ModernTimePicker({
  value = "",
  onChange,
  placeholder = "Pick a time",
  className = "",
  disabled = false,
  allowClear = true,
  minuteStep = 5,
}) {
  const [open, setOpen] = useState(false);
  const parsed = parseTime(value);
  const [draftH, setDraftH] = useState(parsed.h ?? 8);
  const [draftM, setDraftM] = useState(
    parsed.m != null ? parsed.m - (parsed.m % minuteStep) : 0
  );

  const hours = useMemo(() => Array.from({ length: 24 }, (_, i) => i), []);
  const minutes = useMemo(
    () => Array.from({ length: Math.floor(60 / minuteStep) }, (_, i) => i * minuteStep),
    [minuteStep]
  );

  const display = parsed.h != null ? formatDisplay(parsed.h, parsed.m) : placeholder;

  const apply = (h, m) => {
    onChange?.(formatTime(h, m));
  };

  return (
    <PopoverPrimitive.Root
      open={open}
      onOpenChange={(next) => {
        if (disabled) return;
        setOpen(next);
        if (next) {
          const p = parseTime(value);
          setDraftH(p.h ?? 8);
          setDraftM(p.m != null ? p.m - (p.m % minuteStep) : 0);
        }
      }}
    >
      <PopoverPrimitive.Trigger asChild>
        <button
          type="button"
          disabled={disabled}
          className={cn(
            "inline-flex h-10 w-full max-w-[9.75rem] items-center gap-1.5 rounded-2xl border border-border bg-card px-2.5 text-left text-sm font-semibold text-foreground",
            "hover:border-foreground/30 hover:bg-secondary",
            "focus-visible:outline-none focus-visible:border-primary",
            "disabled:cursor-not-allowed disabled:opacity-50",
            !value && "text-muted-foreground font-medium",
            className
          )}
        >
          <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-secondary text-foreground border border-border">
            <Clock className="h-3.5 w-3.5 text-foreground" strokeWidth={2.25} />
          </span>
          <span className="min-w-0 flex-1 truncate tabular-nums">{display}</span>
          {allowClear && value && !disabled && (
            <span
              role="button"
              tabIndex={-1}
              className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-foreground/70 hover:bg-secondary hover:text-foreground"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onChange?.("");
              }}
              aria-label="Clear time"
            >
              <X className="h-3 w-3 text-foreground" strokeWidth={2.25} />
            </span>
          )}
        </button>
      </PopoverPrimitive.Trigger>

      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          align="start"
          sideOffset={8}
          className={cn(
            "z-[200] w-[min(100vw-1.5rem,18rem)] rounded-2xl border border-border bg-popover p-3 text-popover-foreground shadow-md outline-none",
            "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
          )}
        >
          <div className="mb-3 text-center text-sm font-extrabold text-foreground tabular-nums">
            {formatDisplay(draftH, draftM) || "--:--"}
          </div>

          <div className="flex gap-2">
            <TimeColumn
              label="Hour"
              values={hours}
              selected={draftH}
              onSelect={(h) => {
                setDraftH(h);
                apply(h, draftM);
              }}
            />
            <TimeColumn
              label="Min"
              values={minutes}
              selected={draftM}
              onSelect={(m) => {
                setDraftM(m);
                apply(draftH, m);
              }}
            />
          </div>

          <div className="mt-3 flex items-center justify-between gap-2 border-t border-border pt-2.5">
            <button
              type="button"
              onClick={() => {
                const now = new Date();
                const h = now.getHours();
                const m = now.getMinutes() - (now.getMinutes() % minuteStep);
                setDraftH(h);
                setDraftM(m);
                apply(h, m);
                setOpen(false);
              }}
              className="rounded-full bg-muted px-3 py-1.5 text-xs font-bold text-foreground hover:bg-foreground/10"
            >
              Now
            </button>
            <div className="flex gap-1.5">
              {allowClear && (
                <button
                  type="button"
                  onClick={() => {
                    onChange?.("");
                    setOpen(false);
                  }}
                  className="rounded-full bg-muted px-3 py-1.5 text-xs font-bold text-muted-foreground hover:bg-foreground/10 hover:text-foreground"
                >
                  Clear
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  apply(draftH, draftM);
                  setOpen(false);
                }}
                className="rounded-full bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground"
              >
                Done
              </button>
            </div>
          </div>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}
