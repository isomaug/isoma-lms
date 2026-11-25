import React from "react";
import { Button } from "@/components/ui/button";
import { X, BookOpen, Mail, Trash } from "lucide-react";

export function InstructorTableRow({
  instructor: inst,
  onOpenModal,
  onRemoveCourse,
  onRemoveCohort,
  onMessage,
  onRemoveRole,
}) {
  const assignedCourses = inst.assigned_courses || [];
  const instructedCohorts = inst.instructed_cohorts || [];
  const firstCourse = assignedCourses[0];
  const excessCourses = assignedCourses.slice(1);
  const firstCohort = instructedCohorts[0];
  const excessCohorts = instructedCohorts.slice(1);

  return (
    <tr className="hover:bg-muted/50 transition-colors whitespace-nowrap h-12">
      <td className="px-4 py-2.5 font-medium whitespace-nowrap">
        {inst.first_name || inst.last_name ? `${inst.first_name} ${inst.last_name}` : inst.username}
      </td>
      <td className="px-4 py-2.5 text-muted-foreground whitespace-nowrap">{inst.email}</td>

      {/* Assigned Courses Column */}
      <td className="px-4 py-2.5 whitespace-nowrap">
        <div className="flex items-center gap-1.5 whitespace-nowrap">
          {firstCourse ? (
            <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold bg-blue-600 text-white shadow-sm shrink-0 max-w-[230px]">
              <span className="truncate" title={firstCourse.title}>
                {firstCourse.title}
              </span>
              <button
                type="button"
                onClick={() => onRemoveCourse(inst.id, firstCourse.id)}
                className="hover:text-red-200 rounded-full p-0.5 transition-colors shrink-0 ml-0.5"
                title={`Remove ${firstCourse.title}`}
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ) : (
            <span className="text-muted-foreground italic text-xs">No courses</span>
          )}
        </div>
      </td>

      {/* Instructed Cohorts Column */}
      <td className="px-4 py-2.5 whitespace-nowrap">
        <div className="flex items-center gap-1.5 whitespace-nowrap">
          {firstCohort ? (
            <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold bg-emerald-600 text-white shadow-sm shrink-0 max-w-[190px]">
              <span className="truncate" title={firstCohort.name}>
                {firstCohort.name}
              </span>
              <button
                type="button"
                onClick={() => onRemoveCohort(inst.id, firstCohort.id)}
                className="hover:text-red-200 rounded-full p-0.5 transition-colors shrink-0 ml-0.5"
                title={`Remove ${firstCohort.name}`}
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ) : (
            <span className="text-muted-foreground italic text-xs">No cohorts</span>
          )}
        </div>
      </td>

      {/* Actions Column */}
      <td className="px-4 py-2.5 text-right whitespace-nowrap">
        <div className="flex items-center justify-end gap-1.5 whitespace-nowrap">
          {excessCourses.length > 0 && (
            <button
              type="button"
              onClick={() => onOpenModal(inst)}
              className="inline-flex items-center gap-0.5 px-2 py-1 rounded text-xs font-bold bg-blue-600 text-white shadow-sm hover:bg-blue-700 transition"
              title={`View and manage all ${assignedCourses.length} assigned courses`}
            >
              +{excessCourses.length} more
            </button>
          )}
          {excessCohorts.length > 0 && (
            <button
              type="button"
              onClick={() => onOpenModal(inst)}
              className="inline-flex items-center gap-0.5 px-2 py-1 rounded text-xs font-bold bg-emerald-600 text-white shadow-sm hover:bg-emerald-700 transition"
              title={`View and manage all ${instructedCohorts.length} instructed cohorts`}
            >
              +{excessCohorts.length} more
            </button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenModal(inst)}
            title="Manage Assignments"
            className="h-8 text-xs font-semibold text-primary hover:bg-primary/10"
          >
            <BookOpen className="w-3.5 h-3.5 mr-1" />
            Assign
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onMessage(inst.id)}
            title="Message Instructor"
            className="h-8 w-8 p-0"
          >
            <Mail className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onRemoveRole(inst.id)}
            title="Remove Instructor Role"
            className="h-8 w-8 p-0"
          >
            <Trash className="w-3.5 h-3.5" />
          </Button>
        </div>
      </td>
    </tr>
  );
}
