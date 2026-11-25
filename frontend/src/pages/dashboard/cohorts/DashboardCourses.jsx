import { SearchableSelect } from "@/components/ui/SearchableSelect";
import { useState, useRef } from "react";
import useSWR from "swr";
import { apiFetch, swrFetcher } from "@/api/client/apiClient";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Edit, Trash, Save, BookOpen, History, Upload, X, AlertTriangle, Users, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { TableRowMore, TableRowMoreField } from "@/components/ui/TableRowMore";
import { FaPlay } from "react-icons/fa";
import DelayedSpinner from "@/components/notifications/DelayedSpinner";
import { toast } from "sonner";
import DOMPurify from "dompurify";
import { marked } from "marked";
import CurriculumEditor from "./CurriculumEditor";
import CourseStudentsTable from "@/components/courses/enrollment/CourseStudentsTable";
import DashboardMyCohorts from "./DashboardMyCohorts";

// ─── Helper: ownership label + solid badge ───────────────────────────────────
function getCourseOwnership(course, me) {
  if (course.is_deleted) return "deleted";
  if (course.owner === me?.id) return "owned";
  if (me?.is_superuser) return "system";
  return "assigned";
}

function CourseBadge({ course, me }) {
  if (course.is_deleted) {
    return (
      <span className="inline-flex bg-red-200 text-red-900 dark:bg-red-700 dark:text-white px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider whitespace-nowrap">
        Deleted {course.deleted_by_username ? `by ${course.deleted_by_username}` : ""}
      </span>
    );
  }
  if (course.owner === me?.id) {
    return (
      <span className="inline-flex bg-blue-200 text-blue-900 dark:bg-blue-600 dark:text-white px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider">
        Owned
      </span>
    );
  }
  if (me?.is_superuser) {
    return (
      <span className="inline-flex bg-purple-200 text-purple-900 dark:bg-purple-600 dark:text-white px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider">
        System
      </span>
    );
  }
  return (
    <span className="inline-flex bg-amber-200 text-amber-950 dark:bg-amber-500 dark:text-amber-950 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider">
      Assigned
    </span>
  );
}

function StatusBadge({ published, compact = false }) {
  const size = compact
    ? "px-2 py-0.5 text-[10px]"
    : "px-2.5 py-1 text-[10px]";
  if (published) {
    return (
      <span className={`inline-flex bg-green-200 text-green-900 dark:bg-green-600 dark:text-white ${size} rounded-md font-bold uppercase tracking-wider`}>
        Published
      </span>
    );
  }
  return (
    <span className={`inline-flex bg-slate-300 text-slate-900 dark:bg-slate-500 dark:text-white ${size} rounded-md font-bold uppercase tracking-wider`}>
      Draft
    </span>
  );
}

