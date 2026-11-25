import React, { useEffect, useMemo, useState } from "react";
import {
  FileSpreadsheet,
  Download,
  CheckCircle2,
  ShieldCheck,
  Eye,
  Printer,
  X,
  History,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Save,
  Search,
  MoreHorizontal,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { customToast } from "../../components/GlobalPopup";
import { UniversalSelect } from "../../components/ui/UniversalSelect";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "../../components/ui/dropdown-menu";

function formatTimestamp(iso) {
  if (!iso) return "-";
  try {
    return new Date(iso).toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function computePreviewTotal(ca, exam, curriculumCode) {
  const caNum = ca === "" || ca === null || ca === undefined ? null : Number(ca);
  const examNum = exam === "" || exam === null || exam === undefined ? null : Number(exam);
  if (caNum === null && examNum === null) return { total: null, grade: "-" };
  const c = Number.isFinite(caNum) ? caNum : 0;
  const e = Number.isFinite(examNum) ? examNum : 0;
  const isUnebLower = curriculumCode === "UNEB_LOWER_SECONDARY";
  const total = Math.round((isUnebLower ? c * 0.2 + e * 0.8 : c * 0.3 + e * 0.7) * 10) / 10;
  let grade = "F";
  if (total >= 85) grade = "A+";
  else if (total >= 75) grade = "A";
  else if (total >= 65) grade = "B";
  else if (total >= 50) grade = "C";
  else if (total >= 40) grade = "D";
  return { total, grade };
}

function SortIcon({ active, dir }) {
  if (!active) return <ArrowUpDown className="w-3 h-3 text-gray-400 shrink-0" />;
  return dir === "asc" ? (
    <ArrowUp className="w-3 h-3 text-primary shrink-0" />
  ) : (
    <ArrowDown className="w-3 h-3 text-primary shrink-0" />
  );
}

export default function ReportCardsPage({ view = "list" }) {
  const { user, tenant, tenantSlug, effectiveRole } = useAuth();
  const slug =
    tenant?.subdomain && tenant.subdomain !== "root"
      ? tenant.subdomain
      : tenantSlug || "stmarys";
  const isAdminOrDos = effectiveRole === "PRINCIPAL" || effectiveRole === "DOS";

  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [allMarks, setAllMarks] = useState([]);
  const [reportCards, setReportCards] = useState([]);
  const [markLogs, setMarkLogs] = useState([]);
  const [previewData, setPreviewData] = useState(null);

  // Bulk Marksheet state
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [sheetSearch, setSheetSearch] = useState("");
  const [draftScores, setDraftScores] = useState({});
  const [savingBulk, setSavingBulk] = useState(false);
  const [sheetSort, setSheetSort] = useState({ key: "full_name", dir: "asc" });
  const [rcSort, setRcSort] = useState({ key: "class_position", dir: "asc" });

  async function loadAll() {
    const [sRes, mRes] = await Promise.all([
      fetch(`/api/academics/students/?tenant=${encodeURIComponent(slug)}`),
      fetch(`/api/academics/marks/?tenant=${encodeURIComponent(slug)}`),
    ]);
    if (sRes.ok) {
      const sData = await sRes.json();
      setStudents(sData.results || []);
    }
    if (mRes.ok) {
      const mData = await mRes.json();
      const loadedSubjects = mData.subjects || [];
      setSubjects(loadedSubjects);
      setAllMarks(mData.marks || []);
      setReportCards(mData.report_cards || []);
      setMarkLogs(mData.mark_audit_logs || []);
      if (!selectedSubjectId && loadedSubjects.length > 0) {
        setSelectedSubjectId(String(loadedSubjects[0].id));
      }
    }
  }

  useEffect(() => {
    loadAll();
  }, [slug]);

  const selectedSubject = useMemo(
    () => subjects.find((s) => String(s.id) === String(selectedSubjectId)) || null,
    [subjects, selectedSubjectId]
  );

  // Sync saved scores into draft map whenever subject or marks reload
  useEffect(() => {
    if (!selectedSubject) {
      setDraftScores({});
      return;
    }
    const existingByStudent = {};
    allMarks
      .filter((m) => String(m.subject_id) === String(selectedSubject.id))
      .forEach((m) => {
        existingByStudent[m.student_id] = {
          ca: String(m.ca_score ?? ""),
          exam: String(m.exam_score ?? ""),
          savedCa: String(m.ca_score ?? ""),
          savedExam: String(m.exam_score ?? ""),
          saved: true,
        };
      });
    setDraftScores(existingByStudent);
  }, [selectedSubject, allMarks]);

  const marksheetRows = useMemo(() => {
    if (!selectedSubject) return [];
    const q = sheetSearch.trim().toLowerCase();
    const classStudents = students.filter(
      (st) => String(st.class_stream_id) === String(selectedSubject.class_stream_id)
    );
    const list = (classStudents.length > 0 ? classStudents : students)
      .filter(
        (st) =>
          !q ||
          st.full_name.toLowerCase().includes(q) ||
          (st.registration_number || "").toLowerCase().includes(q)
      )
      .map((st) => {
        const entry = draftScores[st.id] || {
          ca: "",
          exam: "",
          savedCa: "",
          savedExam: "",
          saved: false,
        };
        const { total, grade } = computePreviewTotal(
          entry.ca,
          entry.exam,
          selectedSubject.curriculum_code
        );
        const dirty = entry.ca !== entry.savedCa || entry.exam !== entry.savedExam;
        return {
          ...st,
          ca: entry.ca,
          exam: entry.exam,
          total,
          grade,
          saved: entry.saved,
          dirty,
        };
      });

    const dirMult = sheetSort.dir === "asc" ? 1 : -1;
    return [...list].sort((a, b) => {
      const k = sheetSort.key;
      if (k === "total") {
        const av = a.total ?? -1;
        const bv = b.total ?? -1;
        return (av - bv) * dirMult;
      }
      if (k === "ca") {
        return ((Number(a.ca) || -1) - (Number(b.ca) || -1)) * dirMult;
      }
      if (k === "exam") {
        return ((Number(a.exam) || -1) - (Number(b.exam) || -1)) * dirMult;
      }
      const av = String(a[k] || "").toLowerCase();
      const bv = String(b[k] || "").toLowerCase();
      return av.localeCompare(bv) * dirMult;
    });
  }, [selectedSubject, students, draftScores, sheetSearch, sheetSort]);

  const dirtyRows = useMemo(
    () => marksheetRows.filter((r) => r.dirty && (r.ca !== "" || r.exam !== "")),
    [marksheetRows]
  );

  function toggleSheetSort(key) {
    setSheetSort((prev) =>
      prev.key === key
        ? { key, dir: prev.dir === "asc" ? "desc" : "asc" }
        : { key, dir: "asc" }
    );
  }

  function toggleRcSort(key) {
    setRcSort((prev) =>
      prev.key === key
        ? { key, dir: prev.dir === "asc" ? "desc" : "asc" }
        : { key, dir: "asc" }
    );
  }

  const sortedReportCards = useMemo(() => {
    const dirMult = rcSort.dir === "asc" ? 1 : -1;
    return [...reportCards].sort((a, b) => {
      const k = rcSort.key;
      if (k === "average_score" || k === "class_position") {
        return ((Number(a[k]) || 0) - (Number(b[k]) || 0)) * dirMult;
      }
      return String(a[k] || "").localeCompare(String(b[k] || "")) * dirMult;
    });
  }, [reportCards, rcSort]);

  function updateScore(studentId, field, rawVal) {
    const cleaned = rawVal === "" ? "" : String(Math.max(0, Math.min(100, Number(rawVal))));
    setDraftScores((prev) => {
      const current = prev[studentId] || {
        ca: "",
        exam: "",
        savedCa: "",
        savedExam: "",
        saved: false,
      };
      return {
        ...prev,
        [studentId]: { ...current, [field]: cleaned },
      };
    });
  }

  function handleEnterKey(e, rowIndex, field) {
    if (e.key === "Enter") {
      e.preventDefault();
      const next = document.querySelector(`[data-mark-cell="${field}-${rowIndex + 1}"]`);
      if (next) next.focus();
    }
  }

  async function handleSaveBulkMarks() {
    if (!selectedSubject) return;
    const rowsToSave =
      dirtyRows.length > 0
        ? dirtyRows
        : marksheetRows.filter((r) => r.ca !== "" || r.exam !== "");
    if (rowsToSave.length === 0) {
      customToast.error("Enter at least one student score before saving.");
      return;
    }

    setSavingBulk(true);
    try {
      const recordedBy = user
        ? `${user.full_name} (${user.email})`
        : `${effectiveRole} Portal User`;
      const token = localStorage.getItem("isoma_lms_access");
      const res = await fetch(`/api/academics/marks/bulk/?tenant=${encodeURIComponent(slug)}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Isoma-Role": effectiveRole,
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          subject_id: selectedSubject.id,
          recorded_by: recordedBy,
          entries: rowsToSave.map((r) => ({
            student_id: r.id,
            ca_score: r.ca === "" ? 0 : Number(r.ca),
            exam_score: r.exam === "" ? 0 : Number(r.exam),
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Could not save marks.");
      customToast.success(
        `Saved ${data.saved} student mark(s) for ${data.subject}. Timestamps logged for Admin.`
      );
      await loadAll();
    } catch (err) {
      customToast.error(err.message);
    } finally {
      setSavingBulk(false);
    }
  }

  async function openA4Preview(code) {
    const res = await fetch(`/api/academics/report-cards/${encodeURIComponent(code)}/preview/`);
    if (!res.ok) {
      customToast.error("Could not load report card preview.");
      return;
    }
    setPreviewData(await res.json());
  }

  const headerMeta = {
    list: {
      title: "Issued Report Cards",
      subtitle:
        "School-branded report card preview and downloadable QR-verified PDFs.",
      badge: `${reportCards.length} Issued`,
    },
    "enter-mark": {
      title: "Class Marksheet Entry",
      subtitle:
        "Pick a subject once, type scores directly beside every student, sort any column, and save all in one click.",
      badge: `${marksheetRows.length} Students`,
    },
    "audit-log": {
      title: "Teacher Marks Activity Audit Log",
      subtitle: "Chronological timestamped record of every mark added or updated by teachers.",
      badge: `${markLogs.length} Logs`,
    },
  }[view] || {
    title: "Issued Report Cards",
    subtitle: "Automated curriculum-weighted report cards.",
    badge: `${reportCards.length} Issued`,
  };

  return (
    <div className="flex-1 flex flex-col space-y-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-primary via-primary/60 to-primary" />
        <div className="px-6 py-5 md:px-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h1 className="text-lg md:text-2xl font-bold text-gray-900">
              {headerMeta.title}
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">{headerMeta.subtitle}</p>
          </div>
          <span className="text-xs font-bold text-primary shrink-0">{headerMeta.badge}</span>
        </div>
      </div>

      {view === "enter-mark" && (
        <div className="flex-1 bg-white rounded-t-2xl rounded-b-none shadow-sm border border-b-0 border-gray-100 p-5 md:p-6 space-y-4">
          {/* Subject Picker + Search + Save All Toolbar */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3 flex-1">
              <div className="w-full sm:w-80">
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Select Subject &amp; Class Stream
                </label>
                <UniversalSelect
                  value={selectedSubjectId}
                  onChange={setSelectedSubjectId}
                  options={subjects.map((sub) => ({
                    value: String(sub.id),
                    label: `${sub.name} - ${sub.class_stream_name}`,
                  }))}
                  placeholder="Choose subject..."
                  searchPlaceholder="Search subjects..."
                />
              </div>

              <div className="relative w-full sm:w-60">
                <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={sheetSearch}
                  onChange={(e) => setSheetSearch(e.target.value)}
                  placeholder="Filter student name or reg..."
                  className="w-full rounded-lg border border-gray-200 pl-8 pr-3 py-2 text-xs focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            <button
              type="button"
              disabled={savingBulk}
              onClick={handleSaveBulkMarks}
              className="inline-flex items-center justify-center gap-1.5 bg-primary text-white text-xs font-semibold py-2.5 px-5 rounded-lg hover:bg-primary-hover transition-colors shrink-0 disabled:opacity-60"
            >
              <Save className="w-3.5 h-3.5" />
              {savingBulk
                ? "Saving Marks..."
                : dirtyRows.length > 0
                ? `Save All Marks (${dirtyRows.length} changed)`
                : "Save All Marks"}
            </button>
          </div>

          <p className="text-[11px] text-gray-500">
            Tip: Press <span className="font-semibold text-gray-700">Enter</span> in any score box to jump straight to the next student. Click any column header to sort.
          </p>

          {/* Sortable Bulk Marksheet Table */}
          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 text-xs">
                  <th className="py-2.5 px-4 font-semibold w-10">#</th>
                  <th className="py-2.5 px-4 font-semibold">
                    <button
                      type="button"
                      onClick={() => toggleSheetSort("registration_number")}
                      className="inline-flex items-center gap-1 hover:text-primary"
                    >
                      Reg. Number
                      <SortIcon
                        active={sheetSort.key === "registration_number"}
                        dir={sheetSort.dir}
                      />
                    </button>
                  </th>
                  <th className="py-2.5 px-4 font-semibold">
                    <button
                      type="button"
                      onClick={() => toggleSheetSort("full_name")}
                      className="inline-flex items-center gap-1 hover:text-primary"
                    >
                      Student Name
                      <SortIcon active={sheetSort.key === "full_name"} dir={sheetSort.dir} />
                    </button>
                  </th>
                  <th className="py-2.5 px-4 font-semibold w-32">
                    <button
                      type="button"
                      onClick={() => toggleSheetSort("ca")}
                      className="inline-flex items-center gap-1 hover:text-primary"
                    >
                      CA / AOI
                      <SortIcon active={sheetSort.key === "ca"} dir={sheetSort.dir} />
                    </button>
                  </th>
                  <th className="py-2.5 px-4 font-semibold w-32">
                    <button
                      type="button"
                      onClick={() => toggleSheetSort("exam")}
                      className="inline-flex items-center gap-1 hover:text-primary"
                    >
                      Exam
                      <SortIcon active={sheetSort.key === "exam"} dir={sheetSort.dir} />
                    </button>
                  </th>
                  <th className="py-2.5 px-4 font-semibold text-center w-24">
                    <button
                      type="button"
                      onClick={() => toggleSheetSort("total")}
                      className="inline-flex items-center gap-1 hover:text-primary"
                    >
                      Total %
                      <SortIcon active={sheetSort.key === "total"} dir={sheetSort.dir} />
                    </button>
                  </th>
                  <th className="py-2.5 px-4 font-semibold text-center w-20">Grade</th>
                  <th className="py-2.5 px-4 font-semibold text-right w-24">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {marksheetRows.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 px-4 text-center text-gray-400">
                      No students found for this subject&apos;s class stream.
                    </td>
                  </tr>
                ) : (
                  marksheetRows.map((row, idx) => (
                    <tr
                      key={row.id}
                      className={`hover:bg-gray-50/80 transition-colors ${
                        row.dirty ? "bg-primary/[0.03]" : ""
                      }`}
                    >
                      <td className="py-2 px-4 text-gray-400 font-medium">{idx + 1}</td>
                      <td className="py-2 px-4 font-bold text-primary whitespace-nowrap">
                        {row.registration_number}
                      </td>
                      <td className="py-2 px-4 font-semibold text-gray-900 whitespace-nowrap">
                        {row.full_name}
                      </td>
                      <td className="py-2 px-4">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          placeholder="0-100"
                          data-mark-cell={`ca-${idx}`}
                          value={row.ca}
                          onChange={(e) => updateScore(row.id, "ca", e.target.value)}
                          onKeyDown={(e) => handleEnterKey(e, idx, "ca")}
                          className="w-24 rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-semibold text-gray-900 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                        />
                      </td>
                      <td className="py-2 px-4">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          placeholder="0-100"
                          data-mark-cell={`exam-${idx}`}
                          value={row.exam}
                          onChange={(e) => updateScore(row.id, "exam", e.target.value)}
                          onKeyDown={(e) => handleEnterKey(e, idx, "exam")}
                          className="w-24 rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-semibold text-gray-900 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                        />
                      </td>
                      <td className="py-2 px-4 text-center font-bold text-gray-900">
                        {row.total !== null ? `${row.total}%` : "-"}
                      </td>
                      <td className="py-2 px-4 text-center font-bold text-primary">
                        {row.grade}
                      </td>
                      <td className="py-2 px-4 text-right whitespace-nowrap">
                        {row.dirty ? (
                          <span className="text-[11px] font-bold text-amber-600">Unsaved</span>
                        ) : row.saved ? (
                          <span className="text-[11px] font-bold text-emerald-700">Saved</span>
                        ) : (
                          <span className="text-[11px] text-gray-400">Pending</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {view === "audit-log" && (
        <div className="flex-1 bg-white rounded-t-2xl rounded-b-none shadow-sm border border-b-0 border-gray-100 p-5 md:p-6">
          <div className="flex items-center gap-2 mb-4">
            <History className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-semibold text-gray-900">Marks Audit Trail</h2>
          </div>
          {!isAdminOrDos ? (
            <p className="text-xs text-gray-500">
              Only School Admin or Director of Studies can view the full teacher marks audit log.
            </p>
          ) : markLogs.length === 0 ? (
            <p className="text-xs text-gray-400">
              No marks logged yet. Every mark saved by a teacher appears here with who entered it and when.
            </p>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-gray-200">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 text-xs">
                    <th className="py-2.5 px-4 font-semibold">Student</th>
                    <th className="py-2.5 px-4 font-semibold">Subject</th>
                    <th className="py-2.5 px-4 font-semibold text-center">CA</th>
                    <th className="py-2.5 px-4 font-semibold text-center">Exam</th>
                    <th className="py-2.5 px-4 font-semibold text-center">Total / Grade</th>
                    <th className="py-2.5 px-4 font-semibold">Recorded By</th>
                    <th className="py-2.5 px-4 font-semibold text-right">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {markLogs.map((a) => (
                    <tr key={a.id} className="hover:bg-gray-50/80">
                      <td className="py-2.5 px-4 font-semibold text-gray-900">{a.student_name}</td>
                      <td className="py-2.5 px-4 text-gray-700">{a.subject_name}</td>
                      <td className="py-2.5 px-4 text-center text-gray-600">{a.ca_score}</td>
                      <td className="py-2.5 px-4 text-center text-gray-600">{a.exam_score}</td>
                      <td className="py-2.5 px-4 text-center font-bold text-primary">
                        {a.total_score}% ({a.grade})
                      </td>
                      <td className="py-2.5 px-4 font-medium text-gray-800">{a.recorded_by}</td>
                      <td className="py-2.5 px-4 text-right text-gray-500 whitespace-nowrap">
                        {formatTimestamp(a.recorded_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {view === "list" && (
        <div className="flex-1 bg-white rounded-t-2xl rounded-b-none shadow-sm border border-b-0 border-gray-100 p-5 md:p-6">
          <div className="flex items-center gap-2 mb-4">
            <ShieldCheck className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-semibold text-gray-900">
              Issued Report Cards
            </h2>
          </div>
          <div className="overflow-hidden rounded-xl border border-gray-200">
            <table className="w-full text-left text-xs border-collapse table-fixed">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 text-xs">
                  <th className="py-2.5 px-3 font-semibold">
                    <button
                      type="button"
                      onClick={() => toggleRcSort("student_name")}
                      className="inline-flex items-center gap-1 hover:text-primary"
                    >
                      Student
                      <SortIcon active={rcSort.key === "student_name"} dir={rcSort.dir} />
                    </button>
                  </th>
                  <th className="py-2.5 px-3 font-semibold hidden sm:table-cell w-[18%]">
                    <button
                      type="button"
                      onClick={() => toggleRcSort("registration_number")}
                      className="inline-flex items-center gap-1 hover:text-primary"
                    >
                      Reg. No
                      <SortIcon active={rcSort.key === "registration_number"} dir={rcSort.dir} />
                    </button>
                  </th>
                  <th className="py-2.5 px-3 font-semibold hidden md:table-cell w-[16%]">Class</th>
                  <th className="py-2.5 px-3 font-semibold text-center w-[15%] sm:w-[12%]">
                    <button
                      type="button"
                      onClick={() => toggleRcSort("average_score")}
                      className="inline-flex items-center gap-1 hover:text-primary"
                    >
                      Avg
                      <SortIcon active={rcSort.key === "average_score"} dir={rcSort.dir} />
                    </button>
                  </th>
                  <th className="py-2.5 px-3 font-semibold text-center hidden md:table-cell w-[11%]">
                    <button
                      type="button"
                      onClick={() => toggleRcSort("class_position")}
                      className="inline-flex items-center gap-1 hover:text-primary"
                    >
                      Pos
                      <SortIcon active={rcSort.key === "class_position"} dir={rcSort.dir} />
                    </button>
                  </th>
                  <th className="py-2.5 px-3 font-semibold hidden lg:table-cell w-[18%]">Verify Code</th>
                  <th className="py-2.5 px-3 font-semibold text-right w-14">More</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {sortedReportCards.map((rc) => (
                  <tr key={rc.id} className="hover:bg-gray-50/80">
                    <td className="py-2.5 px-3 font-bold text-gray-900 truncate" title={rc.student_name}>
                      {rc.student_name}
                    </td>
                    <td className="py-2.5 px-3 text-primary font-semibold hidden sm:table-cell truncate">
                      {rc.registration_number}
                    </td>
                    <td className="py-2.5 px-3 text-gray-700 hidden md:table-cell truncate">
                      {rc.class_stream_name}
                    </td>
                    <td className="py-2.5 px-3 text-center font-bold text-gray-900">
                      {rc.average_score}%
                    </td>
                    <td className="py-2.5 px-3 text-center text-gray-700 hidden md:table-cell">
                      {rc.class_position}/{rc.class_size}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-gray-600 hidden lg:table-cell truncate">
                      {rc.verification_code}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            type="button"
                            className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                            aria-label={`Actions for ${rc.student_name}`}
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="w-56 bg-white border border-gray-200 shadow-lg rounded-xl p-1.5"
                        >
                          <div className="px-2.5 py-1.5 border-b border-gray-100 mb-1 text-[11px] text-gray-500 space-y-0.5">
                            <p className="font-bold text-gray-900 truncate">{rc.student_name}</p>
                            <p className="truncate">{rc.registration_number} · {rc.class_stream_name}</p>
                            <p className="truncate">Position: {rc.class_position} / {rc.class_size} · {rc.verification_code}</p>
                          </div>
                          <DropdownMenuItem
                            onClick={() => openA4Preview(rc.verification_code)}
                            className="flex items-center gap-2 px-2.5 py-2 text-xs font-semibold text-gray-700 rounded-lg cursor-pointer hover:bg-primary/5 hover:text-primary"
                          >
                            <Eye className="w-3.5 h-3.5 text-primary" />
                            Preview Report Card
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            asChild
                            className="flex items-center gap-2 px-2.5 py-2 text-xs font-semibold text-primary rounded-lg cursor-pointer hover:bg-primary/5"
                          >
                            <a href={rc.pdf_url} target="_blank" rel="noreferrer">
                              <Download className="w-3.5 h-3.5" />
                              Download PDF
                            </a>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Live Standard A4 (210mm x 297mm, 20mm Margins) Report Card Preview Modal */}
      {previewData && (
        <div className="fixed inset-0 z-[200] bg-black/50 flex items-start justify-center overflow-y-auto p-4 sm:p-6">
          <div className="w-full max-w-[820px] space-y-3 my-auto">
            <div className="flex items-center justify-between rounded-xl bg-white px-4 py-3 shadow-lg border border-gray-200">
              <p className="text-xs font-bold text-gray-900">
                Report Card Preview
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:border-primary hover:text-primary"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print
                </button>
                <a
                  href={previewData.pdf_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary-hover"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download PDF
                </a>
                <button
                  type="button"
                  onClick={() => setPreviewData(null)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-100"
                  aria-label="Close preview"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="bg-white text-gray-900 shadow-2xl mx-auto w-full aspect-[210/297] p-[7.5%] flex flex-col justify-between border border-gray-200">
              <div className="border-2 border-primary p-5 sm:p-7 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-4 pb-4 border-b border-gray-200">
                    <div className="w-14 h-14 rounded-xl bg-primary text-white font-bold text-xl flex items-center justify-center shrink-0 shadow-sm">
                      {previewData.school.initials}
                    </div>
                    <div className="min-w-0">
                      <h2 className="text-base sm:text-xl font-bold text-primary tracking-tight uppercase">
                        {previewData.school.name}
                      </h2>
                      <p className="text-[11px] font-bold text-gray-800 uppercase tracking-wide mt-0.5">
                        Official Academic Report Card · {previewData.term}
                      </p>
                      <p className="text-[10px] text-gray-500 mt-0.5">
                        {previewData.school.email} · {previewData.school.phone} · {previewData.school.domain}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-3.5 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div>
                      <p className="font-bold text-gray-900">Student: {previewData.student.full_name}</p>
                      <p className="text-gray-600 mt-0.5">Reg. No: {previewData.student.registration_number}</p>
                      <p className="text-gray-600">Class: {previewData.student.class_stream}</p>
                    </div>
                    <div className="sm:text-right">
                      <p className="font-bold text-primary">Curriculum: {previewData.student.curriculum}</p>
                      <p className="text-gray-800 font-semibold mt-0.5">
                        Average: {previewData.average_score}% · Position: {previewData.class_position} of {previewData.class_size}
                      </p>
                      <p className="text-[10px] font-mono text-gray-500">ID: {previewData.verification_code}</p>
                    </div>
                  </div>

                  <div className="mt-4 overflow-x-auto border border-gray-200 rounded-lg">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-primary text-white">
                          <th className="py-2 px-3 font-semibold">Subject / Learning Area</th>
                          <th className="py-2 px-3 font-semibold text-right">CA / AOI</th>
                          <th className="py-2 px-3 font-semibold text-right">Exam</th>
                          <th className="py-2 px-3 font-semibold text-right">Total %</th>
                          <th className="py-2 px-3 font-semibold text-center">Grade</th>
                          <th className="py-2 px-3 font-semibold">Remark</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {(previewData.marks || []).map((m) => (
                          <tr key={m.id}>
                            <td className="py-2 px-3 font-medium text-gray-900">{m.subject_name}</td>
                            <td className="py-2 px-3 text-right text-gray-700">{m.ca_score}</td>
                            <td className="py-2 px-3 text-right text-gray-700">{m.exam_score}</td>
                            <td className="py-2 px-3 text-right font-bold text-gray-900">{m.total_score}</td>
                            <td className="py-2 px-3 text-center font-bold text-primary">{m.grade}</td>
                            <td className="py-2 px-3 text-gray-600">{m.remark}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="mt-5 space-y-2 text-xs">
                    <p>
                      <span className="font-bold text-gray-900">Class Teacher&apos;s Remark:</span>{" "}
                      <span className="text-gray-700">{previewData.class_teacher_remark}</span>
                    </p>
                    <p>
                      <span className="font-bold text-gray-900">Headteacher&apos;s Remark:</span>{" "}
                      <span className="text-gray-700">{previewData.headteacher_remark}</span>
                    </p>
                  </div>

                  <div className="mt-8 grid grid-cols-2 gap-8 text-[10px] text-gray-500">
                    <div className="border-t border-gray-300 pt-1.5">Class Teacher Signature</div>
                    <div className="border-t border-gray-300 pt-1.5">Headteacher / DOS Signature &amp; Stamp</div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200 flex items-center justify-between text-[10px] text-gray-500">
                  <div>
                    <p className="font-bold text-primary">
                      Official Electronic Report Card · {previewData.verification_code}
                    </p>
                    <p>Verify authenticity online at /verify/{previewData.verification_code}</p>
                  </div>
                  <div className="inline-flex items-center gap-1 font-bold text-primary">
                    <CheckCircle2 className="w-4 h-4" />
                    QR Verified PDF
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
