import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  BookOpenText,
  ChevronDown,
  ChevronUp,
  Download,
  FileCheck2,
  FileText,
  LoaderCircle,
  Maximize2,
  Minimize2,
  PlayCircle,
} from "lucide-react";
import { apiFetch } from "@/api/client/apiClient";
import CourseAssistant from "@/components/courses/interactive/CourseAssistant";
import SessionTimer from "@/components/courses/viewer/SessionTimer";
import TextSolutionPager from "@/components/courses/materials/TextSolutionPager";
import VideoPlayer from "@/components/courses/viewer/VideoPlayer";
import XPBadge from "@/components/courses/viewer/XPBadge";

const ResponsivePdfViewer = lazy(
  () => import("@/components/courses/materials/ResponsivePdfViewer")
);

const labels = {
  question_paper: "Question Paper",
  mark_scheme: "Mark Scheme",
};

export default function PastPaperReader() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [paper, setPaper] = useState(null);
  const [activeId, setActiveId] = useState(null);
  const [documentUrl, setDocumentUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [documentLoading, setDocumentLoading] = useState(false);
  const [error, setError] = useState("");
  const [view, setView] = useState("documents");
  const [userXp, setUserXp] = useState(null);
  const [videoMode, setVideoMode] = useState("embedded");
  const [videoHidden, setVideoHidden] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [paperMetaOpen, setPaperMetaOpen] = useState(false);
  const [chromeOpen, setChromeOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const [pdfReloadKey, setPdfReloadKey] = useState(0);

  const activeMaterial = useMemo(
    () => paper?.materials?.find((material) => material.id === activeId),
    [activeId, paper]
  );

  useEffect(() => {
    let cancelled = false;
    apiFetch(`/api/courses/${slug}/past-paper/`)
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok)
          throw new Error(data.detail || "Unable to open paper.");
        if (cancelled) return;
        setPaper(data);
        setIsCompleted(Boolean(data.progress?.is_completed));
        const question =
          data.materials.find((item) => item.type === "question_paper") ||
          data.materials[0];
        const savedView = data.progress?.active_view;
        const savedMaterial = data.materials.find(
          (item) => item.type === savedView
        );
        const initialMaterial = savedMaterial || question;
        setDocumentLoading(Boolean(initialMaterial));
        setActiveId(initialMaterial?.id || null);
        if (
          savedView &&
          !["question_paper", "mark_scheme"].includes(savedView)
        ) {
          setView(savedView);
        }
      })
      .catch((requestError) => {
        if (!cancelled) setError(requestError.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  useEffect(() => {
    let cancelled = false;
    apiFetch(`/api/courses/${slug}/learn/`)
      .then((response) => (response.ok ? response.json() : null))
      .then((course) => {
        if (!cancelled && course?.user_xp) setUserXp(course.user_xp);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [slug]);

  useEffect(() => {
    if (!activeMaterial) return undefined;
    let cancelled = false;
    let objectUrl = "";
    apiFetch(activeMaterial.view_url)
      .then(async (response) => {
        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(data.detail || "Unable to load this PDF.");
        }
        const blob = await response.blob();
        if (cancelled) return;
        objectUrl = URL.createObjectURL(blob);
        setDocumentUrl(objectUrl);
      })
      .catch((requestError) => {
        if (!cancelled) setError(requestError.message);
      })
      .finally(() => {
        if (!cancelled) setDocumentLoading(false);
      });
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [activeMaterial, pdfReloadKey]);

  const selectMaterial = (material) => {
    setView("documents");
    setDocumentLoading(true);
    setError("");
    setActiveId(material.id);
    updateProgress(material.type);
  };

  const updateProgress = async (activeView, extra = {}) => {
    await apiFetch(`/api/courses/${slug}/past-paper/progress/`, {
      method: "PATCH",
      body: JSON.stringify({ active_view: activeView, ...extra }),
    });
  };

  const changeView = (nextView) => {
    setView(nextView);
    setToolsOpen(false);
    updateProgress(nextView);
  };

  const toggleComplete = async () => {
    const nextCompleted = !isCompleted;
    setIsCompleted(nextCompleted);
    await updateProgress(view, { is_completed: nextCompleted });
  };

  const downloadDocument = async () => {
    if (!activeMaterial) return;
    const response = await apiFetch(activeMaterial.view_url);
    if (!response.ok) return;
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = activeMaterial.filename || "document.pdf";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const renderMainContent = () => {
    if (view === "overview") {
      return (
        <section className="h-full overflow-auto rounded-xl border border-border bg-background p-5 shadow-sm">
          <h2 className="text-lg font-bold">Paper overview</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Work through Cambridge {paper.syllabus_code}/{paper.component_code},
            compare your answers with the solution, and use the guided video
            when it is available.
          </p>
        </section>
      );
    }
    if (view === "text") {
      return <TextSolutionPager solution={paper.approved_solution} textbooks={paper.textbooks || []} courseSlug={slug} />;
    }
    if (view === "playground") {
      const files = paper.materials.filter((item) =>
        ["source_files", "worked_output", "supporting"].includes(item.type)
      );
      return (
        <section className="h-full overflow-auto rounded-xl border border-border bg-background p-5 shadow-sm">
          <h2 className="text-lg font-bold">Practical workspace</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Download the authorised source files, complete the practical task,
            and compare your output with the guided solution.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {files.length ? (
              files.map((file) => (
                <a
                  key={file.id}
                  href={file.view_url}
                  className="rounded-lg bg-primary px-4 py-2 text-xs font-bold text-primary-foreground"
                >
                  {file.title}
                </a>
              ))
            ) : (
              <span className="text-sm text-muted-foreground">
                No practical source archive is attached to this paper.
              </span>
            )}
          </div>
        </section>
      );
    }
    if (view === "downloads") {
      return (
        <section className="h-full overflow-auto rounded-xl border border-border bg-background p-5 shadow-sm">
          <h2 className="text-lg font-bold">Downloads</h2>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {paper.materials.map((material) => (
              <button
                key={material.id}
                type="button"
                onClick={() => selectMaterial(material)}
                className="flex items-center justify-between rounded-lg border border-border p-3 text-left text-xs font-semibold hover:border-primary"
              >
                {material.title}
                <Download size={15} />
              </button>
            ))}
          </div>
        </section>
      );
    }
    if (view === "video") {
      const player = paper.video_solution_url ? (
        <VideoPlayer
          url={paper.video_solution_url}
          title={`Video solution for ${paper.syllabus_code}/${paper.component_code}`}
        />
      ) : (
        <div className="flex aspect-video items-center justify-center bg-[#0a0a0a] px-6 text-center">
          <div>
            <PlayCircle className="mx-auto h-10 w-10 text-white/35" />
            <p className="mt-3 text-sm font-semibold text-white">
              Video solution is being prepared
            </p>
          </div>
        </div>
      );
      return (
        <section
          className={`h-full overflow-hidden rounded-xl border border-border bg-black shadow-sm ${
            videoHidden ? "hidden" : ""
          }`}
        >
          {player}
        </section>
      );
    }
    return (
      <div className="h-full min-h-0 overflow-hidden">
        <Suspense
          fallback={
            <div className="flex h-full items-center justify-center">
              <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
            </div>
          }
        >
          <ResponsivePdfViewer
            file={documentUrl}
            title={activeMaterial?.title}
            loading={documentLoading}
            error={error}
            onRetry={() => {
              setError("");
              setDocumentLoading(true);
              setPdfReloadKey((value) => value + 1);
            }}
          />
        </Suspense>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!paper) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <FileText className="mx-auto mb-5 h-10 w-10 text-muted-foreground" />
        <h1 className="text-xl font-semibold">Paper unavailable</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error}</p>
        <Link
          className="mt-6 inline-block text-sm font-semibold text-primary"
          to="/my-learning"
        >
          Return to My Learning
        </Link>
      </div>
    );
  }

  const activeViewLabel = (() => {
    if (view === "text") return "Text";
    if (view === "video") return "Video";
    if (view === "overview") return "Overview";
    if (view === "playground") return "Playground";
    if (view === "downloads") return "Downloads";
    if (activeMaterial?.type === "mark_scheme") return "Mark Scheme";
    if (activeMaterial?.type === "question_paper") return "Question Paper";
    return labels[activeMaterial?.type] || "Paper";
  })();

  return (
    <div className="course-learn past-paper-reader flex h-full min-h-0 flex-col overflow-hidden bg-muted/60 dark:bg-background">
      <div className="mx-auto flex min-h-0 w-full max-w-6xl flex-1 flex-col overflow-hidden px-3 py-1.5 sm:px-6 lg:px-8">
        <section className="relative z-40 mb-1.5 shrink-0 overflow-visible rounded-lg border border-border bg-card shadow-sm">
          <div className="flex h-9 items-center gap-1.5 px-2 sm:h-10 sm:gap-2 sm:px-3">
            <Link
              to={`/courses/${slug}`}
              className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
              title="Back to course"
            >
              <ArrowLeft size={15} />
            </Link>
            <button
              type="button"
              onClick={() => setChromeOpen((open) => !open)}
              aria-expanded={chromeOpen}
              className="flex min-w-0 flex-1 items-center gap-2 rounded-md px-1 text-left hover:bg-muted/60"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-[11px] font-bold text-foreground sm:text-xs">
                  {paper.subject} {paper.syllabus_code}/{paper.component_code}
                  <span className="font-semibold text-muted-foreground">
                    {" "}
                    · {paper.series} {paper.year} P{paper.paper_number}
                    {paper.variant ? `V${paper.variant}` : ""}
                  </span>
                </p>
              </div>
              <span className="hidden shrink-0 rounded bg-teal-700/90 px-1.5 py-0.5 text-[10px] font-bold text-white sm:inline">
                {activeViewLabel}
              </span>
              {chromeOpen ? (
                <ChevronUp size={14} className="shrink-0 text-muted-foreground" />
              ) : (
                <ChevronDown size={14} className="shrink-0 text-muted-foreground" />
              )}
            </button>
            <CourseAssistant
              courseSlug={slug}
              activeLessonId={null}
              activeQuizId={null}
              compact
            />
          </div>

          {chromeOpen && (
            <div className="border-t border-border/70 px-2 pb-2 pt-2 sm:px-3">
              <div className="mb-2 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setPaperMetaOpen((open) => !open)}
                  aria-expanded={paperMetaOpen}
                  className="flex min-w-0 flex-1 items-center justify-between gap-2 rounded-md px-1 py-0.5 text-left"
                >
                  <div className="min-w-0">
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-primary">
                      Current paper
                    </span>
                    <h2 className="truncate text-xs font-bold text-foreground sm:text-sm">
                      {paper.series} {paper.year} · Paper {paper.paper_number}
                      {paper.variant ? ` · Variant ${paper.variant}` : ""}
                    </h2>
                  </div>
                  {paperMetaOpen ? (
                    <ChevronUp size={14} />
                  ) : (
                    <ChevronDown size={14} />
                  )}
                </button>
                <div className="flex shrink-0 items-center gap-2">
                  {userXp && (
                    <div className="hidden sm:block">
                      <XPBadge xpData={userXp} />
                    </div>
                  )}
                  <SessionTimer courseSlug={slug} />
                  <span className="inline-flex items-center gap-1 border border-border px-1.5 py-1 text-[10px] font-semibold text-muted-foreground">
                    <FileCheck2 size={12} className="text-primary" />
                    Verified
                  </span>
                </div>
              </div>

              {paperMetaOpen && (
                <div className="mb-2 flex items-center justify-between gap-2 border-t border-border/60 pt-2 sm:hidden">
                  {userXp && <XPBadge xpData={userXp} />}
                  <SessionTimer courseSlug={slug} />
                </div>
              )}

              <div className="grid w-full grid-cols-5 gap-1">
                {paper.materials
                  .filter((material) =>
                    ["question_paper", "mark_scheme"].includes(material.type)
                  )
                  .map((material) => (
                    <button
                      key={material.id}
                      type="button"
                      onClick={() => selectMaterial(material)}
                      className={`flex h-9 min-w-0 items-center justify-center rounded-lg px-1 text-center text-[10px] font-bold leading-tight transition-colors sm:h-10 sm:px-2 sm:text-xs ${
                        view === "documents" && activeId === material.id
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "bg-muted/70 text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {labels[material.type] || material.title}
                    </button>
                  ))}
                <button
                  type="button"
                  onClick={() => changeView("video")}
                  className={`flex h-9 min-w-0 items-center justify-center gap-1 rounded-lg px-1 text-center text-[10px] font-bold leading-tight transition-colors sm:h-10 sm:px-2 sm:text-xs ${
                    view === "video"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-muted/70 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <PlayCircle size={13} className="hidden sm:block" />
                  <span>Video</span>
                </button>
                <button
                  type="button"
                  onClick={() => changeView("text")}
                  className={`flex h-9 min-w-0 items-center justify-center rounded-lg px-1 text-center text-[10px] font-bold leading-tight transition-colors sm:h-10 sm:px-2 sm:text-xs ${
                    view === "text"
                      ? "bg-teal-700 text-white shadow-sm"
                      : "bg-muted/70 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <span>Text</span>
                </button>
                <div className="relative overflow-visible">
                  <button
                    type="button"
                    onClick={() => setToolsOpen((open) => !open)}
                    aria-expanded={toolsOpen}
                    aria-controls="past-paper-tools"
                    className={`flex h-9 w-full min-w-0 items-center justify-center gap-0.5 rounded-lg px-1 text-center text-[10px] font-bold leading-tight transition-colors sm:h-10 sm:px-2 sm:text-xs ${
                      toolsOpen ||
                      ["overview", "playground", "downloads"].includes(view)
                        ? "bg-slate-800 text-white shadow-sm"
                        : "bg-muted/70 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <span>Tools</span>
                    {toolsOpen ? (
                      <ChevronUp size={13} />
                    ) : (
                      <ChevronDown size={13} />
                    )}
                  </button>
                  {toolsOpen && (
                    <div
                      id="past-paper-tools"
                      className="absolute inset-x-0 top-full z-50 mt-1 w-full rounded-lg border border-border bg-background p-1 shadow-lg"
                    >
                      {[
                        ["Overview", "overview"],
                        ["Playground", "playground"],
                        ["Downloads", "downloads"],
                      ].map(([label, nextView]) => (
                        <button
                          key={nextView}
                          type="button"
                          onClick={() => changeView(nextView)}
                          className={`mb-0.5 flex h-8 w-full items-center justify-center rounded-md px-1 text-center text-[10px] font-bold leading-tight sm:text-[11px] ${
                            view === nextView
                              ? "bg-primary text-primary-foreground"
                              : "hover:bg-muted"
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => {
                          downloadDocument();
                          setToolsOpen(false);
                        }}
                        disabled={!activeMaterial}
                        className="mb-0.5 flex h-8 w-full items-center justify-center gap-1 rounded-md px-1 text-center text-[10px] font-bold leading-tight hover:bg-muted disabled:opacity-50 sm:text-[11px]"
                      >
                        <Download size={12} />
                        PDF
                      </button>
                      <button
                        type="button"
                        disabled={!paper.navigation?.previous_slug}
                        onClick={() =>
                          navigate(
                            `/courses/${paper.navigation.previous_slug}/learn`
                          )
                        }
                        className="mb-0.5 flex h-8 w-full items-center justify-center rounded-md px-1 text-center text-[10px] font-bold leading-tight hover:bg-muted disabled:opacity-40 sm:text-[11px]"
                      >
                        Prev paper
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          toggleComplete();
                          setToolsOpen(false);
                        }}
                        className={`mb-0.5 flex h-8 w-full items-center justify-center rounded-md px-1 text-center text-[10px] font-bold leading-tight sm:text-[11px] ${
                          isCompleted
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-muted"
                        }`}
                      >
                        {isCompleted ? "Completed" : "Complete"}
                      </button>
                      <button
                        type="button"
                        disabled={!paper.navigation?.next_slug}
                        onClick={() =>
                          navigate(
                            `/courses/${paper.navigation.next_slug}/learn`
                          )
                        }
                        className="flex h-8 w-full items-center justify-center rounded-md px-1 text-center text-[10px] font-bold leading-tight hover:bg-muted disabled:opacity-40 sm:text-[11px]"
                      >
                        Next paper
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </section>

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          {view !== "video" ? (
            renderMainContent()
          ) : (
            <section
              className={`grid h-full gap-4 overflow-auto rounded-xl border border-border bg-background p-3 shadow-sm sm:p-4 lg:p-5 ${
                videoMode === "split"
                  ? "lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_18rem]"
                  : "lg:grid-cols-[minmax(0,1fr)_18rem]"
              }`}
            >
            <div
              className={`min-w-0 overflow-hidden rounded-lg bg-black ${
                videoMode === "floating" && !videoHidden
                  ? "fixed bottom-4 right-3 z-50 w-[min(22rem,calc(100vw-1.5rem))] shadow-2xl sm:bottom-6 sm:right-6"
                  : ""
              }`}
            >
              {videoHidden ? (
                <div className="flex aspect-video items-center justify-center bg-[#0a0a0a] px-6 text-center text-sm font-semibold text-white">
                  Video hidden
                </div>
              ) : paper.video_solution_url ? (
                <VideoPlayer
                  url={paper.video_solution_url}
                  title={`Video solution for ${paper.syllabus_code}/${paper.component_code}`}
                />
              ) : (
                <div className="flex aspect-video items-center justify-center bg-[#0a0a0a] px-6 text-center">
                  <div>
                    <PlayCircle className="mx-auto h-10 w-10 text-white/35" />
                    <p className="mt-3 text-sm font-semibold text-white">
                      Video solution is being prepared
                    </p>
                    <p className="mt-1 text-xs text-white/55">
                      The question paper and solution remain available above.
                    </p>
                  </div>
                </div>
              )}
            </div>
            {(videoMode === "split" || videoMode === "floating") && (
              <Suspense
                fallback={
                  <div className="flex min-h-[70vh] items-center justify-center">
                    <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
                  </div>
                }
              >
                <ResponsivePdfViewer
                  file={documentUrl}
                  title={activeMaterial?.title}
                  loading={documentLoading}
                  error={error}
                  onRetry={() => {
                    setError("");
                    setDocumentLoading(true);
                    setPdfReloadKey((value) => value + 1);
                  }}
                />
              </Suspense>
            )}
            <aside className="border-border lg:border-l lg:pl-5">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">
                Guided walkthrough
              </p>
              <h2 className="mt-2 text-lg font-semibold text-foreground">
                {paper.syllabus_code}/{paper.component_code} video solution
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Follow the instructor's complete solution alongside the question
                paper. Pause, replay and compare each response with the official
                mark scheme.
              </p>
              <button
                type="button"
                onClick={() => changeView("text")}
                className="mt-4 flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-teal-700 text-xs font-bold text-white"
              >
                <BookOpenText size={14} />
                Open text solution
              </button>
              <div className="mt-4 grid grid-cols-3 gap-1 rounded-lg bg-muted p-1">
                {[
                  ["Embed", "embedded"],
                  ["Floating", "floating"],
                  ["Split", "split"],
                ].map(([label, mode]) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => {
                      setVideoMode(mode);
                      setVideoHidden(false);
                    }}
                    className={`flex h-10 min-w-0 items-center justify-center gap-1 rounded-md px-1 text-[10px] font-bold ${
                      videoMode === mode
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setVideoHidden((hidden) => !hidden)}
                className="mt-2 flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-border text-xs font-bold"
              >
                {videoHidden ? (
                  <Maximize2 size={14} />
                ) : (
                  <Minimize2 size={14} />
                )}
                {videoHidden ? "Show Video" : "Hide Video"}
              </button>
              <dl className="mt-5 space-y-3 border-t border-border pt-4 text-sm">
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">Session</dt>
                  <dd className="font-semibold">
                    {paper.series} {paper.year}
                  </dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">Paper</dt>
                  <dd className="font-semibold">{paper.paper_number}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">Component</dt>
                  <dd className="font-semibold">{paper.component_code}</dd>
                </div>
              </dl>
            </aside>
          </section>
          )}
        </div>
      </div>
    </div>
  );
}
