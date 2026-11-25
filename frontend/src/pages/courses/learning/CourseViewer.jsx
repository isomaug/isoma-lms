import { SearchableSelect } from "@/components/ui/SearchableSelect";
/**
 * CourseViewer -- The split-pane learning dashboard.
 * Left: Video player and content. Right: Curriculum sidebar.
 */
import { useState, useEffect, useRef, useMemo, lazy, Suspense } from "react";
import { createPortal } from "react-dom";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  FaChevronLeft,
  FaCheckCircle,
  FaListUl,
  FaDownload,
  FaEye,
  FaUpload,
  FaTrash,
  FaFileAlt,
  FaChalkboardTeacher,
  FaTimes,
} from "react-icons/fa";
import DOMPurify from "dompurify";
import { marked } from "marked";
import { toast } from "sonner";
import { customToast } from "@/components/notifications/GlobalPopup";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { apiFetch } from "@/api/client/apiClient";

import VideoPlayer from "@/components/courses/viewer/VideoPlayer";
import LessonSidebar from "@/components/courses/viewer/LessonSidebar";
import CourseAssistant from "@/components/courses/interactive/CourseAssistant";
import DelayedSpinner from "@/components/notifications/DelayedSpinner";
import { motion, AnimatePresence } from "framer-motion";
import CourseCompletionModal from "@/components/courses/viewer/CourseCompletionModal";
import QuizPlayer from "@/components/courses/interactive/QuizPlayer";
import XPBadge from "@/components/courses/viewer/XPBadge";
import TeamSessionManager from "@/components/courses/interactive/TeamSessionManager";
import CodingPlayground from "@/components/courses/interactive/CodingPlayground";
import ReviewModal from "@/components/courses/catalog/ReviewModal";
import LessonTextPanel from "@/components/courses/viewer/LessonTextPanel";
import InstructorLessonEditButton from "@/components/courses/viewer/InstructorLessonEditButton";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";
import { ChevronUp, ChevronDown, Maximize2, Minimize2, PictureInPicture2, LayoutGrid, X, Users, Star, ArrowRightLeft, LogOut, Calendar, Search } from "lucide-react";
import { OnlineGlowDot } from "@/components/ui/UserStatusBadge";
import CohortTimetableModal from "@/components/cohorts/CohortTimetableModal";
import CourseTextbookViewer from "@/components/courses/materials/CourseTextbookViewer";
import {
  getStatusConfig,
  formatTodayLabel,
  localISODate,
  formatLessonScheduleDate,
  formatSessionDuration,
} from "@/utils/scheduleUtils";
import LessonAssignmentDoc from "@/components/courses/materials/LessonAssignmentDoc";
import ClassroomWhiteboardModal from "@/components/courses/interactive/ClassroomWhiteboardModal";
import DocumentPreviewModal from "@/components/courses/materials/DocumentPreviewModal";

const ClassmatesTab = lazy(() => import("@/components/courses/interactive/ClassmatesTab"));

const playDuolingoPassSound = () => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    if (ctx.state === "suspended") ctx.resume();

    // Play celebratory Duolingo chord: C5 - E5 - G5 - C6
    const notes = [523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime + index * 0.08);
      gain.gain.setValueAtTime(0.2, ctx.currentTime + index * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + index * 0.08 + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + index * 0.08);
      osc.stop(ctx.currentTime + index * 0.08 + 0.35);
    });
  } catch (e) { }
};

const isViewableDoc = (fileUrl) => {
  if (!fileUrl) return false;
  const lower = fileUrl.toLowerCase();
  return (
    lower.includes(".doc") ||
    lower.includes(".ppt") ||
    lower.includes(".pdf") ||
    lower.includes(".xls") ||
    lower.includes(".txt") ||
    lower.includes(".rtf") ||
    lower.includes(".csv") ||
    lower.includes(".odt") ||
    lower.includes(".png") ||
    lower.includes(".jpg") ||
    lower.includes(".jpeg") ||
    lower.includes(".webp") ||
    lower.includes(".svg")
  );
};

/** Visible/unlocked lessons in curriculum order (students skip hidden/locked). */
function listOpenLessons(course, { isInstructor = false, isModuleLockedFn } = {}) {
  const items = [];
  (course?.modules || []).forEach((module, moduleIndex) => {
    if (!isInstructor) {
      if (module.is_visible === false) return;
      if (module.is_locked) return;
      if (typeof isModuleLockedFn === "function" && isModuleLockedFn(moduleIndex)) return;
    }
    (module.lessons || []).forEach((lesson) => {
      if (!isInstructor) {
        if (lesson.is_visible === false) return;
        if (lesson.is_locked) return;
      }
      items.push(lesson);
    });
  });
  return items;
}

function getLessonNumber(course, lessonId, opts) {
  const open = listOpenLessons(course, opts);
  const idx = open.findIndex((l) => String(l.id) === String(lessonId));
  return idx >= 0 ? idx + 1 : null;
}

function hasNextOpenLesson(course, lessonId, opts) {
  const open = listOpenLessons(course, opts);
  const idx = open.findIndex((l) => String(l.id) === String(lessonId));
  return idx >= 0 && idx < open.length - 1;
}

function resolvePlaygroundType(lesson, course) {
  const blob = `${course?.title || ""} ${course?.slug || ""} ${lesson?.title || ""}`.toLowerCase();
  const isStage56 = /\bstage[\s-]*[56]\b/.test(blob) || /\byear[\s-]*[56]\b/.test(blob);
  if (isStage56) {
    if (lesson?.playground_type === "custom" && lesson?.playground_custom_url) return "custom";
    if (lesson?.playground_type === "wokwi_arduino" || lesson?.playground_type === "tinkercad") {
      return lesson.playground_type;
    }
    return "tinkercad";
  }
  if (lesson?.playground_type) return lesson.playground_type;
  if (blob.includes("arcade")) return "makecode_arcade";
  if (
    blob.includes("micro:bit") ||
    blob.includes("microbit") ||
    /\bstage[\s-]*3\b/.test(blob) ||
    /\bstage[\s-]*4\b/.test(blob)
  ) {
    return "makecode_microbit";
  }
  if (blob.includes("tinkercad") || blob.includes("circuit")) return "tinkercad";
  if (blob.includes("arduino")) return "tinkercad";
  if (blob.includes("esp32")) return "wokwi_esp32";
  if (blob.includes("scratchjr") || blob.includes("scratch jr") || /\bstage[\s-]*[12]\b/.test(blob)) {
    return "scratchjr";
  }
  if (blob.includes("scratch")) return "scratch";
  return "";
}

