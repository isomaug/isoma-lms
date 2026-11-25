import { SearchableSelect } from "@/components/ui/SearchableSelect";
import { useEffect, useMemo, useState } from "react";
import DOMPurify from "dompurify";
import { marked } from "marked";
import {
  BookOpenCheck,
  CheckCircle2,
  Download,
  FileCheck2,
  Loader2,
  Save,
  Search,
  ShieldCheck,
  WandSparkles,
} from "lucide-react";
import { toast } from "sonner";

import { apiFetch } from "@/api/client/apiClient";

const emptySection = {
  worked_solution_markdown: "",
  mark_scheme_reference: "",
  examiner_guidance: "",
  common_errors: "",
  alternative_answers: "",
  confidence: "unchecked",
  is_complete: false,
};

export default function InstructorPastPapers() {
  const [papers, setPapers] = useState([]);
  const [selectedPaper, setSelectedPaper] = useState(null);
  const [selectedSectionId, setSelectedSectionId] = useState(null);
  const [draft, setDraft] = useState(emptySection);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [validationErrors, setValidationErrors] = useState([]);
  const [generating, setGenerating] = useState(false);

  const loadPapers = async () => {
    setLoading(true);
    try {
      const response = await apiFetch("/api/courses/instructor/past-papers/");
      if (!response.ok) throw new Error("Could not load past papers.");
      setPapers(await response.json());
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPapers();
  }, []);

  const openPaper = async (paperId) => {
    setValidationErrors([]);
    try {
      const response = await apiFetch(
        `/api/courses/instructor/past-papers/${paperId}/`
      );
      if (!response.ok) throw new Error("Could not open this paper.");
      const paper = await response.json();
      setSelectedPaper(paper);
      const firstSection = paper.instructor_solution?.sections?.[0];
      setSelectedSectionId(firstSection?.id || null);
      setDraft(firstSection ? { ...firstSection } : emptySection);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const prepareWorkspace = async () => {
    const response = await apiFetch(
      `/api/courses/instructor/past-papers/${selectedPaper.id}/prepare/`,
      { method: "POST" }
    );
    if (!response.ok) {
      toast.error("The instructor workspace could not be prepared.");
      return;
    }
    toast.success("Instructor solution workspace prepared.");
    await openPaper(selectedPaper.id);
    await loadPapers();
  };

  const selectSection = (section) => {
    setSelectedSectionId(section.id);
    setDraft({ ...section });
  };

  const saveSection = async () => {
    if (!selectedSectionId) return;
    setSaving(true);
    try {
      const response = await apiFetch(
        `/api/courses/instructor/past-papers/sections/${selectedSectionId}/`,
        {
          method: "PATCH",
          body: JSON.stringify({
            question_summary: draft.question_summary,
            worked_solution_markdown: draft.worked_solution_markdown,
            mark_scheme_reference: draft.mark_scheme_reference,
            examiner_guidance: draft.examiner_guidance,
            common_errors: draft.common_errors,
            alternative_answers: draft.alternative_answers,
            confidence: draft.confidence,
            is_complete: draft.is_complete,
          }),
        }
      );
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "The section could not be saved.");
      }
      toast.success(`${draft.question_path} saved.`);
      await openPaper(selectedPaper.id);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  const validateWorkspace = async () => {
    const response = await apiFetch(
      `/api/courses/instructor/past-papers/${selectedPaper.id}/validate/`,
      { method: "POST" }
    );
    const result = await response.json();
    setValidationErrors(result.errors || []);
    if (result.valid) toast.success("The solution workspace is valid.");
    else toast.error("The solution still needs attention.");
  };

  const generateVideoScript = async () => {
    if (!selectedPaper || generating) return;
    setGenerating(true);
    setValidationErrors([]);
    try {
      const response = await apiFetch(
        `/api/courses/instructor/past-papers/${selectedPaper.id}/generate-script/`,
        {
          method: "POST",
          body: JSON.stringify({ allow_partial: true, replace: false }),
        }
      );
      const result = await response.json();
      if (!response.ok) {
        setValidationErrors(result.issues || [result.detail]);
        throw new Error(result.detail || "The script could not be generated.");
      }
      toast.success(
        `Generated ${result.aligned_sections} question scripts for instructor review.`
      );
      await openPaper(selectedPaper.id);
      await loadPapers();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setGenerating(false);
    }
  };

  const downloadMaterial = async (material) => {
    try {
      const response = await apiFetch(material.download_url);
      if (!response.ok) throw new Error("Material download failed.");
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = material.title;
      link.click();
      URL.revokeObjectURL(objectUrl);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const filteredPapers = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return papers;
    return papers.filter((paper) =>
      [
        paper.subject,
        paper.syllabus_code,
        paper.exam_year,
        paper.series_label,
        paper.component_code,
      ]
        .join(" ")
        .toLowerCase()
        .includes(term)
    );
  }, [papers, search]);

  const selectedSection =
    selectedPaper?.instructor_solution?.sections?.find(
      (section) => section.id === selectedSectionId
    ) || null;

  const previewHtml = DOMPurify.sanitize(
    marked.parse(draft.worked_solution_markdown || "No solution written yet.")
  );

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 p-1 font-['Inter',sans-serif]">
      <header>
        <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-primary">
          Instructor workspace
        </p>
        <h1 className="mt-1 text-2xl font-extrabold tracking-tight">
          Past-paper solutions
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Solve each question carefully, align it with the authorised mark
          scheme, and validate every mark before review.
        </p>
      </header>

      <div className="grid gap-5 lg:grid-cols-[18rem_minmax(0,1fr)]">
        <aside className="rounded-2xl border border-border bg-card p-3">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search code, year or paper"
              className="w-full rounded-xl border border-border bg-background py-2.5 pl-9 pr-3 text-xs outline-none focus:border-primary"
            />
          </div>
          <div className="mt-3 max-h-[68vh] space-y-2 overflow-y-auto">
            {filteredPapers.length ? (
              filteredPapers.map((paper) => (
                <button
                  key={paper.id}
                  type="button"
                  onClick={() => openPaper(paper.id)}
                  className={`w-full rounded-xl border p-3 text-left transition-colors ${
                    selectedPaper?.id === paper.id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/60"
                  }`}
                >
                  <span className="block text-xs font-extrabold">
                    {paper.syllabus_code}/{paper.component_code}
                  </span>
                  <span className="mt-1 block text-[11px] text-muted-foreground">
                    {paper.series_label} {paper.exam_year}
                  </span>
                  <span className="mt-2 block text-[10px] font-bold uppercase tracking-wider">
                    {paper.completed_sections}/{paper.section_count} complete
                  </span>
                </button>
              ))
            ) : (
              <div className="px-3 py-10 text-center text-xs text-muted-foreground">
                No seeded papers match this view.
              </div>
            )}
          </div>
        </aside>

        <main className="min-w-0">
          {!selectedPaper ? (
            <div className="flex min-h-[28rem] flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card p-8 text-center">
              <BookOpenCheck className="h-10 w-10 text-muted-foreground/50" />
              <h2 className="mt-3 font-extrabold">Select a past paper</h2>
              <p className="mt-1 max-w-sm text-xs text-muted-foreground">
                Choose a verified paper to open its private solution workspace.
              </p>
            </div>
          ) : !selectedPaper.instructor_solution ? (
            <div className="rounded-2xl border border-border bg-card p-8 text-center">
              <FileCheck2 className="mx-auto h-10 w-10 text-primary" />
              <h2 className="mt-3 font-extrabold">
                Prepare solution workspace
              </h2>
              <p className="mx-auto mt-2 max-w-md text-xs text-muted-foreground">
                This creates question sections from the verified manifest
                without overwriting any future instructor work.
              </p>
              <button
                type="button"
                onClick={prepareWorkspace}
                className="mt-5 rounded-xl bg-primary px-5 py-2.5 text-xs font-extrabold text-primary-foreground"
              >
                Prepare workspace
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <section className="rounded-2xl border border-border bg-card p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="font-extrabold">
                      {selectedPaper.syllabus_code}/
                      {selectedPaper.component_code} ·{" "}
                      {selectedPaper.series_label} {selectedPaper.exam_year}
                    </h2>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {selectedPaper.level} ·{" "}
                      {selectedPaper.instructor_solution.status.replaceAll(
                        "_",
                        " "
                      )}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={generating}
                      onClick={generateVideoScript}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground disabled:opacity-50"
                    >
                      {generating ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <WandSparkles className="h-4 w-4" />
                      )}
                      Generate video script
                    </button>
                    <button
                      type="button"
                      onClick={validateWorkspace}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-black px-4 py-2.5 text-xs font-bold text-white dark:bg-white dark:text-black"
                    >
                      <ShieldCheck className="h-4 w-4" />
                      Validate solution
                    </button>
                  </div>
                </div>

                {selectedPaper.materials.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-4">
                    {selectedPaper.materials.map((material) => (
                      <button
                        key={material.id}
                        type="button"
                        onClick={() => downloadMaterial(material)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-[11px] font-bold hover:border-primary"
                      >
                        <Download className="h-3.5 w-3.5" />
                        {material.title}
                      </button>
                    ))}
                  </div>
                )}

                {validationErrors.length > 0 && (
                  <div className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3">
                    <p className="text-xs font-extrabold">
                      Validation needs attention
                    </p>
                    <ul className="mt-2 list-disc space-y-1 pl-4 text-xs">
                      {validationErrors.map((error) => (
                        <li key={error}>{error}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </section>

              <div className="grid gap-4 xl:grid-cols-[13rem_minmax(0,1fr)]">
                <nav className="rounded-2xl border border-border bg-card p-3">
                  <p className="px-2 text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">
                    Questions
                  </p>
                  <div className="mt-2 space-y-1">
                    {selectedPaper.instructor_solution.sections.map(
                      (section) => (
                        <button
                          key={section.id}
                          type="button"
                          onClick={() => selectSection(section)}
                          className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs font-bold ${
                            selectedSectionId === section.id
                              ? "bg-primary text-primary-foreground"
                              : "hover:bg-muted"
                          }`}
                        >
                          <span>{section.question_path}</span>
                          {section.is_complete && (
                            <CheckCircle2 className="h-3.5 w-3.5" />
                          )}
                        </button>
                      )
                    )}
                  </div>
                </nav>

                {selectedSection && (
                  <section className="min-w-0 rounded-2xl border border-border bg-card p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <h3 className="font-extrabold">
                          Question {selectedSection.question_path}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          {selectedSection.maximum_marks} marks
                        </p>
                      </div>
                      <button
                        type="button"
                        disabled={saving}
                        onClick={saveSection}
                        className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground disabled:opacity-50"
                      >
                        {saving ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Save className="h-4 w-4" />
                        )}
                        Save
                      </button>
                    </div>

                    <div className="mt-4 grid gap-4 2xl:grid-cols-2">
                      <div className="space-y-4">
                        <EditorField
                          label="Step-by-step worked solution"
                          value={draft.worked_solution_markdown}
                          rows={18}
                          onChange={(value) =>
                            setDraft({
                              ...draft,
                              worked_solution_markdown: value,
                            })
                          }
                        />
                        <EditorField
                          label="Mark-scheme alignment"
                          value={draft.mark_scheme_reference}
                          onChange={(value) =>
                            setDraft({ ...draft, mark_scheme_reference: value })
                          }
                        />
                        <EditorField
                          label="Examiner guidance"
                          value={draft.examiner_guidance}
                          onChange={(value) =>
                            setDraft({ ...draft, examiner_guidance: value })
                          }
                        />
                        <EditorField
                          label="Common errors"
                          value={draft.common_errors}
                          onChange={(value) =>
                            setDraft({ ...draft, common_errors: value })
                          }
                        />
                        <EditorField
                          label="Alternative acceptable answers"
                          value={draft.alternative_answers}
                          onChange={(value) =>
                            setDraft({ ...draft, alternative_answers: value })
                          }
                        />
                        <div className="grid gap-3 sm:grid-cols-2">
                          <label className="text-xs font-bold">
                            Confidence
                            <SearchableSelect
                              value={draft.confidence}
                              onChange={(event) =>
                                setDraft({
                                  ...draft,
                                  confidence: event.target.value,
                                })
                              }
                              className="mt-1.5 w-full rounded-xl border border-border bg-background px-3 py-2.5 text-xs"
                            >
                              <option value="unchecked">Unchecked</option>
                              <option value="needs_review">Needs review</option>
                              <option value="verified">Verified</option>
                            </SearchableSelect>
                          </label>
                          <label className="flex items-center justify-between rounded-xl border border-border px-3 py-2.5 text-xs font-bold sm:mt-[1.35rem]">
                            Section complete
                            <input
                              type="checkbox"
                              checked={draft.is_complete}
                              onChange={(event) =>
                                setDraft({
                                  ...draft,
                                  is_complete: event.target.checked,
                                })
                              }
                              className="h-4 w-4 accent-primary"
                            />
                          </label>
                        </div>
                      </div>

                      <div className="min-w-0 rounded-xl border border-border bg-background p-5">
                        <p className="mb-4 text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">
                          Markdown preview
                        </p>
                        <div
                          className="prose prose-sm max-w-none dark:prose-invert"
                          dangerouslySetInnerHTML={{ __html: previewHtml }}
                        />
                      </div>
                    </div>
                  </section>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function EditorField({ label, value, onChange, rows = 7 }) {
  return (
    <label className="block text-xs font-bold">
      {label}
      <textarea
        value={value || ""}
        rows={rows}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1.5 w-full resize-y rounded-xl border border-border bg-background px-3 py-2.5 font-mono text-xs leading-relaxed outline-none focus:border-primary"
      />
    </label>
  );
}
