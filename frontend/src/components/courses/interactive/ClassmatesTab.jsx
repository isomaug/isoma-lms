import { useState, useEffect, useMemo } from "react";
import { Reorder, useDragControls } from "framer-motion";
import { customToast as toast } from "@/components/notifications/GlobalPopup";
import {
  LayoutGrid,
  Users,
  List,
  Columns,
  Settings,
  Eye,
  RefreshCcw,
  ArrowUpDown,
  GripVertical,
} from "lucide-react";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/api/client/apiClient";
import LazyImage from "@/components/media/LazyImage";
import AttendanceModal from "@/components/courses/enrollment/AttendanceModal";
import TeamManagementModal from "@/components/cohorts/TeamManagementModal";
import ViewMembersModal from "@/components/cohorts/ViewMembersModal";
import ResetProgressModal from "@/components/courses/viewer/ResetProgressModal";
import DelayedSpinner from "@/components/notifications/DelayedSpinner";
import UserStatusBadge, { OnlineGlowDot } from "@/components/ui/UserStatusBadge";
import UserProfileModal from "@/components/profile/UserProfileModal";
import UserVerifiedBadge from "@/components/profile/UserVerifiedBadge";
import { NameTagsPrintPreview } from "@/components/cohorts/NameTagsPrintPreview";

