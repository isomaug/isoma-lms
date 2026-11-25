/**
 * LessonSidebar -- The right pane in the CourseViewer.
 * Shows progress bar and expandable modules/lessons.
 * Enforces sequential progress: modules are locked until previous module quiz is passed.
 * Quizzes are locked until all lessons in that module are completed.
 */
import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { FaCheck } from "react-icons/fa";
import {
  FaChevronDown,
  FaChevronUp,
  FaCheckSquare,
  FaRegSquare,
  FaPlayCircle,
  FaTimes,
  FaCertificate,
  FaPuzzlePiece,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaCalendarTimes,
} from "react-icons/fa";
import { customToast as toast } from "@/components/notifications/GlobalPopup";
import { useAuth } from "@/context/AuthContext";
import { formatLessonScheduleDate, getStatusConfig, formatSessionDuration, localISODate, getScheduleDisplayTitle } from "@/utils/scheduleUtils";

// Helper to sanitize lesson titles to standard concise form (e.g., "Week 9 - Lesson 1")
export const cleanLessonTitle = (title) => {
  if (!title) return "";
  const normalized = title.replace(/[-–]/g, "-").trim();
  const m = normalized.match(/^(?:Week\s*(\d+)|W(\d+))\s*[-:]?\s*Lesson\s*(\d+)/i);
  if (m) {
    const wNum = m[1] || m[2];
    const lNum = m[3];
    return `Week ${wNum} - Lesson ${lNum}`;
  }
  const wGeneric = normalized.match(/^(?:Week\s*(\d+)|W(\d+))\s*[-:]\s*(.+)/i);
  if (wGeneric) {
    const wNum = wGeneric[1] || wGeneric[2];
    const rest = wGeneric[3].trim();
    return `Week ${wNum} - ${rest}`;
  }
  return normalized;
};

export const getLessonWeekInfo = (lesson) => {
  if (!lesson) return null;
  const title = (lesson.title || "").replace(/[-–]/g, "-");

  // 1. Direct week match in title, e.g. "Week 9 - ...", "Week 10", "W9"
  const weekMatch = title.match(/Week\s*(\d+)/i) || title.match(/^W(\d+)\b/i);
  if (weekMatch) {
    const weekNum = parseInt(weekMatch[1], 10);
    const lessonMatch = title.match(/Lesson\s*(\d+)/i);
    const milestoneMatch = title.match(/Milestone\s*(\d+)([A-Za-z]?)/i);
    const mNum = milestoneMatch ? parseInt(milestoneMatch[1], 10) : (weekNum >= 9 ? weekNum - 8 : null);
    const mPart = milestoneMatch ? (milestoneMatch[2] || "").toUpperCase() : null;
    return {
      weekNum,
      label: `Week ${weekNum}`,
      milestoneNum: mNum,
      milestonePart: mPart,
      isCapstone: weekNum >= 9 || lesson.order >= 90 || title.toLowerCase().includes("capstone"),
      partLabel: lessonMatch ? `Lesson ${lessonMatch[1]}` : (mPart ? `Part ${mPart}` : null),
    };
  }

  // 2. Capstone Milestone match: "Capstone Milestone 1A", "Milestone 2B", etc.
  const milestoneMatch = title.match(/Milestone\s*(\d+)([A-Za-z]?)/i);
  if (milestoneMatch) {
    const mNum = parseInt(milestoneMatch[1], 10);
    const mPart = (milestoneMatch[2] || "").toUpperCase();
    const weekNum = 8 + mNum;
    const partLabel = mPart === "A" ? "Lesson 1" : mPart === "B" ? "Lesson 2" : (mPart ? `Part ${mPart}` : null);
    return {
      weekNum,
      label: `Week ${weekNum}`,
      milestoneNum: mNum,
      milestonePart: mPart,
      partLabel,
      isCapstone: true,
    };
  }

  // 3. Fallback based on order (e.g. order 90 = Week 9 Lesson 1, 91 = Week 9 Lesson 2, 100 = Week 10, etc.)
  if (lesson.order >= 90) {
    const mNum = Math.floor((lesson.order - 90) / 10) + 1;
    const isPartB = (lesson.order % 10) === 1;
    const weekNum = 8 + mNum;
    return {
      weekNum,
      label: `Week ${weekNum}`,
      milestoneNum: mNum,
      milestonePart: isPartB ? "B" : "A",
      partLabel: isPartB ? "Lesson 2" : "Lesson 1",
      isCapstone: true,
    };
  }

  if (title.toLowerCase().includes("capstone")) {
    return {
      weekNum: 9,
      label: "Week 9+",
      isCapstone: true,
    };
  }

  return null;
};

