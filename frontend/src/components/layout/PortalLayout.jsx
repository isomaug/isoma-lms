import React, { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
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
  ChevronRight,
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
  { to: "/schools", label: "Schools", icon: Building2 },
  { to: "/categories", label: "Categories", icon: Layers },
  { to: "/users", label: "Users", icon: Users },
  { to: "/invoices", label: "Invoices", icon: Receipt },
  { to: "/domains", label: "Domains", icon: Globe },
  { to: "/settings", label: "Settings", icon: Settings },
];

const TENANT_NAV_BY_ROLE = {
  PRINCIPAL: [
    { to: "/", label: "Dashboard", icon: Home, end: true },
    { to: "/onboarding", label: "Onboarding & Staff", icon: UserPlus },
    { to: "/courses", label: "Course Templates", icon: BookOpen },
    { to: "/dashboard/courses", label: "Manage Courses", icon: Layers },
    { to: "/dashboard/cohorts", label: "Classes & Cohorts", icon: Users },
    { to: "/verify", label: "Report Cards & Certs", icon: Award },
  ],
  DOS: [
    { to: "/", label: "Academics & DOS", icon: FileSpreadsheet, end: true },
    { to: "/courses", label: "Curriculum Templates", icon: BookOpen },
    { to: "/dashboard/cohorts", label: "Streams & Timetables", icon: Users },
    { to: "/verify", label: "Report Cards", icon: Award },
  ],
  ADMISSIONS: [
    { to: "/", label: "Admissions Desk", icon: ClipboardCheck, end: true },
    { to: "/onboarding", label: "Registry & Accounts", icon: UserPlus },
  ],
  TEACHER: [
    { to: "/", label: "Teacher Dashboard", icon: Home, end: true },
    { to: "/courses", label: "Lesson Templates", icon: BookOpen },
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
    { to: "/onboarding", label: "Staff Roster", icon: Users },
  ],
  HR_PAYROLL: [
    { to: "/", label: "HR & Payroll", icon: Briefcase, end: true },
    { to: "/onboarding", label: "Staff Directory", icon: UserPlus },
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
  const { appMode, user, tenant, effectiveRole, setPreviewRole, logout } = useAuth();
  const navigate = useNavigate();

  const isTenant = appMode === "tenant";

  useEffect(() => {
    applyTenantBranding(appMode, tenant);
  }, [appMode, tenant]);
  const navItems = isTenant
    ? TENANT_NAV_BY_ROLE[effectiveRole] || TENANT_NAV_BY_ROLE.PRINCIPAL
    : LANDLORD_NAV;

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
        <div className="portal-content-col flex flex-col flex-1 lg:ml-64 min-h-0 overflow-y-auto overscroll-y-contain">
          <header className="bg-white border-b border-gray-200 sticky top-0 z-30 h-14 shrink-0 lg:h-auto">
            <div className="flex items-center justify-between h-full px-4 lg:px-6 gap-3">
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden flex items-center justify-center w-10 h-10 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                aria-label="Open navigation menu"
              >
                <Menu className="w-5 h-5" />
              </button>

              <div className="flex items-center justify-end w-full h-14 gap-3">
                {isTenant && (
                  <div className="flex items-center gap-2 text-xs">
                    <span className="hidden sm:inline text-gray-400 shrink-0">
                      Portal Role:
                    </span>
                    <div className="w-48">
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

                <ThemeSwitcher />
              </div>
            </div>
          </header>

          <main className="flex-1 flex flex-col min-h-0">
            <div className="flex-1 flex flex-col bg-gray-50 p-3 sm:p-4 pb-0 sm:pb-0 safe-area-main">
              <div className="flex-1 flex flex-col w-full mx-auto space-y-3 sm:space-y-4">
                <div className="flex-1 flex flex-col p-1 pb-0">
                  <Outlet />
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
