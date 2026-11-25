import { useEffect, useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import { Award, RotateCcw, Plus, Minus, Sparkles, AlertTriangle, Check, User as UserIcon } from "lucide-react";
import { customToast as toast } from "@/components/notifications/GlobalPopup";
import { apiFetch } from "@/api/client/apiClient";

const RESET_OPTIONS = [
  { key: "lessons", label: "Completed lessons", hint: "Clear finished-lesson checkmarks for this course", defaultOn: true },
  { key: "quizzes", label: "Quiz attempts", hint: "Delete quiz scores for this course", defaultOn: true },
  { key: "video", label: "Video watch progress", hint: "Reset resume timestamps", defaultOn: true },
  { key: "xp", label: "Course XP", hint: "Reset XP earned in this course", defaultOn: true },
  { key: "attendance", label: "Attendance records", hint: "Remove attendance for this cohort", defaultOn: false },
  { key: "certificates", label: "Certificates", hint: "Delete issued certificates for this course", defaultOn: false },
];

const defaultFlags = () =>
  Object.fromEntries(RESET_OPTIONS.map((option) => [option.key, option.defaultOn]));

function studentName(s) {
  if (!s) return "Student";
  const named = s.full_name || `${s.first_name || ""} ${s.last_name || ""}`.trim();
  if (named) return named;
  if (s.email && s.email.includes("@")) {
    return s.email.split("@")[0].replace(/[._+\-]+/g, " ");
  }
  return s.username || "Student";
}

function getXpLevel(xp) {
  const val = Math.max(0, Number(xp) || 0);
  if (val < 100) return { level: 1, title: "Getting Started" };
  if (val < 300) return { level: 2, title: "Making Progress" };
  if (val < 600) return { level: 3, title: "Good Work" };
  if (val < 1000) return { level: 4, title: "Meets Expectations" };
  return { level: 5, title: "Exceeded Expectations" };
}

export default function ResetProgressModal({
  isOpen,
  onClose,
  onConfirm,
  onAdjustXp,
  loading = false,
  studentCount = 0,
  description,
  cohorts = [],
  selectedCohortId = null,
  onCohortChange,
  students = [],
  initialStudentId = null,
  selectedStudentIds = [],
  onRefresh,
}) {
  const [activeTab, setActiveTab] = useState("xp"); // "xp" | "reset"
  const [flags, setFlags] = useState(defaultFlags);
  const [targetScope, setTargetScope] = useState("all"); // "all" | "selected" | "single"
  const [selectedStudentId, setSelectedStudentId] = useState("");

  // XP Adjustment State
  const [xpMode, setXpMode] = useState("gift"); // "gift" | "deduct"
  const [xpAmount, setXpAmount] = useState("50");
  const [xpReason, setXpReason] = useState("");
  const [isSubmittingXp, setIsSubmittingXp] = useState(false);

  const showCohortPicker = Array.isArray(cohorts) && cohorts.length > 0;
  const hasStudentsList = Array.isArray(students) && students.length > 0;
  const hasSelectedMultiple = Array.isArray(selectedStudentIds) && selectedStudentIds.length > 1;

  useEffect(() => {
    if (isOpen) {
      setFlags(defaultFlags());
      setXpAmount("50");
      setXpReason("");
      setXpMode("gift");

      if (initialStudentId) {
        setTargetScope("single");
        setSelectedStudentId(String(initialStudentId));
      } else if (hasSelectedMultiple) {
        setTargetScope("selected");
      } else {
        setTargetScope("all");
        setSelectedStudentId(students[0]?.id ? String(students[0].id) : "");
      }
    }
  }, [isOpen, initialStudentId, students, hasSelectedMultiple]);

  const activeStudent = useMemo(() => {
    if (!selectedStudentId || !hasStudentsList) return null;
    return students.find((s) => String(s.id) === String(selectedStudentId));
  }, [selectedStudentId, students, hasStudentsList]);

  const selectedCount = Object.values(flags).filter(Boolean).length;
  const isSingle = targetScope === "single" && activeStudent;
  const isSelectedGroup = targetScope === "selected" && selectedStudentIds.length > 0;

  const countLabel = isSingle
    ? studentName(activeStudent)
    : isSelectedGroup
    ? `${selectedStudentIds.length} selected students`
    : studentCount === 1
    ? "1 student"
    : `${studentCount || students.length} students`;

  // Projection for single student
  const currentStudentXp = activeStudent ? (Number(activeStudent.total_xp) || 0) : 0;
  const parsedXpAmount = Math.max(1, parseInt(xpAmount, 10) || 0);
  const projectedXp = isSingle
    ? Math.max(0, currentStudentXp + (xpMode === "gift" ? parsedXpAmount : -parsedXpAmount))
    : null;
  const currentLevelInfo = isSingle ? getXpLevel(currentStudentXp) : null;
  const projectedLevelInfo = isSingle && projectedXp !== null ? getXpLevel(projectedXp) : null;

  const canConfirmReset =
    !loading &&
    selectedCount > 0 &&
    (isSingle || isSelectedGroup || (studentCount > 0 || students.length > 0)) &&
    (!showCohortPicker || !!selectedCohortId);

  const canConfirmXp =
    !loading &&
    !isSubmittingXp &&
    parsedXpAmount > 0 &&
    (isSingle || isSelectedGroup || (studentCount > 0 || students.length > 0)) &&
    (!showCohortPicker || !!selectedCohortId);

  const handleConfirmReset = () => {
    const singleId = isSingle ? activeStudent.id : null;
    const targetIds = isSelectedGroup ? selectedStudentIds : null;
    onConfirm?.(flags, selectedCohortId, singleId || targetIds);
  };

  const handleConfirmXp = async () => {
    if (!canConfirmXp) return;
    const delta = xpMode === "gift" ? parsedXpAmount : -parsedXpAmount;
    let targetIds = [];
    if (isSingle) {
      targetIds = [activeStudent.id];
    } else if (isSelectedGroup) {
      targetIds = selectedStudentIds;
    } else {
      targetIds = students.map((s) => s.id);
    }

    if (onAdjustXp) {
      onAdjustXp(delta, xpReason, selectedCohortId, targetIds);
      return;
    }

    if (!selectedCohortId) {
      toast.error("Please select a cohort first.");
      return;
    }

    setIsSubmittingXp(true);
    try {
      const res = await apiFetch(`/api/admin/cohorts/${selectedCohortId}/adjust-xp/`, {
        method: "POST",
        body: JSON.stringify({
          amount: delta,
          reason: xpReason,
          student_ids: targetIds,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Failed to adjust XP");
      toast.success(data.message || "XP updated successfully!");
      onRefresh?.();
      onClose();
    } catch (err) {
      toast.error(err.message || "Failed to adjust XP");
    } finally {
      setIsSubmittingXp(false);
    }
  };

  const giftPresets = [25, 50, 100, 200];
  const deductPresets = [15, 25, 50, 100];

  return (
    <Dialog open={!!isOpen} onOpenChange={(open) => !open && !loading && !isSubmittingXp && onClose()}>
      <DialogContent className="w-full max-w-[95vw] sm:max-w-lg max-h-[90dvh] overflow-y-auto overflow-x-hidden p-4 sm:p-6 rounded-2xl border border-border bg-background shadow-2xl">
        <DialogHeader className="space-y-1.5 pb-2 border-b border-border/40">
          <DialogTitle className="text-lg sm:text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500 shrink-0" />
            <span>Update Progress</span>
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm text-muted-foreground">
            Gift or deduct student XP, or reset course progress for students in this cohort.
          </DialogDescription>
        </DialogHeader>

        {/* Tab Selection */}
        <div className="grid grid-cols-2 gap-1.5 p-1 bg-muted rounded-xl text-xs font-semibold mt-3">
          <button
            type="button"
            onClick={() => setActiveTab("xp")}
            className={`py-2 px-3 rounded-lg transition-all text-center flex items-center justify-center gap-1.5 ${
              activeTab === "xp"
                ? "bg-background text-foreground shadow-xs font-bold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Award className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span className="truncate">Gift / Deduct XP</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("reset")}
            className={`py-2 px-3 rounded-lg transition-all text-center flex items-center justify-center gap-1.5 ${
              activeTab === "reset"
                ? "bg-background text-foreground shadow-xs font-bold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5 text-rose-500 shrink-0" />
            <span className="truncate">Reset Progress</span>
          </button>
        </div>

        {/* Cohort Picker */}
        {showCohortPicker && (
          <div className="space-y-1 pt-2">
            <label className="text-xs font-semibold text-foreground">Cohort</label>
            <SearchableSelect
              value={selectedCohortId || ""}
              onChange={(e) => onCohortChange?.(Number(e.target.value))}
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs sm:text-sm"
            >
              <option value="">Select a cohort…</option>
              {cohorts.map((cohort) => (
                <option key={cohort.id} value={cohort.id}>
                  {cohort.name}
                </option>
              ))}
            </SearchableSelect>
          </div>
        )}

        {/* Target Scope Selection */}
        {hasStudentsList && (
          <div className="space-y-2 pt-2">
            <label className="text-xs font-semibold text-foreground">Target Students</label>
            <div className={`grid gap-1.5 ${hasSelectedMultiple ? "grid-cols-3" : "grid-cols-2"}`}>
              <button
                type="button"
                onClick={() => setTargetScope("all")}
                className={`py-2 px-2 text-xs font-semibold rounded-lg border transition-all text-center truncate ${
                  targetScope === "all"
                    ? "bg-primary text-primary-foreground border-primary shadow-xs"
                    : "bg-background border-border text-foreground hover:bg-muted"
                }`}
              >
                Entire Cohort ({studentCount || students.length})
              </button>
              {hasSelectedMultiple && (
                <button
                  type="button"
                  onClick={() => setTargetScope("selected")}
                  className={`py-2 px-2 text-xs font-semibold rounded-lg border transition-all text-center truncate ${
                    targetScope === "selected"
                      ? "bg-primary text-primary-foreground border-primary shadow-xs"
                      : "bg-background border-border text-foreground hover:bg-muted"
                  }`}
                >
                  Selected ({selectedStudentIds.length})
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  setTargetScope("single");
                  if (!selectedStudentId && students[0]?.id) {
                    setSelectedStudentId(String(students[0].id));
                  }
                }}
                className={`py-2 px-2 text-xs font-semibold rounded-lg border transition-all text-center truncate ${
                  targetScope === "single"
                    ? "bg-primary text-primary-foreground border-primary shadow-xs"
                    : "bg-background border-border text-foreground hover:bg-muted"
                }`}
              >
                Single Student
              </button>
            </div>

            {targetScope === "single" && (
              <div className="space-y-1.5 pt-1">
                <label className="text-xs text-muted-foreground font-medium">Select Student</label>
                <SearchableSelect
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(String(e.target.value))}
                  placeholder="Select student…"
                  searchPlaceholder="Search student by name or email…"
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs sm:text-sm"
                >
                  {students.map((st) => (
                    <option key={st.id} value={st.id}>
                      {studentName(st)} {st.email ? `(${st.email})` : ""}
                    </option>
                  ))}
                </SearchableSelect>

                {/* Current student preview card */}
                {activeStudent && (
                  <div className="p-2.5 rounded-lg border border-border bg-muted/30 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-7 h-7 rounded-full bg-primary/10 border border-primary/30 text-primary font-bold flex items-center justify-center shrink-0 text-xs">
                        {studentName(activeStudent).charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-foreground truncate">{studentName(activeStudent)}</p>
                        <p className="text-[10.5px] text-muted-foreground truncate">{activeStudent.email || "No email"}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-extrabold text-amber-600 block">{currentStudentXp} XP</span>
                      <span className="text-[10px] text-muted-foreground font-medium">Level {currentLevelInfo?.level || 1}</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB 1: GIFT / DEDUCT XP */}
        {activeTab === "xp" && (
          <div className="space-y-3 pt-2">
            {/* Mode switch */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setXpMode("gift")}
                className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
                  xpMode === "gift"
                    ? "bg-emerald-600 text-white border-emerald-700 shadow-sm"
                    : "bg-background border-border text-foreground hover:bg-muted"
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Gift XP (Award)</span>
              </button>
              <button
                type="button"
                onClick={() => setXpMode("deduct")}
                className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
                  xpMode === "deduct"
                    ? "bg-rose-600 text-white border-rose-700 shadow-sm"
                    : "bg-background border-border text-foreground hover:bg-muted"
                }`}
              >
                <Minus className="w-3.5 h-3.5" />
                <span>Deduct XP</span>
              </button>
            </div>

            {/* Presets */}
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground font-medium">Quick Amount Presets</label>
              <div className="grid grid-cols-4 gap-1.5">
                {(xpMode === "gift" ? giftPresets : deductPresets).map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setXpAmount(String(val))}
                    className={`py-1.5 px-2 rounded-md text-xs font-bold border transition-all text-center ${
                      String(val) === String(xpAmount)
                        ? xpMode === "gift"
                          ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/40"
                          : "bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/40"
                        : "bg-muted/40 border-border text-foreground hover:bg-muted"
                    }`}
                  >
                    {xpMode === "gift" ? `+${val}` : `-${val}`}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Amount */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">XP Amount</label>
              <div className="relative">
                <span className={`absolute left-3 top-1/2 -translate-y-1/2 font-bold text-sm ${
                  xpMode === "gift" ? "text-emerald-600" : "text-rose-600"
                }`}>
                  {xpMode === "gift" ? "+" : "-"}
                </span>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={xpAmount}
                  onChange={(e) => setXpAmount(e.target.value)}
                  placeholder="e.g. 50"
                  className="w-full bg-background border border-border rounded-lg pl-7 pr-12 py-2 text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground">
                  XP
                </span>
              </div>
            </div>

            {/* Reason or Note */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">Reason / Note (Sent to Student)</label>
              <input
                type="text"
                value={xpReason}
                onChange={(e) => setXpReason(e.target.value)}
                placeholder="e.g. Outstanding capstone project, participation bonus, extra credit"
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs sm:text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>

            {/* Projected Balance preview for single student */}
            {isSingle && projectedXp !== null && (
              <div className="p-3 rounded-xl border border-border bg-card shadow-xs flex items-center justify-between text-xs">
                <div>
                  <span className="text-muted-foreground block text-[11px]">Current Balance</span>
                  <span className="font-bold text-foreground">{currentStudentXp} XP (Lvl {currentLevelInfo?.level})</span>
                </div>
                <span className="text-muted-foreground font-bold text-sm">→</span>
                <div className="text-right">
                  <span className="text-muted-foreground block text-[11px]">Projected Balance</span>
                  <span className={`font-extrabold ${xpMode === "gift" ? "text-emerald-600" : "text-rose-600"}`}>
                    {projectedXp} XP (Lvl {projectedLevelInfo?.level})
                  </span>
                </div>
              </div>
            )}

            {/* Footer Buttons */}
            <div className="flex justify-end gap-2 pt-3 border-t border-border/40">
              <Button variant="outline" size="sm" onClick={onClose} disabled={loading || isSubmittingXp}>
                Cancel
              </Button>
              <Button
                size="sm"
                className={`font-bold ${
                  xpMode === "gift"
                    ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                    : "bg-rose-600 hover:bg-rose-700 text-white shadow-sm"
                }`}
                disabled={!canConfirmXp}
                onClick={handleConfirmXp}
              >
                {isSubmittingXp
                  ? "Updating XP..."
                  : xpMode === "gift"
                  ? `Gift +${parsedXpAmount} XP`
                  : `Deduct -${parsedXpAmount} XP`}
              </Button>
            </div>
          </div>
        )}

        {/* TAB 2: RESET PROGRESS ITEMS */}
        {activeTab === "reset" && (
          <div className="space-y-3 pt-2">
            <div className="p-3 rounded-lg border border-rose-500/30 bg-rose-500/10 text-rose-800 dark:text-rose-300 flex items-start gap-2.5 text-xs">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
              <p className="leading-relaxed">
                Choose what to reset for <strong>{countLabel}</strong>. Resetting clears historical progress and cannot be undone.
              </p>
            </div>

            <div className="space-y-1.5 py-1">
              {RESET_OPTIONS.map((option) => (
                <label
                  key={option.key}
                  className="flex items-start gap-2.5 rounded-lg border border-border p-2.5 cursor-pointer hover:bg-muted/40 transition-colors"
                >
                  <input
                    type="checkbox"
                    className="mt-0.5 h-4 w-4 accent-primary rounded shrink-0 cursor-pointer"
                    checked={!!flags[option.key]}
                    onChange={() =>
                      setFlags((prev) => ({ ...prev, [option.key]: !prev[option.key] }))
                    }
                  />
                  <div className="min-w-0">
                    <span className="block text-xs sm:text-sm font-semibold text-foreground">{option.label}</span>
                    <span className="block text-[11px] text-muted-foreground leading-tight">{option.hint}</span>
                  </div>
                </label>
              ))}
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-border/40">
              <Button variant="outline" size="sm" onClick={onClose} disabled={loading}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                disabled={!canConfirmReset}
                onClick={handleConfirmReset}
                className="font-bold shadow-sm"
              >
                {loading ? "Resetting..." : `Reset ${countLabel}`}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// Named alias export for convenience
export { ResetProgressModal as UpdateProgressModal };
