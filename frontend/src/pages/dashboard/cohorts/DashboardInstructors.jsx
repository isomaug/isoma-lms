import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RefreshCcw, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import DelayedSpinner from "@/components/notifications/DelayedSpinner";
import { useInstructorManagement } from "@/components/courses/instructors/useInstructorManagement";
import { InstructorTableRow } from "@/components/courses/instructors/InstructorTableRow";
import { InstructorAssignmentModal } from "@/components/courses/instructors/InstructorAssignmentModal";

export default function DashboardInstructors() {
  const {
    courses,
    cohorts,
    displayInstructors,
    isLoading,
    error,
    mutate,
    searchQuery,
    setSearchQuery,
    sortConfig,
    handleSort,
    assigningModalInstructor,
    setAssigningModalInstructor,
    selectedCourseId,
    setSelectedCourseId,
    selectedCohortId,
    setSelectedCohortId,
    isAssigning,
    handleRemoveRole,
    handleMessage,
    handleAssignCourse,
    handleRemoveCourse,
    handleAssignCohort,
    handleRemoveCohort,
  } = useInstructorManagement();

  const SortIcon = ({ columnKey }) => {
    if (sortConfig.key !== columnKey) return <ArrowUpDown className="w-3 h-3 ml-1 inline text-muted-foreground opacity-50" />;
    return sortConfig.direction === "asc" ? (
      <ArrowUp className="w-3 h-3 ml-1 inline text-primary" />
    ) : (
      <ArrowDown className="w-3 h-3 ml-1 inline text-primary" />
    );
  };

  if (isLoading) return <DelayedSpinner />;
  if (error) return <div className="p-8 text-center text-red-500">Error loading instructors.</div>;

  return (
    <div className="h-full flex flex-col space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">Instructors</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Manage teaching staff and assign them to courses and cohorts.</p>
        </div>
        <button
          onClick={() => mutate()}
          className="inline-flex items-center justify-center rounded-md text-sm font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3"
        >
          <RefreshCcw className="w-4 h-4 mr-2" /> Refresh
        </button>
      </div>

      <div className="flex gap-3">
        <Input
          placeholder="Search by name or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-md"
        />
      </div>

      <div className="rounded-md border bg-card overflow-hidden flex-1 flex flex-col">
        <div className="overflow-x-auto custom-scrollbar flex-1 min-w-0">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-muted/50 sticky top-0 z-10 whitespace-nowrap">
              <tr>
                <th className="px-4 py-3 font-medium cursor-pointer hover:bg-muted" onClick={() => handleSort("first_name")}>
                  Name <SortIcon columnKey="first_name" />
                </th>
                <th className="px-4 py-3 font-medium cursor-pointer hover:bg-muted" onClick={() => handleSort("email")}>
                  Email <SortIcon columnKey="email" />
                </th>
                <th className="px-4 py-3 font-medium">Assigned Courses</th>
                <th className="px-4 py-3 font-medium">Instructed Cohorts</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {displayInstructors.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-4 py-8 text-center text-muted-foreground">
                    No instructors found.
                  </td>
                </tr>
              ) : (
                displayInstructors.map((inst) => (
                  <InstructorTableRow
                    key={inst.id}
                    instructor={inst}
                    onOpenModal={setAssigningModalInstructor}
                    onRemoveCourse={handleRemoveCourse}
                    onRemoveCohort={handleRemoveCohort}
                    onMessage={handleMessage}
                    onRemoveRole={handleRemoveRole}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <InstructorAssignmentModal
        instructor={assigningModalInstructor}
        onClose={() => setAssigningModalInstructor(null)}
        courses={courses}
        cohorts={cohorts}
        selectedCourseId={selectedCourseId}
        onSelectCourse={setSelectedCourseId}
        onAssignCourse={handleAssignCourse}
        onRemoveCourse={handleRemoveCourse}
        selectedCohortId={selectedCohortId}
        onSelectCohort={setSelectedCohortId}
        onAssignCohort={handleAssignCohort}
        onRemoveCohort={handleRemoveCohort}
        isAssigning={isAssigning}
      />
    </div>
  );
}
