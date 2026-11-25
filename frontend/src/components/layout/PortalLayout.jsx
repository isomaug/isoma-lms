import React, { useEffect, useRef, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  Home,
  Building2,
  Layers,
  Users,
  Receipt,
  Globe,
  Settings,
  BookOpen,
  GraduationCap,
  Award,
  HeartPulse,
  Shield,
  Library,
  Wallet,
  UserPlus,
  LifeBuoy,
  LogOut,
  LogIn,
  Menu,
  X,
  ArrowLeft,
  ChevronRight,
  ChevronDown,
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
import { customToast } from "../GlobalPopup";
import { UniversalSelect } from "../ui/UniversalSelect";
import ThemeSwitcher from "../ThemeSwitcher";
import { applyTenantBranding } from "../../utils/tenantBranding";
import isomaMark from "../../assets/brand/isoma-mark.png";

const LANDLORD_NAV = [
  { to: "/", label: "Dashboard", icon: Home, end: true },
  {
    to: "/schools",
    label: "Schools",
    icon: Building2,
    children: [
      { to: "/schools", label: "Registered Schools", end: true },
      { to: "/schools/new", label: "Add School", end: true },
      { to: "/schools/audit-log", label: "Edit Audit Log", end: true },
    ],
  },
  { to: "/categories", label: "Categories", icon: Layers },
  { to: "/users", label: "Users", icon: Users },
  { to: "/invoices", label: "Invoices", icon: Receipt },
  { to: "/domains", label: "Domains & TLS", icon: Globe },
  { to: "/settings", label: "Settings", icon: Settings },
];

const ADMISSIONS_ADMIN_CHILDREN = [
  { to: "/admissions", label: "Student Registry", end: true },
  { to: "/admissions/new", label: "Admit New Student", end: true },
  { to: "/admissions/classes", label: "Class Streams", end: true },
  { to: "/admissions/subjects", label: "Assign Official Subjects", end: true },
];

const REPORT_CARDS_ADMIN_CHILDREN = [
  { to: "/report-cards", label: "Issued Report Cards", end: true },
  { to: "/report-cards/enter-mark", label: "Enter Subject Mark", end: true },
  { to: "/report-cards/audit-log", label: "Marks Audit Log", end: true },
];

const REPORT_CARDS_TEACHER_CHILDREN = [
  { to: "/report-cards", label: "Issued Report Cards", end: true },
  { to: "/report-cards/enter-mark", label: "Enter Subject Mark", end: true },
];

const ONBOARDING_CHILDREN = [
  { to: "/onboarding", label: "Staff Directory", end: true },
  { to: "/onboarding/add-staff", label: "Add Staff / User", end: true },
  { to: "/onboarding/hr", label: "HR Pipeline", end: true },
];

const TENANT_NAV_BY_ROLE = {
  PRINCIPAL: [
    { to: "/", label: "Dashboard", icon: Home, end: true },
    {
      to: "/admissions",
      label: "Admissions & Students",
      icon: ClipboardCheck,
      children: ADMISSIONS_ADMIN_CHILDREN,
    },
    {
      to: "/report-cards",
      label: "Marks & Report Cards",
      icon: FileSpreadsheet,
      children: REPORT_CARDS_ADMIN_CHILDREN,
    },
    { to: "/courses", label: "Course Templates", icon: BookOpen },
    {
      to: "/onboarding",
      label: "Onboarding & Staff",
      icon: UserPlus,
      children: ONBOARDING_CHILDREN,
    },
    { to: "/dashboard/cohorts", label: "Classes & Cohorts", icon: Users },
    { to: "/verify", label: "Verify QR", icon: Award },
  ],
  DOS: [
    { to: "/", label: "Academics & DOS", icon: Home, end: true },
    {
      to: "/report-cards",
      label: "Marks & Report Cards",
      icon: FileSpreadsheet,
      children: REPORT_CARDS_ADMIN_CHILDREN,
    },
    {
      to: "/admissions",
      label: "Classes & Students",
      icon: ClipboardCheck,
      children: ADMISSIONS_ADMIN_CHILDREN,
    },
    { to: "/courses", label: "Curriculum Templates", icon: BookOpen },
    { to: "/dashboard/cohorts", label: "Streams & Timetables", icon: Users },
  ],
  ADMISSIONS: [
    { to: "/", label: "Admissions Desk", icon: Home, end: true },
    {
      to: "/admissions",
      label: "Admit & Registry",
      icon: ClipboardCheck,
      children: ADMISSIONS_ADMIN_CHILDREN,
    },
    {
      to: "/onboarding",
      label: "Staff Accounts",
      icon: UserPlus,
      children: ONBOARDING_CHILDREN,
    },
  ],
  TEACHER: [
    { to: "/", label: "Teacher Dashboard", icon: Home, end: true },
    { to: "/courses", label: "Lesson Templates", icon: BookOpen },
    {
      to: "/report-cards",
      label: "Marks & Report Cards",
      icon: FileSpreadsheet,
      children: REPORT_CARDS_TEACHER_CHILDREN,
    },
    { to: "/dashboard/cohorts", label: "My Classes & Cohorts", icon: Users },
    { to: "/dashboard/past-papers", label: "Past Papers", icon: Layers },
  ],
  STUDENT: [
    { to: "/", label: "Student Dashboard", icon: Home, end: true },
    { to: "/my-learning", label: "My Learning", icon: GraduationCap },
    { to: "/courses", label: "Course Catalog", icon: BookOpen },
    { to: "/verify", label: "Report Cards & Certs", icon: Award },
  ],
  PARENT: [
    { to: "/", label: "Parent Dashboard", icon: Home, end: true },
    { to: "/verify", label: "Report Cards", icon: Award },
  ],
  BURSAR: [
    { to: "/", label: "Finance Dashboard", icon: Wallet, end: true },
    {
      to: "/onboarding",
      label: "Staff Roster",
      icon: Users,
      children: ONBOARDING_CHILDREN,
    },
  ],
  HR_PAYROLL: [
    { to: "/", label: "HR & Payroll", icon: Briefcase, end: true },
    {
      to: "/onboarding",
      label: "Staff & HR",
      icon: UserPlus,
      children: ONBOARDING_CHILDREN,
    },
  ],
  CANTEEN: [
    { to: "/", label: "Canteen POS & Wallets", icon: UtensilsCrossed, end: true },
  ],
  HOUSEMASTER: [
    { to: "/", label: "Boarding & Dorms", icon: BedDouble, end: true },
  ],
  NURSE: [
    { to: "/", label: "Sickbay Dashboard", icon: HeartPulse, end: true },
  ],
  GUARD: [
    { to: "/", label: "Security & Gate Pass", icon: Shield, end: true },
  ],
  LIBRARIAN: [
    { to: "/", label: "Library Desk", icon: Library, end: true },
    { to: "/courses", label: "E-Library", icon: BookOpen },
  ],
  PROCUREMENT: [
    { to: "/", label: "Store & Procurement", icon: Package, end: true },
  ],
  TRANSPORT: [
    { to: "/", label: "Transport & Fleet", icon: Bus, end: true },
  ],
  GAMES: [
    { to: "/", label: "Sports & Clubs", icon: Trophy, end: true },
  ],
};

const ROLE_OPTIONS = [
  { value: "PRINCIPAL", label: "Principal / Admin" },
  { value: "DOS", label: "Director of Studies (DOS)" },
  { value: "ADMISSIONS", label: "Admissions Officer" },
  { value: "TEACHER", label: "Teacher / Instructor" },
  { value: "STUDENT", label: "Student / Learner" },
  { value: "PARENT", label: "Parent / Guardian" },
  { value: "BURSAR", label: "Bursar / Finance" },
  { value: "HR_PAYROLL", label: "HR & Payroll Officer" },
  { value: "CANTEEN", label: "Canteen Manager / POS" },
  { value: "HOUSEMASTER", label: "Housemaster / Matron" },
  { value: "NURSE", label: "Nurse / Sickbay" },
  { value: "GUARD", label: "Security / Gate Pass" },
  { value: "LIBRARIAN", label: "Librarian" },
  { value: "PROCUREMENT", label: "Storekeeper / Procurement" },
  { value: "TRANSPORT", label: "Transport / Fleet" },
  { value: "GAMES", label: "Games Master / Clubs" },
];

export default function PortalLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [openGroups, setOpenGroups] = useState({});
  const contentColRef = useRef(null);
  const { appMode, user, tenant, effectiveRole, setPreviewRole, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (contentColRef.current) {
      contentColRef.current.scrollTop = 0;
    }
  }, [location.pathname]);

  const isTenant = appMode === "tenant";

  useEffect(() => {
    applyTenantBranding(appMode, tenant);
  }, [appMode, tenant]);

  const SUBJECT_TIERS = new Set(["NURSERY", "PRIMARY", "SECONDARY", "COMPREHENSIVE_K12"]);
  const isSubjectTier = SUBJECT_TIERS.has(tenant?.tier);

  const rawNavItems = isTenant
    ? TENANT_NAV_BY_ROLE[effectiveRole] || TENANT_NAV_BY_ROLE.PRINCIPAL
    : LANDLORD_NAV;

  const navItems = isTenant && isSubjectTier
    ? rawNavItems.map((item) => ({
        ...item,
        label: item.label
          .replace(/\bCourse Templates\b/g, "Subject Templates")
          .replace(/\bCourse Catalog\b/g, "Subject Catalog")
          .replace(/\bCourses\b/g, "Subjects"),
      }))
    : rawNavItems;

  // Automatically expand any parent nav group whose child matches the current URL
  useEffect(() => {
    const next = {};
    navItems.forEach((item) => {
      if (item.children?.length) {
        const matches =
          location.pathname === item.to ||
          location.pathname.startsWith(`${item.to}/`) ||
          item.children.some((c) => location.pathname === c.to);
        if (matches) next[item.to] = true;
      }
    });
    setOpenGroups((prev) => ({ ...prev, ...next }));
  }, [location.pathname, effectiveRole, appMode]);

  const portalLabel = isTenant ? "School Portal" : "Isoma ERP";
  const orgName = isTenant
    ? tenant?.name || "SCHOOL WORKSPACE"
    : "ISOMA EDUTECH LIMITED";
  const orgInitials = isTenant ? tenant?.initials || "SC" : "IE";
  const phone = user?.phone || tenant?.phone || "+256778261026";
  const email = user?.email || tenant?.email || "isomaug@gmail.com";

  function handleSignOut() {
    if (user) {
      logout();
      customToast.info("Signed out.");
      navigate("/login");
    } else {
      navigate("/login");
    }
  }

  function handleBack() {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }
    const parts = location.pathname.split("/").filter(Boolean);
    if (parts.length > 1) {
      navigate(`/${parts[0]}`);
    } else {
      navigate("/");
    }
  }

  const showBackButton = location.pathname !== "/";

  return (
    <div className="font-montserrat text-dark bg-neutral-light">
      <div className="flex h-dvh overflow-hidden bg-gray-50">
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <aside
          className={`fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-100 shadow-sm z-50 flex flex-col transition-transform duration-300 lg:translate-x-0 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {/* Brand Top Bar (56px) */}
          <div className="flex items-center justify-between px-4 h-14 border-b border-gray-100 shrink-0">
            <div className="flex items-center gap-2.5 min-w-0">
              {isTenant ? (
                tenant?.logo_url ? (
                  <img
                    src={tenant.logo_url}
                    alt={orgName}
                    className="h-9 w-9 object-contain shrink-0 rounded-lg"
                  />
                ) : (
                  <div className="h-9 w-9 rounded-lg bg-primary text-white font-bold text-xs flex items-center justify-center shrink-0">
                    {orgInitials}
                  </div>
                )
              ) : (
                <img
                  src={isomaMark}
                  alt="Isoma Logo"
                  className="h-9 w-9 object-contain shrink-0"
                />
              )}
              <span className="text-sm font-semibold text-gray-800 leading-tight truncate">
                {portalLabel}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden flex items-center justify-center w-9 h-9 rounded-lg text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-colors shrink-0"
              aria-label="Close menu"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Organisation / School Identity Block */}
          <div className="px-3 py-3 bg-primary/5 border-b border-gray-100">
            <div className="flex w-full flex-col items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shrink-0 shadow-sm">
                <span className="text-white font-bold text-xs">{orgInitials}</span>
              </div>
              <div className="w-full min-w-0">
                <p className="w-full text-center text-xs font-semibold text-gray-800 truncate leading-tight">
                  {orgName}
                </p>
              </div>
            </div>
          </div>

          {/* Contact Block */}
          <div className="px-3 py-3 border-b border-gray-100 w-full bg-primary/5 text-center">
            <p className="text-sm font-semibold text-secondary truncate">{phone}</p>
            <p className="text-[11px] text-secondary truncate">{email}</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 px-2">
              Menu
            </p>
            {navItems.map((item) => {
              const Icon = item.icon;
              if (item.children?.length) {
                const isGroupActive =
                  location.pathname === item.to ||
                  location.pathname.startsWith(`${item.to}/`) ||
                  item.children.some((c) => location.pathname === c.to);
                const isExpanded = !!openGroups[item.to];
                return (
                  <div key={item.to} className="space-y-0.5">
                    <button
                      type="button"
                      onClick={() => {
                        setOpenGroups((prev) => ({ ...prev, [item.to]: !prev[item.to] }));
                        if (!isGroupActive) {
                          navigate(item.to);
                        }
                      }}
                      className={`flex items-center w-full gap-2.5 px-3 py-2 text-xs rounded-lg font-medium transition-all ${
                        isGroupActive
                          ? "bg-primary/10 text-primary border border-primary/20"
                          : "text-gray-600 hover:bg-gray-50 hover:text-primary border border-transparent"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{item.label}</span>
                      <ChevronDown
                        className={`w-3.5 h-3.5 ml-auto shrink-0 transition-transform duration-200 ${
                          isExpanded ? "rotate-180 text-primary" : "text-gray-400"
                        }`}
                      />
                    </button>

                    {isExpanded && (
                      <div className="subnav-enter ml-4 pl-2.5 border-l border-gray-200 space-y-0.5 py-0.5">
                        {item.children.map((child) => (
                          <NavLink
                            key={child.to}
                            to={child.to}
                            end={child.end}
                            onClick={() => setSidebarOpen(false)}
                            className={({ isActive }) =>
                              `flex items-center w-full gap-2 px-2.5 py-1.5 text-[11px] rounded-md font-medium transition-all ${
                                isActive
                                  ? "bg-primary text-white font-semibold shadow-xs"
                                  : "text-gray-600 hover:bg-gray-50 hover:text-primary"
                              }`
                            }
                          >
                            <span className="truncate">{child.label}</span>
                          </NavLink>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center w-full gap-2.5 px-3 py-2 text-xs rounded-lg font-medium transition-all ${
                      isActive
                        ? "bg-primary/10 text-primary border border-primary/20"
                        : "text-gray-600 hover:bg-gray-50 hover:text-primary border border-transparent"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon className="w-3.5 h-3.5 shrink-0" />
                      <span>{item.label}</span>
                      {isActive && (
                        <ChevronRight className="w-3 h-3 ml-auto text-primary/60" />
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>

          {/* Support Block */}
          <div className="px-3 py-3 border-t border-gray-100">
            <button
              type="button"
              onClick={() =>
                customToast.info("Support: support@isomaug.com · +256778261026")
              }
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-gray-600 hover:bg-primary/10 hover:text-primary rounded-lg transition font-medium"
            >
              <LifeBuoy className="w-3.5 h-3.5 shrink-0" />
              <span>Support</span>
            </button>
          </div>

          {/* Sign Out / Sign In Block */}
          <div className="px-3 py-3 border-t border-gray-100">
            <button
              type="button"
              onClick={handleSignOut}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-gray-500 hover:bg-red-50 hover:text-red-500 rounded-lg transition font-medium"
            >
              {user ? (
                <>
                  <LogOut className="w-3.5 h-3.5 shrink-0 text-primary" />
                  <span className="text-primary font-semibold">Sign Out</span>
                </>
              ) : (
                <>
                  <LogIn className="w-3.5 h-3.5 shrink-0 text-primary" />
                  <span className="text-primary font-semibold">Sign In</span>
                </>
              )}
            </button>
          </div>
        </aside>

        {/* Main Content Column */}
        <div
          ref={contentColRef}
          className="portal-content-col flex flex-col flex-1 lg:ml-64 min-h-0 overflow-y-auto overscroll-y-contain"
        >
          <header className="bg-white border-b border-gray-200 sticky top-0 z-30 h-14 shrink-0 lg:h-auto">
            <div className="flex items-center justify-between h-full px-3 sm:px-4 lg:px-6 gap-2 sm:gap-3">
              <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden flex items-center justify-center w-9 h-9 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                  aria-label="Open navigation menu"
                >
                  <Menu className="w-5 h-5" />
                </button>

                {showBackButton && (
                  <button
                    type="button"
                    onClick={handleBack}
                    className="inline-flex items-center gap-1.5 h-9 px-2.5 sm:px-3 rounded-lg border border-gray-200 bg-white text-xs font-semibold text-gray-700 hover:border-primary hover:text-primary hover:bg-primary/5 active:scale-[0.98] transition-all shrink-0"
                    aria-label="Go back"
                  >
                    <ArrowLeft className="w-3.5 h-3.5 shrink-0" />
                    <span className="watch-hide">Back</span>
                  </button>
                )}
              </div>

              <div className="flex items-center justify-end flex-1 h-14 gap-2 sm:gap-3 min-w-0">
                {isTenant && (
                  <div className="flex items-center gap-2 text-xs min-w-0">
                    <span className="hidden md:inline text-gray-400 shrink-0">
                      Portal Role:
                    </span>
                    <div className="w-36 sm:w-48 max-w-[55vw]">
                      <UniversalSelect
                        value={effectiveRole}
                        onChange={(val) => {
                          setPreviewRole(val);
                          navigate("/");
                        }}
                        options={ROLE_OPTIONS}
                        searchPlaceholder="Search roles..."
                        align="end"
                      />
                    </div>
                  </div>
                )}

                <div className="watch-hide shrink-0">
                  <ThemeSwitcher />
                </div>
              </div>
            </div>
          </header>

          <main className="flex-1 flex flex-col min-h-0">
            <div className="flex-1 flex flex-col bg-gray-50 p-3 sm:p-4 pb-0 sm:pb-0 safe-area-main">
              <div className="flex-1 flex flex-col w-full mx-auto space-y-3 sm:space-y-4">
                <div className="flex-1 flex flex-col p-1 pb-0">
                  <div
                    key={`${location.pathname}-${effectiveRole}`}
                    className="page-enter flex-1 flex flex-col"
                  >
                    <Outlet />
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
