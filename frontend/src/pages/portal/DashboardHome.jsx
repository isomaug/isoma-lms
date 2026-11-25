import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  Building2,
  ArrowRight,
  Lock,
  Users,
  Layers,
  Globe,
} from "lucide-react";
import SolidStatCards from "../../components/SolidStatCards";
import isomaMark from "../../assets/brand/isoma-mark.png";

export default function DashboardHome() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState({
    public_courses: 4,
    curriculum_frameworks: 6,
    erp_modules_planned: 18,
  });
  const [schoolsCount, setSchoolsCount] = useState(2);
  const [usersCount, setUsersCount] = useState(0);
  const [domainsCount, setDomainsCount] = useState(2);

  useEffect(() => {
    fetch("/api/academy/summary/")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setSummary(data);
      })
      .catch(() => {});

    fetch("/api/tenant/institutions/")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          setSchoolsCount(data.count || (data.results || []).length);
          setDomainsCount((data.results || []).length);
        }
      })
      .catch(() => {});

    fetch("/api/tenant/users/")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setUsersCount(data.count || (data.results || []).length);
      })
      .catch(() => {});
  }, []);

  const landlordStats = [
    {
      label: "Registered Schools",
      value: schoolsCount,
      sub: "Manage tenants & curricula",
      icon: Building2,
      to: "/schools",
    },
    {
      label: "Platform Users",
      value: usersCount,
      sub: "Staff, students & admins",
      icon: Users,
      to: "/users",
    },
    {
      label: "Course Templates",
      value: summary.public_courses,
      sub: "Open Academy & syllabi",
      icon: BookOpen,
      href: "http://127.0.0.1:5177/courses?tenant=learn",
    },
    {
      label: "Active Domains",
      value: domainsCount,
      sub: "Subdomains & custom TLS",
      icon: Globe,
      to: "/domains",
    },
  ];

  return (
    <div className="w-full flex-1 flex flex-col">
      <div className="relative flex-1 flex flex-col bg-white rounded-t-2xl rounded-b-none shadow-sm border border-b-0 border-gray-100 overflow-hidden">
        {/* Top 4px Isoma Royal Blue gradient accent strip */}
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-primary/60 to-primary" />

        {/* Hero Header */}
        <div className="relative px-6 pt-8 pb-6 md:pt-10 md:pb-8 text-center compact-xs-pad">
          <div className="inline-flex items-center justify-center gap-3 h-16 md:h-20 mb-4 bg-white rounded-2xl shadow-sm border border-gray-100 px-5 py-2.5">
            <img
              src={isomaMark}
              alt="Isoma Logo"
              className="h-11 w-11 md:h-13 md:w-13 object-contain"
            />
            <span className="text-xl md:text-2xl font-bold text-primary tracking-tight">
              Isoma
            </span>
          </div>

          <h1 className="text-lg md:text-2xl font-bold text-gray-900 tracking-tight px-2">
            Isoma Learning &amp; School Portal
          </h1>
          <p className="text-gray-500 mt-1.5 text-sm md:text-base">
            Open Academy &amp; Institutional ERP Workspace
          </p>

          <div className="mx-auto mt-6 h-px w-40 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
        </div>

        {/* Solid KPI Counters */}
        <div className="relative px-5 pb-5 md:px-10">
          <SolidStatCards items={landlordStats} />
        </div>

        {/* Action Cards Area */}
        <div className="relative flex-1 flex flex-col px-5 pb-6 md:px-10 md:pb-8">
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-5">
            {/* Card 1: Public Open Academy */}
            <div className="group relative h-full rounded-xl border border-gray-200 bg-white p-5 md:p-6 flex flex-col overflow-hidden transition-all duration-300 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5">
              <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-primary via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              <div className="relative flex items-center justify-between mb-4">
                <div className="w-11 h-11 rounded-xl border border-gray-200 bg-white flex items-center justify-center transition-colors duration-300 group-hover:bg-primary group-hover:border-primary">
                  <BookOpen className="w-5 h-5 text-primary transition-colors duration-300 group-hover:text-white" />
                </div>
                <span className="text-xs font-bold text-primary">
                  {summary.public_courses} Courses Live
                </span>
              </div>

              <h2 className="relative text-base font-semibold text-gray-900 mb-1.5">
                Public Open Academy
              </h2>
              <p className="relative text-sm text-gray-500 leading-relaxed flex-1">
                Self-paced courses, AI &amp; Robotics programmes, Cambridge IT, and
                UNEB competency-based learning on learn.isomaug.com - open to
                individual learners with verified digital certificates.
              </p>

              <button
                type="button"
                onClick={() =>
                  window.open("http://127.0.0.1:5177/?tenant=learn", "_blank")
                }
                className="relative mt-5 w-full bg-primary text-white font-medium py-2.5 px-6 rounded-lg hover:bg-primary-hover transition-all text-sm active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 touch-manipulation inline-flex items-center justify-center gap-2"
              >
                Open learn.isomaug.com
                <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
              </button>
            </div>

            {/* Card 2: Institutional School ERP & LMS */}
            <div className="group relative h-full rounded-xl border border-gray-200 bg-white p-5 md:p-6 flex flex-col overflow-hidden transition-all duration-300 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5">
              <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-primary/50 to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              <div className="relative flex items-center justify-between mb-4">
                <div className="w-11 h-11 rounded-xl border border-gray-200 bg-white flex items-center justify-center transition-colors duration-300 group-hover:bg-primary group-hover:border-primary">
                  <Building2 className="w-5 h-5 text-primary transition-colors duration-300 group-hover:text-white" />
                </div>
                <span className="text-xs font-bold text-primary">
                  {summary.curriculum_frameworks} Curricula · {summary.erp_modules_planned} Modules
                </span>
              </div>

              <h2 className="relative text-base font-semibold text-gray-900 mb-1.5">
                Institutional School ERP &amp; LMS
              </h2>
              <p className="relative text-sm text-gray-500 leading-relaxed flex-1">
                Private tenant workspaces on dedicated subdomains or custom
                school domains - covering Nursery to Higher Ed, UNEB/Cambridge/ACE/IB
                report cards, biometrics, fees, and payroll.
              </p>

              <button
                type="button"
                onClick={() => navigate("/schools")}
                className="relative mt-5 w-full bg-primary text-white font-medium py-2.5 px-6 rounded-lg hover:bg-primary-hover transition-all text-sm active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 touch-manipulation inline-flex items-center justify-center gap-2"
              >
                Open School Workspace
                <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
              </button>
            </div>
          </div>

          {/* Bottom Divider + Help / Trust Row */}
          <div className="mx-auto mt-6 h-px w-full max-w-md bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
          <div className="mt-4 flex flex-col md:flex-row items-center justify-center gap-1.5 text-sm text-gray-400">
            <span>
              Need help? Email us at{" "}
              <a
                href="mailto:support@isomaug.com"
                className="text-primary font-medium hover:underline"
              >
                support@isomaug.com
              </a>
            </span>
            <span className="hidden md:inline text-gray-300">·</span>
            <span className="inline-flex items-center gap-1.5">
              <Lock className="w-3 h-3 text-primary/40" />
              Secure • Multi-Tenant • Isoma Edutech
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
