import { useEffect, useMemo, useState } from "react";
import {
  BookMarked,
  ChevronLeft,
  ChevronRight,
  Edit3,
  Layers,
  LoaderCircle,
  Maximize2,
  Save,
  Trash2,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { apiFetch } from "@/api/client/apiClient";
import { toast } from "sonner";

const TOPIC_PALETTE = [
  { bg: "#ecfeff", border: "#22d3ee", accent: "#0f766e", chip: "#0d9488", mark: "#ccfbf1" },
  { bg: "#f0fdf4", border: "#4ade80", accent: "#15803d", chip: "#16a34a", mark: "#dcfce7" },
  { bg: "#fff7ed", border: "#fb923c", accent: "#c2410c", chip: "#ea580c", mark: "#ffedd5" },
  { bg: "#faf5ff", border: "#c084fc", accent: "#7e22ce", chip: "#9333ea", mark: "#f3e8ff" },
  { bg: "#eff6ff", border: "#60a5fa", accent: "#1d4ed8", chip: "#2563eb", mark: "#dbeafe" },
  { bg: "#fdf2f8", border: "#f472b6", accent: "#be185d", chip: "#db2777", mark: "#fce7f3" },
];

function topicStyle(topicCode = "") {
  const digits = String(topicCode).replace(/\D/g, "");
  const index = digits ? Number(digits) % TOPIC_PALETTE.length : 0;
  return TOPIC_PALETTE[index];
}

function highlightInline(text, markColor) {
  const source = String(text || "")
    .replace(/\u2014/g, "-")
    .replace(/\u2013/g, "-")
    .replace(/\u2018|\u2019/g, "'")
    .replace(/\u201c|\u201d/g, '"');

  const parts = [];
  const pattern =
    /("([^"]{2,80})")|('([^']{2,60})')|(\b(data|information|encryption|validation|verification|bandwidth|protocol|malware|firewall|database|algorithm|hardware|software|network|microprocessor|sensor|actuator|quality|batch|online|real-time)\b)/gi;
  let last = 0;
  let match;
  let key = 0;
  while ((match = pattern.exec(source)) !== null) {
    if (match.index > last) {
      parts.push(<span key={`t-${key++}`}>{source.slice(last, match.index)}</span>);
    }
    const term = match[2] || match[4] || match[5] || match[0];
    parts.push(
      <mark
        key={`m-${key++}`}
        className="past-paper-textbook-mark"
        style={{ backgroundColor: markColor }}
      >
        {term}
      </mark>
    );
    last = match.index + match[0].length;
  }
  if (last < source.length) {
    parts.push(<span key={`t-${key++}`}>{source.slice(last)}</span>);
  }
  return parts.length ? parts : source;
}

function splitSentences(text) {
  const source = String(text || "").replace(/\s+/g, " ").trim();
  if (!source) return [];
  const parts = source.match(/[^.!?★]+[.!?]+(?:\s+|$)|[^.!?★]+$/g) || [source];
  return parts.map((part) => part.trim()).filter(Boolean);
}

