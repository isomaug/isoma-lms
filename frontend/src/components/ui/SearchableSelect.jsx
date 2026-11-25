import * as React from "react"
import * as PopoverPrimitive from "@radix-ui/react-popover"
import { Check, ChevronDown, Search } from "lucide-react"
import { cn } from "@/lib/utils"

const Popover = PopoverPrimitive.Root
const PopoverTrigger = PopoverPrimitive.Trigger
const PopoverContent = React.forwardRef(({ className, align = "start", sideOffset = 4, usePortal = false, ...props }, ref) => {
  const content = (
    <PopoverPrimitive.Content
      ref={ref}
      align={align}
      sideOffset={sideOffset}
      className={cn(
        "z-[250] w-72 rounded-md border bg-popover p-0 text-popover-foreground shadow-md outline-none pointer-events-auto data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        className
      )}
      {...props}
    />
  );
  if (usePortal) {
    return <PopoverPrimitive.Portal>{content}</PopoverPrimitive.Portal>;
  }
  return content;
});
PopoverContent.displayName = PopoverPrimitive.Content.displayName

export function SearchableSelect({ 
  value, 
  onChange, 
  children,
  placeholder = "Select an option...", 
  searchPlaceholder = "Search...",
  emptyText = "No results found.",
  className,
  contentClassName,
  disabled = false,
  required = false,
  name,
  ariaLabel,
  side = "bottom",
  align = "start",
  sideOffset = 4,
  wrapLabel = false,
  allowCustom = true,
  usePortal = false,
}) {
  const [open, setOpen] = React.useState(false)
  const [searchValue, setSearchValue] = React.useState("")
  const [highlightedIndex, setHighlightedIndex] = React.useState(0)
  const inputRef = React.useRef(null)
  
  // Parse children into options array
  const options = React.useMemo(() => {
    const opts = [];
    const seen = new Set();
    const extract = (elements) => {
      React.Children.forEach(elements, (child) => {
        if (!child) return;
        if (React.isValidElement(child) && child.type === 'option') {
          const val = String(child.props.value ?? "");
          const key = val.trim().toLowerCase();
          if (!seen.has(key)) {
            seen.add(key);
            opts.push({
              value: child.props.value,
              label: child.props.children || child.props.value,
            });
          }
        } else if (React.isValidElement(child) && child.props && child.props.children) {
          extract(child.props.children);
        } else if (Array.isArray(child)) {
          extract(child);
        }
      });
    };
    extract(children);
    return opts;
  }, [children]);
  
  const selectedOption = React.useMemo(() => {
    if (value === undefined || value === null) return undefined;
    return options.find((opt) => String(opt.value).trim().toLowerCase() === String(value).trim().toLowerCase());
  }, [options, value])

  React.useEffect(() => {
    if (open) {
      setHighlightedIndex(0);
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    } else {
      setSearchValue("");
      setHighlightedIndex(0);
    }
  }, [open]);

  const handleSelect = React.useCallback((val) => {
    if (onChange) {
      onChange({ target: { name, value: val } });
    }
    setOpen(false);
    setSearchValue("");
  }, [onChange, name]);

  const query = searchValue.trim().toLowerCase()
  const filteredOptions = React.useMemo(() => {
    if (!query) return options
    return options.filter((opt) =>
      String(opt.label || opt.value || "").toLowerCase().includes(query)
    )
  }, [options, query])

  const exactMatch = options.some(
    (opt) => String(opt.label || opt.value || "").trim().toLowerCase() === query
  )
  const showCustomOption = allowCustom && query.length > 0 && !exactMatch

  return (
    <Popover open={open} onOpenChange={setOpen} modal={false}>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          role="combobox"
          aria-label={ariaLabel}
          aria-expanded={open}
          className={cn(
            "flex w-full min-w-0 max-w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-50",
            wrapLabel ? "h-auto min-h-8 py-1.5" : "h-10",
            className
          )}
        >
          <span
            className={cn(
              "flex-1 text-left min-w-0 max-w-full truncate",
              wrapLabel && "whitespace-normal break-words [overflow-wrap:anywhere] leading-snug text-[10px] sm:text-[11px] font-semibold"
            )}
            title={selectedOption ? String(selectedOption.label) : (value || undefined)}
          >
            {selectedOption ? selectedOption.label : value ? value : <span className="text-muted-foreground">{placeholder}</span>}
          </span>
          <ChevronDown className="ml-1.5 h-3.5 w-3.5 shrink-0 opacity-50" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        usePortal={usePortal}
        className={cn(
          "p-0 shadow-md z-[250] w-[var(--radix-popover-trigger-width)] min-w-[200px] max-w-[var(--radix-popover-content-available-width,min(100vw-1.5rem,24rem))] overflow-hidden bg-popover border border-border rounded-lg pointer-events-auto",
          contentClassName
        )}
        side={side}
        align={align}
        sideOffset={sideOffset}
        collisionPadding={12}
        avoidCollisions
        onOpenAutoFocus={(e) => {
          e.preventDefault();
          setTimeout(() => inputRef.current?.focus(), 15);
        }}
        onCloseAutoFocus={(e) => {
          e.preventDefault();
        }}
      >
        <div 
          className="flex items-center border-b border-border px-3 py-2 bg-muted/20"
          onPointerDown={(e) => e.stopPropagation()}
        >
          <Search className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
          <input
            ref={inputRef}
            type="text"
            placeholder={searchPlaceholder}
            value={searchValue}
            onClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
            onChange={(e) => {
              setSearchValue(e.target.value);
              setHighlightedIndex(0);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                e.stopPropagation();
                if (filteredOptions.length > 0) {
                  const targetIdx = highlightedIndex >= 0 && highlightedIndex < filteredOptions.length ? highlightedIndex : 0;
                  handleSelect(filteredOptions[targetIdx].value);
                } else if (showCustomOption) {
                  handleSelect(searchValue.trim());
                }
              } else if (e.key === "ArrowDown") {
                e.preventDefault();
                setHighlightedIndex((prev) => (prev + 1 < filteredOptions.length ? prev + 1 : 0));
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : filteredOptions.length - 1));
              } else if (e.key === "Escape") {
                e.preventDefault();
                setOpen(false);
              }
            }}
            className="flex h-7 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground text-foreground"
          />
          {searchValue && (
            <button
              type="button"
              onPointerDown={(e) => {
                e.preventDefault();
                setSearchValue("");
                inputRef.current?.focus();
              }}
              className="text-xs text-muted-foreground hover:text-foreground px-1"
            >
              ✕
            </button>
          )}
        </div>
        <div className="max-h-[220px] overflow-y-auto p-1 text-sm">
          {showCustomOption && (
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => handleSelect(searchValue.trim())}
              className="w-full text-left px-3 py-2 rounded-md hover:bg-muted font-medium text-primary text-xs flex items-center justify-between transition-colors border-b border-border/50 mb-1 cursor-pointer"
            >
              <span className="truncate">+ Use &ldquo;{searchValue.trim()}&rdquo;</span>
              <span className="text-[10px] text-muted-foreground shrink-0 ml-2">Custom</span>
            </button>
          )}

          {filteredOptions.length === 0 && !showCustomOption ? (
            <div className="py-6 text-center text-xs text-muted-foreground">
              {emptyText}
            </div>
          ) : (
            filteredOptions.map((option, idx) => {
              const isSelected = String(value || "").trim().toLowerCase() === String(option.value || "").trim().toLowerCase();
              const isHighlighted = idx === highlightedIndex;
              return (
                <button
                  key={option.value !== undefined ? option.value : idx}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleSelect(option.value)}
                  onMouseEnter={() => setHighlightedIndex(idx)}
                  className={cn(
                    "w-full text-left px-3 py-2 rounded-md text-xs sm:text-sm flex items-center justify-between transition-colors cursor-pointer",
                    isSelected
                      ? "bg-primary text-primary-foreground font-semibold"
                      : isHighlighted
                        ? "bg-muted/80 text-foreground"
                        : "hover:bg-muted text-foreground"
                  )}
                >
                  <span
                    className={cn(
                      "min-w-0 flex-1",
                      wrapLabel
                        ? "whitespace-normal break-words [overflow-wrap:anywhere] leading-snug text-[10px] sm:text-[11px]"
                        : "truncate"
                    )}
                    title={String(option.label)}
                  >
                    {option.label}
                  </span>
                  {isSelected && (
                    <Check className="h-4 w-4 shrink-0 ml-2 text-primary-foreground" />
                  )}
                </button>
              );
            })
          )}
        </div>
      </PopoverContent>
      <input type="hidden" name={name} value={value || ""} required={required} />
    </Popover>
  );
}
