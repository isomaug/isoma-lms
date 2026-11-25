import { useEffect, useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import useSWR from "swr";
import { toast } from "sonner";
import {
  Bell,
  BookOpen,
  Check,
  CreditCard,
  GraduationCap,
  MessageSquare,
  ShieldAlert,
  Sparkles,
  Users
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

import { apiFetch, swrFetcher } from "@/api/client/apiClient";
import { useAuth } from "@/context/AuthContext";
import {
  isQuietHours,
  playNotificationSound,
} from "@/utils/notificationSound";

let globalSeenNotificationIds = new Set();

const categoryIcons = {
  course: BookOpen,
  payment: CreditCard,
  certificate: GraduationCap,
  achievement: Sparkles,
  message: MessageSquare,
  account: ShieldAlert,
  admin: ShieldAlert,
  system: Bell,
};

function relativeTime(value) {
  const seconds = Math.round((new Date(value).getTime() - Date.now()) / 1000);
  const formatter = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });
  if (Math.abs(seconds) < 60) return formatter.format(seconds, "second");
  const minutes = Math.round(seconds / 60);
  if (Math.abs(minutes) < 60) return formatter.format(minutes, "minute");
  const hours = Math.round(minutes / 60);
  if (Math.abs(hours) < 24) return formatter.format(hours, "hour");
  return formatter.format(Math.round(hours / 24), "day");
}

