import React, { useEffect, useState } from "react";
import {
  Building2,
  Plus,
  Globe,
  ExternalLink,
  CheckCircle2,
  Clock,
  Users,
  Receipt,
  Layers,
  Settings as SettingsIcon,
  ShieldCheck,
  Pencil,
  History,
} from "lucide-react";
import { customToast } from "../../components/GlobalPopup";
import { getTenantPortalUrl } from "../../utils/appMode";
import { UniversalSelect } from "../../components/ui/UniversalSelect";
import { useAuth } from "../../context/AuthContext";

const TIERS = [
  { value: "OPEN_ACADEMY", label: "Public Open Academy" },
  { value: "NURSERY", label: "Nursery / ECD" },
  { value: "PRIMARY", label: "Primary School" },
  { value: "SECONDARY", label: "Secondary School" },
  { value: "HIGHER_ED", label: "Higher Education / TVET" },
  { value: "COMPREHENSIVE_K12", label: "Comprehensive K-12" },
];

const CURRICULA = [
  { value: "UNEB_LOWER_SECONDARY", label: "Uganda UNEB / NCDC CBC" },
  { value: "UNEB_PRIMARY", label: "Uganda UNEB Primary (PLE)" },
  { value: "CAMBRIDGE_IGCSE", label: "Cambridge International (IGCSE / A-Level)" },
  { value: "ACE_PACE", label: "Accelerated Christian Education (ACE)" },
  { value: "IB_DP", label: "International Baccalaureate (IB)" },
  { value: "MONTESSORI_ECD", label: "Montessori / Nursery ECD" },
  { value: "CUSTOM", label: "Custom Institutional Curriculum" },
];

const STATUS_OPTIONS = [
  { value: "PENDING", label: "Pending Onboarding" },
  { value: "IN_PROGRESS", label: "Onboarding In Progress" },
  { value: "COMPLETED", label: "Active / Onboarded" },
];

