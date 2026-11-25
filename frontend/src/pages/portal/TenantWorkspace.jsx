import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ShieldCheck,
  BookOpen,
  GraduationCap,
  Users,
  Wallet,
  HeartPulse,
  Shield,
  Library,
  CheckCircle2,
  ArrowRight,
  Globe,
  UserPlus,
  Lock,
  UtensilsCrossed,
  BedDouble,
  Bus,
  Package,
  Briefcase,
  Trophy,
  ClipboardCheck,
  FileSpreadsheet,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { customToast } from "../../components/GlobalPopup";
import { UniversalSelect } from "../../components/ui/UniversalSelect";
import SolidStatCards from "../../components/SolidStatCards";

const STAFF_ROLE_OPTIONS = [
  { value: "PRINCIPAL", label: "Principal / Admin" },
  { value: "DOS", label: "Director of Studies (DOS)" },
  { value: "ADMISSIONS", label: "Admissions Officer" },
  { value: "TEACHER", label: "Teacher / Instructor" },
  { value: "STUDENT", label: "Student / Learner" },
  { value: "PARENT", label: "Parent / Guardian" },
  { value: "BURSAR", label: "Bursar / Finance" },
  { value: "HR_PAYROLL", label: "HR & Payroll" },
  { value: "CANTEEN", label: "Canteen Manager / POS" },
  { value: "HOUSEMASTER", label: "Housemaster / Matron" },
  { value: "NURSE", label: "Nurse / Sickbay" },
  { value: "GUARD", label: "Security Guard / Gate" },
  { value: "LIBRARIAN", label: "Librarian" },
  { value: "PROCUREMENT", label: "Storekeeper / Procurement" },
  { value: "TRANSPORT", label: "Transport / Fleet" },
  { value: "GAMES", label: "Games Master / Clubs" },
];

const CURRICULUM_CHOICES = [
  { code: "UNEB_LOWER_SECONDARY", label: "Uganda UNEB / NCDC CBC (Secondary)" },
  { code: "UNEB_PRIMARY", label: "Uganda UNEB Primary (PLE)" },
  { code: "CAMBRIDGE_IGCSE", label: "Cambridge International (Primary / IGCSE / A-Level)" },
  { code: "ACE_PACE", label: "Accelerated Christian Education (ACE PACEs)" },
  { code: "IB_DP", label: "International Baccalaureate (PYP / MYP / DP)" },
  { code: "MONTESSORI_ECD", label: "Montessori / Nursery ECD" },
  { code: "CUSTOM", label: "Custom Institutional Curriculum" },
];