export default function NotificationBell() {
  const { me } = useAuth();
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const previousUnseenRef = useRef(null);
  const latestNotificationRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [teamAssignmentNotif, setTeamAssignmentNotif] = useState(null);
  const { data: countData, mutate: mutateCount } = useSWR(
    me ? "/api/notifications/unread-count/" : null,
    swrFetcher,
    { refreshInterval: 30000, revalidateOnFocus: true }
  );
  const { data: listData, mutate: mutateList } = useSWR(
    me ? "/api/notifications/?page_size=6" : null,
    swrFetcher,
    { refreshInterval: 30000, revalidateOnFocus: true }
  );
  const { data: preferences } = useSWR(
    me ? "/api/notifications/preferences/" : null,
    swrFetcher
  );

  useEffect(() => {
    if (!countData) return;
    const unseen = countData.unseen_count || 0;
    const previous = previousUnseenRef.current;
    previousUnseenRef.current = unseen;

    if (
      previous === null ||
      unseen <= previous ||
      !preferences?.sound_enabled ||
      isQuietHours(preferences)
    ) {
      return;
    }

    const play = async () => {
      const urgent = await apiFetch(
        "/api/notifications/?page_size=1&unread=true"
      )
        .then((response) => (response.ok ? response.json() : null))
        .then((payload) => payload?.results?.[0]?.priority === "urgent")
        .catch(() => false);
      playNotificationSound(preferences.sound_volume, urgent);
    };
    play();
  }, [countData, preferences]);

  useEffect(() => {
    const latest = listData?.results?.[0];
    if (!latest) return;
    if (latestNotificationRef.current === null) {
      latestNotificationRef.current = latest.id;
      globalSeenNotificationIds.add(latest.id);
      if (latest.title === "Team Assignment" && !latest.is_read) {
        setTeamAssignmentNotif(latest);
      }
      return;
    }
    if (
      latestNotificationRef.current !== latest.id &&
      !latest.is_read &&
      !globalSeenNotificationIds.has(latest.id)
    ) {
      latestNotificationRef.current = latest.id;
      globalSeenNotificationIds.add(latest.id);

      const isMeetingReadyNotice =
        latest.event_type === "meeting.created" ||
        latest.title?.toLowerCase().includes("meeting is ready") ||
        latest.message?.toLowerCase().includes("your meeting is ready");

      if (!isMeetingReadyNotice) {
        if (latest.title === "Team Assignment") {
          setTeamAssignmentNotif(latest);
        } else {
          const Icon = categoryIcons[latest.category] || Bell;
          toast(latest.title, {
            description: latest.message,
            icon: <Icon size={16} />,
            duration: 6000,
            action: latest.action_url
              ? { label: "View", onClick: () => navigate(latest.action_url) }
              : undefined,
          });
        }
      }
    }
    latestNotificationRef.current = latest.id;
  }, [listData, navigate]);

  useEffect(() => {
    const close = (event) => {
      if (!containerRef.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, []);

  if (!me) return null;

  const unreadCount = countData?.unread_count || 0;
  const notifications = listData?.results || [];

  const togglePanel = async () => {
    const nextOpen = !open;
    setOpen(nextOpen);
    if (nextOpen && countData?.unseen_count) {
      await apiFetch("/api/notifications/mark-seen/", { method: "POST" });
      mutateCount();
    }
  };

  const openNotification = async (notification) => {
    if (!notification.is_read) {
      await apiFetch(`/api/notifications/${notification.id}/read/`, {
        method: "POST",
      });
      await Promise.all([mutateCount(), mutateList()]);
    }
    setOpen(false);
    if (notification.action_url) navigate(notification.action_url);
  };

  const handleDismissTeamAssignment = async () => {
    if (teamAssignmentNotif) {
      await apiFetch(`/api/notifications/${teamAssignmentNotif.id}/read/`, { method: "POST" });
      setTeamAssignmentNotif(null);
      mutateCount();
      mutateList();
    }
  };

  const markAllRead = async () => {
    await apiFetch("/api/notifications/read-all/", { method: "POST" });
    await Promise.all([mutateCount(), mutateList()]);
  };

  return (
    <div
      ref={containerRef}
      className="relative shrink-0 font-['Inter',sans-serif]"
    >

      <button
        type="button"
        onClick={togglePanel}
        aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ""}`}
        aria-expanded={open}
        className="relative flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-foreground transition-colors hover:border-primary hover:text-primary"
      >
        <Bell className="h-4.5 w-4.5" />
        {unreadCount > 0 && (
          <span
            aria-live="polite"
            className="absolute -right-1.5 -top-1.5 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-extrabold text-white"
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <section
          aria-label="Recent notifications"
          className="fixed left-2 right-2 top-16 z-[100] overflow-hidden rounded-2xl border border-border bg-card text-card-foreground shadow-2xl sm:absolute sm:left-auto sm:right-0 sm:top-[calc(100%+0.65rem)] sm:w-[min(22rem,calc(100vw-1rem))]"
        >
          <header className="flex items-center justify-between border-b border-border px-4 py-3">
            <div>
              <h2 className="text-sm font-extrabold">Notifications</h2>
              <p className="text-xs text-muted-foreground">
                {unreadCount
                  ? `${unreadCount} unread`
                  : "You are all caught up"}
              </p>
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllRead}
                className="flex items-center gap-1 text-xs font-bold text-primary hover:underline"
              >
                <Check className="h-3.5 w-3.5" />
                Read all
              </button>
            )}
          </header>

          <div className="max-h-[min(28rem,70dvh)] overflow-y-auto">
            {notifications.length ? (
              notifications.map((notification) => {
                const Icon = categoryIcons[notification.category] || Bell;
                return (
                  <button
                    key={notification.id}
                    type="button"
                    onClick={() => openNotification(notification)}
                    className={`flex w-full gap-3 border-b border-border/70 px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-muted ${
                      notification.is_read ? "" : "bg-primary/5"
                    }`}
                  >
                    <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-start gap-2">
                        <strong className="min-w-0 flex-1 text-sm font-bold leading-snug">
                          {notification.title}
                        </strong>
                        {!notification.is_read && (
                          <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
                        )}
                      </span>
                      <span className="mt-0.5 line-clamp-2 block text-xs leading-relaxed text-muted-foreground">
                        {notification.message}
                      </span>
                      <span className="mt-1 block text-[11px] font-medium text-muted-foreground">
                        {relativeTime(notification.created_at)}
                      </span>
                    </span>
                  </button>
                );
              })
            ) : (
              <div className="px-6 py-10 text-center">
                <Bell className="mx-auto h-8 w-8 text-muted-foreground/50" />
                <p className="mt-3 text-sm font-bold">No notifications yet</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Important account and learning updates will appear here.
                </p>
              </div>
            )}
          </div>

          <Link
            to="/notifications"
            onClick={() => setOpen(false)}
            className="block border-t border-border px-4 py-3 text-center text-xs font-extrabold text-primary hover:bg-muted"
          >
            View all notifications
          </Link>
        </section>
      )}

      <AnimatePresence>
        {teamAssignmentNotif && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-background border rounded-2xl shadow-2xl flex flex-col items-center justify-center p-8 text-center font-['Poppins',sans-serif]"
            >
              <div className="w-16 h-16 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center mb-4">
                <Users className="w-8 h-8" />
              </div>

              <h2 className="text-2xl font-extrabold text-foreground tracking-tight mb-2">
                Team Assignment
              </h2>
              
              <p className="text-sm text-muted-foreground max-w-xs leading-relaxed mb-6 font-medium">
                {teamAssignmentNotif.message}
              </p>

              <div className="flex flex-col gap-3 w-full max-w-xs">
                <Button
                  type="button"
                  onClick={handleDismissTeamAssignment}
                  className="w-full bg-primary text-primary-foreground font-bold h-11 rounded-xl transition-all hover:bg-primary/90"
                >
                  Understood, moving now
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