function formatAuditTime(iso) {
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

export function SchoolsPage() {
  const { user } = useAuth();
  const [schools, setSchools] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [editingCurrSub, setEditingCurrSub] = useState(null);
  const [editingCurrList, setEditingCurrList] = useState([]);
  const [savingCurr, setSavingCurr] = useState(false);
  const [editingSchoolSub, setEditingSchoolSub] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [form, setForm] = useState({
    name: "",
    subdomain: "",
    tier: "SECONDARY",
    curricula: ["UNEB_LOWER_SECONDARY"],
    email: "",
    phone: "",
    principal_name: "",
  });

  const actorLabel = user
    ? `${user.full_name} (${user.email})`
    : "ERP Super Admin";

  function authHeaders() {
    const token = localStorage.getItem("isoma_lms_access");
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  async function loadAuditLogs() {
    try {
      const res = await fetch("/api/tenant/audit-logs/");
      if (res.ok) {
        const data = await res.json();
        setAuditLogs(data.results || []);
      }
    } catch {
      // ignore
    }
  }

  function startEditSchool(school) {
    setEditingCurrSub(null);
    setEditingSchoolSub(school.subdomain);
    setEditForm({
      name: school.name || "",
      tier: school.tier || "SECONDARY",
      curricula: school.curricula?.length ? school.curricula : [school.curriculum || "UNEB_LOWER_SECONDARY"],
      custom_domain: school.custom_domain || "",
      email: school.email || "",
      phone: school.phone || "",
      onboarding_status: school.onboarding_status || "PENDING",
    });
  }

  async function saveSchoolEdit(subdomain) {
    setSavingEdit(true);
    try {
      const res = await fetch(
        `/api/tenant/institutions/${encodeURIComponent(subdomain)}/`,
        {
          method: "PATCH",
          headers: authHeaders(),
          body: JSON.stringify({ ...editForm, edited_by: actorLabel }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed to update school.");
      customToast.success(`Updated ${data.name}. Edit logged for ERP Super Admin.`);
      setEditingSchoolSub(null);
      setEditForm(null);
      await Promise.all([loadSchools(), loadAuditLogs()]);
    } catch (err) {
      customToast.error(err.message);
    } finally {
      setSavingEdit(false);
    }
  }

  async function saveSchoolCurricula(subdomain) {
    setSavingCurr(true);
    try {
      const res = await fetch(
        `/api/tenant/institutions/${encodeURIComponent(subdomain)}/curricula/`,
        {
          method: "PATCH",
          headers: authHeaders(),
          body: JSON.stringify({ curricula: editingCurrList, edited_by: actorLabel }),
        }
      );
      if (!res.ok) throw new Error("Failed to update curricula.");
      customToast.success("Updated school curricula. Audit log recorded.");
      setEditingCurrSub(null);
      await Promise.all([loadSchools(), loadAuditLogs()]);
    } catch (err) {
      customToast.error(err.message);
    } finally {
      setSavingCurr(false);
    }
  }

  async function loadSchools() {
    try {
      const res = await fetch("/api/tenant/institutions/");
      if (res.ok) {
        const data = await res.json();
        setSchools(data.results || []);
      }
    } catch {
      customToast.error("Could not load schools.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSchools();
    loadAuditLogs();
  }, []);

  async function handleCreate(e) {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await fetch("/api/tenant/institutions/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          principal_email: form.email,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed to create school.");
      customToast.success(
        `Created ${data.name} (${data.primary_domain}). Open its portal to continue onboarding.`
      );
      setForm({
        name: "",
        subdomain: "",
        tier: "SECONDARY",
        curricula: ["UNEB_LOWER_SECONDARY"],
        email: "",
        phone: "",
        principal_name: "",
      });
      await loadSchools();
    } catch (err) {
      customToast.error(err.message);
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="relative bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-primary/60 to-primary" />
        <div className="px-6 py-6 md:px-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-lg md:text-2xl font-bold text-gray-900 tracking-tight">
              Schools &amp; Institutions
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Create school accounts and subdomains here, then open each school&apos;s own portal to continue onboarding and staff setup.
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 text-primary px-3 py-1 text-xs font-semibold shrink-0">
            <Building2 className="w-3.5 h-3.5" />
            {schools.length} Active
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Create School Form */}
        <form
          onSubmit={handleCreate}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 md:p-6 space-y-3"
        >
          <div className="flex items-center gap-2.5 pb-2 border-b border-gray-100">
            <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Plus className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-gray-900">Add School</h2>
              <p className="text-[11px] text-gray-500">Provision subdomain &amp; principal</p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              School / Institution Name
            </label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. King's College Budo"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Subdomain
            </label>
            <div className="flex items-center rounded-lg border border-gray-200 overflow-hidden focus-within:border-primary">
              <input
                type="text"
                required
                value={form.subdomain}
                onChange={(e) =>
                  setForm({
                    ...form,
                    subdomain: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""),
                  })
                }
                placeholder="budo"
                className="flex-1 px-3 py-2 text-xs focus:outline-none"
              />
              <span className="bg-gray-50 px-2.5 py-2 text-[11px] font-medium text-gray-500 border-l border-gray-200">
                .isomaug.com
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Category / Tier
            </label>
            <UniversalSelect
              value={form.tier}
              onChange={(val) => setForm({ ...form, tier: val })}
              options={TIERS}
              placeholder="Select category..."
              searchPlaceholder="Search categories..."
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Allowed Curricula (Landlord-assigned)
            </label>
            <UniversalSelect
              multiple
              minSelected={1}
              value={form.curricula}
              onChange={(vals) => setForm({ ...form, curricula: vals })}
              options={CURRICULA}
              placeholder="Select curricula..."
              searchPlaceholder="Search curricula..."
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Principal / Admin Name
            </label>
            <input
              type="text"
              value={form.principal_name}
              onChange={(e) => setForm({ ...form, principal_name: e.target.value })}
              placeholder="e.g. Mr. John Mukasa"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs focus:outline-none focus:border-primary"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Admin Email
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="admin@budo.ac.ug"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Phone
              </label>
              <input
                type="text"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+256700000000"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={creating}
            className="w-full bg-primary text-white font-medium py-2.5 px-4 rounded-lg hover:bg-primary-hover text-xs inline-flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          >
            {creating ? "Creating..." : "Create School Account"}
          </button>
        </form>

        {/* Schools List */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-5 md:p-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">
            Registered Schools &amp; Portals
          </h2>
          {loading ? (
            <p className="text-xs text-gray-400">Loading schools...</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {schools.map((s) => (
                <div
                  key={s.id}
                  className="rounded-xl border border-gray-200 p-4 flex flex-col justify-between hover:border-primary/40 hover:shadow-md hover:shadow-primary/5 transition-all"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2.5">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-primary/70 text-white font-bold text-xs flex items-center justify-center shrink-0">
                          {s.initials}
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-xs font-bold text-gray-900 truncate">
                            {s.name}
                          </h3>
                          <p className="text-[11px] text-primary font-medium inline-flex items-center gap-1 truncate">
                            <Globe className="w-3 h-3" />
                            {s.primary_domain}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full inline-flex items-center gap-1 shrink-0 ${
                          s.onboarding_status === "COMPLETED"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        {s.onboarding_status === "COMPLETED" ? (
                          <CheckCircle2 className="w-3 h-3" />
                        ) : (
                          <Clock className="w-3 h-3" />
                        )}
                        {s.onboarding_status}
                      </span>
                    </div>

                    <p className="text-[11px] text-gray-500">
                      {s.tier_label} · {(s.curricula || [s.curriculum]).map((c) => c.replace(/_/g, " ")).join(" + ")}
                    </p>
                    <p className="text-[11px] text-gray-400 mt-1">
                      {s.members_count || 0} staff/users · {(s.enabled_portals || []).length} role portals
                    </p>
                    <p className="text-[10px] text-gray-400 mt-1.5">
                      Last edited by <span className="font-semibold text-gray-600">{s.updated_by || "System Seed"}</span> · {formatAuditTime(s.updated_at)}
                    </p>
                  </div>

                  {editingSchoolSub === s.subdomain && editForm && (
                    <div className="mt-3 pt-3 border-t border-gray-100 space-y-2.5">
                      <p className="text-[11px] font-bold text-gray-800">
                        Edit {s.name}
                      </p>
                      <input
                        type="text"
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        placeholder="School name"
                        className="w-full rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs focus:outline-none focus:border-primary"
                      />
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <UniversalSelect
                          value={editForm.tier}
                          onChange={(val) => setEditForm({ ...editForm, tier: val })}
                          options={TIERS}
                          placeholder="Category..."
                        />
                        <UniversalSelect
                          value={editForm.onboarding_status}
                          onChange={(val) => setEditForm({ ...editForm, onboarding_status: val })}
                          options={STATUS_OPTIONS}
                          placeholder="Status..."
                          searchable={false}
                        />
                      </div>
                      <UniversalSelect
                        multiple
                        minSelected={1}
                        value={editForm.curricula}
                        onChange={(vals) => setEditForm({ ...editForm, curricula: vals })}
                        options={CURRICULA}
                        placeholder="Select curricula..."
                        searchPlaceholder="Search curricula..."
                      />
                      <input
                        type="text"
                        value={editForm.custom_domain}
                        onChange={(e) => setEditForm({ ...editForm, custom_domain: e.target.value })}
                        placeholder="Custom domain (e.g. portal.school.ac.ug)"
                        className="w-full rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs focus:outline-none focus:border-primary"
                      />
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <input
                          type="email"
                          value={editForm.email}
                          onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                          placeholder="Email"
                          className="w-full rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs focus:outline-none focus:border-primary"
                        />
                        <input
                          type="text"
                          value={editForm.phone}
                          onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                          placeholder="Phone"
                          className="w-full rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs focus:outline-none focus:border-primary"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          disabled={savingEdit}
                          onClick={() => saveSchoolEdit(s.subdomain)}
                          className="bg-primary text-white text-[11px] font-semibold px-3 py-1.5 rounded-lg hover:bg-primary-hover"
                        >
                          {savingEdit ? "Saving..." : "Save Changes"}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingSchoolSub(null);
                            setEditForm(null);
                          }}
                          className="text-[11px] text-gray-500 hover:text-gray-800 px-2 py-1"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  {editingCurrSub === s.subdomain && (
                    <div className="mt-3 pt-3 border-t border-gray-100 space-y-2.5">
                      <p className="text-[11px] font-bold text-gray-700">
                        Assign Curricula for {s.name}
                      </p>
                      <UniversalSelect
                        multiple
                        minSelected={1}
                        value={editingCurrList}
                        onChange={setEditingCurrList}
                        options={CURRICULA}
                        placeholder="Select curricula..."
                        searchPlaceholder="Search curricula..."
                      />
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          disabled={savingCurr}
                          onClick={() => saveSchoolCurricula(s.subdomain)}
                          className="bg-primary text-white text-[11px] font-semibold px-3 py-1.5 rounded-lg hover:bg-primary-hover"
                        >
                          {savingCurr ? "Saving..." : "Save Curricula"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingCurrSub(null)}
                          className="text-[11px] text-gray-500 hover:text-gray-800 px-2 py-1"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="mt-4 pt-3 border-t border-gray-100 flex flex-wrap items-center gap-2">
                    <a
                      href={getTenantPortalUrl(s.subdomain, "/")}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 bg-primary text-white text-xs font-medium py-2 px-3 rounded-lg hover:bg-primary-hover transition-colors inline-flex items-center justify-center gap-1.5"
                    >
                      Open School Portal
                      <ExternalLink className="w-3 h-3" />
                    </a>
                    <button
                      type="button"
                      onClick={() => startEditSchool(s)}
                      className="border border-gray-200 bg-white text-gray-700 text-xs font-semibold py-2 px-3 rounded-lg hover:border-primary hover:text-primary transition-colors inline-flex items-center gap-1"
                    >
                      <Pencil className="w-3 h-3" />
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingSchoolSub(null);
                        setEditingCurrSub(s.subdomain);
                        setEditingCurrList(s.curricula || [s.curriculum]);
                      }}
                      className="border border-gray-200 bg-white text-primary text-xs font-semibold py-2 px-3 rounded-lg hover:border-primary transition-colors"
                    >
                      Curricula
                    </button>
                    <a
                      href={getTenantPortalUrl(s.subdomain, "/onboarding")}
                      target="_blank"
                      rel="noreferrer"
                      className="border border-gray-200 bg-white text-gray-700 text-xs font-medium py-2 px-3 rounded-lg hover:border-primary hover:text-primary transition-colors"
                    >
                      Onboarding
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Super Admin Audit Trail */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-semibold text-gray-900">
              School Edit Audit Log (ERP Super Admin)
            </h2>
          </div>
          <span className="text-xs font-bold text-primary">
            {auditLogs.length} Events
          </span>
        </div>

        {auditLogs.length === 0 ? (
          <p className="text-xs text-gray-400">
            No school edits recorded yet. Any school or curriculum change will log the editor and timestamp here.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 text-xs">
                  <th className="py-2.5 px-4 font-semibold">School</th>
                  <th className="py-2.5 px-4 font-semibold">Edited By</th>
                  <th className="py-2.5 px-4 font-semibold">Action</th>
                  <th className="py-2.5 px-4 font-semibold">Changes</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50/80">
                    <td className="py-2.5 px-4 font-bold text-gray-900 whitespace-nowrap">
                      {log.institution_name}
                    </td>
                    <td className="py-2.5 px-4 font-semibold text-primary whitespace-nowrap">
                      {log.edited_by}
                    </td>
                    <td className="py-2.5 px-4 text-gray-600 whitespace-nowrap">
                      {log.action.replace(/_/g, " ")}
                    </td>
                    <td className="py-2.5 px-4 text-gray-600">{log.changes_summary}</td>
                    <td className="py-2.5 px-4 text-right text-gray-500 whitespace-nowrap">
                      {formatAuditTime(log.edited_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export function CategoriesPage() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="h-1 bg-gradient-to-r from-primary via-primary/60 to-primary" />
      <div className="p-6 md:p-8">
        <div className="flex items-center gap-2.5 mb-5">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Categories &amp; Curricula</h1>
            <p className="text-xs text-gray-500">
              Institution tiers and curriculum frameworks available when provisioning schools.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {TIERS.map((t) => (
            <div key={t.value} className="rounded-xl border border-gray-200 p-4">
              <p className="text-[10px] font-bold text-primary uppercase tracking-widest">
                {t.value}
              </p>
              <h2 className="text-sm font-semibold text-gray-900 mt-1">{t.label}</h2>
              <p className="text-xs text-gray-500 mt-1">
                Scoped subjects, grading bands, and report card templates.
              </p>
            </div>
          ))}
        </div>
      </div>


      {/* Super Admin Audit Trail */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-semibold text-gray-900">
              School Edit Audit Log (ERP Super Admin)
            </h2>
          </div>
          <span className="text-xs font-bold text-primary">
            {auditLogs.length} Events
          </span>
        </div>

        {auditLogs.length === 0 ? (
          <p className="text-xs text-gray-400">
            No school edits recorded yet. Any school or curriculum change will log the editor and timestamp here.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 text-xs">
                  <th className="py-2.5 px-4 font-semibold">School</th>
                  <th className="py-2.5 px-4 font-semibold">Edited By</th>
                  <th className="py-2.5 px-4 font-semibold">Action</th>
                  <th className="py-2.5 px-4 font-semibold">Changes</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50/80">
                    <td className="py-2.5 px-4 font-bold text-gray-900 whitespace-nowrap">
                      {log.institution_name}
                    </td>
                    <td className="py-2.5 px-4 font-semibold text-primary whitespace-nowrap">
                      {log.edited_by}
                    </td>
                    <td className="py-2.5 px-4 text-gray-600 whitespace-nowrap">
                      {log.action.replace(/_/g, " ")}
                    </td>
                    <td className="py-2.5 px-4 text-gray-600">{log.changes_summary}</td>
                    <td className="py-2.5 px-4 text-right text-gray-500 whitespace-nowrap">
                      {formatAuditTime(log.edited_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export function UsersPage() {
  const [users, setUsers] = useState([]);
  useEffect(() => {
    fetch("/api/tenant/users/")
      .then((r) => (r.ok ? r.json() : { results: [] }))
      .then((d) => setUsers(d.results || []))
      .catch(() => {});
  }, []);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="h-1 bg-gradient-to-r from-primary via-primary/60 to-primary" />
      <div className="p-6 md:p-8">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Users</h1>
              <p className="text-xs text-gray-500">
                All platform &amp; school accounts across Isoma UG.
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full">
            {users.length} Users
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-200 text-gray-600 text-xs">
                <th className="py-2.5 pr-4 font-semibold">Name</th>
                <th className="py-2.5 pr-4 font-semibold">Email</th>
                <th className="py-2.5 pr-4 font-semibold">Role</th>
                <th className="py-2.5 pr-4 font-semibold">School / Portal</th>
                <th className="py-2.5 font-semibold">Phone</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50/80">
                  <td className="py-2.5 pr-4 font-semibold text-gray-800">{u.full_name}</td>
                  <td className="py-2.5 pr-4 text-gray-600">{u.email}</td>
                  <td className="py-2.5 pr-4">
                    <span className="rounded-full bg-primary/10 text-primary px-2 py-0.5 text-[10px] font-semibold">
                      {u.role_label}
                    </span>
                  </td>
                  <td className="py-2.5 pr-4 text-gray-600">{u.institution || "Platform"}</td>
                  <td className="py-2.5 text-gray-500">{u.phone || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>


      {/* Super Admin Audit Trail */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-semibold text-gray-900">
              School Edit Audit Log (ERP Super Admin)
            </h2>
          </div>
          <span className="text-xs font-bold text-primary">
            {auditLogs.length} Events
          </span>
        </div>

        {auditLogs.length === 0 ? (
          <p className="text-xs text-gray-400">
            No school edits recorded yet. Any school or curriculum change will log the editor and timestamp here.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 text-xs">
                  <th className="py-2.5 px-4 font-semibold">School</th>
                  <th className="py-2.5 px-4 font-semibold">Edited By</th>
                  <th className="py-2.5 px-4 font-semibold">Action</th>
                  <th className="py-2.5 px-4 font-semibold">Changes</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50/80">
                    <td className="py-2.5 px-4 font-bold text-gray-900 whitespace-nowrap">
                      {log.institution_name}
                    </td>
                    <td className="py-2.5 px-4 font-semibold text-primary whitespace-nowrap">
                      {log.edited_by}
                    </td>
                    <td className="py-2.5 px-4 text-gray-600 whitespace-nowrap">
                      {log.action.replace(/_/g, " ")}
                    </td>
                    <td className="py-2.5 px-4 text-gray-600">{log.changes_summary}</td>
                    <td className="py-2.5 px-4 text-right text-gray-500 whitespace-nowrap">
                      {formatAuditTime(log.edited_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export function InvoicesPage() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="h-1 bg-gradient-to-r from-primary via-primary/60 to-primary" />
      <div className="p-6 md:p-8">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <Receipt className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Invoices &amp; Subscriptions</h1>
            <p className="text-xs text-gray-500">
              Termly SaaS billing for registered schools via Pesapal, MTN MoMo, and Airtel Money.
            </p>
          </div>
        </div>
        <div className="rounded-xl border border-dashed border-gray-200 p-8 text-center text-xs text-gray-500">
          Billing ledger ready - school subscription invoices will appear here as plans are assigned.
        </div>
      </div>


      {/* Super Admin Audit Trail */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-semibold text-gray-900">
              School Edit Audit Log (ERP Super Admin)
            </h2>
          </div>
          <span className="text-xs font-bold text-primary">
            {auditLogs.length} Events
          </span>
        </div>

        {auditLogs.length === 0 ? (
          <p className="text-xs text-gray-400">
            No school edits recorded yet. Any school or curriculum change will log the editor and timestamp here.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 text-xs">
                  <th className="py-2.5 px-4 font-semibold">School</th>
                  <th className="py-2.5 px-4 font-semibold">Edited By</th>
                  <th className="py-2.5 px-4 font-semibold">Action</th>
                  <th className="py-2.5 px-4 font-semibold">Changes</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50/80">
                    <td className="py-2.5 px-4 font-bold text-gray-900 whitespace-nowrap">
                      {log.institution_name}
                    </td>
                    <td className="py-2.5 px-4 font-semibold text-primary whitespace-nowrap">
                      {log.edited_by}
                    </td>
                    <td className="py-2.5 px-4 text-gray-600 whitespace-nowrap">
                      {log.action.replace(/_/g, " ")}
                    </td>
                    <td className="py-2.5 px-4 text-gray-600">{log.changes_summary}</td>
                    <td className="py-2.5 px-4 text-right text-gray-500 whitespace-nowrap">
                      {formatAuditTime(log.edited_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export function DomainsPage() {
  const [schools, setSchools] = useState([]);
  useEffect(() => {
    fetch("/api/tenant/institutions/")
      .then((r) => (r.ok ? r.json() : { results: [] }))
      .then((d) => setSchools(d.results || []))
      .catch(() => {});
  }, []);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="h-1 bg-gradient-to-r from-primary via-primary/60 to-primary" />
      <div className="p-6 md:p-8">
        <div className="flex items-center gap-2.5 mb-5">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Domains &amp; SSL</h1>
            <p className="text-xs text-gray-500">
              Subdomain routing (`*.isomaug.com`) and custom white-label school domains (`cname.isomaug.com`).
            </p>
          </div>
        </div>
        <div className="space-y-2.5">
          {schools.map((s) => (
            <div
              key={s.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-xl border border-gray-200 px-4 py-3 text-xs"
            >
              <div>
                <p className="font-semibold text-gray-900">{s.name}</p>
                <p className="text-gray-500">
                  Subdomain: <span className="text-primary font-medium">{s.subdomain}.isomaug.com</span>
                  {s.custom_domain ? ` · Custom: ${s.custom_domain}` : ""}
                </p>
              </div>
              <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full text-[10px] font-semibold">
                <ShieldCheck className="w-3 h-3" />
                Active TLS
              </span>
            </div>
          ))}
        </div>
      </div>


      {/* Super Admin Audit Trail */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-semibold text-gray-900">
              School Edit Audit Log (ERP Super Admin)
            </h2>
          </div>
          <span className="text-xs font-bold text-primary">
            {auditLogs.length} Events
          </span>
        </div>

        {auditLogs.length === 0 ? (
          <p className="text-xs text-gray-400">
            No school edits recorded yet. Any school or curriculum change will log the editor and timestamp here.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 text-xs">
                  <th className="py-2.5 px-4 font-semibold">School</th>
                  <th className="py-2.5 px-4 font-semibold">Edited By</th>
                  <th className="py-2.5 px-4 font-semibold">Action</th>
                  <th className="py-2.5 px-4 font-semibold">Changes</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50/80">
                    <td className="py-2.5 px-4 font-bold text-gray-900 whitespace-nowrap">
                      {log.institution_name}
                    </td>
                    <td className="py-2.5 px-4 font-semibold text-primary whitespace-nowrap">
                      {log.edited_by}
                    </td>
                    <td className="py-2.5 px-4 text-gray-600 whitespace-nowrap">
                      {log.action.replace(/_/g, " ")}
                    </td>
                    <td className="py-2.5 px-4 text-gray-600">{log.changes_summary}</td>
                    <td className="py-2.5 px-4 text-right text-gray-500 whitespace-nowrap">
                      {formatAuditTime(log.edited_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export function SettingsPage() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="h-1 bg-gradient-to-r from-primary via-primary/60 to-primary" />
      <div className="p-6 md:p-8 space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <SettingsIcon className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Platform Settings</h1>
            <p className="text-xs text-gray-500">
              Global defaults for Isoma UG Landlord ERP (`isomaug.com`).
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="rounded-xl border border-gray-200 p-4">
            <p className="font-semibold text-gray-900">Brand Theme</p>
            <p className="text-gray-500 mt-1">Isoma Royal Blue (#004880) · Font: Montserrat</p>
          </div>
          <div className="rounded-xl border border-gray-200 p-4">
            <p className="font-semibold text-gray-900">Default Gateway &amp; Currency</p>
            <p className="text-gray-500 mt-1">UGX · Pesapal v3 (MTN MoMo, Airtel Money, Card)</p>
          </div>
        </div>
      </div>


      {/* Super Admin Audit Trail */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-semibold text-gray-900">
              School Edit Audit Log (ERP Super Admin)
            </h2>
          </div>
          <span className="text-xs font-bold text-primary">
            {auditLogs.length} Events
          </span>
        </div>

        {auditLogs.length === 0 ? (
          <p className="text-xs text-gray-400">
            No school edits recorded yet. Any school or curriculum change will log the editor and timestamp here.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 text-xs">
                  <th className="py-2.5 px-4 font-semibold">School</th>
                  <th className="py-2.5 px-4 font-semibold">Edited By</th>
                  <th className="py-2.5 px-4 font-semibold">Action</th>
                  <th className="py-2.5 px-4 font-semibold">Changes</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50/80">
                    <td className="py-2.5 px-4 font-bold text-gray-900 whitespace-nowrap">
                      {log.institution_name}
                    </td>
                    <td className="py-2.5 px-4 font-semibold text-primary whitespace-nowrap">
                      {log.edited_by}
                    </td>
                    <td className="py-2.5 px-4 text-gray-600 whitespace-nowrap">
                      {log.action.replace(/_/g, " ")}
                    </td>
                    <td className="py-2.5 px-4 text-gray-600">{log.changes_summary}</td>
                    <td className="py-2.5 px-4 text-right text-gray-500 whitespace-nowrap">
                      {formatAuditTime(log.edited_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
