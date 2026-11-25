import React from "react";
import { Button } from "@/components/ui/button";
import { BookOpen, Users, Plus, X } from "lucide-react";

export function InstructorAssignmentModal({
  instructor,
  onClose,
  courses,
  cohorts,
  selectedCourseId,
  onSelectCourse,
  onAssignCourse,
  onRemoveCourse,
  selectedCohortId,
  onSelectCohort,
  onAssignCohort,
  onRemoveCohort,
  isAssigning,
}) {
  if (!instructor) return null;

  const displayName = instructor.first_name || instructor.last_name
    ? `${instructor.first_name} ${instructor.last_name}`
    : instructor.username;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 sm:p-4 animate-in fade-in duration-150 overflow-hidden">
      <div className="bg-background rounded-xl border border-border shadow-2xl w-full max-w-lg sm:max-w-xl overflow-hidden flex flex-col min-w-0 mx-auto">
        <div className="px-4 sm:px-5 py-3 sm:py-4 border-b border-border flex justify-between items-center bg-card min-w-0">
          <div className="min-w-0 flex-1 mr-3">
            <h3 className="font-bold text-base text-foreground truncate">
              Manage Assignments
            </h3>
            <p className="text-xs text-muted-foreground truncate" title={`${displayName} (${instructor.email})`}>
              {displayName} ({instructor.email})
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 hover:bg-muted rounded-md text-muted-foreground hover:text-foreground shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-5 space-y-5 overflow-y-auto overflow-x-hidden max-h-[75vh] min-w-0">
          {/* Section 1: Assign Course */}
          <div className="space-y-3 min-w-0">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
              <h4 className="font-semibold text-sm text-foreground">Assign to Course</h4>
            </div>
            <div className="flex gap-2 min-w-0">
              <select
                value={selectedCourseId}
                onChange={(e) => onSelectCourse(e.target.value)}
                className="flex-1 min-w-0 h-9 rounded-md border border-input bg-background px-3 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring truncate"
              >
                <option value="">Select Course to assign...</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
              <Button
                type="button"
                size="sm"
                disabled={!selectedCourseId || isAssigning}
                onClick={() => onAssignCourse(instructor.id, selectedCourseId)}
                className="shrink-0"
              >
                <Plus className="w-3.5 h-3.5 mr-1" /> Add
              </Button>
            </div>

            {/* Current Courses */}
            <div className="bg-muted/20 border border-border/70 rounded-lg p-2.5 min-w-0">
              <p className="text-[11px] font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">
                Currently Assigned Courses ({instructor.assigned_courses?.length || 0})
              </p>
              {instructor.assigned_courses?.length > 0 ? (
                <div className="flex flex-wrap gap-1.5 min-w-0">
                  {instructor.assigned_courses.map((c) => (
                    <span
                      key={c.id}
                      className="inline-flex items-center gap-1.5 bg-blue-600 text-white px-2.5 py-1 rounded-full text-xs font-semibold shadow-sm max-w-full min-w-0"
                    >
                      <span className="truncate max-w-[280px] sm:max-w-[420px]" title={c.title}>
                        {c.title}
                      </span>
                      <button
                        type="button"
                        onClick={() => onRemoveCourse(instructor.id, c.id)}
                        className="hover:text-red-200 ml-0.5 shrink-0"
                        title="Remove"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground italic">No courses assigned yet.</p>
              )}
            </div>
          </div>

          {/* Section 2: Assign Cohort */}
          <div className="space-y-3 pt-4 border-t border-border min-w-0">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <h4 className="font-semibold text-sm text-foreground">Assign to Cohort</h4>
            </div>
            <div className="flex gap-2 min-w-0">
              <select
                value={selectedCohortId}
                onChange={(e) => onSelectCohort(e.target.value)}
                className="flex-1 min-w-0 h-9 rounded-md border border-input bg-background px-3 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring truncate"
              >
                <option value="">Select Cohort to assign...</option>
                {cohorts.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.course_name || "Course"})
                  </option>
                ))}
              </select>
              <Button
                type="button"
                size="sm"
                disabled={!selectedCohortId || isAssigning}
                onClick={() => onAssignCohort(instructor.id, selectedCohortId)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white shrink-0"
              >
                <Plus className="w-3.5 h-3.5 mr-1" /> Add
              </Button>
            </div>

            {/* Current Cohorts */}
            <div className="bg-muted/20 border border-border/70 rounded-lg p-2.5 min-w-0">
              <p className="text-[11px] font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">
                Currently Instructed Cohorts ({instructor.instructed_cohorts?.length || 0})
              </p>
              {instructor.instructed_cohorts?.length > 0 ? (
                <div className="flex flex-wrap gap-1.5 min-w-0">
                  {instructor.instructed_cohorts.map((c) => (
                    <span
                      key={c.id}
                      className="inline-flex items-center gap-1.5 bg-emerald-600 text-white px-2.5 py-1 rounded-full text-xs font-semibold shadow-sm max-w-full min-w-0"
                    >
                      <span className="truncate max-w-[240px] sm:max-w-[380px]" title={c.name}>
                        {c.name}
                      </span>
                      <button
                        type="button"
                        onClick={() => onRemoveCohort(instructor.id, c.id)}
                        className="hover:text-red-200 ml-0.5 shrink-0"
                        title="Remove"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground italic">No cohorts assigned yet.</p>
              )}
            </div>
          </div>
        </div>

        <div className="px-5 py-3 border-t border-border bg-card flex justify-end">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Done
          </Button>
        </div>
      </div>
    </div>
  );
}