function formatPageText(text, topicCode = "", topicTitle = "") {
  const raw = String(text || "")
    .replace(/\u0000/g, "")
    .replace(/\r\n/g, "\n")
    .replace(/\u00a0/g, " ")
    .replace(/[ \t]+\n/g, "\n")
    .trim();

  if (!raw) {
    return [
      {
        type: "empty",
        text: "This page is predominantly diagrams, figures, or a chapter cover.",
      },
    ];
  }

  const topicKey = `${topicCode} ${topicTitle}`.replace(/\s+/g, " ").trim().toLowerCase();
  const topicCodeKey = String(topicCode || "").trim().toLowerCase();
  const topicTitleKey = String(topicTitle || "").trim().toLowerCase();

  const isCurrentTopicHeading = (value) => {
    const cleaned = String(value || "").replace(/\s+/g, " ").trim().toLowerCase();
    if (!cleaned) return false;
    if (topicKey && (cleaned === topicKey || cleaned === `${topicCodeKey} ${topicTitleKey}`)) {
      return true;
    }
    if (topicCodeKey && cleaned === topicCodeKey) return true;
    if (topicTitleKey && cleaned === topicTitleKey) return true;
    if (topicCodeKey && cleaned.startsWith(`${topicCodeKey} `) && cleaned.includes(topicTitleKey)) {
      return true;
    }
    return false;
  };

  // Keep PDF soft-wraps joined, but preserve blank lines as hard breaks.
  const softJoined = raw
    .split(/\n{2,}/)
    .map((chunk) =>
      chunk
        .split("\n")
        .map((line) => line.replace(/\s+/g, " ").trim())
        .filter((line) => line && !/^\d{1,3}$/.test(line))
        .join(" ")
        .replace(/\s+/g, " ")
        .trim()
    )
    .filter(Boolean)
    .join("\n\n");

  const blocks = [];
  const seenHeadings = new Set();

  const pushHeading = (heading) => {
    const cleaned = heading.replace(/\s+/g, " ").trim();
    if (!cleaned || isCurrentTopicHeading(cleaned)) return;
    const key = cleaned.toLowerCase();
    if (seenHeadings.has(key)) return;
    seenHeadings.add(key);
    blocks.push({ type: "heading", text: cleaned });
  };

  const pushParagraphs = (chunk) => {
    let body = chunk.replace(/\s+/g, " ").trim();
    if (!body) return;

    // Pull leading numbered topic/chapter titles out as headings.
    const headingMatch = body.match(
      /^((?:\d+(?:\.\d+){0,3}|Chapter\s+\d+|Unit\s+\d+|Section\s+\d+)[^\n.!?]{0,90}?)(?=\s+[A-Z“"]|\s*$)/i
    );
    if (headingMatch && headingMatch[1].length < 100) {
      pushHeading(headingMatch[1]);
      body = body.slice(headingMatch[0].length).trim();
    }

    // Split star/bullet learning objectives into list rows.
    if (/[★•]/.test(body)) {
      const pieces = body.split(/(?=[★•])/).map((part) => part.trim()).filter(Boolean);
      for (const piece of pieces) {
        if (/^[★•]/.test(piece) || /^(what is meant|how to|about the|be familiar)\b/i.test(piece)) {
          blocks.push({
            type: "list",
            text: piece.replace(/^[★•]\s*/, "★ "),
          });
        } else {
          for (const sentence of splitSentences(piece)) {
            if (isCurrentTopicHeading(sentence)) continue;
            if (sentence.length < 90 && /^\d+(\.\d+){0,3}\s+\S/.test(sentence)) {
              pushHeading(sentence);
            } else {
              blocks.push({ type: "para", text: sentence });
            }
          }
        }
      }
      return;
    }

    for (const sentence of splitSentences(body)) {
      if (isCurrentTopicHeading(sentence)) continue;
      if (
        sentence.length < 100 &&
        (/^\d+(\.\d+){0,3}\s+\S/.test(sentence) ||
          /^(In this chapter you will learn|Before starting this chapter|Key terms|Learning objectives|Activity|Tip|Summary)\b/i.test(
            sentence
          ))
      ) {
        pushHeading(sentence.replace(/[.!?]+$/, ""));
        continue;
      }
      blocks.push({ type: "para", text: sentence });
    }
  };

  for (const chunk of softJoined.split(/\n{2,}/)) {
    const trimmed = chunk.trim();
    if (!trimmed) continue;
    if (isCurrentTopicHeading(trimmed)) continue;
    if (
      trimmed.length < 110 &&
      (/^\d+(\.\d+){0,3}\s+\S/.test(trimmed) ||
        /^(chapter|unit|section|topic|learning|key terms|activity|tip|summary|in this chapter|before starting)\b/i.test(
          trimmed
        ))
    ) {
      pushHeading(trimmed);
      continue;
    }
    pushParagraphs(trimmed);
  }

  return blocks.length
    ? blocks
    : [{ type: "para", text: softJoined.replace(/\n+/g, " ") }];
}

export default function TextbookPager({
  courseSlug,
  open,
  onClose,
  target,
  isSuperuser = false,
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [payload, setPayload] = useState(null);
  const [pageIndex, setPageIndex] = useState(0);
  const [lightboxImage, setLightboxImage] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);

  // Super Admin Edit
  const [editingPage, setEditingPage] = useState(null);
  const [editText, setEditText] = useState("");
  const [editTopicCode, setEditTopicCode] = useState("");
  const [editTopicTitle, setEditTopicTitle] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);
  const [deletingImageId, setDeletingImageId] = useState(null);

  useEffect(() => {
    if (!open || !target?.textbook_key || !courseSlug) return undefined;
    let cancelled = false;
    const params = new URLSearchParams();
    if (target.topic_code) params.set("topic", target.topic_code);
    if (target.page_start) params.set("from", String(target.page_start));
    if (target.page_end) params.set("to", String(target.page_end));
    setLoading(true);
    setError("");
    setPayload(null);
    setPageIndex(0);
    apiFetch(
      `/api/courses/${courseSlug}/past-paper/textbooks/${target.textbook_key}/pages/?${params.toString()}`
    )
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.detail || "Unable to open textbook pages.");
        }
        if (!cancelled) setPayload(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || "Unable to open textbook pages.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open, courseSlug, target]);

  useEffect(() => {
    if (!open) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event) => {
      if (event.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  const pages = payload?.pages || [];
  const page = pages[Math.min(pageIndex, Math.max(pages.length - 1, 0))];
  const activeTopicCode = page?.topic_code || target?.topic_code || "";
  const activeTopicTitle = page?.topic_title || target?.topic_title || "";
  const blocks = useMemo(
    () => formatPageText(page?.text, activeTopicCode, activeTopicTitle),
    [page?.text, activeTopicCode, activeTopicTitle]
  );
  const colours = topicStyle(activeTopicCode);

  const handleSavePageEdit = async (e) => {
    e.preventDefault();
    if (!editingPage || !target?.textbook_key) return;
    setSavingEdit(true);
    try {
      const res = await apiFetch(
        `/api/courses/textbooks/${target.textbook_key}/pages/${editingPage.page_number}/`,
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
        toast.success(`Page ${editingPage.page_number} updated!`);
        setPayload((prev) => ({
          ...prev,
          pages: (prev?.pages || []).map((p) =>
            p.page_number === editingPage.page_number
              ? {
                  ...p,
                  text: updated.text,
                  topic_code: updated.topic_code,
                  topic_title: updated.topic_title,
                }
              : p
          ),
        }));
        setEditingPage(null);
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.detail || "Failed to save edit.");
      }
    } catch {
      toast.error("Network error while saving edit.");
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDeleteImage = async (img) => {
    if (!img?.id) return;
    if (!window.confirm(`Delete Diagram Figure from page ${page?.page_number || ""}? This cannot be undone.`)) return;
    setDeletingImageId(img.id);
    try {
      const res = await apiFetch(`/api/courses/textbooks/images/${img.id}/delete/`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed to delete image.");
      toast.success("Diagram image deleted.");
      setPayload((prev) => {
        if (!prev?.pages) return prev;
        return {
          ...prev,
          pages: prev.pages.map((p) => {
            if (p.page_number === page?.page_number) {
              return {
                ...p,
                images: (p.images || []).filter((item) => item.id !== img.id),
              };
            }
            return p;
          }),
        };
      });
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

  const go = (next) => {
    if (next < 0 || next >= pages.length || next === pageIndex) return;
    setFlipClass(next > pageIndex ? "is-flip-next" : "is-flip-prev");
    window.setTimeout(() => {
      setPageIndex(next);
      setFlipClass("");
    }, 160);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[140] flex items-stretch justify-center bg-slate-950/45 p-0 sm:p-4">
      <section className="past-paper-textbook-reader flex h-full w-full max-w-6xl flex-col overflow-hidden border border-border bg-white text-slate-900 shadow-2xl dark:bg-background dark:text-foreground sm:rounded-xl">
        <header className="flex shrink-0 items-start justify-between gap-3 border-b border-slate-200 bg-white px-3 py-2.5 dark:border-border dark:bg-background sm:px-5">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-teal-700">
              Cambridge textbook
            </p>
            <h2 className="truncate text-sm font-bold text-slate-900 dark:text-foreground sm:text-lg">
              {payload?.textbook?.title || target?.textbook || "Textbook"}
            </h2>
            <p className="truncate text-[11px] text-slate-600 dark:text-muted-foreground sm:text-xs">
              {[payload?.textbook?.edition, payload?.textbook?.authors]
                .filter(Boolean)
                .join(" · ")}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {page ? (
              <span className="rounded-md bg-teal-700 px-2.5 py-1 text-[11px] font-bold text-white">
                p.{page.page_number}
                {pages.length > 1 ? ` · ${pageIndex + 1}/${pages.length}` : ""}
              </span>
            ) : null}
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-800 dark:border-border dark:bg-background dark:text-foreground"
              title="Close textbook"
            >
              <X size={16} />
            </button>
          </div>
        </header>

        <div className="relative min-h-0 flex-1 overflow-hidden bg-slate-50 dark:bg-muted/20">
          {loading ? (
            <div className="flex h-full items-center justify-center">
              <LoaderCircle className="h-8 w-8 animate-spin text-teal-700" />
            </div>
          ) : error ? (
            <div className="flex h-full flex-col items-center justify-center gap-2 px-6 text-center">
              <BookMarked className="h-8 w-8 text-slate-500" />
              <p className="text-sm text-slate-600">{error}</p>
            </div>
          ) : !page ? (
            <div className="flex h-full items-center justify-center px-6 text-center text-sm text-slate-600">
              No textbook pages were found for this reference.
            </div>
          ) : (
            <article
              key={page.page_number}
              className={`past-paper-flip-page absolute inset-0 overflow-y-auto overscroll-contain hide-scrollbar px-3 py-3 sm:px-6 sm:py-5 ${flipClass}`}
            >
              <div className="past-paper-textbook-sheet mx-auto w-full max-w-5xl overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-border dark:bg-background">
                <div
                  className="border-b px-4 py-3 sm:px-6 sm:py-4 flex items-center justify-between gap-2"
                  style={{
                    backgroundColor: colours.chip,
                    borderColor: colours.accent,
                  }}
                >
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/90">
                      Topic {activeTopicCode || "-"}
                    </p>
                    <h3 className="mt-1 text-base font-bold text-white sm:text-xl">
                      {activeTopicTitle || "Textbook page"}
                    </h3>
                  </div>
                  {isSuperuser && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingPage(page);
                        setEditText(page.text || "");
                        setEditTopicCode(page.topic_code || "");
                        setEditTopicTitle(page.topic_title || "");
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white text-xs font-bold transition-colors"
                      title="Super Admin: Edit page content"
                    >
                      <Edit3 size={14} />
                      <span>Edit Page</span>
                    </button>
                  )}
                </div>

                <div className="past-paper-textbook-page space-y-5 px-4 py-4 sm:px-6 sm:py-6">
                  {/* Extracted Diagram Images - CENTERED */}
                  {page.images && page.images.length > 0 && (
                    <div className="space-y-4 text-center my-6 w-full flex flex-col items-center justify-center">
                      <div className="flex items-center justify-center">
                        <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 border border-slate-300 text-slate-800 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100 text-xs font-black uppercase tracking-wider shadow-sm">
                          <Layers size={14} className="text-teal-600 dark:text-teal-400" />
                          <span>Diagrams &amp; Figures on this page ({page.images.length})</span>
                        </span>
                      </div>
                      <div className="flex flex-col items-center justify-center gap-5 max-w-2xl mx-auto w-full">
                        {page.images.map((img, i) => (
                          <div
                            key={img.id || i}
                            className="group relative flex flex-col items-center justify-center text-center w-full max-w-xl mx-auto my-2"
                          >
                            <div
                              className="relative flex items-center justify-center w-full min-h-[200px] max-h-[500px] overflow-hidden p-0 mx-auto cursor-pointer"
                              onClick={() => {
                                setLightboxImage(img);
                                setZoomLevel(1);
                              }}
                              title="Click to view full image in large lightbox"
                            >
                              <img
                                src={img.url}
                                alt={img.caption || `Diagram p.${page.page_number}`}
                                className="max-h-[460px] max-w-full object-contain mx-auto block transition-transform group-hover:scale-[1.02]"
                                loading="lazy"
                              />
                              <div className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                <ZoomIn className="w-4 h-4" />
                              </div>
                            </div>
                            <div className="mt-2.5 flex flex-col items-center justify-center text-center space-y-1 w-full">
                              <div className="flex items-center justify-center gap-2 flex-wrap">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-muted text-muted-foreground text-[11px] font-bold uppercase tracking-wider">
                                  Figure {i + 1} (Page {page.page_number})
                                </span>
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-teal-800 text-white text-[11px] font-bold">
                                  Diagram p.{page.page_number}
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
                              {img.caption && (
                                <p className="mt-1 text-xs text-muted-foreground italic text-center font-medium max-w-md mx-auto">
                                  {img.caption}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {blocks.map((block, index) => {
                    if (block.type === "empty") {
                      return (
                        <div key={`${page.page_number}-e-${index}`} className="flex flex-col items-center justify-center text-center py-6 my-3 w-full">
                          <div className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 text-slate-700 dark:text-slate-300 text-xs sm:text-sm font-bold text-center max-w-xl mx-auto shadow-sm">
                            <Layers className="w-4 h-4 text-slate-600 dark:text-slate-400 shrink-0" />
                            <span>{block.text}</span>
                          </div>
                        </div>
                      );
                    }
                    if (block.type === "heading") {
                      return (
                        <h4
                          key={`${page.page_number}-h-${index}`}
                          className="rounded-lg px-3 py-2.5 text-sm font-bold sm:text-base"
                          style={{
                            backgroundColor: colours.bg,
                            color: colours.accent,
                            borderLeft: `4px solid ${colours.chip}`,
                          }}
                        >
                          {block.text}
                        </h4>
                      );
                    }
                    if (block.type === "list") {
                      return (
                        <div
                          key={`${page.page_number}-l-${index}`}
                          className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm leading-relaxed text-slate-900 dark:border-border dark:bg-muted/40 dark:text-foreground sm:text-[1.05rem] sm:leading-7"
                        >
                          {highlightInline(block.text, colours.mark)}
                        </div>
                      );
                    }
                    return (
                      <p
                        key={`${page.page_number}-p-${index}`}
                        className="text-[0.98rem] leading-7 text-slate-900 dark:text-slate-100 sm:text-[1.08rem] sm:leading-8"
                      >
                        {highlightInline(block.text, colours.mark)}
                      </p>
                    );
                  })}
                </div>
              </div>
            </article>
          )}
        </div>

        <footer className="flex shrink-0 items-center justify-between gap-2 border-t border-slate-200 bg-white px-3 py-2.5 dark:border-border dark:bg-background sm:px-5">
          <button
            type="button"
            onClick={() => go(pageIndex - 1)}
            disabled={pageIndex === 0 || !pages.length}
            className="inline-flex h-10 shrink-0 items-center gap-1 rounded-full bg-slate-900 px-4 text-xs font-bold text-white disabled:opacity-35 sm:text-sm"
          >
            <ChevronLeft size={16} />
            Prev
          </button>
          <div className="past-paper-page-chips hide-scrollbar flex min-w-0 flex-1 items-center justify-start gap-1.5 overflow-x-auto sm:justify-center">
            {pages.map((item, index) => {
              const style = topicStyle(item.topic_code);
              const active = index === pageIndex;
              return (
                <button
                  key={item.page_number}
                  type="button"
                  title={`Page ${item.page_number}${item.topic_code ? ` · ${item.topic_code}` : ""}`}
                  onClick={() => go(index)}
                  className="inline-flex h-8 min-w-8 shrink-0 items-center justify-center rounded-full px-2.5 text-[11px] font-bold"
                  style={
                    active
                      ? { backgroundColor: style.chip, color: "#fff" }
                      : {
                          backgroundColor: "#fff",
                          color: style.accent,
                          border: `1px solid ${style.border}`,
                        }
                  }
                >
                  {item.page_number}
                </button>
              );
            })}
          </div>
          <button
            type="button"
            onClick={() => go(pageIndex + 1)}
            disabled={pageIndex >= pages.length - 1 || !pages.length}
            className="inline-flex h-10 shrink-0 items-center gap-1 rounded-full bg-slate-900 px-4 text-xs font-bold text-white disabled:opacity-35 sm:text-sm"
          >
            Next
            <ChevronRight size={16} />
          </button>
        </footer>

        {/* Super Admin Inline Edit Modal */}
        {editingPage && (
          <div className="fixed inset-0 z-[160] flex items-center justify-center bg-black/60 p-4">
            <form
              onSubmit={handleSavePageEdit}
              className="w-full max-w-2xl bg-white dark:bg-card border border-border rounded-2xl p-5 shadow-2xl space-y-4 text-left animate-in fade-in zoom-in-95"
            >
              <div className="flex items-center justify-between pb-2 border-b border-border">
                <div className="flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-teal-600" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-foreground">
                    Super Admin: Edit Page {editingPage.page_number}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingPage(null)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-foreground mb-1">Topic Code</label>
                  <input
                    type="text"
                    value={editTopicCode}
                    onChange={(e) => setEditTopicCode(e.target.value)}
                    placeholder="e.g. 1.1"
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-300 dark:border-border bg-white dark:bg-background text-xs focus:outline-none focus:ring-1 focus:ring-teal-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-foreground mb-1">Topic Title</label>
                  <input
                    type="text"
                    value={editTopicTitle}
                    onChange={(e) => setEditTopicTitle(e.target.value)}
                    placeholder="e.g. Differences Between Data and Information"
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-300 dark:border-border bg-white dark:bg-background text-xs focus:outline-none focus:ring-1 focus:ring-teal-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-foreground mb-1">
                  Page Content
                </label>
                <textarea
                  rows={10}
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  placeholder="Textbook page text..."
                  className="w-full p-3 rounded-xl border border-slate-300 dark:border-border bg-white dark:bg-background text-xs font-sans leading-relaxed focus:outline-none focus:ring-1 focus:ring-teal-600 custom-scrollbar"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setEditingPage(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold shadow-md disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{savingEdit ? "Saving..." : "Save Changes"}</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Large Lightbox Modal with Zoom Controls */}
        {lightboxImage && (
          <div
            className="fixed inset-0 z-[200] flex flex-col justify-between bg-black/95 text-white select-none animate-in fade-in duration-150"
            onClick={() => {
              setLightboxImage(null);
              setZoomLevel(1);
            }}
          >
            {/* Top Toolbar */}
            <div
              className="flex items-center justify-between p-3 sm:p-4 bg-black/80 border-b border-zinc-800 shrink-0 gap-2"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-teal-700 text-white text-xs font-black shrink-0">
                  Page {page.page_number}
                </span>
                <span className="truncate text-xs text-zinc-300 font-bold max-w-xs sm:max-w-md">
                  {lightboxImage.caption || `Diagram p.${page.page_number}`}
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
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

            {/* Large Canvas */}
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
      </section>
    </div>
  );
}
