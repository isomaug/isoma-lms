import React, { useEffect, useMemo, useState } from "react";
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
  MoreHorizontal,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Maximize2,
  Minimize2,
  Search,
  BookOpen,
} from "lucide-react";
import { customToast, statusModal } from "../../components/GlobalPopup";
import { getTenantPortalUrl } from "../../utils/appMode";
import { UniversalSelect } from "../../components/ui/UniversalSelect";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "../../components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
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

export function SchoolsPage({ view = "list" }) {
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
  const [searchQuery, setSearchQuery] = useState("");
  const [tierFilter, setTierFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sortConfig, setSortConfig] = useState({ key: "name", direction: "asc" });
  const [isFullscreen, setIsFullscreen] = useState(false);
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
      curricula: school.curricula?.length
        ? school.curricula
        : [school.curriculum || "UNEB_LOWER_SECONDARY"],
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
      statusModal.success({
        title: "School Account Provisioned",
        message: `${data.name} is ready. You can now open its dedicated school portal to continue onboarding.`,
        details: [
          `Primary Domain: ${data.primary_domain}`,
          `Category: ${data.tier_label}`,
          `Curricula: ${(data.curricula || [data.curriculum]).map((c) => c.replace(/_/g, " ")).join(", ")}`,
        ],
        nextLabel: "View Registered Schools",
        nextRoute: "/schools",
        secondaryLabel: "Add Another School",
      });
    } catch (err) {
      statusModal.rejected({
        title: "School Registration Rejected",
        message: err.message || "Please verify the school subdomain and details.",
        nextLabel: "Review & Fix",
      });
    } finally {
      setCreating(false);
    }
  }

  const headerMeta = {
    list: {
      title: "Registered Schools & Portals",
      subtitle:
        "Manage registered institutions, assign curricula, and launch each school's dedicated portal.",
      badge: `${schools.length} Active`,
    },
    new: {
      title: "Add New School",
      subtitle:
        "Provision a new school subdomain, allowed curricula, and initial Principal account.",
      badge: `${schools.length} Registered`,
    },
    "audit-log": {
      title: "School Edit Audit Log",
      subtitle:
        "Chronological history of who edited each school, what changed, and when (ERP Super Admin).",
      badge: `${auditLogs.length} Events`,
    },
  }[view] || {
    title: "Registered Schools & Portals",
    subtitle: "Manage institutions.",
    badge: `${schools.length} Active`,
  };

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const SortIcon = ({ columnKey }) => {
    if (sortConfig.key !== columnKey)
      return <ArrowUpDown className="w-3 h-3 ml-1 inline text-gray-400 opacity-60" />;
    return sortConfig.direction === "asc" ? (
      <ArrowUp className="w-3 h-3 ml-1 inline text-primary" />
    ) : (
      <ArrowDown className="w-3 h-3 ml-1 inline text-primary" />
    );
  };

  const displaySchools = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const list = schools.filter((s) => {
      const matchSearch =
        !q ||
        (s.name || "").toLowerCase().includes(q) ||
        (s.subdomain || "").toLowerCase().includes(q) ||
        (s.primary_domain || "").toLowerCase().includes(q);
      const matchTier = tierFilter === "ALL" || s.tier === tierFilter;
      const matchStatus = statusFilter === "ALL" || s.onboarding_status === statusFilter;
      return matchSearch && matchTier && matchStatus;
    });

    if (sortConfig.key) {
      list.sort((a, b) => {
        let aVal = a[sortConfig.key] ?? "";
        let bVal = b[sortConfig.key] ?? "";
        if (sortConfig.key === "members_count") {
          aVal = Number(a.members_count || 0);
          bVal = Number(b.members_count || 0);
        } else {
          aVal = String(aVal).toLowerCase();
          bVal = String(bVal).toLowerCase();
        }
        if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return list;
  }, [schools, searchQuery, tierFilter, statusFilter, sortConfig]);

  const editingSchoolObj = schools.find((s) => s.subdomain === editingSchoolSub) || null;
  const editingCurrObj = schools.find((s) => s.subdomain === editingCurrSub) || null;

  return (
    <div className="flex-1 flex flex-col space-y-4">
      <div className="relative bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-primary/60 to-primary" />
        <div className="px-6 py-5 md:px-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-lg md:text-2xl font-bold text-gray-900 tracking-tight">
              {headerMeta.title}
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">{headerMeta.subtitle}</p>
          </div>
          <span className="inline-flex items-center gap-1.5 text-primary text-xs font-bold shrink-0">
            <Building2 className="w-3.5 h-3.5" />
            {headerMeta.badge}
          </span>
        </div>
      </div>

      {view === "new" && (
        <div className="flex-1 bg-white rounded-t-2xl rounded-b-none shadow-sm border border-b-0 border-gray-100 p-6 md:p-8">
          <div className="flex items-center gap-2 mb-5">
            <Plus className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-semibold text-gray-900">Provision School Account</h2>
          </div>
          <form onSubmit={handleCreate} className="w-full space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  School / Institution Name
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. King's College Budo"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-xs focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Subdomain</label>
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
                    className="flex-1 px-3 py-2.5 text-xs focus:outline-none"
                  />
                  <span className="bg-gray-50 px-3 py-2.5 text-[11px] font-medium text-gray-500 border-l border-gray-200">
                    .isomaug.com
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
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
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Principal / Admin Name
                </label>
                <input
                  type="text"
                  value={form.principal_name}
                  onChange={(e) => setForm({ ...form, principal_name: e.target.value })}
                  placeholder="e.g. Mr. John Mukasa"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-xs focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Admin Email
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="admin@budo.ac.ug"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-xs focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Phone</label>
                <input
                  type="text"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+256700000000"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-xs focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={creating}
                className="bg-primary text-white font-medium py-2.5 px-6 rounded-lg hover:bg-primary-hover text-xs inline-flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
              >
                {creating ? "Creating..." : "Create School Account"}
              </button>
            </div>
          </form>
        </div>
      )}

      {view === "audit-log" && (
        <div className="flex-1 bg-white rounded-t-2xl rounded-b-none shadow-sm border border-b-0 border-gray-100 p-5 md:p-6">
          <div className="flex items-center gap-2 mb-4">
            <History className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-semibold text-gray-900">
              School Edit Audit Log (ERP Super Admin)
            </h2>
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
      )}

      {view === "list" && (
        <div className="flex-1 flex flex-col space-y-3 min-h-0">
          {/* Search & Filters Bar (Cohorts-style) */}
          <div className="flex flex-col sm:flex-row w-full gap-2 sm:gap-3 items-stretch sm:items-center">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search schools or domains..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-9 rounded-lg border border-gray-200 bg-white pl-8 pr-3 text-xs focus:outline-none focus:border-primary"
              />
            </div>
            <div className="w-full sm:w-52">
              <UniversalSelect
                value={tierFilter}
                onChange={setTierFilter}
                options={[{ value: "ALL", label: "All Categories" }, ...TIERS]}
                placeholder="All Categories"
              />
            </div>
            <div className="w-full sm:w-48">
              <UniversalSelect
                value={statusFilter}
                onChange={setStatusFilter}
                options={[{ value: "ALL", label: "All Statuses" }, ...STATUS_OPTIONS]}
                placeholder="All Statuses"
                searchable={false}
              />
            </div>
          </div>

          {/* Cohorts-style Full-Height Table Container with Fullscreen Toggle & 3-Dot Action Menu */}
          <div
            className={
              isFullscreen
                ? "fixed inset-0 z-50 bg-white flex flex-col p-4 sm:p-6"
                : "border border-gray-200 rounded-t-xl rounded-b-none border-b-0 overflow-hidden bg-white shadow-sm flex flex-col flex-1 min-h-0 relative group"
            }
          >
            {isFullscreen && (
              <div className="flex justify-between items-center mb-4 shrink-0">
                <h3 className="text-lg font-bold tracking-tight text-gray-900">
                  Registered Schools &amp; Portals
                </h3>
                <button
                  type="button"
                  onClick={() => setIsFullscreen(false)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-100"
                  title="Exit Fullscreen"
                >
                  <Minimize2 className="w-4 h-4" />
                </button>
              </div>
            )}
            {!isFullscreen && (
              <div className="absolute top-1.5 right-1.5 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  type="button"
                  onClick={() => setIsFullscreen(true)}
                  title="Fullscreen Table"
                  className="h-7 w-7 rounded-md border border-gray-200 bg-white shadow-sm flex items-center justify-center text-gray-500 hover:text-primary"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <div className="overflow-y-auto overflow-x-auto flex-1 min-w-0">
              <table className="w-full text-xs text-left border-collapse">
                <thead className="bg-gray-50 text-gray-600 border-b border-gray-200 sticky top-0 z-10">
                  <tr>
                    <th
                      className="px-4 py-3 font-semibold cursor-pointer select-none"
                      onClick={() => handleSort("name")}
                    >
                      School Name <SortIcon columnKey="name" />
                    </th>
                    <th
                      className="px-4 py-3 font-semibold hidden sm:table-cell cursor-pointer select-none"
                      onClick={() => handleSort("primary_domain")}
                    >
                      Domain <SortIcon columnKey="primary_domain" />
                    </th>
                    <th
                      className="px-4 py-3 font-semibold hidden md:table-cell cursor-pointer select-none"
                      onClick={() => handleSort("tier_label")}
                    >
                      Category / Curricula <SortIcon columnKey="tier_label" />
                    </th>
                    <th
                      className="px-4 py-3 font-semibold hidden lg:table-cell cursor-pointer select-none text-center"
                      onClick={() => handleSort("members_count")}
                    >
                      Staff &amp; Users <SortIcon columnKey="members_count" />
                    </th>
                    <th
                      className="px-4 py-3 font-semibold hidden xl:table-cell cursor-pointer select-none"
                      onClick={() => handleSort("onboarding_status")}
                    >
                      Status <SortIcon columnKey="onboarding_status" />
                    </th>
                    <th className="px-4 py-3 font-semibold text-right w-20">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="text-center py-10 text-gray-400">
                        Loading schools...
                      </td>
                    </tr>
                  ) : displaySchools.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-10 text-gray-400">
                        No schools match your filters.
                      </td>
                    </tr>
                  ) : (
                    displaySchools.map((s) => (
                      <tr
                        key={s.id}
                        className="hover:bg-gray-50/80 transition-colors"
                      >
                        <td className="px-4 py-3 align-top">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/70 text-white font-bold text-[11px] flex items-center justify-center shrink-0">
                              {s.initials}
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-gray-900 leading-tight">
                                {s.name}
                              </p>
                              <p className="text-[10px] text-gray-400 mt-0.5">
                                Edited by {s.updated_by || "System Seed"} · {formatAuditTime(s.updated_at)}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 hidden sm:table-cell align-top">
                          <p className="text-primary font-semibold inline-flex items-center gap-1">
                            <Globe className="w-3 h-3 shrink-0" />
                            {s.primary_domain}
                          </p>
                          {s.custom_domain && (
                            <p className="text-[10px] text-gray-400 mt-0.5">
                              Subdomain: {s.subdomain}.isomaug.com
                            </p>
                          )}
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell align-top">
                          <p className="font-semibold text-gray-800">{s.tier_label}</p>
                          <p className="text-[11px] font-bold text-primary mt-0.5">
                            {(s.curricula || [s.curriculum])
                              .map((c) => c.replace(/_/g, " "))
                              .join(" · ")}
                          </p>
                        </td>
                        <td className="px-4 py-3 hidden lg:table-cell align-top text-center">
                          <p className="font-bold text-gray-900">{s.members_count || 0}</p>
                          <p className="text-[10px] text-gray-400">
                            {(s.enabled_portals || []).length} portals
                          </p>
                        </td>
                        <td className="px-4 py-3 hidden xl:table-cell align-top">
                          <span
                            className={`inline-flex items-center gap-1 text-[11px] font-bold ${
                              s.onboarding_status === "COMPLETED"
                                ? "text-emerald-700"
                                : "text-amber-700"
                            }`}
                          >
                            {s.onboarding_status === "COMPLETED" ? (
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            ) : (
                              <Clock className="w-3.5 h-3.5" />
                            )}
                            {s.onboarding_status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right align-top">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button
                                type="button"
                                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                                aria-label={`Actions for ${s.name}`}
                              >
                                <MoreHorizontal className="w-4 h-4" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              align="end"
                              className="w-48 bg-white border border-gray-200 shadow-lg rounded-xl p-1"
                            >
                              <DropdownMenuItem
                                asChild
                                className="flex items-center gap-2 px-2.5 py-2 text-xs font-medium text-gray-700 rounded-lg cursor-pointer hover:bg-primary/5 hover:text-primary"
                              >
                                <a
                                  href={getTenantPortalUrl(s.subdomain, "/")}
                                  target="_blank"
                                  rel="noreferrer"
                                >
                                  <ExternalLink className="w-3.5 h-3.5 text-primary" />
                                  Open School Portal
                                </a>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => startEditSchool(s)}
                                className="flex items-center gap-2 px-2.5 py-2 text-xs font-medium text-gray-700 rounded-lg cursor-pointer hover:bg-primary/5 hover:text-primary"
                              >
                                <Pencil className="w-3.5 h-3.5 text-gray-500" />
                                Edit School
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  setEditingSchoolSub(null);
                                  setEditingCurrSub(s.subdomain);
                                  setEditingCurrList(s.curricula || [s.curriculum]);
                                }}
                                className="flex items-center gap-2 px-2.5 py-2 text-xs font-medium text-gray-700 rounded-lg cursor-pointer hover:bg-primary/5 hover:text-primary"
                              >
                                <BookOpen className="w-3.5 h-3.5 text-gray-500" />
                                Assign Curricula
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                asChild
                                className="flex items-center gap-2 px-2.5 py-2 text-xs font-medium text-gray-700 rounded-lg cursor-pointer hover:bg-primary/5 hover:text-primary"
                              >
                                <a
                                  href={getTenantPortalUrl(s.subdomain, "/onboarding")}
                                  target="_blank"
                                  rel="noreferrer"
                                >
                                  <Users className="w-3.5 h-3.5 text-gray-500" />
                                  Open Onboarding
                                </a>
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

          {/* Edit School Dialog */}
          <Dialog
            open={!!editingSchoolSub && !!editForm}
            onOpenChange={(open) => {
              if (!open) {
                setEditingSchoolSub(null);
                setEditForm(null);
              }
            }}
          >
            <DialogContent className="sm:max-w-lg bg-white border border-gray-200 rounded-2xl">
              <DialogHeader>
                <DialogTitle className="text-base font-bold text-gray-900">
                  Edit {editingSchoolObj?.name || "School"}
                </DialogTitle>
              </DialogHeader>
              {editForm && (
                <div className="space-y-3 pt-2">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      School Name
                    </label>
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Category
                      </label>
                      <UniversalSelect
                        value={editForm.tier}
                        onChange={(val) => setEditForm({ ...editForm, tier: val })}
                        options={TIERS}
                        placeholder="Category..."
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Onboarding Status
                      </label>
                      <UniversalSelect
                        value={editForm.onboarding_status}
                        onChange={(val) =>
                          setEditForm({ ...editForm, onboarding_status: val })
                        }
                        options={STATUS_OPTIONS}
                        placeholder="Status..."
                        searchable={false}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Allowed Curricula
                    </label>
                    <UniversalSelect
                      multiple
                      minSelected={1}
                      value={editForm.curricula}
                      onChange={(vals) => setEditForm({ ...editForm, curricula: vals })}
                      options={CURRICULA}
                      placeholder="Select curricula..."
                      searchPlaceholder="Search curricula..."
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Custom Domain
                    </label>
                    <input
                      type="text"
                      value={editForm.custom_domain}
                      onChange={(e) =>
                        setEditForm({ ...editForm, custom_domain: e.target.value })
                      }
                      placeholder="e.g. portal.school.ac.ug"
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <input
                      type="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                      placeholder="Email"
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs focus:outline-none focus:border-primary"
                    />
                    <input
                      type="text"
                      value={editForm.phone}
                      onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                      placeholder="Phone"
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingSchoolSub(null);
                        setEditForm(null);
                      }}
                      className="text-xs text-gray-500 hover:text-gray-800 px-3 py-2"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={savingEdit}
                      onClick={() => saveSchoolEdit(editingSchoolSub)}
                      className="bg-primary text-white text-xs font-semibold px-4 py-2 rounded-lg hover:bg-primary-hover"
                    >
                      {savingEdit ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>

          {/* Assign Curricula Dialog */}
          <Dialog
            open={!!editingCurrSub}
            onOpenChange={(open) => {
              if (!open) setEditingCurrSub(null);
            }}
          >
            <DialogContent className="sm:max-w-md bg-white border border-gray-200 rounded-2xl">
              <DialogHeader>
                <DialogTitle className="text-base font-bold text-gray-900">
                  Assign Curricula - {editingCurrObj?.name || ""}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <UniversalSelect
                  multiple
                  minSelected={1}
                  value={editingCurrList}
                  onChange={setEditingCurrList}
                  options={CURRICULA}
                  placeholder="Select curricula..."
                  searchPlaceholder="Search curricula..."
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingCurrSub(null)}
                    className="text-xs text-gray-500 hover:text-gray-800 px-3 py-2"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={savingCurr}
                    onClick={() => saveSchoolCurricula(editingCurrSub)}
                    className="bg-primary text-white text-xs font-semibold px-4 py-2 rounded-lg hover:bg-primary-hover"
                  >
                    {savingCurr ? "Saving..." : "Save Curricula"}
                  </button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      )}
    </div>
  );
}

export function CategoriesPage() {
  return (
    <div className="flex-1 bg-white rounded-t-2xl rounded-b-none shadow-sm border border-b-0 border-gray-100 overflow-hidden">
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
    <div className="flex-1 bg-white rounded-t-2xl rounded-b-none shadow-sm border border-b-0 border-gray-100 overflow-hidden">
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
          <span className="text-xs font-bold text-primary">{users.length} Users</span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 text-xs">
                <th className="py-2.5 px-4 font-semibold">Name</th>
                <th className="py-2.5 px-4 font-semibold">Email</th>
                <th className="py-2.5 px-4 font-semibold">Role</th>
                <th className="py-2.5 px-4 font-semibold">School / Portal</th>
                <th className="py-2.5 px-4 font-semibold">Phone</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50/80">
                  <td className="py-2.5 px-4 font-semibold text-gray-800">{u.full_name}</td>
                  <td className="py-2.5 px-4 text-gray-600">{u.email}</td>
                  <td className="py-2.5 px-4 font-bold text-primary text-[11px]">
                    {u.role_label}
                  </td>
                  <td className="py-2.5 px-4 text-gray-600">{u.institution || "Platform"}</td>
                  <td className="py-2.5 px-4 text-gray-500">{u.phone || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export function InvoicesPage() {
  return (
    <div className="flex-1 bg-white rounded-t-2xl rounded-b-none shadow-sm border border-b-0 border-gray-100 overflow-hidden">
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
    </div>
  );
}

export function DomainsPage() {
  const [schools, setSchools] = useState([]);
  const [selectedSlug, setSelectedSlug] = useState("");
  const [domainInput, setDomainInput] = useState("");
  const [domainCfg, setDomainCfg] = useState(null);

  useEffect(() => {
    fetch("/api/tenant/institutions/")
      .then((r) => (r.ok ? r.json() : { results: [] }))
      .then((d) => {
        const list = d.results || [];
        setSchools(list);
        if (list.length > 0) setSelectedSlug(list[0].subdomain);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedSlug) return;
    fetch(`/api/academics/custom-domain/?tenant=${encodeURIComponent(selectedSlug)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) {
          setDomainCfg(data);
          setDomainInput(data.custom_domain || "");
        }
      })
      .catch(() => {});
  }, [selectedSlug]);

  async function handleDomainAction(verifyNow = false) {
    if (!selectedSlug) return;
    const res = await fetch(
      `/api/academics/custom-domain/?tenant=${encodeURIComponent(selectedSlug)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ custom_domain: domainInput, verify_now: verifyNow }),
      }
    );
    const data = await res.json();
    if (!res.ok) {
      customToast.error(data.detail || "Could not configure custom domain.");
      return;
    }
    setDomainCfg(data);
    customToast.success(
      verifyNow
        ? `Verified ${data.custom_domain} - SSL certificate active.`
        : `Generated DNS CNAME & TXT challenge for ${data.custom_domain}.`
    );
  }

  return (
    <div className="flex-1 flex flex-col space-y-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-primary via-primary/60 to-primary" />
        <div className="p-6 md:p-8 space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">
                Custom Domain &amp; TLS Engine (Super Admin)
              </h1>
              <p className="text-xs text-gray-500">
                Configure white-label school domains (`portal.school.ac.ug`), DNS CNAME/TXT challenges, and TLS certificates.
              </p>
            </div>
          </div>

          <div className="w-full space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <UniversalSelect
                value={selectedSlug}
                onChange={setSelectedSlug}
                options={schools.map((s) => ({
                  value: s.subdomain,
                  label: `${s.name} (${s.subdomain}.isomaug.com)`,
                }))}
                placeholder="Select school..."
                searchPlaceholder="Search schools..."
              />
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={domainInput}
                  onChange={(e) => setDomainInput(e.target.value)}
                  placeholder="e.g. portal.smack.ac.ug"
                  className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-xs focus:outline-none focus:border-primary"
                />
                <button
                  type="button"
                  onClick={() => handleDomainAction(false)}
                  className="bg-primary text-white text-xs font-semibold px-4 py-2 rounded-lg hover:bg-primary-hover shrink-0"
                >
                  Generate DNS
                </button>
                <button
                  type="button"
                  onClick={() => handleDomainAction(true)}
                  className="border border-primary text-primary text-xs font-semibold px-4 py-2 rounded-lg hover:bg-primary/5 shrink-0"
                >
                  Verify &amp; Activate TLS
                </button>
              </div>
            </div>

            {domainCfg && domainCfg.custom_domain && (
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-xs space-y-1.5">
                <p className="font-bold text-gray-900">
                  Status: <span className="text-primary">{domainCfg.status}</span>
                </p>
                <p className="text-gray-600">
                  CNAME: <span className="font-mono font-semibold">{domainCfg.custom_domain}</span>{" "}
                  -&gt; <span className="font-mono">{domainCfg.cname_target}</span>
                </p>
                <p className="text-gray-600">
                  TXT: <span className="font-mono">{domainCfg.txt_record_name}</span> ={" "}
                  <span className="font-mono">{domainCfg.txt_record_value}</span>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 bg-white rounded-t-2xl rounded-b-none shadow-sm border border-b-0 border-gray-100 p-6 md:p-8">
        <h2 className="text-sm font-semibold text-gray-900 mb-4">Active School Domains</h2>
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
              <span className="inline-flex items-center gap-1 text-emerald-700 text-[11px] font-bold">
                <ShieldCheck className="w-3.5 h-3.5" />
                Active TLS
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function SettingsPage() {
  return (
    <div className="flex-1 bg-white rounded-t-2xl rounded-b-none shadow-sm border border-b-0 border-gray-100 overflow-hidden">
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
    </div>
  );
}
