import React, { useMemo, useState } from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  parseISO,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/utils";

function toISODate(d) {
  if (!d || Number.isNaN(d.getTime())) return "";
  return format(d, "yyyy-MM-dd");
}

function parseValue(value) {
  if (!value) return null;
  try {
    const d = typeof value === "string" ? parseISO(value) : value;
    return Number.isNaN(d.getTime()) ? null : d;
  } catch {
    return null;
  }
}

/**
 * Modern rounded date picker. Value/onChange use YYYY-MM-DD strings.
 */
export default function ModernDatePicker({
  value = "",
  onChange,
  placeholder = "Pick a date",
  className = "",
  disabled = false,
  allowClear = true,
  min,
  max,
}) {
  const [open, setOpen] = useState(false);
  const selected = parseValue(value);
  const [viewMonth, setViewMonth] = useState(() => selected || new Date());

  const minDate = parseValue(min);
  const maxDate = parseValue(max);

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(viewMonth), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(viewMonth), { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [viewMonth]);

  const isDisabledDay = (day) => {
    if (minDate && day < new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate())) return true;
    if (maxDate && day > new Date(maxDate.getFullYear(), maxDate.getMonth(), maxDate.getDate())) return true;
    return false;
  };

  const handleSelect = (day) => {
    if (isDisabledDay(day)) return;
    onChange?.(toISODate(day));
    setOpen(false);
  };

  const display = selected
    ? format(selected, "d MMM yyyy")
    : placeholder;

  return (
    <PopoverPrimitive.Root
      open={open}
      onOpenChange={(next) => {
        if (disabled) return;
        setOpen(next);
        if (next) setViewMonth(selected || new Date());
      }}
    >
      <PopoverPrimitive.Trigger asChild>
        <button
          type="button"
          disabled={disabled}
          className={cn(
            "tt-modern-date-trigger group inline-flex h-10 w-full max-w-[11rem] items-center gap-1.5 rounded-2xl border border-border bg-card px-2.5 text-left text-sm font-semibold text-foreground transition-colors",
            "hover:border-foreground/25 hover:bg-secondary",
            "focus-visible:outline-none focus-visible:border-primary",
            "disabled:cursor-not-allowed disabled:opacity-50",
            !selected && "text-muted-foreground font-medium",
            className
          )}
        >
          <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-secondary text-foreground border border-border">
            <CalendarIcon className="h-3.5 w-3.5 text-foreground" strokeWidth={2.25} />
          </span>
          <span className="min-w-0 flex-1 truncate">{display}</span>
          {allowClear && selected && !disabled && (
            <span
              role="button"
              tabIndex={-1}
              className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-foreground/70 hover:bg-secondary hover:text-foreground"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onChange?.("");
              }}
              aria-label="Clear date"
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
            "z-[200] w-[min(100vw-1.5rem,20rem)] rounded-2xl border border-border bg-popover p-3 text-popover-foreground shadow-xl outline-none",
            "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
          )}
        >
          <div className="mb-3 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => setViewMonth((m) => subMonths(m, 1))}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border bg-secondary text-foreground hover:bg-secondary/80 transition-colors"
              aria-label="Previous month"
            >
              <ChevronLeft className="h-4 w-4 text-foreground" strokeWidth={2.25} />
            </button>
            <div className="text-sm font-extrabold tracking-tight text-foreground">
              {format(viewMonth, "MMMM yyyy")}
            </div>
            <button
              type="button"
              onClick={() => setViewMonth((m) => addMonths(m, 1))}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border bg-secondary text-foreground hover:bg-secondary/80 transition-colors"
              aria-label="Next month"
            >
              <ChevronRight className="h-4 w-4 text-foreground" strokeWidth={2.25} />
            </button>
          </div>

          <div className="mb-1.5 grid grid-cols-7 gap-1">
            {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((d) => (
              <div
                key={d}
                className="h-8 text-center text-[10px] font-bold uppercase tracking-wide text-muted-foreground"
              >
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {days.map((day) => {
              const inMonth = isSameMonth(day, viewMonth);
              const selectedDay = selected && isSameDay(day, selected);
              const today = isToday(day);
              const disabledDay = isDisabledDay(day);
              return (
                <button
                  key={day.toISOString()}
                  type="button"
                  disabled={disabledDay}
                  onClick={() => handleSelect(day)}
                  className={cn(
                    "h-9 w-full rounded-xl text-sm font-semibold transition-colors",
                    !inMonth && "text-muted-foreground/40",
                    inMonth && !selectedDay && "text-foreground hover:bg-muted",
                    today && !selectedDay && "border border-primary bg-primary/10",
                    selectedDay && "bg-primary text-primary-foreground hover:bg-primary",
                    disabledDay && "opacity-30 cursor-not-allowed hover:bg-transparent"
                  )}
                >
                  {format(day, "d")}
                </button>
              );
            })}
          </div>

          <div className="mt-3 flex items-center justify-between gap-2 border-t border-border pt-2.5">
            <button
              type="button"
              onClick={() => {
                const t = new Date();
                setViewMonth(t);
                handleSelect(t);
              }}
              className="rounded-full bg-muted px-3 py-1.5 text-xs font-bold text-foreground hover:bg-foreground/10 transition-colors"
            >
              Today
            </button>
            {allowClear && (
              <button
                type="button"
                onClick={() => {
                  onChange?.("");
                  setOpen(false);
                }}
                className="rounded-full bg-muted px-3 py-1.5 text-xs font-bold text-muted-foreground hover:bg-foreground/10 hover:text-foreground transition-colors"
              >
                Clear
              </button>
            )}
          </div>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}
