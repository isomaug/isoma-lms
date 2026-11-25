import React from "react";
import { Building2, Globe, ShieldCheck, BookCheck } from "lucide-react";

const MODULES = [
  { title: "Curriculum Definition Engine", desc: "UNEB/NCDC, Cambridge, ACE PACEs, IB, Montessori, and Custom Curricula." },
  { title: "Admissions & Student Registry", desc: "Online applications, auto registration numbers, and QR admission letters." },
  { title: "Report Cards & Assessments", desc: "Nursery milestones, Primary/Secondary exams, and 1-click bulk PDF delivery." },
  { title: "Fees, MoMo & Payroll", desc: "MTN MoMo / Airtel Money reconciliation, biometric attendance, and payslips." },
];

export default function SchoolPortal() {
  return (
    <div className="relative bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-primary/60 to-primary" />
      <div className="px-6 pt-8 pb-6 md:px-10 border-b border-gray-100">
        <p className="text-[10px] font-bold text-primary uppercase tracking-widest">
          *.isomaug.com &amp; Custom School Domains
        </p>
        <h1 className="text-lg md:text-2xl font-bold text-gray-900 tracking-tight mt-1">
          Institutional School ERP &amp; LMS
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Multi-tenant workspace foundation ready for Nursery, Primary, Secondary, and Higher Education tiers.
        </p>
      </div>

      <div className="p-5 md:p-10 grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-5">
        {MODULES.map((mod, idx) => {
          const Icon = [BookCheck, Building2, ShieldCheck, Globe][idx % 4];
          return (
            <div
              key={mod.title}
              className="group rounded-xl border border-gray-200 bg-white/70 p-5 md:p-6 transition-all duration-300 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5"
            >
              <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4 transition-colors duration-300 group-hover:bg-primary group-hover:text-white">
                <Icon className="w-5 h-5" />
              </div>
              <h2 className="text-base font-semibold text-gray-900 mb-1.5">
                {mod.title}
              </h2>
              <p className="text-sm text-gray-500 leading-relaxed">{mod.desc}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
