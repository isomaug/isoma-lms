import { MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export function TableRowMore({
  align = "end",
  className,
  contentClassName,
  children,
  label = "More",
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={label}
          className={cn(
            "inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            className
          )}
        >
          <MoreVertical className="h-4 w-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} className={cn("w-64", contentClassName)}>
        {children}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function TableRowMoreField({ label, children, className }) {
  return (
    <div className={cn("min-w-0 px-1 py-1", className)}>
      <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <div className="mt-0.5 text-sm text-foreground break-words">{children || "-"}</div>
    </div>
  );
}
