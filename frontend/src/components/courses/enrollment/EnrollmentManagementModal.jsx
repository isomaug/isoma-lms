import { SearchableSelect } from "@/components/ui/SearchableSelect";
import React, { useState } from "react";
import useSWR from "swr";
import { apiFetch, swrFetcher } from "@/api/client/apiClient";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Trash2, BookOpen, UserPlus, Pencil, Check, X, GraduationCap } from "lucide-react";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { TableRowMore, TableRowMoreField } from "@/components/ui/TableRowMore";
import DelayedSpinner from "@/components/notifications/DelayedSpinner";

export default function EnrollmentManagementModal({ isOpen, onClose, user }) {
  const [selectedCourse, setSelectedCourse] = useState("");
  const [maxModules, setMaxModules] = useState("");
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editMaxModules, setEditMaxModules] = useState("");

  const {
    data: enrollments,
    mutate: mutateEnrollments,
    error: enrollError,
    isLoading: loadingEnrollments,
  } = useSWR(
    user && isOpen ? `/api/admin/enrollments/?user=${user.id}` : null,
    swrFetcher
  );

  const { data: coursesData, isLoading: loadingCourses } = useSWR(
    isOpen ? "/api/admin/courses/" : null,
    swrFetcher
  );

  const allCourses = Array.isArray(coursesData) ? coursesData : coursesData?.results || [];
  const enrolledCourseIds = new Set((enrollments || []).map((e) => String(e.course)));
  // Only show courses not yet enrolled
  const availableCourses = allCourses.filter((c) => !enrolledCourseIds.has(String(c.id)));

  const handleEnroll = async (e) => {
    e.preventDefault();
    if (!selectedCourse) {
      toast.error("Please select a course to enroll.");
      return;
    }
    setIsEnrolling(true);
    try {
      const payload = { user: user.id, course: selectedCourse };
      if (maxModules && !isNaN(maxModules) && parseInt(maxModules, 10) > 0) {
        payload.max_modules = parseInt(maxModules, 10);
      }
      await apiFetch("/api/admin/enrollments/", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      toast.success("Enrolled successfully.");
      setSelectedCourse("");
      setMaxModules("");
      mutateEnrollments();
    } catch (err) {
      toast.error(err?.message || "Failed to enroll user.");
    } finally {
      setIsEnrolling(false);
    }
  };

  const handleUnenroll = async (enrollmentId) => {
    if (!window.confirm("Remove this enrollment? This cannot be undone.")) return;
    try {
      await apiFetch(`/api/admin/enrollments/${enrollmentId}/`, { method: "DELETE" });
      toast.success("Enrollment removed.");
      mutateEnrollments();
    } catch (err) {
      toast.error(err?.message || "Failed to remove enrollment.");
    }
  };

  const startEdit = (enrollment) => {
    setEditingId(enrollment.id);
    setEditMaxModules(enrollment.max_modules != null ? String(enrollment.max_modules) : "");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditMaxModules("");
  };

  const saveEdit = async (enrollmentId) => {
    try {
      const payload = {};
      if (editMaxModules === "" || editMaxModules === null) {
        payload.max_modules = null;
      } else if (!isNaN(editMaxModules) && parseInt(editMaxModules, 10) > 0) {
        payload.max_modules = parseInt(editMaxModules, 10);
      } else {
        toast.error("Enter a valid number, or leave blank for full access.");
        return;
      }
      await apiFetch(`/api/admin/enrollments/${enrollmentId}/`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
      toast.success("Access updated.");
      cancelEdit();
      mutateEnrollments();
    } catch (err) {
      toast.error(err?.message || "Failed to update enrollment.");
    }
  };

  const enrollmentList = enrollments || [];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      {/* Wide modal - same feel as the Users table */}
      <DialogContent className="max-w-4xl w-full bg-card flex flex-col p-0 gap-0 overflow-hidden max-h-[90vh]">
        {/* ── Header ── */}
        <DialogHeader className="px-6 pt-5 pb-4 border-b border-border shrink-0">
          <DialogTitle className="flex items-center gap-2 text-foreground text-lg">
            <BookOpen className="w-5 h-5 text-primary" />
            Enrollments
            {user && (
              <span className="text-muted-foreground font-normal text-sm ml-1">
                - {user.full_name || user.username}
                <span className="text-xs ml-1 opacity-70">({user.email})</span>
              </span>
            )}
          </DialogTitle>
          <DialogDescription className="text-xs mt-0.5">
            {enrollmentList.length} active enrollment{enrollmentList.length !== 1 ? "s" : ""}
          </DialogDescription>
        </DialogHeader>

        {/* ── Enroll form bar ── */}
        <div className="px-6 py-3 bg-secondary/30 border-b border-border shrink-0">
          <form onSubmit={handleEnroll} className="flex flex-wrap items-center gap-2">
            <SearchableSelect
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              disabled={loadingCourses}
              className="flex-1 min-w-[200px] h-9 rounded-md border border-input bg-background px-3 py-1 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
            >
              <option value="">
                {loadingCourses ? "Loading courses…" : availableCourses.length === 0 ? "All courses enrolled" : "Select course to enroll…"}
              </option>
              {availableCourses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </SearchableSelect>

            <Input
              type="number"
              placeholder="Max modules (blank = full)"
              value={maxModules}
              onChange={(e) => setMaxModules(e.target.value)}
              min="1"
              className="w-48 h-9 text-sm text-foreground"
              title="Leave blank for full course access. Set a number to limit to the first N modules (trial)."
            />

            <Button type="submit" size="sm" disabled={isEnrolling || loadingCourses || !selectedCourse}>
              <UserPlus className="w-4 h-4 mr-1.5" />
              {isEnrolling ? "Enrolling…" : "Enroll"}
            </Button>
          </form>
          <p className="text-xs text-muted-foreground mt-1.5">
            Max modules: leave blank for full access, or enter a number for trial (first N modules only).
          </p>
        </div>

        {/* ── Enrollments table ── */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden min-h-0">
          {loadingEnrollments ? (
            <div className="flex items-center justify-center py-16">
              <DelayedSpinner />
            </div>
          ) : enrollError ? (
            <div className="px-6 py-8 text-center text-red-500 text-sm">Failed to load enrollments.</div>
          ) : enrollmentList.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-3">
              <GraduationCap className="w-10 h-10 opacity-20" />
              <p className="font-medium text-sm">No enrollments yet</p>
              <p className="text-xs">Use the form above to enroll this user in a course.</p>
            </div>
          ) : (
            <table className="w-full table-fixed text-sm text-left border-collapse">
              <thead className="text-xs text-muted-foreground uppercase bg-secondary/60 sticky top-0 z-10 shadow-sm">
                <tr>
                  <th className="w-10 px-3 py-3 font-semibold">#</th>
                  <th className="px-3 py-3 font-semibold">Course</th>
                  <th className="hidden px-3 py-3 font-semibold md:table-cell">Enrolled</th>
                  <th className="w-20 px-3 py-3 font-semibold">Access</th>
                  <th className="hidden px-3 py-3 font-semibold lg:table-cell">Limit</th>
                  <th className="w-10 px-1 py-3 font-semibold text-right">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {enrollmentList.map((enrollment, idx) => (
                  <tr key={enrollment.id} className="hover:bg-secondary/20 transition-colors">
                    {/* # */}
                    <td className="px-3 py-3 text-muted-foreground text-xs tabular-nums">{idx + 1}</td>

                    {/* Course */}
                    <td className="min-w-0 px-3 py-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-7 h-7 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20">
                          <BookOpen className="w-3.5 h-3.5" />
                        </div>
                        <span className="font-medium text-foreground truncate" title={enrollment.course_name}>{enrollment.course_name}</span>
                      </div>
                      {editingId === enrollment.id && (
                        <div className="mt-2 flex items-center gap-1.5 lg:hidden">
                          <Input
                            type="number"
                            placeholder="blank = full"
                            value={editMaxModules}
                            onChange={(e) => setEditMaxModules(e.target.value)}
                            min="1"
                            className="h-7 w-full min-w-0 text-xs text-foreground"
                            autoFocus
                          />
                          <Button size="sm" className="h-7 px-2 shrink-0" onClick={() => saveEdit(enrollment.id)} title="Save">
                            <Check className="w-3 h-3" />
                          </Button>
                          <Button size="sm" variant="outline" className="h-7 px-2 shrink-0" onClick={cancelEdit} title="Cancel">
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      )}
                    </td>

                    {/* Date */}
                    <td className="hidden px-3 py-3 text-muted-foreground tabular-nums md:table-cell">
                      {new Date(enrollment.enrolled_at).toLocaleDateString(undefined, {
                        day: "2-digit", month: "short", year: "numeric",
                      })}
                    </td>

                    {/* Access badge */}
                    <td className="px-3 py-3">
                      {enrollment.max_modules != null ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                          Trial
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                          Full
                        </span>
                      )}
                    </td>

                    {/* Module limit - inline editable */}
                    <td className="hidden px-3 py-3 lg:table-cell">
                      {editingId === enrollment.id ? (
                        <div className="flex items-center gap-1.5 min-w-0">
                          <Input
                            type="number"
                            placeholder="blank = full"
                            value={editMaxModules}
                            onChange={(e) => setEditMaxModules(e.target.value)}
                            min="1"
                            className="h-7 w-full min-w-0 text-xs text-foreground"
                            autoFocus
                          />
                          <Button size="sm" className="h-7 px-2 shrink-0" onClick={() => saveEdit(enrollment.id)} title="Save">
                            <Check className="w-3 h-3" />
                          </Button>
                          <Button size="sm" variant="outline" className="h-7 px-2 shrink-0" onClick={cancelEdit} title="Cancel">
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">
                          {enrollment.max_modules != null ? `${enrollment.max_modules} module${enrollment.max_modules !== 1 ? "s" : ""}` : "-"}
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-1 py-3 text-right">
                      <TableRowMore label="Enrollment actions" contentClassName="w-52">
                        <TableRowMoreField label="Enrolled" className="md:hidden">
                          {new Date(enrollment.enrolled_at).toLocaleDateString(undefined, {
                            day: "2-digit", month: "short", year: "numeric",
                          })}
                        </TableRowMoreField>
                        <TableRowMoreField label="Module limit" className="lg:hidden">
                          {enrollment.max_modules != null ? `${enrollment.max_modules} module${enrollment.max_modules !== 1 ? "s" : ""}` : "Full access"}
                        </TableRowMoreField>
                        {editingId !== enrollment.id && (
                          <DropdownMenuItem onSelect={() => startEdit(enrollment)}>
                            <Pencil className="w-4 h-4" /> Edit limit
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onSelect={() => handleUnenroll(enrollment.id)}
                        >
                          <Trash2 className="w-4 h-4" /> Remove
                        </DropdownMenuItem>
                      </TableRowMore>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* ── Footer count ── */}
        {enrollmentList.length > 0 && (
          <div className="border-t border-border px-5 py-2 text-xs text-muted-foreground bg-secondary/20 shrink-0">
            {enrollmentList.length} enrollment{enrollmentList.length !== 1 ? "s" : ""} · {availableCourses.length} course{availableCourses.length !== 1 ? "s" : ""} available to enroll
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
