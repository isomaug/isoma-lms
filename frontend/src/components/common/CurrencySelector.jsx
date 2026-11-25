import { useState, useRef, useEffect } from "react";
import { useCurrency } from "@/context/CurrencyContext";
import { ChevronDown, Globe } from "lucide-react";

export default function CurrencySelector({ direction = "down" }) {
  const { currencies, activeCurrencyCode, setCurrency, loading } =
    useCurrency();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);
  const optionRefs = useRef([]);
  const initialFocusRef = useRef("selected");

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    function handleEscape(event) {
      if (event.key === "Escape" && isOpen) {
        setIsOpen(false);
        buttonRef.current?.focus();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || currencies.length === 0) return;

    const selectedIndex = Math.max(
      0,
      currencies.findIndex((currency) => currency.code === activeCurrencyCode)
    );
    const targetIndex =
      initialFocusRef.current === "first"
        ? 0
        : initialFocusRef.current === "last"
          ? currencies.length - 1
          : selectedIndex;

    const frame = window.requestAnimationFrame(() => {
      optionRefs.current[targetIndex]?.focus();
    });
    return () => window.cancelAnimationFrame(frame);
  }, [activeCurrencyCode, currencies, isOpen]);

  const closeMenuAndRestoreFocus = () => {
    setIsOpen(false);
    window.requestAnimationFrame(() => buttonRef.current?.focus());
  };

  const handleTriggerKeyDown = (event) => {
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;

    event.preventDefault();
    initialFocusRef.current = event.key === "ArrowUp" ? "last" : "first";
    setIsOpen(true);
  };

  const handleMenuKeyDown = (event) => {
    if (event.key === "Tab") {
      setIsOpen(false);
      return;
    }

    const currentIndex = optionRefs.current.findIndex(
      (option) => option === document.activeElement
    );
    let targetIndex = currentIndex;

    if (event.key === "ArrowDown") {
      targetIndex = (currentIndex + 1) % currencies.length;
    } else if (event.key === "ArrowUp") {
      targetIndex = (currentIndex - 1 + currencies.length) % currencies.length;
    } else if (event.key === "Home") {
      targetIndex = 0;
    } else if (event.key === "End") {
      targetIndex = currencies.length - 1;
    } else if (event.key === "Escape") {
      event.preventDefault();
      closeMenuAndRestoreFocus();
      return;
    } else {
      return;
    }

    event.preventDefault();
    optionRefs.current[targetIndex]?.focus();
  };

  if (loading) return <div className="h-11 w-20" aria-hidden="true" />;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => {
          initialFocusRef.current = "selected";
          setIsOpen(!isOpen);
        }}
        onKeyDown={handleTriggerKeyDown}
        aria-label={`Choose currency. Current currency: ${activeCurrencyCode}`}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        className="flex h-11 min-w-20 items-center justify-center gap-1.5 rounded-md px-2.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Globe className="h-4 w-4" aria-hidden="true" />
        <span className="font-medium text-xs">{activeCurrencyCode}</span>
        <ChevronDown
          className={`h-3 w-3 opacity-50 transition-transform ${isOpen ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>

      {isOpen && (
        <div
          role="menu"
          aria-label="Available currencies"
          onKeyDown={handleMenuKeyDown}
          className={`absolute right-0 z-[100] max-h-64 w-40 overflow-y-auto rounded-md border border-border bg-background py-1 shadow-lg ${
            direction === "up" ? "bottom-full mb-1" : "top-full mt-1"
          }`}
        >
          {currencies.map((currency, index) => (
            <button
              key={currency.code}
              ref={(element) => {
                optionRefs.current[index] = element;
              }}
              type="button"
              role="menuitemradio"
              aria-checked={activeCurrencyCode === currency.code}
              tabIndex={activeCurrencyCode === currency.code ? 0 : -1}
              onClick={() => {
                setCurrency(currency.code);
                closeMenuAndRestoreFocus();
              }}
              className={`flex min-h-11 w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring ${
                activeCurrencyCode === currency.code
                  ? "bg-primary/10 font-medium text-primary"
                  : "text-foreground"
              }`}
            >
              <span>{currency.code}</span>
              <span className="text-muted-foreground text-xs">
                {currency.symbol}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