function DraggableStudentCard({ student, gridCardWidth, present, name, isInstructor, onOpenProfile }) {
  const controls = useDragControls();

  return (
    <Reorder.Item
      value={student}
      as="div"
      layout
      dragListener={false}
      dragControls={controls}
      transition={{ type: "spring", stiffness: 480, damping: 36, mass: 0.7 }}
      className={`${gridCardWidth} bg-card border p-3 sm:p-4 flex flex-col items-center text-center shadow-sm hover:shadow-md relative rounded-lg list-none select-none ${
        present ? "border-emerald-400/50" : "border-red-400/40"
      }`}
      whileDrag={{
        scale: 1.05,
        boxShadow: "0 14px 32px rgba(0,0,0,0.2)",
        zIndex: 50,
        cursor: "grabbing",
      }}
    >
      <button
        type="button"
        className="absolute top-2 left-2 p-1.5 rounded-md text-muted-foreground hover:bg-muted cursor-grab active:cursor-grabbing touch-none"
        title="Drag to rearrange"
        onPointerDown={(e) => controls.start(e)}
        aria-label="Drag to rearrange"
      >
        <GripVertical className="w-4 h-4" />
      </button>
      <div
        className={`absolute top-3 right-3 w-3 h-3 rounded-full border-2 border-background shadow-sm z-10 ${
          present ? "bg-green-500" : "bg-red-500"
        }`}
        title={present ? "Attendance marked present" : "Awaiting attendance"}
      />

      <button
        type="button"
        onClick={() => isInstructor && onOpenProfile(student)}
        className={`w-full flex flex-col items-center ${isInstructor ? "cursor-pointer" : ""}`}
      >
        <div
          className={`relative shrink-0 rounded-full flex items-center justify-center font-bold border-2 w-14 h-14 sm:w-16 sm:h-16 text-xl mb-3 ${
            present
              ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/40"
              : "bg-red-500/10 text-red-600 border-red-500/40"
          }`}
        >
          {student.avatar ? (
            <LazyImage
              src={student.avatar}
              alt={name}
              className="w-full h-full object-cover rounded-full"
              draggable={false}
            />
          ) : (
            name.charAt(0).toUpperCase()
          )}
          <OnlineGlowDot isOnline={student.is_online} size="sm" className="absolute -bottom-0.5 -left-0.5 z-10" />
          {typeof student.total_xp === "number" && (
            <div className="absolute -bottom-1.5 -right-1.5 min-w-[1.35rem] h-5 px-1 rounded-md bg-amber-500 text-white text-[10px] font-extrabold flex items-center justify-center shadow-sm tabular-nums">
              {student.xp_level || 1}
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0 w-full space-y-0.5">
          <p className="font-semibold text-sm truncate w-full flex items-center justify-center gap-1" title={name}>
            <span className="truncate">{name}</span>
            <UserVerifiedBadge user={student} />
          </p>
          <div className="pt-0.5 flex justify-center w-full min-w-0">
            <UserStatusBadge isOnline={student.is_online} lastSeen={student.last_seen} showText={true} className="max-w-full" />
          </div>
          <p className="text-[11px] text-amber-600 font-bold tabular-nums pt-0.5">
            {typeof student.total_xp === "number"
              ? `${student.total_xp} XP`
              : "XP Hidden"}
          </p>
          <p className="text-[11px] text-muted-foreground tabular-nums">
            {student.completed_lessons ?? 0} lessons
          </p>
        </div>
      </button>
    </Reorder.Item>
  );
}

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

export function studentDisplayName(student) {
  const named =
    student?.full_name ||
    `${student?.first_name || ""} ${student?.middle_name || ""} ${student?.last_name || ""}`
      .replace(/\s+/g, " ")
      .trim();
  if (named) return named;
  return nameFromEmail(student?.email || student?.username) || student?.username || "Student";
}

export default function ClassmatesTab({
  slug,
  cohortId,
  onCohortChange,
  cohorts = [],
  lessonId,
}) {
  const [classmates, setClassmates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [layout, setLayout] = useState("grid");
  const [isAttendanceOpen, setIsAttendanceOpen] = useState(false);
  const [showTeams, setShowTeams] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [adminCohort, setAdminCohort] = useState(null);
  const [resetCohortId, setResetCohortId] = useState(cohortId);
  const [reloadKey, setReloadKey] = useState(0);
  const [profileUser, setProfileUser] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [sortKey, setSortKey] = useState("name");
  const [sortDir, setSortDir] = useState("asc");
  const [matesVisible, setMatesVisible] = useState(false);
  const [savingVisibility, setSavingVisibility] = useState(false);
  const [xpVisible, setXpVisible] = useState(false);
  const [savingXpVisibility, setSavingXpVisibility] = useState(false);
  const [showNameTagsModal, setShowNameTagsModal] = useState(false);
  const [cohortOrg, setCohortOrg] = useState(null);

  const { me } = useAuth();
  const isInstructor = me?.is_staff || me?.is_superuser || me?.is_instructor;

  const toggleSort = (key) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(key === "name" ? "asc" : "desc");
    }
  };

  const sortedClassmates = useMemo(() => {
    const dir = sortDir === "asc" ? 1 : -1;
    const list = [...classmates];
    list.sort((a, b) => {
      const nameA = studentDisplayName(a).toLowerCase();
      const nameB = studentDisplayName(b).toLowerCase();
      if (sortKey === "index") {
        const idA = a.id || 0;
        const idB = b.id || 0;
        return (idA - idB) * dir;
      }
      if (sortKey === "status") {
        const onlineA = a.is_online ? 1 : 0;
        const onlineB = b.is_online ? 1 : 0;
        if (onlineA !== onlineB) {
          return (onlineB - onlineA) * dir;
        }
        const timeA = a.last_seen ? new Date(a.last_seen).getTime() : 0;
        const timeB = b.last_seen ? new Date(b.last_seen).getTime() : 0;
        return (timeB - timeA) * dir;
      }
      if (sortKey === "xp") {
        const diff = (a.total_xp || 0) - (b.total_xp || 0);
        return diff === 0 ? nameA.localeCompare(nameB) : diff * dir;
      }
      if (sortKey === "lessons") {
        const diff = (a.completed_lessons || 0) - (b.completed_lessons || 0);
        return diff === 0 ? nameA.localeCompare(nameB) : diff * dir;
      }
      if (sortKey === "present") {
        const diff = (a.is_present_today ? 1 : 0) - (b.is_present_today ? 1 : 0);
        return diff === 0 ? nameA.localeCompare(nameB) : diff * dir;
      }
      return nameA.localeCompare(nameB) * dir;
    });
    return list;
  }, [classmates, sortKey, sortDir]);

  const verifiedClassmates = useMemo(() => {
    return (classmates || []).filter((s) => Boolean(s.is_verified));
  }, [classmates]);

  const openStudentProfile = async (student) => {
    if (!isInstructor) return;
    setProfileLoading(true);
    try {
      const res = await apiFetch(`/api/admin/users/${student.id}/`);
      if (res.ok) {
        const data = await res.json();
        setProfileUser({
          ...data,
          total_xp: student.total_xp ?? data.total_xp,
          xp_level: student.xp_level ?? data.xp_level,
          completed_lessons: student.completed_lessons,
          full_name: data.full_name || studentDisplayName({ ...student, ...data }),
        });
      } else {
        setProfileUser({ ...student, full_name: studentDisplayName(student) });
      }
    } catch {
      setProfileUser({ ...student, full_name: studentDisplayName(student) });
    } finally {
      setProfileLoading(false);
    }
  };

  useEffect(() => {
    setResetCohortId(cohortId);
  }, [cohortId]);

  const loadClassmates = () => {
    setLoading(true);
    setError(null);
    let url = `/api/courses/${slug}/classmates/`;
    const params = new URLSearchParams();
    if (cohortId) params.append("cohort_id", cohortId);
    if (lessonId) params.append("lesson_id", lessonId);
    const qs = params.toString();
    if (qs) url += "?" + qs;
    return apiFetch(url)
      .then(async (res) => {
        if (!res.ok) {
          try {
            const errData = await res.json();
            throw new Error(errData.error || "Failed to load classmates");
          } catch (e) {
            throw new Error(e.message || "Failed to load classmates");
          }
        }
        return res.json();
      })
      .then((data) => {
        if (data.error) {
          setError(data.error);
          setClassmates([]);
        } else {
          setClassmates(data.classmates || []);
          if (data.organization) {
            setCohortOrg(data.organization);
          }
          if (typeof data.allow_students_to_see_classmates === "boolean") {
            setMatesVisible(data.allow_students_to_see_classmates);
          }
          if (typeof data.show_classmate_xps === "boolean") {
            setXpVisible(data.show_classmate_xps);
          }
        }
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadClassmates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, cohortId, lessonId, reloadKey]);

  useEffect(() => {
    if (!isInstructor || !cohortId) return;
    let isMounted = true;
    apiFetch(`/api/admin/cohorts/${cohortId}/`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (isMounted) {
          setAdminCohort(data);
          if (typeof data?.allow_students_to_see_classmates === "boolean") {
            setMatesVisible(data.allow_students_to_see_classmates);
          }
          if (typeof data?.show_classmate_xps === "boolean") {
            setXpVisible(data.show_classmate_xps);
          }
        }
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, [isInstructor, cohortId, reloadKey]);

  useEffect(() => {
    if (!showReset || !isInstructor || !resetCohortId) return;
    if (adminCohort?.id === resetCohortId) return;
    let isMounted = true;
    apiFetch(`/api/admin/cohorts/${resetCohortId}/`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (isMounted && data) setAdminCohort(data);
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, [showReset, resetCohortId, isInstructor, adminCohort?.id]);

  const toggleMatesVisible = async () => {
    if (!cohortId || savingVisibility) return;
    const next = !matesVisible;
    setMatesVisible(next);
    setSavingVisibility(true);
    try {
      const res = await apiFetch(`/api/courses/${slug}/classmates/`, {
        method: "PATCH",
        body: JSON.stringify({
          cohort_id: cohortId,
          allow_students_to_see_classmates: next,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Failed to update classmates visibility");
      setAdminCohort((current) =>
        current ? { ...current, allow_students_to_see_classmates: next } : current
      );
      toast.success(next ? "Classmates can now view their mates." : "Classmates can no longer view their mates.");
    } catch (err) {
      setMatesVisible(!next);
      toast.error(err.message || "Failed to update classmates visibility.");
    } finally {
      setSavingVisibility(false);
    }
  };

  const toggleXpVisible = async () => {
    if (!cohortId || savingXpVisibility) return;
    const next = !xpVisible;
    setXpVisible(next);
    setSavingXpVisibility(true);
    try {
      const res = await apiFetch(`/api/courses/${slug}/classmates/`, {
        method: "PATCH",
        body: JSON.stringify({
          cohort_id: cohortId,
          show_classmate_xps: next,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Failed to update XP visibility");
      setAdminCohort((current) =>
        current ? { ...current, show_classmate_xps: next } : current
      );
      toast.success(next ? "Classmate XPs are now visible to students." : "Classmate XPs are now hidden from students.");
      await loadClassmates();
    } catch (err) {
      setXpVisible(!next);
      toast.error(err.message || "Failed to update XP visibility.");
    } finally {
      setSavingXpVisibility(false);
    }
  };

  const refreshAdminCohort = async () => {
    if (!cohortId) return;
    try {
      const res = await apiFetch(`/api/admin/cohorts/${cohortId}/`);
      if (res.ok) setAdminCohort(await res.json());
    } catch (err) {
      console.error(err);
    }
  };

  const handleResetConfirm = async (flags, selectedId, studentId) => {
    const targetId = selectedId || resetCohortId || cohortId;
    if (!targetId) return;
    setResetting(true);
    try {
      const res = await apiFetch(`/api/admin/cohorts/${targetId}/bulk-reset-progress/`, {
        method: "POST",
        body: JSON.stringify({
          student_ids: studentId ? [studentId] : [],
          ...flags
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Failed to reset progress");
      toast.success(data.message || (studentId ? "Progress reset for student." : "Progress reset for the cohort."));
      setShowReset(false);
      setReloadKey((k) => k + 1);
    } catch (err) {
      toast.error(err.message || "Failed to reset progress.");
    } finally {
      setResetting(false);
    }
  };

  const cohortForModals = adminCohort || {
    id: cohortId,
    name: cohorts.find((c) => c.id === cohortId)?.name || "Current Cohort",
    students: classmates.map((student) => ({
      ...student,
      full_name: studentDisplayName(student),
    })),
    teams: [],
  };

  if (loading) {
    return <DelayedSpinner fullScreen={false} message="Loading classmates..." />;
  }

  if (error) {
    return (
      <div className="p-8 text-center bg-red-500/10 border border-red-500/20 rounded-lg max-w-md mx-auto mt-8">
        <p className="text-red-500 font-medium mb-2">Notice</p>
        <p className="text-sm text-foreground/80">{error}</p>
      </div>
    );
  }

  const gridCardWidth =
    layout === "cols2"
      ? "w-full sm:w-[calc(50%-0.375rem)]"
      : "w-[calc(50%-0.375rem)] sm:w-[calc(33.333%-0.5rem)] md:w-[calc(25%-0.5625rem)] lg:w-[calc(20%-0.6rem)]";

  const SortBtn = ({ col, label }) => (
    <button
      type="button"
      onClick={() => toggleSort(col)}
      className={`inline-flex items-center gap-1 font-semibold text-xs uppercase tracking-wide ${
        sortKey === col ? "text-foreground" : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {label}
      <ArrowUpDown className={`w-3.5 h-3.5 ${sortKey === col ? "opacity-100" : "opacity-40"}`} />
    </button>
  );

  const resetStudentCount =
    adminCohort?.id === resetCohortId
      ? adminCohort.students?.length || 0
      : classmates.length;

  return (
    <div className="space-y-6 mx-auto w-full">
      {/* Header Section */}
      <div className="space-y-4 pb-2 border-b border-border/40">
        {/* Row 1: Title on top (full width, not pushed to the side) */}
        <div>
          <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Classmates ({classmates.length})
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Students enrolled in the selected cohort
          </p>
        </div>

        {/* Row 2: Cohort Chooser below it with Layout View Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {(isInstructor || cohorts.length > 1) && cohorts.length > 0 ? (
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-muted-foreground whitespace-nowrap">
                Cohort:
              </span>
              <SearchableSelect
                value={cohortId || ""}
                onChange={(e) => onCohortChange?.(Number(e.target.value))}
                className="bg-background border border-border rounded-lg px-3 py-1.5 text-xs font-semibold w-full sm:w-auto min-w-[14rem]"
                contentClassName="text-xs"
              >
                {cohorts.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </SearchableSelect>
            </div>
          ) : (
            <div />
          )}

          <div className="flex gap-1 bg-muted p-1 rounded-lg shrink-0 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setLayout("row")}
              className={`p-1.5 rounded-md text-xs font-medium transition-colors ${
                layout === "row"
                  ? "bg-background shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setLayout("cols2")}
              className={`p-1.5 rounded-md text-xs font-medium transition-colors ${
                layout === "cols2"
                  ? "bg-background shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              title="2 Columns View"
            >
              <Columns className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setLayout("grid")}
              className={`p-1.5 rounded-md text-xs font-medium transition-colors ${
                layout === "grid"
                  ? "bg-background shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Row 3: Card with equal-width aligned action buttons and checkboxes */}
        {isInstructor && (
          <div className="bg-card border border-border rounded-xl p-3 sm:p-4 shadow-sm">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {/* Teams & Members (columns 1 & 2 on desktop) */}
              <button
                type="button"
                onClick={() => setShowTeams(true)}
                className="w-full h-9 sm:h-10 px-3 border border-border text-xs sm:text-sm font-semibold rounded-lg hover:bg-muted transition-colors flex items-center justify-center gap-1.5 bg-background shadow-xs text-foreground"
              >
                <Settings className="w-4 h-4 text-muted-foreground shrink-0" />
                <span>Teams</span>
              </button>
              <button
                type="button"
                onClick={() => setShowMembers(true)}
                className="w-full h-9 sm:h-10 px-3 border border-border text-xs sm:text-sm font-semibold rounded-lg hover:bg-muted transition-colors flex items-center justify-center gap-1.5 bg-background shadow-xs text-foreground"
              >
                <Eye className="w-4 h-4 text-muted-foreground shrink-0" />
                <span>Members</span>
              </button>

              {/* Reset Progress & Mark Attendance (columns 3 & 4 on desktop) */}
              <button
                type="button"
                onClick={() => {
                  setResetCohortId(cohortId);
                  setShowReset(true);
                }}
                disabled={!cohortId && cohorts.length === 0}
                className="w-full h-9 sm:h-10 px-3 border border-border text-xs sm:text-sm font-semibold rounded-lg hover:bg-muted transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50 bg-background shadow-xs text-foreground"
              >
                <RefreshCcw className="w-4 h-4 text-muted-foreground shrink-0" />
                <span className="truncate">Update Progress</span>
              </button>
              <button
                type="button"
                onClick={() => setIsAttendanceOpen(true)}
                disabled={!cohortId}
                className="w-full h-9 sm:h-10 px-3 bg-primary text-primary-foreground text-xs sm:text-sm font-semibold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5 shadow-xs"
              >
                <span className="truncate">Mark Attendance</span>
              </button>

            </div>
            <div className="flex flex-col sm:flex-row gap-2.5 mt-2.5">
              <label
                className={`flex-1 h-9 sm:h-10 inline-flex items-center justify-center gap-2 px-3 border rounded-lg text-xs sm:text-sm font-semibold select-none transition-colors bg-background shadow-xs ${
                  !cohortId || savingVisibility
                    ? "opacity-50 cursor-not-allowed border-border text-muted-foreground"
                    : "cursor-pointer border-border hover:bg-muted text-foreground"
                }`}
                title="Allow students in this cohort to see each other"
              >
                <input
                  type="checkbox"
                  checked={matesVisible}
                  disabled={!cohortId || savingVisibility}
                  onChange={toggleMatesVisible}
                  className="rounded border-gray-300 w-4 h-4 text-primary focus:ring-primary shrink-0"
                />
                <span className="truncate">Classmates can view mates</span>
              </label>

              <label
                className={`flex-1 h-9 sm:h-10 inline-flex items-center justify-center gap-2 px-3 border rounded-lg text-xs sm:text-sm font-semibold select-none transition-colors bg-background shadow-xs ${
                  !cohortId || savingXpVisibility
                    ? "opacity-50 cursor-not-allowed border-border text-muted-foreground"
                    : "cursor-pointer border-border hover:bg-muted text-foreground"
                }`}
                title="Allow students in this cohort to see each other's XP"
              >
                <input
                  type="checkbox"
                  checked={xpVisible}
                  disabled={!cohortId || savingXpVisibility}
                  onChange={toggleXpVisible}
                  className="rounded border-gray-300 w-4 h-4 text-primary focus:ring-primary shrink-0"
                />
                <span className="truncate">Show classmate XP</span>
              </label>

              <button
                type="button"
                onClick={() => setShowNameTagsModal(true)}
                disabled={!cohortId}
                className="flex-1 h-9 sm:h-10 px-3 border border-border text-xs sm:text-sm font-semibold rounded-lg hover:bg-muted transition-colors flex items-center justify-center gap-2 bg-background shadow-xs text-foreground disabled:opacity-50"
              >
                <Users className="w-4 h-4 text-muted-foreground shrink-0" />
                <span className="truncate">Print Name Tags ({verifiedClassmates.length})</span>
              </button>
            </div>
          </div>
        )}

        {showNameTagsModal && (
          <NameTagsPrintPreview
            open={showNameTagsModal}
            onOpenChange={setShowNameTagsModal}
            users={verifiedClassmates}
            onlyVerified={true}
            defaultCohortName={cohortForModals?.name}
            defaultOrgName={
              cohortOrg?.name ||
              (typeof cohortForModals?.organization === 'object'
                ? cohortForModals?.organization?.name
                : cohortForModals?.organization)
            }
            defaultOrgLogo={
              cohortOrg?.logo ||
              (typeof cohortForModals?.organization === 'object'
                ? cohortForModals?.organization?.logo
                : cohortForModals?.organization_logo || cohortForModals?.organization_details?.logo)
            }
            cohort={cohortForModals}
          />
        )}
      </div>

      {classmates.length === 0 ? (
        <div className="p-12 text-center text-muted-foreground border rounded-lg border-dashed mt-4 bg-muted/10">
          <Users className="w-12 h-12 mx-auto mb-3 opacity-20" />
          <p>No classmates found.</p>
        </div>
      ) : layout === "row" ? (
        <div className="border rounded-lg overflow-hidden bg-card">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left min-w-[560px]">
              <thead className="bg-muted border-b sticky top-0 z-10">
                <tr>
                  <th className="px-3 py-2.5 w-12 text-muted-foreground font-semibold text-xs">
                    <SortBtn col="index" label="#" />
                  </th>
                  <th className="px-3 py-2.5">
                    <SortBtn col="name" label="Name" />
                  </th>
                  <th className="px-3 py-2.5">
                    <SortBtn col="status" label="Status" />
                  </th>
                  <th className="px-3 py-2.5">
                    <SortBtn col="xp" label="XP" />
                  </th>
                  <th className="px-3 py-2.5">
                    <SortBtn col="lessons" label="Lessons" />
                  </th>
                  <th className="px-3 py-2.5">
                    <SortBtn col="present" label="Present" />
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedClassmates.map((student, index) => {
                  const name = studentDisplayName(student);
                  const present = !!student.is_present_today;
                  return (
                    <tr
                      key={student.id}
                      onClick={() => isInstructor && openStudentProfile(student)}
                      className={`border-b last:border-0 hover:bg-muted/40 transition-colors ${
                        isInstructor ? "cursor-pointer" : ""
                      }`}
                    >
                      <td className="px-3 py-2.5 text-xs tabular-nums text-muted-foreground">
                        {index + 1}
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={`relative shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border-2 ${
                              present
                                ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/40"
                                : "bg-red-500/10 text-red-600 border-red-500/40"
                            }`}
                          >
                            {student.avatar ? (
                              <LazyImage
                                src={student.avatar}
                                alt={name}
                                className="w-full h-full object-cover rounded-full"
                              />
                            ) : (
                              name.charAt(0).toUpperCase()
                            )}
                            <OnlineGlowDot isOnline={student.is_online} size="xs" className="absolute -bottom-0.5 -right-0.5 z-10" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold truncate flex items-center gap-1" title={name}>
                              <span className="truncate">{name}</span>
                              <UserVerifiedBadge user={student} />
                            </p>
                            {isInstructor && student.gender && (
                              <span className="text-[11px] text-muted-foreground block truncate">{student.gender}</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap">
                        <UserStatusBadge isOnline={student.is_online} lastSeen={student.last_seen} showText={true} />
                      </td>
                      <td className="px-3 py-2.5 tabular-nums font-semibold text-amber-600">
                        {typeof student.total_xp === "number" ? student.total_xp : "-"}
                      </td>
                      <td className="px-3 py-2.5 tabular-nums font-medium">
                        {student.completed_lessons ?? 0}
                      </td>
                      <td className="px-3 py-2.5">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold ${
                            present
                              ? "bg-emerald-500/10 text-emerald-700"
                              : "bg-red-500/10 text-red-600"
                          }`}
                        >
                          {present ? "Present" : "Not marked"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="space-y-3 flex flex-col items-stretch">
          <div className="flex flex-wrap items-center justify-start gap-2 w-full">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
              Arrange
            </span>
            {[
              ["name", "Name"],
              ["status", "Status"],
              ["xp", "XP"],
              ["lessons", "Lessons"],
              ["present", "Present"],
            ].map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => {
                  const nextDir =
                    sortKey === key ? (sortDir === "asc" ? "desc" : "asc") : key === "name" ? "asc" : "desc";
                  setSortKey(key);
                  setSortDir(nextDir);
                  const dir = nextDir === "asc" ? 1 : -1;
                  setClassmates((prev) => {
                    const list = [...prev];
                    list.sort((a, b) => {
                      const nameA = studentDisplayName(a).toLowerCase();
                      const nameB = studentDisplayName(b).toLowerCase();
                      if (key === "status") {
                        const onlineA = a.is_online ? 1 : 0;
                        const onlineB = b.is_online ? 1 : 0;
                        if (onlineA !== onlineB) {
                          return (onlineB - onlineA) * dir;
                        }
                        const timeA = a.last_seen ? new Date(a.last_seen).getTime() : 0;
                        const timeB = b.last_seen ? new Date(b.last_seen).getTime() : 0;
                        return (timeB - timeA) * dir;
                      }
                      if (key === "xp") {
                        const diff = (a.total_xp || 0) - (b.total_xp || 0);
                        return diff === 0 ? nameA.localeCompare(nameB) : diff * dir;
                      }
                      if (key === "lessons") {
                        const diff = (a.completed_lessons || 0) - (b.completed_lessons || 0);
                        return diff === 0 ? nameA.localeCompare(nameB) : diff * dir;
                      }
                      if (key === "present") {
                        const diff = (a.is_present_today ? 1 : 0) - (b.is_present_today ? 1 : 0);
                        return diff === 0 ? nameA.localeCompare(nameB) : diff * dir;
                      }
                      return nameA.localeCompare(nameB) * dir;
                    });
                    return list;
                  });
                }}
                className={`px-2 py-1 rounded-md text-[11px] font-semibold border transition-colors ${
                  sortKey === key
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {label}
                {sortKey === key ? (sortDir === "asc" ? " ↑" : " ↓") : ""}
              </button>
            ))}
            <span className="text-[11px] text-muted-foreground">
              Drag the grip to rearrange
            </span>
          </div>
          <Reorder.Group
            axis="x"
            values={classmates}
            onReorder={setClassmates}
            className="flex flex-wrap gap-3 content-start justify-start"
            style={{ listStyleType: "none", padding: 0, margin: 0 }}
          >
            {classmates.map((student) => (
              <DraggableStudentCard
                key={student.id}
                student={student}
                gridCardWidth={gridCardWidth}
                present={!!student.is_present_today}
                name={studentDisplayName(student)}
                isInstructor={isInstructor}
                onOpenProfile={openStudentProfile}
              />
            ))}
          </Reorder.Group>
        </div>
      )}

      {isAttendanceOpen && cohortId && (
        <AttendanceModal
          cohort={cohortForModals}
          students={
            cohortForModals.students?.length
              ? cohortForModals.students
              : classmates.map((s) => ({ ...s, full_name: studentDisplayName(s) }))
          }
          onClose={() => setIsAttendanceOpen(false)}
          onSaved={() => setReloadKey((k) => k + 1)}
        />
      )}
      <TeamManagementModal
        cohort={cohortForModals}
        isOpen={showTeams}
        onClose={() => setShowTeams(false)}
        onRefresh={refreshAdminCohort}
      />
      <ViewMembersModal
        cohort={cohortForModals}
        isOpen={showMembers}
        onClose={() => setShowMembers(false)}
      />
      <ResetProgressModal
        isOpen={showReset}
        onClose={() => setShowReset(false)}
        onConfirm={handleResetConfirm}
        loading={resetting}
        studentCount={resetStudentCount}
        cohorts={cohorts}
        selectedCohortId={resetCohortId}
        onCohortChange={setResetCohortId}
        students={cohortForModals?.students || classmates}
        onRefresh={() => setReloadKey((k) => k + 1)}
        description="Choose a cohort and what to update. You can gift/deduct XP or reset progress items for students."
      />
      <UserProfileModal
        isOpen={!!profileUser}
        onClose={() => setProfileUser(null)}
        user={profileUser}
        onUpdate={() => setReloadKey((k) => k + 1)}
      />
      {profileLoading && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/20 pointer-events-none">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary bg-card p-4 shadow-lg" />
        </div>
      )}
    </div>
  );
}
