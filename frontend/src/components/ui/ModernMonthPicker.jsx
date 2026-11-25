import React, { useState } from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

/** Rounded month/year picker. onChange receives (monthIndex, year). */
export default function ModernMonthPicker({ month, year, onChange, className = "", disabled = false }) {
  const [open, setOpen] = useState(false);
  const [viewYear, setViewYear] = useState(year);

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={(next) => {
      if (disabled) return;
      setOpen(next);
      if (next) setViewYear(year);
    }}>
      <PopoverPrimitive.Trigger asChild>
        <button type="button" disabled={disabled} aria-label="Choose month and year" className={cn(
          "inline-flex h-9 min-w-0 items-center justify-center gap-2 rounded-2xl border border-border bg-card px-3 text-sm font-bold text-foreground shadow-sm transition-colors hover:border-foreground/25 hover:bg-secondary focus-visible:outline-none focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}>
          <CalendarDays className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span className="truncate">{month === -1 ? `All months · ${year}` : `${MONTHS[month]} ${year}`}</span>
        </button>
      </PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content align="center" sideOffset={8} className="z-[200] w-[min(100vw-1.5rem,20rem)] rounded-2xl border border-border bg-popover p-3 text-popover-foreground shadow-xl outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
          <div className="mb-3 flex items-center justify-between gap-2">
            <button type="button" onClick={() => setViewYear((value) => value - 1)} aria-label="Previous year" className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-secondary text-foreground hover:bg-secondary/80"><ChevronLeft className="h-4 w-4" /></button>
            <span className="text-base font-extrabold tabular-nums">{viewYear}</span>
            <button type="button" onClick={() => setViewYear((value) => value + 1)} aria-label="Next year" className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-secondary text-foreground hover:bg-secondary/80"><ChevronRight className="h-4 w-4" /></button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {MONTHS.map((name, index) => {
              const selected = year === viewYear && month === index;
              return <button key={name} type="button" onClick={() => { onChange?.(index, viewYear); setOpen(false); }} className={cn("h-11 rounded-xl text-sm font-semibold transition-colors", selected ? "bg-primary text-primary-foreground" : "bg-muted text-foreground hover:bg-primary/10")}>{name.slice(0, 3)}</button>;
            })}
          </div>
          <div className="mt-3 flex justify-between border-t border-border pt-2.5">
            <button type="button" onClick={() => { const today = new Date(); onChange?.(today.getMonth(), today.getFullYear()); setOpen(false); }} className="rounded-full bg-muted px-3 py-1.5 text-xs font-bold text-foreground hover:bg-foreground/10">This month</button>
            <button type="button" onClick={() => { onChange?.(-1, viewYear); setOpen(false); }} className="rounded-full bg-muted px-3 py-1.5 text-xs font-bold text-muted-foreground hover:bg-foreground/10 hover:text-foreground">All months</button>
          </div>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}
