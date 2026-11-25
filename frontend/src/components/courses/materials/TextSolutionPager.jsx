import { useEffect, useMemo, useState } from "react";
import {
  BookMarked,
  BookOpenText,
  ChevronLeft,
  ChevronRight,
  LoaderCircle,
  Maximize2,
  Minimize2,
  X,
} from "lucide-react";
import DOMPurify from "dompurify";
import { marked } from "marked";
import { apiFetch } from "@/api/client/apiClient";
import TextbookPager from "@/components/courses/materials/TextbookPager";

function sanitizeMarkdown(markdown) {
  const normalized = String(markdown || "")
    .replace(/\u2014/g, "-")
    .replace(/\u2013/g, "-");
  return DOMPurify.sanitize(marked.parse(normalized));
}

function compactQuestionMarkdown(markdown) {
  const text = String(markdown || "");
  const cutMarkers = [
    "\n### From your licensed Cambridge textbooks",
    "\n### Timing guide for video rehearsal",
  ];
  let clipped = text;
  for (const marker of cutMarkers) {
    const index = clipped.indexOf(marker);
    if (index !== -1) clipped = clipped.slice(0, index).trimEnd();
  }
  return clipped;
}

function parseSolutionPage(markdown, fallbackTitle) {
  const raw = compactQuestionMarkdown(markdown);
  const titleMatch = raw.match(/^##\s+(.+)$/m);
  const title = (titleMatch?.[1] || fallbackTitle || "Text solution").trim();

  let rest = raw.replace(/^##\s+.+$/m, "").trim();
  let questionText = "";
  const askingMatch = rest.match(
    /###\s*What the question is asking\s*\n+([\s\S]*?)(?=\n###\s|\n##\s|$)/i
  );
  if (askingMatch) {
    questionText = askingMatch[1]
      .replace(/\n*The command word is[\s\S]*$/i, "")
      .trim();
    rest = rest.replace(askingMatch[0], "").trim();
  }

  const commandMatch = raw.match(/The command word is\s+\*\*(.+?)\*\*/i);
  const commandLine = commandMatch
    ? `The command word is **${commandMatch[1]}**.`
    : "";

  return {
    title,
    questionHtml: questionText ? sanitizeMarkdown(questionText) : "",
    bodyHtml: sanitizeMarkdown(
      [commandLine, rest].filter(Boolean).join("\n\n")
    ),
  };
}

function parseOverviewPage(markdown) {
  const text = String(markdown || "")
    .replace(/\u2014/g, "-")
    .replace(/\u2013/g, "-")
    .trim();
  const lines = text.split(/\r?\n/).map((line) => line.trimEnd());
  const title =
    (lines.find((line) => line.startsWith("#")) || "## Cambridge text solutions")
      .replace(/^#+\s*/, "")
      .trim() || "Cambridge text solutions";
  const body = lines
    .filter((line) => line && !line.startsWith("#"))
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
  return {
    title,
    questionHtml: "",
    bodyHtml: sanitizeMarkdown(
      body ||
        "Each question combines the official mark scheme with Cambridge AS & A Level IT (9626) syllabus and coursebook explanations."
    ),
  };
}

export default function TextSolutionPager({
  solution,
  textbooks = [],
  courseSlug,
}) {
  const pages = useMemo(() => {
    if (!solution) return [];
    const items = [];
    if (solution.overview) {
      items.push({
        key: "overview",
        label: "O",
        textbookRefs: [],
        ...parseOverviewPage(solution.overview),
      });
    }
    (solution.sections || []).forEach((section) => {
      items.push({
        key: section.question_path,
        label: section.question_path,
        textbookRefs: section.textbook_refs || [],
        ...parseSolutionPage(
          section.worked_solution,
          `Question ${section.question_path}`
        ),
      });
    });
    return items;
  }, [solution]);

  const [pageIndex, setPageIndex] = useState(0);
  const [flipClass, setFlipClass] = useState("");
  const [fullscreen, setFullscreen] = useState(false);
  const [booksOpen, setBooksOpen] = useState(false);
  const [activeBook, setActiveBook] = useState(null);
  const [expandedBookKey, setExpandedBookKey] = useState("");
  const [library, setLibrary] = useState(textbooks || []);
  const [libraryLoading, setLibraryLoading] = useState(false);
  const [topicsByKey, setTopicsByKey] = useState({});
  const [topicsLoadingKey, setTopicsLoadingKey] = useState("");

  useEffect(() => {
    setLibrary(textbooks || []);
  }, [textbooks]);

  useEffect(() => {
    setPageIndex(0);
  }, [solution]);

  useEffect(() => {
    if (!booksOpen || !courseSlug) return undefined;
    if (library.length) return undefined;
    let cancelled = false;
    setLibraryLoading(true);
    apiFetch(`/api/courses/${courseSlug}/past-paper/textbooks/`)
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.detail || "Unable to load textbooks.");
        }
        if (!cancelled) setLibrary(data.textbooks || []);
      })
      .catch(() => {
        if (!cancelled) setLibrary([]);
      })
      .finally(() => {
        if (!cancelled) setLibraryLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [booksOpen, courseSlug, library.length]);

  useEffect(() => {
    if (!fullscreen) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event) => {
      if (event.key === "Escape") setFullscreen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [fullscreen]);

  if (!pages.length) {
    return (
      <section className="past-paper-text-solution flex h-full min-h-0 flex-col items-center justify-center rounded-xl border border-border bg-background p-5 text-center shadow-sm">
        <BookOpenText className="mb-3 h-8 w-8 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          The instructor text solution is still under review.
        </p>
      </section>
    );
  }

  const page = pages[Math.min(pageIndex, pages.length - 1)];
  const go = (next) => {
    if (next < 0 || next >= pages.length || next === pageIndex) return;
    setFlipClass(next > pageIndex ? "is-flip-next" : "is-flip-prev");
    window.setTimeout(() => {
      setPageIndex(next);
      setFlipClass("");
    }, 180);
  };

  const openTextbook = (ref) => {
    setActiveBook(ref);
    setBooksOpen(false);
  };

  const toggleBookTopics = async (book) => {
    if (expandedBookKey === book.key) {
      setExpandedBookKey("");
      return;
    }
    setExpandedBookKey(book.key);
    if (topicsByKey[book.key] || (book.topics && book.topics.length)) {
      if (book.topics?.length && !topicsByKey[book.key]) {
        setTopicsByKey((prev) => ({ ...prev, [book.key]: book.topics }));
      }
      return;
    }
    if (!courseSlug) return;
    setTopicsLoadingKey(book.key);
    try {
      const response = await apiFetch(
        `/api/courses/${courseSlug}/past-paper/textbooks/${book.key}/topics/`
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || "Unable to load topics.");
      }
      setTopicsByKey((prev) => ({
        ...prev,
        [book.key]: data.topics || [],
      }));
    } catch {
      setTopicsByKey((prev) => ({ ...prev, [book.key]: [] }));
    } finally {
      setTopicsLoadingKey("");
    }
  };

  return (
    <>
      <section
        className={`past-paper-text-solution relative flex min-h-0 max-h-full flex-col overflow-hidden border border-border bg-background shadow-sm ${
          fullscreen
            ? "fixed inset-y-0 left-1/2 z-[120] h-[100dvh] w-full max-w-6xl -translate-x-1/2 rounded-none border-x"
            : "mx-auto h-full w-full max-w-6xl rounded-xl"
        }`}
      >
        <header className="flex shrink-0 items-center justify-between gap-2 border-b border-border/70 bg-[#0f766e]/[0.08] px-3 py-2.5 sm:px-5">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-teal-700 dark:text-teal-300 sm:text-[11px]">
              Text solution
            </p>
            <h2 className="truncate text-base font-bold text-foreground sm:text-xl">
              {page.title}
            </h2>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={() => setBooksOpen(true)}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-teal-200 bg-teal-50 px-2.5 text-[11px] font-bold text-teal-800 sm:px-3 sm:text-xs"
              title="Open Cambridge textbooks"
            >
              <BookMarked size={14} />
              <span className="hidden sm:inline">Textbooks</span>
            </button>
            <span className="rounded-md bg-teal-700 px-2.5 py-1 text-[11px] font-bold text-white sm:text-sm">
              {pageIndex + 1}/{pages.length}
            </span>
            <button
              type="button"
              onClick={() => setFullscreen((value) => !value)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-background text-foreground"
              title={fullscreen ? "Exit full screen" : "Full screen"}
            >
              {fullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </button>
          </div>
        </header>

        <div className="relative min-h-0 flex-1 overflow-hidden bg-muted/20">
          <article
            key={page.key}
            className={`past-paper-flip-page absolute inset-0 overflow-y-auto overscroll-contain hide-scrollbar px-3 py-3 sm:px-6 sm:py-5 ${flipClass}`}
          >
            <div className="origin-top">
              {page.questionHtml ? (
                <div
                  className="past-paper-question-stem mb-4 rounded-xl border border-teal-300 bg-[#ccfbf1] p-3 text-slate-900 sm:p-4 dark:border-teal-700 dark:bg-teal-950 dark:text-slate-100"
                  dangerouslySetInnerHTML={{ __html: page.questionHtml }}
                />
              ) : null}
              <div
                className={`prose prose-sm max-w-none dark:prose-invert ${
                  page.key === "overview" ? "past-paper-overview-page" : ""
                }`}
                dangerouslySetInnerHTML={{ __html: page.bodyHtml }}
              />
              {page.textbookRefs?.length ? (
                <div className="mt-5 rounded-xl border border-teal-200 bg-teal-50/80 p-3 sm:p-4 dark:border-teal-800 dark:bg-teal-950/30">
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-teal-700 dark:text-teal-300">
                    Textbook references for this question
                  </p>
                  <div className="mt-2 flex flex-col gap-2">
                    {page.textbookRefs.map((ref) => (
                      <button
                        key={`${ref.textbook_key}-${ref.topic_code}-${ref.page_start}`}
                        type="button"
                        onClick={() => openTextbook(ref)}
                        className="flex w-full items-start gap-2 rounded-lg border border-teal-200 bg-white px-3 py-2 text-left hover:border-teal-500 dark:border-teal-800 dark:bg-background"
                      >
                        <BookMarked
                          size={15}
                          className="mt-0.5 shrink-0 text-teal-700"
                        />
                        <span className="min-w-0">
                          <span className="block text-xs font-bold text-foreground sm:text-sm">
                            {ref.textbook}
                          </span>
                          <span className="block text-[11px] text-muted-foreground">
                            Topic {ref.topic_code} {ref.topic_title} · pp.{" "}
                            {ref.page_start}-{ref.page_end}
                          </span>
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </article>
        </div>

        <footer className="past-paper-pager-footer pointer-events-none relative z-20 flex shrink-0 items-center justify-between gap-2 border-t border-border/60 bg-background px-3 py-2.5 sm:gap-3 sm:px-5">
          <button
            type="button"
            onClick={() => go(pageIndex - 1)}
            disabled={pageIndex === 0}
            className="pointer-events-auto inline-flex h-10 shrink-0 items-center gap-1 rounded-full bg-slate-900 px-4 text-xs font-bold text-white shadow-md disabled:opacity-35 sm:h-11 sm:text-sm"
          >
            <ChevronLeft size={16} />
            Prev
          </button>
          <div className="past-paper-page-chips hide-scrollbar pointer-events-auto flex min-w-0 flex-1 items-center justify-start gap-1.5 overflow-x-auto rounded-full bg-slate-900 px-2 py-1.5 shadow-md sm:justify-center sm:px-3">
            {pages.map((item, index) => (
              <button
                key={item.key}
                type="button"
                title={item.label === "O" ? "Overview" : `Question ${item.label}`}
                onClick={() => go(index)}
                className={`past-paper-page-pill inline-flex h-8 min-w-8 shrink-0 items-center justify-center rounded-full px-2.5 text-[11px] font-bold sm:h-9 sm:min-w-9 sm:px-3 sm:text-xs ${
                  index === pageIndex
                    ? "bg-teal-500 text-white"
                    : "bg-white text-slate-900 hover:bg-teal-100"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => go(pageIndex + 1)}
            disabled={pageIndex >= pages.length - 1}
            className="pointer-events-auto inline-flex h-10 shrink-0 items-center gap-1 rounded-full bg-slate-900 px-4 text-xs font-bold text-white shadow-md disabled:opacity-35 sm:h-11 sm:text-sm"
          >
            Next
            <ChevronRight size={16} />
          </button>
        </footer>
      </section>

      {booksOpen ? (
        <div className="fixed inset-0 z-[130] flex justify-end bg-slate-950/40">
          <button
            type="button"
            className="absolute inset-0 cursor-default"
            aria-label="Close textbooks drawer"
            onClick={() => setBooksOpen(false)}
          />
          <aside className="relative z-10 flex h-full w-full max-w-md flex-col border-l border-border bg-background shadow-2xl">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-teal-700">
                  Licensed extracts
                </p>
                <h3 className="text-sm font-bold text-foreground">
                  Cambridge textbooks
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setBooksOpen(false)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border"
              >
                <X size={15} />
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto hide-scrollbar p-3">
              {page.textbookRefs?.length ? (
                <div className="mb-4">
                  <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    For this question
                  </p>
                  <div className="space-y-2">
                    {page.textbookRefs.map((ref) => (
                      <button
                        key={`drawer-${ref.textbook_key}-${ref.topic_code}-${ref.page_start}`}
                        type="button"
                        onClick={() => openTextbook(ref)}
                        className="flex w-full flex-col rounded-lg border border-teal-200 bg-teal-50 px-3 py-2 text-left dark:border-teal-800 dark:bg-teal-950/40"
                      >
                        <span className="text-xs font-bold text-foreground">
                          Topic {ref.topic_code} · {ref.topic_title}
                        </span>
                        <span className="text-[11px] text-muted-foreground">
                          {ref.textbook} · pp. {ref.page_start}-{ref.page_end}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}

              <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Textbook library
              </p>
              {libraryLoading ? (
                <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                  Loading textbooks…
                </div>
              ) : library.length ? (
                <div className="space-y-2">
                  {library.map((book) => {
                    const open = expandedBookKey === book.key;
                    const topics = topicsByKey[book.key] || book.topics || [];
                    return (
                      <div
                        key={book.key}
                        className="rounded-lg border border-border bg-card"
                      >
                        <button
                          type="button"
                          onClick={() => toggleBookTopics(book)}
                          className="flex w-full items-start justify-between gap-2 px-3 py-2.5 text-left"
                        >
                          <span className="min-w-0">
                            <span className="block text-xs font-bold text-foreground">
                              {book.title}
                            </span>
                            <span className="block text-[11px] text-muted-foreground">
                              {book.edition}
                              {book.page_count
                                ? ` · ${book.page_count} pages`
                                : ""}
                            </span>
                          </span>
                          <span className="text-[11px] font-bold text-teal-700">
                            {topicsLoadingKey === book.key
                              ? "…"
                              : open
                                ? "Hide"
                                : "Topics"}
                          </span>
                        </button>
                        {open ? (
                          <div className="max-h-64 space-y-1 overflow-y-auto border-t border-border px-2 py-2 hide-scrollbar">
                            {topicsLoadingKey === book.key ? (
                              <p className="px-2 py-3 text-[11px] text-muted-foreground">
                                Loading topics…
                              </p>
                            ) : topics.length ? (
                              topics.map((topic) => (
                                <button
                                  key={`${book.key}-${topic.topic_code}`}
                                  type="button"
                                  onClick={() =>
                                    openTextbook({
                                      textbook_key: book.key,
                                      textbook: book.title,
                                      edition: book.edition,
                                      topic_code: topic.topic_code,
                                      topic_title: topic.topic_title,
                                      page_start: topic.page_start,
                                      page_end: topic.page_end,
                                    })
                                  }
                                  className="flex w-full items-center justify-between gap-2 rounded-md px-2 py-1.5 text-left hover:bg-muted"
                                >
                                  <span className="min-w-0">
                                    <span className="block text-[11px] font-bold text-teal-800 dark:text-teal-300">
                                      {topic.topic_code}
                                    </span>
                                    <span className="block truncate text-[11px] text-foreground">
                                      {topic.topic_title}
                                    </span>
                                  </span>
                                  <span className="shrink-0 text-[10px] text-muted-foreground">
                                    p.{topic.page_start}-{topic.page_end}
                                  </span>
                                </button>
                              ))
                            ) : (
                              <p className="px-2 py-3 text-[11px] text-muted-foreground">
                                No topics found for this book.
                              </p>
                            )}
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No ingested Cambridge textbooks are available yet.
                </p>
              )}
            </div>
          </aside>
        </div>
      ) : null}

      <TextbookPager
        courseSlug={courseSlug}
        open={Boolean(activeBook)}
        target={activeBook}
        onClose={() => setActiveBook(null)}
      />
    </>
  );
}
