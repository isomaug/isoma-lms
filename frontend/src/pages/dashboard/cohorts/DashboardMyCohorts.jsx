import React, { useState } from "react";
import useSWR from "swr";
import { swrFetcher } from "@/api/client/apiClient";
import DelayedSpinner from "@/components/notifications/DelayedSpinner";
import { Users, Calendar, MapPin, Mail, Settings, Crown, BookOpen, Eye } from "lucide-react";
import TeamManagementModal from "@/components/cohorts/TeamManagementModal";
import ViewMembersModal from "@/components/cohorts/ViewMembersModal";
import CohortTimetableModal from "@/components/cohorts/CohortTimetableModal";
import { Button } from "@/components/ui/button";

const CohortTable = ({ cohorts, isTeaching, setManagingCohort, setViewingMembers, setViewingTimetable }) => {
  if (!cohorts || cohorts.length === 0) return null;

  return (
    <div className="border rounded-lg bg-card shadow-sm overflow-hidden mb-8">
      <div className="overflow-x-hidden min-w-0">
        <table className="w-full text-left border-collapse text-sm">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              <th className="px-4 py-3 font-medium text-muted-foreground whitespace-nowrap">Cohort Details</th>
              <th className="px-4 py-3 font-medium text-muted-foreground whitespace-nowrap hidden sm:table-cell">Duration</th>
              <th className="px-4 py-3 font-medium text-muted-foreground whitespace-nowrap hidden md:table-cell">Location</th>
              <th className="px-4 py-3 font-medium text-muted-foreground whitespace-nowrap text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {cohorts.map((cohort) => (
              <tr key={cohort.id} className="border-b border-border transition-colors last:border-b-0 hover:bg-muted/30">
                <td className="px-4 py-4 min-w-[200px] max-w-[300px]">
                  <div className="flex flex-col gap-1">
                    <p className="font-semibold text-foreground truncate" title={cohort.name}>{cohort.name}</p>
                    <p className="text-xs text-muted-foreground line-clamp-1" title={cohort.course_name}>{cohort.course_name}</p>
                    <div className="flex items-center gap-2 mt-1 text-[10px] sm:text-xs text-muted-foreground">
                      <div className="flex items-center">
                        <Users className="w-3 h-3 mr-1 shrink-0" />
                        <span>{cohort.students?.length || 0} Students</span>
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 hidden sm:table-cell">
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Calendar className="w-4 h-4 mr-1 shrink-0" />
                    <span>{cohort.start_date} to {cohort.end_date}</span>
                  </div>
                </td>
                <td className="px-4 py-4 hidden md:table-cell text-xs text-muted-foreground">
                  {cohort.location ? (
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1 shrink-0" />
                      <span className="truncate">{cohort.location}</span>
                    </div>
                  ) : (
                    "-"
                  )}
                </td>
                <td className="px-4 py-4 text-right">
                  <div className="flex gap-2 justify-end flex-wrap">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setViewingTimetable(cohort)} 
                      title="View Timetable"
                      className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-500"
                    >
                      <Calendar className="w-4 h-4 sm:mr-2" />
                      <span className="hidden sm:inline">Timetable</span>
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setViewingMembers(cohort)} title="View Members">
                      <Eye className="w-4 h-4 sm:mr-2" />
                      <span className="hidden sm:inline">Members</span>
                    </Button>
                    {isTeaching && (
                      <Button variant="secondary" size="sm" onClick={() => setManagingCohort(cohort)} title="Manage Teams">
                        <Settings className="w-4 h-4 sm:mr-2" />
                        <span className="hidden sm:inline">Teams</span>
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default function DashboardMyCohorts({ type = "both" }) {
  const { data: cohorts, error, isLoading, mutate } = useSWR("/api/my-cohorts/", swrFetcher);
  const [managingCohort, setManagingCohort] = useState(null);
  const [viewingMembers, setViewingMembers] = useState(null);
  const [viewingTimetable, setViewingTimetable] = useState(null);

  const displayCohorts = Array.isArray(cohorts) ? cohorts : cohorts?.results || [];
  
  const teachingCohorts = displayCohorts.filter(c => c.roles?.includes("instructor") || c.is_teaching);
  const learningCohorts = displayCohorts.filter(c => c.roles?.includes("student"));

  if (isLoading && !cohorts) {
    return (
      <div className="flex justify-center items-center h-64">
        <DelayedSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 text-destructive">
        Failed to load your cohorts. Please try again later.
      </div>
    );
  }

  if (displayCohorts.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground bg-muted/20 border border-border rounded-xl">
        {type === "teaching" ? "You are not teaching any cohorts yet." : type === "learning" ? "You are not enrolled in any cohorts yet." : "You are not enrolled in or teaching any cohorts yet."}
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col space-y-8 pb-10">
      <div className="flex justify-between items-center">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
          {type === "teaching" ? "Cohorts I'm Teaching" : type === "learning" ? "Cohorts I'm Enrolled In" : "My Cohorts"}
        </h2>
      </div>

      {(type === "both" || type === "teaching") && (
        <div className="mb-12">
          {type === "both" && (
            <h3 className="text-xl font-bold mb-6 flex items-center border-b pb-2">
              <Users className="w-5 h-5 mr-2 text-primary" />
              Cohorts I'm Teaching
            </h3>
          )}
          {teachingCohorts.length > 0 ? (
            <CohortTable 
              cohorts={teachingCohorts} 
              isTeaching={true} 
              setManagingCohort={setManagingCohort}
              setViewingMembers={setViewingMembers}
              setViewingTimetable={setViewingTimetable}
            />
          ) : (
            <div className="text-center py-12 text-muted-foreground bg-muted/20 border border-border rounded-xl">
              You are not teaching any cohorts yet.
            </div>
          )}
        </div>
      )}

      {(type === "both" || type === "learning") && (
        <div className="mb-8">
          {type === "both" && (
            <h3 className="text-xl font-bold mb-6 flex items-center border-b pb-2">
              <BookOpen className="w-5 h-5 mr-2 text-primary" />
              Cohorts I'm Enrolled In
            </h3>
          )}
          {learningCohorts.length > 0 ? (
            <CohortTable 
              cohorts={learningCohorts} 
              isTeaching={false} 
              setManagingCohort={setManagingCohort}
              setViewingMembers={setViewingMembers}
              setViewingTimetable={setViewingTimetable}
            />
          ) : (
            <div className="text-center py-12 text-muted-foreground bg-muted/20 border border-border rounded-xl">
              You are not enrolled in any cohorts yet.
            </div>
          )}
        </div>
      )}

      {managingCohort && (
        <TeamManagementModal 
          cohort={managingCohort} 
          isOpen={!!managingCohort} 
          onClose={() => setManagingCohort(null)} 
          onRefresh={() => mutate()}
        />
      )}

      {viewingMembers && (
        <ViewMembersModal
          cohort={viewingMembers}
          isOpen={!!viewingMembers}
          onClose={() => setViewingMembers(null)}
        />
      )}

      {viewingTimetable && (
        <CohortTimetableModal
          cohort={viewingTimetable}
          isOpen={!!viewingTimetable}
          onClose={() => setViewingTimetable(null)}
          isInstructor={viewingTimetable.roles?.includes("instructor") || viewingTimetable.is_teaching}
          onScheduleUpdated={() => mutate()}
        />
      )}
    </div>
  );
}
