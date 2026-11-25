import { SearchableSelect } from "@/components/ui/SearchableSelect";
import React, { useState, useEffect } from "react";
import { FaUserPlus, FaFileUpload, FaSearch, FaDownload, FaTimes, FaCheckCircle, FaExclamationTriangle } from "react-icons/fa";
import { apiFetch } from "@/api/client/apiClient";

export default function StudentEnrollmentModal({ isOpen, onClose, courses = [], onEnrollSuccess }) {
  const [selectedCourseSlug, setSelectedCourseSlug] = useState("");
  const [activeTab, setActiveTab] = useState("dropdown"); // dropdown or csv
  const [searchQuery, setSearchQuery] = useState("");
  const [members, setMembers] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [enrollingMemberId, setEnrollingMemberId] = useState(null);

  const [newStudentEmail, setNewStudentEmail] = useState("");
  const [newStudentFirstName, setNewStudentFirstName] = useState("");
  const [newStudentLastName, setNewStudentLastName] = useState("");
  const [newStudentGender, setNewStudentGender] = useState("");
  const [enrollingNew, setEnrollingNew] = useState(false);

  const [csvFile, setCsvFile] = useState(null);
  const [uploadingCsv, setUploadingCsv] = useState(false);
  const [csvResult, setCsvResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  const fetchMembers = async (q) => {
    setLoadingMembers(true);
    try {
      const res = await apiFetch(`/api/courses/site-members/?q=${encodeURIComponent(q)}`);
      if (res.ok) {
        const data = await res.json();
        setMembers(data);
      }
    } catch (err) {
      console.error("Failed to fetch members", err);
    } finally {
      setLoadingMembers(false);
    }
  };

  useEffect(() => {
    if (isOpen && courses.length > 0 && !selectedCourseSlug) {
      setSelectedCourseSlug(courses[0].slug);
    }
    if (isOpen && activeTab === "dropdown") {
      fetchMembers("");
    }
  }, [isOpen, activeTab, courses, selectedCourseSlug]);

  const selectedCourse = courses.find(c => c.slug === selectedCourseSlug);
  const courseTitle = selectedCourse ? selectedCourse.title : "Select a course";
  const courseSlug = selectedCourseSlug;

  const handleSearchChange = (e) => {
    const q = e.target.value;
    setSearchQuery(q);
    fetchMembers(q);
  };

  const handleEnrollMember = async (member) => {
    setEnrollingMemberId(member.id);
    setErrorMsg("");
    try {
      const res = await apiFetch(`/api/courses/${courseSlug}/enroll-student/`, {
        method: "POST",
        body: JSON.stringify({ user_id: member.id }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to enroll student.");
      }

      if (onEnrollSuccess) onEnrollSuccess();
      alert(`Successfully enrolled ${member.full_name} (${member.email}) in ${courseTitle || "the course"}!`);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message);
    } finally {
      setEnrollingMemberId(null);
    }
  };

  const handleEnrollNewStudent = async (e) => {
    e.preventDefault();
    setEnrollingNew(true);
    setErrorMsg("");
    try {
      const res = await apiFetch(`/api/courses/${courseSlug}/enroll-student/`, {
        method: "POST",
        body: JSON.stringify({ 
          email: newStudentEmail,
          first_name: newStudentFirstName,
          last_name: newStudentLastName,
          gender: newStudentGender || undefined,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to enroll student.");
      }

      if (onEnrollSuccess) onEnrollSuccess();
      alert(`Successfully enrolled ${newStudentEmail} in ${courseTitle || "the course"}!`);
      // Reset form
      setNewStudentEmail("");
      setNewStudentFirstName("");
      setNewStudentLastName("");
      setNewStudentGender("");
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message);
    } finally {
      setEnrollingNew(false);
    }
  };

  const handleCsvSubmit = async (e) => {
    e.preventDefault();
    if (!csvFile) return;

    setUploadingCsv(true);
    setErrorMsg("");
    setCsvResult(null);

    try {
      const formData = new FormData();
      formData.append("file", csvFile);

      const token = localStorage.getItem("access_token");
      const res = await fetch(`/api/courses/${courseSlug}/enroll-csv/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to process CSV file.");

      setCsvResult(data);
      if (onEnrollSuccess) onEnrollSuccess();
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message);
    } finally {
      setUploadingCsv(false);
    }
  };

  const downloadSampleCsv = () => {
    const csvContent = "data:text/csv;charset=utf-8,email,first_name,last_name,other_names,phone\njohn.doe@example.com,John,Doe,K.,+256700000001\nmary.smith@example.com,Mary,Smith,Grace,+256700000002\n";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "sample_student_enrollment.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 font-['Inter',sans-serif]">
      <div className="bg-card border border-border w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border bg-muted/40 flex items-start justify-between">
          <div className="w-full max-w-[80%]">
            <h3 className="font-extrabold text-base text-foreground mb-2">Enroll Students</h3>
            <SearchableSelect
              value={selectedCourseSlug}
              onChange={(e) => setSelectedCourseSlug(e.target.value)}
              className="bg-background border border-border text-xs font-semibold rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary/50 text-foreground w-full cursor-pointer shadow-sm"
            >
              <option value="" disabled>-- Select a Course --</option>
              {courses.map(course => (
                <option key={course.slug} value={course.slug}>{course.title}</option>
              ))}
            </SearchableSelect>
          </div>
          <button
            onClick={onClose}
            className="p-2 mt-1 text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-colors cursor-pointer"
          >
            <FaTimes size={16} />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-border bg-muted/20 px-6 pt-3 gap-6 overflow-x-auto whitespace-nowrap scrollbar-hide shrink-0">
          <button
            onClick={() => setActiveTab("dropdown")}
            className={`pb-3 font-bold text-xs flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === "dropdown"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <FaUserPlus size={13} /> Site Members Dropdown
          </button>
          <button
            onClick={() => setActiveTab("new")}
            className={`pb-3 font-bold text-xs flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === "new"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <FaUserPlus size={13} /> Enroll New Student
          </button>
          <button
            onClick={() => setActiveTab("csv")}
            className={`pb-3 font-bold text-xs flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === "csv"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <FaFileUpload size={13} /> Bulk CSV Import
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 min-h-0">
          {errorMsg && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 text-red-500 rounded-xl text-xs font-bold flex items-center gap-2">
              <FaExclamationTriangle className="shrink-0" /> {errorMsg}
            </div>
          )}

          {/* Searchable Dropdown Tab */}
          {activeTab === "dropdown" && (
            <div className="space-y-4">
              <div className="relative">
                <FaSearch className="absolute left-3.5 top-3 text-muted-foreground" size={13} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  placeholder="Search site members by name or email..."
                  className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-xl text-xs font-medium focus:outline-none focus:border-primary"
                />
              </div>

              {loadingMembers ? (
                <div className="py-12 flex justify-center">
                  <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : members.length === 0 ? (
                <div className="py-8 text-center text-xs text-muted-foreground">
                  No site members found matching "{searchQuery}".
                </div>
              ) : (
                <div className="space-y-2 pr-1">
                  {members.map((m) => (
                    <div
                      key={m.id}
                      className="p-3 bg-background border border-border rounded-xl flex items-center justify-between gap-3 hover:border-primary/50 transition-colors"
                    >
                      <div className="min-w-0">
                        <span className="font-bold text-xs text-foreground block truncate">{m.full_name}</span>
                        <span className="text-[11px] text-muted-foreground block truncate">{m.email}</span>
                      </div>
                      <button
                        onClick={() => handleEnrollMember(m)}
                        disabled={enrollingMemberId === m.id}
                        className="px-3 py-1.5 bg-primary text-primary-foreground font-bold text-[11px] rounded-lg hover:opacity-90 transition-all shrink-0 cursor-pointer disabled:opacity-50"
                      >
                        {enrollingMemberId === m.id ? "Enrolling..." : "Enroll Student"}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Enroll New Student Tab */}
          {activeTab === "new" && (
            <form onSubmit={handleEnrollNewStudent} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-foreground mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={newStudentEmail}
                  onChange={(e) => setNewStudentEmail(e.target.value)}
                  placeholder="student@example.com"
                  className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-xs font-medium focus:outline-none focus:border-primary"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">First Name</label>
                  <input
                    type="text"
                    value={newStudentFirstName}
                    onChange={(e) => setNewStudentFirstName(e.target.value)}
                    placeholder="First Name"
                    className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-xs font-medium focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">Last Name</label>
                  <input
                    type="text"
                    value={newStudentLastName}
                    onChange={(e) => setNewStudentLastName(e.target.value)}
                    placeholder="Last Name"
                    className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-xs font-medium focus:outline-none focus:border-primary"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-foreground mb-1">Gender</label>
                <select
                  value={newStudentGender}
                  onChange={(e) => setNewStudentGender(e.target.value)}
                  className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-xs font-medium focus:outline-none focus:border-primary"
                >
                  <option value="">Select…</option>
                  <option value="M">Male</option>
                  <option value="F">Female</option>
                </select>
              </div>
              <button
                type="submit"
                disabled={enrollingNew || !newStudentEmail}
                className="w-full py-3 bg-primary text-primary-foreground font-bold text-xs rounded-xl shadow-md hover:opacity-90 transition-all cursor-pointer disabled:opacity-50"
              >
                {enrollingNew ? "Enrolling..." : "Create Account & Enroll"}
              </button>
            </form>
          )}

          {/* CSV File Upload Tab */}
          {activeTab === "csv" && (
            <div className="space-y-5">
              <div className="flex justify-between items-center bg-primary/5 border border-primary/20 p-3.5 rounded-xl">
                <div>
                  <h4 className="font-bold text-xs text-foreground">Need a CSV template?</h4>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Columns: email, first_name, last_name, other_names, phone</p>
                </div>
                <button
                  type="button"
                  onClick={downloadSampleCsv}
                  className="px-3 py-1.5 bg-card border border-border text-foreground font-bold text-[11px] rounded-lg hover:bg-muted transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer"
                >
                  <FaDownload size={11} /> Sample CSV
                </button>
              </div>

              <form onSubmit={handleCsvSubmit} className="space-y-4">
                <div className="border-2 border-dashed border-border rounded-2xl p-6 text-center hover:border-primary/60 transition-colors bg-muted/10">
                  <FaFileUpload className="text-3xl text-muted-foreground mx-auto mb-2" />
                  <span className="text-xs font-bold text-foreground block mb-1">
                    {csvFile ? csvFile.name : "Choose or drag CSV file here"}
                  </span>
                  <span className="text-[11px] text-muted-foreground block mb-4">
                    Supports .csv format. Existing members will be enrolled directly.
                  </span>
                  <label className="px-4 py-2 bg-secondary text-secondary-foreground font-bold text-xs rounded-xl cursor-pointer hover:bg-secondary/80 transition-colors inline-block">
                    Browse File
                    <input
                      type="file"
                      accept=".csv"
                      onChange={(e) => setCsvFile(e.target.files[0])}
                      className="hidden"
                    />
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={!csvFile || uploadingCsv}
                  className="w-full py-3 bg-primary text-primary-foreground font-bold text-xs rounded-xl shadow-md hover:opacity-90 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40"
                >
                  {uploadingCsv ? "Uploading & Enrolling Students..." : "Upload CSV & Enroll Students 🚀"}
                </button>
              </form>

              {csvResult && (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl space-y-2 text-xs text-foreground">
                  <div className="font-extrabold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                    <FaCheckCircle /> {csvResult.message}
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    Total Enrolled: {csvResult.enrolled_count} | New Accounts Created: {csvResult.new_accounts_created}
                  </div>
                  {csvResult.errors && csvResult.errors.length > 0 && (
                    <div className="pt-2 border-t border-emerald-500/20 text-red-500 text-[11px]">
                      <strong>Warnings:</strong>
                      <ul className="list-disc list-inside mt-1 space-y-0.5">
                        {csvResult.errors.map((err, idx) => (
                          <li key={idx}>{err}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
