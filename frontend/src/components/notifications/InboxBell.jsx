import { Link } from "react-router-dom";
import useSWR from "swr";
import { Mail } from "lucide-react";

import { swrFetcher } from "@/api/client/apiClient";
import { useAuth } from "@/context/AuthContext";

export default function InboxBell() {
  const { me } = useAuth();
  
  // Fetch only the count for MESSAGE category
  const { data: countData } = useSWR(
    me ? "/api/notifications/unread-count/?category=message" : null,
    swrFetcher,
    { refreshInterval: 30000, revalidateOnFocus: true }
  );

  if (!me) return null;

  const unreadCount = countData?.unread_count || 0;

  return (
    <div className="relative shrink-0 font-['Inter',sans-serif]">
      <Link
        to="/dashboard/inbox"
        aria-label={`Inbox${unreadCount ? `, ${unreadCount} unread` : ""}`}
        className="relative flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-foreground transition-colors hover:border-primary hover:text-primary"
      >
        <Mail className="h-4.5 w-4.5" />
        {unreadCount > 0 && (
          <span
            aria-live="polite"
            className="absolute -right-1.5 -top-1.5 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-extrabold text-white"
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </Link>
    </div>
  );
}
