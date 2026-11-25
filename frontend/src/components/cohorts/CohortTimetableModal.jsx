import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  X, Calendar, Clock, Video, Search, Edit3,
  Save, ChevronDown, FileText, Settings2, Sparkles, Coffee, AlertCircle
} from "lucide-react";
import { apiFetch } from "@/api/client/apiClient";
import { customToast as toast } from "@/components/notifications/GlobalPopup";
import ModernDatePicker from "../ui/ModernDatePicker";
import ModernTimePicker from "../ui/ModernTimePicker";
import {
  formatLessonScheduleDate,
  calculateTimetableStats,
  SCHEDULE_STATUSES,
  getStatusConfig,
  DAY_NAMES,
  FULL_DAY_NAMES,
  localISODate,
  formatTodayLabel,
  formatSessionDuration,
  formatHolidayChip,
  holidayDate,
  holidayLabel,
  normalizeHolidays,
  getScheduleDisplayTitle,
} from "../../utils/scheduleUtils";

const TERMS = [
  { id: "term_1", label: "Term 1" },
  { id: "term_2", label: "Term 2" },
  { id: "term_3", label: "Term 3" },
];

export default function CohortTimetableModal({
  cohort,
  isOpen,
  onClose,
  isInstructor = false,
  onScheduleUpdated,
  activeLessonId,
  onSelectLesson,
}) {
  const [schedules, setSchedules] = useState(cohort?.schedules || []);
  const [selectedTerm, setSelectedTerm] = useState(cohort?.current_term || "term_1");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("timetable"); // "timetable" | "generator"
  const [editingNotesId, setEditingNotesId] = useState(null);
  const [noteDraft, setNoteDraft] = useState("");
  const [savingNote, setSavingNote] = useState(false);

  // Term-specific generation states
  const [termStartDate, setTermStartDate] = useState("");
  const [termEndDate, setTermEndDate] = useState("");
  const [halfTermBreakStart, setHalfTermBreakStart] = useState("");
  const [halfTermBreakEnd, setHalfTermBreakEnd] = useState("");
  const [genDays, setGenDays] = useState(cohort?.schedule_days || [0, 2]);
  const [genDayStartTimes, setGenDayStartTimes] = useState({});
  const [genDayEndTimes, setGenDayEndTimes] = useState({});
  const [expandedDays, setExpandedDays] = useState(() => new Set(cohort?.schedule_days || [0, 2]));
  const [genHolidays, setGenHolidays] = useState(() => normalizeHolidays(cohort?.holidays || []));
  const [newHolidayInput, setNewHolidayInput] = useState("");
  const [newHolidayLabel, setNewHolidayLabel] = useState("");
  const [generating, setGenerating] = useState(false);

  const listRef = useRef(null);
  const todayRef = useRef(null);
  const todayStr = localISODate();
  const todayLabel = formatTodayLabel();

  // Load term settings whenever cohort or selectedTerm changes
  useEffect(() => {
    if (cohort) {
      setSchedules(cohort.schedules || []);
      const termsCfg = cohort.terms_config || {};
      const currentCfg = termsCfg[selectedTerm] || {};

      const sDate = currentCfg.start_date || (selectedTerm === "term_1" ? cohort.start_date : "");
      const eDate = currentCfg.end_date || (selectedTerm === "term_1" ? cohort.end_date : "");
      setTermStartDate(sDate || "");
      setTermEndDate(eDate || "");

      const ht = currentCfg.half_term_break;
      if (ht && typeof ht === "object") {
        setHalfTermBreakStart(ht.start || "");
        setHalfTermBreakEnd(ht.end || "");
      } else {
        setHalfTermBreakStart("");
        setHalfTermBreakEnd("");
      }

      const days = currentCfg.schedule_days?.length
        ? currentCfg.schedule_days
        : cohort.schedule_days?.length
        ? cohort.schedule_days
        : [0, 2];
      setGenDays(days);
      setExpandedDays(new Set(days));

      const termHols = currentCfg.holidays?.length
        ? currentCfg.holidays
        : (selectedTerm === "term_1" ? cohort.holidays : []);
      setGenHolidays(normalizeHolidays(termHols || []));

      const starts = {};
      const ends = {};
      (cohort.schedules || []).forEach((s) => {
        if (!s.date) return;
        const d = new Date(`${s.date}T12:00:00`);
        const wd = (d.getDay() + 6) % 7; // Mon=0
        if (s.start_time && starts[wd] == null) starts[wd] = s.start_time.slice(0, 5);
        if (s.end_time && ends[wd] == null) ends[wd] = s.end_time.slice(0, 5);
      });
      if (cohort.schedule_end_time) {
        days.forEach((d) => {
          if (ends[d] == null) ends[d] = String(cohort.schedule_end_time).slice(0, 5);
        });
      }
      setGenDayStartTimes(starts);
      setGenDayEndTimes(ends);
    }
  }, [cohort, selectedTerm]);

  // Filter schedules strictly for the selected term
  const termSchedules = useMemo(() => {
    return schedules.filter((s) => {
      const sTerm = s.term || "term_1";
      return sTerm === selectedTerm;
    });
  }, [schedules, selectedTerm]);

  // Scroll today's lesson into the center of the timetable list
  useEffect(() => {
    if (!isOpen || activeTab !== "timetable") return;
    const t = setTimeout(() => {
      const row = todayRef.current;
      const list = listRef.current;
      if (!row || !list) return;
      const listRect = list.getBoundingClientRect();
      const rowRect = row.getBoundingClientRect();
      const offset =
        rowRect.top - listRect.top - listRect.height / 2 + rowRect.height / 2 + list.scrollTop;
      list.scrollTo({ top: Math.max(0, offset), behavior: "smooth" });
    }, 160);
    return () => clearTimeout(t);
  }, [isOpen, activeTab, termSchedules, statusFilter, searchQuery]);

  const stats = useMemo(() => calculateTimetableStats(cohort, termSchedules), [cohort, termSchedules]);

  const filteredSchedules = useMemo(() => {
    return termSchedules.filter((s) => {
      if (statusFilter !== "all" && (s.status || "scheduled") !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const displayTitle = getScheduleDisplayTitle(s, cohort?.start_date);
        const titleMatch = (displayTitle || s.lesson_title || "").toLowerCase().includes(q);
        const dateMatch = (s.date || "").includes(q);
        const moduleMatch = (s.module_title || "").toLowerCase().includes(q);
        return titleMatch || dateMatch || moduleMatch;
      }
      return true;
    });
  }, [termSchedules, statusFilter, searchQuery, cohort?.start_date]);

  const handleStatusChange = async (scheduleId, newStatus) => {
    const prev = schedules;
    setSchedules((list) => list.map((s) => (s.id === scheduleId ? { ...s, status: newStatus } : s)));
    try {
      const res = await apiFetch(`/api/admin/cohort-schedules/${scheduleId}/`, {
        method: "PATCH",
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        toast.success("Status updated");
        if (onScheduleUpdated) onScheduleUpdated();
      } else {
        setSchedules(prev);
        toast.error("Failed to update status");
      }
    } catch (err) {
      console.error(err);
      setSchedules(prev);
      toast.error("Error updating status");
    }
  };

  const handleSaveNotes = async (scheduleId) => {
    setSavingNote(true);
    try {
      const res = await apiFetch(`/api/admin/cohort-schedules/${scheduleId}/`, {
        method: "PATCH",
        body: JSON.stringify({ instructor_notes: noteDraft }),
      });
      if (res.ok) {
        setSchedules((list) =>
          list.map((s) => (s.id === scheduleId ? { ...s, instructor_notes: noteDraft } : s))
        );
        setEditingNotesId(null);
        toast.success("Instructor note saved");
        if (onScheduleUpdated) onScheduleUpdated();
      } else {
        toast.error("Failed to save note");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error saving note");
    } finally {
      setSavingNote(false);
    }
  };

  const handleGenerateSchedule = async () => {
    if (!termStartDate || !termEndDate) {
      toast.error(`Please provide both Start Date and End Date for ${selectedTerm.replace("_", " ").toUpperCase()}.`);
      return;
    }
    if (termStartDate > termEndDate) {
      toast.error("Start date must be before or equal to End date.");
      return;
    }
    if (!genDays || genDays.length === 0) {
      toast.error("Please select at least one schedule day of the week.");
      return;
    }

    setGenerating(true);
    try {
      const day_times = {};
      const day_end_times = {};
      genDays.forEach((d) => {
        if (genDayStartTimes[d]) day_times[d] = genDayStartTimes[d];
        if (genDayEndTimes[d]) day_end_times[d] = genDayEndTimes[d];
      });
      const firstEnd = genDays.map((d) => genDayEndTimes[d]).find(Boolean) || null;

      const half_term_break =
        halfTermBreakStart && halfTermBreakEnd
          ? { start: halfTermBreakStart, end: halfTermBreakEnd }
          : null;

      const res = await apiFetch(`/api/admin/cohorts/${cohort.id}/generate-schedule/`, {
        method: "POST",
        body: JSON.stringify({
          term: selectedTerm,
          start_date: termStartDate,
          end_date: termEndDate,
          half_term_break,
          schedule_days: genDays,
          schedule_time: null,
          schedule_end_time: firstEnd,
          day_times,
          day_end_times,
          lessons_per_session: 1,
          holidays: normalizeHolidays(genHolidays),
          clear_existing: true,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        toast.success(data.message || "Timetable generated successfully!");
        if (data.cohort?.schedules) {
          setSchedules(data.cohort.schedules);
        }
        setActiveTab("timetable");
        if (onScheduleUpdated) onScheduleUpdated();
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.error || "Failed to generate timetable");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error generating timetable");
    } finally {
      setGenerating(false);
    }
  };

  const addHoliday = () => {
    if (!newHolidayInput) return;
    const existing = normalizeHolidays(genHolidays);
    if (existing.some((h) => holidayDate(h) === newHolidayInput)) {
      toast.info("Date is already in the skip list");
      return;
    }
    const label = newHolidayLabel.trim();
    setGenHolidays(normalizeHolidays([...existing, { date: newHolidayInput, label }]));
    setNewHolidayInput("");
    setNewHolidayLabel("");
  };

  const removeHoliday = (dateStr) => {
    setGenHolidays((prev) => normalizeHolidays(prev).filter((h) => holidayDate(h) !== dateStr));
  };

  const toggleDay = (dayIndex) => {
    setGenDays((prev) => {
      const next = prev.includes(dayIndex)
        ? prev.filter((d) => d !== dayIndex)
        : [...prev, dayIndex].sort((a, b) => a - b);
      return next;
    });
    setExpandedDays((prev) => {
      const next = new Set(prev);
      if (next.has(dayIndex)) next.delete(dayIndex);
      else next.add(dayIndex);
      return next;
    });
  };

  const toggleDayDrawer = (dayIndex) => {
    setExpandedDays((prev) => {
      const next = new Set(prev);
      if (next.has(dayIndex)) next.delete(dayIndex);
      else next.add(dayIndex);
      return next;
    });
  };

  if (!isOpen || !cohort) return null;

  const routineLabel =
    stats.scheduleDays.length > 0
      ? stats.scheduleDays.map((d) => DAY_NAMES[d]).join("/")
      : "Custom";

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/60 animate-in fade-in duration-150 p-2 sm:p-6 lg:p-8">
      <div className="bg-background w-full max-w-6xl h-full max-h-[92vh] flex-1 min-h-0 overflow-hidden flex flex-col border border-border rounded-xl sm:rounded-2xl shadow-2xl mx-auto">
        {/* Header */}
        <div className="px-3.5 py-3 sm:px-6 sm:py-4 border-b border-border flex justify-between items-center shrink-0 bg-card min-w-0">
          <div className="min-w-0 pr-2 flex-1">
            <div className="flex items-center gap-2 min-w-0 flex-wrap">
              <h2 className="text-base sm:text-xl font-extrabold truncate text-foreground">
                Cohort Timetable
              </h2>
              <span className="text-[11px] sm:text-xs font-bold px-2 py-0.5 rounded border border-border text-foreground shrink-0 bg-secondary">
                {stats.weeksCount} Weeks
              </span>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground truncate mt-0.5">
              <span className="font-bold text-foreground">{cohort.name}</span>
              {cohort.course_name && ` · ${cohort.course_name}`}
            </p>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {isInstructor && (
              <div className="flex rounded-lg border border-border p-0.5 bg-muted/40 text-[11px] font-semibold">
                <button
                  type="button"
                  onClick={() => setActiveTab("timetable")}
                  className={`px-2.5 py-1 rounded-md transition-colors ${
                    activeTab === "timetable"
                      ? "bg-background text-foreground font-bold shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  List
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("generator")}
                  className={`px-2.5 py-1 rounded-md transition-colors flex items-center gap-1 ${
                    activeTab === "generator"
                      ? "bg-background text-foreground font-bold shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Settings2 className="w-3 h-3" /> Settings
                </button>
              </div>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-muted rounded-full text-foreground shrink-0"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Term Tabs Navigation Bar */}
        <div className="px-3 sm:px-6 py-2 bg-muted/30 border-b border-border flex items-center justify-between gap-2 overflow-x-auto shrink-0">
          <div className="flex items-center gap-1 sm:gap-2">
            {TERMS.map((term) => {
              const isCurrent = cohort.current_term === term.id;
              const isSelected = selectedTerm === term.id;
              const count = schedules.filter((s) => (s.term || "term_1") === term.id).length;

              return (
                <button
                  key={term.id}
                  type="button"
                  onClick={() => setSelectedTerm(term.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 border ${
                    isSelected
                      ? "bg-primary text-primary-foreground border-primary shadow-xs"
                      : "bg-background text-muted-foreground border-border hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <span>{term.label}</span>
                  {count > 0 && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${
                        isSelected ? "bg-primary-foreground/20 text-primary-foreground" : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {count}
                    </span>
                  )}
                  {isCurrent && (
                    <span
                      className={`text-[9px] uppercase px-1 py-0.2 rounded font-extrabold ${
                        isSelected ? "bg-white text-primary" : "bg-emerald-500/20 text-emerald-700 dark:text-emerald-400"
                      }`}
                    >
                      Active
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="hidden sm:flex items-center text-xs text-muted-foreground gap-1 shrink-0 font-medium">
            <span>Viewing:</span>
            <strong className="text-foreground">{selectedTerm.replace("_", " ").toUpperCase()}</strong>
          </div>
        </div>

        {/* Full-width stats row */}
        <div className="px-2.5 py-2 sm:px-6 sm:py-2.5 border-b border-border shrink-0 overflow-hidden bg-card/40">
          <div className="grid grid-cols-7 gap-1 sm:gap-2 w-full">
            {[
              { key: "total", label: "Total", value: stats.total, className: "bg-zinc-900 text-white border border-zinc-950" },
              { key: "taught", label: "Taught", value: stats.taught, className: getStatusConfig("taught").solidStat },
              { key: "missed", label: "Missed", value: stats.missed, className: getStatusConfig("missed").solidStat },
              { key: "postponed", label: "Postponed", value: stats.postponed, className: getStatusConfig("postponed").solidStat },
              { key: "covered", label: "Covered", value: stats.covered, className: getStatusConfig("covered").solidStat },
              { key: "remaining", label: "Remaining", value: stats.remaining, className: getStatusConfig("scheduled").solidStat },
              { key: "routine", label: "Routine", value: routineLabel, className: "bg-zinc-900 text-white border border-zinc-950", title: routineLabel },
            ].map((stat) => (
              <div
                key={stat.key}
                title={stat.title || `${stat.label}: ${stat.value}`}
                className={`w-full min-w-0 h-11 sm:h-16 rounded-md flex flex-col items-center justify-center px-0.5 sm:px-1 text-center overflow-hidden ${stat.className}`}
              >
                <div className="text-[7.5px] sm:text-xs font-extrabold uppercase tracking-wide leading-none truncate max-w-full">
                  {stat.label}
                </div>
                <div
                  className={`font-extrabold tabular-nums leading-none mt-0.5 sm:mt-1 truncate max-w-full ${
                    stat.key === "routine"
                      ? "text-[8.5px] sm:text-sm px-0.5"
                      : "text-xs sm:text-2xl"
                  }`}
                >
                  {stat.value}
                </div>
              </div>
            ))}
          </div>
        </div>

        {activeTab === "generator" ? (
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            <div className="flex-1 overflow-y-auto overscroll-contain p-3.5 sm:p-6 min-h-0 pb-4">
              <div className="border border-border rounded-xl p-4 sm:p-6 bg-card/60 space-y-4 max-w-4xl mx-auto">
                <div className="flex items-center justify-between border-b border-border pb-2.5">
                  <div className="flex items-center gap-2">
                    <Settings2 className="w-5 h-5 text-primary" />
                    <h3 className="font-extrabold text-base sm:text-lg text-foreground">
                      Timetable Settings - {selectedTerm.replace("_", " ").toUpperCase()}
                    </h3>
                  </div>
                  <span className="text-xs font-bold text-muted-foreground">
                    Strict Term Scope
                  </span>
                </div>

                {/* Explanation Banner */}
                <div className="p-3.5 rounded-xl bg-primary/5 border border-primary/20 space-y-1">
                  <p className="text-xs sm:text-sm font-extrabold text-foreground flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-primary shrink-0" />
                    Intelligent Term Scoping &amp; Capstone Project Flow
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Schedules strictly for <strong>{selectedTerm.replace("_", " ").toUpperCase()}</strong> without spilling into next term.
                    Core lessons (1–16) are scheduled first (8 weeks minimum). If this term has more than 8 weeks, remaining sessions dynamically become guided <strong>Capstone Project</strong> milestones!
                  </p>
                </div>

                {/* Term Dates - Vertically Aligned & Mobile Responsive */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                  <div className="w-full">
                    <label className="block text-xs font-bold uppercase tracking-wider text-foreground mb-1.5">
                      {selectedTerm.replace("_", " ").toUpperCase()} Start Date *
                    </label>
                    <ModernDatePicker
                      value={termStartDate}
                      onChange={setTermStartDate}
                      placeholder="Select term start date"
                      allowClear={false}
                      className="w-full max-w-none"
                    />
                  </div>
                  <div className="w-full">
                    <label className="block text-xs font-bold uppercase tracking-wider text-foreground mb-1.5">
                      {selectedTerm.replace("_", " ").toUpperCase()} End Date *
                    </label>
                    <ModernDatePicker
                      value={termEndDate}
                      onChange={setTermEndDate}
                      placeholder="Select term end date"
                      allowClear={false}
                      min={termStartDate || undefined}
                      className="w-full max-w-none"
                    />
                  </div>
                </div>

                {/* Half Term Break - Optional & Clearable */}
                <div className="border border-border rounded-xl p-3.5 bg-background space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <Coffee className="w-4 h-4 text-amber-500" />
                        <label className="text-xs font-bold uppercase tracking-wider text-foreground">
                          Half Term Break (Optional)
                        </label>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        Not mandatory. Leave blank if this term does not have a half-term break.
                      </p>
                    </div>
                    {(halfTermBreakStart || halfTermBreakEnd) && (
                      <button
                        type="button"
                        onClick={() => {
                          setHalfTermBreakStart("");
                          setHalfTermBreakEnd("");
                        }}
                        className="text-xs font-bold text-rose-600 hover:underline"
                      >
                        Clear break
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div className="w-full">
                      <label className="block text-[11px] font-semibold text-muted-foreground mb-1">
                        Break Start
                      </label>
                      <ModernDatePicker
                        value={halfTermBreakStart}
                        onChange={setHalfTermBreakStart}
                        placeholder="Break start (optional)"
                        className="w-full max-w-none"
                      />
                    </div>
                    <div className="w-full">
                      <label className="block text-[11px] font-semibold text-muted-foreground mb-1">
                        Break End
                      </label>
                      <ModernDatePicker
                        value={halfTermBreakEnd}
                        onChange={setHalfTermBreakEnd}
                        placeholder="Break end (optional)"
                        min={halfTermBreakStart || undefined}
                        className="w-full max-w-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Lesson Days */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-foreground mb-2">
                    Class Days of Week
                  </label>
                  <div className="grid grid-cols-7 gap-1.5">
                    {DAY_NAMES.map((name, idx) => {
                      const isSelected = genDays.includes(idx);
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => toggleDay(idx)}
                          className={`py-2 px-0.5 text-center text-xs sm:text-sm font-bold rounded-lg border transition-all ${
                            isSelected
                              ? "bg-primary text-primary-foreground border-primary"
                              : "bg-background text-muted-foreground border-border"
                          }`}
                        >
                          {name}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Day drawers with start/end */}
                {genDays.length > 0 && (
                  <div className="space-y-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-foreground">
                      Times per day
                    </label>
                    {genDays.map((dayIdx) => {
                      const open = expandedDays.has(dayIdx);
                      const start = genDayStartTimes[dayIdx] || "";
                      const end = genDayEndTimes[dayIdx] || "";
                      const duration = formatSessionDuration(start, end);
                      return (
                        <div key={dayIdx} className="rounded-xl border border-border bg-background overflow-hidden shadow-xs">
                          <button
                            type="button"
                            onClick={() => toggleDayDrawer(dayIdx)}
                            className="w-full flex items-center justify-between gap-2 px-3.5 py-2.5 text-left hover:bg-muted/30 transition-colors"
                          >
                            <div className="min-w-0">
                              <span className="text-sm font-extrabold text-foreground">
                                {FULL_DAY_NAMES[dayIdx]}
                              </span>
                              <span className="block text-xs text-muted-foreground truncate mt-0.5">
                                {start || end
                                  ? `${start || "any"} → ${end || "-"}`
                                  : "Start any time · set end"}
                                {duration ? ` · ${duration}` : ""}
                              </span>
                            </div>
                            <span className={`tt-chevron shrink-0 ${open ? "is-open" : ""}`} aria-hidden="true">
                              <ChevronDown className="w-4 h-4" />
                            </span>
                          </button>
                          {open && (
                            <div className="px-3.5 pb-3 pt-0 grid grid-cols-1 sm:grid-cols-2 gap-2.5 border-t border-border/60 bg-muted/10">
                              <div className="pt-2">
                                <label className="text-xs font-bold text-muted-foreground uppercase">Start</label>
                                <div className="mt-1">
                                  <ModernTimePicker
                                    value={start}
                                    onChange={(v) =>
                                      setGenDayStartTimes((prev) => ({ ...prev, [dayIdx]: v }))
                                    }
                                    placeholder="Any time"
                                    className="w-full max-w-none"
                                  />
                                </div>
                              </div>
                              <div className="pt-2">
                                <label className="text-xs font-bold text-muted-foreground uppercase">End</label>
                                <div className="mt-1">
                                  <ModernTimePicker
                                    value={end}
                                    onChange={(v) =>
                                      setGenDayEndTimes((prev) => ({ ...prev, [dayIdx]: v }))
                                    }
                                    placeholder="Set end"
                                    className="w-full max-w-none"
                                  />
                                </div>
                              </div>
                              {duration && (
                                <div className="col-span-1 sm:col-span-2 flex items-center gap-1.5 text-xs font-semibold text-foreground bg-card border border-border rounded-lg px-2.5 py-1.5">
                                  <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                                  Duration: {duration}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Skip holidays / activities - Vertical Stack on Mobile */}
                <div className="pt-2 border-t border-border">
                  <label className="block text-xs font-bold uppercase tracking-wider text-foreground mb-1">
                    Skip holidays / activities
                  </label>
                  <p className="text-xs text-muted-foreground mb-2.5">
                    Days when lessons will not happen - public holidays, sports day, exams, and similar.
                  </p>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mb-2.5">
                    <ModernDatePicker
                      value={newHolidayInput}
                      onChange={setNewHolidayInput}
                      placeholder="Pick skip date"
                      className="w-full sm:w-44 max-w-none"
                    />
                    <input
                      type="text"
                      value={newHolidayLabel}
                      onChange={(e) => setNewHolidayLabel(e.target.value)}
                      placeholder="Reason (e.g. Independence Day, Sports Day)"
                      className="tt-datetime h-10 w-full sm:flex-1 px-3 text-sm font-semibold rounded-xl border border-input bg-background"
                    />
                    <button
                      type="button"
                      onClick={addHoliday}
                      className="h-10 px-4 bg-secondary text-secondary-foreground text-sm font-bold rounded-xl border border-border hover:bg-secondary/80 transition-colors shrink-0"
                    >
                      Add day
                    </button>
                  </div>
                  {genHolidays.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto">
                      {normalizeHolidays(genHolidays).map((h) => {
                        const chip = formatHolidayChip(h);
                        const date = holidayDate(h);
                        return (
                          <span
                            key={date}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-600 text-white"
                            title={holidayLabel(h) || "Skipped day"}
                          >
                            {chip}
                            <button
                              type="button"
                              onClick={() => removeHoliday(date)}
                              aria-label={`Remove ${chip}`}
                              className="rounded-full p-0.5 hover:bg-white/20"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </span>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground italic">No skip days marked.</p>
                  )}
                </div>
              </div>
            </div>

            {/* Sticky generate bar */}
            <div className="shrink-0 border-t border-border bg-card/95 backdrop-blur-sm px-4 py-3 sm:px-6 sm:py-3.5 flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setActiveTab("timetable")}
                className="px-4 py-2 border border-border rounded-xl text-xs sm:text-sm font-bold hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleGenerateSchedule}
                disabled={generating}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-xl text-xs sm:text-sm font-bold disabled:opacity-50 hover:bg-primary/90 transition-colors"
              >
                {generating ? "Generating…" : `Generate ${selectedTerm.replace("_", " ").toUpperCase()} Timetable`}
              </button>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden min-w-0">
            {/* Today banner */}
            <button
              type="button"
              onClick={() => {
                const row = todayRef.current;
                const list = listRef.current;
                if (!row || !list) return;
                const listRect = list.getBoundingClientRect();
                const rowRect = row.getBoundingClientRect();
                const offset =
                  rowRect.top - listRect.top - listRect.height / 2 + rowRect.height / 2 + list.scrollTop;
                list.scrollTo({ top: Math.max(0, offset), behavior: "smooth" });
              }}
              className="px-4 py-2.5 sm:px-6 sm:py-3 border-b border-border bg-blue-800 shrink-0 text-center w-full hover:bg-blue-900 transition-colors"
            >
              <p className="text-[11px] sm:text-sm font-extrabold text-white break-words [overflow-wrap:anywhere] leading-snug">
                {todayLabel}
              </p>
            </button>

            {/* Search & Filter Bar */}
            <div className="px-3.5 py-2.5 sm:px-6 sm:py-3 border-b border-border bg-card/60 flex flex-col gap-2 shrink-0 min-w-0">
              <div className="relative w-full min-w-0">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search lessons or activities…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-8.5 pl-8 pr-2 text-xs sm:text-sm rounded-lg border border-input bg-background"
                />
              </div>
              <div className="flex items-center gap-1 overflow-x-auto pb-0.5 -mx-0.5 px-0.5 scrollbar-none">
                <button
                  type="button"
                  onClick={() => setStatusFilter("all")}
                  className={`px-2.5 py-1 text-xs rounded font-bold whitespace-nowrap shrink-0 ${
                    statusFilter === "all" ? "bg-foreground text-background" : "bg-muted text-muted-foreground"
                  }`}
                >
                  All ({termSchedules.length})
                </button>
                {SCHEDULE_STATUSES.map((st) => {
                  const count = termSchedules.filter((s) => (s.status || "scheduled") === st.value).length;
                  const isSelected = statusFilter === st.value;
                  return (
                    <button
                      key={st.value}
                      type="button"
                      onClick={() => setStatusFilter(st.value)}
                      className={`px-2.5 py-1 text-xs rounded font-bold whitespace-nowrap shrink-0 ${
                        isSelected ? st.badgeClass : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {st.label} ({count})
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Schedule Items List */}
            <div
              ref={listRef}
              className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden overscroll-contain touch-pan-y p-3 sm:p-6 space-y-2.5 min-w-0"
              style={{ WebkitOverflowScrolling: "touch" }}
            >
              {filteredSchedules.length === 0 ? (
                <div className="text-center py-12 px-4 bg-muted/10 border border-dashed border-border rounded-xl">
                  <Calendar className="w-7 h-7 text-muted-foreground mx-auto mb-2 opacity-50" />
                  <p className="text-sm font-semibold text-foreground">
                    No entries for {selectedTerm.replace("_", " ").toUpperCase()}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                    {termSchedules.length === 0
                      ? isInstructor
                        ? `Configure and generate timetable for ${selectedTerm.replace("_", " ").toUpperCase()} in Settings.`
                        : `No timetable generated yet for ${selectedTerm.replace("_", " ").toUpperCase()}.`
                      : "No lessons match your search filter."}
                  </p>
                  {isInstructor && termSchedules.length === 0 && (
                    <button
                      type="button"
                      onClick={() => setActiveTab("generator")}
                      className="mt-3.5 px-3.5 py-2 bg-primary text-primary-foreground rounded-lg text-xs font-semibold inline-flex items-center gap-1.5"
                    >
                      <Settings2 className="w-3.5 h-3.5" /> Configure {selectedTerm.replace("_", " ").toUpperCase()}
                    </button>
                  )}
                </div>
              ) : (
                filteredSchedules.map((schedule, index) => {
                  const status = schedule.status || "scheduled";
                  const statusConfig = getStatusConfig(status);
                  const isEditingNote = editingNotesId === schedule.id;
                  const isToday = schedule.date === todayStr;
                  const isActive = activeLessonId ? String(schedule.lesson) === String(activeLessonId) : isToday;
                  const isBreak = schedule.activity_type === "half_term_break";
                  const isHoliday = schedule.activity_type === "holiday";
                  const isCapstone = schedule.activity_type === "capstone";

                  return (
                    <div
                      key={schedule.id || index}
                      ref={isActive ? todayRef : undefined}
                      onClick={() => {
                        if (onSelectLesson && schedule.lesson) {
                          onSelectLesson(schedule.lesson);
                        }
                      }}
                      className={`rounded-xl p-3.5 sm:p-4 border min-w-0 ${
                        isBreak
                          ? "bg-amber-500/10 border-amber-500/30"
                          : isHoliday
                          ? "bg-rose-500/10 border-rose-500/30"
                          : isCapstone
                          ? "bg-indigo-500/10 border-indigo-500/30"
                          : "bg-card " + statusConfig.cardClass
                      } ${isActive ? "today-apple-glow" : "shadow-none transition-colors"} ${
                        onSelectLesson && schedule.lesson
                          ? "cursor-pointer hover:border-primary/50 hover:ring-1 hover:ring-primary"
                          : ""
                      }`}
                    >
                      {isToday && (
                        <div className="text-center mb-2">
                          <span className="inline-block text-xs font-extrabold uppercase tracking-wide rounded-md px-2.5 py-0.5 bg-blue-800 text-white border border-blue-900">
                            Today
                          </span>
                        </div>
                      )}

                      {/* Date & Activity Tag */}
                      <div className="flex items-center justify-between gap-2 flex-wrap min-w-0">
                        <p className="text-xs sm:text-sm font-bold text-foreground break-words [overflow-wrap:anywhere] leading-snug">
                          {formatLessonScheduleDate(schedule.date, schedule.start_time, schedule.end_time)}
                        </p>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {isBreak && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-600 text-white border border-amber-700 shadow-xs">
                              Half Term Break
                            </span>
                          )}
                          {isHoliday && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-600 text-white border border-rose-700 shadow-xs">
                              Holiday / Event
                            </span>
                          )}
                          {isCapstone && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-600 text-white border border-indigo-700 shadow-xs">
                              Capstone Project
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Status & Title */}
                      <div className="mt-2 flex items-center gap-2 min-w-0 w-full overflow-hidden">
                        {(!isHoliday && (!isBreak || schedule.lesson)) && (
                          isInstructor ? (
                            <select
                              value={status}
                              onChange={(e) => handleStatusChange(schedule.id, e.target.value)}
                              className={`shrink-0 text-[10px] sm:text-xs font-bold rounded px-2 py-1 outline-none cursor-pointer ${statusConfig.badgeClass}`}
                            >
                              {SCHEDULE_STATUSES.map((st) => (
                                <option key={st.value} value={st.value} className="bg-background text-foreground">
                                  {st.label}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <span className={`shrink-0 inline-flex items-center px-2 py-0.5 rounded text-[10px] sm:text-xs font-bold ${statusConfig.badgeClass}`}>
                              {statusConfig.label}
                            </span>
                          )
                        )}

                        <h4 className="min-w-0 flex-1 text-xs sm:text-base font-bold text-foreground break-words [overflow-wrap:anywhere] leading-snug">
                          {getScheduleDisplayTitle(schedule, cohort?.start_date)}
                        </h4>

                        {schedule.live_class_url && (
                          <a
                            href={schedule.live_class_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="shrink-0 inline-flex items-center gap-1 px-2 py-1 rounded text-[10px] sm:text-xs font-semibold border border-border text-foreground hover:bg-muted"
                          >
                            <Video className="w-3.5 h-3.5" /> Join
                          </a>
                        )}
                      </div>

                      {(() => {
                        const duration = formatSessionDuration(schedule.start_time, schedule.end_time);
                        return (
                          <div className="mt-1.5 flex items-center gap-2 min-w-0 flex-wrap">
                            {duration && (
                              <span className="text-[10px] sm:text-xs font-bold text-foreground bg-muted border border-border rounded px-1.5 py-0.5">
                                {duration}
                              </span>
                            )}
                            {schedule.module_title && (
                              <p className="text-[10px] sm:text-xs text-muted-foreground min-w-0 break-words [overflow-wrap:anywhere]">
                                {schedule.module_title}
                              </p>
                            )}
                          </div>
                        );
                      })()}

                      {isInstructor && !isBreak && !isHoliday && (
                        <div className="pt-2 mt-2 border-t border-border">
                          {isEditingNote ? (
                            <div className="space-y-2">
                              <textarea
                                value={noteDraft}
                                onChange={(e) => setNoteDraft(e.target.value)}
                                placeholder="Private instructor notes…"
                                className="w-full text-xs p-2 rounded-lg border border-input bg-background text-foreground resize-none"
                                rows={2}
                              />
                              <div className="flex justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => setEditingNotesId(null)}
                                  className="px-2 py-1 text-[11px] border border-border text-foreground rounded-md"
                                >
                                  Cancel
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleSaveNotes(schedule.id)}
                                  disabled={savingNote}
                                  className="px-2.5 py-1 text-[11px] bg-primary text-primary-foreground font-semibold rounded-md flex items-center gap-1 disabled:opacity-50"
                                >
                                  <Save className="w-3 h-3" /> Save
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between gap-2 text-[11px] text-muted-foreground">
                              <div className="flex items-center gap-1 truncate min-w-0">
                                <FileText className="w-3 h-3 shrink-0" />
                                <span className="truncate italic">
                                  {schedule.instructor_notes || "No notes"}
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingNotesId(schedule.id);
                                  setNoteDraft(schedule.instructor_notes || "");
                                }}
                                className="text-foreground font-medium shrink-0 flex items-center gap-0.5 hover:underline"
                              >
                                <Edit3 className="w-3 h-3" />
                                {schedule.instructor_notes ? "Edit" : "Note"}
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
