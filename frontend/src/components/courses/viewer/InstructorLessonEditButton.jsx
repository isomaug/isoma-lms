import { useEffect, useState } from "react";
import { Pencil, X } from "lucide-react";
import { toast } from "sonner";
import { apiFetch } from "@/api/client/apiClient";

const FIELD_LABELS = {
  overview: "Overview (Today you will)",
  lesson_text: "Text Version (spoken lesson)",
  content: "Lesson Plan (instructors)",
  video_script: "Video Script",
};

/**
 * Pencil control + modal editor for instructor lesson fields.
 * Saves via PUT /api/admin/lessons/:id/
 */
export default function InstructorLessonEditButton({
  lesson,
  field,
  onSaved,
  className = "",
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open && lesson) {
      setDraft(lesson[field] || "");
    }
  }, [open, lesson, field]);

  if (!lesson?.id) return null;

  const save = async () => {
    setSaving(true);
    try {
      const res = await apiFetch(`/api/admin/lessons/${lesson.id}/`, {
        method: "PATCH",
        body: JSON.stringify({ [field]: draft }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || err.error || "Save failed");
      }
      const updated = await res.json();
      onSaved?.(updated);
      toast.success("Lesson updated");
      setOpen(false);
    } catch (e) {
      toast.error(e.message || "Could not save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors ${className}`}
        title={`Edit ${FIELD_LABELS[field] || field}`}
      >
        <Pencil size={13} />
        Edit
      </button>

      {open && (
        <div className="fixed inset-0 z-[100000] flex items-center justify-center bg-black/50 p-4">
          <div className="flex w-full max-w-3xl max-h-[90vh] flex-col overflow-hidden rounded-xl border border-border bg-background shadow-2xl">
            <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
              <div>
                <h3 className="text-sm font-bold text-foreground">
                  {FIELD_LABELS[field] || field}
                </h3>
                <p className="text-xs text-muted-foreground truncate">
                  {lesson.title}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-4">
              <p className="mb-2 text-[11px] text-muted-foreground leading-relaxed">
                Use Markdown. For student Text Version, prefer sections like{" "}
                <code className="text-[10px]"># Week N - Lesson 1</code>,{" "}
                <code className="text-[10px]">## Today you will</code>,{" "}
                <code className="text-[10px]">## Let's begin</code> with numbered steps,
                and fenced code blocks for copyable code.
              </p>
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                className="min-h-[50vh] w-full resize-y rounded-lg border border-border bg-card px-3 py-2 font-mono text-sm leading-relaxed text-foreground outline-none focus:border-primary"
                spellCheck={false}
              />
            </div>
            <div className="flex justify-end gap-2 border-t border-border px-4 py-3">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-1.5 text-sm font-medium text-muted-foreground hover:bg-muted"
                disabled={saving}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={save}
                disabled={saving}
                className="rounded-lg bg-primary px-4 py-1.5 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60"
              >
                {saving ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
