import React, { useEffect, useState } from "react";
import { UserPlus, Users, Plus, Eye, MoreHorizontal } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { customToast } from "../../components/GlobalPopup";
import { UniversalSelect } from "../../components/ui/UniversalSelect";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "../../components/ui/dropdown-menu";
import Student360Modal from "../../components/Student360Modal";
import StudentRegistrationWizard from "../../components/forms/StudentRegistrationWizard";

export default function AdmissionsPage({ view = "list" }) {
  const { tenant, tenantSlug, effectiveRole } = useAuth();
  const isTeacher = effectiveRole === "TEACHER";
  const slug =
    tenant?.subdomain && tenant.subdomain !== "root"
      ? tenant.subdomain
      : tenantSlug || "stmarys";
  const allowedCurricula = tenant?.curricula?.length
    ? tenant.curricula
    : [tenant?.curriculum || "UNEB_LOWER_SECONDARY"];

  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [catalog, setCatalog] = useState([]);
  const [assignedSubjects, setAssignedSubjects] = useState([]);
  const [viewingStudentId, setViewingStudentId] = useState(null);
  const [assignStreamId, setAssignStreamId] = useState("");
  const [selectedCatalogIds, setSelectedCatalogIds] = useState([]);
  const [studentForm, setStudentForm] = useState({
    full_name: "",
    gender: "Female",
    class_stream_id: "",
    parent_name: "",
    parent_phone: "",
    parent_email: "",
  });
  const [classForm, setClassForm] = useState({
    name: "",
    curriculum_code: allowedCurricula[0],
    class_teacher_name: "",
  });

  async function loadAll() {
    const [cRes, sRes, catRes, mRes] = await Promise.all([
      fetch(`/api/academics/classes/?tenant=${encodeURIComponent(slug)}`),
      fetch(`/api/academics/students/?tenant=${encodeURIComponent(slug)}`),
      fetch(`/api/academics/subject-catalog/?tenant=${encodeURIComponent(slug)}`),
      fetch(`/api/academics/marks/?tenant=${encodeURIComponent(slug)}`),
    ]);
    if (cRes.ok) {
      const cData = await cRes.json();
      setClasses(cData.results || []);
      if (!studentForm.class_stream_id && (cData.results || []).length > 0) {
        setStudentForm((prev) => ({
          ...prev,
          class_stream_id: String(cData.results[0].id),
        }));
      }
      if (!assignStreamId && (cData.results || []).length > 0) {
        setAssignStreamId(String(cData.results[0].id));
      }
    }
    if (sRes.ok) {
      const sData = await sRes.json();
      setStudents(sData.results || []);
    }
    if (catRes.ok) {
      const catData = await catRes.json();
      setCatalog(catData.results || []);
    }
    if (mRes.ok) {
      const mData = await mRes.json();
      setAssignedSubjects(mData.subjects || []);
    }
  }

  useEffect(() => {
    loadAll();
  }, [slug]);

  async function handleAssignCatalogSubjects(e) {
    e.preventDefault();
    if (!assignStreamId || selectedCatalogIds.length === 0) {
      customToast.error("Select a class stream and at least one official subject.");
      return;
    }
    const res = await fetch(
      `/api/academics/subjects/from-catalog/?tenant=${encodeURIComponent(slug)}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Isoma-Role": effectiveRole,
        },
        body: JSON.stringify({
          class_stream_id: Number(assignStreamId),
          catalog_ids: selectedCatalogIds.map(Number),
        }),
      }
    );
    const data = await res.json();
    if (!res.ok) {
      customToast.error(data.detail || "Could not assign subjects.");
      return;
    }
    customToast.success(`Added ${data.created} official subject(s) to ${data.class_stream}.`);
    setSelectedCatalogIds([]);
    loadAll();
  }

  async function handleAdmitStudent(e) {
    e.preventDefault();
    const res = await fetch(`/api/academics/students/?tenant=${encodeURIComponent(slug)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(studentForm),
    });
    const data = await res.json();
    if (!res.ok) {
      customToast.error(data.detail || "Could not admit student.");
      return;
    }
    customToast.success(`Admitted ${data.full_name} (${data.registration_number}).`);
    setStudentForm((prev) => ({
      ...prev,
      full_name: "",
      parent_name: "",
      parent_phone: "",
      parent_email: "",
    }));
    loadAll();
  }

  async function handleCreateClass(e) {
    e.preventDefault();
    const res = await fetch(`/api/academics/classes/?tenant=${encodeURIComponent(slug)}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Isoma-Role": effectiveRole,
      },
      body: JSON.stringify(classForm),
    });
    const data = await res.json();
    if (!res.ok) {
      customToast.error(data.detail || "Could not create class stream.");
      return;
    }
    customToast.success(`Created class stream ${data.name} (${data.curriculum_label}).`);
    setClassForm({ name: "", curriculum_code: allowedCurricula[0], class_teacher_name: "" });
    loadAll();
  }

  const headerMeta = {
    list: {
      title: "Student Registry",
      subtitle: "All admitted students across your school's curriculum-scoped class streams.",
      badge: `${students.length} Students · ${classes.length} Classes`,
    },
    new: {
      title: "Admit New Student",
      subtitle: "Create a student profile with automatic registration number and parent contact.",
      badge: `${students.length} Admitted`,
    },
    classes: {
      title: "Curriculum-Scoped Class Streams",
      subtitle: "Admin / DOS only - organize class streams pinned to your Landlord-assigned curricula.",
      badge: `${classes.length} Classes`,
    },
    subjects: {
      title: "Assign Official Curriculum Subjects",
      subtitle: "Bulk-add official syllabus subjects to a class stream, filtered to its curriculum.",
      badge: `${catalog.length} Official Subjects`,
    },
  }[view] || {
    title: "Student Registry",
    subtitle: "Manage admitted students and class streams.",
    badge: `${students.length} Students`,
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

      {view === "new" && (
        <StudentRegistrationWizard
          slug={slug}
          classes={classes}
          onSuccess={() => loadAll()}
        />
      )}

      {view === "classes" && (
        <div className="flex-1 bg-white rounded-t-2xl rounded-b-none shadow-sm border border-b-0 border-gray-100 p-6 md:p-8 space-y-6">
          {!isTeacher ? (
            <form onSubmit={handleCreateClass} className="w-full space-y-4">
              <div className="flex items-center gap-2">
                <Plus className="w-4 h-4 text-primary" />
                <h2 className="text-sm font-semibold text-gray-900">Create Class Stream</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                  type="text"
                  required
                  value={classForm.name}
                  onChange={(e) => setClassForm({ ...classForm, name: e.target.value })}
                  placeholder="e.g. S.2 Green or Year 8 Cambridge"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-xs focus:outline-none focus:border-primary"
                />
                <UniversalSelect
                  value={classForm.curriculum_code}
                  onChange={(val) => setClassForm({ ...classForm, curriculum_code: val })}
                  options={allowedCurricula.map((code) => ({
                    value: code,
                    label: code.replace(/_/g, " "),
                  }))}
                  placeholder="Pin to assigned curriculum..."
                />
                <input
                  type="text"
                  value={classForm.class_teacher_name}
                  onChange={(e) => setClassForm({ ...classForm, class_teacher_name: e.target.value })}
                  placeholder="Class teacher name"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-xs focus:outline-none focus:border-primary"
                />
              </div>
              <button
                type="submit"
                className="bg-primary text-white text-xs font-semibold py-2.5 px-6 rounded-lg hover:bg-primary-hover transition-colors"
              >
                Add Class Stream
              </button>
            </form>
          ) : (
            <p className="text-xs text-gray-500">
              Only School Admin or Director of Studies can create or delete class streams.
            </p>
          )}

          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 text-xs">
                  <th className="py-2.5 px-4 font-semibold">Class Stream</th>
                  <th className="py-2.5 px-4 font-semibold">Curriculum</th>
                  <th className="py-2.5 px-4 font-semibold">Class Teacher</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Students</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {classes.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50/80">
                    <td className="py-2.5 px-4 font-bold text-gray-900">{c.name}</td>
                    <td className="py-2.5 px-4 font-bold text-primary text-[11px]">
                      {(c.curriculum_code || "").replace(/_/g, " ")}
                    </td>
                    <td className="py-2.5 px-4 text-gray-600">{c.class_teacher_name || "-"}</td>
                    <td className="py-2.5 px-4 text-right font-semibold text-gray-700">
                      {c.students_count ?? 0}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {view === "subjects" && (
        <div className="flex-1 bg-white rounded-t-2xl rounded-b-none shadow-sm border border-b-0 border-gray-100 p-6 md:p-8 space-y-6">
          {!isTeacher ? (
            <form onSubmit={handleAssignCatalogSubjects} className="w-full space-y-4">
              <h2 className="text-sm font-semibold text-gray-900">
                Assign Official Subjects to Class Stream
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <UniversalSelect
                  value={assignStreamId}
                  onChange={(val) => {
                    setAssignStreamId(val);
                    setSelectedCatalogIds([]);
                  }}
                  options={classes.map((c) => ({
                    value: String(c.id),
                    label: `${c.name} (${c.curriculum_label})`,
                  }))}
                  placeholder="Select target class stream..."
                />
                <UniversalSelect
                  multiple
                  value={selectedCatalogIds}
                  onChange={setSelectedCatalogIds}
                  options={catalog
                    .filter((item) => {
                      const chosen = classes.find((c) => String(c.id) === String(assignStreamId));
                      return !chosen || item.curriculum_code === chosen.curriculum_code;
                    })
                    .map((item) => ({
                      value: String(item.id),
                      label: `${item.name} (${item.level})`,
                    }))}
                  placeholder="Select official subjects to add..."
                  searchPlaceholder="Search subjects..."
                />
              </div>
              <button
                type="submit"
                className="bg-primary text-white text-xs font-semibold py-2.5 px-6 rounded-lg hover:bg-primary-hover transition-colors"
              >
                Assign Selected Subjects to Class
              </button>
            </form>
          ) : (
            <p className="text-xs text-gray-500">
              Only School Admin or Director of Studies can assign subjects to classes.
            </p>
          )}

          {/* Live Assigned Subjects Table */}
          <div className="space-y-3 pt-2 border-t border-gray-100">
            <h2 className="text-sm font-semibold text-gray-900">
              Active School Subjects ({assignedSubjects.length})
            </h2>
            <div className="overflow-x-auto rounded-xl border border-gray-200">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 text-xs">
                    <th className="py-2.5 px-4 font-semibold">Subject</th>
                    <th className="py-2.5 px-4 font-semibold">Class Stream</th>
                    <th className="py-2.5 px-4 font-semibold">Curriculum</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {assignedSubjects.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="py-6 px-4 text-center text-gray-400">
                        No subjects assigned to class streams yet.
                      </td>
                    </tr>
                  ) : (
                    assignedSubjects.map((sub) => (
                      <tr key={sub.id} className="hover:bg-gray-50/80">
                        <td className="py-2.5 px-4 font-bold text-gray-900">{sub.name}</td>
                        <td className="py-2.5 px-4 text-gray-700">{sub.class_stream_name}</td>
                        <td className="py-2.5 px-4 font-bold text-primary text-[11px]">
                          {(sub.curriculum_code || "").replace(/_/g, " ")}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {view === "list" && (
        <div className="flex-1 bg-white rounded-t-2xl rounded-b-none shadow-sm border border-b-0 border-gray-100 p-5 md:p-6">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-semibold text-gray-900">Student Registry</h2>
          </div>
          <div className="overflow-hidden rounded-xl border border-gray-200">
            <table className="w-full text-left text-xs border-collapse table-fixed">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 text-xs">
                  <th className="py-2.5 px-3 font-semibold w-[22%] sm:w-[18%]">Reg. No</th>
                  <th className="py-2.5 px-3 font-semibold">Student Name</th>
                  <th className="py-2.5 px-3 font-semibold hidden sm:table-cell w-[18%]">Class</th>
                  <th className="py-2.5 px-3 font-semibold hidden md:table-cell w-[20%]">Curriculum</th>
                  <th className="py-2.5 px-3 font-semibold hidden lg:table-cell w-[22%]">Parent / Contact</th>
                  <th className="py-2.5 px-3 font-semibold text-right w-14">More</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {students.map((st) => (
                  <tr key={st.id} className="hover:bg-gray-50/80">
                    <td className="py-2.5 px-3 font-bold text-primary truncate" title={st.registration_number}>
                      {st.registration_number}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-gray-900 truncate" title={st.full_name}>
                      {st.full_name}
                    </td>
                    <td className="py-2.5 px-3 text-gray-700 hidden sm:table-cell truncate" title={st.class_stream_name}>
                      {st.class_stream_name}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-primary text-[11px] hidden md:table-cell truncate">
                      {(st.curriculum_code || "").replace(/_/g, " ")}
                    </td>
                    <td className="py-2.5 px-3 text-gray-500 hidden lg:table-cell truncate" title={`${st.parent_name || ""} ${st.parent_phone || ""}`}>
                      {st.parent_name || "-"} {st.parent_phone ? `· ${st.parent_phone}` : ""}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            type="button"
                            className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                            aria-label={`More actions for ${st.full_name}`}
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="w-56 bg-white border border-gray-200 shadow-lg rounded-xl p-1.5"
                        >
                          <div className="px-2.5 py-1.5 border-b border-gray-100 mb-1 text-[11px] text-gray-500 space-y-0.5">
                            <p className="font-bold text-gray-900 truncate">{st.full_name}</p>
                            <p className="truncate">{st.class_stream_name} · {(st.curriculum_code || "").replace(/_/g, " ")}</p>
                            <p className="truncate">{st.parent_name || "-"} {st.parent_phone ? `· ${st.parent_phone}` : ""}</p>
                          </div>
                          <DropdownMenuItem
                            onClick={() => setViewingStudentId(st.id)}
                            className="flex items-center gap-2 px-2.5 py-2 text-xs font-semibold text-primary rounded-lg cursor-pointer hover:bg-primary/5"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            Open 360 Student Profile
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

      {viewingStudentId && (
        <Student360Modal
          studentId={viewingStudentId}
          onClose={() => setViewingStudentId(null)}
        />
      )}
    </div>
  );
}
