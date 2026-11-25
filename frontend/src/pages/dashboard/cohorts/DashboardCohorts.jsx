import { SearchableSelect } from "@/components/ui/SearchableSelect";
import React, { useState, useEffect } from "react";
import useSWR from "swr";
import { apiFetch, swrFetcher } from "@/api/client/apiClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Edit, Trash, Plus, Users, Calendar, MessageSquare, RefreshCcw, UserMinus, ArrowUpDown, ArrowUp, ArrowDown, Crown, ChevronUp, ChevronDown, Settings, Eye } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import DelayedSpinner from "@/components/notifications/DelayedSpinner";
import StudentBulkSelector from "@/components/cohorts/StudentBulkSelector";
import { NameTagsPrintPreview } from "@/components/cohorts/NameTagsPrintPreview";
import AttendanceModal from "@/components/courses/enrollment/AttendanceModal";
import ResetProgressModal from "@/components/courses/viewer/ResetProgressModal";
import TeamManagementModal from "@/components/cohorts/TeamManagementModal";
import ViewMembersModal from "@/components/cohorts/ViewMembersModal";
import CohortTimetableModal from "@/components/cohorts/CohortTimetableModal";
import ModernDatePicker from "@/components/ui/ModernDatePicker";
import ModernTimePicker from "@/components/ui/ModernTimePicker";
import { DAY_NAMES, formatHolidayChip, holidayDate, holidayLabel, normalizeHolidays } from "@/utils/scheduleUtils";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, BorderStyle } from "docx";
import { saveAs } from "file-saver";
import { Download, FileText, FileSpreadsheet, Printer, Check, X, Maximize2, Minimize2, MoreHorizontal, GraduationCap, AlertTriangle, AlertCircle, RotateCcw, Archive, Award } from "lucide-react";