const ROLE_CARDS = {
  PRINCIPAL: {
    title: "Principal & School Administration",
    subtitle: "Oversee multi-curriculum wings, staff onboarding, academics, report cards, and campus operations.",
    cards: [
      {
        title: "School Onboarding & Staff Accounts",
        desc: "Enable multiple curricula (e.g. UNEB + Cambridge), set custom domain, and add staff across all 16 role portals.",
        cta: "Open Onboarding & Staff",
        icon: UserPlus,
        route: "/onboarding",
      },
      {
        title: "Course Templates & Academics",
        desc: "Manage shared lesson templates, school subjects, cohorts, and report card sign-offs.",
        cta: "Manage Courses",
        icon: BookOpen,
        route: "/dashboard/courses",
      },
    ],
  },
  DOS: {
    title: "Director of Studies & Academic Registrar",
    subtitle: "Manage curriculum tracks, class streams, marks moderation, timetables, and automated report cards.",
    cards: [
      {
        title: "Automated Report Cards (PDF + QR)",
        desc: "Compute UNEB AOI+EOT, Cambridge grades, or Nursery milestones and batch-issue tamper-proof QR report cards.",
        cta: "Report Cards & Verification",
        icon: FileSpreadsheet,
        route: "/verify",
      },
      {
        title: "Curriculum Course Templates",
        desc: "Approve and assign master course templates that teachers clone into class lessons.",
        cta: "Open Templates",
        icon: BookOpen,
        route: "/courses",
      },
    ],
  },
  ADMISSIONS: {
    title: "Admissions & Student Registry",
    subtitle: "Process online applications, assign student registration numbers, and link parent accounts.",
    cards: [
      {
        title: "Student & Staff Onboarding Registry",
        desc: "Create new accounts, assign classes/curriculum tracks, and issue admission letters with QR codes.",
        cta: "Open Registry",
        icon: ClipboardCheck,
        route: "/onboarding",
      },
      {
        title: "Cohorts & Class Streams",
        desc: "Place admitted students into curriculum-scoped class streams and cohorts.",
        cta: "Manage Streams",
        icon: Users,
        route: "/dashboard/cohorts",
      },
    ],
  },
  TEACHER: {
    title: "Teacher & Instructor Portal",
    subtitle: "Clone course templates into your class lessons, manage schemes of work, and enter student marks.",
    cards: [
      {
        title: "Use Course as Lesson Template",
        desc: "Pick a curriculum-matched course from Isoma's library, clone its modules & quizzes, and customize lessons for your class.",
        cta: "Browse Course Templates",
        icon: BookOpen,
        route: "/courses",
      },
      {
        title: "My Classes, Attendance & Marks",
        desc: "Track class rosters, lesson schedules, past papers, and continuous assessment marks.",
        cta: "Open My Classes",
        icon: Users,
        route: "/dashboard/cohorts",
      },
    ],
  },
  STUDENT: {
    title: "Student & Learner Portal",
    subtitle: "Access your enrolled subjects, interactive lessons, quizzes, past papers, and verified report cards.",
    cards: [
      {
        title: "My Learning",
        desc: "Continue your enrolled classes, complete interactive labs, and track progress.",
        cta: "Go to My Learning",
        icon: GraduationCap,
        route: "/my-learning",
      },
      {
        title: "Open Academy & Revision Catalog",
        desc: "Explore additional courses, past papers, and skill bootcamps.",
        cta: "Browse Courses",
        icon: BookOpen,
        route: "/courses",
      },
    ],
  },
  PARENT: {
    title: "Parent & Guardian Portal",
    subtitle: "Track child attendance, download termly report cards, pay fees, and top up canteen wallets.",
    cards: [
      {
        title: "Termly Report Cards & Certificates",
        desc: "View and verify signed report cards and academic progress per term.",
        cta: "View & Verify",
        icon: ShieldCheck,
        route: "/verify",
      },
      {
        title: "Fees & Cashless Canteen Top-Up",
        desc: "Pay school fees and deposit pocket money via MTN MoMo or Airtel Money.",
        cta: "View Fee Statement",
        icon: Wallet,
        route: null,
      },
    ],
  },
  BURSAR: {
    title: "Bursar & Finance Portal",
    subtitle: "Configure fee structures, reconcile Mobile Money/bank payments, issue clearance slips, and approve payroll.",
    cards: [
      {
        title: "Fees, Invoicing & Clearance",
        desc: "Manage tuition, boarding, transport zones, instant receipts, and exam clearance.",
        cta: "Open Fee Ledger",
        icon: Wallet,
        route: null,
      },
      {
        title: "Staff & Payroll Roster",
        desc: "Review staff accounts and reconcile monthly payroll disbursements.",
        cta: "Open Staff Roster",
        icon: Users,
        route: "/onboarding",
      },
    ],
  },
  HR_PAYROLL: {
    title: "HR, Biometrics & Payroll Portal",
    subtitle: "Manage staff recruitment, digital contracts, leave approvals, biometric attendance, and monthly payslips.",
    cards: [
      {
        title: "Staff Directory & Onboarding",
        desc: "Add new staff accounts, assign role portals, and manage employment contracts.",
        cta: "Manage Staff",
        icon: Briefcase,
        route: "/onboarding",
      },
      {
        title: "Monthly Payroll & PAYE / NSSF",
        desc: "Reconcile biometric attendance, calculate PAYE/NSSF/LST, and export bank or MoMo payout batches.",
        cta: "Open Payroll Run",
        icon: Wallet,
        route: null,
      },
    ],
  },
  CANTEEN: {
    title: "Canteen Management & Cashless POS",
    subtitle: "Tap student Smart QR badges or biometrics for zero-cash tuckshop, stationery, and uniform sales.",
    cards: [
      {
        title: "Cashless Canteen POS Terminal",
        desc: "Scan student Smart QR badge to deduct purchases within daily spending limits and notify parents instantly.",
        cta: "Launch POS Terminal",
        icon: UtensilsCrossed,
        route: null,
      },
      {
        title: "Daily Sales & Canteen Stock",
        desc: "Track canteen inventory, daily cashless settlements, and student wallet top-ups.",
        cta: "View Canteen Tally",
        icon: Wallet,
        route: null,
      },
    ],
  },
  HOUSEMASTER: {
    title: "Boarding House & Matron Portal",
    subtitle: "Manage dormitories, bed allocations, evening QR roll-call scans, and student exeat approvals.",
    cards: [
      {
        title: "Dormitories & Bed Allocation",
        desc: "Assign beds across houses, monitor room capacity, and log boarding conduct.",
        cta: "Manage Dormitories",
        icon: BedDouble,
        route: null,
      },
      {
        title: "Evening Roll-Call & Exeat Sign-Off",
        desc: "Run evening QR roll-call scans and authorize student exit passes before gate departure.",
        cta: "Start Roll-Call",
        icon: ShieldCheck,
        route: null,
      },
    ],
  },
  NURSE: {
    title: "Nurse & Sickbay Portal",
    subtitle: "Student medical profiles, triage visit logs, dispensary stock, and parent emergency alerts.",
    cards: [
      {
        title: "Clinic Triage & Visits",
        desc: "Record student vitals, diagnosis, administered treatments, and sickbay admissions.",
        cta: "Log Clinic Visit",
        icon: HeartPulse,
        route: null,
      },
      {
        title: "Dispensary & Medicine Stock",
        desc: "Track pharmaceutical batches, expiry alerts, and prescription fulfillment.",
        cta: "Open Dispensary",
        icon: ShieldCheck,
        route: null,
      },
    ],
  },
  GUARD: {
    title: "Security & Gate Pass Portal",
    subtitle: "Visitor badge registration, multi-stage student exeat QR verification, and campus security logs.",
    cards: [
      {
        title: "Student Exeat / Gate Pass Scan",
        desc: "Scan and verify Nurse/Housemaster-approved exit passes before any student leaves campus.",
        cta: "Verify Gate Pass",
        icon: Shield,
        route: null,
      },
      {
        title: "Visitor Register & Curfew Log",
        desc: "Register campus visitors, notify hosts, and log security incidents.",
        cta: "Open Visitor Log",
        icon: Users,
        route: null,
      },
    ],
  },
  LIBRARIAN: {
    title: "Library & E-Library Portal",
    subtitle: "Physical book circulation, barcode/QR checkout, overdue fines, and digital past papers.",
    cards: [
      {
        title: "Digital E-Library & Past Papers",
        desc: "Manage digital textbooks, revision guides, and past paper archives.",
        cta: "Open E-Library",
        icon: Library,
        route: "/courses",
      },
      {
        title: "Book Circulation Desk",
        desc: "Check books in and out via barcode/QR and auto-bill overdue fines.",
        cta: "Open Circulation",
        icon: BookOpen,
        route: null,
      },
    ],
  },
  PROCUREMENT: {
    title: "Storekeeper & Procurement Portal",
    subtitle: "Department requisitions, multi-tier approvals, vendor purchase orders, and school asset ledger.",
    cards: [
      {
        title: "Requisitions & Purchase Orders",
        desc: "Track Department Head → Bursar → Principal requisition approvals and supplier quotes.",
        cta: "Open Requisitions",
        icon: Package,
        route: null,
      },
      {
        title: "Stock & Asset Inventory",
        desc: "Monitor lab chemicals, stationery, uniforms, and school equipment stock levels.",
        cta: "Open Stock Ledger",
        icon: ShieldCheck,
        route: null,
      },
    ],
  },
  TRANSPORT: {
    title: "Transport & Fleet Portal",
    subtitle: "Bus route zones, student boarding QR manifests, driver logs, and vehicle maintenance alerts.",
    cards: [
      {
        title: "Bus Routes & Passenger Manifests",
        desc: "Manage route stops, fee zones, and driver QR boarding check-ins.",
        cta: "Open Routes & Manifests",
        icon: Bus,
        route: null,
      },
      {
        title: "Fleet Maintenance & Fuel Logs",
        desc: "Track service schedules, fuel consumption, insurance, and roadworthiness.",
        cta: "Open Fleet Logs",
        icon: ShieldCheck,
        route: null,
      },
    ],
  },
  GAMES: {
    title: "Games Master & Co-Curricular Portal",
    subtitle: "Clubs & societies registry, inter-house sports day scoreboards, and merit/demerit conduct.",
    cards: [
      {
        title: "Clubs & Inter-House Sports",
        desc: "Manage Debate, Robotics, Red Cross, MDD, Choir, and live sports house leaderboards.",
        cta: "Open Clubs & Sports",
        icon: Trophy,
        route: null,
      },
      {
        title: "Merit & Demerit Conduct Log",
        desc: "Award leadership merits and log conduct points that feed into termly report cards.",
        cta: "Open Conduct Log",
        icon: ShieldCheck,
        route: null,
      },
    ],
  },
};

