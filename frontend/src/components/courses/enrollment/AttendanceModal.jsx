import React, { useState, useEffect, useMemo } from "react";
import { apiFetch } from "@/api/client/apiClient";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import DelayedSpinner from "@/components/notifications/DelayedSpinner";
import { toast } from "sonner";
import { Check, X, ArrowUpDown, Search, MoreHorizontal, UserMinus, UserX, Trash2, ArrowRightLeft, FileSpreadsheet } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

function displayName(student) {
  const named =
    student.full_name ||
    `${student.first_name || ""} ${student.last_name || ""}`.trim();
  if (named) return named;
  const email = student.email || student.username || "";
  if (email.includes("@")) {
    return email
      .split("@")[0]
      .replace(/[._+\-]+/g, " ")
      .replace(/\d+/g, " ")
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(" ");
  }
  return student.username || "Student";
}

export default function AttendanceModal({ cohort, students, onClose, onSaved }) {
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [attendanceData, setAttendanceData] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState("name"); // name | status
  const [sortDir, setSortDir] = useState("asc");

  const { me } = useAuth();
  const isSuperAdmin = me?.is_superuser;

  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [studentToTransfer, setStudentToTransfer] = useState(null);
  const [activeCohorts, setActiveCohorts] = useState([]);
  const [selectedTargetCohort, setSelectedTargetCohort] = useState("");

  const handleExportCSV = async () => {
    try {
      const res = await apiFetch(`/api/admin/cohorts/${cohort.id}/attendance/`);
      const allData = await res.json();
      if (!Array.isArray(allData)) throw new Error("Invalid data format");
      
      const dates = Array.from(new Set(allData.map(d => d.date))).sort();
      const byStudent = {};
      students.forEach(s => {
         byStudent[s.id] = { name: displayName(s), records: {} };
      });
      allData.forEach(d => {
         if (byStudent[d.student_id]) {
            byStudent[d.student_id].records[d.date] = d.is_present;
         }
      });
      
      let csv = "Student Name," + dates.join(",") + "\\n";
      Object.values(byStudent).forEach(s => {
         const row = [s.name.replace(/,/g, "")];
         dates.forEach(d => {
             row.push(s.records[d] ? "Present" : "Absent");
         });
         csv += row.join(",") + "\\n";
      });
      
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Attendance_${cohort.name.replace(/[^a-zA-Z0-9]/g, "_")}.csv`;
      link.click();
    } catch (err) {
      toast.error("Failed to export CSV");
    }
  };

  const handleRemoveFromClass = async (student) => {
    if (!window.confirm(`Remove ${displayName(student)} from this cohort?`)) return;
    try {
      const res = await apiFetch(`/api/admin/cohorts/${cohort.id}/remove-student/`, {
        method: "POST",
        body: JSON.stringify({ student_id: student.id })
      });
      if (res.ok) {
        toast.success("Student removed from cohort");
        onSaved?.();
      } else throw new Error("Failed to remove");
    } catch (e) {
      toast.error(e.message);
    }
  };

  const handleRemoveFromCourse = async (student) => {
    if (!window.confirm(`Unenroll ${displayName(student)} from the entire course?`)) return;
    try {
      const res = await apiFetch(`/api/admin/users/${student.id}/unenroll-course/`, {
        method: "POST",
        body: JSON.stringify({ course_id: cohort.course_id || cohort.course?.id })
      });
      if (res.ok) {
        toast.success("Student unenrolled from course");
        onSaved?.();
      } else throw new Error("Failed to unenroll");
    } catch (e) {
      toast.error(e.message);
    }
  };

  const handleDeleteAccount = async (student) => {
    if (!window.confirm(`PERMANENTLY DELETE account for ${displayName(student)}? This cannot be undone.`)) return;
    try {
      const res = await apiFetch(`/api/admin/users/${student.id}/`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Account deleted");
        onSaved?.();
      } else throw new Error("Failed to delete account");
    } catch (e) {
      toast.error(e.message);
    }
  };

  const handleOpenTransfer = async (student) => {
    setStudentToTransfer(student);
    setTransferModalOpen(true);
    try {
      const res = await apiFetch(`/api/admin/cohorts/?is_active=true`);
      const data = await res.json();
      setActiveCohorts(data.results || data);
    } catch (e) {
      toast.error("Failed to load cohorts");
    }
  };

  const handleTransferSubmit = async () => {
    if (!selectedTargetCohort) return toast.error("Select a target cohort");
    try {
      // 1. Remove from current
      await apiFetch(`/api/admin/cohorts/${cohort.id}/remove-student/`, {
        method: "POST",
        body: JSON.stringify({ student_id: studentToTransfer.id })
      });
      // 2. Add to new
      await apiFetch(`/api/admin/cohorts/${selectedTargetCohort}/add-student/`, {
        method: "POST",
        body: JSON.stringify({ student_ids: [studentToTransfer.id] })
      });
      toast.success("Student transferred successfully");
      setTransferModalOpen(false);
      onSaved?.();
    } catch (e) {
      toast.error("Failed to transfer");
    }
  };

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    const initialData = {};
    students.forEach((s) => {
      initialData[s.id] = true;
    });

    apiFetch(`/api/admin/cohorts/${cohort.id}/attendance/?date=${date}`)
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted) return;
        if (Array.isArray(data) && data.length > 0) {
          const fetchedData = {};
          data.forEach((r) => {
            fetchedData[r.student_id] = r.is_present;
          });
          students.forEach((s) => {
            initialData[s.id] =
              fetchedData[s.id] !== undefined ? fetchedData[s.id] : true;
          });
        }
        setAttendanceData(initialData);
        setLoading(false);
      })
      .catch(() => {
        if (!isMounted) return;
        toast.error("Failed to load attendance");
        setAttendanceData(initialData);
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [date, cohort.id, students.length]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const records = Object.keys(attendanceData).map((id) => ({
        student_id: parseInt(id, 10),
        is_present: attendanceData[id],
      }));

      const res = await apiFetch(`/api/admin/cohorts/${cohort.id}/record-attendance/`, {
        method: "POST",
        body: JSON.stringify({ date, records }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to save attendance");
      }

      toast.success("Attendance recorded successfully");
      onSaved?.();
      onClose();
    } catch (err) {
      toast.error(err.message || "Failed to save attendance");
    } finally {
      setSaving(false);
    }
  };

  const toggleAll = (present) => {
    const newData = { ...attendanceData };
    Object.keys(newData).forEach((id) => {
      newData[id] = present;
    });
    setAttendanceData(newData);
  };

  const toggleSort = (key) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(key === "name" ? "asc" : "desc");
    }
  };

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = students.map((s) => ({
      ...s,
      _name: displayName(s),
      _present: !!attendanceData[s.id],
    }));
    if (q) {
      list = list.filter(
        (s) =>
          s._name.toLowerCase().includes(q) ||
          (s.email || "").toLowerCase().includes(q) ||
          (s.username || "").toLowerCase().includes(q)
      );
    }
    const dir = sortDir === "asc" ? 1 : -1;
    list.sort((a, b) => {
      if (sortKey === "status") {
        if (a._present === b._present) return a._name.localeCompare(b._name) * dir;
        return (a._present === b._present ? 0 : a._present ? -1 : 1) * dir;
      }
      return a._name.localeCompare(b._name) * dir;
    });
    return list;
  }, [students, attendanceData, query, sortKey, sortDir]);

  const presentCount = Object.values(attendanceData).filter(Boolean).length;
  const absentCount = students.length - presentCount;

  return (
    <Dialog open={true} onOpenChange={(open) => !open && !saving && onClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[90dvh] flex flex-col gap-3 p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="truncate">Take Attendance - {cohort.name}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <label className="text-sm font-medium shrink-0">Date</label>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-auto"
            />
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-500/10 px-2 py-1 rounded-md">
              {presentCount} present
            </span>
            <span className="text-xs font-semibold text-red-600 bg-red-500/10 px-2 py-1 rounded-md">
              {absentCount} absent
            </span>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button size="sm" variant="secondary" onClick={handleExportCSV}>
              <FileSpreadsheet className="w-4 h-4 mr-1.5" />
              Export CSV
            </Button>
            <Button size="sm" variant="outline" onClick={() => toggleAll(true)}>
              All Present
            </Button>
            <Button size="sm" variant="outline" onClick={() => toggleAll(false)}>
              All Absent
            </Button>
          </div>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search students…"
            className="pl-9"
          />
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto border rounded-md">
          {loading ? (
            <div className="flex justify-center p-8">
              <DelayedSpinner />
            </div>
          ) : rows.length === 0 ? (
            <p className="p-6 text-sm text-muted-foreground text-center">No students found.</p>
          ) : (
            <table className="w-full text-sm text-left">
              <thead className="bg-secondary/80 sticky top-0 z-10">
                <tr>
                  <th className="px-3 py-2 w-10 text-muted-foreground">#</th>
                  <th className="px-3 py-2">
                    <button
                      type="button"
                      onClick={() => toggleSort("name")}
                      className="inline-flex items-center gap-1 font-semibold hover:text-foreground"
                    >
                      Student <ArrowUpDown className="w-3.5 h-3.5 opacity-60" />
                    </button>
                  </th>
                  <th className="px-3 py-2 text-center">
                    <button
                      type="button"
                      onClick={() => toggleSort("status")}
                      className="inline-flex items-center gap-1 font-semibold hover:text-foreground mx-auto"
                    >
                      Status <ArrowUpDown className="w-3.5 h-3.5 opacity-60" />
                    </button>
                  </th>
                  {isSuperAdmin && <th className="px-3 py-2 text-right w-12"></th>}
                </tr>
              </thead>
              <tbody>
                {rows.map((student, idx) => (
                  <tr key={student.id} className="border-t hover:bg-muted/30">
                    <td className="px-3 py-2.5 text-xs tabular-nums text-muted-foreground">
                      {idx + 1}
                    </td>
                    <td className="px-3 py-2.5 font-medium truncate max-w-[14rem] sm:max-w-none">
                      {student._name}
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      <button
                        type="button"
                        onClick={() =>
                          setAttendanceData({
                            ...attendanceData,
                            [student.id]: !attendanceData[student.id],
                          })
                        }
                        className={`px-3 py-1 rounded-md text-xs font-semibold inline-flex items-center justify-center gap-1 transition-colors ${
                          attendanceData[student.id]
                            ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                            : "bg-red-100 text-red-700 border border-red-200"
                        }`}
                      >
                        {attendanceData[student.id] ? (
                          <>
                            <Check className="w-3 h-3" /> Present
                          </>
                        ) : (
                          <>
                            <X className="w-3 h-3" /> Absent
                          </>
                        )}
                      </button>
                    </td>
                    {isSuperAdmin && (
                      <td className="px-3 py-2.5 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleRemoveFromClass(student)}>
                              <UserMinus className="w-4 h-4 mr-2 text-orange-600" />
                              Remove from Cohort
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleRemoveFromCourse(student)}>
                              <UserX className="w-4 h-4 mr-2 text-red-600" />
                              Remove from Course
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleOpenTransfer(student)}>
                              <ArrowRightLeft className="w-4 h-4 mr-2 text-blue-600" />
                              Transfer to Another Cohort
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDeleteAccount(student)} className="text-red-600 focus:bg-red-50 focus:text-red-600">
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete Account
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t">
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving || loading || students.length === 0}>
            {saving ? "Saving…" : "Save Attendance"}
          </Button>
        </div>
      </DialogContent>

      {transferModalOpen && (
        <Dialog open={transferModalOpen} onOpenChange={setTransferModalOpen}>
          <DialogContent className="sm:max-w-sm">
            <DialogHeader>
              <DialogTitle>Transfer {studentToTransfer?._name}</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <label className="block text-sm font-medium mb-2">Select Target Cohort</label>
              <select
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={selectedTargetCohort}
                onChange={(e) => setSelectedTargetCohort(e.target.value)}
              >
                <option value="">-- Choose Cohort --</option>
                {activeCohorts.filter(c => c.id !== cohort.id).map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setTransferModalOpen(false)}>Cancel</Button>
              <Button onClick={handleTransferSubmit}>Transfer</Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </Dialog>
  );
}