export default function DashboardCohorts() {
  const { data: cohorts, error, isLoading, mutate } = useSWR("/api/admin/cohorts/", swrFetcher);
  const { data: courses } = useSWR("/api/courses/", swrFetcher);
  const { data: usersData } = useSWR("/api/admin/users/", swrFetcher);
  const { data: orgsData } = useSWR("/api/admin/organizations/", swrFetcher);
  
  const users = Array.isArray(usersData) ? usersData : usersData?.results || [];
  const organizations = Array.isArray(orgsData) ? orgsData : orgsData?.results || [];
  
  const [editingCohort, setEditingCohort] = useState(null);
  const [managingCohort, setManagingCohort] = useState(null);
  const [managingInstructorsCohort, setManagingInstructorsCohort] = useState(null);
  const [viewingTimetableCohort, setViewingTimetableCohort] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [orgFilter, setOrgFilter] = useState("ALL");
  const [courseFilter, setCourseFilter] = useState("ALL");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeTab, setActiveTab] = useState("active"); // "active" | "closed"
  const [cohortToClose, setCohortToClose] = useState(null);
  const [isClosingCohort, setIsClosingCohort] = useState(false);
  const [isRestoringCohort, setIsRestoringCohort] = useState(false);

  // Cohort promotion state
  const [cohortToPromote, setCohortToPromote] = useState(null);
  const [promoteName, setPromoteName] = useState("");
  const [promoteStartDate, setPromoteStartDate] = useState("");
  const [promoteEndDate, setPromoteEndDate] = useState("");
  const [isPromoting, setIsPromoting] = useState(false);

  useEffect(() => {
    if (cohortToPromote) {
      let defaultName = cohortToPromote.name || "";
      const stageMatch = defaultName.match(/Stage\s*(\d+)/i);
      if (stageMatch) {
        defaultName = defaultName.replace(/Stage\s*\d+/i, `Stage ${parseInt(stageMatch[1]) + 1}`);
      } else {
        const gradeMatch = defaultName.match(/Grade\s*(\d+)/i);
        if (gradeMatch) {
          defaultName = defaultName.replace(/Grade\s*\d+/i, `Grade ${parseInt(gradeMatch[1]) + 1}`);
        } else {
          defaultName = `${defaultName} (Stage 2)`;
        }
      }
      setPromoteName(defaultName);
      setPromoteStartDate("");
      setPromoteEndDate("");
    }
  }, [cohortToPromote]);

  const handleConfirmPromote = async () => {
    if (!cohortToPromote) return;
    setIsPromoting(true);
    try {
      const res = await apiFetch(`/api/admin/cohorts/${cohortToPromote.id}/promote/`, {
        method: "POST",
        body: JSON.stringify({
          name: promoteName,
          start_date: promoteStartDate || undefined,
          end_date: promoteEndDate || undefined,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to promote cohort");
      }
      const data = await res.json();
      toast.success(data.message || "Cohort successfully promoted!");
      setCohortToPromote(null);
      await mutate();
    } catch (err) {
      toast.error(err.message || "Failed to promote cohort");
    } finally {
      setIsPromoting(false);
    }
  };

  const handleConfirmCloseCohort = async () => {
    if (!cohortToClose) return;
    setIsClosingCohort(true);
    try {
      let res = await apiFetch(`/api/admin/cohorts/${cohortToClose.id}/close/`, { method: "POST" });
      if (!res.ok) {
        res = await apiFetch(`/api/admin/cohorts/${cohortToClose.id}/`, {
          method: "PATCH",
          body: JSON.stringify({ is_closed: true }),
        });
      }
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || errData.detail || errData.message || `Failed to close cohort (${res.status})`);
      }
      toast.success(`Cohort "${cohortToClose.name}" has been closed and moved to Closed Cohorts.`);
      setCohortToClose(null);
      setActiveTab("closed");
      await mutate();
    } catch (err) {
      toast.error(err.message || "Failed to close cohort.");
    } finally {
      setIsClosingCohort(false);
    }
  };

  const handleRestoreCohort = async (cohortItem) => {
    setIsRestoringCohort(true);
    try {
      let res = await apiFetch(`/api/admin/cohorts/${cohortItem.id}/restore/`, { method: "POST" });
      if (!res.ok) {
        res = await apiFetch(`/api/admin/cohorts/${cohortItem.id}/`, {
          method: "PATCH",
          body: JSON.stringify({ is_closed: false }),
        });
      }
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || errData.detail || errData.message || `Failed to restore cohort (${res.status})`);
      }
      toast.success(`Cohort "${cohortItem.name}" restored successfully with all its data!`);
      setActiveTab("active");
      await mutate();
    } catch (err) {
      toast.error(err.message || "Failed to restore cohort.");
    } finally {
      setIsRestoringCohort(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this cohort?")) return;
    await apiFetch(`/api/admin/cohorts/${id}/`, { method: "DELETE" });
    mutate();
  };

  const getCourseName = (id) => {
    if (!courses) return id;
    const course = courses.results?.find(c => c.id === id) || courses.find?.(c => c.id === id);
    return course ? course.title : id;
  };

  const getOrgName = (id) => {
    if (!id || !organizations) return null;
    const org = organizations.find(o => o.id === id);
    return org ? org.name : null;
  };

  const rawCohorts = Array.isArray(cohorts) ? cohorts : cohorts?.results || [];
  const allActiveCohorts = rawCohorts.filter(c => !c.is_closed);
  const allClosedCohorts = rawCohorts.filter(c => !!c.is_closed);

  const displayCohorts = React.useMemo(() => {
    let result = rawCohorts.filter((cohort) => {
      if (activeTab === "active" && cohort.is_closed) return false;
      if (activeTab === "closed" && !cohort.is_closed) return false;

      const matchesSearch = cohort.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesOrg = orgFilter === "ALL" || String(cohort.organization) === String(orgFilter);
      const matchesCourse = courseFilter === "ALL" || String(cohort.course) === String(courseFilter);
      return matchesSearch && matchesOrg && matchesCourse;
    });

    if (sortConfig.key) {
      result.sort((a, b) => {
        let aVal = a[sortConfig.key];
        let bVal = b[sortConfig.key];

        if (sortConfig.key === 'courseName') {
          aVal = getCourseName(a.course);
          bVal = getCourseName(b.course);
        } else if (sortConfig.key === 'dates') {
          aVal = a.start_date || '';
          bVal = b.start_date || '';
        }

        if (!aVal) aVal = "";
        if (!bVal) bVal = "";

        if (typeof aVal === 'string') aVal = aVal.toLowerCase();
        if (typeof bVal === 'string') bVal = bVal.toLowerCase();

        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [rawCohorts, searchQuery, orgFilter, courseFilter, sortConfig]);

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const SortIcon = ({ columnKey }) => {
    if (sortConfig.key !== columnKey) return <ArrowUpDown className="w-3 h-3 ml-1 inline text-muted-foreground opacity-50" />;
    return sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3 ml-1 inline text-primary" /> : <ArrowDown className="w-3 h-3 ml-1 inline text-primary" />;
  };

  if (editingCohort !== null) {
    return (
      <CohortEditor
        cohort={editingCohort}
        courses={courses?.results || courses || []}
        users={users}
        organizations={organizations}
        onSave={() => { setEditingCohort(null); mutate(); }}
        onCancel={() => setEditingCohort(null)}
      />
    );
  }

  if (managingInstructorsCohort !== null) {
    return (
      <CohortInstructorManager 
        cohort={managingInstructorsCohort} 
        courseName={getCourseName(managingInstructorsCohort.course)}
        users={users}
        onClose={() => { setManagingInstructorsCohort(null); mutate(); }} 
      />
    );
  }

  if (managingCohort !== null) {
    return (
      <CohortStudentManager 
        cohort={managingCohort} 
        courseName={getCourseName(managingCohort.course)}
        users={users}
        onClose={() => { setManagingCohort(null); mutate(); }} 
      />
    );
  }

  return (
    <div className="h-full flex flex-col space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">Cohorts</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Manage active learning cohorts, review historical cohorts, and restore closed cohorts.</p>
        </div>
        <Button onClick={() => setEditingCohort({})}>
          <Plus className="w-4 h-4 mr-2" /> New Cohort
        </Button>
      </div>

      {/* Tabs: Active vs Closed Cohorts */}
      <div className="flex items-center gap-2 border-b border-border pb-1">
        <button
          type="button"
          onClick={() => setActiveTab("active")}
          className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-3.5 py-1.5 sm:py-2 text-[10px] sm:text-sm font-medium rounded-t-md transition-colors relative ${
            activeTab === "active"
              ? "text-primary border-b-2 border-primary bg-primary/5 font-semibold"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
          }`}
        >
          <span>Active Cohorts</span>
          <span className={`text-[9px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full ${
            activeTab === "active" ? "bg-primary text-primary-foreground font-bold" : "bg-muted text-muted-foreground"
          }`}>
            {allActiveCohorts.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("closed")}
          className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-3.5 py-1.5 sm:py-2 text-[10px] sm:text-sm font-medium rounded-t-md transition-colors relative ${
            activeTab === "closed"
              ? "text-destructive border-b-2 border-destructive bg-destructive/5 font-semibold"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
          }`}
        >
          <GraduationCap className="w-3 h-3 sm:w-4 sm:h-4" />
          <span>Closed Cohorts</span>
          <span className={`text-[9px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full ${
            activeTab === "closed" ? "bg-destructive text-destructive-foreground font-bold" : "bg-muted text-muted-foreground"
          }`}>
            {allClosedCohorts.length}
          </span>
        </button>
      </div>
      
      {/* Search and Filters */}
      <div className="flex flex-row w-full gap-1.5 sm:gap-3 pb-2 items-center">
        <Input 
          placeholder="Search..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-1/3 sm:w-auto sm:flex-1 h-8 sm:h-10 text-[10px] sm:text-sm px-1.5 sm:px-3 shrink-0"
        />
        <SearchableSelect 
          className="flex h-8 sm:h-10 w-1/3 sm:w-[220px] shrink-0 rounded-md border border-input bg-background px-1.5 sm:px-3 py-1 sm:py-2 text-[10px] sm:text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          value={orgFilter}
          onChange={(e) => setOrgFilter(e.target.value)}
        >
          <option value="ALL">All Organizations</option>
          {organizations.map(org => (
            <option key={org.id} value={org.id}>{org.name}</option>
          ))}
        </SearchableSelect>
        <SearchableSelect 
          className="flex h-8 sm:h-10 w-1/3 sm:w-[220px] shrink-0 rounded-md border border-input bg-background px-1.5 sm:px-3 py-1 sm:py-2 text-[10px] sm:text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          value={courseFilter}
          onChange={(e) => setCourseFilter(e.target.value)}
        >
          <option value="ALL">All Courses</option>
          {(courses?.results || courses || []).map(course => (
            <option key={course.id} value={course.id}>{course.title}</option>
          ))}
        </SearchableSelect>
      </div>

      <div className={isFullscreen ? "fixed inset-0 z-50 bg-background flex flex-col p-4 sm:p-6" : "border rounded-lg overflow-hidden bg-card shadow-sm flex flex-col flex-1 min-h-0 relative group"}>
        {isFullscreen && (
          <div className="flex justify-between items-center mb-4 shrink-0">
            <h3 className="text-xl font-bold tracking-tight">Cohorts</h3>
            <Button variant="ghost" size="icon" onClick={() => setIsFullscreen(false)}>
              <Minimize2 className="w-5 h-5" />
            </Button>
          </div>
        )}
        {!isFullscreen && (
          <div className="absolute top-1.5 right-1.5 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
             <Button variant="outline" size="icon" className="h-7 w-7 bg-background shadow-sm" onClick={() => setIsFullscreen(true)} title="Fullscreen Table">
               <Maximize2 className="w-3.5 h-3.5 text-muted-foreground" />
             </Button>
          </div>
        )}
        <div className="overflow-y-auto overflow-x-hidden custom-scrollbar flex-1 min-w-0">
        <table className="w-full text-sm text-left table-fixed break-words">
          <thead className="bg-secondary text-muted-foreground border-b sticky top-0 z-10">
            <tr>
              <th className="px-3 py-3 font-semibold cursor-pointer select-none w-1/3 sm:w-1/4" onClick={() => handleSort('name')}>
                Cohort Name <SortIcon columnKey="name" />
              </th>
              <th className="px-3 py-3 font-semibold hidden sm:table-cell cursor-pointer select-none w-1/4" onClick={() => handleSort('courseName')}>
                Course <SortIcon columnKey="courseName" />
              </th>
              <th className="px-3 py-3 font-semibold hidden md:table-cell w-1/4">
                Organization / Details
              </th>
              <th className="px-3 py-3 font-semibold hidden lg:table-cell cursor-pointer select-none w-28" onClick={() => handleSort('dates')}>
                Dates <SortIcon columnKey="dates" />
              </th>
              <th className="px-3 py-3 font-semibold text-right w-24 sm:w-36">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && !cohorts && !error ? (
              <tr><td colSpan="5" className="text-center py-12"><DelayedSpinner /></td></tr>
            ) : error ? (
              <tr><td colSpan="5" className="text-center py-12 text-destructive">Failed to load cohorts: {error.message || 'Unknown error'}</td></tr>
            ) : displayCohorts.length === 0 ? (
              <tr><td colSpan="5" className="text-center py-6">
                {activeTab === "closed" ? "No closed cohorts found." : "No active cohorts found."}
              </td></tr>
            ) : (
              displayCohorts.map((cohort) => (
                <tr key={cohort.id} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                  <td className="px-3 py-3 font-medium align-top">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span>{cohort.name}</span>
                      {cohort.current_term && (
                        <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-bold bg-primary/10 text-primary border border-primary/20 uppercase">
                          {cohort.current_term.replace('_', ' ')}
                        </span>
                      )}
                      {cohort.is_closed && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-destructive/10 text-destructive border border-destructive/20">
                          Closed
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-3 hidden sm:table-cell align-top">{getCourseName(cohort.course)}</td>
                  <td className="px-3 py-3 hidden md:table-cell align-top">
                    {cohort.organization ? (
                      <div className="flex flex-col">
                        <span className="font-medium text-sm leading-tight">{getOrgName(cohort.organization)}</span>
                        {(cohort.academic_year || cohort.stream) && (
                          <span className="text-xs text-muted-foreground mt-0.5">
                            {cohort.academic_year} {cohort.stream && `• Stream ${cohort.stream}`}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground italic">Public Cohort</span>
                    )}
                  </td>
                  <td className="px-3 py-3 text-muted-foreground text-xs hidden lg:table-cell align-top">
                    {cohort.start_date} to {cohort.end_date}
                  </td>
                  <td className="px-3 py-3 text-right align-top">
                    <div className="flex justify-end gap-1 flex-nowrap items-center">
                      {!cohort.is_closed && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-primary hover:text-primary hover:bg-primary/10" 
                          onClick={() => setCohortToPromote(cohort)} 
                          title="Promote Cohort to Next Stage"
                        >
                          <Award className="w-4 h-4 text-primary" />
                        </Button>
                      )}
                      {cohort.is_closed ? (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-8 text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/10 hover:text-emerald-700 font-medium px-2.5" 
                          onClick={() => handleRestoreCohort(cohort)}
                          disabled={isRestoringCohort}
                          title="Restore Cohort with all students and historical data"
                        >
                          <RotateCcw className="w-3.5 h-3.5 mr-1" /> Restore
                        </Button>
                      ) : (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-destructive/80 hover:text-destructive hover:bg-destructive/10" 
                          onClick={() => setCohortToClose(cohort)} 
                          title="Close Cohort"
                        >
                          <GraduationCap className="w-4 h-4 text-destructive" />
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-emerald-600 hover:text-emerald-500 hover:bg-emerald-500/10" onClick={() => setViewingTimetableCohort(cohort)} title="View / Edit Timetable">
                        <Calendar className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setManagingCohort(cohort)} title="Manage Students">
                        <Users className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditingCohort(cohort)} title="Edit Cohort">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDelete(cohort.id)} title="Delete Cohort">
                        <Trash className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        </div>
      </div>

      {/* Red Confirmation Dialog for Closing Cohort */}
      <Dialog open={!!cohortToClose} onOpenChange={(open) => !open && !isClosingCohort && setCohortToClose(null)}>
        <DialogContent className="sm:max-w-md border-border shadow-md font-['Lexend',sans-serif]">
          <div className="flex flex-col items-center text-center pt-2">
            <div className="w-14 h-14 rounded-full bg-rose-600 text-white flex items-center justify-center mb-3">
              <AlertTriangle className="w-7 h-7 text-white" />
            </div>
            <DialogHeader className="space-y-1">
              <DialogTitle className="text-xl font-bold text-rose-700 dark:text-rose-400">
                Close Cohort Confirmation
              </DialogTitle>
            </DialogHeader>
          </div>

          <div className="space-y-4 pt-2">
            <div className="bg-muted border border-border rounded-lg p-4 text-left space-y-2.5">
              <p className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" /> Are you sure you want to close this cohort?
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Closing <strong className="text-foreground">"{cohortToClose?.name}"</strong> will graduate and archive this cohort. It will be moved to the <strong className="text-foreground">Closed Cohorts</strong> tab and hidden from active student enrollment lists.
              </p>
              <div className="text-xs space-y-1.5 pt-2 border-t border-border">
                <p className="flex items-center gap-1.5 text-foreground font-medium">
                  <span className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-bold text-white">✓</span>
                  All enrolled students remain intact.
                </p>
                <p className="flex items-center gap-1.5 text-foreground font-medium">
                  <span className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-bold text-white">✓</span>
                  Attendance, progress, and team history are preserved.
                </p>
                <p className="flex items-center gap-1.5 text-foreground font-medium">
                  <span className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-bold text-white">✓</span>
                  Can be restored at any time with a single click.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                className="font-semibold border-border bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-none"
                onClick={() => setCohortToClose(null)}
                disabled={isClosingCohort}
              >
                Cancel
              </Button>
              <Button
                type="button"
                className="bg-rose-600 text-white hover:bg-rose-700 font-semibold shadow-none border-0"
                onClick={handleConfirmCloseCohort}
                disabled={isClosingCohort}
              >
                {isClosingCohort ? "Closing Cohort..." : "Close Cohort"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Promote to Next Stage Confirmation Dialog */}
      <Dialog open={!!cohortToPromote} onOpenChange={(open) => !open && !isPromoting && setCohortToPromote(null)}>
        <DialogContent className="sm:max-w-md border-border shadow-md font-['Lexend',sans-serif]">
          <div className="flex flex-col items-center text-center pt-2">
            <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-3">
              <Award className="w-7 h-7 text-primary" />
            </div>
            <DialogHeader className="space-y-1">
              <DialogTitle className="text-xl font-bold text-foreground">
                Promote Cohort to Next Stage
              </DialogTitle>
            </DialogHeader>
          </div>

          <div className="space-y-4 pt-2">
            <div className="bg-muted/40 border border-border rounded-xl p-3.5 space-y-2 text-xs">
              <p className="text-sm font-semibold text-foreground">
                {cohortToPromote?.name}
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Graduates the current cohort and rolls all <strong>{cohortToPromote?.students?.length || 0} students</strong> over into the subsequent Stage course curriculum automatically.
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-foreground mb-1.5">
                  New Cohort Name *
                </label>
                <Input
                  value={promoteName}
                  onChange={(e) => setPromoteName(e.target.value)}
                  placeholder="e.g. Aga Khan Primary - Stage 2"
                  className="w-full"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-foreground mb-1.5">
                    Start Date
                  </label>
                  <ModernDatePicker
                    value={promoteStartDate}
                    onChange={setPromoteStartDate}
                    placeholder="New start date"
                    className="w-full max-w-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-foreground mb-1.5">
                    End Date
                  </label>
                  <ModernDatePicker
                    value={promoteEndDate}
                    onChange={setPromoteEndDate}
                    placeholder="New end date"
                    min={promoteStartDate || undefined}
                    className="w-full max-w-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCohortToPromote(null)}
                disabled={isPromoting}
              >
                Cancel
              </Button>
              <Button
                type="button"
                className="bg-primary text-primary-foreground font-semibold"
                onClick={handleConfirmPromote}
                disabled={isPromoting || !promoteName.trim()}
              >
                {isPromoting ? "Promoting…" : "Promote Cohort"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Cohort Timetable Modal */}
      {viewingTimetableCohort && (
        <CohortTimetableModal
          cohort={viewingTimetableCohort}
          isOpen={!!viewingTimetableCohort}
          onClose={() => setViewingTimetableCohort(null)}
          isInstructor={true}
          onScheduleUpdated={() => mutate()}
        />
      )}
    </div>
  );
}

function CohortEditor({ cohort, courses, users, organizations, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    name: cohort.name || "",
    course: cohort.course || "",
    organization: cohort.organization || "",
    academic_year: cohort.academic_year || "",
    grade: cohort.grade || "",
    stream: cohort.stream || "",
    year_of_course: cohort.year_of_course || "",
    start_date: cohort.start_date || "",
    end_date: cohort.end_date || "",
    capacity_limit: cohort.capacity_limit || "",
    location: cohort.location || "",
    price_override: cohort.price_override || "",
    is_active: cohort.is_active ?? true,
    allow_students_to_see_classmates: cohort.allow_students_to_see_classmates ?? false,
    show_classmate_xps: cohort.show_classmate_xps ?? false,
    student_ids: cohort.students?.map(s => s.id) || [],
    schedule_days: cohort.schedule_days || [0, 2],
    schedule_time: cohort.schedule_time || "",
    schedule_end_time: cohort.schedule_end_time || "",
    lessons_per_session: cohort.lessons_per_session || 1,
    holidays: normalizeHolidays(cohort.holidays || []),
    tinkercad_class_code: cohort.tinkercad_class_code || "",
    auto_generate_schedule: true
  });
  const [saving, setSaving] = useState(false);
  const [calculatedDays, setCalculatedDays] = useState(null);
  const [newHolidayInput, setNewHolidayInput] = useState("");
  const [newHolidayLabel, setNewHolidayLabel] = useState("");
  const [showNameTagsModal, setShowNameTagsModal] = useState(false);

  useEffect(() => {
    let parts = [];
    if (formData.organization) {
      const org = organizations.find(o => o.id.toString() === formData.organization.toString());
      if (org) parts.push(org.name);
    }
    if (formData.academic_year) parts.push(formData.academic_year);
    if (formData.grade) parts.push(`Grade ${formData.grade}`);
    if (formData.stream) parts.push(`Stream ${formData.stream}`);
    if (formData.year_of_course) parts.push(formData.year_of_course);
    
    if (parts.length > 0) {
      setFormData(prev => ({ ...prev, name: parts.join(" - ") }));
    }
  }, [formData.organization, formData.academic_year, formData.grade, formData.stream, formData.year_of_course, organizations]);

  useEffect(() => {
    if (formData.start_date && formData.end_date) {
      const start = new Date(formData.start_date);
      const end = new Date(formData.end_date);
      if (start <= end) {
        const diffTime = Math.abs(end - start);
        const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        let weekdays = 0;
        let weekends = 0;
        let current = new Date(start);
        while (current <= end) {
          const day = current.getDay();
          if (day === 0 || day === 6) weekends++;
          else weekdays++;
          current.setDate(current.getDate() + 1);
        }
        setCalculatedDays({ totalDays, weekdays, weekends });
      } else {
        setCalculatedDays(null);
      }
    } else {
      setCalculatedDays(null);
    }
  }, [formData.start_date, formData.end_date]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const method = cohort.id ? "PUT" : "POST";
    const url = cohort.id ? `/api/admin/cohorts/${cohort.id}/` : `/api/admin/cohorts/`;
    
    const bodyData = { ...formData };
    const shouldGenerate = bodyData.auto_generate_schedule;
    delete bodyData.auto_generate_schedule;
    bodyData.holidays = normalizeHolidays(bodyData.holidays || []);

    if (bodyData.organization === "") bodyData.organization = null;
    if (bodyData.capacity_limit === "") bodyData.capacity_limit = null;
    if (bodyData.price_override === "") bodyData.price_override = null;

    try {
      const res = await apiFetch(url, { method, body: JSON.stringify(bodyData) });
      if (!res.ok) throw new Error("Failed to save cohort");
      const savedCohort = await res.json();
      
      if (shouldGenerate && bodyData.schedule_days && bodyData.schedule_days.length > 0) {
        try {
          await apiFetch(`/api/admin/cohorts/${savedCohort.id}/generate-schedule/`, {
            method: "POST",
            body: JSON.stringify({
              schedule_days: bodyData.schedule_days,
              schedule_time: bodyData.schedule_time || null,
              schedule_end_time: bodyData.schedule_end_time || null,
              lessons_per_session: bodyData.lessons_per_session,
              holidays: bodyData.holidays,
              clear_existing: true
            })
          });
          toast.success("Cohort saved & timetable generated!");
        } catch (genErr) {
          console.error(genErr);
          toast.success("Cohort saved successfully!");
        }
      } else {
        toast.success("Cohort saved successfully!");
      }
      onSave();
    } catch (err) {
      console.error(err);
      toast.error("Error saving cohort.");
    } finally {
      setSaving(false);
    }
  };

  const selectedOrg = organizations.find(org => org.id.toString() === formData.organization?.toString());
  const showClassFields = !selectedOrg || selectedOrg.org_type === 'SCHOOL';

  return (
    <div className="w-full bg-card border rounded-xl p-6 shadow-sm">
      <h3 className="text-xl font-bold mb-6">{cohort.id ? "Edit Cohort" : "New Cohort"}</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name *</label>
            <Input required readOnly className="bg-muted" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="Auto-generated name" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Course *</label>
            <SearchableSelect 
              required 
              className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={formData.course} 
              onChange={(e) => setFormData({...formData, course: e.target.value})}
            >
              <option value="">Select a Course...</option>
              {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
            </SearchableSelect>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-border pt-4">
          <div>
            <label className="block text-sm font-medium mb-1">Organization</label>
            <SearchableSelect 
              className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              value={formData.organization} 
              onChange={(e) => {
                const newOrg = e.target.value;
                setFormData(prev => ({
                  ...prev, 
                  organization: newOrg,
                  academic_year: newOrg && organizations.find(o => o.id.toString() === newOrg)?.org_type !== 'SCHOOL' ? "" : prev.academic_year,
                  stream: newOrg && organizations.find(o => o.id.toString() === newOrg)?.org_type !== 'SCHOOL' ? "" : prev.stream,
                  grade: newOrg && organizations.find(o => o.id.toString() === newOrg)?.org_type !== 'SCHOOL' ? "" : prev.grade,
                  year_of_course: newOrg && organizations.find(o => o.id.toString() === newOrg)?.org_type !== 'SCHOOL' ? "" : prev.year_of_course
                }));
              }}
            >
              <option value="">None / Open to Public</option>
              {organizations.map(org => <option key={org.id} value={org.id}>{org.name} ({org.org_type})</option>)}
            </SearchableSelect>
          </div>
          {showClassFields && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <div>
                <label className="block text-sm font-medium mb-1">Academic Year</label>
                <SearchableSelect
                  className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  value={formData.academic_year}
                  onChange={(e) => setFormData({...formData, academic_year: e.target.value})}
                >
                  <option value="">-- Year --</option>
                  <option value="2025/2026">2025/2026</option>
                  <option value="2026/2027">2026/2027</option>
                  <option value="2027/2028">2027/2028</option>
                  <option value="2028/2029">2028/2029</option>
                  <option value="Other">Other</option>
                </SearchableSelect>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Grade</label>
                <SearchableSelect
                  className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  value={formData.grade}
                  onChange={(e) => setFormData({...formData, grade: e.target.value})}
                >
                  <option value="">-- Grade --</option>
                  {[...Array(6)].map((_, i) => (
                    <option key={i+1} value={`${i+1}`}>{i+1}</option>
                  ))}
                </SearchableSelect>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Stream</label>
                <Input value={formData.stream} onChange={(e) => setFormData({...formData, stream: e.target.value})} placeholder="e.g. S" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Course Year</label>
                <SearchableSelect
                  className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  value={formData.year_of_course}
                  onChange={(e) => setFormData({...formData, year_of_course: e.target.value})}
                >
                  <option value="">-- Year --</option>
                  {[...Array(6)].map((_, i) => (
                    <option key={i+1} value={`Year ${i+1}`}>Year {i+1}</option>
                  ))}
                </SearchableSelect>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-border pt-4">
          <div className="w-full">
            <label className="block text-sm font-medium mb-1">Start Date *</label>
            <ModernDatePicker
              value={formData.start_date}
              onChange={(v) => setFormData({ ...formData, start_date: v })}
              placeholder="Start date"
              allowClear={false}
              className="w-full max-w-none"
            />
          </div>
          <div className="w-full">
            <label className="block text-sm font-medium mb-1">End Date *</label>
            <ModernDatePicker
              value={formData.end_date}
              onChange={(v) => setFormData({ ...formData, end_date: v })}
              placeholder="End date"
              allowClear={false}
              min={formData.start_date || undefined}
              className="w-full max-w-none"
            />
          </div>
          {calculatedDays && (
            <div className="col-span-1 sm:col-span-2 flex flex-wrap gap-4 text-xs sm:text-sm text-muted-foreground bg-muted/30 p-2.5 rounded-lg border border-border">
              <span className="font-medium">Total Days: <span className="text-foreground font-bold">{calculatedDays.totalDays}</span></span>
              <span>Weekdays: <span className="text-foreground font-bold">{calculatedDays.weekdays}</span></span>
              <span>Weekends: <span className="text-foreground font-bold">{calculatedDays.weekends}</span></span>
            </div>
          )}
        </div>

        {/* Timetable & Schedule Configuration */}
        <div className="border border-border rounded-xl p-4 bg-muted/10 space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-2">
            <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-primary" /> Schedule & Timetable Settings
            </h4>
            <span className="text-[11px] text-muted-foreground">Auto-generates lesson dates & times</span>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
              Class Days of the Week
            </label>
            <div className="grid grid-cols-7 gap-1 sm:gap-2">
              {DAY_NAMES.map((name, idx) => {
                const isSelected = (formData.schedule_days || []).includes(idx);
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      const current = formData.schedule_days || [];
                      const updated = isSelected 
                        ? current.filter(d => d !== idx) 
                        : [...current, idx].sort((a, b) => a - b);
                      setFormData({ ...formData, schedule_days: updated });
                    }}
                    className={`py-1.5 px-1 text-center text-xs font-bold rounded-lg border transition-all ${
                      isSelected
                        ? "bg-primary text-primary-foreground border-primary shadow-xs"
                        : "bg-background text-muted-foreground border-border hover:border-foreground/30 hover:text-foreground"
                    }`}
                  >
                    {name}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
              Class Ends By
            </label>
            <ModernTimePicker
              value={formData.schedule_end_time || ""}
              onChange={(v) => setFormData({ ...formData, schedule_end_time: v })}
              placeholder="Set end time"
              className="w-full sm:max-w-[10rem] max-w-none"
            />
            <p className="text-[11px] text-muted-foreground mt-1">
              No fixed start - class may begin any time before this.
            </p>
          </div>

          {/* Holidays / activities that skip lessons */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
              Skip days / holidays / activities
            </label>
            <p className="text-[11px] text-muted-foreground mb-2">
              Add dates when class will not happen (public holidays, sports day, exams, etc.). These are skipped when the timetable is generated.
            </p>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mb-2">
              <ModernDatePicker
                value={newHolidayInput}
                onChange={setNewHolidayInput}
                placeholder="Pick skip date"
                className="w-full sm:w-44 max-w-none"
              />
              <Input
                type="text"
                value={newHolidayLabel}
                onChange={(e) => setNewHolidayLabel(e.target.value)}
                placeholder="Activity / reason"
                className="text-sm w-full sm:flex-1 rounded-2xl h-10"
              />
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="shrink-0 rounded-2xl h-10 px-4"
                onClick={() => {
                  if (!newHolidayInput) return;
                  const existing = normalizeHolidays(formData.holidays || []);
                  if (existing.some((h) => holidayDate(h) === newHolidayInput)) {
                    toast.info("That date is already listed");
                    return;
                  }
                  const label = newHolidayLabel.trim();
                  setFormData({
                    ...formData,
                    holidays: normalizeHolidays([
                      ...existing,
                      { date: newHolidayInput, label },
                    ]),
                  });
                  setNewHolidayInput("");
                  setNewHolidayLabel("");
                }}
              >
                + Add day
              </Button>
            </div>
            {(formData.holidays || []).length > 0 && (
              <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto">
                {normalizeHolidays(formData.holidays).map((h) => (
                  <span
                    key={holidayDate(h)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                    title={holidayLabel(h) || "Skipped day"}
                  >
                    {formatHolidayChip(h)}
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          holidays: normalizeHolidays(formData.holidays).filter(
                            (d) => holidayDate(d) !== holidayDate(h)
                          ),
                        })
                      }
                      className="hover:text-foreground rounded-full"
                      aria-label={`Remove ${formatHolidayChip(h)}`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="auto_generate_schedule"
              checked={formData.auto_generate_schedule}
              onChange={(e) => setFormData({ ...formData, auto_generate_schedule: e.target.checked })}
              className="rounded border-gray-300"
            />
            <label htmlFor="auto_generate_schedule" className="text-xs font-medium text-foreground cursor-pointer">
              Auto-generate / update lesson timetable for this cohort
            </label>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Capacity</label>
            <Input type="number" value={formData.capacity_limit} onChange={(e) => setFormData({...formData, capacity_limit: e.target.value})} placeholder="Blank for unlimited" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Price Override (UGX)</label>
            <Input type="number" value={formData.price_override} onChange={(e) => setFormData({...formData, price_override: e.target.value})} placeholder="e.g. 100000" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Location</label>
          <Input value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} placeholder="e.g. Online, Room 101" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Tinkercad Classroom Code / Link</label>
          <Input 
            value={formData.tinkercad_class_code} 
            onChange={(e) => setFormData({...formData, tinkercad_class_code: e.target.value})} 
            placeholder="e.g. 3K9W-8M7P-2Q4Z or https://www.tinkercad.com/joinclass/..." 
          />
          <p className="text-[11px] text-muted-foreground mt-1">
            Students enrolled in this cohort will see a 1-click &quot;Join Tinkercad Class&quot; section in practicals with their student name ready.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2.5 pt-2 pb-2 mt-2">
          <label className="flex-1 h-9 sm:h-10 inline-flex items-center justify-start gap-2 px-3 border rounded-lg text-xs sm:text-sm font-semibold select-none transition-colors bg-background shadow-xs cursor-pointer border-border hover:bg-muted text-foreground">
            <input
              type="checkbox"
              id="allow_students_to_see_classmates"
              checked={formData.allow_students_to_see_classmates}
              onChange={(e) => setFormData({...formData, allow_students_to_see_classmates: e.target.checked})}
              className="rounded border-gray-300 w-4 h-4 text-primary focus:ring-primary shrink-0"
            />
            <span className="truncate">Allow Students to See Classmates</span>
          </label>

          <label className="flex-1 h-9 sm:h-10 inline-flex items-center justify-start gap-2 px-3 border rounded-lg text-xs sm:text-sm font-semibold select-none transition-colors bg-background shadow-xs cursor-pointer border-border hover:bg-muted text-foreground">
            <input
              type="checkbox"
              checked={formData.show_classmate_xps}
              onChange={(e) => setFormData({...formData, show_classmate_xps: e.target.checked})}
              className="rounded border-gray-300 w-4 h-4 text-primary focus:ring-primary shrink-0"
            />
            <span className="truncate">Show Classmate XP</span>
          </label>

          <button
            type="button"
            onClick={() => setShowNameTagsModal(true)}
            className="flex-1 h-9 sm:h-10 px-3 border border-border text-xs sm:text-sm font-semibold rounded-lg hover:bg-muted transition-colors flex items-center justify-start gap-2 bg-background shadow-xs text-foreground"
          >
            <Users className="w-4 h-4 text-muted-foreground shrink-0" />
            <span className="truncate">Print Name Tags</span>
          </button>
        </div>

        <div className="pt-2">
          <label className="block text-sm font-medium mb-2">Enrolled Students</label>
          <StudentBulkSelector 
            users={users} 
            selectedIds={formData.student_ids} 
            onChange={(ids) => setFormData({...formData, student_ids: ids})} 
          />
        </div>
        
        <div className="flex gap-4 pt-4 border-t border-border mt-6">
          <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
          <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Save Cohort"}</Button>
        </div>
      </form>

      {showNameTagsModal && (
        <NameTagsPrintPreview
          open={showNameTagsModal}
          onOpenChange={setShowNameTagsModal}
          users={users.filter(u => formData.student_ids.includes(u.id))}
          defaultCohortName={formData.name}
          defaultOrgName={typeof formData.organization === 'object' ? formData.organization?.name : formData.organization}
          cohort={formData}
        />
      )}
    </div>
  );
}

function CohortStudentManager({ cohort, courseName, users, onClose }) {
  const { data: currentCohort, mutate: mutateCohort } = useSWR(`/api/admin/cohorts/${cohort.id}/`, swrFetcher);
  const { data: allUsersData, mutate: mutateUsers } = useSWR("/api/admin/users/", swrFetcher);
  const systemUsers = Array.isArray(allUsersData) ? allUsersData : allUsersData?.results || users || [];

  const [loading, setLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);
  
  // Sorting state for students table
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  // Bulk selection for enrolled students
  const [bulkSelectedIds, setBulkSelectedIds] = useState([]);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [showNameTagsModal, setShowNameTagsModal] = useState(false);
  const [showTeamsModal, setShowTeamsModal] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [showAddStudents, setShowAddStudents] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [messageSubject, setMessageSubject] = useState("");
  const [messageBody, setMessageBody] = useState("");
  
  // Assign to cohort modal state
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignStudentId, setAssignStudentId] = useState(null);
  const [targetCohortId, setTargetCohortId] = useState("");
  
  // Device Assignment Modal state
  const [showDeviceModal, setShowDeviceModal] = useState(false);
  const [deviceStudentId, setDeviceStudentId] = useState(null);
  const [assignDeviceName, setAssignDeviceName] = useState("");

  const handleAssignDevice = async (e) => {
    e.preventDefault();
    if (!deviceStudentId) return;
    setLoading(true);
    try {
      await apiFetch(`/api/admin/cohorts/${cohort.id}/assign-device/`, {
        method: "POST",
        body: JSON.stringify({ student_id: deviceStudentId, device_name: assignDeviceName })
      });
      toast.success("Device assigned successfully.");
      setShowDeviceModal(false);
      setDeviceStudentId(null);
      setAssignDeviceName("");
      mutateCohort();
    } catch (err) {
      toast.error(err.message || "Failed to assign device.");
    } finally {
      setLoading(false);
    }
  };
  
  const { data: allCohortsData } = useSWR(showAssignModal ? "/api/admin/cohorts/" : null, swrFetcher);
  const allCohorts = Array.isArray(allCohortsData) ? allCohortsData : allCohortsData?.results || [];
  const relatedCohorts = allCohorts.filter(c => c.course === cohort.course && c.id !== cohort.id);

  const enrolledStudents = currentCohort?.students || cohort.students || [];

  // Available students that can be added (all system users not yet enrolled in this cohort)
  const candidateUsers = React.useMemo(() => {
    const enrolledIds = new Set(enrolledStudents.map((s) => s.id));
    return systemUsers.filter((u) => !enrolledIds.has(u.id));
  }, [systemUsers, enrolledStudents]);

  const sortedStudents = React.useMemo(() => {
    let sortableStudents = [...enrolledStudents];
    if (sortConfig.key !== null) {
      sortableStudents.sort((a, b) => {
        let aValue = a[sortConfig.key] || "";
        let bValue = b[sortConfig.key] || "";
        
        if (sortConfig.key === 'name') {
           aValue = a.full_name || a.username || "";
           bValue = b.full_name || b.username || "";
        }

        if (typeof aValue === 'string') aValue = aValue.toLowerCase();
        if (typeof bValue === 'string') bValue = bValue.toLowerCase();

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return sortableStudents;
  }, [enrolledStudents, sortConfig]);

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const SortIcon = ({ columnKey }) => {
    if (sortConfig.key !== columnKey) return null;
    return sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3 inline ml-1" /> : <ArrowDown className="w-3 h-3 inline ml-1" />;
  };

  const handleExportExcel = () => {
    if (enrolledStudents.length === 0) return;
    const data = enrolledStudents.map(s => ({
      ID: s.id,
      Name: `${s.first_name || ""} ${s.last_name || ""}`.trim() || s.username,
      Email: s.email,
      "Date Joined": s.date_joined ? new Date(s.date_joined).toLocaleDateString() : "Unknown"
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Students");
    XLSX.writeFile(wb, `${cohort.name}_Students.xlsx`);
  };

  const handleExportWord = async () => {
    if (enrolledStudents.length === 0) return;
    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          new Paragraph({
            children: [
              new TextRun({ text: cohort.name, bold: true, size: 32, font: "Poppins" }),
            ],
            spacing: { after: 200 }
          }),
          new Paragraph({
            children: [
              new TextRun({ text: `Enrolled Students - Generated on ${new Date().toLocaleDateString()}`, size: 24, font: "Poppins" }),
            ],
            spacing: { after: 400 }
          }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "ID", bold: true, font: "Poppins" })] })], padding: { top: 100, bottom: 100, left: 100, right: 100 } }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Name", bold: true, font: "Poppins" })] })], padding: { top: 100, bottom: 100, left: 100, right: 100 } }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Email", bold: true, font: "Poppins" })] })], padding: { top: 100, bottom: 100, left: 100, right: 100 } }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Stream", bold: true, font: "Poppins" })] })], padding: { top: 100, bottom: 100, left: 100, right: 100 } }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Date Joined", bold: true, font: "Poppins" })] })], padding: { top: 100, bottom: 100, left: 100, right: 100 } })
                ]
              }),
              ...enrolledStudents.map(s => new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: s.id.toString(), font: "Poppins" })] })], padding: { top: 100, bottom: 100, left: 100, right: 100 } }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: `${s.first_name || ""} ${s.last_name || ""}`.trim() || s.username, font: "Poppins" })] })], padding: { top: 100, bottom: 100, left: 100, right: 100 } }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: s.email, font: "Poppins" })] })], padding: { top: 100, bottom: 100, left: 100, right: 100 } }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: s.class_stream || "N/A", font: "Poppins" })] })], padding: { top: 100, bottom: 100, left: 100, right: 100 } }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: s.date_joined ? new Date(s.date_joined).toLocaleDateString() : "Unknown", font: "Poppins" })] })], padding: { top: 100, bottom: 100, left: 100, right: 100 } })
                ]
              }))
            ]
          })
        ],
      }],
    });
    const blob = await Packer.toBlob(doc);
    saveAs(blob, `${cohort.name}_Students.docx`);
  };

  const handlePrint = () => {
    if (enrolledStudents.length === 0) return;
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>${cohort.name} - Enrolled Students</title>
          <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&display=swap" rel="stylesheet">
          <style>
            body { font-family: 'Poppins', sans-serif; padding: 20px; color: #333; }
            h1 { font-size: 24px; margin-bottom: 5px; }
            h2 { font-size: 16px; margin-bottom: 20px; color: #666; font-weight: 400; }
            table { border-collapse: collapse; width: 100%; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
            th { background-color: #f4f4f5; font-weight: 600; }
            tr:nth-child(even) { background-color: #fafafa; }
            @media print {
              body { padding: 0; }
            }
          </style>
        </head>
        <body>
          <h1>${cohort.name}</h1>
          <h2>Enrolled Students - Generated on ${new Date().toLocaleDateString()}</h2>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Stream</th>
                <th>Date Joined</th>
              </tr>
            </thead>
            <tbody>
              ${enrolledStudents.map(s => `
                <tr>
                  <td>${s.id}</td>
                  <td>${`${s.first_name || ""} ${s.last_name || ""}`.trim() || s.username}</td>
                  <td>${s.email}</td>
                  <td>${s.class_stream || "N/A"}</td>
                  <td>${s.date_joined ? new Date(s.date_joined).toLocaleDateString() : "Unknown"}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <script>
            window.onload = () => {
              window.print();
              setTimeout(() => window.close(), 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleAddSelected = async () => {
    if (selectedIds.length === 0) return;
    setLoading(true);
    try {
      await apiFetch(`/api/admin/cohorts/${cohort.id}/add-student/`, {
        method: "POST",
        body: JSON.stringify({ student_ids: selectedIds })
      });
      toast.success(`Successfully added ${selectedIds.length} student${selectedIds.length > 1 ? 's' : ''}!`);
      setSelectedIds([]);
      await Promise.all([
        mutateCohort(),
        mutateUsers?.()
      ]);
    } catch (err) {
      toast.error(err.message || "Failed to add students.");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveStudent = async (studentId) => {
    if (!window.confirm("Remove this student from the cohort?")) return;
    try {
      await apiFetch(`/api/admin/cohorts/${cohort.id}/remove-student/`, {
        method: "POST",
        body: JSON.stringify({ student_id: studentId })
      });
      toast.success("Student removed successfully.");
      mutateCohort();
    } catch (err) {
      toast.error(err.message || "Failed to remove student.");
    }
  };

  const toggleBulkSelect = (id) => {
    setBulkSelectedIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (bulkSelectedIds.length === enrolledStudents.length) {
      setBulkSelectedIds([]);
    } else {
      setBulkSelectedIds(enrolledStudents.map(s => s.id));
    }
  };

  const handleBulkReset = () => {
    setShowResetModal(true);
  };

  const handleResetConfirm = async (flags, selectedCohortId, studentId) => {
    setLoading(true);
    try {
      const student_ids = studentId
        ? [studentId]
        : bulkSelectedIds.length > 0
        ? bulkSelectedIds
        : [];
      const res = await apiFetch(`/api/admin/cohorts/${cohort.id}/bulk-reset-progress/`, {
        method: "POST",
        body: JSON.stringify({ student_ids, ...flags })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Failed to reset progress.");
      toast.success(data.message || (studentId
        ? "Progress reset for student."
        : bulkSelectedIds.length > 0
        ? `Progress reset for ${bulkSelectedIds.length} selected students.`
        : "Progress reset for all enrolled students."));
      setBulkSelectedIds([]);
      setShowResetModal(false);
      mutateCohort();
    } catch (err) {
      toast.error(err.message || "Failed to reset progress.");
    } finally {
      setLoading(false);
    }
  };

  const handleBulkRevoke = async () => {
    if (bulkSelectedIds.length === 0) return;
    if (!window.confirm(`Revoke access for ${bulkSelectedIds.length} selected students? They will be removed from this cohort.`)) return;
    setLoading(true);
    try {
      await apiFetch(`/api/admin/cohorts/${cohort.id}/bulk-revoke-access/`, {
        method: "POST",
        body: JSON.stringify({ student_ids: bulkSelectedIds })
      });
      toast.success("Access revoked successfully.");
      setBulkSelectedIds([]);
      mutateCohort();
    } catch (err) {
      toast.error(err.message || "Failed to revoke access.");
    } finally {
      setLoading(false);
    }
  };

  const handleBulkMessage = async (e) => {
    e.preventDefault();
    if (bulkSelectedIds.length === 0) return;
    setLoading(true);
    try {
      await apiFetch(`/api/admin/cohorts/${cohort.id}/bulk-message/`, {
        method: "POST",
        body: JSON.stringify({ 
          student_ids: bulkSelectedIds,
          subject: messageSubject,
          message: messageBody
        })
      });
      toast.success("Message sent successfully.");
      setShowMessageModal(false);
      setMessageSubject("");
      setMessageBody("");
      setBulkSelectedIds([]);
    } catch (err) {
      toast.error(err.message || "Failed to send message.");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmClose = async () => {
    setLoading(true);
    try {
      let res = await apiFetch(`/api/admin/cohorts/${cohort.id}/close/`, {
        method: "POST",
      });
      if (!res.ok) {
        res = await apiFetch(`/api/admin/cohorts/${cohort.id}/`, {
          method: "PATCH",
          body: JSON.stringify({ is_closed: true }),
        });
      }
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || errData.detail || errData.message || `Failed to close cohort (${res.status})`);
      }
      toast.success("Cohort closed successfully and moved to Closed Cohorts.");
      setShowCloseConfirm(false);
      await mutateCohort();
      if (typeof onClose === "function") onClose();
    } catch (err) {
      toast.error(err.message || "Failed to close cohort.");
    } finally {
      setLoading(false);
    }
  };

  const handleRestoreCohort = async () => {
    setLoading(true);
    try {
      let res = await apiFetch(`/api/admin/cohorts/${cohort.id}/restore/`, {
        method: "POST",
      });
      if (!res.ok) {
        res = await apiFetch(`/api/admin/cohorts/${cohort.id}/`, {
          method: "PATCH",
          body: JSON.stringify({ is_closed: false }),
        });
      }
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || errData.detail || errData.message || `Failed to restore cohort (${res.status})`);
      }
      toast.success("Cohort restored successfully with all its data!");
      await mutateCohort();
    } catch (err) {
      toast.error(err.message || "Failed to restore cohort.");
    } finally {
      setLoading(false);
    }
  };

  const handleAssignStudentToCohort = async (e) => {
    e.preventDefault();
    if (!targetCohortId || !assignStudentId) return;
    setLoading(true);
    try {
      await apiFetch(`/api/admin/cohorts/${targetCohortId}/add-student/`, {
        method: "POST",
        body: JSON.stringify({ student_ids: [assignStudentId] })
      });
      toast.success("Student successfully assigned to cohort.");
      setShowAssignModal(false);
      setTargetCohortId("");
      setAssignStudentId(null);
    } catch (err) {
      toast.error(err.message || "Failed to assign student.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={isFullscreen ? "fixed inset-0 z-50 bg-background flex flex-col p-4 sm:p-6 space-y-4 sm:space-y-6 overflow-y-auto" : "w-full flex flex-col flex-1 bg-card border rounded-xl p-4 sm:p-6 shadow-sm space-y-4 sm:space-y-6 overflow-y-auto min-h-0 relative group"}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b shrink-0">
        <div className="flex-1 min-w-0 pr-4">
          <h3 className="text-lg sm:text-xl font-bold truncate">Manage Students</h3>
          <p className="text-muted-foreground text-xs sm:text-sm truncate" title={`${cohort.name} • ${courseName}`}>
            {cohort.name} • {courseName}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap shrink-0">
          {currentCohort?.is_closed ? (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRestoreCohort} 
              disabled={loading} 
              className="text-emerald-600 hover:bg-emerald-500/10 border-emerald-500/30 font-medium"
            >
              <RotateCcw className="w-4 h-4 mr-1.5" />
              Restore Cohort
            </Button>
          ) : (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowCloseConfirm(true)} 
              disabled={loading} 
              className="text-destructive hover:bg-destructive/10 border-destructive/20 bg-destructive/5 font-medium"
            >
              <GraduationCap className="w-4 h-4 mr-1.5" />
              Close Cohort
            </Button>
          )}
          {isFullscreen ? (
            <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-9 sm:w-9" onClick={() => setIsFullscreen(false)}>
              <Minimize2 className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
          ) : (
            <Button variant="outline" size="icon" className="h-8 w-8 sm:h-9 sm:w-9 bg-background shadow-sm opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => setIsFullscreen(true)} title="Fullscreen View">
              <Maximize2 className="w-4 h-4 text-muted-foreground" />
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={onClose} className="h-8 sm:h-9">Back</Button>
        </div>
      </div>
      
      {/* Closed Cohort Notice Banner */}
      {currentCohort?.is_closed && (
        <div className="bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 p-3.5 rounded-lg flex items-center justify-between gap-3 text-sm shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <GraduationCap className="w-5 h-5 text-amber-600 shrink-0" />
            <span className="truncate">This cohort is currently <strong>Closed</strong>. All {enrolledStudents.length} enrolled student records, attendance, and progress are preserved.</span>
          </div>
          <Button 
            size="sm" 
            variant="outline" 
            className="text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/10 shrink-0 font-medium" 
            onClick={handleRestoreCohort} 
            disabled={loading}
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1" /> Restore Cohort
          </Button>
        </div>
      )}

      {/* Top Section: Add Students */}
      <div className="bg-muted/20 rounded-lg border flex flex-col shrink-0">
        <button 
          onClick={() => setShowAddStudents(!showAddStudents)}
          className="p-4 flex items-center justify-between w-full hover:bg-muted/50 transition-colors rounded-lg text-left"
        >
          <h4 className="font-semibold flex items-center gap-2">
            <Users className="w-4 h-4" /> Add Students to Cohort
          </h4>
          {showAddStudents ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        
        {showAddStudents && (
          <div className="p-4 pt-0 border-t space-y-4">
            {/* Any registered student can be searched and added */}
            <StudentBulkSelector 
              users={candidateUsers} 
              selectedIds={selectedIds} 
              onChange={setSelectedIds} 
            />
            
            {selectedIds.length > 0 && (
              <div className="flex justify-end pt-2 border-t mt-4">
                <Button onClick={handleAddSelected} disabled={loading}>
                  {loading ? "Adding..." : `Add ${selectedIds.length} Selected Student${selectedIds.length > 1 ? 's' : ''}`}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Section: Enrolled Students Table */}
      <div className="flex-1 flex flex-col min-h-0 overflow-visible">
        <div className="flex justify-between items-center mb-4 shrink-0 flex-wrap gap-2">
          <h4 className="font-semibold text-lg flex-1">Enrolled Students ({enrolledStudents.length})</h4>
          
          <div className="flex items-center gap-2">
            {bulkSelectedIds.length > 0 && (
              <div className="flex gap-2 items-center bg-primary/10 px-3 py-1.5 rounded-md border border-primary/20 mr-2">
                <span className="text-sm font-medium mr-2 text-primary">{bulkSelectedIds.length} selected:</span>
                <Button size="sm" variant="outline" onClick={() => setShowMessageModal(true)} disabled={loading} className="h-8">
                  <MessageSquare className="w-3.5 h-3.5 mr-1.5" /> Message
                </Button>
                <Button size="sm" variant="outline" onClick={handleBulkReset} disabled={loading} className="h-8">
                  <RefreshCcw className="w-3.5 h-3.5 mr-1.5" /> Reset Progress
                </Button>
                <Button size="sm" variant="destructive" onClick={handleBulkRevoke} disabled={loading} className="h-8">
                  <UserMinus className="w-3.5 h-3.5 mr-1.5" /> Revoke Access
                </Button>
              </div>
            )}
            
            {enrolledStudents.length > 0 && (
              <>
                <Button variant="outline" size="sm" onClick={() => setShowTeamsModal(true)}>
                  <Settings className="w-4 h-4 mr-2" /> Teams
                </Button>
                <Button variant="outline" size="sm" onClick={() => setShowMembersModal(true)}>
                  <Eye className="w-4 h-4 mr-2" /> Members
                </Button>
                <Button variant="outline" size="sm" onClick={() => setShowResetModal(true)}>
                  <RefreshCcw className="w-4 h-4 mr-2" /> Reset Progress
                </Button>
                <Button variant="outline" size="sm" onClick={() => setShowAttendanceModal(true)}>
                  <Calendar className="w-4 h-4 mr-2 text-blue-600" /> Attendance
                </Button>
                <Button variant="outline" size="sm" onClick={() => setShowNameTagsModal(true)}>
                  <Users className="w-4 h-4 mr-2" /> Name Tags
                </Button>
                <Button variant="outline" size="sm" onClick={handleExportWord}>
                  <FileText className="w-4 h-4 mr-2" /> Word
                </Button>
                <Button variant="outline" size="sm" onClick={handleExportExcel}>
                  <FileSpreadsheet className="w-4 h-4 mr-2 text-green-600" /> Excel
                </Button>
                <Button variant="outline" size="sm" onClick={handlePrint}>
                  <Printer className="w-4 h-4 mr-2" /> Print
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Mobile View: Aggressive Vertical List */}
        <div className="md:hidden space-y-2.5">
          {sortedStudents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground bg-muted/10 rounded-xl border border-dashed text-xs">
              No students currently enrolled in this cohort.
            </div>
          ) : (
            sortedStudents.map(student => (
              <div
                key={student.id}
                className={`p-3.5 rounded-xl border transition-colors bg-card ${
                  bulkSelectedIds.includes(student.id) ? "border-primary bg-primary/5" : "border-border"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <input 
                      type="checkbox" 
                      checked={bulkSelectedIds.includes(student.id)}
                      onChange={() => toggleBulkSelect(student.id)}
                      className="rounded border-gray-300 shrink-0"
                    />
                    <p className="font-bold text-sm text-foreground truncate">
                      {student.full_name || student.username}
                    </p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-muted shrink-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem 
                        className="cursor-pointer"
                        onClick={() => {
                          setAssignStudentId(student.id);
                          setShowAssignModal(true);
                        }}
                      >
                        <Users className="w-4 h-4 mr-2" />
                        Assign to Cohort
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="cursor-pointer"
                        onClick={() => {
                          setDeviceStudentId(student.id);
                          setAssignDeviceName(student.device_name || "");
                          setShowDeviceModal(true);
                        }}
                      >
                        <span className="w-4 h-4 mr-2 text-center text-sm">💻</span>
                        Assign Computer
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer"
                        onClick={() => handleRemoveStudent(student.id)}
                      >
                        <Trash className="w-4 h-4 mr-2" />
                        Remove Student
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Email on its own dedicated row - clear vertical stack */}
                {student.email && (
                  <p className="text-xs text-muted-foreground font-mono break-all mt-1 pl-6 select-all font-medium">
                    {student.email}
                  </p>
                )}

                {/* Stream & Computer Badges */}
                <div className="flex items-center gap-1.5 flex-wrap mt-2 pl-6">
                  {student.class_stream && (
                    <span className="px-2 py-0.5 bg-secondary text-secondary-foreground text-[10px] font-bold rounded-md border border-border">
                      Stream: {student.class_stream}
                    </span>
                  )}
                  {student.device_name ? (
                    <span className="px-2 py-0.5 bg-secondary text-secondary-foreground text-[10px] font-bold rounded-md border border-border">
                      💻 {student.device_name}
                    </span>
                  ) : (
                    <span className="text-muted-foreground italic text-[10px]">No computer</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop View: Standard Table */}
        <div className="hidden md:block border rounded-md overflow-x-hidden bg-background">
          <table className="w-full text-sm text-left relative table-fixed break-words">
            <thead className="bg-secondary text-muted-foreground border-b sticky top-0 z-10">
              <tr>
                <th className="px-6 py-3 w-12">
                  <input 
                    type="checkbox" 
                    checked={sortedStudents.length > 0 && bulkSelectedIds.length === sortedStudents.length}
                    onChange={toggleSelectAll}
                    className="rounded border-gray-300"
                  />
                </th>
                <th className="px-6 py-3 font-semibold w-1/3 cursor-pointer select-none" onClick={() => requestSort('name')}>
                  Name <SortIcon columnKey="name" />
                </th>
                <th className="px-6 py-3 font-semibold w-1/3 cursor-pointer select-none" onClick={() => requestSort('email')}>
                  Email <SortIcon columnKey="email" />
                </th>
                <th className="px-6 py-3 font-semibold w-1/6 cursor-pointer select-none" onClick={() => requestSort('class_stream')}>
                  Stream <SortIcon columnKey="class_stream" />
                </th>
                <th className="px-6 py-3 font-semibold w-1/6 cursor-pointer select-none" onClick={() => requestSort('device_name')}>
                  Computer <SortIcon columnKey="device_name" />
                </th>
                <th className="px-6 py-3 font-semibold text-right w-16"></th>
              </tr>
            </thead>
            <tbody>
              {sortedStudents.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-8 text-muted-foreground">
                    No students currently enrolled in this cohort.
                  </td>
                </tr>
              ) : (
                sortedStudents.map(student => (
                  <tr key={student.id} className={`border-b last:border-0 hover:bg-muted/30 ${bulkSelectedIds.includes(student.id) ? 'bg-primary/5' : ''}`}>
                    <td className="px-6 py-3">
                      <input 
                        type="checkbox" 
                        checked={bulkSelectedIds.includes(student.id)}
                        onChange={() => toggleBulkSelect(student.id)}
                        className="rounded border-gray-300"
                      />
                    </td>
                    <td className="px-6 py-3 font-medium truncate" title={student.full_name || student.username}>
                      {student.full_name || student.username}
                    </td>
                    <td className="px-6 py-3 truncate" title={student.email}>{student.email}</td>
                    <td className="px-6 py-3 truncate" title={student.class_stream || "N/A"}>{student.class_stream || "N/A"}</td>
                    <td className="px-6 py-3 truncate" title={student.device_name || "None"}>{student.device_name ? <span className="px-2 py-0.5 bg-secondary text-secondary-foreground text-xs rounded-md border">{student.device_name}</span> : <span className="text-muted-foreground italic text-xs">None</span>}</td>
                    <td className="px-6 py-3 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem 
                            className="cursor-pointer"
                            onClick={() => {
                              setAssignStudentId(student.id);
                              setShowAssignModal(true);
                            }}
                          >
                            <Users className="w-4 h-4 mr-2" />
                            Assign to Cohort
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="cursor-pointer"
                            onClick={() => {
                              setDeviceStudentId(student.id);
                              setAssignDeviceName(student.device_name || "");
                              setShowDeviceModal(true);
                            }}
                          >
                            <span className="w-4 h-4 mr-2 text-center text-sm">💻</span>
                            Assign Computer
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer"
                            onClick={() => handleRemoveStudent(student.id)}
                          >
                            <Trash className="w-4 h-4 mr-2" />
                            Remove Student
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showAttendanceModal && <AttendanceModal cohort={currentCohort || cohort} students={enrolledStudents} onClose={() => setShowAttendanceModal(false)} />}
      {showNameTagsModal && (
        <NameTagsPrintPreview
          open={showNameTagsModal}
          onOpenChange={setShowNameTagsModal}
          users={bulkSelectedIds.length > 0 ? enrolledStudents.filter((s) => bulkSelectedIds.includes(s.id)) : enrolledStudents}
          defaultCohortName={selectedCohort?.name}
          defaultOrgName={typeof selectedCohort?.organization === 'object' ? selectedCohort?.organization?.name : selectedCohort?.organization}
          cohort={selectedCohort || currentCohort || cohort}
        />
      )}
      <TeamManagementModal
        cohort={currentCohort || cohort}
        isOpen={showTeamsModal}
        onClose={() => setShowTeamsModal(false)}
        onRefresh={() => mutateCohort()}
      />
      <ViewMembersModal
        cohort={currentCohort || cohort}
        isOpen={showMembersModal}
        onClose={() => setShowMembersModal(false)}
      />
      <ResetProgressModal
        isOpen={showResetModal}
        onClose={() => setShowResetModal(false)}
        onConfirm={handleResetConfirm}
        loading={loading}
        students={enrolledStudents}
        initialStudentId={bulkSelectedIds.length === 1 ? bulkSelectedIds[0] : null}
        studentCount={bulkSelectedIds.length > 0 ? bulkSelectedIds.length : enrolledStudents.length}
        description={
          bulkSelectedIds.length > 0
            ? `Choose what to reset for ${bulkSelectedIds.length} selected students. This cannot be undone.`
            : "Choose what to reset for enrolled students in the cohort. You can also select a single student."
        }
      />

      {/* Device Assignment Modal */}
      <Dialog open={showDeviceModal} onOpenChange={setShowDeviceModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Assign Computer</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAssignDevice} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Computer Name/ID</label>
              <Input 
                value={assignDeviceName} 
                onChange={(e) => setAssignDeviceName(e.target.value)} 
                placeholder="e.g. PC-01 (Leave empty to remove)"
              />
              <p className="text-xs text-muted-foreground mt-2">Leave empty to remove the computer assignment from this student.</p>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowDeviceModal(false)} disabled={loading}>Cancel</Button>
              <Button type="submit" disabled={loading}>{loading ? "Saving..." : "Save Assignment"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Message Modal */}
      <Dialog open={showMessageModal} onOpenChange={setShowMessageModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Message {bulkSelectedIds.length} Students</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleBulkMessage} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Subject</label>
              <Input 
                required 
                value={messageSubject} 
                onChange={(e) => setMessageSubject(e.target.value)} 
                placeholder="e.g. Important Update on Cohort"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Message</label>
              <textarea 
                required 
                className="w-full min-h-[150px] p-3 rounded-md border border-input bg-background text-sm"
                value={messageBody} 
                onChange={(e) => setMessageBody(e.target.value)}
                placeholder="Type your message here..."
              />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setShowMessageModal(false)}>Cancel</Button>
              <Button type="submit" disabled={loading}>{loading ? "Sending..." : "Send Message"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Assign Cohort Modal */}
      <Dialog open={showAssignModal} onOpenChange={setShowAssignModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Assign to Cohort</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAssignStudentToCohort} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Select Cohort</label>
              <SearchableSelect
                value={targetCohortId}
                onChange={(e) => setTargetCohortId(e.target.value)}
                required
                className="w-full h-10 px-3 py-2 rounded-md border border-input bg-background text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="" disabled>Choose a cohort</option>
                {relatedCohorts.map(c => (
                  <option key={c.id} value={c.id.toString()}>
                    {c.name} {c.is_closed ? "(Closed)" : ""}
                  </option>
                ))}
                {relatedCohorts.length === 0 && (
                  <option value="" disabled>No other cohorts found for this course</option>
                )}
              </SearchableSelect>
              <p className="text-xs text-muted-foreground mt-2">
                This will add the student to the selected cohort. They will remain in this cohort as well unless you remove them.
              </p>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setShowAssignModal(false)}>Cancel</Button>
              <Button type="submit" disabled={loading || !targetCohortId}>{loading ? "Assigning..." : "Assign Student"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Red Confirmation Dialog for Closing Cohort in CohortStudentManager */}
      <Dialog open={showCloseConfirm} onOpenChange={(open) => !open && !loading && setShowCloseConfirm(false)}>
        <DialogContent className="sm:max-w-md border-border shadow-md font-['Lexend',sans-serif]">
          <div className="flex flex-col items-center text-center pt-2">
            <div className="w-14 h-14 rounded-full bg-rose-600 text-white flex items-center justify-center mb-3">
              <AlertTriangle className="w-7 h-7 text-white" />
            </div>
            <DialogHeader className="space-y-1">
              <DialogTitle className="text-xl font-bold text-rose-700 dark:text-rose-400">
                Close Cohort Confirmation
              </DialogTitle>
            </DialogHeader>
          </div>

          <div className="space-y-4 pt-2">
            <div className="bg-muted border border-border rounded-lg p-4 text-left space-y-2.5">
              <p className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" /> Are you sure you want to close this cohort?
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Closing <strong className="text-foreground">"{cohort.name}"</strong> will graduate and archive it. It will be moved to the <strong className="text-foreground">Closed Cohorts</strong> tab and hidden from active student enrollment lists.
              </p>
              <div className="text-xs space-y-1.5 pt-2 border-t border-border">
                <p className="flex items-center gap-1.5 text-foreground font-medium">
                  <span className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-bold text-white">✓</span>
                  All {enrolledStudents.length} enrolled students remain intact.
                </p>
                <p className="flex items-center gap-1.5 text-foreground font-medium">
                  <span className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-bold text-white">✓</span>
                  Attendance, progress, and team history are preserved.
                </p>
                <p className="flex items-center gap-1.5 text-foreground font-medium">
                  <span className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-bold text-white">✓</span>
                  Can be restored at any time with a single click.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                className="font-semibold border-border bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-none"
                onClick={() => setShowCloseConfirm(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="button"
                className="bg-rose-600 text-white hover:bg-rose-700 font-semibold shadow-none border-0"
                onClick={handleConfirmClose}
                disabled={loading}
              >
                {loading ? "Closing..." : "Close Cohort"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
function CohortInstructorManager({ cohort, courseName, users, onClose }) {
  const { data: currentCohort, mutate: mutateCohort } = useSWR(`/api/admin/cohorts/${cohort.id}/`, swrFetcher);
  const [loading, setLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const assignedInstructors = currentCohort?.instructors || cohort.instructors || [];

  const handleAssign = async () => {
    if (selectedIds.length === 0) return;
    setLoading(true);
    try {
      await apiFetch(`/api/admin/cohorts/${cohort.id}/add-instructor/`, {
        method: "POST",
        body: JSON.stringify({ instructor_ids: selectedIds })
      });
      setSelectedIds([]);
      mutateCohort();
    } catch (err) {
      alert("Failed to assign instructors: " + (err.message || 'Unknown error'));
    }
    setLoading(false);
  };

  const handleRemove = async (instructorId) => {
    if (!window.confirm("Remove this instructor from the cohort?")) return;
    setLoading(true);
    try {
      await apiFetch(`/api/admin/cohorts/${cohort.id}/remove-instructor/`, {
        method: "POST",
        body: JSON.stringify({ instructor_ids: [instructorId] })
      });
      mutateCohort();
    } catch (err) {
      alert("Failed to remove instructor: " + (err.message || 'Unknown error'));
    }
    setLoading(false);
  };

  return (
    <div className={isFullscreen ? "fixed inset-0 z-50 bg-background flex flex-col p-4 sm:p-6 space-y-6 overflow-hidden" : "h-full flex flex-col bg-card border rounded-lg shadow-sm p-4 sm:p-6 overflow-hidden relative group"}>
      <div className="flex justify-between items-center pb-4 border-b shrink-0">
        <div>
          <h3 className="text-xl font-bold">Manage Instructors</h3>
          <p className="text-muted-foreground text-sm">{cohort.name} • {courseName}</p>
        </div>
        <div className="flex items-center gap-2">
          {isFullscreen ? (
            <Button variant="ghost" size="icon" onClick={() => setIsFullscreen(false)}>
              <Minimize2 className="w-5 h-5" />
            </Button>
          ) : (
            <Button variant="outline" size="icon" className="h-9 w-9 bg-background shadow-sm opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => setIsFullscreen(true)} title="Fullscreen View">
              <Maximize2 className="w-4 h-4 text-muted-foreground" />
            </Button>
          )}
          <Button variant="outline" onClick={onClose}>Back to Cohorts</Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 flex-1 min-h-0 overflow-hidden">
        {/* Enrolled Instructors */}
        <div className="flex flex-col min-h-0 border rounded-md">
          <div className="p-3 bg-secondary/30 border-b font-medium flex justify-between items-center">
            <span>Assigned Instructors ({assignedInstructors.length})</span>
          </div>
          <div className="p-2 overflow-y-auto flex-1">
            {assignedInstructors.length === 0 ? (
              <p className="text-sm text-muted-foreground p-2">No instructors assigned.</p>
            ) : (
              <ul className="space-y-1">
                {assignedInstructors.map(instructor => (
                  <li key={instructor.id} className="flex justify-between items-center p-2 hover:bg-muted/50 rounded-md text-sm border-b last:border-0">
                    <div>
                      <div className="font-medium">{instructor.first_name || instructor.last_name ? `${instructor.first_name} ${instructor.last_name}` : instructor.username}</div>
                      <div className="text-xs text-muted-foreground">{instructor.email}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleRemove(instructor.id)} disabled={loading} title="Remove">
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Add Instructors */}
        <div className="flex flex-col min-h-0 border rounded-md">
          <div className="p-3 bg-secondary/30 border-b font-medium">
            Assign Instructors
          </div>
          <div className="p-3 border-b bg-muted/20">
            <p className="text-xs text-muted-foreground mb-2">Select instructors to assign them to this cohort.</p>
            <StudentBulkSelector 
              users={users} 
              onSelectionChange={setSelectedIds} 
              existingStudentIds={assignedInstructors.map(i => i.id)}
            />
            <Button onClick={handleAssign} disabled={loading || selectedIds.length === 0} className="w-full mt-3">
              {loading ? "Assigning..." : `Assign ${selectedIds.length > 0 ? selectedIds.length : ''} Instructors`}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