export default function TenantWorkspace({ onboarding = false }) {
  const { tenant, tenantSlug, effectiveRole } = useAuth();
  const navigate = useNavigate();
  const slug = tenant?.subdomain && tenant.subdomain !== "root" ? tenant.subdomain : tenantSlug || "stmarys";

  const [staff, setStaff] = useState([]);
  const [templatesCount, setTemplatesCount] = useState(0);
  const [saving, setSaving] = useState(false);
  const [addingStaff, setAddingStaff] = useState(false);
  const [customDomain, setCustomDomain] = useState(tenant?.custom_domain || "");
  const [selectedCurricula, setSelectedCurricula] = useState(
    tenant?.curricula || [tenant?.curriculum || "UNEB_LOWER_SECONDARY"]
  );
  const [staffForm, setStaffForm] = useState({
    full_name: "",
    email: "",
    role: "TEACHER",
    phone: "",
  });

  useEffect(() => {
    setCustomDomain(tenant?.custom_domain || "");
    setSelectedCurricula(
      tenant?.curricula?.length
        ? tenant.curricula
        : [tenant?.curriculum || "UNEB_LOWER_SECONDARY"]
    );
  }, [tenant]);

  function toggleCurriculum(code) {
    setSelectedCurricula((prev) => {
      if (prev.includes(code)) {
        return prev.length > 1 ? prev.filter((c) => c !== code) : prev;
      }
      return [...prev, code];
    });
  }

  async function loadStaff() {
    try {
      const res = await fetch(`/api/tenant/institutions/${encodeURIComponent(slug)}/staff/`);
      if (res.ok) {
        const data = await res.json();
        setStaff(data.results || []);
      }
    } catch {
      // ignore
    }
  }

  useEffect(() => {
    if (!slug) return;
    loadStaff();
    fetch(`/api/tenant/curriculum-templates/?tenant=${encodeURIComponent(slug)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setTemplatesCount(data.count || (data.results || []).length);
      })
      .catch(() => {});
  }, [onboarding, slug]);

  async function handleSaveOnboarding(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(
        `/api/tenant/institutions/${encodeURIComponent(slug)}/onboarding/`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            custom_domain: customDomain,
            curricula: selectedCurricula,
            curriculum: selectedCurricula[0],
            onboarding_status: "COMPLETED",
          }),
        }
      );
      if (!res.ok) throw new Error("Could not save school onboarding.");
      customToast.success(`Saved ${selectedCurricula.length} curriculum track(s) for ${tenant?.name || slug}.`);
    } catch (err) {
      customToast.error(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleAddStaff(e) {
    e.preventDefault();
    setAddingStaff(true);
    try {
      const res = await fetch(
        `/api/tenant/institutions/${encodeURIComponent(slug)}/staff/`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(staffForm),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Could not add staff member.");
      customToast.success(`Added ${data.full_name} (${data.role_label}).`);
      setStaffForm({ full_name: "", email: "", role: "TEACHER", phone: "" });
      await loadStaff();
    } catch (err) {
      customToast.error(err.message);
    } finally {
      setAddingStaff(false);
    }
  }

  if (onboarding) {
    return (
      <div className="space-y-4">
        <div className="relative bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-primary via-primary/60 to-primary" />
          <div className="px-6 py-6 md:px-8 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold text-primary uppercase tracking-widest inline-flex items-center gap-1.5">
                <Globe className="w-3 h-3" />
                {tenant?.primary_domain || `${slug}.isomaug.com`}
              </p>
              <h1 className="text-lg md:text-2xl font-bold text-gray-900 mt-1">
                {tenant?.name || slug} - Onboarding &amp; Staff
              </h1>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 text-emerald-700 px-3 py-1 text-xs font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {tenant?.onboarding_status || "IN_PROGRESS"}
            </span>
          </div>

          <form onSubmit={handleSaveOnboarding} className="p-6 md:p-8 space-y-5">
            <div>
              <p className="text-xs font-semibold text-gray-700 mb-2">
                Assigned Curricula (managed by Isoma Landlord ERP - read-only)
              </p>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 py-1">
                {selectedCurricula.map((code) => (
                  <span
                    key={code}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-primary uppercase tracking-wide"
                  >
                    <BookOpen className="w-4 h-4 text-primary" />
                    {code.replace(/_/g, " ")}
                  </span>
                ))}
              </div>
              <p className="text-[11px] text-gray-400 mt-1">
                Staff and students only see subjects and templates belonging to these curricula. Contact Isoma Admin to add another curriculum.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Custom White-Label Domain (Optional)
                </label>
                <input
                  type="text"
                  value={customDomain}
                  onChange={(e) => setCustomDomain(e.target.value)}
                  placeholder="portal.school.ac.ug"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs focus:outline-none focus:border-primary"
                />
              </div>
              <button
                type="submit"
                disabled={saving}
                className="bg-primary text-white text-xs font-medium py-2.5 px-4 rounded-lg hover:bg-primary-hover transition-colors"
              >
                {saving ? "Saving..." : "Save School Setup"}
              </button>
            </div>
          </form>
        </div>

        {/* Add Staff & Directory */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <form
            onSubmit={handleAddStaff}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 md:p-6 space-y-3"
          >
            <h2 className="text-sm font-semibold text-gray-900 pb-2 border-b border-gray-100">
              Add Staff / Portal User
            </h2>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={staffForm.full_name}
                onChange={(e) => setStaffForm({ ...staffForm, full_name: e.target.value })}
                placeholder="e.g. Mr. Musa Lubega"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Email</label>
              <input
                type="email"
                required
                value={staffForm.email}
                onChange={(e) => setStaffForm({ ...staffForm, email: e.target.value })}
                placeholder="canteen@school.ac.ug"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs focus:outline-none focus:border-primary"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Role Portal</label>
                <UniversalSelect
                  value={staffForm.role}
                  onChange={(val) => setStaffForm({ ...staffForm, role: val })}
                  options={STAFF_ROLE_OPTIONS}
                  placeholder="Select role..."
                  searchPlaceholder="Search roles..."
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Phone</label>
                <input
                  type="text"
                  value={staffForm.phone}
                  onChange={(e) => setStaffForm({ ...staffForm, phone: e.target.value })}
                  placeholder="+2567..."
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs focus:outline-none focus:border-primary"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={addingStaff}
              className="w-full bg-primary text-white text-xs font-medium py-2.5 px-4 rounded-lg hover:bg-primary-hover transition-colors"
            >
              {addingStaff ? "Adding..." : "Add to School (Default pw: Isoma2026!)"}
            </button>
          </form>

          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-5 md:p-6">
            <h2 className="text-sm font-semibold text-gray-900 mb-3">
              School Staff &amp; Users ({staff.length})
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-200 text-gray-600 text-xs">
                    <th className="py-2 pr-3 font-semibold">Name</th>
                    <th className="py-2 pr-3 font-semibold">Role Portal</th>
                    <th className="py-2 pr-3 font-semibold">Email</th>
                    <th className="py-2 font-semibold">Phone</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {staff.map((m) => (
                    <tr key={m.id}>
                      <td className="py-2.5 pr-3 font-semibold text-gray-800">{m.full_name}</td>
                      <td className="py-2.5 pr-3">
                        <span className="rounded-full bg-primary/10 text-primary px-2 py-0.5 text-[10px] font-semibold">
                          {m.role_label}
                        </span>
                      </td>
                      <td className="py-2.5 pr-3 text-gray-600">{m.email}</td>
                      <td className="py-2.5 text-gray-500">{m.phone || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const roleConfig = ROLE_CARDS[effectiveRole] || ROLE_CARDS.PRINCIPAL;
  const activeCurricula = tenant?.curricula?.length
    ? tenant.curricula
    : [tenant?.curriculum || "UNEB_LOWER_SECONDARY"];

  const roleStatsMap = {
    PRINCIPAL: [
      { label: "School Staff & Users", value: staff.length, sub: "Manage roles & onboarding", icon: Users, to: "/onboarding" },
      { label: "Assigned Curricula", value: activeCurricula.length, sub: "Scoped by Landlord ERP", icon: BookOpen, to: "/courses" },
      { label: "Curriculum Templates", value: templatesCount, sub: "Ready for teachers", icon: FileSpreadsheet, to: "/courses" },
      { label: "Role Portals Active", value: (tenant?.enabled_portals || []).length || 16, sub: "Switch via header menu", icon: ShieldCheck, to: "/onboarding" },
    ],
    DOS: [
      { label: "Assigned Curricula", value: activeCurricula.length, sub: "Active syllabus tracks", icon: BookOpen, to: "/courses" },
      { label: "Lesson Templates", value: templatesCount, sub: "Approved for classes", icon: FileSpreadsheet, to: "/courses" },
      { label: "Staff & Teachers", value: staff.length, sub: "Faculty directory", icon: Users, to: "/onboarding" },
      { label: "Report Cards", value: "Ready", sub: "PDF + QR verification", icon: ShieldCheck, to: "/verify" },
    ],
    ADMISSIONS: [
      { label: "Registered Accounts", value: staff.length, sub: "Staff & learner registry", icon: UserPlus, to: "/onboarding" },
      { label: "Assigned Curricula", value: activeCurricula.length, sub: "Admission tracks", icon: BookOpen, to: "/courses" },
      { label: "Active Cohorts", value: "Live", sub: "Class streams", icon: Users, to: "/dashboard/cohorts" },
      { label: "Pending Applications", value: 0, sub: "Online intake queue", icon: ClipboardCheck },
    ],
    TEACHER: [
      { label: "Lesson Templates", value: templatesCount, sub: "Clone into your class", icon: BookOpen, to: "/courses" },
      { label: "Assigned Curricula", value: activeCurricula.length, sub: "Your school tracks", icon: FileSpreadsheet, to: "/courses" },
      { label: "My Classes & Cohorts", value: "Active", sub: "Attendance & marks", icon: Users, to: "/dashboard/cohorts" },
      { label: "Past Papers", value: "Open", sub: "Revision & schemes", icon: ClipboardCheck, to: "/dashboard/past-papers" },
    ],
    STUDENT: [
      { label: "Available Courses", value: templatesCount, sub: "Open your subjects", icon: BookOpen, to: "/courses" },
      { label: "My Learning", value: "Active", sub: "Continue lessons", icon: GraduationCap, to: "/my-learning" },
      { label: "Certificates", value: "Verify", sub: "QR verified records", icon: ShieldCheck, to: "/verify" },
      { label: "Curriculum Tracks", value: activeCurricula.length, sub: "Assigned to school", icon: FileSpreadsheet, to: "/courses" },
    ],
    PARENT: [
      { label: "Linked Children", value: 1, sub: "Student progress", icon: Users },
      { label: "Report Cards", value: "Verify", sub: "Download signed PDFs", icon: ShieldCheck, to: "/verify" },
      { label: "Fee Balance", value: "UGX 0", sub: "Cleared for term", icon: Wallet },
      { label: "Canteen Wallet", value: "Active", sub: "MoMo top-up ready", icon: UtensilsCrossed },
    ],
    BURSAR: [
      { label: "School Accounts", value: staff.length, sub: "Staff & payroll roster", icon: Users, to: "/onboarding" },
      { label: "Fee Collection", value: "100%", sub: "MoMo & bank synced", icon: Wallet },
      { label: "Pending Invoices", value: 0, sub: "Term billing ledger", icon: FileSpreadsheet },
      { label: "Clearance Slips", value: "Ready", sub: "Exam & graduation", icon: ShieldCheck, to: "/verify" },
    ],
    HR_PAYROLL: [
      { label: "Total Staff", value: staff.length, sub: "Add or manage staff", icon: Users, to: "/onboarding" },
      { label: "Active Contracts", value: staff.length, sub: "Digital HR records", icon: Briefcase, to: "/onboarding" },
      { label: "Leave Requests", value: 0, sub: "Pending approval", icon: ClipboardCheck },
      { label: "Payroll Batch", value: "Ready", sub: "PAYE · NSSF · MoMo", icon: Wallet },
    ],
    CANTEEN: [
      { label: "Cashless Wallets", value: staff.length, sub: "Smart QR badges", icon: UtensilsCrossed },
      { label: "Today's POS Sales", value: "UGX 0", sub: "Zero-cash settlement", icon: Wallet },
      { label: "Low Stock Items", value: 0, sub: "Tuckshop inventory", icon: Package },
      { label: "Daily Spend Cap", value: "Active", sub: "Parent-set limits", icon: ShieldCheck },
    ],
    HOUSEMASTER: [
      { label: "Dormitory Houses", value: 4, sub: "Bed allocation", icon: BedDouble },
      { label: "Boarding Roll-Call", value: "Ready", sub: "Evening QR scan", icon: ClipboardCheck },
      { label: "Pending Exeats", value: 0, sub: "Gate pass sign-off", icon: Shield },
      { label: "Conduct Records", value: "Clean", sub: "Merits & demerits", icon: ShieldCheck },
    ],
    NURSE: [
      { label: "Medical Profiles", value: staff.length, sub: "Allergies & blood group", icon: HeartPulse },
      { label: "Clinic Visits Today", value: 0, sub: "Triage & vitals log", icon: ClipboardCheck },
      { label: "Low-Stock Drugs", value: 0, sub: "Dispensary alerts", icon: Package },
      { label: "Emergency Alerts", value: 0, sub: "Parent escalation", icon: ShieldCheck },
    ],
    GUARD: [
      { label: "Approved Exeats", value: 0, sub: "Ready for gate scan", icon: Shield },
      { label: "Visitors Today", value: 0, sub: "Digital visitor log", icon: Users },
      { label: "Gate Scans", value: "Live", sub: "QR Smart ID check", icon: ClipboardCheck },
      { label: "Curfew Status", value: "Secure", sub: "Campus perimeter", icon: ShieldCheck },
    ],
    LIBRARIAN: [
      { label: "Digital E-Library", value: templatesCount, sub: "Courses & past papers", icon: Library, to: "/courses" },
      { label: "Checked-Out Books", value: 0, sub: "Barcode circulation", icon: BookOpen },
      { label: "Overdue Fines", value: "UGX 0", sub: "Synced to fee ledger", icon: Wallet },
      { label: "Catalog Titles", value: "Ready", sub: "ISBN & Dewey index", icon: FileSpreadsheet },
    ],
    PROCUREMENT: [
      { label: "Pending Requisitions", value: 0, sub: "Dept -> Bursar -> Head", icon: Package },
      { label: "Open Purchase Orders", value: 0, sub: "Vendor ledger", icon: ClipboardCheck },
      { label: "Low Stock Alerts", value: 0, sub: "Lab & stationery", icon: ShieldCheck },
      { label: "School Assets", value: "Tracked", sub: "Depreciation register", icon: FileSpreadsheet },
    ],
    TRANSPORT: [
      { label: "Active Bus Routes", value: 4, sub: "Stops & fee zones", icon: Bus },
      { label: "Boarding Manifests", value: "Live", sub: "Driver QR check-in", icon: ClipboardCheck },
      { label: "Fleet Vehicles", value: 4, sub: "Fuel & maintenance", icon: ShieldCheck },
      { label: "Service Alerts", value: 0, sub: "Roadworthiness", icon: Package },
    ],
    GAMES: [
      { label: "Active Clubs", value: 6, sub: "Robotics, Debate, MDD", icon: Trophy },
      { label: "Sports Houses", value: 4, sub: "Inter-house leaderboard", icon: Users },
      { label: "Merits Awarded", value: 0, sub: "Feeds report cards", icon: ShieldCheck },
      { label: "Upcoming Fixtures", value: 0, sub: "Term calendar", icon: ClipboardCheck },
    ],
  };

  const roleStats = roleStatsMap[effectiveRole] || roleStatsMap.PRINCIPAL;

  return (
    <div className="relative flex-1 flex flex-col bg-white rounded-t-2xl rounded-b-none shadow-sm border border-b-0 border-gray-100 overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-primary/60 to-primary" />

      <div className="relative px-6 pt-8 pb-6 md:pt-10 md:pb-8 text-center compact-xs-pad">
        <div className="inline-flex items-center justify-center gap-3 h-16 md:h-20 mb-4 bg-white rounded-2xl shadow-sm border border-gray-100 px-5 py-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 text-white font-bold text-sm flex items-center justify-center">
            {tenant?.initials || "SM"}
          </div>
          <div className="text-left">
            <p className="text-xs md:text-sm font-bold text-gray-900 leading-tight">
              {tenant?.name || "ST. MARY'S COLLEGE KISUBI"}
            </p>
            <p className="text-[10px] font-semibold text-primary">
              {tenant?.primary_domain || `${slug}.isomaug.com`}
            </p>
          </div>
        </div>

        <h1 className="text-lg md:text-2xl font-bold text-gray-900 tracking-tight px-2">
          {roleConfig.title}
        </h1>
        <p className="text-gray-500 mt-1.5 text-sm md:text-base">{roleConfig.subtitle}</p>

        {/* Active Curricula - bold text + icon, no transparent pill background */}
        <div className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
          {activeCurricula.map((code) => (
            <span
              key={code}
              className="inline-flex items-center gap-1.5 text-primary text-[11px] font-bold tracking-wide uppercase"
            >
              <BookOpen className="w-3.5 h-3.5 text-primary" />
              {code.replace(/_/g, " ")}
            </span>
          ))}
        </div>

        <div className="mx-auto mt-6 h-px w-40 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      </div>

      <div className="relative px-5 pb-5 md:px-10">
        <SolidStatCards items={roleStats} />
      </div>

      <div className="relative flex-1 flex flex-col px-5 pb-6 md:px-10 md:pb-8">
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-5">
          {roleConfig.cards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.title}
                className="group relative h-full rounded-xl border border-gray-200 bg-white p-5 md:p-6 flex flex-col overflow-hidden transition-all duration-300 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5"
              >
                <div className="w-11 h-11 rounded-xl border border-gray-200 bg-white text-primary flex items-center justify-center mb-4 group-hover:bg-primary group-hover:border-primary group-hover:text-white transition-colors">
                  <Icon className="w-5 h-5" />
                </div>
                <h2 className="text-base font-semibold text-gray-900 mb-1.5">
                  {card.title}
                </h2>
                <p className="text-sm text-gray-500 leading-relaxed flex-1">
                  {card.desc}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    if (card.route) navigate(card.route);
                    else customToast.info(`${card.title} is scheduled in the upcoming ERP sprint.`);
                  }}
                  className="mt-5 w-full bg-primary text-white font-medium py-2.5 px-6 rounded-lg hover:bg-primary-hover transition-all text-sm active:scale-[0.98] inline-flex items-center justify-center gap-2"
                >
                  {card.cta}
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>

        <div className="mx-auto mt-6 h-px w-full max-w-md bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
        <div className="mt-4 flex flex-col md:flex-row items-center justify-center gap-1.5 text-sm text-gray-400">
          <span>
            Need help? Email{" "}
            <a
              href={`mailto:${tenant?.email || "support@isomaug.com"}`}
              className="text-primary font-medium hover:underline"
            >
              {tenant?.email || "support@isomaug.com"}
            </a>
          </span>
          <span className="hidden md:inline text-gray-300">·</span>
          <span className="inline-flex items-center gap-1.5">
            <Lock className="w-3 h-3 text-primary/40" />
            Powered by Isoma UG
          </span>
        </div>
      </div>
    </div>
  );
}