export default function LessonSidebar({
  modules = [],
  userCohort,
  completedLessonIds = [],
  progressPercent = 0,
  activeLessonId,
  activeQuizId,
  certificateUrl,
  quizAttemptsMap = {},
  expandedModules,
  setExpandedModules,
  onOpenCertificateModal,
  onSelectLesson,
  onSelectQuiz,
  onClaimTermCertificate,
  onViewTermCertificate,
  onCloseMobile, // For mobile drawer close
  onUpgradeClick,
  onOpenTimetable,
}) {
  const { me } = useAuth();
  const isAdmin = me?.is_staff || me?.is_superuser || me?.is_instructor;
  
  const [localVisibility, setLocalVisibility] = useState({});
  const activeLessonRef = useRef(null);
  const scrollContainerRef = useRef(null);

  useEffect(() => {
    if (activeLessonId) {
      let targetModId = null;
      for (const m of modules) {
        if (m.lessons?.some(l => l.id === activeLessonId)) {
          targetModId = m.id;
          break;
        }
      }
      if (targetModId && !expandedModules[targetModId]) {
        setExpandedModules(prev => ({ ...prev, [targetModId]: true }));
      }

      const scrollToActiveLesson = (behavior = "smooth") => {
        const container = scrollContainerRef.current;
        const el = activeLessonRef.current || document.getElementById(`sidebar-lesson-${activeLessonId}`);
        if (container && el) {
          const containerRect = container.getBoundingClientRect();
          const elRect = el.getBoundingClientRect();
          const offsetDiff = elRect.top - containerRect.top;
          container.scrollBy({ top: offsetDiff, behavior });
        } else if (el) {
          el.scrollIntoView({ behavior, block: "start" });
        }
      };

      scrollToActiveLesson("auto");
      const t1 = setTimeout(() => scrollToActiveLesson("smooth"), 120);
      const t2 = setTimeout(() => scrollToActiveLesson("smooth"), 320);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    }
  }, [activeLessonId, modules]);

  const toggleModule = (moduleId) => {
    setExpandedModules((prev) => ({
      ...prev,
      [moduleId]: !prev[moduleId],
    }));
  };



  // ── Sequential lock logic ──
  // A module is locked if the PREVIOUS module has a quiz that hasn't been passed.
  // A quiz is locked if not all lessons in its module are completed.
  const getModuleLockState = (moduleIndex) => {
    if (isAdmin) return false; // instructors/admins are never progress-locked
    if (moduleIndex === 0) return false; // First module is always unlocked
    const prevModule = modules[moduleIndex - 1];
    if (!prevModule) return false;
    const prevVisible = prevModule.is_visible !== false;
    if (!prevVisible) return getModuleLockState(moduleIndex - 1);
    // If previous module has a quiz, it must be passed
    if (prevModule.has_quiz) {
      const prevQuizAttempt = quizAttemptsMap[prevModule.quiz_id];
      return !prevQuizAttempt?.passed;
    }
    // If previous module has no quiz, check all its visible lessons are completed
    const prevLessons = (prevModule.lessons || []).filter((l) => l.is_visible !== false);
    return prevLessons.some((l) => !completedLessonIds.includes(l.id));
  };

  const getQuizLockState = (module) => {
    if (isAdmin) return false;
    const lessons = (module.lessons || []).filter((l) => l.is_visible !== false);
    if (lessons.length === 0) return false;
    return lessons.some((l) => !completedLessonIds.includes(l.id));
  };

  const handleToggleVisibility = async (e, lesson, module) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    try {
      const currentLessonVisible = localVisibility[lesson.id] !== undefined ? localVisibility[lesson.id] : lesson.is_visible !== false;
      const currentModuleVisible = localVisibility[`mod_${module.id}`] !== undefined ? localVisibility[`mod_${module.id}`] : module.is_visible !== false;
      const res = await apiFetch(`/api/courses/lessons/${lesson.id}/toggle-visibility/`, {
        method: "PATCH",
      });
      if (res.ok) {
        const data = await res.json();
        const lessonUpdates = {};
        (data.updated_lessons || [{ id: lesson.id, is_visible: data.is_visible }]).forEach((item) => {
          lessonUpdates[item.id] = item.is_visible;
        });
        setLocalVisibility((prev) => ({
          ...prev,
          ...lessonUpdates,
        }));
        toast.success(data.message);
        
        // If we are turning this lesson ON, and the module is currently OFF, 
        // we automatically turn the module ON so the lesson is accessible.
        if (!currentLessonVisible && !currentModuleVisible) {
           handleToggleModuleVisibility(null, module, true);
        }
      } else {
        toast.error("Failed to toggle visibility");
      }
    } catch (err) {
      toast.error("Error toggling visibility");
    }
  };

  const handleToggleModuleVisibility = async (e, module, silent = false) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    try {
      const res = await apiFetch(`/api/courses/modules/${module.id}/toggle-visibility/`, {
        method: "PATCH",
      });
      if (res.ok) {
        const data = await res.json();
        setLocalVisibility((prev) => ({
          ...prev,
          [`mod_${module.id}`]: data.is_visible,
        }));
        if (!silent) toast.success(data.message);
      } else {
        toast.error("Failed to toggle module visibility");
      }
    } catch (err) {
      toast.error("Error toggling module visibility");
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header & Progress */}
      {/* Progress Bar & Completion Status */}
      <div className="p-3 sm:p-4 border-b border-border shrink-0 bg-background">
        <div className="flex items-center justify-between mb-2.5">
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="lg:hidden text-foreground/50 hover:text-foreground p-1.5 ml-auto"
            >
              <FaTimes size={14} />
            </button>
          )}
        </div>

        <div className="space-y-1.5">
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-end text-[11px] sm:text-xs text-foreground/60 font-medium">
              {progressPercent === 100 &&
                (certificateUrl ? (
                  <a
                    href={certificateUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary font-bold hover:underline flex items-center gap-1 bg-primary/10 px-1.5 py-0.5 rounded text-[11px]"
                  >
                    <FaCertificate className="text-amber-500" />
                    View Certificate
                  </a>
                ) : (
                  <button
                    onClick={onOpenCertificateModal}
                    className="text-primary font-bold hover:underline flex items-center gap-1 bg-primary/10 px-1.5 py-0.5 rounded text-[11px]"
                  >
                    <FaCertificate className="text-amber-500" />
                    Claim Certificate
                  </button>
                ))}
            </div>
          </div>
        </div>
      </div>

      {/* Accordion List */}
      <div 
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar"
      >
        {modules.map((module, moduleIndex) => {
          const isExpanded = !!expandedModules[module.id];
          const lessons = module.lessons || [];
          const moduleIsVisible = localVisibility[`mod_${module.id}`] !== undefined 
            ? localVisibility[`mod_${module.id}`] 
            : (module.is_visible !== false);
          if (!isAdmin && !moduleIsVisible) return null;
          const isModuleLocked = module.is_locked || getModuleLockState(moduleIndex);
          const isQuizLocked = getQuizLockState(module);

          // Full term counts - never treat "visible Week 1 only" as the whole term.
          const completedInModule =
            typeof module.completed_lesson_count === "number"
              ? module.completed_lesson_count
              : lessons.filter((l) => completedLessonIds.includes(l.id)).length;
          const totalInModule =
            typeof module.total_lesson_count === "number" && module.total_lesson_count > 0
              ? module.total_lesson_count
              : lessons.length;
          const canClaimTermCertificate = Boolean(module.all_lessons_completed);


          return (
            <div
              key={module.id}
              className={`border-b border-border last:border-b-0 ${isModuleLocked ? "opacity-60" : ""}`}
            >
              {/* Module Header */}
              <div className="w-full flex items-center justify-between p-3 sm:p-4 bg-muted/30 hover:bg-muted/50 transition-colors text-left group">
                <button
                  onClick={() => toggleModule(module.id)}
                  className="flex-1 flex items-center justify-between min-w-0 pr-2"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      {isModuleLocked && (
                        <FaLock size={10} className="text-foreground/40 shrink-0" />
                      )}
                      <h3 className="font-bold text-[15px] leading-tight text-foreground line-clamp-2">
                        {module.title}
                      </h3>
                    </div>
                    <div className="text-[11px] sm:text-xs text-foreground/50">
                      {completedInModule} / {totalInModule} lessons
                    </div>
                  </div>
                  <div className="ml-2 text-foreground/40 shrink-0">
                    {isExpanded ? (
                      <FaChevronUp size={11} />
                    ) : (
                      <FaChevronDown size={11} />
                    )}
                  </div>
                </button>

                {/* Module Instructor Eye Toggle */}
                {isAdmin && (
                  <div 
                    className="shrink-0 ml-1 p-1 cursor-pointer"
                    onClick={(e) => handleToggleModuleVisibility(e, module)}
                    title={moduleIsVisible ? "Hide week/module from students" : "Show week/module to students"}
                  >
                    {moduleIsVisible ? (
                      <FaEye size={13} className="text-green-500 hover:text-green-400 transition-colors" />
                    ) : (
                      <FaEyeSlash size={13} className="text-red-500 hover:text-red-400 transition-colors" />
                    )}
                  </div>
                )}
              </div>

              {/* Module Lessons & Schedule Items */}
              {isExpanded && (lessons.length > 0 || ((userCohort?.schedules || []).some(s => (!s.lesson_id && !s.lesson) && (s.activity_type === 'half_term_break' || s.activity_type === 'holiday')))) && (
                <div className="bg-muted/10">
                  {(() => {
                    const termKey = `term_${module.order || 1}`;
                    const breakSchedules = (userCohort?.schedules || []).filter(s => {
                      if (s.lesson_id || s.lesson) return false;
                      if (s.activity_type !== 'half_term_break' && s.activity_type !== 'holiday') return false;
                      if (s.term) return s.term === termKey;
                      return true;
                    });

                    // Combine lessons and break schedules into a unified list
                    const combinedItems = [
                      ...lessons.map(l => {
                        const sched = (userCohort?.schedules || []).find(s => s.lesson_id === l.id || s.lesson === l.id);
                        return { type: 'lesson', data: l, date: sched?.date || null, sched };
                      }),
                      ...breakSchedules.map(b => ({
                        type: 'break',
                        data: b,
                        date: b.date || null,
                        sched: b
                      }))
                    ];

                    // Sort chronologically by date if dates exist, preserving sequence
                    combinedItems.sort((a, b) => {
                      if (a.date && b.date) {
                        return a.date.localeCompare(b.date);
                      }
                      if (a.type === 'lesson' && b.type === 'lesson') {
                        return (a.data.order || 0) - (b.data.order || 0);
                      }
                      return 0;
                    });

                    const firstCapstoneIdx = combinedItems.findIndex((item) => {
                      if (item.type !== 'lesson') return false;
                      const l = item.data;
                      const t = (l.title || "").toLowerCase();
                      return l.order >= 90 || t.includes("week 9") || t.includes("capstone");
                    });
                    const firstCapstoneSched = firstCapstoneIdx >= 0 ? combinedItems[firstCapstoneIdx]?.sched : null;
                    const capstoneStartWeek = (() => {
                      if (firstCapstoneSched) {
                        const raw = getScheduleDisplayTitle(firstCapstoneSched, userCohort?.start_date);
                        const m = raw.match(/Week\s*(\d+)/i);
                        if (m) return parseInt(m[1], 10);
                      }
                      return 9;
                    })();
                    const capstoneCount = lessons.filter((l) => {
                      const t = (l.title || "").toLowerCase();
                      return l.order >= 90 || t.includes("week 9") || t.includes("capstone");
                    }).length;

                    return combinedItems.map((item, idx) => {
                      if (item.type === 'break') {
                        const sch = item.data;
                        const breakTitle = cleanLessonTitle(sch.custom_title || sch.lesson_title || "Break");
                        const isBreak = sch.activity_type === 'half_term_break';

                        return (
                          <div
                            key={`break-${sch.id || sch.date}`}
                            role="button"
                            tabIndex={0}
                            onClick={() => {
                              toast.info(`${breakTitle}: No lessons scheduled for this session.`);
                            }}
                            className="w-full flex items-start gap-3 p-3 sm:p-4 text-left transition-colors border-l-4 border-amber-500/50 bg-amber-500/5 hover:bg-amber-500/10 cursor-pointer"
                          >
                            <div className="mt-0.5 shrink-0 text-amber-500">
                              <FaCalendarTimes size={15} />
                            </div>
                            <div className="flex-1 min-w-0 overflow-hidden">
                              {/* Row 1: Title (left, truncate) + No Lessons badge (right, shrink-0) */}
                              <div className="flex items-center justify-between gap-2 min-w-0 w-full mb-0.5">
                                <p
                                  className="text-xs sm:text-sm font-semibold text-foreground truncate whitespace-nowrap min-w-0 flex-1 leading-tight"
                                  title={sch.custom_title || sch.lesson_title}
                                >
                                  {breakTitle}
                                </p>
                                <span className={`shrink-0 text-[9px] sm:text-[9.5px] font-extrabold rounded px-1.5 py-0.5 text-white whitespace-nowrap shadow-xs ${
                                  isBreak ? "bg-amber-600" : "bg-rose-600"
                                }`}>
                                  No Lessons
                                </span>
                              </div>
                              {/* Row 2: Date (left, truncate) + Activity label (right, shrink-0) */}
                              <div className="flex items-center justify-between gap-2 min-w-0 w-full">
                                <p className="text-[10px] sm:text-xs text-foreground/60 truncate whitespace-nowrap min-w-0 flex-1 leading-tight">
                                  {formatLessonScheduleDate(sch.date, sch.start_time, sch.end_time)}
                                </p>
                                <span className="shrink-0 text-[9px] sm:text-[9.5px] font-medium text-amber-600/90 whitespace-nowrap">
                                  {isBreak ? "Half Term Break" : "Holiday / Event"}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      }

                      // Lesson item
                      const lesson = item.data;
                      const isCompleted = completedLessonIds.includes(lesson.id);
                      const isActive = activeLessonId === lesson.id;
                      const isVisible = localVisibility[lesson.id] !== undefined ? localVisibility[lesson.id] : (lesson.is_visible !== false);
                      if (!isAdmin && !isVisible) return null;
                      const isLessonLocked = isModuleLocked || lesson.is_locked;
                      const lessonSchedules = (userCohort?.schedules || []).filter(s => s.lesson_id === lesson.id || s.lesson === lesson.id);
                      const scheduledTitle = getScheduleDisplayTitle(item.sched, userCohort?.start_date);
                      const displayTitle = cleanLessonTitle(scheduledTitle || lesson.title);

                      return (
                        <div key={lesson.id} className="flex flex-col">
                          {idx === firstCapstoneIdx && (
                            <div className="mx-2 sm:mx-3 my-2.5 p-2 sm:p-2.5 rounded-lg bg-indigo-600 text-white flex items-center justify-between shadow-sm border border-indigo-700">
                              <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                                <span className="w-2 h-2 rounded-full bg-white shrink-0 animate-pulse" />
                                <span className="text-[10.5px] sm:text-xs font-black uppercase tracking-wider text-white truncate">
                                  Capstone Project (Weeks {capstoneStartWeek} Onwards)
                                </span>
                              </div>
                              <span className="text-[9.5px] sm:text-[10px] font-extrabold text-indigo-950 bg-white px-2 py-0.5 rounded shadow-xs shrink-0 ml-1">
                                Week {capstoneStartWeek} Onwards · {capstoneCount} Sessions
                              </span>
                            </div>
                          )}
                          <div
                            id={`sidebar-lesson-${lesson.id}`}
                            ref={isActive ? activeLessonRef : null}
                            className="flex flex-col"
                          >
                            <div
                              role="button"
                              tabIndex={0}
                              onClick={() => {
                                if (isLessonLocked) {
                                  if (lesson.is_locked && lesson.is_visible === false) {
                                    toast.info("This content is currently disabled by the instructor.");
                                  } else if (isModuleLocked && module.is_visible === false) {
                                    toast.info("This content is currently disabled by the instructor.");
                                  } else if (module.is_locked) {
                                    toast.info("This module is locked in your trial. Upgrade course to access.");
                                  } else {
                                    toast.info("Complete the previous module's quiz to unlock this content.");
                                  }
                                  return;
                                }
                                onSelectLesson(lesson);
                              }}
                              className={`w-full flex items-start gap-3 p-3 sm:p-4 text-left transition-colors border-l-4 ${
                                isLessonLocked
                                  ? "border-transparent text-foreground/40 cursor-not-allowed"
                                  : isActive
                                    ? "bg-primary/10 border-blue-500 text-foreground"
                                    : "border-transparent hover:bg-primary/5 text-foreground/70"
                              }`}
                            >
                              {/* Checkbox status indicator */}
                              <div className="mt-0.5 shrink-0">
                                {isLessonLocked ? (
                                  <FaLock size={14} className="text-foreground/30" title={(module.is_visible === false || lesson.is_visible === false) ? "Disabled by instructor" : "Locked"} />
                                ) : isCompleted ? (
                                  <FaCheckSquare
                                    size={16}
                                    className="text-blue-500"
                                  />
                                ) : (
                                  <FaRegSquare size={16} className="text-foreground/40" />
                                )}
                              </div>

                              {/* Strictly Two Rows: No Text Wrapping */}
                              <div className="flex-1 min-w-0 overflow-hidden">
                                {lessonSchedules.length > 0 ? (
                                  <div className="space-y-1.5 min-w-0">
                                    {lessonSchedules.map((sch) => {
                                      const cfg = getStatusConfig(sch.status || "scheduled");
                                      const duration =
                                        formatSessionDuration(sch.start_time, sch.end_time) ||
                                        (lesson.duration_minutes ? `${lesson.duration_minutes} min` : null);
                                      const isCapstone = sch.activity_type === "capstone" || lesson.order >= 90 || (lesson.title || "").toLowerCase().includes("capstone");

                                      return (
                                        <div
                                          key={sch.id || `${sch.date}-${sch.start_time}`}
                                          className="min-w-0 flex flex-col justify-center"
                                        >
                                          {/* Row 1: Title (left, truncate) + Capstone/Duration (right, shrink-0) */}
                                          <div className="flex items-center justify-between gap-2 min-w-0 w-full mb-0.5">
                                            <p
                                              className={`text-xs sm:text-sm truncate whitespace-nowrap min-w-0 flex-1 leading-tight ${
                                                isActive ? "font-bold text-foreground" : "font-semibold text-foreground/90"
                                              }`}
                                              title={lesson.title}
                                            >
                                              {displayTitle}
                                            </p>
                                            <div className="shrink-0 flex items-center gap-1.5 whitespace-nowrap">
                                              {isCapstone && (
                                                <span className="text-[9px] sm:text-[9.5px] font-extrabold rounded px-1.5 py-0.2 bg-indigo-600 text-white border border-indigo-700 shadow-xs whitespace-nowrap">
                                                  Capstone
                                                </span>
                                              )}
                                              {duration && (
                                                <span className="text-[10px] sm:text-[11px] text-foreground/50 flex items-center gap-1 whitespace-nowrap">
                                                  <FaPlayCircle size={10} className="shrink-0" />
                                                  <span>{duration}</span>
                                                </span>
                                              )}
                                            </div>
                                          </div>

                                          {/* Row 2: Schedule date/time (left, truncate) + Status badge (right, shrink-0) */}
                                          <div className="flex items-center justify-between gap-2 min-w-0 w-full">
                                            <p className="text-[10px] sm:text-xs text-foreground/60 truncate whitespace-nowrap min-w-0 flex-1 leading-tight">
                                              {formatLessonScheduleDate(sch.date, sch.start_time, sch.end_time)}
                                            </p>
                                            <span className={`shrink-0 text-[9px] sm:text-[9.5px] font-bold rounded px-1.5 py-0.5 whitespace-nowrap ${cfg.badgeClass}`}>
                                              {cfg.label}
                                            </span>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                ) : (
                                  <div className="min-w-0 flex flex-col justify-center">
                                    {/* Row 1: Title (left, truncate) + Capstone (right, shrink-0) */}
                                    <div className="flex items-center justify-between gap-2 min-w-0 w-full mb-0.5">
                                      <p
                                        className={`text-xs sm:text-sm truncate whitespace-nowrap min-w-0 flex-1 leading-tight ${
                                          isActive ? "font-bold text-foreground" : "font-semibold text-foreground/90"
                                        }`}
                                        title={lesson.title}
                                      >
                                        {displayTitle}
                                      </p>
                                      {(lesson.order >= 90 || (lesson.title || "").toLowerCase().includes("capstone")) && (
                                        <span className="shrink-0 text-[9px] sm:text-[9.5px] font-extrabold rounded px-1.5 py-0.2 bg-indigo-600 text-white border border-indigo-700 shadow-xs whitespace-nowrap">
                                          Capstone
                                        </span>
                                      )}
                                    </div>

                                    {/* Row 2: Duration / Self-paced note */}
                                    <div className="flex items-center justify-between gap-2 min-w-0 w-full">
                                      <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-foreground/50 truncate whitespace-nowrap min-w-0 flex-1 leading-tight">
                                        <FaPlayCircle size={10} className="shrink-0" />
                                        <span>{lesson.duration_minutes ? `${lesson.duration_minutes} min` : "Self-paced lesson"}</span>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                              
                              {/* Instructor Controls */}
                              {isAdmin && (
                                <div 
                                  className="shrink-0 ml-2"
                                  onClick={(e) => handleToggleVisibility(e, lesson, module)}
                                  title={(isVisible && moduleIsVisible) ? "Hide from students" : "Show to students"}
                                >
                                  {(isVisible && moduleIsVisible) ? (
                                    <FaEye size={14} className="text-green-500 hover:text-green-400 transition-colors" />
                                  ) : (
                                    <FaEyeSlash size={14} className="text-red-500 hover:text-red-400 transition-colors" />
                                  )}
                                </div>
                              )}
                            </div>
                        
                        {/* Lesson Gamified Quiz */}
                        {lesson.has_quiz && (
                          <button
                            onClick={() => {
                              if (!isAdmin && isModuleLocked) {
                                toast.info("Complete the previous module to unlock this quiz.");
                              }
                              if (!isAdmin && !isCompleted) {
                                toast.info("Watch the lesson before taking its quiz.");
                              }
                              onSelectQuiz(lesson.quiz_id);
                            }}
                            className={`w-full flex items-start gap-3 p-4 text-left transition-colors border-l-4 ${
                              (!isAdmin && (isModuleLocked || !isCompleted))
                                ? "border-transparent text-foreground/40 cursor-not-allowed"
                                : activeQuizId === lesson.quiz_id
                                  ? "bg-primary/20 border-primary text-primary font-medium"
                                  : "border-transparent hover:bg-primary/10 text-foreground/80"
                            }`}
                          >
                            <div className="mt-0.5 shrink-0">
                              {(!isAdmin && (isModuleLocked || !isCompleted)) ? (
                                <FaLock size={14} className="text-foreground/30" />
                              ) : quizAttemptsMap[lesson.quiz_id]?.passed ? (
                                <FaCheckSquare size={16} className="text-primary" />
                              ) : (
                                <FaPuzzlePiece size={16} className={activeQuizId === lesson.quiz_id ? "text-primary" : "text-amber-500"} />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm mb-1 line-clamp-2">
                                {quizAttemptsMap[lesson.quiz_id]?.passed ? "Quiz Passed" : "Gamified XP Quiz"}
                              </p>
                              <div className="text-[10px] text-foreground/50">
                                {quizAttemptsMap[lesson.quiz_id]?.passed 
                                  ? `Score: ${quizAttemptsMap[lesson.quiz_id].best_score}%` 
                                  : "Earn XP!"}
                              </div>
                            </div>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                });
              })()}
                  
                  {/* Module Quiz */}
                  {module.has_quiz && (
                    <button
                      key={`quiz-${module.quiz_id}`}
                      onClick={() => {
                        if (!isAdmin && isModuleLocked) {
                          toast.info("Complete the previous module's quiz to unlock this content.");
                          return;
                        }
                        if (!isAdmin && isQuizLocked) {
                          toast.info("Complete all lessons in this module to unlock the quiz.");
                          return;
                        }
                        onSelectQuiz(module.quiz_id);
                      }}
                      className={`w-full flex items-start gap-3 p-4 text-left transition-colors border-l-4 ${
                        (!isAdmin && (isModuleLocked || isQuizLocked))
                          ? "border-transparent text-foreground/40 cursor-not-allowed bg-background/20"
                          : activeQuizId === module.quiz_id
                            ? "bg-amber-500/10 border-amber-500 text-foreground"
                            : "border-transparent hover:bg-amber-500/5 text-foreground/80 bg-background/30"
                      }`}
                    >
                      <div className="mt-0.5 shrink-0">
                        {(!isAdmin && (isModuleLocked || isQuizLocked)) ? (
                          <FaLock size={14} className="text-foreground/30" />
                        ) : (
                          <FaPuzzlePiece size={16} className="text-amber-500" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm mb-1 line-clamp-2 ${activeQuizId === module.quiz_id ? "font-semibold" : ""}`}>
                          Module Quiz
                        </p>
                        <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold">
                          {(!isAdmin && (isModuleLocked || isQuizLocked)) ? (
                            <span className="text-foreground/40">
                              {isModuleLocked ? "Previous quiz required" : "Complete all lessons first"}
                            </span>
                          ) : (
                            <>
                              {quizAttemptsMap[module.quiz_id]?.passed ? (
                                <span className="text-green-500 flex items-center gap-1">
                                  <FaCheckSquare size={10} /> Passed ({quizAttemptsMap[module.quiz_id].best_score}%)
                                </span>
                              ) : (
                                <span className="text-amber-500/80">Checkpoint</span>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </button>
                  )}

                  {/* Term Certificate Button */}
                  {isExpanded && canClaimTermCertificate && module.title?.toLowerCase().includes('term') && (
                     <div className="p-3 bg-muted/10 border-t border-border flex justify-center">
                        {module.certificate_url ? (
                          <button
                            onClick={() => onViewTermCertificate(module.certificate_url)}
                            className="px-4 py-2 bg-green-500/10 text-green-600 hover:bg-green-500/20 text-xs font-bold rounded flex items-center gap-2 transition-colors border border-green-500/20 w-full justify-center text-center"
                          >
                            <FaCertificate /> View {module.title} Certificate
                          </button>
                        ) : (
                         <button
                           onClick={() => onClaimTermCertificate(module.id, module.title)}
                           className="px-4 py-2 bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 text-xs font-bold rounded flex items-center gap-2 transition-colors border border-amber-500/20 w-full justify-center"
                         >
                           <FaCertificate /> Claim {module.title} Certificate
                         </button>
                       )}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Upgrade Prompt for Partial Enrollments */}
      {modules.some(m => m.is_locked) && (
        <div className="p-4 border-t border-border bg-amber-500/5 shrink-0">
          <h4 className="text-sm font-bold text-amber-600 mb-1">Trial Version</h4>
          <p className="text-xs text-foreground/60 mb-3">You are enrolled in a limited trial of this course. Upgrade to unlock all modules.</p>
          <button 
            onClick={onUpgradeClick}
            className="block w-full py-2 text-center bg-amber-500 text-white rounded font-bold text-xs hover:bg-amber-600 transition-colors shadow-sm"
          >
            Upgrade Course
          </button>
        </div>
      )}

    </div>
  );
}
