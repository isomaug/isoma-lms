import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Building2,
  Plus,
  Globe,
  ArrowRight,
  CheckCircle2,
  Clock,
  ShieldCheck,
} from "lucide-react";
import { customToast } from "../../components/GlobalPopup";

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
  { value: "CUSTOM", label: "Custom Institutional Curriculum" },
];

export default function SuperAccountConsole() {
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    name: "",
    subdomain: "",
    tier: "SECONDARY",
    curriculum: "UNEB_LOWER_SECONDARY",
    email: "",
    phone: "",
  });

  async function loadClients() {
    try {
      const res = await fetch("/api/tenant/institutions/");
      if (res.ok) {
        const data = await res.json();
        setClients(data.results || []);
      }
    } catch {
      customToast.error("Could not load client tenants.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadClients();
  }, []);

  async function handleCreate(e) {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await fetch("/api/tenant/institutions/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed to provision client.");
      customToast.success(`Client "${data.name}" created on ${data.primary_domain}.`);
      setForm({
        name: "",
        subdomain: "",
        tier: "SECONDARY",
        curriculum: "UNEB_LOWER_SECONDARY",
        email: "",
        phone: "",
      });
      await loadClients();
      navigate(`/t/${data.subdomain}/onboarding`);
    } catch (err) {
      customToast.error(err.message);
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* Root Super Account Header Card */}
      <div className="relative bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-primary/60 to-primary" />
        <div className="px-6 py-7 md:px-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold text-primary uppercase tracking-widest">
              Tier 1 · Root Super Account (isomaug.com)
            </p>
            <h1 className="text-lg md:text-2xl font-bold text-gray-900 tracking-tight mt-1">
              Client &amp; Tenant Provisioning Console
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Create organisation accounts from isomaug.com. Even{" "}
              <span className="font-semibold text-primary">learn.isomaug.com</span>{" "}
              operates as a client tenant with onboarding &amp; role portals on its own workspace.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-xl bg-primary/10 text-primary px-4 py-2 text-xs font-semibold shrink-0">
            <ShieldCheck className="w-4 h-4" />
            {clients.length} Provisioned Clients
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Create New Client Form */}
        <form
          onSubmit={handleCreate}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 md:p-6 space-y-3.5"
        >
          <div className="flex items-center gap-2.5 pb-2 border-b border-gray-100">
            <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Plus className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-gray-900">
                Create Client Account
              </h2>
              <p className="text-[11px] text-gray-500">
                Provision a new tenant under isomaug.com
              </p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Institution / Client Name
            </label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. St. Mary's College Kisubi"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Subdomain
            </label>
            <div className="flex items-center rounded-lg border border-gray-200 overflow-hidden focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
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
                placeholder="stmarys"
                className="flex-1 px-3 py-2 text-xs focus:outline-none"
              />
              <span className="bg-gray-50 px-2.5 py-2 text-[11px] font-medium text-gray-500 border-l border-gray-200">
                .isomaug.com
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Tier
              </label>
              <select
                value={form.tier}
                onChange={(e) => setForm({ ...form, tier: e.target.value })}
                className="w-full rounded-lg border border-gray-200 px-2.5 py-2 text-xs bg-white focus:outline-none focus:border-primary"
              >
                {TIERS.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Curriculum
              </label>
              <select
                value={form.curriculum}
                onChange={(e) => setForm({ ...form, curriculum: e.target.value })}
                className="w-full rounded-lg border border-gray-200 px-2.5 py-2 text-xs bg-white focus:outline-none focus:border-primary"
              >
                {CURRICULA.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Admin Email
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="admin@school.ac.ug"
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
            className="w-full bg-primary text-white font-medium py-2.5 px-4 rounded-lg hover:bg-primary-hover text-xs inline-flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-60"
          >
            {creating ? "Provisioning..." : "Create Client & Launch Onboarding"}
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* Provisioned Clients Directory */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-5 md:p-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">
            Active &amp; Pending Client Tenants
          </h2>
          {loading ? (
            <p className="text-xs text-gray-400">Loading clients...</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {clients.map((client) => (
                <div
                  key={client.id}
                  className="group rounded-xl border border-gray-200 p-4 flex flex-col justify-between hover:border-primary/40 hover:shadow-md hover:shadow-primary/5 transition-all"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-primary/70 text-white font-bold text-xs flex items-center justify-center shrink-0">
                          {client.initials}
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-xs font-bold text-gray-900 truncate">
                            {client.name}
                          </h3>
                          <p className="text-[11px] text-primary font-medium inline-flex items-center gap-1 truncate">
                            <Globe className="w-3 h-3" />
                            {client.primary_domain}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full inline-flex items-center gap-1 shrink-0 ${
                          client.onboarding_status === "COMPLETED"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        {client.onboarding_status === "COMPLETED" ? (
                          <CheckCircle2 className="w-3 h-3" />
                        ) : (
                          <Clock className="w-3 h-3" />
                        )}
                        {client.onboarding_status}
                      </span>
                    </div>

                    <p className="text-[11px] text-gray-500 mb-2">
                      {client.tier_label} · {client.curriculum}
                    </p>
                    <p className="text-[11px] text-gray-400">
                      {(client.enabled_portals || []).length} Role Portals enabled
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-100 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => navigate(`/t/${client.subdomain}`)}
                      className="flex-1 bg-primary text-white text-xs font-medium py-2 px-3 rounded-lg hover:bg-primary-hover transition-colors inline-flex items-center justify-center gap-1.5"
                    >
                      <Building2 className="w-3.5 h-3.5" />
                      Open Portals
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate(`/t/${client.subdomain}/onboarding`)}
                      className="border border-primary/20 bg-primary/5 text-primary text-xs font-medium py-2 px-3 rounded-lg hover:bg-primary/10 transition-colors"
                    >
                      Onboarding
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
