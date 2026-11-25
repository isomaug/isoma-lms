import * as React from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { Check, ChevronDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * UniversalSelect - Single & multi-select searchable dropdown for all Isoma LMS forms and toolbars.
 * Modeled on SearchableSelect (Radix Popover) with Isoma Royal Blue (#004880) styling.
 */
export function UniversalSelect({
  value,
  onChange,
  options = [],
  multiple = false,
  minSelected = 0,
  placeholder = "Select an option...",
  searchPlaceholder = "Search...",
  emptyText = "No matching options.",
  searchable = true,
  className,
  contentClassName,
  disabled = false,
  align = "start",
  sideOffset = 4,
  usePortal = true,
  ariaLabel,
}) {
  const [open, setOpen] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState("");
  const inputRef = React.useRef(null);

  React.useEffect(() => {
    if (open && searchable) {
      const timer = setTimeout(() => inputRef.current?.focus(), 30);
      return () => clearTimeout(timer);
    }
    if (!open) {
      setSearchValue("");
    }
  }, [open, searchable]);

  const normalizedOptions = React.useMemo(
    () =>
      options.map((opt) =>
        typeof opt === "string"
          ? { value: opt, label: opt }
          : { value: opt.value, label: opt.label ?? opt.value }
      ),
    [options]
  );

  const selectedValues = React.useMemo(() => {
    if (multiple) {
      return Array.isArray(value) ? value : value ? [value] : [];
    }
    return value !== undefined && value !== null && value !== "" ? [value] : [];
  }, [value, multiple]);

  const filteredOptions = React.useMemo(() => {
    const q = searchValue.trim().toLowerCase();
    if (!q) return normalizedOptions;
    return normalizedOptions.filter(
      (opt) =>
        String(opt.label).toLowerCase().includes(q) ||
        String(opt.value).toLowerCase().includes(q)
    );
  }, [normalizedOptions, searchValue]);

  const handleToggle = (optValue) => {
    if (!onChange) return;
    if (multiple) {
      const exists = selectedValues.includes(optValue);
      if (exists && selectedValues.length <= minSelected) return;
      const next = exists
        ? selectedValues.filter((v) => v !== optValue)
        : [...selectedValues, optValue];
      onChange(next);
    } else {
      onChange(optValue);
      setOpen(false);
    }
  };

  const triggerLabel = React.useMemo(() => {
    if (selectedValues.length === 0) return null;
    if (!multiple) {
      const found = normalizedOptions.find((o) => o.value === selectedValues[0]);
      return found ? found.label : selectedValues[0];
    }
    const labels = selectedValues.map((v) => {
      const found = normalizedOptions.find((o) => o.value === v);
      return found ? found.label : v;
    });
    if (labels.length === 1) return labels[0];
    return `${labels[0]} +${labels.length - 1} more`;
  }, [selectedValues, normalizedOptions, multiple]);

  const popoverBody = (
    <PopoverPrimitive.Content
      align={align}
      sideOffset={sideOffset}
      collisionPadding={12}
      avoidCollisions
      style={{ width: "var(--radix-popover-trigger-width)" }}
      className={cn(
        "z-[250] box-border overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg outline-none pointer-events-auto",
        contentClassName
      )}
    >
      {searchable && (
        <div className="flex w-full items-center border-b border-gray-100 px-2.5 py-2 bg-white">
          <Search className="w-3.5 h-3.5 text-gray-400 mr-2 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder={searchPlaceholder}
            className="flex-1 min-w-0 w-full bg-transparent text-xs text-gray-800 placeholder:text-gray-400 focus:outline-none"
          />
        </div>
      )}

      <div className="max-h-60 overflow-y-auto p-1">
        {filteredOptions.length === 0 ? (
          <p className="py-4 text-center text-xs text-gray-400">{emptyText}</p>
        ) : (
          filteredOptions.map((opt) => {
            const isSelected = selectedValues.includes(opt.value);
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => handleToggle(opt.value)}
                className={cn(
                  "flex w-full items-center justify-between gap-2 rounded-md px-2.5 py-2 text-left text-xs transition-colors",
                  isSelected
                    ? "text-primary font-bold bg-gray-50"
                    : "text-gray-700 font-medium hover:bg-gray-50 hover:text-primary"
                )}
              >
                <span className="truncate">{opt.label}</span>
                {isSelected && <Check className="w-3.5 h-3.5 text-primary shrink-0" />}
              </button>
            );
          })
        )}
      </div>
    </PopoverPrimitive.Content>
  );

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={setOpen} modal={false}>
      <PopoverPrimitive.Trigger asChild>
        <button
          type="button"
          disabled={disabled}
          role="combobox"
          aria-label={ariaLabel}
          aria-expanded={open}
          className={cn(
            "flex w-full min-w-0 items-center justify-between gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-800 transition-colors hover:border-gray-300 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
        >
          <span className="truncate text-left flex-1">
            {triggerLabel ? (
              <span className={multiple ? "font-semibold text-gray-900" : ""}>
                {triggerLabel}
              </span>
            ) : (
              <span className="text-gray-400">{placeholder}</span>
            )}
          </span>
          <ChevronDown
            className={cn(
              "w-3.5 h-3.5 text-gray-400 shrink-0 transition-transform duration-150",
              open && "rotate-180 text-primary"
            )}
          />
        </button>
      </PopoverPrimitive.Trigger>
      {usePortal ? (
        <PopoverPrimitive.Portal>{popoverBody}</PopoverPrimitive.Portal>
      ) : (
        popoverBody
      )}
    </PopoverPrimitive.Root>
  );
}

export default UniversalSelect;