export default function CourseViewer() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { me, logout } = useAuth();
  const { addToCart } = useCart();
  const { width: windowWidth, height: windowHeight } = useWindowSize();
  const isInstructorOrAdmin = me?.is_staff || me?.is_superuser || me?.is_instructor;
  const [showConfetti, setShowConfetti] = useState(false);

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [activeLesson, setActiveLesson] = useState(null);
  const [activeCohortId, setActiveCohortId] = useState(null);
  const [completedLessonIds, setCompletedLessonIds] = useState([]);
  const [progressPercent, setProgressPercent] = useState(0);
  const [videoProgressMap, setVideoProgressMap] = useState({});
  const [activeTab, setActiveTab] = useState("overview"); // overview, text, script, playground, downloads
  const [isToolbarCollapsed, setIsToolbarCollapsed] = useState(false);
  const [videoViewMode, setVideoViewMode] = useState("embedded"); // embedded, floating, split
  const [isVideoMaximized, setIsVideoMaximized] = useState(false);
  const [currentVideoTimestamp, setCurrentVideoTimestamp] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Lesson sidebar expanded modules state
  const [expandedModules, setExpandedModules] = useState({});

  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [claimingModuleId, setClaimingModuleId] = useState(null);
  const [claimingModuleTitle, setClaimingModuleTitle] = useState(null);
  const [certificateUrl, setCertificateUrl] = useState(null);
  const [hideVideo, setHideVideo] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [showTimetableModal, setShowTimetableModal] = useState(false);
  const [showWhiteboard, setShowWhiteboard] = useState(false);
  const [showWhiteboardDate, setShowWhiteboardDate] = useState(true);
  const [previewDoc, setPreviewDoc] = useState(null);
  const [showMaterialUpload, setShowMaterialUpload] = useState(false);
  const [uploadingMaterial, setUploadingMaterial] = useState(false);
  const [materialTitle, setMaterialTitle] = useState("");
  const [materialIsInstructorOnly, setMaterialIsInstructorOnly] = useState(false);
  const [materialTargetLessonId, setMaterialTargetLessonId] = useState("");
  const [materialScope, setMaterialScope] = useState("current"); // "current" | "all"
  const [materialSearchQuery, setMaterialSearchQuery] = useState("");
  const materialFileInputRef = useRef(null);

  // Pairing State
  const [pairingStatus, setPairingStatus] = useState(null);

  // Gamification state
  const [activeQuizId, setActiveQuizId] = useState(null);
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [quizAttemptsMap, setQuizAttemptsMap] = useState({});
  const [userXp, setUserXp] = useState(null);
  const quizXpAppliedRef = useRef(new Set());
  const quizAttemptAppliedRef = useRef(new Set());

  const allCourseMaterials = useMemo(() => {
    if (!course?.modules) return [];
    const seen = new Map();
    course.modules.forEach((mod) => {
      (mod.lessons || []).forEach((les) => {
        (les.materials || []).forEach((mat) => {
          // Normalize key by file or title to prevent duplicate display across lessons
          const key = (mat.file || mat.download_url || mat.title || "").toLowerCase().trim();
          if (seen.has(key)) {
            const existing = seen.get(key);
            if (!existing.lessonsList.some((l) => l.id === les.id)) {
              existing.lessonsList.push({ id: les.id, title: les.title, moduleTitle: mod.title });
            }
          } else {
            seen.set(key, {
              ...mat,
              lessonId: les.id,
              lessonTitle: les.title,
              moduleTitle: mod.title,
              moduleOrder: mod.order,
              lessonOrder: les.order,
              lessonsList: [{ id: les.id, title: les.title, moduleTitle: mod.title }],
            });
          }
        });
      });
    });
    return Array.from(seen.values());
  }, [course]);

  const currentLessonMaterials = useMemo(() => {
    if (!activeLesson) return [];
    const seen = new Set();
    const list = [];
    (activeLesson.materials || []).forEach((mat) => {
      const key = `${(mat.title || "").toLowerCase().trim()}::${(mat.file || "").toLowerCase().trim()}`;
      if (!seen.has(key)) {
        seen.add(key);
        list.push({
          ...mat,
          lessonId: activeLesson.id,
          lessonTitle: activeLesson.title,
        });
      }
    });
    return list;
  }, [activeLesson]);

  const filteredAllMaterials = useMemo(() => {
    return allCourseMaterials.filter((mat) => {
      if (isInstructorOrAdmin) return true;
      if (mat.is_instructor_only) return false;
      const blob = `${mat.title || ""} ${mat.file || ""}`.toLowerCase();
      if (blob.includes("lesson plan") || blob.includes("scheme of work")) return false;
      if (/lesson\s*\d+\s*stage/.test(blob)) return false;
      if (/stage\s*\d+.*lesson\s*\d+/.test(blob)) return false;
      if (/lesson\d+stage\d+/.test(blob)) return false;
      if (/stage\d+_?lesson\d+/.test(blob)) return false;
      return true;
    });
  }, [allCourseMaterials, isInstructorOrAdmin]);

  const filteredCurrentMaterials = useMemo(() => {
    return currentLessonMaterials.filter((mat) => {
      if (isInstructorOrAdmin) return true;
      if (mat.is_instructor_only) return false;
      const blob = `${mat.title || ""} ${mat.file || ""}`.toLowerCase();
      if (blob.includes("lesson plan") || blob.includes("scheme of work")) return false;
      if (/lesson\s*\d+\s*stage/.test(blob)) return false;
      if (/stage\s*\d+.*lesson\s*\d+/.test(blob)) return false;
      if (/lesson\d+stage\d+/.test(blob)) return false;
      if (/stage\d+_?lesson\d+/.test(blob)) return false;
      return true;
    });
  }, [currentLessonMaterials, isInstructorOrAdmin]);

  const displayedMaterials = useMemo(() => {
    const baseList = materialScope === "current" ? filteredCurrentMaterials : filteredAllMaterials;
    if (!materialSearchQuery.trim()) return baseList;
    const q = materialSearchQuery.toLowerCase();
    return baseList.filter((m) =>
      (m.title || "").toLowerCase().includes(q) ||
      (m.lessonTitle || "").toLowerCase().includes(q) ||
      (m.moduleTitle || "").toLowerCase().includes(q)
    );
  }, [materialScope, filteredCurrentMaterials, filteredAllMaterials, materialSearchQuery]);

  useEffect(() => {
    if (course?.modules) {
      const initial = {};
      course.modules.forEach((m) => {
        initial[m.id] = true;
      });
      setExpandedModules(initial);
    }
  }, [course]);

  const isAllExpanded = course?.modules?.length > 0 && course.modules.every((m) => expandedModules[m.id]);

  const toggleAllModules = () => {
    if (isAllExpanded) {
      setExpandedModules({});
    } else {
      const allExpanded = {};
      course?.modules?.forEach((m) => {
        allExpanded[m.id] = true;
      });
      setExpandedModules(allExpanded);
    }
  };

  const fetchCourseData = async (setInitialActive = false) => {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 90000);

    try {
      const response = await apiFetch(`/api/courses/${slug}/learn/`, {
        signal: controller.signal,
      });

      if (!response.ok) {
        if (response.status === 403) {
          navigate(`/courses/${slug}`); // redirect to landing if not enrolled
          return;
        }
        throw new Error("Failed to load course content");
      }

      const data = await response.json();
      setCourse(data);
      setCompletedLessonIds(data.completed_lesson_ids || []);
      setProgressPercent(data.progress_percent || 0);
      setVideoProgressMap(data.video_progress || {});
      if (data.certificate_url) {
        setCertificateUrl(data.certificate_url);
      }
      setQuizAttemptsMap(data.quiz_attempts || {});
      setUserXp(data.user_xp || null);

      setActiveCohortId(prev => {
        if (!prev && data.user_cohorts && data.user_cohorts.length > 0) {
          return data.user_cohorts[0].id;
        }
        return prev;
      });

      // Prefer today's scheduled lesson for the active cohort; else first incomplete.
      if (setInitialActive && data.modules && data.modules.length > 0) {
        const todayStr = (() => {
          const d = new Date();
          const y = d.getFullYear();
          const m = String(d.getMonth() + 1).padStart(2, "0");
          const day = String(d.getDate()).padStart(2, "0");
          return `${y}-${m}-${day}`;
        })();
        const cohorts = data.user_cohorts || [];
        const preferredCohort = cohorts[0];
        let found = false;

        let todayLessonId = null;
        if (preferredCohort?.schedules?.length) {
          const todaySch = preferredCohort.schedules.find((s) => s.date === todayStr);
          if (todaySch?.lesson_id) todayLessonId = todaySch.lesson_id;
        }

        if (todayLessonId) {
          for (const mod of data.modules) {
            if (mod.is_locked) continue;
            if (mod.is_visible === false && !isInstructorOrAdmin) continue;
            const match = (mod.lessons || []).find(
              (lesson) =>
                lesson.id === todayLessonId &&
                (isInstructorOrAdmin || lesson.is_visible !== false)
            );
            if (match) {
              setActiveLesson(match);
              setTimeout(() => {
                const container = document.getElementById("main-scroll-container");
                if (container) container.scrollTo({ top: 0, behavior: 'smooth' });
              }, 200);
              found = true;
              break;
            }
          }
        }

        if (!found) {
          for (const mod of data.modules) {
            if (mod.is_locked) continue;
            if (mod.is_visible === false && !isInstructorOrAdmin) continue;
            for (const lesson of mod.lessons || []) {
              if (lesson.is_visible === false && !isInstructorOrAdmin) continue;
              if (!data.completed_lesson_ids.includes(lesson.id)) {
                setActiveLesson(lesson);
                found = true;
                break;
              }
            }
            if (found) break;
          }
        }

        if (!found) {
          for (const mod of data.modules) {
            if (mod.is_locked) continue;
            if (mod.is_visible === false && !isInstructorOrAdmin) continue;
            const firstVisible = (mod.lessons || []).find(
              (lesson) => isInstructorOrAdmin || lesson.is_visible !== false
            );
            if (firstVisible) {
              setActiveLesson(firstVisible);
              break;
            }
          }
        }
      }
    } catch (err) {
      setError(
        err.name === "AbortError"
          ? "The course server could not respond in time."
          : err.message
      );
    } finally {
      window.clearTimeout(timeoutId);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourseData(true);
  }, [slug, navigate]);

  // Pairing Polling
  useEffect(() => {
    if (!activeCohortId) return;
    const fetchPairingStatus = async () => {
      try {
        const response = await apiFetch(`/api/cohort-teams/pairing_status/?cohort_id=${activeCohortId}`);
        if (response.ok) {
          const data = await response.json();
          setPairingStatus(data);
        }
      } catch (err) {
        console.error("Failed to fetch pairing status", err);
      }
    };

    fetchPairingStatus(); // Initial fetch
    const intervalId = setInterval(fetchPairingStatus, 10000);
    return () => clearInterval(intervalId);
  }, [activeCohortId]);

  // Fetch cohort-scoped XP whenever active cohort changes
  useEffect(() => {
    if (!activeCohortId || !slug) return;
    const fetchCohortXp = async () => {
      try {
        const response = await apiFetch(`/api/courses/${slug}/learn/?cohort_id=${activeCohortId}`);
        if (response.ok) {
          const data = await response.json();
          if (data.user_xp) {
            setUserXp(data.user_xp);
          }
        }
      } catch (err) {
        console.error("Failed to fetch cohort XP", err);
      }
    };
    fetchCohortXp();
  }, [activeCohortId, slug]);

  const handleTogglePairing = async (active) => {
    if (!activeCohortId) return;
    try {
      const response = await apiFetch("/api/cohort-teams/toggle_pairing/", {
        method: "POST",
        body: JSON.stringify({ cohort_id: activeCohortId, active }),
      });
      if (response.ok) {
        toast.success(active ? "Pairing session started." : "Pairing session ended.");
        setPairingStatus(prev => ({ ...prev, is_pairing_active: active }));
      } else {
        const errData = await response.json().catch(() => ({}));
        toast.error(errData.error || "Failed to toggle pairing session.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error while toggling pairing.");
    }
  };

  const [submittingChange, setSubmittingChange] = useState(false);
  const [isChangeRequested, setIsChangeRequested] = useState(false);

  const handleRequestCohortPartnerChange = async () => {
    if (!activeCohortId || submittingChange) return;
    setSubmittingChange(true);
    try {
      const response = await apiFetch("/api/cohort-teams/request_partner_change/", {
        method: "POST",
        body: JSON.stringify({ cohort_id: activeCohortId }),
      });
      const data = await response.json().catch(() => ({}));
      if (response.ok) {
        toast.success(data.message || "Partner change requested. Waiting for teacher approval.");
        setIsChangeRequested(true);
        setPairingStatus((prev) => (prev ? { ...prev, partner_change_requested: true } : prev));
      } else {
        toast.error(data.error || "Failed to request partner change.");
      }
    } catch (err) {
      toast.error("Network error while requesting partner change.");
    } finally {
      setSubmittingChange(false);
    }
  };

  const handleCancelCohortPartnerChange = async () => {
    if (!activeCohortId || submittingChange) return;
    setSubmittingChange(true);
    try {
      const response = await apiFetch("/api/cohort-teams/cancel_partner_change/", {
        method: "POST",
        body: JSON.stringify({ cohort_id: activeCohortId }),
      });
      const data = await response.json().catch(() => ({}));
      if (response.ok) {
        toast.info(data.message || "Partner change request cancelled.");
        setIsChangeRequested(false);
        setPairingStatus((prev) => (prev ? { ...prev, partner_change_requested: false } : prev));
      } else {
        toast.error(data.error || "Failed to cancel partner change request.");
      }
    } catch (err) {
      toast.error("Network error while cancelling partner change.");
    } finally {
      setSubmittingChange(false);
    }
  };

  const handleSignOut = () => {
    logout();
    navigate("/login");
  };

  const handleClaimCertificate = async () => {
    try {
      const response = await apiFetch(`/api/courses/${slug}/claim-certificate/`, {
        method: "POST",
      });
      if (response.ok) {
        const data = await response.json();
        setCertificateUrl(data.certificate_url);
        window.open(data.certificate_url, "_blank");
      }
    } catch (err) {
      console.error("Failed to claim certificate", err);
    }
  };

  const handleClaimTermCertificate = async (moduleId, moduleTitle) => {
    setClaimingModuleId(moduleId);
    setClaimingModuleTitle(moduleTitle);
    setShowCompletionModal(true);
  };

  useEffect(() => {
    if (!activeQuizId) {
      setActiveQuiz(null);
      return;
    }
    const fetchQuiz = async () => {
      try {
        const res = await apiFetch(`/api/courses/${slug}/quizzes/${activeQuizId}/`);
        if (!res.ok) throw new Error("Failed to fetch quiz");
        const data = await res.json();
        setActiveQuiz(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchQuiz();
  }, [activeQuizId, slug]);

  const handleToggleComplete = async (lessonId) => {
    try {
      const res = await apiFetch(`/api/courses/${slug}/lessons/${lessonId}/complete/`, {
        method: "POST",
      });
      if (res.ok) {
        const data = await res.json();
        if (data.status === "completed") {
          setCompletedLessonIds(prev => [...prev, lessonId]);
          setProgressPercent(data.progress_percent);
        } else {
          setCompletedLessonIds(prev => prev.filter(id => id !== lessonId));
          setProgressPercent(data.progress_percent);
        }
      }
    } catch (err) {
      console.error("Failed to toggle completion", err);
    }
  };

  // ── Sequential lock helpers (students only - instructors skip progress gates) ──
  const isModuleLocked = (moduleIndex) => {
    if (isInstructorOrAdmin) return false;
    const module = course?.modules?.[moduleIndex];
    if (module?.is_locked) return true;
    if (moduleIndex === 0) return false;
    const prevModule = course?.modules?.[moduleIndex - 1];
    if (!prevModule) return false;
    if (prevModule.is_visible === false) {
      return isModuleLocked(moduleIndex - 1);
    }
    if (prevModule.has_quiz) {
      const prevQuizAttempt = quizAttemptsMap[prevModule.quiz_id];
      return !prevQuizAttempt?.passed;
    }
    const prevLessons = (prevModule.lessons || []).filter(
      (l) => l.is_visible !== false
    );
    return prevLessons.some((l) => !completedLessonIds.includes(l.id));
  };

  const isQuizLocked = (module) => {
    if (isInstructorOrAdmin) return false;
    const lessons = (module.lessons || []).filter(
      (l) => l.is_visible !== false
    );
    return lessons.some((l) => !completedLessonIds.includes(l.id));
  };

  const lessonNavOpts = {
    isInstructor: isInstructorOrAdmin,
    isModuleLockedFn: isModuleLocked,
  };

  const handleVideoEnded = () => {
    if (!activeLesson || isInstructorOrAdmin) return;
    const n = getLessonNumber(course, activeLesson.id, lessonNavOpts);
    const done = completedLessonIds.includes(activeLesson.id);
    if (!done) {
      customToast.info(
        n ? `Complete Lesson ${n}` : "Complete your open lesson",
        "Almost there"
      );
      return;
    }
    if (!hasNextOpenLesson(course, activeLesson.id, lessonNavOpts)) {
      customToast.success(
        "Well done! Wait for the next lesson to open.",
        "Great work"
      );
    }
  };

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    setSidebarOpen(false);
  };

  const hasTextbooks = Boolean(
    course?.has_textbooks ||
    (course?.slug && (course.slug.includes("9626") || course.slug.includes("cambridge") || course.slug.includes("information-technology"))) ||
    (course?.title && (course.title.includes("9626") || course.title.includes("Cambridge")))
  );



  const handleSelectLesson = (lesson) => {
    if (!isInstructorOrAdmin && lesson?.is_visible === false) {
      toast.info("This content is currently disabled by the instructor.");
      return;
    }
    // Guard: check if the lesson's module is locked
    if (course?.modules) {
      const modIndex = course.modules.findIndex((m) =>
        (m.lessons || []).some((l) => l.id === lesson.id)
      );
      const module = modIndex >= 0 ? course.modules[modIndex] : null;
      if (!isInstructorOrAdmin && module?.is_visible === false) {
        toast.info("This content is currently disabled by the instructor.");
        return;
      }
      if (modIndex >= 0 && isModuleLocked(modIndex)) {
        if (module?.is_locked) {
          toast.info("This module is locked in your trial. Upgrade course to access.");
        } else {
          toast.info("Complete the previous module's quiz to unlock this content.");
        }
        return;
      }
    }
    setActiveQuizId(null);
    setActiveLesson(lesson);
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
    const container = document.getElementById("main-scroll-container");
    if (container) {
      container.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleLessonFieldSaved = (updated) => {
    if (!updated?.id) return;
    setActiveLesson((prev) => (prev?.id === updated.id ? { ...prev, ...updated } : prev));
    setCourse((prev) => {
      if (!prev?.modules) return prev;
      return {
        ...prev,
        modules: prev.modules.map((mod) => ({
          ...mod,
          lessons: (mod.lessons || []).map((les) =>
            les.id === updated.id ? { ...les, ...updated } : les
          ),
        })),
      };
    });
  };

  const handleSelectQuiz = (quizId) => {
    // Instructors/admins can open any quiz without sequential progress gates
    if (!isInstructorOrAdmin && course?.modules) {
      const mod = course.modules.find((m) => m.quiz_id === quizId);
      const modIndex = course.modules.indexOf(mod);
      if (mod && isModuleLocked(modIndex)) {
        if (mod.is_locked) {
          toast.info("This module is locked in your trial. Upgrade course to access.");
        } else {
          toast.info("Complete the previous module's quiz to unlock this content.");
        }
        return;
      }
      if (mod && isQuizLocked(mod)) {
        toast.info("Complete all lessons in this module to unlock the quiz.");
        return;
      }
    }
    setActiveLesson(null);
    setActiveQuizId(quizId);
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  };

  const handleQuizSubmit = (resultData) => {
    const quizKey = String(activeQuizId || "");
    if (resultData?.xp_awarded > 0 && quizKey && !quizXpAppliedRef.current.has(quizKey)) {
      quizXpAppliedRef.current.add(quizKey);
      setUserXp((prev) => {
        if (!prev) return { total_xp: resultData.xp_awarded, level: 1, level_title: "Getting Started" };
        const newXp = prev.total_xp + resultData.xp_awarded;
        let newLevel = prev.level;
        let newTitle = prev.level_title;
        if (newXp >= 1000) { newLevel = 5; newTitle = "Exceeded Expectations"; }
        else if (newXp >= 600) { newLevel = 4; newTitle = "Meets Expectations"; }
        else if (newXp >= 300) { newLevel = 3; newTitle = "Good Work"; }
        else if (newXp >= 100) { newLevel = 2; newTitle = "Making Progress"; }
        else { newLevel = 1; newTitle = "Getting Started"; }
        return { ...prev, total_xp: newXp, level: newLevel, level_title: newTitle };
      });
    }

    // Update local quiz attempts map once per finished attempt payload
    const attemptKey = `${quizKey}:${resultData?.attempt_number || resultData?.score || "done"}`;
    if (quizKey && !quizAttemptAppliedRef.current.has(attemptKey)) {
      quizAttemptAppliedRef.current.add(attemptKey);
      setQuizAttemptsMap((prev) => {
        const existing = prev[activeQuizId] || { best_score: 0, attempts_count: 0, passed: false };
        return {
          ...prev,
          [activeQuizId]: {
            best_score: Math.max(existing.best_score, resultData.score || 0),
            passed: existing.passed || resultData.passed,
            attempts_count: Math.max(
              existing.attempts_count,
              resultData.attempt_number || existing.attempts_count + 1
            ),
          },
        };
      });
    }

    const advanced = advanceCurriculum();
    if (!advanced && !isInstructorOrAdmin) {
      customToast.success(
        "Well done! Wait for the next lesson to open.",
        "Great work"
      );
    }
  };

  const buildCurriculum = () => {
    const curriculum = [];
    if (!course?.modules) return curriculum;
    course.modules.forEach((m, moduleIndex) => {
      if (m.is_locked || isModuleLocked(moduleIndex)) return;
      if (m.is_visible === false && !isInstructorOrAdmin) return;
      if (m.lessons) {
        m.lessons.forEach((l) => {
          if (l.is_locked) return;
          if (l.is_visible === false && !isInstructorOrAdmin) return;
          curriculum.push({ type: "lesson", item: l });
          const lessonQuizId = l.quiz_id || l.quiz?.id;
          if (l.has_quiz && lessonQuizId) {
            curriculum.push({ type: "quiz", item: { id: lessonQuizId } });
          }
        });
      }
      const modQuizId = m.quiz_id || m.quiz?.id;
      if (m.has_quiz && modQuizId) {
        if (!curriculum.some((c) => c.type === "quiz" && String(c.item.id) === String(modQuizId))) {
          curriculum.push({ type: "quiz", item: { id: modQuizId } });
        }
      }
    });
    return curriculum;
  };

  const advanceCurriculum = () => {
    if (!course || (!activeLesson && !activeQuizId)) return false;

    const curriculum = buildCurriculum();

    let currentIndex = -1;
    if (activeLesson) {
      currentIndex = curriculum.findIndex(
        (c) => c.type === "lesson" && String(c.item.id) === String(activeLesson.id)
      );
    } else if (activeQuizId) {
      currentIndex = curriculum.findIndex(
        (c) => c.type === "quiz" && String(c.item.id) === String(activeQuizId)
      );
    }

    if (currentIndex >= 0 && currentIndex < curriculum.length - 1) {
      const nextItem = curriculum[currentIndex + 1];
      if (nextItem.type === "lesson") {
        setActiveQuizId(null);
        setActiveLesson(nextItem.item);
      } else {
        setActiveLesson(null);
        setActiveQuizId(nextItem.item.id);
      }
      return true;
    }
    return false;
  };

  const handleNextLesson = () => {
    const advanced = advanceCurriculum();
    if (!advanced && !isInstructorOrAdmin && (activeLesson || activeQuizId)) {
      customToast.success(
        "Well done! Wait for the next lesson to open.",
        "Great work"
      );
    }
  };

  const handleReviewLesson = () => {
    if (!course || !activeQuizId) return;
    const curriculum = buildCurriculum();
    const currentIndex = curriculum.findIndex(
      (c) => c.type === "quiz" && String(c.item.id) === String(activeQuizId)
    );
    if (currentIndex > 0) {
      for (let i = currentIndex - 1; i >= 0; i--) {
        if (curriculum[i].type === "lesson") {
          setActiveQuizId(null);
          setActiveLesson(curriculum[i].item);
          return;
        }
      }
    }
  };

  const handleLessonComplete = async (lessonId) => {
    if (!lessonId) return;
    try {
      const res = await apiFetch(
        `/api/courses/${slug}/lessons/${lessonId}/complete/`,
        { method: "POST" }
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        customToast.error(data.error || "This lesson cannot be marked complete.");
        return;
      }

      setProgressPercent(data.progress_percent);

      if (data.completed) {
        setCompletedLessonIds((prev) => [...prev, lessonId]);
        playDuolingoPassSound();

        // Instructors: mark matching timetable slot Taught (green for students too)
        if (isInstructorOrAdmin && activeCohort?.schedules?.length) {
          const today = localISODate();
          const matches = activeCohort.schedules.filter((s) => s.lesson_id === lessonId);
          const target = matches.find((s) => s.date === today) || matches[0];
          if (target?.id && target.status !== "taught") {
            try {
              const schRes = await apiFetch(`/api/admin/cohort-schedules/${target.id}/`, {
                method: "PATCH",
                body: JSON.stringify({ status: "taught" }),
              });
              if (schRes.ok) {
                setCourse((prev) => {
                  if (!prev?.user_cohorts) return prev;
                  return {
                    ...prev,
                    user_cohorts: prev.user_cohorts.map((c) =>
                      c.id !== activeCohort.id
                        ? c
                        : {
                          ...c,
                          schedules: (c.schedules || []).map((s) =>
                            s.id === target.id ? { ...s, status: "taught" } : s
                          ),
                        }
                    ),
                  };
                });
              }
            } catch (e) {
              console.error("Failed to mark schedule taught", e);
            }
          }
        }

        // Show the success modal/toast FIRST so it eases in smoothly
        if (data.progress_percent === 100 && progressPercent !== 100) {
          customToast.success(
            "Congratulations on completing all lessons in this course!",
            "Course Completed!"
          );
          setShowCompletionModal(true);
          if (data.certificate_url) {
            setCertificateUrl(data.certificate_url);
          }
        } else if (
          !isInstructorOrAdmin &&
          !hasNextOpenLesson(course, lessonId, {
            isInstructor: false,
            isModuleLockedFn: isModuleLocked,
          })
        ) {
          customToast.success(
            "Well done! Wait for the next lesson to open.",
            "Lesson Completed!"
          );
        } else {
          customToast.success(
            "Great job! Keep up the momentum and continue learning.",
            "Lesson Completed!"
          );
        }

        // Pop flowers (confetti) burst in AFTER the success card eases in (~450ms)
        setTimeout(() => {
          setShowConfetti(true);
        }, 450);
        setTimeout(() => setShowConfetti(false), 5500);
      } else {
        setCompletedLessonIds((prev) => prev.filter((id) => id !== lessonId));
      }
    } catch (err) {
      console.error(err);
      customToast.error("Could not update lesson completion.");
    }
  };

  const handleProgressSync = async (playedSeconds) => {
    if (!activeLesson) return;
    setCurrentVideoTimestamp(Math.floor(playedSeconds));
    try {
      await apiFetch(
        `/api/courses/${slug}/lessons/${activeLesson.id}/sync-progress/`,
        {
          method: "POST",
          body: JSON.stringify({
            timestamp_seconds: Math.floor(playedSeconds),
          }),
        }
      );
      // Optionally update local state
      setVideoProgressMap((prev) => ({
        ...prev,
        [activeLesson.id]: Math.floor(playedSeconds),
      }));
    } catch (err) {
      console.error("Failed to sync progress", err);
    }
  };

  const handlePrevLesson = () => {
    if (!course || (!activeLesson && !activeQuizId)) return;

    const curriculum = [];
    course.modules.forEach((m) => {
      if (m.lessons) {
        m.lessons.forEach((l) => {
          curriculum.push({ type: "lesson", item: l });
          const lessonQuizId = l.quiz_id || l.quiz?.id;
          if (l.has_quiz && lessonQuizId) {
            curriculum.push({ type: "quiz", item: { id: lessonQuizId } });
          }
        });
      }
      const modQuizId = m.quiz_id || m.quiz?.id;
      if (m.has_quiz && modQuizId) {
        if (!curriculum.some((c) => c.type === "quiz" && String(c.item.id) === String(modQuizId))) {
          curriculum.push({ type: "quiz", item: { id: modQuizId } });
        }
      }
    });

    let currentIndex = -1;
    if (activeLesson) {
      currentIndex = curriculum.findIndex(
        (c) => c.type === "lesson" && String(c.item.id) === String(activeLesson.id)
      );
    } else if (activeQuizId) {
      currentIndex = curriculum.findIndex(
        (c) => c.type === "quiz" && String(c.item.id) === String(activeQuizId)
      );
    }

    if (currentIndex > 0) {
      const prevItem = curriculum[currentIndex - 1];
      if (prevItem.type === "lesson") {
        setActiveQuizId(null);
        setActiveLesson(prevItem.item);
      } else {
        setActiveLesson(null);
        setActiveQuizId(prevItem.item.id);
      }
    }
  };

  if (loading) {
    return <DelayedSpinner message="Loading course content..." />;
  }

  if (error || !course) {
    return (
      <div className="flex min-h-[100dvh] w-full flex-col items-center justify-center gap-4 bg-background px-6 text-center text-foreground">
        <p className="max-w-md text-lg font-semibold">
          {error || "Course not found"}
        </p>
        {error && (
          <button
            type="button"
            onClick={() => {
              setError(null);
              setLoading(true);
              fetchCourseData(true);
            }}
            className="rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try Again
          </button>
        )}
      </div>
    );
  }

  const isCompleted = activeLesson
    ? completedLessonIds.includes(activeLesson.id)
    : false;
  const activeModuleIndex = course?.modules?.findIndex((module) =>
    (module.lessons || []).some((lesson) => lesson.id === activeLesson?.id)
  );
  const canMarkComplete = Boolean(
    activeLesson &&
    (isInstructorOrAdmin ||
      (activeLesson.is_visible !== false &&
        activeLesson.is_locked !== true &&
        !(typeof activeModuleIndex === "number" && activeModuleIndex >= 0 && isModuleLocked(activeModuleIndex))))
  );
  const playgroundType = resolvePlaygroundType(activeLesson, course);

  const activeCohort = course?.user_cohorts?.find(c => c.id === activeCohortId) || course?.user_cohorts?.[0];

  const handleCohortUpdated = (updatedCohort) => {
    if (!updatedCohort?.id) return;
    setCourse((prev) => {
      if (!prev?.user_cohorts) return prev;
      return {
        ...prev,
        user_cohorts: prev.user_cohorts.map((c) =>
          c.id === updatedCohort.id ? { ...c, ...updatedCohort } : c
        ),
      };
    });
  };

  const handleUploadMaterial = async (e) => {
    e.preventDefault();
    const file = materialFileInputRef.current?.files?.[0];
    if (!file) {
      customToast.error("Please select a file to upload.");
      return;
    }
    const targetLessonId = Number(materialTargetLessonId) || activeLesson?.id;
    if (!targetLessonId) {
      customToast.error("No lesson selected to attach this material to.");
      return;
    }
    setUploadingMaterial(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("title", materialTitle.trim() || file.name);
      formData.append("is_instructor_only", materialIsInstructorOnly ? "true" : "false");

      const res = await apiFetch(`/api/courses/lessons/${targetLessonId}/materials/`, {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        const uploaded = data?.material || (data?.id ? data : null);
        customToast.success("Material uploaded successfully!");
        setShowMaterialUpload(false);
        setMaterialTitle("");
        setMaterialIsInstructorOnly(false);
        if (materialFileInputRef.current) materialFileInputRef.current.value = "";

        if (uploaded) {
          setActiveLesson((prev) => {
            if (!prev || prev.id !== targetLessonId) return prev;
            return {
              ...prev,
              materials: [...(prev.materials || []), uploaded],
            };
          });
          setCourse((prev) => {
            if (!prev?.modules) return prev;
            return {
              ...prev,
              modules: prev.modules.map((m) => ({
                ...m,
                lessons: (m.lessons || []).map((l) =>
                  l.id === targetLessonId
                    ? { ...l, materials: [...(l.materials || []), uploaded] }
                    : l
                ),
              })),
            };
          });
        }
      } else {
        const err = await res.json().catch(() => ({}));
        customToast.error(err.error || "Failed to upload material.");
      }
    } catch (err) {
      console.error(err);
      customToast.error("Network error while uploading material.");
    } finally {
      setUploadingMaterial(false);
    }
  };

  const handleDeleteMaterial = async (matId) => {
    if (!window.confirm("Are you sure you want to remove this material from the lesson?")) return;
    try {
      const res = await apiFetch(`/api/courses/materials/${matId}/delete/`, {
        method: "DELETE",
      });
      if (res.ok) {
        customToast.success("Material deleted.");
        setActiveLesson((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            materials: (prev.materials || []).filter((m) => m.id !== matId),
          };
        });
        setCourse((prev) => {
          if (!prev?.modules) return prev;
          return {
            ...prev,
            modules: prev.modules.map((m) => ({
              ...m,
              lessons: (m.lessons || []).map((l) => ({
                ...l,
                materials: (l.materials || []).filter((m) => m.id !== matId),
              })),
            })),
          };
        });
      } else {
        const err = await res.json().catch(() => ({}));
        customToast.error(err.error || "Failed to delete material.");
      }
    } catch (err) {
      console.error(err);
      customToast.error("Network error deleting material.");
    }
  };

  const isGuestBlurred = pairingStatus?.is_pairing_active && !pairingStatus?.is_leader && pairingStatus?.team_name;
  const isHostActive = pairingStatus?.is_pairing_active && pairingStatus?.is_leader;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="course-learn flex flex-col h-[100dvh] bg-background text-foreground overflow-hidden relative transition-colors duration-200"
    >
      {/* Guest Pairing Overlay */}
      {/* Guest Pairing Overlay */}
      <AnimatePresence>
        {isGuestBlurred && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="fixed inset-0 z-[999] flex items-center justify-center p-3 sm:p-6 bg-background/95 backdrop-blur-md select-none overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center p-4 sm:p-6 bg-card border border-border rounded-2xl shadow-2xl max-w-xs xs:max-w-sm sm:max-w-md w-full space-y-3.5 animate-in fade-in zoom-in-95 duration-200 my-auto">
              {/* Centered Compact Icon */}
              <div className="w-11 h-11 bg-primary/10 border border-primary/20 rounded-full flex items-center justify-center mx-auto text-primary">
                <Users className="w-5 h-5" />
              </div>

              {/* Reduced typography & neat layout */}
              <div className="space-y-1">
                <h2 className="text-sm sm:text-base font-bold text-foreground tracking-tight">
                  Pairing Session Active
                </h2>
                <p className="text-xs text-muted-foreground leading-relaxed px-1">
                  Please move to <span className="font-semibold text-foreground underline decoration-primary decoration-2">{pairingStatus.leader_name}</span>'s computer.
                </p>
                {pairingStatus.team_name && (
                  <div className="pt-1">
                    <span className="inline-block text-[11px] font-bold text-primary px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/20">
                      Team: {pairingStatus.team_name}
                    </span>
                  </div>
                )}
              </div>

              {/* Team Members in this group */}
              <div className="bg-muted/40 border border-border/70 rounded-xl p-2.5 sm:p-3 text-left space-y-1.5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Team Members in this group
                </p>
                <div className="space-y-1.5 max-h-32 sm:max-h-36 overflow-y-auto pr-1">
                  {pairingStatus.leader_name && (
                    <div className="flex items-center justify-between text-xs py-1 px-2 rounded-md bg-background border border-border/50">
                      <div className="flex items-center gap-1.5 truncate">
                        <OnlineGlowDot isOnline={pairingStatus.leader?.is_online ?? true} size="xs" />
                        <span className="font-semibold text-foreground truncate">{pairingStatus.leader_name}</span>
                      </div>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 shrink-0">
                        Host / Leader
                      </span>
                    </div>
                  )}
                  {(pairingStatus.all_members || pairingStatus.members || [])
                    .filter((m) => m.name !== pairingStatus.leader_name)
                    .map((m) => (
                      <div key={m.id || m.name} className="flex items-center justify-between text-xs py-1 px-2 rounded-md bg-background/60 border border-border/30">
                        <div className="flex items-center gap-1.5 truncate">
                          <OnlineGlowDot isOnline={m.is_online} size="xs" />
                          <span className="text-foreground truncate">{m.name}</span>
                        </div>
                        <span className="text-[10px] text-muted-foreground shrink-0">
                          Teammate
                        </span>
                      </div>
                    ))}
                </div>
              </div>

              {/* Restricted Actions: Only Change Partner & Sign Out */}
              <div className="pt-1.5 border-t border-border/60 space-y-2">
                {pairingStatus.partner_change_requested || isChangeRequested ? (
                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-2.5 text-center space-y-1">
                    <p className="text-xs font-semibold text-amber-700 dark:text-amber-400">
                      Partner change requested - waiting for teacher approval
                    </p>
                    <button
                      type="button"
                      onClick={handleCancelCohortPartnerChange}
                      disabled={submittingChange}
                      className="text-[11px] text-muted-foreground hover:text-foreground underline transition-colors"
                    >
                      {submittingChange ? "Cancelling..." : "Cancel request"}
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleRequestCohortPartnerChange}
                    disabled={submittingChange}
                    className="w-full py-2 px-3 border border-border text-xs font-semibold rounded-lg hover:bg-muted transition-colors flex items-center justify-center gap-2 bg-background shadow-xs text-foreground disabled:opacity-50"
                  >
                    <ArrowRightLeft className="w-3.5 h-3.5 text-muted-foreground" />
                    <span>{submittingChange ? "Requesting..." : "Request change of partner"}</span>
                  </button>
                )}

                {/* Sign out button */}
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="w-full py-2 px-3 bg-muted/60 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20 border border-border/60 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 text-muted-foreground"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign out</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Navigation Bar */}
      {showWhiteboard ? (
        <div className="min-h-14 h-14 bg-slate-900 border-b border-slate-800 text-white flex shrink-0 z-30 w-full select-none shadow-md">
          <div className="w-full max-w-6xl mx-auto flex items-center justify-between px-3 sm:px-4 h-full relative">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-sm shrink-0">
                <FaChalkboardTeacher className="w-4 h-4" />
              </div>
              <div className="flex items-center gap-2 min-w-0">
                <span className="font-bold text-xs sm:text-sm text-white tracking-wide truncate">
                  Teacher Whiteboard
                </span>
                {activeLesson?.title && (
                  <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-800 text-slate-300 border border-slate-700 truncate max-w-xs">
                    {activeLesson.title}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {/* Classroom Date Banner Toggle */}
              <button
                type="button"
                onClick={() => setShowWhiteboardDate((prev) => !prev)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                  showWhiteboardDate
                    ? "bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30"
                    : "bg-slate-800 text-slate-400 border-slate-700 hover:text-white hover:bg-slate-700"
                }`}
                title="Toggle today's classroom date banner on the whiteboard"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>{showWhiteboardDate ? "Hide Date" : "Show Date"}</span>
              </button>

              {/* Exit Whiteboard Button */}
              <button
                type="button"
                onClick={() => setShowWhiteboard(false)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
                title="Exit Whiteboard and return to class (Esc)"
              >
                <FaTimes className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">Exit Board</span>
                <kbd className="hidden sm:inline-block ml-1 px-1.5 py-0.2 rounded bg-rose-700/80 text-[10px] uppercase font-mono">
                  Esc
                </kbd>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className={`min-h-14 h-14 bg-background border-b border-border flex shrink-0 z-20 w-full transition-colors duration-200 ${isHostActive ? 'border-b-green-500 shadow-[0_4px_15px_rgba(34,197,94,0.2)]' : ''}`}>
        <div className="w-full max-w-6xl mx-auto flex h-full relative">
        {/* Left Nav Area - fills left pane (same width as content, not max-w-5xl) */}
        <div className={`flex-1 flex items-center min-w-0 px-2 sm:px-4 ${activeQuizId ? '' : ''}`}>
          <div className="w-full flex items-center justify-between gap-2 h-full min-w-0">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1 overflow-hidden">
              <Link
                to={`/courses/${slug}`}
                className="text-foreground/70 hover:text-foreground flex items-center gap-1.5 text-xs sm:text-sm font-medium transition-colors shrink-0"
              >
                <FaChevronLeft size={12} />
                <span className="hidden xs:inline">Back</span>
              </Link>
              <div className="h-5 w-px bg-border hidden sm:block shrink-0"></div>

              {isHostActive && (
                <div
                  className="flex items-center gap-1.5 sm:gap-2 bg-emerald-500/10 border border-emerald-500/30 px-2 sm:px-2.5 py-1 rounded-full shrink-0 max-w-[170px] xs:max-w-[220px] sm:max-w-[320px] md:max-w-sm min-w-0"
                  title={`Team: ${pairingStatus.team_name} | Members: ${[pairingStatus.leader_name ? `${pairingStatus.leader_name} (Host)` : null, ...(pairingStatus.members || []).map(m => m.name)].filter(Boolean).join(", ")}`}
                >
                  <OnlineGlowDot isOnline={true} size="xs" />
                  <div className="flex items-center gap-1 min-w-0 text-xs text-emerald-700 dark:text-emerald-300">
                    <span className="font-bold truncate shrink-0">
                      {pairingStatus.team_name}
                    </span>
                    <span className="opacity-40">•</span>
                    <span className="truncate text-[11px] font-medium text-foreground/80">
                      {[pairingStatus.leader_name ? `${pairingStatus.leader_name} (Host)` : null, ...(pairingStatus.members || []).map(m => m.name)].filter(Boolean).join(", ")}
                    </span>
                  </div>
                </div>
              )}

              <div className="hidden md:flex items-center gap-2 shrink-0 ml-1 overflow-hidden">
                {isInstructorOrAdmin && (
                  <button
                    type="button"
                    onClick={() => setShowWhiteboard(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white shadow-sm transition-all whitespace-nowrap shrink-0 cursor-pointer"
                    title="Open Teacher Whiteboard"
                  >
                    <FaChalkboardTeacher className="w-3.5 h-3.5" />
                    <span>Whiteboard</span>
                  </button>
                )}

                {isInstructorOrAdmin && activeCohortId && (
                  <button
                    onClick={() => handleTogglePairing(!pairingStatus?.is_pairing_active)}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[11px] font-bold transition-all whitespace-nowrap shrink-0 ${pairingStatus?.is_pairing_active
                        ? "bg-red-500/10 text-red-500 hover:bg-red-500/20"
                        : "bg-primary/10 text-primary hover:bg-primary/20"
                      }`}
                  >
                    {pairingStatus?.is_pairing_active ? "End Pairing" : "Start Pairing"}
                  </button>
                )}

                <TeamSessionManager lessonId={activeLesson?.id} courseData={course} />
                {userXp && (
                  <div className="flex items-center shrink-0">
                    <XPBadge xpData={userXp} />
                  </div>
                )}
                <CourseAssistant courseSlug={slug} activeLessonId={activeLesson?.id} activeQuizId={activeQuizId} />
              </div>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">

              <div className="md:hidden flex items-center gap-1.5 shrink-0">
                {isInstructorOrAdmin && (
                  <button
                    type="button"
                    onClick={() => setShowWhiteboard(true)}
                    className="flex items-center justify-center h-8 w-8 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-all shrink-0 cursor-pointer"
                    title="Open Teacher Whiteboard"
                    aria-label="Open Teacher Whiteboard"
                  >
                    <FaChalkboardTeacher className="w-3.5 h-3.5" />
                  </button>
                )}
                <TeamSessionManager lessonId={activeLesson?.id} courseData={course} />
                <CourseAssistant courseSlug={slug} activeLessonId={activeLesson?.id} activeQuizId={activeQuizId} />
              </div>


              {/* Sidebar toggle button (shown when sidebar is closed, or on mobile) */}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className={`text-foreground/70 hover:text-foreground flex items-center justify-center gap-1.5 text-xs font-medium border border-border hover:bg-muted h-8 w-8 sm:w-auto sm:px-2.5 rounded-lg transition-colors shrink-0 ${sidebarOpen ? 'opacity-0 pointer-events-none' : ''}`}
                title="Course Content"
                aria-label="Course Content"
              >
                <FaListUl size={13} />
                <span className="hidden xl:inline">Content</span>
              </button>
            </div>
          </div>
        </div>

        <ReviewModal
          isOpen={isReviewModalOpen}
          onClose={() => setIsReviewModalOpen(false)}
          courseSlug={slug}
          onSuccess={() => fetchCourseData(false)}
        />

        <DocumentPreviewModal
          isOpen={Boolean(previewDoc)}
          onClose={() => setPreviewDoc(null)}
          doc={previewDoc}
        />

        {/* Right Nav Area - Absolute positioned so it slides in without pushing left content */}
        <div 
          className={`absolute top-0 right-0 h-full flex items-center justify-between bg-card border-b border-l border-border transition-[width,opacity] duration-300 ease-out z-30 overflow-hidden ${sidebarOpen ? 'w-full sm:w-[380px] lg:w-[420px] px-4 opacity-100' : 'w-0 px-0 opacity-0 pointer-events-none'}`}
        >
          <div className="flex items-center gap-2.5">
            <h3 className="font-semibold text-sm whitespace-nowrap">Course content</h3>
            <button 
              onClick={toggleAllModules}
              className="text-[11px] sm:text-xs text-primary/70 hover:text-primary font-medium transition-colors whitespace-nowrap"
            >
              {isAllExpanded ? "Collapse all" : "Expand all"}
            </button>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="text-foreground/50 hover:text-foreground flex items-center gap-1.5 text-xs sm:text-sm p-1.5 rounded-lg transition-colors shrink-0 hover:bg-muted ml-2"
            title="Close Course Content"
          >
            <X size={18} />
          </button>
        </div>
      </div>
      </div>
      )}

      {/* Main Split Interface */}
      <div className="flex flex-1 overflow-hidden w-full">
        <div className="w-full max-w-6xl mx-auto flex h-full relative">
        {/* Left Pane (Main Content) */}
        <div id="main-scroll-container" className={`flex-1 flex flex-col relative min-h-0 [scrollbar-gutter:stable] ${activeQuizId
            ? "overflow-hidden bg-background"
            : "overflow-y-auto custom-scrollbar"
          }`}>
          {/* Fixed-width shell on every tab - avoids layout shake when switching to Practical */}
          <div className={`course-learn-shell w-full flex flex-col min-h-0 flex-1 px-2 sm:px-4 py-2 sm:py-3 ${activeQuizId ? "overflow-hidden h-full" : "min-h-full"
            }`}>

            {showWhiteboard ? (
              <div className="w-full flex-1 flex flex-col min-h-0 py-1">
                <ClassroomWhiteboardModal
                  isOpen={showWhiteboard}
                  onClose={() => setShowWhiteboard(false)}
                  courseTitle={course?.title}
                  lessonTitle={activeLesson?.title}
                  courseSlug={slug}
                  lessonId={activeLesson?.id}
                  showDate={showWhiteboardDate}
                  onToggleDate={() => setShowWhiteboardDate((prev) => !prev)}
                />
              </div>
            ) : (
              <>
            {/* Floating Pop Flowers Celebration when Lesson Completed - portaled into document.body with z-[100001] to float in front of the success card */}
            {showConfetti && typeof document !== "undefined" && createPortal(
              <div className="fixed inset-0 pointer-events-none z-[100001] overflow-hidden">
                <Confetti
                  width={windowWidth}
                  height={windowHeight}
                  recycle={false}
                  numberOfPieces={420}
                  gravity={0.22}
                  initialVelocityY={22}
                />
              </div>,
              document.body
            )}

            {/* Unified Header - single fixed row, no wrap */}
            {!activeQuizId && (
              <div className="w-full bg-card border border-border rounded-xl px-2.5 py-2 sm:px-3 mb-3 shrink-0">
                {(() => {
                  const lessonSchedules = (activeCohort?.schedules || []).filter(s => s.lesson_id === activeLesson?.id);
                  const primarySch = lessonSchedules[0];
                  const todayStr = localISODate();
                  const todaySch = (activeCohort?.schedules || []).find(s => s.date === todayStr);
                  const statusSch = todaySch && todaySch.lesson_id === activeLesson?.id ? todaySch : primarySch;
                  const statusCfg = getStatusConfig(statusSch?.status || "scheduled");
                  const todayLabel = formatTodayLabel(new Date(), { includeYear: false });
                  const schedDateStr = formatLessonScheduleDate(
                    statusSch?.date,
                    statusSch?.start_time || statusSch?.time,
                    statusSch?.end_time
                  );
                  const schedDuration =
                    formatSessionDuration(statusSch?.start_time || statusSch?.time, statusSch?.end_time) ||
                    (typeof activeLesson?.duration_minutes === "number" && activeLesson.duration_minutes > 0
                      ? `${activeLesson.duration_minutes}m`
                      : null);

                  const handleTodayClick = () => {
                    const allSchedules = activeCohort?.schedules || [];
                    let targetSch = allSchedules.find(s => s.date === todayStr && s.lesson_id);
                    if (!targetSch) {
                      targetSch = allSchedules.find(s => s.date === todayStr);
                    }
                    if (!targetSch) {
                      targetSch = allSchedules.find(s => s.date >= todayStr && s.lesson_id && s.status === "scheduled");
                    }
                    if (!targetSch) {
                      targetSch = allSchedules.find(s => s.date >= todayStr && s.lesson_id);
                    }
                    if (!targetSch) {
                      targetSch = allSchedules.find(s => s.lesson_id && s.status === "scheduled");
                    }
                    if (!targetSch) {
                      targetSch = allSchedules.find(s => s.lesson_id);
                    }

                    if (targetSch?.lesson_id) {
                      let tLesson = null;
                      course?.modules?.forEach(m => {
                        m.lessons?.forEach(l => {
                          if (String(l.id) === String(targetSch.lesson_id)) {
                            tLesson = l;
                          }
                        });
                      });
                      if (tLesson) {
                        handleSelectLesson(tLesson);
                      }
                    }
                    // Selects today's lesson and opens sidebar so it scrolls to top, does NOT open timetable modal!
                    setSidebarOpen(true);
                  };

                  return (
                    <div className="flex flex-wrap items-center gap-1 sm:gap-1.5 min-w-0 w-full overflow-hidden">
                      <h1 className="text-foreground font-extrabold text-[10px] sm:text-xs shrink-0">
                        {course?.title || "Course"}
                      </h1>
                      {activeCohort?.schedules?.length > 0 ? (
                        <button
                          type="button"
                          onClick={handleTodayClick}
                          className="shrink text-left text-[8.5px] sm:text-[10px] font-extrabold rounded-md px-1.5 py-0.5 bg-blue-800 text-white border border-blue-900 leading-tight hover:bg-blue-700 transition-colors shadow-sm cursor-pointer"
                          title="Click to pull up today's scheduled lesson"
                        >
                          {todayLabel}
                        </button>
                      ) : null}

                      {schedDateStr && (
                        <span className="shrink-0 text-[8.5px] sm:text-[10.5px] font-semibold text-muted-foreground bg-muted/60 border border-border rounded px-1.5 py-0.5 whitespace-nowrap">
                          {schedDateStr}
                        </span>
                      )}

                      {statusSch && (
                        <span
                          className={`shrink-0 text-[9px] sm:text-[11px] font-bold rounded px-1.5 py-0.5 whitespace-nowrap ${statusCfg.badgeClass}`}
                        >
                          {statusCfg.label}
                        </span>
                      )}

                      <h2
                        className="flex-[1_1_100%] sm:flex-1 min-w-[160px] text-[12px] sm:text-sm font-bold text-foreground whitespace-normal break-words leading-tight"
                        title={activeLesson?.title}
                      >
                        {activeLesson?.title}
                      </h2>

                      <div className="flex items-center gap-1 shrink-0 ml-auto">
                        <button
                          type="button"
                          onClick={() => setIsToolbarCollapsed(!isToolbarCollapsed)}
                          className="p-1 sm:p-1.5 rounded-md border border-border hover:bg-muted text-foreground transition-colors"
                          title={isToolbarCollapsed ? "Expand Toolbar" : "Collapse Toolbar"}
                          aria-label={isToolbarCollapsed ? "Expand" : "Collapse"}
                        >
                          {isToolbarCollapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
                        </button>
                      </div>
                    </div>
                  );
                })()}

                {/* Bottom Toolbar Area (Hidden if collapsed) - Row 2 */}
                {!isToolbarCollapsed && (
                  <div className="mt-2 pt-2 border-t border-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 sm:gap-2">
                    {/* Fixed tab slots - same columns always so labels never reflow */}
                    <div
                      className="course-learn-tabs flex-1 min-w-0"
                      style={{
                        "--learn-tab-cols": (isInstructorOrAdmin ? 8 : 6) + (hasTextbooks ? 1 : 0),
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => { handleTabClick("overview"); setHideVideo(true); }}
                        className={`course-learn-tab ${activeTab === "overview" ? "bg-primary text-primary-foreground shadow-sm" : "bg-muted/70 text-muted-foreground"}`}
                      >
                        Overview
                      </button>
                      <button
                        type="button"
                        onClick={() => { handleTabClick("text"); setHideVideo(true); }}
                        className={`course-learn-tab ${activeTab === "text" ? "bg-primary text-primary-foreground shadow-sm" : "bg-muted/70 text-muted-foreground"}`}
                      >
                        Text
                      </button>
                      {hasTextbooks && (
                        <button
                          type="button"
                          onClick={() => { handleTabClick("textbook"); setHideVideo(true); }}
                          className={`course-learn-tab flex items-center justify-center ${
                            activeTab === "textbook"
                              ? "bg-teal-700 text-white shadow-sm"
                              : "bg-muted/70 text-teal-700 dark:text-teal-400 font-bold hover:bg-muted"
                          }`}
                          title="Cambridge IT Textbooks (Hodder & Cambridge University Press)"
                        >
                          Textbook
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => playgroundType && (handleTabClick("playground"), setHideVideo(true))}
                        disabled={!playgroundType}
                        className={`course-learn-tab ${!playgroundType
                            ? "bg-muted/40 text-muted-foreground/40 cursor-not-allowed"
                            : activeTab === "playground"
                              ? "bg-primary text-primary-foreground shadow-sm"
                              : "bg-muted/70 text-muted-foreground"
                          }`}
                      >
                        Practical
                      </button>
                      <button
                        type="button"
                        onClick={() => { handleTabClick("assignment"); setHideVideo(true); }}
                        className={`course-learn-tab ${activeTab === "assignment" ? "bg-primary text-primary-foreground shadow-sm" : "bg-muted/70 text-muted-foreground"}`}
                      >
                        Assignment
                      </button>
                      <button
                        type="button"
                        onClick={() => { handleTabClick("downloads"); setHideVideo(true); }}
                        className={`course-learn-tab ${activeTab === "downloads" ? "bg-primary text-primary-foreground shadow-sm" : "bg-muted/70 text-muted-foreground"}`}
                      >
                        Files
                      </button>
                      <button
                        type="button"
                        onClick={() => { handleTabClick("classmates"); setHideVideo(true); }}
                        className={`course-learn-tab ${activeTab === "classmates" ? "bg-primary text-primary-foreground shadow-sm" : "bg-muted/70 text-muted-foreground"}`}
                      >
                        Class
                      </button>
                      {isInstructorOrAdmin && (
                        <>
                          <button
                            type="button"
                            onClick={() => { handleTabClick("script"); setHideVideo(true); }}
                            className={`course-learn-tab ${activeTab === "script" ? "bg-primary text-primary-foreground shadow-sm" : "bg-muted/70 text-muted-foreground"}`}
                          >
                            Script
                          </button>
                          <button
                            type="button"
                            onClick={() => { handleTabClick("plan"); setHideVideo(true); }}
                            className={`course-learn-tab ${activeTab === "plan"
                                ? "bg-red-500 text-white shadow-sm"
                                : "bg-muted/70 text-red-500"
                              }`}
                          >
                            Plan
                          </button>
                        </>
                      )}
                    </div>

                    <div className="grid grid-cols-[minmax(0,1fr)_2.25rem_minmax(0,1.15fr)_2.25rem_minmax(2.75rem,0.7fr)] sm:flex sm:items-center gap-0.5 sm:gap-2 w-full sm:w-auto shrink-0">
                      <button
                        type="button"
                        onClick={() => setHideVideo(!hideVideo)}
                        className="h-7 sm:h-9 sm:w-28 min-w-0 rounded-lg font-semibold text-[9px] sm:text-xs border bg-background border-border text-foreground text-center truncate px-0.5 sm:px-1"
                      >
                        {hideVideo ? "Show vid" : "Hide vid"}
                      </button>
                      <button
                        type="button"
                        onClick={handlePrevLesson}
                        className="h-7 sm:h-9 sm:w-16 bg-background border border-border text-foreground text-[9px] sm:text-xs font-semibold rounded-lg"
                      >
                        Prev
                      </button>
                      <button
                        type="button"
                        onClick={() => canMarkComplete && handleLessonComplete(activeLesson?.id)}
                        disabled={!canMarkComplete}
                        className={`h-7 sm:h-9 sm:w-36 min-w-0 flex items-center justify-center gap-0.5 rounded-lg font-semibold text-[9px] sm:text-xs border truncate px-0.5 sm:px-1 ${!canMarkComplete
                            ? "bg-muted border-border text-foreground/40 cursor-not-allowed"
                            : isCompleted
                              ? "bg-background border-border text-foreground/70"
                              : "bg-blue-600 border-blue-600 text-white"
                          }`}
                      >
                        <FaCheckCircle className={isCompleted ? "text-blue-500" : "text-white"} size={9} />
                        <span className="truncate">{isCompleted ? "Done" : "Complete"}</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleNextLesson}
                        className="h-7 sm:h-9 sm:w-16 bg-background border border-border text-foreground text-[9px] sm:text-xs font-semibold rounded-lg"
                      >
                        Next
                      </button>
                      <div
                        className="min-w-0 h-7 sm:h-9 sm:w-28 rounded-lg border border-border bg-muted/60 overflow-hidden relative flex items-center justify-center"
                        title={`${progressPercent}% completed`}
                      >
                        <div
                          className="absolute inset-y-0 left-0 bg-blue-500/80 transition-all duration-500"
                          style={{ width: `${Math.max(0, Math.min(100, progressPercent))}%` }}
                        />
                        <span className="relative z-[1] text-[9px] sm:text-[11px] font-extrabold text-foreground drop-shadow-sm">
                          {progressPercent}%
                        </span>
                    </div>
                  </div>
                  </div>
                )}
              </div>
            )}

            {/* Main Area: Video (Embedded or Split) or Quiz */}
            {(activeQuizId || (!hideVideo && videoViewMode !== "floating" && activeTab !== "playground")) && (
              <div className={`w-full overflow-hidden flex flex-col mb-4 transition-all ${isVideoMaximized
                  ? 'fixed inset-0 z-[99999] bg-black p-4 flex flex-col'
                  : activeQuizId
                    ? 'flex-1 bg-background min-h-[70vh] flex flex-col justify-center items-center'
                    : 'shrink-0 rounded-xl bg-black shadow-2xl border border-border aspect-video max-h-[65vh]'
                }`}>
                {/* Header bar for Video full-screen controls */}
                {!activeQuizId && !hideVideo && (
                  <div className="bg-card/80 backdrop-blur-md px-3 py-1.5 border-b border-border flex items-center justify-between text-xs font-semibold text-foreground">
                    <span className="truncate max-w-[300px] text-muted-foreground">{activeLesson?.title}</span>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center bg-muted/70 border border-border/80 rounded-lg p-0.5 text-xs font-semibold shrink-0">
                        <button
                          type="button"
                          onClick={() => setVideoViewMode("embedded")}
                          className={`px-1.5 py-1 rounded text-[10px] sm:text-[11px] transition-colors ${videoViewMode === "embedded" ? "bg-card text-primary shadow-sm font-bold" : "text-muted-foreground hover:text-foreground"}`}
                        >
                          Embed
                        </button>
                        <button
                          type="button"
                          onClick={() => setVideoViewMode("floating")}
                          className={`px-1.5 py-1 rounded text-[10px] sm:text-[11px] transition-colors flex items-center gap-0.5 ${videoViewMode === "floating" ? "bg-card text-primary shadow-sm font-bold" : "text-muted-foreground hover:text-foreground"}`}
                          title="Floating Draggable Window"
                        >
                          <PictureInPicture2 size={11} /> Floating
                        </button>
                        <button
                          type="button"
                          onClick={() => setVideoViewMode("split")}
                          className={`px-1.5 py-1 rounded text-[10px] sm:text-[11px] transition-colors flex items-center gap-0.5 ${videoViewMode === "split" ? "bg-card text-primary shadow-sm font-bold" : "text-muted-foreground hover:text-foreground"}`}
                          title="Split View"
                        >
                          <LayoutGrid size={11} /> Split
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsVideoMaximized(!isVideoMaximized)}
                        className="p-1 hover:bg-muted rounded text-foreground transition-colors flex items-center gap-1 text-[11px]"
                      >
                        {isVideoMaximized ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                        {isVideoMaximized ? "Exit Fullscreen" : "Fullscreen"}
                      </button>
                    </div>
                  </div>
                )}

                {activeQuizId ? (
                  activeQuiz ? (
                    <QuizPlayer
                      quiz={activeQuiz}
                      courseSlug={slug}
                      onQuizSubmit={handleQuizSubmit}
                      onReviewLesson={handleReviewLesson}
                    />
                  ) : (
                    <DelayedSpinner fullScreen={false} message="Loading quiz..." />
                  )
                ) : (
                  <div className="flex-1 w-full relative">
                    <VideoPlayer
                      url={activeLesson?.video_url}
                      title={activeLesson?.title}
                      savedProgress={
                        activeLesson ? videoProgressMap[activeLesson.id] || 0 : 0
                      }
                      onProgressSync={handleProgressSync}
                      onEnded={handleVideoEnded}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Floating Picture-in-Picture Video Player Window (Draggable & Resizable) */}
            {!activeQuizId && !hideVideo && videoViewMode === "floating" && (
              <motion.div
                drag
                dragMomentum={false}
                className="fixed bottom-6 right-6 w-80 sm:w-96 min-w-[280px] max-w-[85vw] aspect-video bg-black rounded-lg shadow-2xl border-2 border-primary/60 z-[999999] overflow-hidden flex flex-col resize"
              >
                <div className="bg-card/95 backdrop-blur-md px-3 py-2 border-b border-border flex items-center justify-between text-xs font-bold text-foreground cursor-grab active:cursor-grabbing select-none">
                  <span className="truncate max-w-[200px] text-primary flex items-center gap-1">
                    <span className="text-muted-foreground">⋮⋮</span> {activeLesson?.title}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setVideoViewMode("embedded")}
                      className="px-2 py-0.5 hover:bg-muted rounded border border-border/60 text-muted-foreground hover:text-foreground text-[10px] transition-colors"
                      title="Dock Video Back to Top"
                    >
                      Dock Top
                    </button>
                    <button
                      type="button"
                      onClick={() => setHideVideo(true)}
                      className="px-1.5 py-0.5 hover:bg-muted rounded text-red-500 font-bold text-xs transition-colors"
                      title="Close Floating Video"
                    >
                      ✕
                    </button>
                  </div>
                </div>
                <div className="flex-1 w-full relative bg-black">
                  <VideoPlayer
                    url={activeLesson?.video_url}
                    title={activeLesson?.title}
                    savedProgress={
                      activeLesson ? videoProgressMap[activeLesson.id] || 0 : 0
                    }
                    onProgressSync={handleProgressSync}
                    onEnded={handleVideoEnded}
                  />
                </div>
              </motion.div>
            )}

            {/* Content Area - full left width (same shell as Practical Activity), no tab jump */}
            {!activeQuizId && (
              <div className={activeTab === "playground"
                ? "course-learn-content flex-1 min-h-0 overflow-y-auto scrollbar-hide flex flex-col w-full"
                : "course-learn-content flex-1 pt-2 pb-24 w-full"
              }>

                {/* Tab Content */}
                {!activeQuizId && activeTab === "overview" && (
                  <div className="course-learn-panel w-full max-w-none space-y-3">
                    {isInstructorOrAdmin && activeLesson && (
                      <div className="flex justify-end">
                        <InstructorLessonEditButton
                          lesson={activeLesson}
                          field="overview"
                          onSaved={handleLessonFieldSaved}
                        />
                      </div>
                    )}
                    <LessonTextPanel
                      emptyLabel="No overview objectives provided for this lesson."
                      markdown={
                        activeLesson?.overview
                          ? `# Overview\n\n` +
                          (activeLesson?.duration_minutes
                            ? `## Session length\n**${activeLesson.duration_minutes} minutes**\n\n`
                            : "") +
                          `## Today you will\n${activeLesson.overview}`
                          : ""
                      }
                    />
                  </div>
                )}

                {!activeQuizId && activeTab === "text" && (
                  <div className="course-learn-panel w-full max-w-none space-y-3">
                    {isInstructorOrAdmin && activeLesson && (
                      <div className="flex justify-end">
                        <InstructorLessonEditButton
                          lesson={activeLesson}
                          field="lesson_text"
                          onSaved={handleLessonFieldSaved}
                        />
                      </div>
                    )}
                    {hasTextbooks && (
                      <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-teal-800 text-white text-xs font-semibold shadow-sm">
                        <span className="truncate font-bold">
                          Licensed Cambridge IT textbook pages and diagram figures available for this topic.
                        </span>
                        <button
                          type="button"
                          onClick={() => { handleTabClick("textbook"); setHideVideo(true); }}
                          className="px-3.5 py-1.5 rounded-lg bg-white hover:bg-teal-50 text-teal-900 font-black text-xs shrink-0 transition-colors shadow-sm"
                        >
                          Read in Textbook →
                        </button>
                      </div>
                    )}
                    <LessonTextPanel
                      emptyLabel="No detailed text notes available for this lesson."
                      markdown={
                        activeLesson?.lesson_text
                          ? (activeLesson?.duration_minutes
                            ? `> **Session length: ${activeLesson.duration_minutes} minutes**\n\n`
                            : "") + activeLesson.lesson_text
                          : ""
                      }
                    />
                  </div>
                )}

                {!activeQuizId && activeTab === "textbook" && hasTextbooks && (
                  <div className="course-learn-panel w-full max-w-none">
                    <CourseTextbookViewer
                      courseSlug={slug}
                      courseTitle={course?.title}
                      activeLesson={activeLesson}
                      isSuperuser={Boolean(me?.is_superuser || me?.is_staff)}
                    />
                  </div>
                )}

                {!activeQuizId && activeTab === "script" && (
                  <div className="w-full space-y-3">
                    {isInstructorOrAdmin && activeLesson && (
                      <div className="flex justify-end">
                        <InstructorLessonEditButton
                          lesson={activeLesson}
                          field="video_script"
                          onSaved={handleLessonFieldSaved}
                        />
                      </div>
                    )}
                    <div className="prose prose-blue dark:prose-invert max-w-none text-foreground/80">
                      {activeLesson?.video_script ? (
                        <div
                          dangerouslySetInnerHTML={{
                            __html: DOMPurify.sanitize(
                              marked(activeLesson.video_script)
                            ),
                          }}
                        />
                      ) : (
                        <p className="text-foreground/40 italic">
                          No narration script available for this lesson.
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {!activeQuizId && activeTab === "playground" && playgroundType && (
                  <div className="flex-1 min-h-0 overflow-y-auto pb-16">
                    <CodingPlayground
                      lesson={{ ...activeLesson, playground_type: playgroundType }}
                      courseSlug={slug}
                      course={course}
                      cohort={activeCohort}
                      me={me}
                      isInstructorOrAdmin={isInstructorOrAdmin}
                      onCohortUpdated={handleCohortUpdated}
                    />
                  </div>
                )}

                {!activeQuizId && activeTab === "assignment" && (
                  <div className="course-learn-panel w-full max-w-none">
                    <LessonAssignmentDoc
                      lesson={activeLesson}
                      courseSlug={slug}
                      course={course}
                      cohort={activeCohort}
                      me={me}
                      isInstructorOrAdmin={isInstructorOrAdmin}
                      onXpEarned={(xp) => {
                        setUserXp((prev) => (prev || 0) + xp);
                      }}
                    />
                  </div>
                )}

                {!activeQuizId && activeTab === "plan" && isInstructorOrAdmin && (
                  <div className="w-full space-y-3 p-4 bg-red-500/5 border border-red-500/20 rounded-xl">
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <h3 className="font-bold text-red-500 text-lg">Lesson Plan (Instructors Only)</h3>
                      {activeLesson && (
                        <InstructorLessonEditButton
                          lesson={activeLesson}
                          field="content"
                          onSaved={handleLessonFieldSaved}
                        />
                      )}
                    </div>
                    <div className="prose prose-red dark:prose-invert max-w-none text-foreground/80">
                      {activeLesson?.content ? (
                        <div
                          dangerouslySetInnerHTML={{
                            __html: DOMPurify.sanitize(
                              marked(activeLesson.content)
                            ),
                          }}
                        />
                      ) : (
                        <p className="text-foreground/40 italic">
                          No lesson plan uploaded for this lesson.
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === "downloads" && (
                  <div className="course-learn-panel w-full max-w-none space-y-4">
                    {certificateUrl ? (
                      <div className="p-5 border border-primary/20 rounded-xl bg-primary/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-primary"></div>
                        <div>
                          <h3 className="font-semibold text-foreground">
                            Course Certificate
                          </h3>
                          <p className="text-sm text-foreground/60">
                            Your official completion certificate
                          </p>
                        </div>
                        <a
                          href={certificateUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-5 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity shrink-0"
                        >
                          <FaCheckCircle /> View Certificate
                        </a>
                      </div>
                    ) : progressPercent >= 100 ? (
                      <div className="p-5 border border-primary/20 rounded-xl bg-primary/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-primary"></div>
                        <div>
                          <h3 className="font-semibold text-foreground">
                            Congratulations!
                          </h3>
                          <p className="text-sm text-foreground/60">
                            You have completed the course. Claim your certificate now!
                          </p>
                        </div>
                        <button
                          onClick={handleClaimCertificate}
                          className="px-5 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity shrink-0 cursor-pointer"
                        >
                          <FaCheckCircle /> Claim Certificate
                        </button>
                      </div>
                    ) : (
                      course && (
                        <div className="p-5 border border-border rounded-xl bg-background flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative overflow-hidden">
                          <div>
                            <h3 className="font-semibold text-foreground">
                              Course Certificate (Sample)
                            </h3>
                            <p className="text-sm text-foreground/60">
                              Complete all lessons and quizzes to earn your official certificate.
                            </p>
                          </div>
                          <a
                            href={`/api/courses/${course.slug}/sample-certificate/`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-5 py-2.5 border border-primary text-primary rounded-lg font-medium text-sm flex items-center justify-center gap-2 hover:bg-primary/5 transition-colors shrink-0"
                          >
                            <FaEye /> View Sample
                          </a>
                        </div>
                      )
                    )}



                    {activeLesson?.offline_video && (
                      <div className="p-5 border border-border rounded-xl bg-background flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <h3 className="font-semibold text-foreground">
                            Download Lesson Video
                          </h3>
                          <p className="text-sm text-foreground/60">
                            Get the .mp4 file for "{activeLesson.title}" to watch
                            offline
                          </p>
                        </div>
                        <a
                          href={activeLesson.offline_video}
                          download
                          className="px-5 py-2.5 bg-blue-500 text-white rounded-lg font-medium text-sm flex items-center justify-center gap-2 hover:bg-blue-600 transition-colors shrink-0"
                        >
                          <FaDownload /> Download Video
                        </a>
                      </div>
                    )}

                    {course?.offline_archive && (
                      <div className="p-5 border border-border rounded-xl bg-background flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <h3 className="font-semibold text-foreground">
                            Download Full Course
                          </h3>
                          <p className="text-sm text-foreground/60">
                            Get all course materials in a single .zip file
                          </p>
                        </div>
                        <a
                          href={course.offline_archive}
                          download
                          className="px-5 py-2.5 bg-foreground text-background rounded-lg font-medium text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity shrink-0"
                        >
                          <FaDownload /> Download .ZIP
                        </a>
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-border">
                      <div>
                        <h3 className="font-bold text-sm sm:text-base text-foreground">
                          Materials &amp; Preparation List
                        </h3>
                        <p className="text-xs text-foreground/60">
                          Worksheets, templates, code, and supplementary documents
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="inline-flex rounded-lg border border-border p-0.5 bg-muted/40 text-xs">
                          <button
                            type="button"
                            onClick={() => setMaterialScope("all")}
                            className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                              materialScope === "all"
                                ? "bg-primary text-primary-foreground shadow-sm"
                                : "text-muted-foreground hover:text-foreground"
                            }`}
                          >
                            All Files ({filteredAllMaterials.length})
                          </button>
                          <button
                            type="button"
                            onClick={() => setMaterialScope("current")}
                            className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                              materialScope === "current"
                                ? "bg-primary text-primary-foreground shadow-sm"
                                : "text-muted-foreground hover:text-foreground"
                            }`}
                          >
                            This Lesson ({filteredCurrentMaterials.length})
                          </button>
                        </div>
                        {isInstructorOrAdmin && (
                          <button
                            type="button"
                            onClick={() => setShowMaterialUpload((v) => !v)}
                            className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-bold transition-all shadow-sm shrink-0 inline-flex items-center gap-1.5"
                          >
                            <FaUpload className="w-3 h-3" />
                            <span>{showMaterialUpload ? "Cancel" : "Upload Material"}</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {showMaterialUpload && isInstructorOrAdmin && (
                      <form
                        onSubmit={handleUploadMaterial}
                        className="p-4 sm:p-5 rounded-xl border border-primary/30 bg-primary/5 space-y-4"
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-primary">
                            Upload Lesson Material
                          </h4>
                          <span className="text-[11px] text-muted-foreground">
                            Appears across all cohorts
                          </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-xs font-semibold text-foreground/80 mb-1">
                              Target Lesson
                            </label>
                            <select
                              value={materialTargetLessonId || activeLesson?.id || ""}
                              onChange={(e) => setMaterialTargetLessonId(e.target.value)}
                              className="w-full px-2.5 py-2 rounded-lg border border-border bg-background text-xs text-foreground focus:outline-none focus:border-primary"
                            >
                              {(course?.modules || []).flatMap((mod) =>
                                (mod.lessons || []).map((l) => (
                                  <option key={l.id} value={l.id}>
                                    {mod.title} · {l.title}
                                  </option>
                                ))
                              )}
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-foreground/80 mb-1">
                              Select File (.docx, .pdf, .ppt, .py, .zip, etc.)
                            </label>
                            <input
                              type="file"
                              ref={materialFileInputRef}
                              required
                              className="w-full text-xs text-foreground file:mr-2 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-foreground/80 mb-1">
                              Material Title (optional)
                            </label>
                            <input
                              type="text"
                              value={materialTitle}
                              onChange={(e) => setMaterialTitle(e.target.value)}
                              placeholder="e.g. Microsoft Word Practical Lesson"
                              className="w-full px-2.5 py-2 rounded-lg border border-border bg-background text-xs text-foreground focus:outline-none focus:border-primary"
                            />
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-primary/20">
                          <label className="flex items-center gap-2 text-xs text-foreground/80 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={materialIsInstructorOnly}
                              onChange={(e) => setMaterialIsInstructorOnly(e.target.checked)}
                              className="rounded text-primary focus:ring-0"
                            />
                            <span>Instructor Only document (hide from students)</span>
                          </label>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setShowMaterialUpload(false)}
                              className="px-3.5 py-1.5 rounded-lg border border-border bg-background hover:bg-muted text-xs font-semibold"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              disabled={uploadingMaterial}
                              className="px-4 py-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-bold disabled:opacity-50 inline-flex items-center gap-1.5 shadow-sm"
                            >
                              <FaUpload className="w-3 h-3" />
                              <span>{uploadingMaterial ? "Uploading..." : "Save Material"}</span>
                            </button>
                          </div>
                        </div>
                      </form>
                    )}

                    {filteredAllMaterials.length > 4 && (
                      <div className="relative">
                        <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-muted-foreground pointer-events-none" />
                        <input
                          type="text"
                          value={materialSearchQuery}
                          onChange={(e) => setMaterialSearchQuery(e.target.value)}
                          placeholder="Search files by name or lesson..."
                          className="w-full px-3 py-2 pl-9 text-xs rounded-lg border border-border bg-background text-foreground focus:outline-none focus:border-primary"
                        />
                      </div>
                    )}

                    {displayedMaterials.length === 0 ? (
                      <div className="p-8 text-center border border-dashed border-border rounded-xl bg-muted/20">
                        <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                          <FaFileAlt className="w-5 h-5 opacity-60" />
                        </div>
                        <h4 className="font-semibold text-sm text-foreground mb-1">
                          {materialScope === "current"
                            ? `No files attached to "${activeLesson?.title || "this lesson"}" yet.`
                            : "No course materials found."}
                        </h4>
                        <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                          {materialScope === "current" && filteredAllMaterials.length > 0 ? (
                            <span>
                              There are {filteredAllMaterials.length} files across other lessons.{" "}
                              <button
                                type="button"
                                onClick={() => setMaterialScope("all")}
                                className="text-primary underline font-medium hover:text-primary/80"
                              >
                                View all course files
                              </button>
                            </span>
                          ) : isInstructorOrAdmin ? (
                            "Use the Upload Material button above to add worksheets, guides, or lesson plan files."
                          ) : (
                            "Check back later or explore other lessons for supplementary resources."
                          )}
                        </p>
                      </div>
                    ) : (
                      displayedMaterials.map((mat) => (
                        <div
                          key={mat.id}
                          className="p-4 sm:p-5 border border-border rounded-xl bg-card hover:border-primary/40 transition-all shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                        >
                          <div className="flex items-start gap-3 min-w-0">
                            <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                              <FaFileAlt className="w-5 h-5" />
                            </div>
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <h3 className="font-semibold text-sm sm:text-base text-foreground break-words">
                                  {mat.title}
                                </h3>
                                {mat.is_instructor_only && (
                                  <span className="px-2.5 py-0.5 bg-rose-600 text-white text-[10px] font-bold uppercase rounded shadow-sm">
                                    Instructor Only
                                  </span>
                                )}
                              </div>
                              <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs">
                                {mat.lessonTitle && (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-slate-800 text-white font-semibold text-[11px] shadow-sm">
                                    {mat.moduleTitle ? `${mat.moduleTitle} · ` : ""}{mat.lessonTitle}
                                  </span>
                                )}
                                {materialScope === "all" && mat.lessonsList && mat.lessonsList.length > 1 && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-700 text-white font-bold text-[10px] shadow-sm">
                                    Used across {mat.lessonsList.length} lessons
                                  </span>
                                )}
                                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-semibold shadow-sm ${
                                  mat.is_instructor_only
                                    ? "bg-purple-700 text-white"
                                    : "bg-slate-700 text-white"
                                }`}>
                                  {mat.is_instructor_only ? "Lesson Plan Document" : "Supplementary Material"}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 shrink-0 self-end sm:self-center">
                            {mat.file && isViewableDoc(mat.file) && (
                              <button
                                type="button"
                                onClick={() => setPreviewDoc(mat)}
                                className="px-3.5 py-2 sm:px-4 sm:py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold rounded-lg text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-sm transition-all shrink-0 cursor-pointer"
                                title="Preview document in popup"
                              >
                                <FaEye className="w-3.5 h-3.5" />
                                <span>View</span>
                              </button>
                            )}
                            <a
                              href={mat.download_url || `/api/courses/materials/${mat.id}/download/`}
                              download
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-4 py-2 sm:px-5 sm:py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold rounded-lg text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-sm transition-all shrink-0 cursor-pointer"
                            >
                              <FaDownload className="w-3.5 h-3.5" />
                              <span>Download</span>
                            </a>
                            {isInstructorOrAdmin && (
                              <button
                                type="button"
                                onClick={() => handleDeleteMaterial(mat.id)}
                                title="Delete material"
                                className="px-3 py-2 sm:px-3.5 sm:py-2.5 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-semibold rounded-lg text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-sm transition-all shrink-0 cursor-pointer"
                              >
                                <FaTrash className="w-3.5 h-3.5" />
                                <span>Delete</span>
                              </button>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {activeTab === "classmates" && (
                  <div className="course-learn-panel w-full">
                    <Suspense
                      fallback={
                        <DelayedSpinner fullScreen={false} message="Loading classmates..." />
                      }
                    >
                      <ClassmatesTab
                        slug={slug}
                        cohortId={activeCohortId}
                        onCohortChange={setActiveCohortId}
                        cohorts={course?.user_cohorts || []}
                        lessonId={activeLesson?.id}
                      />
                    </Suspense>
                  </div>
                )}
              </div>
            )}
            </>
            )}
          </div>
        </div>

        {/* Right Pane (Sidebar) */}
        <div
          className={`
          absolute inset-y-0 right-0 z-30 shrink-0 
          transition-all duration-300 ease-in-out overflow-hidden bg-card border-l border-border flex flex-col
          ${sidebarOpen ? "w-full sm:w-[380px] lg:w-[420px] opacity-100" : "w-0 opacity-0 pointer-events-none border-l-0"}
        `}
        >
          {(course?.user_cohorts?.length > 0) && (
            <div className="px-3 sm:px-4 py-2 border-b border-border bg-muted/30 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-1 min-w-0">
                <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">
                  {isInstructorOrAdmin ? "Select Cohort" : "Select Stream"}
                </label>
                {activeCohort && (
                  <button
                    type="button"
                    onClick={() => setShowTimetableModal(true)}
                    className="shrink-0 p-1 rounded-md border border-border text-foreground hover:bg-muted"
                    title="Cohort Timetable"
                    aria-label="Timetable"
                  >
                    <Calendar size={12} />
                  </button>
                )}
              </div>
              <SearchableSelect
                value={activeCohortId || ""}
                onChange={(e) => setActiveCohortId(Number(e.target.value))}
                wrapLabel
                className="w-full max-w-full min-w-0 bg-background hover:bg-muted text-foreground border border-border rounded-md px-1.5 outline-none cursor-pointer transition-colors"
                contentClassName="text-[10px] sm:text-xs"
              >
                {course.user_cohorts.map((cohort) => (
                  <option key={cohort.id} value={cohort.id}>
                    {cohort.name}
                  </option>
                ))}
              </SearchableSelect>
            </div>
          )}
          <div className="w-full h-full flex-1 overflow-hidden flex flex-col">

            <LessonSidebar
              modules={course.modules}
              userCohort={activeCohort}
              completedLessonIds={completedLessonIds}
              progressPercent={progressPercent}
              activeLessonId={activeLesson?.id}
              activeQuizId={activeQuizId}
              certificateUrl={certificateUrl}
              quizAttemptsMap={quizAttemptsMap}
              expandedModules={expandedModules}
              setExpandedModules={setExpandedModules}
              onOpenTimetable={() => setShowTimetableModal(true)}
              onUpgradeClick={() => {
                if (course) {
                  addToCart({
                    id: `course-${course.id}`,
                    item_id: course.id,
                    type: "course",
                    title: course.title,
                    price: course.price,
                    image_url: course.thumbnail_url,
                  });
                  navigate("/cart");
                }
              }}
              onOpenCertificateModal={() => setShowCompletionModal(true)}
              onSelectLesson={handleSelectLesson}
              onSelectQuiz={handleSelectQuiz}
              onClaimTermCertificate={handleClaimTermCertificate}
              onViewTermCertificate={(url) => {
                setCertificateUrl(url);
                setShowCompletionModal(true);
              }}
              onCloseMobile={() => {
                if (window.innerWidth < 1024) setSidebarOpen(false);
              }}
            />
          </div>
        </div>

        {/* Sidebar Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/60 z-20"
            onClick={() => setSidebarOpen(false)}
          ></div>
        )}
        </div>
      </div>

      {/* Completion Modal */}
      <CourseCompletionModal
        isOpen={showCompletionModal}
        onClose={() => {
          setShowCompletionModal(false);
          setClaimingModuleId(null);
          setClaimingModuleTitle(null);
        }}
        certificateUrl={certificateUrl}
        courseTitle={course?.title}
        courseSlug={slug}
        moduleId={claimingModuleId}
        moduleTitle={claimingModuleTitle}
        onCertificateClaimed={(url) => {
          setCertificateUrl(url);
          fetchCourseData(false);
        }}
      />

      {/* Cohort Timetable Modal */}
      {showTimetableModal && activeCohort && (
        <CohortTimetableModal
          cohort={activeCohort}
          isOpen={showTimetableModal}
          onClose={() => setShowTimetableModal(false)}
          isInstructor={isInstructorOrAdmin}
          onScheduleUpdated={() => fetchCourseData(false)}
          activeLessonId={activeLesson?.id}
          onSelectLesson={(lessonId) => {
            if (!course || !course.modules) return;
            let foundLesson = null;
            for (const mod of course.modules) {
              if (mod.lessons) {
                foundLesson = mod.lessons.find((l) => l.id === lessonId);
                if (foundLesson) break;
              }
            }
            if (foundLesson) {
              handleSelectLesson(foundLesson);
              setShowTimetableModal(false);
            }
          }}
        />
      )}
    </motion.div>
  );
}
