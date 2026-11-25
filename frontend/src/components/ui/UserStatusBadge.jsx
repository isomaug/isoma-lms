import React from "react";
import { formatDistanceToNowStrict, format } from "date-fns";

export function formatLastSeen(lastSeen) {
  if (!lastSeen) return null;
  try {
    const d = new Date(lastSeen);
    if (isNaN(d.getTime())) return null;
    return formatDistanceToNowStrict(d, { addSuffix: true });
  } catch (e) {
    return null;
  }
}

export function formatLastSeenFull(lastSeen) {
  if (!lastSeen) return null;
  try {
    const d = new Date(lastSeen);
    if (isNaN(d.getTime())) return null;
    return format(d, "MMMM d, yyyy 'at' h:mm a");
  } catch (e) {
    return null;
  }
}

/**
 * Compact circular indicator for attaching to avatars or small badges.
 */
export function OnlineGlowDot({
  isOnline,
  size = "sm",
  className = "",
  title,
  neverLoggedIn = false,
}) {
  const sizeMap = {
    xs: "w-2 h-2",
    sm: "w-2.5 h-2.5",
    md: "w-3 h-3",
    lg: "w-3.5 h-3.5",
  };

  const dotSize = sizeMap[size] || sizeMap.sm;

  if (isOnline) {
    return (
      <span
        className={`relative inline-flex items-center justify-center shrink-0 ${className}`}
        title={title || "Online now"}
      >
        <span
          className={`animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60`}
        />
        <span
          className={`relative inline-flex rounded-full ${dotSize} bg-emerald-500 ring-2 ring-background`}
        />
      </span>
    );
  }

  if (neverLoggedIn) {
    return (
      <span
        className={`relative inline-flex items-center justify-center shrink-0 ${className}`}
        title={title || "Never logged in"}
      >
        <span
          className={`relative inline-flex rounded-full ${dotSize} bg-muted-foreground/40 ring-1 ring-background`}
        />
      </span>
    );
  }

  return (
    <span
      className={`relative inline-flex items-center justify-center shrink-0 ${className}`}
      title={title || "Offline"}
    >
      <span
        className={`relative inline-flex rounded-full ${dotSize} bg-slate-400 dark:bg-slate-500 ring-1 ring-background`}
      />
    </span>
  );
}

/**
 * Full UserStatusBadge showing dot and label:
 * - Online: Green dot + "Online"
 * - Offline with lastSeen: Gray dot + "Last seen {relativeTime}"
 * - Never accessed: Neutral dot + "Never logged in"
 */
export default function UserStatusBadge({
  isOnline,
  lastSeen,
  size = "sm",
  showText = true,
  className = "",
  showBackground = false,
}) {
  const relativeTime = formatLastSeen(lastSeen);
  const fullTime = formatLastSeenFull(lastSeen);
  const neverLoggedIn = !lastSeen;

  const hoverTitle = isOnline
    ? "Currently online"
    : fullTime
    ? `Last active: ${fullTime}`
    : "Never logged in";

  if (!showText) {
    return (
      <OnlineGlowDot
        isOnline={isOnline}
        size={size}
        title={hoverTitle}
        neverLoggedIn={neverLoggedIn}
        className={className}
      />
    );
  }

  if (isOnline) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 select-none shrink-0 ${
          showBackground ? "px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30" : ""
        } ${className}`}
        title={hoverTitle}
      >
        <OnlineGlowDot isOnline={true} size="xs" />
        <span>Online</span>
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground select-none shrink-0 ${
        showBackground ? "px-2 py-0.5 rounded-full bg-muted/60 border border-border" : ""
      } ${className}`}
      title={hoverTitle}
    >
      <OnlineGlowDot isOnline={false} size="xs" neverLoggedIn={neverLoggedIn} />
      <span className="truncate">
        {neverLoggedIn ? "Never logged in" : `Last seen ${relativeTime}`}
      </span>
    </span>
  );
}
