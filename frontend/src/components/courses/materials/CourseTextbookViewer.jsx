import { useEffect, useMemo, useRef, useState } from "react";
import {
  Bold,
  ChevronLeft,
  ChevronRight,
  Code,
  Columns,
  Edit3,
  Eye,
  FileText,
  Heading1,
  Heading2,
  Heading3,
  Italic,
  Layers,
  List,
  ListOrdered,
  LoaderCircle,
  Maximize2,
  Quote,
  RotateCcw,
  Save,
  Trash2,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { apiFetch } from "@/api/client/apiClient";
import { toast } from "sonner";

const TOPIC_PALETTES = [
  { bg: "#ecfeff", border: "#22d3ee", accent: "#0f766e", chip: "#0f766e", mark: "#ccfbf1" },
  { bg: "#f0fdf4", border: "#4ade80", accent: "#15803d", chip: "#16a34a", mark: "#dcfce7" },
  { bg: "#fff7ed", border: "#fb923c", accent: "#c2410c", chip: "#ea580c", mark: "#ffedd5" },
  { bg: "#faf5ff", border: "#c084fc", accent: "#7e22ce", chip: "#9333ea", mark: "#f3e8ff" },
  { bg: "#eff6ff", border: "#60a5fa", accent: "#1d4ed8", chip: "#1d4ed8", mark: "#dbeafe" },
  { bg: "#fdf2f8", border: "#f472b6", accent: "#be185d", chip: "#db2777", mark: "#fce7f3" },
];

function topicStyle(topicCode = "") {
  const digits = String(topicCode).replace(/\D/g, "");
  const index = digits ? Number(digits) % TOPIC_PALETTES.length : 0;
  return TOPIC_PALETTES[index];
}

function extractTopicCodeFromTitle(title = "") {
  if (!title) return "";
  const dotMatch = title.match(/\b(\d+\.\d+)/);
  if (dotMatch) return dotMatch[1];
  const topicMatch = title.match(/Topic\s+(\d+)/i);
  if (topicMatch) return topicMatch[1];
  const numMatch = title.match(/^(\d+(?:\.\d+)?)/);
  if (numMatch) return numMatch[1];
  return "";
}

function splitIntoParagraphs(text) {
  if (text.length < 300) return [text];
  const sentences = text.match(/[^.!?]+[.!?]+(?:\s+|$)|[^.!?]+$/g) || [text];
  const paragraphs = [];
  let current = "";
  for (const s of sentences) {
    const trimmed = s.trim();
    if (!trimmed) continue;
    if (current && current.length + trimmed.length > 340) {
      paragraphs.push(current);
      current = trimmed;
    } else {
      current = current ? `${current} ${trimmed}` : trimmed;
    }
  }
  if (current) paragraphs.push(current);
  return paragraphs.length ? paragraphs : [text];
}

/**
 * Format raw PDF or markdown text into well-spaced, clean paragraphs with headings and lists.
 */
function parseAndSpaceParagraphs(rawText = "") {
  const cleaned = String(rawText || "")
    .replace(/\u0000/g, "")
    .replace(/\r\n/g, "\n")
    .replace(/\u00a0/g, " ")
    .replace(/[ \t]+\n/g, "\n")
    .trim();

  if (!cleaned) {
    return [
      {
        type: "empty",
        text: "This page is predominantly diagrams, figures, or a chapter cover.",
      },
    ];
  }

  const rawBlocks = cleaned.split(/\n{2,}/);
  const blocks = [];

  for (const rawBlock of rawBlocks) {
    const lines = rawBlock
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l && !/^\d{1,3}$/.test(l));

    if (!lines.length) continue;

    // Check for Markdown Headings (# Heading)
    const firstLine = lines[0];
    if (lines.length === 1 && /^#{1,3}\s+/.test(firstLine)) {
      blocks.push({
        type: "heading",
        text: firstLine.replace(/^#{1,3}\s+/, ""),
      });
      continue;
    }

    // Check for Blockquote (> quote)
    if (lines.every((l) => l.startsWith(">"))) {
      blocks.push({
        type: "quote",
        text: lines.map((l) => l.replace(/^>\s*/, "")).join(" "),
      });
      continue;
    }

    // Check for bullet or numbered list items
    if (lines.every((l) => /^([-*•▪■]|\d+\.)\s+/.test(l))) {
      for (const l of lines) {
        blocks.push({
          type: "list",
          text: l.replace(/^([-*•▪■]|\d+\.)\s+/, ""),
        });
      }
      continue;
    }

    const combined = lines.join(" ").replace(/\s+/g, " ").trim();

    if (
      lines.length === 1 &&
      (combined.length < 90 ||
        /^(chapter|topic|unit|section|\d+(\.\d+)*)\b/i.test(combined) ||
        /^(learning objectives|key term|case study|summary|activity|extension|review questions)\b/i.test(combined))
    ) {
      blocks.push({
        type: "heading",
        text: combined,
      });
      continue;
    }

    if (/[★•▪■]/.test(combined)) {
      const items = combined.split(/(?=[★•▪■])/).map((s) => s.trim()).filter(Boolean);
      for (const it of items) {
        blocks.push({
          type: "list",
          text: it.replace(/^[★•▪■]\s*/, ""),
        });
      }
      continue;
    }

    // Split dense blocks into digestible paragraphs
    const paragraphs = splitIntoParagraphs(combined);
    for (const p of paragraphs) {
      blocks.push({
        type: "paragraph",
        text: p,
      });
    }
  }

  return blocks;
}

export default function CourseTextbookViewer({
  courseSlug,
  courseTitle = "Cambridge IT (9626)",
  activeLesson = null,
  isSuperuser = false,
}) {
  const [library, setLibrary] = useState([]);
  const [loadingLibrary, setLoadingLibrary] = useState(true);
  const [activeBookKey, setActiveBookKey] = useState("");
  const [activeBook, setActiveBook] = useState(null);

  const [topics, setTopics] = useState([]);
  const [pages, setPages] = useState([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [loadingPages, setLoadingPages] = useState(false);

  const [mode, setMode] = useState("topic"); // "topic" | "full"
  const [selectedTopicCode, setSelectedTopicCode] = useState("");
  const [jumpPageInput, setJumpPageInput] = useState("");
  const [showToc, setShowToc] = useState(false);
  const [lightboxImage, setLightboxImage] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [deletingImageId, setDeletingImageId] = useState(null);

  // Super Admin Inline Edit modal state
  const [editingPage, setEditingPage] = useState(null);
  const [editText, setEditText] = useState("");
  const [editTopicCode, setEditTopicCode] = useState("");
  const [editTopicTitle, setEditTopicTitle] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  const lessonTopicCode = useMemo(() => {
    return extractTopicCodeFromTitle(activeLesson?.title || "");
  }, [activeLesson?.title]);

  useEffect(() => {
    let cancelled = false;
    setLoadingLibrary(true);
    apiFetch(`/api/courses/${courseSlug}/textbooks/?topics=1`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || "Failed to load textbooks.");
        if (cancelled) return;
        const books = data.textbooks || [];
        setLibrary(books);

        if (books.length > 0) {
          const isALevel = lessonTopicCode && Number(lessonTopicCode.split(".")[0]) >= 12;
          const initial =
            isALevel && books.find((b) => b.key === "cup_as_a_coursebook_2e")
              ? "cup_as_a_coursebook_2e"
              : books[0].key;
          setActiveBookKey(initial);
        }
      })
      .catch((err) => {
        console.error(err);
        if (!cancelled) toast.error("Could not load Cambridge textbooks.");
      })
      .finally(() => {
        if (!cancelled) setLoadingLibrary(false);
      });

    return () => {
      cancelled = true;
    };
  }, [courseSlug, lessonTopicCode]);

  useEffect(() => {
    if (!activeBookKey || !library.length) return;
    const found = library.find((b) => b.key === activeBookKey);
    setActiveBook(found || null);
    setTopics(found?.topics || []);
  }, [activeBookKey, library]);

  useEffect(() => {
    if (lessonTopicCode) {
      setSelectedTopicCode(lessonTopicCode);
      setMode("topic");
    }
  }, [lessonTopicCode]);

  const fetchPages = (bookKey, topicCode, pageStart = 1, pageEnd = null) => {
    if (!bookKey) return;
    setLoadingPages(true);
    let url = `/api/courses/${courseSlug}/textbooks/${bookKey}/pages/?from=${pageStart}`;
    if (pageEnd) url += `&to=${pageEnd}`;
    if (topicCode) url += `&topic=${encodeURIComponent(topicCode)}`;

    apiFetch(url)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || "Failed to load pages.");
        setPages(data.pages || []);
        setPageIndex(0);
      })
      .catch((err) => {
        console.error(err);
        setPages([]);
        toast.error("Unable to load textbook pages.");
      })
      .finally(() => {
        setLoadingPages(false);
      });
  };

  useEffect(() => {
    if (!activeBookKey) return;
    if (mode === "topic" && selectedTopicCode) {
      fetchPages(activeBookKey, selectedTopicCode);
    } else {
      fetchPages(activeBookKey, null, 1, 30);
    }
  }, [activeBookKey, mode, selectedTopicCode]);

  const currentPage = pages[pageIndex] || null;
  const blocks = useMemo(() => {
    return parseAndSpaceParagraphs(currentPage?.text || "");
  }, [currentPage?.text]);

  const colours = topicStyle(currentPage?.topic_code || selectedTopicCode);

  const handleJumpToPage = (e) => {
    e.preventDefault();
    const target = parseInt(jumpPageInput, 10);
    if (isNaN(target) || target < 1 || (activeBook?.page_count && target > activeBook.page_count)) {
      toast.error(`Enter a valid page number (1 - ${activeBook?.page_count || "max"}).`);
      return;
    }
    const idx = pages.findIndex((p) => p.page_number === target);
    if (idx !== -1) {
      setPageIndex(idx);
    } else {
      fetchPages(activeBookKey, null, Math.max(1, target - 5), target + 25);
    }
    setJumpPageInput("");
  };

  const handlePrev = () => {
    if (pageIndex > 0) {
      setPageIndex((i) => i - 1);
    } else if (pages.length > 0 && pages[0].page_number > 1) {
      const start = Math.max(1, pages[0].page_number - 20);
      fetchPages(activeBookKey, null, start, pages[0].page_number - 1);
    }
  };

  const handleNext = () => {
    if (pageIndex < pages.length - 1) {
      setPageIndex((i) => i + 1);
    } else if (pages.length > 0 && activeBook?.page_count && pages[pages.length - 1].page_number < activeBook.page_count) {
      const nextStart = pages[pages.length - 1].page_number + 1;
      fetchPages(activeBookKey, null, nextStart, Math.min(activeBook.page_count, nextStart + 20));
    }
  };

  const handleOpenEdit = () => {
    if (!currentPage) return;
    setEditingPage(currentPage);
    setEditText(currentPage.text || "");
    setEditTopicCode(currentPage.topic_code || "");
    setEditTopicTitle(currentPage.topic_title || "");
  };

  const handleSavePageEdit = async (e) => {
    e.preventDefault();
    if (!editingPage) return;
    setSavingEdit(true);
    try {
      const res = await apiFetch(
        `/api/courses/textbooks/${activeBookKey}/pages/${editingPage.page_number}/`,
        {
          method: "PATCH",
          body: JSON.stringify({
            text: editText,
            topic_code: editTopicCode,
            topic_title: editTopicTitle,
          }),
        }
      );
      if (res.ok) {
        const updated = await res.json();
        toast.success(`Page ${editingPage.page_number} updated successfully!`);
        setPages((prev) =>
          prev.map((p) =>
            p.page_number === editingPage.page_number
              ? {
                  ...p,
                  text: updated.text,
                  topic_code: updated.topic_code,
                  topic_title: updated.topic_title,
                }
              : p
          )
        );
        setEditingPage(null);
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.detail || "Failed to save page edit.");
      }
    } catch {
      toast.error("Network error while saving edit.");
    } finally {
      setSavingEdit(false);
    }
  };

  const [editorViewMode, setEditorViewMode] = useState("split"); // "split" | "edit" | "preview"
  const textareaRef = useRef(null);

  const insertFormatting = (prefix, suffix = "") => {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = editText.substring(start, end);
    const replacement = `${prefix}${selected || "text"}${suffix}`;
    const nextText = editText.substring(0, start) + replacement + editText.substring(end);
    setEditText(nextText);
    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start + prefix.length, start + prefix.length + (selected ? selected.length : 4));
    }, 0);
  };

  useEffect(() => {
    if (!editingPage) return;
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        handleSavePageEdit(e);
      }
      if (e.key === "Escape") {
        setEditingPage(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [editingPage, editText, editTopicCode, editTopicTitle, savingEdit]);

  const wordCount = useMemo(() => {
    const trimmed = (editText || "").trim();
    return trimmed ? trimmed.split(/\s+/).length : 0;
  }, [editText]);

  const previewBlocks = useMemo(() => {
    return parseAndSpaceParagraphs(editText || "");
  }, [editText]);

  const handleDeleteImage = async (img) => {
    if (!img?.id) return;
    if (!window.confirm(`Delete Diagram Figure from page ${currentPage?.page_number || ""}? This cannot be undone.`)) return;
    setDeletingImageId(img.id);
    try {
      const res = await apiFetch(`/api/courses/textbooks/images/${img.id}/delete/`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed to delete image.");
      toast.success("Diagram image deleted.");
      setPages((prevPages) =>
        prevPages.map((p) => {
          if (p.page_number === currentPage?.page_number) {
            return {
              ...p,
              images: (p.images || []).filter((item) => item.id !== img.id),
            };
          }
          return p;
        })
      );
      if (lightboxImage?.id === img.id) {
        setLightboxImage(null);
      }
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Could not delete image.");
    } finally {
      setDeletingImageId(null);
    }
  };

  if (loadingLibrary) {
    return (
      <div className="flex h-96 items-center justify-center rounded-2xl border border-border bg-card text-card-foreground p-6 shadow-sm transition-colors duration-200">
        <LoaderCircle className="h-8 w-8 animate-spin text-teal-700" />
        <span className="ml-3 text-sm font-bold text-foreground">
          Loading Cambridge coursebooks...
        </span>
      </div>
    );
  }

  if (!library.length) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-card text-card-foreground p-8 text-center shadow-sm transition-colors duration-200">
        <Layers className="h-10 w-10 text-muted-foreground mb-3" />
        <h3 className="text-base font-bold text-foreground">No Textbooks Registered</h3>
        <p className="text-xs text-muted-foreground max-w-sm mt-1">
          Cambridge International IT (9626) licensed textbooks have not yet been linked to this course.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col space-y-3 pb-8">
      {/* Top Controls Bar - Semantic Theme Tokens */}
      <div className="w-full rounded-2xl border border-border bg-card text-card-foreground p-3 sm:p-4 shadow-sm space-y-3 transition-colors duration-200">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Book Switcher Tabs - Solid Colors */}
          <div className="flex flex-wrap items-center gap-2 min-w-0">
            {library.map((book) => {
              const active = book.key === activeBookKey;
              const isHodder = book.key === "hodder_as_student";
              return (
                <button
                  key={book.key}
                  type="button"
                  onClick={() => {
                    setActiveBookKey(book.key);
                    setPageIndex(0);
                  }}
                  className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                    active
                      ? isHodder
                        ? "bg-[#0f766e] text-white shadow-sm"
                        : "bg-[#1d4ed8] text-white shadow-sm"
                      : "bg-muted text-muted-foreground hover:text-foreground border border-border"
                  }`}
                  title={`${book.title} (${book.edition})`}
                >
                  <span className="truncate max-w-[150px] sm:max-w-[240px]">
                    {isHodder ? "Hodder AS Student's Book" : "Cambridge UP Coursebook"}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Mode Switcher: Topic Aligned vs Full Book */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="inline-flex rounded-xl p-1 bg-muted border border-border text-xs gap-1">
              <button
                type="button"
                onClick={() => {
                  setMode("topic");
                  if (lessonTopicCode) setSelectedTopicCode(lessonTopicCode);
                }}
                className={`px-3 py-1.5 rounded-lg font-black transition-all ${
                  mode === "topic"
                    ? "bg-card text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Topic Aligned
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode("full");
                  setSelectedTopicCode("");
                }}
                className={`px-3 py-1.5 rounded-lg font-black transition-all ${
                  mode === "full"
                    ? "bg-card text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Full Book
              </button>
            </div>

            {/* Contents Button */}
            <button
              type="button"
              onClick={() => setShowToc((v) => !v)}
              className={`px-3 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all ${
                showToc
                  ? "bg-teal-700 text-white shadow-sm"
                  : "bg-muted text-foreground hover:bg-muted/80 border border-border"
              }`}
              title="Table of Contents"
            >
              <List className="w-4 h-4" />
              <span>Contents</span>
            </button>
          </div>
        </div>

        {/* Secondary Navigation Row */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border text-xs">
          <div className="flex items-center gap-2 min-w-0">
            {mode === "topic" && (currentPage?.topic_code || selectedTopicCode) ? (
              <span
                className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider text-white shadow-sm"
                style={{ backgroundColor: colours.chip }}
              >
                Topic {currentPage?.topic_code || selectedTopicCode}
              </span>
            ) : (
              <span className="text-muted-foreground text-xs font-bold">
                Browsing Complete Coursebook
              </span>
            )}

            {currentPage && (
              <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-black bg-muted text-foreground border border-border shadow-xs">
                Page {currentPage.page_number}
                {activeBook?.page_count ? ` of ${activeBook.page_count}` : ""}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Quick Page Jump Form */}
            <form onSubmit={handleJumpToPage} className="flex items-center gap-1">
              <input
                type="number"
                min="1"
                max={activeBook?.page_count || 1000}
                value={jumpPageInput}
                onChange={(e) => setJumpPageInput(e.target.value)}
                placeholder="Page..."
                className="w-16 px-2.5 py-1 rounded-lg border border-border bg-background text-foreground text-xs font-bold focus:outline-none focus:ring-2 focus:ring-teal-700"
              />
              <button
                type="submit"
                className="px-3 py-1 rounded-lg bg-teal-700 hover:bg-teal-800 text-white text-xs font-black shadow-sm"
              >
                Go
              </button>
            </form>

            {/* Super Admin Edit Page Button */}
            {isSuperuser && currentPage && (
              <button
                type="button"
                onClick={handleOpenEdit}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-red-700 hover:bg-red-800 text-white text-xs font-black shadow-sm transition-colors"
                title="Super Admin: Edit this textbook page"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Page</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Table of Contents Drawer */}
      {showToc && (
        <div className="w-full p-4 rounded-2xl border border-border bg-card text-card-foreground shadow-xl transition-colors duration-200 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="flex items-center justify-between pb-2 mb-3 border-b border-border">
            <h4 className="text-xs font-black uppercase tracking-wider text-foreground flex items-center gap-1.5">
              <List className="w-4 h-4 text-foreground" />
              Table of Contents ({activeBook?.title})
            </h4>
            <button
              type="button"
              onClick={() => setShowToc(false)}
              className="p-1.5 rounded-lg bg-muted hover:bg-muted/80 text-foreground font-bold border border-border"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-72 overflow-y-auto custom-scrollbar pr-1">
            {topics.map((t) => {
              const active = selectedTopicCode === t.topic_code;
              return (
                <button
                  key={t.topic_code}
                  type="button"
                  onClick={() => {
                    setSelectedTopicCode(t.topic_code);
                    setMode("topic");
                    setShowToc(false);
                  }}
                  className={`p-2.5 rounded-xl text-left text-xs transition-all ${
                    active
                      ? "bg-teal-700 text-white font-black shadow-sm"
                      : "bg-muted/50 hover:bg-muted text-foreground border border-border/60"
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className={`font-black text-[11px] ${active ? "text-white" : "text-teal-700 dark:text-teal-400"}`}>
                      Topic {t.topic_code}
                    </span>
                    <span className={`text-[10px] font-bold ${active ? "text-white/80" : "text-muted-foreground"}`}>
                      p.{t.page_start} - {t.page_end}
                    </span>
                  </div>
                  <p className="truncate text-[11.5px] font-bold">
                    {t.topic_title || `Topic ${t.topic_code}`}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Fullscreen 50/50 Split Live Editor Modal */}
      {editingPage && (
        <div className="fixed inset-0 z-[250] flex flex-col bg-background text-foreground animate-in fade-in duration-200">
          {/* Top Header Bar */}
          <div className="h-14 px-4 border-b border-border bg-card flex items-center justify-between shrink-0 gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="p-2 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400">
                <Edit3 className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-black truncate text-foreground">
                    Editor: Page {editingPage.page_number}
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-muted text-muted-foreground uppercase tracking-wider hidden sm:inline-block">
                    {activeBook?.title}
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground truncate hidden sm:block">
                  {wordCount} words · {editText.length} chars · Markdown &amp; Live Real-Time Rendering
                </p>
              </div>
            </div>

            {/* Center View Controls: Split / Editor / Preview */}
            <div className="flex items-center bg-muted p-0.5 rounded-xl border border-border text-xs font-bold">
              <button
                type="button"
                onClick={() => setEditorViewMode("split")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                  editorViewMode === "split"
                    ? "bg-card text-foreground shadow-xs font-black"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                title="Split 50/50 View"
              >
                <Columns className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Split 50/50</span>
              </button>
              <button
                type="button"
                onClick={() => setEditorViewMode("edit")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                  editorViewMode === "edit"
                    ? "bg-card text-foreground shadow-xs font-black"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                title="Editor Only"
              >
                <FileText className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Editor</span>
              </button>
              <button
                type="button"
                onClick={() => setEditorViewMode("preview")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                  editorViewMode === "preview"
                    ? "bg-card text-foreground shadow-xs font-black"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                title="Live Preview Only"
              >
                <Eye className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Preview</span>
              </button>
            </div>

            {/* Right Actions: Discard & Save */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setEditingPage(null)}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                Cancel (Esc)
              </button>
              <button
                type="button"
                onClick={handleSavePageEdit}
                disabled={savingEdit}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-black shadow-sm disabled:opacity-50 transition-colors"
                title="Save changes (Ctrl+S)"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{savingEdit ? "Saving..." : "Save (Ctrl+S)"}</span>
              </button>
            </div>
          </div>

          {/* Split Body */}
          <div className="flex-1 flex overflow-hidden w-full relative">
            {/* Left 50%: Editor Pane */}
            {(editorViewMode === "split" || editorViewMode === "edit") && (
              <div
                className={`flex flex-col h-full border-r border-border bg-card/40 overflow-hidden ${
                  editorViewMode === "split" ? "w-full md:w-1/2" : "w-full"
                }`}
              >
                {/* Metadata Row: Topic Code & Title */}
                <div className="p-3 border-b border-border bg-card grid grid-cols-1 sm:grid-cols-3 gap-2.5 shrink-0">
                  <div>
                    <label className="block text-[11px] font-bold text-muted-foreground mb-1">Topic Code</label>
                    <input
                      type="text"
                      value={editTopicCode}
                      onChange={(e) => setEditTopicCode(e.target.value)}
                      placeholder="e.g. 1.4"
                      className="w-full px-2.5 py-1.5 rounded-lg border border-border bg-background text-foreground text-xs font-bold focus:outline-none focus:ring-2 focus:ring-teal-700"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-muted-foreground mb-1">Topic Title</label>
                    <input
                      type="text"
                      value={editTopicTitle}
                      onChange={(e) => setEditTopicTitle(e.target.value)}
                      placeholder="e.g. Differences Between Data and Information"
                      className="w-full px-2.5 py-1.5 rounded-lg border border-border bg-background text-foreground text-xs font-bold focus:outline-none focus:ring-2 focus:ring-teal-700"
                    />
                  </div>
                </div>

                {/* Microsoft Docs / Markdown Toolbar */}
                <div className="px-3 py-2 border-b border-border bg-muted/40 flex flex-wrap items-center gap-1 shrink-0 text-xs">
                  <button
                    type="button"
                    onClick={() => insertFormatting("**", "**")}
                    className="p-1.5 rounded hover:bg-muted text-foreground transition-colors"
                    title="Bold (**text**)"
                  >
                    <Bold className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertFormatting("*", "*")}
                    className="p-1.5 rounded hover:bg-muted text-foreground transition-colors"
                    title="Italic (*text*)"
                  >
                    <Italic className="w-3.5 h-3.5" />
                  </button>
                  <div className="h-4 w-px bg-border mx-1" />
                  <button
                    type="button"
                    onClick={() => insertFormatting("\n# ", "\n")}
                    className="px-2 py-1 rounded hover:bg-muted text-foreground font-black text-[11px]"
                    title="Heading 1"
                  >
                    H1
                  </button>
                  <button
                    type="button"
                    onClick={() => insertFormatting("\n## ", "\n")}
                    className="px-2 py-1 rounded hover:bg-muted text-foreground font-black text-[11px]"
                    title="Heading 2"
                  >
                    H2
                  </button>
                  <button
                    type="button"
                    onClick={() => insertFormatting("\n### ", "\n")}
                    className="px-2 py-1 rounded hover:bg-muted text-foreground font-black text-[11px]"
                    title="Heading 3"
                  >
                    H3
                  </button>
                  <div className="h-4 w-px bg-border mx-1" />
                  <button
                    type="button"
                    onClick={() => insertFormatting("\n- ", "")}
                    className="p-1.5 rounded hover:bg-muted text-foreground transition-colors"
                    title="Bullet List (- item)"
                  >
                    <List className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertFormatting("\n1. ", "")}
                    className="p-1.5 rounded hover:bg-muted text-foreground transition-colors"
                    title="Numbered List (1. item)"
                  >
                    <ListOrdered className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertFormatting("\n> ", "\n")}
                    className="p-1.5 rounded hover:bg-muted text-foreground transition-colors"
                    title="Quote / Callout (> text)"
                  >
                    <Quote className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertFormatting("`", "`")}
                    className="p-1.5 rounded hover:bg-muted text-foreground transition-colors"
                    title="Inline Code (`code`)"
                  >
                    <Code className="w-3.5 h-3.5" />
                  </button>
                  <div className="h-4 w-px bg-border mx-1" />
                  <button
                    type="button"
                    onClick={() => insertFormatting("\n\n", "")}
                    className="px-2 py-1 rounded bg-muted hover:bg-muted/80 text-foreground text-[11px] font-bold"
                    title="Insert new paragraph break"
                  >
                    + Paragraph
                  </button>
                  <span className="ml-auto text-[10px] text-muted-foreground hidden lg:inline">
                    Separate paragraphs with blank lines
                  </span>
                </div>

                {/* Editor Textarea */}
                <div className="flex-1 p-3 min-h-0 relative">
                  <textarea
                    ref={textareaRef}
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    placeholder="Enter textbook page content here... Separate paragraphs with blank lines. Use # for headings, - for lists."
                    className="w-full h-full p-4 rounded-xl border border-border bg-background text-foreground font-sans text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-teal-700 resize-none custom-scrollbar"
                  />
                </div>
              </div>
            )}

            {/* Right 50%: Live Rendered Preview */}
            {(editorViewMode === "split" || editorViewMode === "preview") && (
              <div
                className={`flex flex-col h-full bg-background overflow-y-auto custom-scrollbar p-4 sm:p-6 ${
                  editorViewMode === "split" ? "hidden md:flex md:w-1/2" : "w-full"
                }`}
              >
                {/* Live Preview Watermark Indicator */}
                <div className="flex items-center justify-between pb-3 mb-4 border-b border-border">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-teal-500"></span>
                    </span>
                    <span className="text-xs font-black uppercase tracking-wider text-muted-foreground">
                      Real-Time Textbook Preview
                    </span>
                  </div>
                  <span className="text-[11px] font-bold text-muted-foreground">
                    What learners see
                  </span>
                </div>

                {/* Rendered Live Textbook Sheet */}
                <div className="w-full rounded-2xl border border-border bg-card text-card-foreground shadow-md p-5 sm:p-8 space-y-6 max-w-3xl mx-auto transition-colors duration-200">
                  {/* Header Banner with live topic style */}
                  <div
                    className="p-4 sm:p-5 rounded-2xl shadow-sm text-white transition-colors duration-200"
                    style={{ backgroundColor: topicStyle(editTopicCode).chip }}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-white text-slate-900 shadow-xs">
                        Topic {editTopicCode || "-"}
                      </span>
                      <span className="text-[11px] font-black px-2.5 py-0.5 rounded-md bg-white text-slate-900 shadow-xs">
                        Page {editingPage.page_number}
                      </span>
                    </div>
                    <h2 className="text-lg sm:text-2xl font-black tracking-tight text-white mt-1">
                      {editTopicTitle || activeBook?.title || "Cambridge IT"}
                    </h2>
                  </div>

                  {/* Existing diagram images on this page - BORDERLESS */}
                  {editingPage.images && editingPage.images.length > 0 && (
                    <div className="space-y-4 text-center my-4 w-full flex flex-col items-center justify-center">
                      <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-muted border border-border text-foreground text-xs font-bold uppercase tracking-wider">
                        <Layers className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                        <span>Diagrams ({editingPage.images.length})</span>
                      </span>
                      <div className="flex flex-col items-center justify-center gap-4 max-w-xl mx-auto w-full">
                        {editingPage.images.map((img, i) => (
                          <div key={img.id || i} className="group relative flex flex-col items-center justify-center text-center w-full mx-auto my-2">
                            <div className="relative flex items-center justify-center w-full min-h-[180px] max-h-[460px] overflow-hidden p-0 mx-auto">
                              <img
                                src={img.url}
                                alt={img.caption || `Diagram p.${editingPage.page_number}`}
                                className="max-h-[420px] max-w-full object-contain mx-auto block"
                              />
                            </div>
                            <div className="mt-2 flex items-center justify-center gap-2">
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-muted text-muted-foreground">
                                Figure {i + 1}
                              </span>
                              {img.caption && (
                                <span className="text-xs text-muted-foreground italic">
                                  {img.caption}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Live Rendered Content Paragraphs */}
                  <div className="space-y-4 leading-relaxed w-full">
                    {previewBlocks.map((block, idx) => {
                      if (block.type === "empty") {
                        return (
                          <div key={idx} className="flex flex-col items-center justify-center text-center py-6 my-4 w-full">
                            <div className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-muted border border-border text-muted-foreground text-xs font-bold text-center max-w-md mx-auto">
                              <Layers className="w-4 h-4 text-muted-foreground shrink-0" />
                              <span>{block.text}</span>
                            </div>
                          </div>
                        );
                      }
                      if (block.type === "heading") {
                        return (
                          <h3
                            key={idx}
                            className="text-base sm:text-lg font-black text-foreground mt-6 pt-2 border-b border-border pb-1 text-left"
                          >
                            {block.text}
                          </h3>
                        );
                      }
                      if (block.type === "quote") {
                        return (
                          <blockquote
                            key={idx}
                            className="border-l-4 border-teal-600 bg-muted/40 p-3 rounded-r-xl italic text-xs sm:text-sm text-foreground my-2"
                          >
                            {block.text}
                          </blockquote>
                        );
                      }
                      if (block.type === "list") {
                        return (
                          <div
                            key={idx}
                            className="flex items-start gap-2.5 p-2.5 rounded-xl bg-muted/60 text-xs sm:text-sm text-foreground my-1.5 text-justify"
                          >
                            <span className="text-teal-700 dark:text-teal-400 font-bold shrink-0 mt-0.5">•</span>
                            <span>{block.text}</span>
                          </div>
                        );
                      }
                      return (
                        <p
                          key={idx}
                          className="text-justify leading-relaxed sm:leading-8 text-[15px] sm:text-[16px] text-foreground my-3.5 font-normal tracking-normal"
                        >
                          {block.text}
                        </p>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Page Viewer Sheet - Theme Matching bg-card */}
      <div className="relative w-full rounded-2xl border border-border bg-card text-card-foreground shadow-md overflow-hidden min-h-[550px] flex flex-col justify-between transition-colors duration-200">
        {loadingPages ? (
          <div className="flex flex-1 items-center justify-center py-24">
            <LoaderCircle className="h-8 w-8 animate-spin text-teal-700" />
            <span className="ml-3 text-sm font-bold text-foreground">
              Loading textbook pages...
            </span>
          </div>
        ) : !currentPage ? (
          <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
            <Layers className="w-8 h-8 text-muted-foreground mb-2" />
            <h4 className="text-sm font-bold text-foreground">No pages found</h4>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm">
              No matching pages were found for this section. Try switching topic or opening Full Book mode.
            </p>
          </div>
        ) : (
          <div className="flex-1 p-5 sm:p-8 space-y-6 max-w-4xl mx-auto w-full">
            {/* Sheet Header Banner - SOLID VIBRANT COLOR, NO TRANSPARENCY */}
            <div
              className="p-4 sm:p-5 rounded-2xl shadow-sm text-white transition-colors duration-200"
              style={{ backgroundColor: colours.chip }}
            >
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-white text-slate-900 shadow-xs">
                  Topic {currentPage.topic_code || selectedTopicCode || "-"}
                </span>
                <span className="text-[11px] font-black px-2.5 py-0.5 rounded-md bg-white text-slate-900 shadow-xs">
                  Page {currentPage.page_number}
                </span>
              </div>
              <h2 className="text-lg sm:text-2xl font-black tracking-tight text-white mt-1">
                {currentPage.topic_title || activeBook?.title || "Cambridge IT"}
              </h2>
            </div>

            {/* Extracted Diagram Images / Figures Section - BORDERLESS, CLEAN PLACEMENT */}
            {currentPage.images && currentPage.images.length > 0 && (
              <div className="space-y-5 text-center my-6 w-full flex flex-col items-center justify-center">
                <div className="flex items-center justify-center">
                  <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-muted border border-border text-foreground text-xs font-bold uppercase tracking-wider shadow-xs">
                    <Layers className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                    <span>Diagrams &amp; Figures on this page ({currentPage.images.length})</span>
                  </span>
                </div>
                <div className="flex flex-col items-center justify-center gap-6 max-w-2xl mx-auto w-full">
                  {currentPage.images.map((img, i) => (
                    <div
                      key={img.id || i}
                      className="group relative flex flex-col items-center justify-center text-center w-full max-w-xl mx-auto my-2"
                    >
                      {/* Borderless clean image placement - NO BORDERS */}
                      <div
                        className="relative flex items-center justify-center w-full min-h-[220px] max-h-[520px] cursor-pointer overflow-hidden p-0 mx-auto"
                        onClick={() => {
                          setLightboxImage(img);
                          setZoomLevel(1);
                        }}
                        title="Click to view full image in large lightbox"
                      >
                        <img
                          src={img.url}
                          alt={img.caption || `Diagram p.${currentPage.page_number}`}
                          className="max-h-[480px] max-w-full object-contain mx-auto block transition-transform group-hover:scale-[1.02]"
                          loading="lazy"
                        />
                        <div className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                          <ZoomIn className="w-4 h-4" />
                        </div>
                      </div>

                      <div className="mt-3 flex flex-col items-center justify-center text-center space-y-1.5 w-full">
                        <div className="flex items-center justify-center gap-2 flex-wrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-muted text-muted-foreground text-[11px] font-bold uppercase tracking-wider">
                            Figure {i + 1} (Page {currentPage.page_number})
                          </span>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-teal-800 text-white text-[11px] font-bold">
                            Diagram p.{currentPage.page_number}
                          </span>
                          {isSuperuser && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteImage(img);
                              }}
                              disabled={deletingImageId === img.id}
                              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-red-700 hover:bg-red-800 text-white text-[11px] font-bold shadow-sm transition-colors"
                              title="Delete this diagram image from textbook"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>{deletingImageId === img.id ? "Deleting..." : "Delete"}</span>
                            </button>
                          )}
                        </div>
                        {img.caption ? (
                          <p className="mt-1.5 text-xs text-muted-foreground italic text-center font-medium max-w-lg mx-auto">
                            {img.caption}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Spaced Text Paragraphs - JUSTIFIED CONTENT & PARAGRAPHS */}
            <div className="space-y-4 leading-relaxed w-full">
              {blocks.map((block, idx) => {
                if (block.type === "empty") {
                  return (
                    <div key={idx} className="flex flex-col items-center justify-center text-center py-6 my-4 w-full">
                      <div className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-muted border border-border text-muted-foreground text-xs sm:text-sm font-bold text-center max-w-xl mx-auto shadow-xs">
                        <Layers className="w-4 h-4 text-muted-foreground shrink-0" />
                        <span>{block.text}</span>
                      </div>
                    </div>
                  );
                }

                if (block.type === "heading") {
                  return (
                    <h3
                      key={idx}
                      className="text-base sm:text-lg font-black text-foreground mt-6 pt-2 border-b border-border pb-1 text-left"
                    >
                      {block.text}
                    </h3>
                  );
                }

                if (block.type === "quote") {
                  return (
                    <blockquote
                      key={idx}
                      className="border-l-4 border-teal-600 bg-muted/40 p-3 rounded-r-xl italic text-xs sm:text-sm text-foreground my-2"
                    >
                      {block.text}
                    </blockquote>
                  );
                }

                if (block.type === "list") {
                  return (
                    <div
                      key={idx}
                      className="flex items-start gap-2.5 p-3 rounded-xl bg-muted/60 text-xs sm:text-sm text-foreground my-2 text-justify"
                    >
                      <span className="text-teal-700 dark:text-teal-400 font-bold shrink-0 mt-0.5">•</span>
                      <span>{block.text}</span>
                    </div>
                  );
                }

                return (
                  <p
                    key={idx}
                    className="text-justify leading-relaxed sm:leading-8 text-[15px] sm:text-[16px] text-foreground my-4 font-normal tracking-normal"
                  >
                    {block.text}
                  </p>
                );
              })}
            </div>
          </div>
        )}

        {/* Footer Navigation - Theme Matching bg-card */}
        <div className="shrink-0 p-3 sm:p-4 border-t border-border bg-card flex items-center justify-between gap-3 transition-colors duration-200">
          <button
            type="button"
            onClick={handlePrev}
            disabled={pageIndex === 0 && (!pages.length || pages[0]?.page_number <= 1)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-muted hover:bg-muted/80 text-foreground border border-border text-xs font-black disabled:opacity-40 transition-colors shadow-xs"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar px-2 max-w-sm sm:max-w-md">
            {pages.map((p, idx) => {
              const active = idx === pageIndex;
              return (
                <button
                  key={p.page_number}
                  type="button"
                  onClick={() => setPageIndex(idx)}
                  className={`w-7 h-7 shrink-0 rounded-lg text-xs font-black transition-all ${
                    active
                      ? "bg-teal-700 text-white shadow-sm"
                      : "bg-muted text-muted-foreground hover:text-foreground border border-border/60"
                  }`}
                  title={`Page ${p.page_number}`}
                >
                  {p.page_number}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={handleNext}
            disabled={
              pageIndex >= pages.length - 1 &&
              (!activeBook?.page_count ||
                (pages.length && pages[pages.length - 1]?.page_number >= activeBook.page_count))
            }
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-black disabled:opacity-40 transition-colors shadow-sm"
          >
            <span>Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Large Lightbox Modal with Zoom Controls & Delete */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-[200] flex flex-col justify-between bg-black/95 text-white select-none animate-in fade-in duration-150"
          onClick={() => {
            setLightboxImage(null);
            setZoomLevel(1);
          }}
        >
          {/* Top Lightbox Toolbar */}
          <div
            className="flex items-center justify-between p-3 sm:p-4 bg-black/80 border-b border-zinc-800 shrink-0 gap-2"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-teal-700 text-white text-xs font-black shrink-0">
                Page {currentPage?.page_number}
              </span>
              <span className="truncate text-xs text-zinc-300 font-bold max-w-xs sm:max-w-md">
                {lightboxImage.caption || `Diagram p.${currentPage?.page_number}`}
              </span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {/* Zoom Controls */}
              <div className="inline-flex items-center rounded-lg bg-zinc-800 p-0.5 text-xs gap-1">
                <button
                  type="button"
                  onClick={() => setZoomLevel((z) => Math.max(0.75, z - 0.25))}
                  className="p-1.5 hover:bg-zinc-700 rounded text-zinc-300 hover:text-white"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setZoomLevel(1)}
                  className="px-2 py-1 hover:bg-zinc-700 rounded text-xs font-bold text-zinc-200"
                  title="Reset Zoom"
                >
                  {Math.round(zoomLevel * 100)}%
                </button>
                <button
                  type="button"
                  onClick={() => setZoomLevel((z) => Math.min(3, z + 0.25))}
                  className="p-1.5 hover:bg-zinc-700 rounded text-zinc-300 hover:text-white"
                  title="Zoom In"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setZoomLevel((z) => (z === 1 ? 1.75 : 1))}
                  className="p-1.5 hover:bg-zinc-700 rounded text-zinc-300 hover:text-white"
                  title={zoomLevel === 1 ? "Enlarge" : "Fit"}
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
              </div>

              {/* Super Admin Delete Button */}
              {isSuperuser && (
                <button
                  type="button"
                  onClick={() => handleDeleteImage(lightboxImage)}
                  disabled={deletingImageId === lightboxImage.id}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-700 hover:bg-red-800 text-white text-xs font-black shadow-sm transition-colors"
                  title="Delete this diagram from textbook"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">
                    {deletingImageId === lightboxImage.id ? "Deleting..." : "Delete"}
                  </span>
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  setLightboxImage(null);
                  setZoomLevel(1);
                }}
                className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white"
                title="Close Lightbox"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Large Image Canvas */}
          <div
            className="flex-1 w-full h-full flex items-center justify-center overflow-auto p-4 custom-scrollbar"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setLightboxImage(null);
                setZoomLevel(1);
              }
            }}
          >
            <img
              src={lightboxImage.url}
              alt={lightboxImage.caption || "Textbook diagram"}
              style={{
                transform: `scale(${zoomLevel})`,
                transition: "transform 0.18s ease-out",
              }}
              className="max-h-[85vh] max-w-[94vw] w-auto h-auto object-contain rounded-none shadow-2xl cursor-zoom-in"
              onClick={(e) => {
                e.stopPropagation();
                setZoomLevel((z) => (z >= 2.25 ? 1 : z + 0.5));
              }}
              title="Click diagram to zoom in"
            />
          </div>

          {/* Bottom Caption Bar */}
          {lightboxImage.caption && (
            <div
              className="p-3 bg-black/80 border-t border-zinc-800 text-center text-xs font-medium text-zinc-300 shrink-0"
              onClick={(e) => e.stopPropagation()}
            >
              {lightboxImage.caption}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