// ─── Edit Log Modal ──────────────────────────────────────────────────────────
function EditLogModal({ courseId, courseTitle, onClose }) {
  const { data, isLoading } = useSWR(
    courseId ? `/api/admin/courses/${courseId}/edit-logs/` : null,
    swrFetcher
  );

  const logs = Array.isArray(data) ? data : [];

  const ACTION_COLORS = {
    CREATED: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-400",
    UPDATED: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-400",
    SOFT_DELETED: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-400",
    PERMANENTLY_DELETED: "bg-red-200 text-red-900 dark:bg-red-900/60 dark:text-red-300",
    RESTORED: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-400",
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-background border border-border rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div>
            <h3 className="font-bold text-lg">Edit History</h3>
            <p className="text-muted-foreground text-sm truncate">{courseTitle}</p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="overflow-y-auto custom-scrollbar flex-1 p-6">
          {isLoading ? (
            <DelayedSpinner />
          ) : logs.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No edit history for this course.</p>
          ) : (
            <div className="space-y-4">
              {logs.map((log) => (
                <div key={log.id} className="border border-border rounded-xl p-4 bg-muted/20">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${ACTION_COLORS[log.action] || "bg-secondary text-secondary-foreground"}`}>
                      {log.action}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      by <strong>{log.user_username || "Unknown"}</strong>
                    </span>
                    <span className="text-xs text-muted-foreground ml-auto">
                      {new Date(log.timestamp).toLocaleString()}
                    </span>
                  </div>
                  {log.details && Object.keys(log.details).length > 0 && (
                    <div className="mt-2 space-y-1">
                      {Object.entries(log.details).map(([field, change]) => {
                        if (typeof change === "object" && change !== null && "from" in change) {
                          return (
                            <div key={field} className="text-xs font-mono bg-background rounded-md px-3 py-1.5 border border-border">
                              <span className="text-muted-foreground font-sans">{field}: </span>
                              <span className="line-through text-red-500">{String(change.from ?? "-")}</span>
                              {" → "}
                              <span className="text-green-600 dark:text-green-400">{String(change.to ?? "-")}</span>
                            </div>
                          );
                        }
                        return (
                          <div key={field} className="text-xs font-mono bg-background rounded-md px-3 py-1.5 border border-border">
                            <span className="text-muted-foreground font-sans">{field}: </span>
                            <span>{String(change ?? "-")}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Bulk CSV Import Modal ────────────────────────────────────────────────────
function BulkImportModal({ onClose, onSuccess }) {
  const [csvFile, setCsvFile] = useState(null);
  const [defaultPassword, setDefaultPassword] = useState("");
  const [forceReset, setForceReset] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const fileRef = useRef(null);

  const handleImport = async () => {
    if (!csvFile) return toast.error("Please select a CSV file.");
    if (!defaultPassword) return toast.error("Please set a default password.");

    setLoading(true);
    const form = new FormData();
    form.append("csv_file", csvFile);
    form.append("default_password", defaultPassword);
    form.append("force_password_reset", forceReset ? "true" : "false");

    try {
      const res = await apiFetch("/api/admin/users/bulk-import/", { method: "POST", body: form });
      const data = await res.json();
      if (res.ok) {
        setResult(data);
        onSuccess?.();
        toast.success(`${data.created} users created, ${data.skipped} skipped.`);
      } else {
        toast.error(data.error || "Import failed.");
      }
    } catch {
      toast.error("Import failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-background border border-border rounded-2xl w-full max-w-lg shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div>
            <h3 className="font-bold text-lg">Bulk Import Users</h3>
            <p className="text-muted-foreground text-xs mt-0.5">CSV columns: first_name, last_name, email, username (optional), role (student|instructor)</p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          {!result ? (
            <>
              <div>
                <label className="block text-sm font-medium mb-1">CSV File</label>
                <div
                  className="border-2 border-dashed border-border rounded-lg p-6 flex flex-col items-center gap-2 cursor-pointer hover:bg-muted/30 transition-colors"
                  onClick={() => fileRef.current?.click()}
                >
                  <Upload className="w-8 h-8 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{csvFile ? csvFile.name : "Click to upload CSV"}</span>
                  <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={(e) => setCsvFile(e.target.files[0])} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Default Password</label>
                <Input type="password" value={defaultPassword} onChange={(e) => setDefaultPassword(e.target.value)} placeholder="Set a password for all new users" />
              </div>
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <div
                  className={`w-10 h-6 rounded-full transition-colors relative ${forceReset ? "bg-primary" : "bg-muted"}`}
                  onClick={() => setForceReset(!forceReset)}
                >
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${forceReset ? "translate-x-4" : ""}`} />
                </div>
                <span className="text-sm font-medium">Force password reset on first login</span>
              </label>
              <div className="flex items-start gap-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700 dark:text-amber-300">Users with existing emails will be skipped. Usernames are auto-generated from email if not provided.</p>
              </div>
              <div className="flex gap-2 pt-2">
                <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
                <Button className="flex-1" onClick={handleImport} disabled={loading}>
                  {loading ? "Importing..." : "Import Users"}
                </Button>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-green-700 dark:text-green-400">{result.created}</p>
                  <p className="text-xs text-green-600 dark:text-green-500">Created</p>
                </div>
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-amber-700 dark:text-amber-400">{result.skipped}</p>
                  <p className="text-xs text-amber-600 dark:text-amber-500">Skipped</p>
                </div>
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-red-700 dark:text-red-400">{result.errors}</p>
                  <p className="text-xs text-red-600 dark:text-red-500">Errors</p>
                </div>
              </div>
              {result.skipped_users?.length > 0 && (
                <div className="text-xs text-muted-foreground">
                  <p className="font-semibold mb-1">Skipped emails:</p>
                  <div className="max-h-24 overflow-y-auto space-y-0.5">
                    {result.skipped_users.map((u, i) => <p key={i}>{u.email} - {u.reason}</p>)}
                  </div>
                </div>
              )}
              <Button className="w-full" onClick={onClose}>Done</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function DashboardCourses() {
  const { me } = useAuth();
  const isAdmin = me?.is_staff || me?.is_superuser;

  const { data: coursesData, error, isLoading, mutate } = useSWR("/api/admin/courses/", swrFetcher);
  const { data: usersData } = useSWR(isAdmin ? "/api/admin/users/" : null, swrFetcher);

  const [editingCourse, setEditingCourse] = useState(null);
  const [managingCurriculum, setManagingCurriculum] = useState(null);
  const [viewingStudentsForCourse, setViewingStudentsForCourse] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [previewMarkdown, setPreviewMarkdown] = useState(false);
  const [activeTab, setActiveTab] = useState("courses");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [instructorFilter, setInstructorFilter] = useState("all");
  const [viewingLogsFor, setViewingLogsFor] = useState(null); // { id, title }
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: "title", direction: "asc" });

  const courses = Array.isArray(coursesData) ? coursesData : coursesData?.results || [];
  const users = Array.isArray(usersData) ? usersData : usersData?.results || [];
  const instructors = users.filter(u => u.is_instructor || u.is_superuser || u.is_staff);

  // Can this user edit/delete a given course?
  const canEdit = (course) => isAdmin || course.owner === me?.id;

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const SortIcon = ({ columnKey }) => {
    if (sortConfig.key !== columnKey) {
      return <ArrowUpDown className="w-3 h-3 ml-1 inline text-muted-foreground opacity-50" />;
    }
    return sortConfig.direction === "asc" ? (
      <ArrowUp className="w-3 h-3 ml-1 inline text-primary" />
    ) : (
      <ArrowDown className="w-3 h-3 ml-1 inline text-primary" />
    );
  };

  const filteredCourses = courses
    .filter(course => {
      const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (course.subtitle || "").toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" ? true : statusFilter === "deleted" ? course.is_deleted : statusFilter === "published" ? course.is_published : !course.is_published;
      const matchesInstructor = instructorFilter === "all" ? true : (course.assigned_instructor?.toString() === instructorFilter);
      return matchesSearch && matchesStatus && matchesInstructor;
    })
    .sort((a, b) => {
      const { key, direction } = sortConfig;
      const dir = direction === "asc" ? 1 : -1;
      let aVal;
      let bVal;
      if (key === "title") {
        aVal = (a.title || "").toLowerCase();
        bVal = (b.title || "").toLowerCase();
      } else if (key === "ownership") {
        aVal = getCourseOwnership(a, me);
        bVal = getCourseOwnership(b, me);
      } else if (key === "status") {
        aVal = a.is_deleted ? 2 : a.is_published ? 1 : 0;
        bVal = b.is_deleted ? 2 : b.is_published ? 1 : 0;
      } else if (key === "price") {
        aVal = Number(a.price_ugx) || 0;
        bVal = Number(b.price_ugx) || 0;
      } else if (key === "instructor") {
        aVal = (a.assigned_instructor_username || "").toLowerCase();
        bVal = (b.assigned_instructor_username || "").toLowerCase();
      } else {
        return 0;
      }
      if (aVal < bVal) return -1 * dir;
      if (aVal > bVal) return 1 * dir;
      return 0;
    });

  const handleSave = async (e) => {
    e.preventDefault();
    const isNew = !editingCourse.id;
    const url = isNew ? "/api/admin/courses/" : `/api/admin/courses/${editingCourse.id}/`;
    const method = isNew ? "POST" : "PUT";
    try {
      await apiFetch(url, { method, body: JSON.stringify(editingCourse) });
      mutate();
      setEditingCourse(null);
      setIsCreating(false);
      toast.success(isNew ? "Course created!" : "Course updated!");
    } catch {
      toast.error("Failed to save course.");
    }
  };

  const handleDelete = async (course) => {
    const msg = isAdmin
      ? `Permanently delete "${course.title}"? This cannot be undone.`
      : `Delete "${course.title}"? Admins will still be able to see it.`;
    if (!window.confirm(msg)) return;
    try {
      await apiFetch(`/api/admin/courses/${course.id}/`, { method: "DELETE" });
      mutate();
      toast.success(isAdmin ? "Course permanently deleted." : "Course deleted.");
    } catch {
      toast.error("Failed to delete course.");
    }
  };

  const handleRestore = async (course) => {
    try {
      await apiFetch(`/api/admin/courses/${course.id}/restore/`, { method: "POST" });
      mutate();
      toast.success("Course restored.");
    } catch {
      toast.error("Failed to restore course.");
    }
  };

  if (isLoading) return <DelayedSpinner />;
  if (error) return <div className="text-red-500">Error loading courses.</div>;

  if (managingCurriculum) {
    return <CurriculumEditor course={managingCurriculum} onBack={() => setManagingCurriculum(null)} />;
  }

  if (viewingStudentsForCourse) {
    return (
      <CourseStudentsTable
        courseId={viewingStudentsForCourse.id}
        courseTitle={viewingStudentsForCourse.title}
        onBack={() => {
          setViewingStudentsForCourse(null);
        }}
      />
    );
  }

  return (
    <div className="h-full flex flex-col space-y-6 min-h-0">
      {viewingLogsFor && (
        <EditLogModal
          courseId={viewingLogsFor.id}
          courseTitle={viewingLogsFor.title}
          onClose={() => setViewingLogsFor(null)}
        />
      )}
      {showBulkImport && (
        <BulkImportModal onClose={() => setShowBulkImport(false)} />
      )}

      <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-6 pb-2 border-b border-border/80">
        <button
          onClick={() => setActiveTab("courses")}
          className={`px-5 py-2.5 font-['Inter',sans-serif] text-[14px] font-bold transition-all flex items-center gap-2.5 cursor-pointer rounded-none border-b-2 ${
            activeTab === "courses"
              ? "bg-primary text-primary-foreground border-primary shadow-sm"
              : "bg-muted/40 text-muted-foreground border-transparent hover:bg-primary/10 hover:text-primary"
          }`}
        >
          <FaPlay className="text-xs" />
          <span>My Courses</span>
        </button>

        <button
          onClick={() => setActiveTab("teaching_cohorts")}
          className={`px-5 py-2.5 font-['Inter',sans-serif] text-[14px] font-bold transition-all flex items-center gap-2.5 cursor-pointer rounded-none border-b-2 ${
            activeTab === "teaching_cohorts"
              ? "bg-primary text-primary-foreground border-primary shadow-sm"
              : "bg-muted/40 text-muted-foreground border-transparent hover:bg-primary/10 hover:text-primary"
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Cohorts I'm Teaching</span>
        </button>
      </div>

      {activeTab === "teaching_cohorts" && (
        <div className="animate-in fade-in duration-500 min-h-[400px]">
          <DashboardMyCohorts type="teaching" />
        </div>
      )}

      {activeTab === "courses" && (
        <>
          <div className="flex justify-between items-center shrink-0">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">Courses</h2>
          <p className="text-muted-foreground">Manage your course catalog and descriptions.</p>
        </div>
        {!editingCourse && !isCreating && (
          <Button onClick={() => { setIsCreating(true); setEditingCourse({ title: "", slug: "", subtitle: "", description: "", price_ugx: 0, assigned_instructor: isAdmin ? me.id : null }); }}>
            <Plus className="w-4 h-4 mr-2" /> New Course
          </Button>
        )}
      </div>

      {!editingCourse && !isCreating && (
        <div className="flex flex-col sm:flex-row gap-3 mb-6 shrink-0">
          <Input
            placeholder="Search courses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="sm:max-w-[260px]"
          />
          <SearchableSelect
            className="flex h-10 w-full sm:w-[140px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            {isAdmin && <option value="deleted">Deleted (Soft)</option>}
          </SearchableSelect>
          {isAdmin && (
            <SearchableSelect
              className="flex h-10 w-full sm:w-[180px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              value={instructorFilter}
              onChange={(e) => setInstructorFilter(e.target.value)}
            >
              <option value="all">All Instructors</option>
              {instructors.map(inst => (
                <option key={inst.id} value={inst.id.toString()}>{inst.full_name || inst.username}</option>
              ))}
            </SearchableSelect>
          )}
        </div>
      )}

      {(editingCourse || isCreating) ? (
        <form onSubmit={handleSave} className="bg-card p-6 rounded-xl border border-border space-y-4">
          <h3 className="text-lg font-bold">{isCreating ? "Create Course" : "Edit Course"}</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <Input value={editingCourse.title || ""} onChange={e => setEditingCourse({...editingCourse, title: e.target.value})} required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Slug</label>
              <Input value={editingCourse.slug || ""} onChange={e => setEditingCourse({...editingCourse, slug: e.target.value})} required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Short Description</label>
              <Input value={editingCourse.subtitle || ""} onChange={e => setEditingCourse({...editingCourse, subtitle: e.target.value})} />
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">Price (UGX)</label>
                <Input type="number" value={editingCourse.price_ugx || 0} onChange={e => setEditingCourse({...editingCourse, price_ugx: parseFloat(e.target.value)})} />
              </div>
              {isAdmin && (
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">Assigned Instructor</label>
                  <SearchableSelect
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={editingCourse.assigned_instructor || ""}
                    onChange={e => setEditingCourse({...editingCourse, assigned_instructor: e.target.value || null})}
                  >
                    <option value="">-- None --</option>
                    {instructors.map(inst => (
                      <option key={inst.id} value={inst.id}>{inst.full_name || inst.username} ({inst.email})</option>
                    ))}
                  </SearchableSelect>
                </div>
              )}
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-medium">Description (Markdown Supported)</label>
              <Button type="button" variant="ghost" size="sm" onClick={() => setPreviewMarkdown(!previewMarkdown)}>
                {previewMarkdown ? "Edit" : "Preview"}
              </Button>
            </div>
            {previewMarkdown ? (
              <div
                className="p-4 border rounded-md min-h-[200px] prose dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(marked.parse(editingCourse.description || "")) }}
              />
            ) : (
              <Textarea
                value={editingCourse.description || ""}
                onChange={e => setEditingCourse({...editingCourse, description: e.target.value})}
                className="min-h-[200px] font-mono text-sm"
              />
            )}
          </div>

          <div className="flex gap-2 justify-end pt-4 border-t border-border">
            <Button type="button" variant="outline" onClick={() => { setEditingCourse(null); setIsCreating(false); }}>
              Cancel
            </Button>
            <Button type="submit">
              <Save className="w-4 h-4 mr-2" /> Save Course
            </Button>
          </div>
        </form>
      ) : (
        <div className="flex-1 rounded-xl border border-border bg-card flex flex-col min-h-0">
          <div className="overflow-y-auto overflow-x-hidden custom-scrollbar flex-1 min-w-0">
            <table className="w-full table-fixed text-left border-collapse text-sm relative">
              <thead className="bg-muted/50 border-b border-border sticky top-0 z-10">
                <tr>
                  <th
                    className="px-3 py-3 font-medium text-muted-foreground sm:px-4 cursor-pointer hover:bg-muted/80 select-none"
                    onClick={() => handleSort("title")}
                  >
                    Course <SortIcon columnKey="title" />
                  </th>
                  <th
                    className="hidden w-28 px-3 py-3 font-medium text-muted-foreground sm:table-cell sm:px-4 whitespace-nowrap cursor-pointer hover:bg-muted/80 select-none"
                    onClick={() => handleSort("ownership")}
                  >
                    Ownership <SortIcon columnKey="ownership" />
                  </th>
                  <th
                    className="hidden w-28 px-3 py-3 font-medium text-muted-foreground sm:table-cell sm:px-4 sm:w-32 whitespace-nowrap cursor-pointer hover:bg-muted/80 select-none"
                    onClick={() => handleSort("status")}
                  >
                    Status <SortIcon columnKey="status" />
                  </th>
                  <th
                    className="hidden w-36 px-3 py-3 font-medium text-muted-foreground sm:table-cell sm:px-4 sm:w-40 whitespace-nowrap cursor-pointer hover:bg-muted/80 select-none"
                    onClick={() => handleSort("price")}
                  >
                    Price <SortIcon columnKey="price" />
                  </th>
                  {isAdmin && (
                    <th
                      className="hidden px-3 py-3 font-medium text-muted-foreground md:table-cell sm:px-4 cursor-pointer hover:bg-muted/80 select-none"
                      onClick={() => handleSort("instructor")}
                    >
                      Instructor <SortIcon columnKey="instructor" />
                    </th>
                  )}
                  <th className="w-10 px-1 py-3 font-medium text-muted-foreground text-right">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredCourses.length === 0 ? (
                  <tr>
                    <td colSpan={isAdmin ? 6 : 5} className="px-4 py-8 text-center text-muted-foreground">
                      No courses found matching your filters.
                    </td>
                  </tr>
                ) : (
                  filteredCourses.map(course => {
                    const userCanEdit = canEdit(course);
                    return (
                      <tr
                        key={course.id}
                        className={`border-b border-border transition-colors last:border-b-0 ${course.is_deleted ? "bg-red-50/40 dark:bg-red-900/10 opacity-70" : "hover:bg-muted/30"}`}
                      >
                        <td className="min-w-0 px-3 py-3 sm:px-4">
                          <div className="flex flex-col gap-1 min-w-0">
                            <p className="font-semibold text-foreground truncate" title={course.title}>{course.title}</p>
                            <p className="text-xs text-muted-foreground line-clamp-1" title={course.subtitle}>{course.subtitle || "No description"}</p>

                            {/* Mobile: ownership, status, price, instructor */}
                            <div className="flex sm:hidden items-center gap-2 pt-1 flex-wrap text-xs">
                              <CourseBadge course={course} me={me} />
                              <StatusBadge published={course.is_published} compact />
                              <span className="font-mono text-xs font-semibold text-foreground bg-muted px-2 py-0.5 rounded border border-border">
                                UGX {Number(course.price_ugx).toLocaleString()}
                              </span>
                              {isAdmin && (course.assigned_instructor_username || course.assigned_instructor) && (
                                <span className="text-[11px] text-muted-foreground truncate max-w-[130px]">
                                  • {course.assigned_instructor_username || `User #${course.assigned_instructor}`}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="hidden px-3 py-3 sm:table-cell sm:px-4 whitespace-nowrap">
                          <CourseBadge course={course} me={me} />
                        </td>
                        <td className="hidden px-3 py-3 sm:table-cell sm:px-4 whitespace-nowrap">
                          <StatusBadge published={course.is_published} />
                        </td>
                        <td className="hidden px-3 py-3 font-mono font-medium sm:table-cell sm:px-4 whitespace-nowrap">UGX {Number(course.price_ugx).toLocaleString()}</td>
                        {isAdmin && (
                          <td className="hidden min-w-0 px-3 py-3 text-muted-foreground md:table-cell sm:px-4">
                            <span className="block truncate">{course.assigned_instructor_username || (course.assigned_instructor ? `User #${course.assigned_instructor}` : "-")}</span>
                          </td>
                        )}
                        <td className="px-1 py-3 text-right">
                          <TableRowMore label="Course actions" contentClassName="w-52">
                            <TableRowMoreField label="Ownership" className="sm:hidden">
                              {getCourseOwnership(course, me)}
                            </TableRowMoreField>
                            <TableRowMoreField label="Status" className="sm:hidden">{course.is_published ? "Published" : "Draft"}</TableRowMoreField>
                            <TableRowMoreField label="Price" className="sm:hidden">UGX {Number(course.price_ugx).toLocaleString()}</TableRowMoreField>
                            {isAdmin && (
                              <TableRowMoreField label="Instructor" className="md:hidden">
                                {course.assigned_instructor_username || (course.assigned_instructor ? `User #${course.assigned_instructor}` : "-")}
                              </TableRowMoreField>
                            )}
                            <DropdownMenuItem onSelect={() => setViewingStudentsForCourse(course)}>
                              <Users className="w-4 h-4" /> Students
                            </DropdownMenuItem>
                            {!course.is_deleted && (
                              <DropdownMenuItem disabled={!userCanEdit} onSelect={() => setManagingCurriculum(course)}>
                                <BookOpen className="w-4 h-4" /> Curriculum
                              </DropdownMenuItem>
                            )}
                            {isAdmin && (
                              <DropdownMenuItem onSelect={() => setViewingLogsFor(course)}>
                                <History className="w-4 h-4" /> Edit history
                              </DropdownMenuItem>
                            )}
                            {!course.is_deleted && userCanEdit && (
                              <DropdownMenuItem onSelect={() => setEditingCourse(course)}>
                                <Edit className="w-4 h-4" /> Edit
                              </DropdownMenuItem>
                            )}
                            {!course.is_deleted && userCanEdit && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-destructive focus:text-destructive"
                                  onSelect={() => handleDelete(course)}
                                >
                                  <Trash className="w-4 h-4" /> {isAdmin ? "Permanent delete" : "Delete"}
                                </DropdownMenuItem>
                              </>
                            )}
                            {course.is_deleted && isAdmin && (
                              <DropdownMenuItem onSelect={() => handleRestore(course)}>
                                Restore
                              </DropdownMenuItem>
                            )}
                          </TableRowMore>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
        </>
      )}
    </div>
  );
}






