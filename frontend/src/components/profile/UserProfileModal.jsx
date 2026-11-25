import { SearchableSelect } from "@/components/ui/SearchableSelect";
import React, { useState } from "react";
import useSWR from "swr";
import { apiFetch, swrFetcher } from "@/api/client/apiClient";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Shield, UserPlus, UserMinus } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import UserStatusBadge, { OnlineGlowDot, formatLastSeen } from "@/components/ui/UserStatusBadge";
import UserVerifiedBadge from "./UserVerifiedBadge";

function nameFromEmail(email) {
  if (!email || !String(email).includes("@")) return "";
  return String(email)
    .split("@")[0]
    .replace(/[._+\-]+/g, " ")
    .replace(/\d+/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

function profileDisplayName(user) {
  if (!user) return "User";
  const named =
    user.full_name ||
    `${user.first_name || ""} ${user.middle_name || ""} ${user.last_name || ""}`.replace(/\s+/g, " ").trim();
  if (named) return named;
  return nameFromEmail(user.email) || user.username || "User";
}

function cohortLabel(c) {
  const org = c.organization?.name || c.organization || "";
  return org ? `${c.name} (${org})` : c.name;
}

function uniqueSchoolNames(cohorts) {
  return [
    ...new Set(
      (cohorts || [])
        .map((c) => (typeof c.organization === "object" ? c.organization?.name : c.organization))
        .filter(Boolean)
    ),
  ];
}

function profileParagraph(user, displayName) {
  if (!user) return "";
  const role = user.is_superuser
    ? "a superadmin"
    : user.is_instructor
    ? "an instructor"
    : "a student";
  const schools = uniqueSchoolNames(user.cohorts);
  const schoolBit = schools.length ? ` at ${schools.join(", ")}` : "";
  const parts = [`${displayName} is ${role}${schoolBit}.`];

  if (user.first_name || user.last_name) {
    const legal = `${user.first_name || ""} ${user.last_name || ""}`.replace(/\s+/g, " ").trim();
    if (legal && legal.toLowerCase() !== displayName.toLowerCase()) {
      parts.push(`Recorded name: ${legal}.`);
    }
  }
  if (user.gender) parts.push(`Gender: ${user.gender}.`);
  if (user.class_stream) parts.push(`Class stream: ${user.class_stream}.`);
  if (user.date_joined) {
    parts.push(`Joined ${format(new Date(user.date_joined), "MMMM d, yyyy")}.`);
  }
  if (user.is_online) {
    parts.push("Currently active and online right now.");
  } else if (user.last_seen) {
    const rel = formatLastSeen(user.last_seen);
    if (rel) {
      parts.push(`Last active ${rel}.`);
    }
  } else if (user.last_login) {
    parts.push(`Last signed in ${format(new Date(user.last_login), "MMMM d, yyyy 'at' h:mm a")}.`);
  } else {
    parts.push("They have not signed in yet.");
  }
  if (typeof user.total_xp === "number") {
    parts.push(
      user.xp_level
        ? `Progress is ${user.total_xp} XP at level ${user.xp_level}.`
        : `Progress is ${user.total_xp} XP.`
    );
  }
  return parts.join(" ");
}

export default function UserProfileModal({ isOpen, onClose, user, onUpdate }) {
  const [resetting, setResetting] = useState(false);
  const [selectedCohort, setSelectedCohort] = useState("");
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [removingCohortId, setRemovingCohortId] = useState(null);
  const [removingCourseId, setRemovingCourseId] = useState(null);
  const [localUser, setLocalUser] = useState(user);
  const prevUserIdRef = React.useRef(user?.id);

  React.useEffect(() => {
    if (user && user.id !== prevUserIdRef.current) {
      prevUserIdRef.current = user.id;
      setLocalUser(user);
    }
  }, [user]);

  const displayUser = localUser || user;
  const displayName = profileDisplayName(displayUser);

  const { data: cohortsData, isLoading: loadingCohorts } = useSWR(
    isOpen ? "/api/admin/cohorts/" : null,
    swrFetcher
  );
  const allCohorts = Array.isArray(cohortsData) ? cohortsData : cohortsData?.results || [];

  const userCohortIds = new Set((displayUser?.cohorts || []).map((c) => c.id));
  const availableCohorts = allCohorts.filter((c) => !userCohortIds.has(c.id));

  const refreshUser = async () => {
    if (!displayUser?.id) return null;
    try {
      const res = await apiFetch(`/api/admin/users/${displayUser.id}/`);
      if (res.ok) {
        const data = await res.json();
        setLocalUser((prev) => ({
          ...prev,
          ...data,
          total_xp: prev?.total_xp ?? data.total_xp,
          xp_level: prev?.xp_level ?? data.xp_level,
        }));
        return data;
      }
    } catch (err) {
      console.error(err);
    }
    return null;
  };

  const handleResetPassword = async () => {
    if (!window.confirm(`Send password reset email to ${displayUser.email}?`)) return;
    setResetting(true);
    try {
      await apiFetch("/api/auth/users/reset_password/", {
        method: "POST",
        body: JSON.stringify({ email: displayUser.email }),
      });
      toast.success(`Password reset email sent to ${displayUser.email}`);
    } catch (err) {
      toast.error(err.message || "Failed to send reset email");
    } finally {
      setResetting(false);
    }
  };

  const handleEnrollCohort = async (e) => {
    e.preventDefault();
    if (!selectedCohort) {
      toast.error("Please select a cohort.");
      return;
    }
    const cohortToEnrollId = selectedCohort;
    const enrolledCohortObj = allCohorts.find((c) => String(c.id) === String(cohortToEnrollId));
    setIsEnrolling(true);
    try {
      const res = await apiFetch(`/api/admin/cohorts/${cohortToEnrollId}/add-student/`, {
        method: "POST",
        body: JSON.stringify({ student_ids: [displayUser.id] }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to enroll in cohort.");
      }
      toast.success("Successfully enrolled in cohort.");
      
      // Optimistically update localUser so the UI immediately and persistently shows the cohort
      setLocalUser((prev) => {
        if (!prev) return prev;
        const currentList = prev.cohorts || [];
        if (currentList.some((c) => String(c.id) === String(cohortToEnrollId))) return prev;
        const newCohortEntry = enrolledCohortObj
          ? {
              id: enrolledCohortObj.id,
              name: enrolledCohortObj.name,
              organization: enrolledCohortObj.organization
                ? typeof enrolledCohortObj.organization === "object"
                  ? enrolledCohortObj.organization.name
                  : enrolledCohortObj.organization
                : null,
              status: "current",
              days_present: 0,
              days_absent: 0,
            }
          : { id: cohortToEnrollId, name: "Enrolled Cohort", status: "current", days_present: 0, days_absent: 0 };
        return {
          ...prev,
          cohorts: [...currentList, newCohortEntry],
        };
      });

      setSelectedCohort("");
      await refreshUser();
      onUpdate?.();
    } catch (err) {
      toast.error(err.message || "Failed to enroll in cohort.");
    } finally {
      setIsEnrolling(false);
    }
  };

  const handleRemoveFromCohort = async (cohort) => {
    if (
      !window.confirm(
        `Remove ${displayName} from “${cohort.name}”? They will lose access to that cohort.`
      )
    ) {
      return;
    }
    setRemovingCohortId(cohort.id);
    try {
      const res = await apiFetch(`/api/admin/cohorts/${cohort.id}/remove-student/`, {
        method: "POST",
        body: JSON.stringify({ student_id: displayUser.id }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to remove student from cohort.");
      }
      toast.success(`Removed from ${cohort.name}.`);
      setLocalUser((prev) =>
        prev
          ? {
              ...prev,
              cohorts: (prev.cohorts || []).filter((c) => c.id !== cohort.id),
            }
          : prev
      );
      await refreshUser();
      onUpdate?.();
    } catch (err) {
      toast.error(err.message || "Failed to remove student from cohort.");
    } finally {
      setRemovingCohortId(null);
    }
  };

  const handleRemoveFromCourse = async (course) => {
    if (
      !window.confirm(
        `Remove ${displayName} from course "${course.title}"? They will lose access.`
      )
    ) {
      return;
    }
    setRemovingCourseId(course.id);
    try {
      const res = await apiFetch(`/api/admin/users/${displayUser.id}/unenroll-course/`, {
        method: "POST",
        body: JSON.stringify({ course_id: course.id }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to remove student from course.");
      }
      toast.success(`Removed from ${course.title}.`);
      setLocalUser((prev) =>
        prev
          ? {
              ...prev,
              enrolled_courses: (prev.enrolled_courses || []).filter((c) => c.id !== course.id),
            }
          : prev
      );
      await refreshUser();
      onUpdate?.();
    } catch (err) {
      toast.error(err.message || "Failed to remove student from course.");
    } finally {
      setRemovingCourseId(null);
    }
  };

  if (!displayUser) {
    return (
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>User Profile</DialogTitle>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
  }

  const cohorts = displayUser.cohorts || [];
  const currentCohorts = cohorts.filter((c) => c.status !== "previous");
  const previousCohorts = cohorts.filter((c) => c.status === "previous");
  const enrolledCourses = displayUser.enrolled_courses || [];
  const intro = profileParagraph(displayUser, displayName);

  const renderCohortRow = (c, muted = false) => (
    <li
      key={c.id}
      className={`rounded-md px-2.5 py-2 flex items-start gap-2 min-w-0 ${
        muted ? "bg-muted text-muted-foreground" : "bg-muted text-foreground"
      }`}
    >
      <div className="min-w-0 flex-1 overflow-hidden">
        <p className="font-semibold text-xs leading-snug break-words">{c.name}</p>
        {c.organization && (
          <p className="text-[11px] leading-snug mt-0.5 break-words">
            {typeof c.organization === "object" ? c.organization.name : c.organization}
          </p>
        )}
        <p className="text-[11px] leading-snug mt-1 tabular-nums">
          Present {c.days_present || 0} · Absent {c.days_absent || 0}
        </p>
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="shrink-0 h-7 px-2 rounded-md text-[11px] text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
        disabled={removingCohortId === c.id}
        onClick={() => handleRemoveFromCohort(c)}
        title="Remove from cohort"
      >
        <UserMinus className="w-3 h-3 mr-1" />
        {removingCohortId === c.id ? "…" : "Remove"}
      </Button>
    </li>
  );

  const renderCourseRow = (c) => (
    <li
      key={c.id}
      className="rounded-md px-2.5 py-2 flex items-start gap-2 min-w-0 bg-muted text-foreground"
    >
      <div className="min-w-0 flex-1 overflow-hidden">
        <p className="font-semibold text-xs leading-snug break-words">{c.title}</p>
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="shrink-0 h-7 px-2 rounded-md text-[11px] text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
        disabled={removingCourseId === c.id}
        onClick={() => handleRemoveFromCourse(c)}
        title="Remove from course"
      >
        <UserMinus className="w-3 h-3 mr-1" />
        {removingCourseId === c.id ? "…" : "Unenroll"}
      </Button>
    </li>
  );

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="community-page sm:max-w-[520px] w-[calc(100vw-1.5rem)] max-h-[90dvh] overflow-hidden flex flex-col rounded-md font-['Lexend',sans-serif]">
        <DialogHeader>
          <DialogTitle className="font-['Lexend',sans-serif] font-semibold">Profile</DialogTitle>
          <DialogDescription className="font-['Lexend',sans-serif] leading-relaxed">
            Student details and cohort access.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-5 py-2 max-h-[70vh] overflow-y-auto hide-scrollbar font-['Lexend',sans-serif]">
          <div className="flex items-start gap-4">
            <div className="relative w-14 h-14 rounded-md bg-primary text-primary-foreground font-semibold text-xl flex items-center justify-center shrink-0">
              {(displayName?.[0] || "?").toUpperCase()}
              <OnlineGlowDot isOnline={displayUser.is_online} size="sm" className="absolute -bottom-1 -right-1 z-10" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold text-lg leading-snug flex items-center gap-1">{displayName} <UserVerifiedBadge user={displayUser} className="w-4 h-4" /></h3>
                <UserStatusBadge isOnline={displayUser.is_online} lastSeen={displayUser.last_seen} showText={true} />
              </div>
              {displayUser.username && (
                <p className="text-sm text-muted-foreground mt-0.5 leading-relaxed">
                  @{displayUser.username}
                </p>
              )}
            </div>
          </div>

          <p className="text-[15px] leading-7 text-foreground">{intro}</p>

          <div className="rounded-md bg-muted p-4">
            <p className="text-sm font-semibold mb-1">Email</p>
            <p className="text-[15px] leading-7 break-all">{displayUser.email || "No email on file."}</p>
          </div>

          <div className="pt-1 min-w-0">
            <h4 className="text-sm font-semibold mb-0.5">Cohorts</h4>
            <p className="text-xs leading-5 text-muted-foreground mb-2.5">
              Add this person to a cohort or remove them from one they already belong to.
            </p>

            <form
              onSubmit={handleEnrollCohort}
              className="flex flex-col gap-2 mb-3 w-full min-w-0"
            >
              <SearchableSelect
                value={selectedCohort}
                onChange={(e) => setSelectedCohort(e.target.value)}
                disabled={loadingCohorts || availableCohorts.length === 0}
                placeholder={
                  loadingCohorts
                    ? "Loading cohorts..."
                    : availableCohorts.length === 0
                    ? "No available cohorts"
                    : "Search & select a cohort…"
                }
                searchPlaceholder="Search cohorts…"
                side="bottom"
                align="start"
                className="w-full min-w-0 h-9 rounded-md border border-input bg-background !pl-3 !pr-3.5 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-50 font-['Lexend',sans-serif] [&>svg]:ml-2.5 [&>svg]:shrink-0"
                contentClassName="!z-[300] !min-w-0 !max-w-[min(100vw-2rem,28rem)] !w-[var(--radix-popover-trigger-width)] font-['Lexend',sans-serif] text-xs [&_[cmdk-item]]:items-start [&_[cmdk-item]_span]:!whitespace-normal [&_[cmdk-item]_span]:!overflow-visible [&_[cmdk-item]_span]:!text-clip [&_[cmdk-item]_span]:break-words [&_[cmdk-item]_span]:leading-snug"
              >
                {availableCohorts.map((c) => (
                  <option key={c.id} value={c.id}>
                    {cohortLabel(c)}
                  </option>
                ))}
              </SearchableSelect>
              <div className="flex justify-end">
                <Button
                  type="submit"
                  size="sm"
                  disabled={isEnrolling || loadingCohorts || !selectedCohort}
                  className="h-8 px-3 rounded-md text-xs font-semibold"
                >
                  <UserPlus className="w-3.5 h-3.5 mr-1.5" />
                  {isEnrolling ? "Adding…" : "Add cohort"}
                </Button>
              </div>
            </form>

            {cohorts.length > 0 ? (
              <div className="space-y-3 mb-2 min-w-0">
                {currentCohorts.length > 0 && (
                  <div className="min-w-0">
                    <h5 className="text-xs font-semibold mb-1.5 uppercase tracking-wide text-muted-foreground">
                      Current
                    </h5>
                    <ul className="space-y-1.5">{currentCohorts.map((c) => renderCohortRow(c))}</ul>
                  </div>
                )}
                {previousCohorts.length > 0 && (
                  <div className="min-w-0">
                    <h5 className="text-xs font-semibold mb-1.5 uppercase tracking-wide text-muted-foreground">
                      Previous
                    </h5>
                    <ul className="space-y-1.5">
                      {previousCohorts.map((c) => renderCohortRow(c, true))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs leading-5 text-muted-foreground mb-2 rounded-md bg-muted p-3">
                Not assigned to any cohorts yet.
              </p>
            )}

            <div className="mt-5 pt-4 border-t border-border">
              <h4 className="text-sm font-semibold mb-2">Enrolled Courses</h4>
              {enrolledCourses.length > 0 ? (
                <ul className="space-y-1.5">
                  {enrolledCourses.map((c) => renderCourseRow(c))}
                </ul>
              ) : (
                <p className="text-xs leading-5 text-muted-foreground mb-2 rounded-md bg-muted p-3">
                  Not enrolled in any courses.
                </p>
              )}
            </div>

            <div className="mt-5 pt-4 border-t border-border">
              <h4 className="text-base font-semibold mb-1">Security</h4>
              <p className="text-sm leading-7 text-muted-foreground mb-3">
                Send a password reset email to {displayUser.email || "this account"}.
              </p>
              <Button
                variant="outline"
                className="w-full justify-start rounded-md"
                onClick={handleResetPassword}
                disabled={resetting}
              >
                <Shield className="w-4 h-4 mr-2" />
                {resetting ? "Sending..." : "Send password reset email"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
