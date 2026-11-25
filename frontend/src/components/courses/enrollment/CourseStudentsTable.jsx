import { useState, useMemo } from "react";
import useSWR from "swr";
import { 
  Search, 
  ArrowLeft, 
  Mail, 
  Trash2, 
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  User as UserIcon,
  MessageSquare,
  BookOpen,
  Users,
  ArrowUpDown,
  ArrowUp,
  ArrowDown
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { TableRowMore, TableRowMoreField } from "@/components/ui/TableRowMore";
import UserProfileModal from "@/components/profile/UserProfileModal";
import EnrollmentManagementModal from "@/components/courses/enrollment/EnrollmentManagementModal";
import { apiFetch, swrFetcher } from "@/api/client/apiClient";

export default function CourseStudentsTable({ courseId, courseTitle, onBack }) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [messagingStudent, setMessagingStudent] = useState(null);
  const [messageSubject, setMessageSubject] = useState("");
  const [messageContent, setMessageContent] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  
  const [profileModalUser, setProfileModalUser] = useState(null);
  const [enrollmentModalUser, setEnrollmentModalUser] = useState(null);
  const [loadingUserForModal, setLoadingUserForModal] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const url = courseId
    ? `/api/courses/${courseId}/enrollments/?page=${page}${search ? `&search=${encodeURIComponent(search)}` : ""}`
    : null;
  const { data, error, isLoading, mutate } = useSWR(url, swrFetcher);

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

  const sortedResults = useMemo(() => {
    if (!data?.results) return [];
    const list = [...data.results];
    if (!sortConfig.key) return list;
    const dir = sortConfig.direction === 'asc' ? 1 : -1;
    list.sort((a, b) => {
      if (sortConfig.key === 'student') {
        const nameA = (a.student_name || "").toLowerCase();
        const nameB = (b.student_name || "").toLowerCase();
        return nameA.localeCompare(nameB) * dir;
      }
      if (sortConfig.key === 'enrolled') {
        const timeA = a.enrolled_at ? new Date(a.enrolled_at).getTime() : 0;
        const timeB = b.enrolled_at ? new Date(b.enrolled_at).getTime() : 0;
        return (timeA - timeB) * dir;
      }
      if (sortConfig.key === 'method') {
        const methA = (a.method || "").toLowerCase();
        const methB = (b.method || "").toLowerCase();
        return methA.localeCompare(methB) * dir;
      }
      if (sortConfig.key === 'progress') {
        const pA = a.progress_percent || 0;
        const pB = b.progress_percent || 0;
        return (pA - pB) * dir;
      }
      return 0;
    });
    return list;
  }, [data?.results, sortConfig]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const handleClearSearch = () => {
    setSearch("");
    setSearchInput("");
    setPage(1);
  };

  const handleRevoke = async (enrollmentId, studentName) => {
    if (!window.confirm(`Are you sure you want to revoke access for ${studentName}?`)) return;
    try {
      const res = await apiFetch(`/api/admin/enrollments/${enrollmentId}/`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to revoke access");
      toast.success(`Access revoked for ${studentName}`);
      mutate();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleReset = async (enrollmentId, studentName) => {
    if (!window.confirm(`Are you sure you want to reset progress for ${studentName}?`)) return;
    try {
      const res = await apiFetch(`/api/admin/enrollments/${enrollmentId}/reset-progress/`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed to reset progress");
      toast.success(`Progress reset for ${studentName}`);
      mutate();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleSendMessage = async () => {
    if (!messageSubject || !messageContent) {
      toast.error("Subject and message are required.");
      return;
    }
    setSendingMessage(true);
    try {
      const res = await apiFetch(`/api/admin/enrollments/${messagingStudent.id}/message/`, {
        method: "POST",
        body: JSON.stringify({
          subject: messageSubject,
          message: messageContent
        })
      });
      if (!res.ok) throw new Error("Failed to send message");
      toast.success(`Message sent to ${messagingStudent.student_name}`);
      setMessagingStudent(null);
      setMessageSubject("");
      setMessageContent("");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSendingMessage(false);
    }
  };

  const openProfileModal = async (userId) => {
    setLoadingUserForModal(true);
    try {
      const res = await apiFetch(`/api/admin/users/${userId}/`);
      const userData = await res.json();
      if (res.ok) {
        setProfileModalUser(userData);
      } else {
        toast.error("Failed to load user profile");
      }
    } catch (err) {
      toast.error(err.message || "Failed to load user profile");
    } finally {
      setLoadingUserForModal(false);
    }
  };

  const openEnrollmentModal = async (userId) => {
    setLoadingUserForModal(true);
    try {
      const res = await apiFetch(`/api/admin/users/${userId}/`);
      const userData = await res.json();
      if (res.ok) {
        setEnrollmentModalUser(userData);
      } else {
        toast.error("Failed to load user");
      }
    } catch (err) {
      toast.error(err.message || "Failed to load user");
    } finally {
      setLoadingUserForModal(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500 h-full">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card p-4 sm:p-6 rounded-xl border border-border shadow-sm shrink-0">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <button 
              onClick={onBack}
              className="p-1.5 hover:bg-muted rounded-full transition-colors text-muted-foreground hover:text-foreground"
              title="Back to Courses"
            >
              <ArrowLeft size={18} />
            </button>
            <h2 className="text-lg sm:text-xl font-bold text-foreground line-clamp-1">
              Students: {courseTitle}
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground ml-8">
            Manage enrollments, track progress, and view purchase history.
          </p>
        </div>
        
        <form onSubmit={handleSearch} className="relative w-full sm:w-auto">
          <input 
            type="text" 
            placeholder="Search students..." 
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full sm:w-64 pl-9 pr-8 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
          />
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          {search && (
            <button 
              type="button" 
              onClick={handleClearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground text-xs font-bold"
            >
              ✕
            </button>
          )}
        </form>
      </div>

      {/* Table section */}
      <div className="rounded-xl border border-border bg-card flex flex-col flex-1 min-h-0 shadow-sm">
        <div className="overflow-y-auto overflow-x-hidden flex-1 custom-scrollbar min-w-0">
          <table className="w-full table-fixed text-left border-collapse text-sm relative">
            <thead className="bg-secondary text-muted-foreground border-b sticky top-0 z-10">
              <tr>
                <th className="px-3 py-3 font-medium text-muted-foreground sm:px-4 cursor-pointer select-none" onClick={() => handleSort('student')}>
                  <span>Student</span> <SortIcon columnKey="student" />
                </th>
                <th className="hidden px-3 py-3 font-medium text-muted-foreground md:table-cell sm:px-4 cursor-pointer select-none" onClick={() => handleSort('enrolled')}>
                  <span>Enrolled</span> <SortIcon columnKey="enrolled" />
                </th>
                <th className="hidden px-3 py-3 font-medium text-muted-foreground lg:table-cell sm:px-4 cursor-pointer select-none" onClick={() => handleSort('method')}>
                  <span>Method</span> <SortIcon columnKey="method" />
                </th>
                <th className="w-28 px-3 py-3 font-medium text-muted-foreground sm:w-40 sm:px-4 cursor-pointer select-none" onClick={() => handleSort('progress')}>
                  <span>Progress</span> <SortIcon columnKey="progress" />
                </th>
                <th className="w-10 px-1 py-3 font-medium text-muted-foreground text-right">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center">
                    <RefreshCw className="w-6 h-6 animate-spin text-primary mx-auto" />
                    <p className="text-muted-foreground text-sm mt-2">Loading students...</p>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-red-500">
                    Failed to load enrollments.
                  </td>
                </tr>
              ) : sortedResults.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center">
                    <div className="w-12 h-12 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-3">
                      <UserIcon size={24} className="text-muted-foreground" />
                    </div>
                    <p className="text-foreground font-medium">No students found</p>
                    <p className="text-muted-foreground text-sm">
                      {search ? "No one matches your search query." : "No one has enrolled in this course yet."}
                    </p>
                  </td>
                </tr>
              ) : (
                sortedResults.map((enrollment) => (
                  <tr key={enrollment.id} className="border-b border-border hover:bg-muted/20 transition-colors last:border-b-0 group">
                    {/* Student Column */}
                    <td className="min-w-0 px-3 py-3 sm:px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex-shrink-0 overflow-hidden border border-border/50">
                          {enrollment.student_avatar ? (
                            <img src={enrollment.student_avatar} alt={enrollment.student_name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-primary font-bold text-sm uppercase">
                              {enrollment.student_name?.charAt(0) || "U"}
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-semibold text-foreground truncate" title={enrollment.student_name}>
                              {enrollment.student_name}
                            </p>
                            {enrollment.cohort_name ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary border border-primary/20 shrink-0" title={`Cohort: ${enrollment.cohort_name}`}>
                                <Users size={10} />
                                <span className="truncate max-w-[130px] sm:max-w-none">{enrollment.cohort_name}</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] text-muted-foreground bg-muted shrink-0">
                                No Cohort
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground truncate" title={enrollment.student_email}>
                            {enrollment.student_email}
                          </p>
                          {/* Mobile-only date & method */}
                          <div className="flex md:hidden items-center gap-2 pt-1 text-[11px] text-muted-foreground flex-wrap">
                            <span>{new Date(enrollment.enrolled_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                            <span>•</span>
                            <span className="font-medium text-foreground">{enrollment.method}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Date Column */}
                    <td className="hidden px-3 py-3 text-muted-foreground md:table-cell sm:px-4">
                      {new Date(enrollment.enrolled_at).toLocaleDateString("en-US", {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </td>

                    {/* Method Column */}
                    <td className="hidden px-3 py-3 lg:table-cell sm:px-4">
                      {enrollment.method.includes("Pesapal") ? (
                        <span className="inline-flex items-center px-2 py-1 rounded bg-green-500/10 text-green-600 dark:text-green-400 text-xs font-bold border border-green-500/20">
                          {enrollment.method}
                        </span>
                      ) : enrollment.method.includes("Coupon") ? (
                        <span className="inline-flex items-center px-2 py-1 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-bold border border-amber-500/20">
                          {enrollment.method}
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900 text-xs font-bold shadow-sm">
                          {enrollment.method}
                        </span>
                      )}
                    </td>

                    {/* Progress Column */}
                    <td className="px-3 py-3 sm:px-4">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden min-w-0">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${
                              enrollment.progress_percent === 100 ? "bg-green-500" : "bg-primary"
                            }`}
                            style={{ width: `${enrollment.progress_percent || 0}%` }}
                          />
                        </div>
                        <span className="text-xs font-semibold shrink-0">
                          {enrollment.progress_percent || 0}%
                        </span>
                      </div>
                    </td>

                    {/* Actions Column */}
                    <td className="px-1 py-3 text-right">
                      <TableRowMore label="Student actions" contentClassName="w-52">
                        <TableRowMoreField label="Cohort">
                          {enrollment.cohort_name || "No Cohort"}
                        </TableRowMoreField>
                        <TableRowMoreField label="Enrolled" className="md:hidden">
                          {new Date(enrollment.enrolled_at).toLocaleDateString()}
                        </TableRowMoreField>
                        <TableRowMoreField label="Method" className="lg:hidden">
                          {enrollment.method}
                        </TableRowMoreField>
                        <DropdownMenuItem onSelect={() => openProfileModal(enrollment.student_id || enrollment.user_id || enrollment.user)}>
                          <UserIcon className="w-4 h-4" /> Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => openEnrollmentModal(enrollment.student_id || enrollment.user_id || enrollment.user)}>
                          <BookOpen className="w-4 h-4" /> Courses
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => {
                          setMessagingStudent(enrollment);
                          setMessageSubject("");
                          setMessageContent("");
                        }}>
                          <MessageSquare className="w-4 h-4" /> Message
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onSelect={() => handleReset(enrollment.id, enrollment.student_name)}>
                          <RefreshCw className="w-4 h-4" /> Reset progress
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onSelect={() => handleRevoke(enrollment.id, enrollment.student_name)}
                        >
                          <Trash2 className="w-4 h-4" /> Revoke access
                        </DropdownMenuItem>
                      </TableRowMore>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {data?.count > 0 && (
          <div className="p-4 border-t border-border flex items-center justify-between bg-muted/20 shrink-0">
            <span className="text-sm text-muted-foreground">
              Showing <span className="font-medium text-foreground">{(page - 1) * 20 + 1}</span> to <span className="font-medium text-foreground">{Math.min(page * 20, data.count)}</span> of <span className="font-medium text-foreground">{data.count}</span> students
            </span>
            <div className="flex gap-2">
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={!data?.previous}
                className="p-2 border border-border rounded-md hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              <button 
                onClick={() => setPage(p => p + 1)}
                disabled={!data?.next}
                className="p-2 border border-border rounded-md hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Message Modal */}
      {messagingStudent && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="bg-card w-full max-w-md rounded-xl border border-border shadow-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-border font-bold">
              Message {messagingStudent.student_name}
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Subject</label>
                <input
                  type="text"
                  value={messageSubject}
                  onChange={(e) => setMessageSubject(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="Enter message subject"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Message</label>
                <textarea
                  value={messageContent}
                  onChange={(e) => setMessageContent(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[120px] resize-y"
                  placeholder="Enter message content"
                />
              </div>
            </div>
            <div className="p-4 border-t border-border flex justify-end gap-3 bg-muted/20">
              <Button variant="outline" onClick={() => setMessagingStudent(null)} disabled={sendingMessage}>
                Cancel
              </Button>
              <Button onClick={handleSendMessage} disabled={sendingMessage}>
                {sendingMessage ? "Sending..." : "Send Message"}
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {profileModalUser && (
        <UserProfileModal 
          isOpen={!!profileModalUser} 
          onClose={() => setProfileModalUser(null)} 
          user={profileModalUser} 
          onUpdate={() => openProfileModal(profileModalUser.id)}
        />
      )}

      {enrollmentModalUser && (
        <EnrollmentManagementModal 
          isOpen={!!enrollmentModalUser} 
          onClose={() => setEnrollmentModalUser(null)} 
          user={enrollmentModalUser} 
        />
      )}
    </div>
  );
}
