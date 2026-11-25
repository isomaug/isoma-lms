import React, { useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer, User as UserIcon } from "lucide-react";
import { useReactToPrint } from 'react-to-print';
import { getMediaUrl } from "@/config";

export function NameTagsPrintPreview({
  open,
  onOpenChange,
  users = [],
  onlyVerified = false,
  defaultCohortName,
  defaultOrgName,
  defaultOrgLogo,
  cohort,
}) {
  const componentRef = useRef(null);
  
  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: 'Name_Tags',
    removeAfterPrint: true,
  });

  const getCohortObj = (user) => {
    if (cohort) return cohort;
    if (user?.cohorts && user.cohorts.length > 0) return user.cohorts[0];
    return null;
  };

  const getCohortName = (user) => {
    if (defaultCohortName) return defaultCohortName;
    const c = getCohortObj(user);
    return c?.name || 'Class Session';
  };

  const getClassAndYear = (user) => {
    const c = getCohortObj(user);
    const parts = [];

    // Class part: Grade & Stream
    const classParts = [];
    if (c?.grade) classParts.push(`Grade ${c.grade}`);
    if (c?.stream) classParts.push(`Stream ${c.stream}`);

    // Fallback: If no explicit grade/stream fields, try extracting from cohort name
    if (classParts.length === 0 && c?.name) {
      const match = c.name.match(/Grade\s*[\d\w]+(\s*-\s*Stream\s*[\d\w]+)?/i);
      if (match) classParts.push(match[0]);
    }

    if (classParts.length > 0) {
      parts.push(`Class: ${classParts.join(' - ')}`);
    } else {
      parts.push(`Class: General`);
    }

    // Year part: academic_year or year_of_course
    const yearParts = [];
    if (c?.academic_year) yearParts.push(String(c.academic_year));
    if (c?.year_of_course && !String(c.academic_year || '').includes(String(c.year_of_course))) {
      yearParts.push(String(c.year_of_course));
    }

    // Fallback: extract year pattern from cohort name
    if (yearParts.length === 0 && c?.name) {
      const yearMatch = c.name.match(/\b(20\d\d(\/20\d\d)?)\b/);
      if (yearMatch) yearParts.push(yearMatch[0]);
    }

    if (yearParts.length > 0) {
      parts.push(`Year: ${yearParts.join(' · ')}`);
    }

    return parts.join(' · ');
  };

  const getOrgName = (user) => {
    if (defaultOrgName) return defaultOrgName;
    const c = getCohortObj(user);
    if (!c) return 'ISOMA';
    const org = typeof c.organization === "object" ? c.organization?.name : c.organization;
    return org || 'ISOMA';
  };

  const getOrgLogo = (user) => {
    const c = getCohortObj(user);
    const rawLogo =
      defaultOrgLogo ||
      user?.organization_logo ||
      (typeof user?.organization === "object" ? user?.organization?.logo : null) ||
      (c?.organization && typeof c.organization === "object"
        ? c.organization.logo
        : null);
    if (!rawLogo) return null;
    return getMediaUrl(rawLogo);
  };

  const getProfilePic = (user) => {
    if (user.profile_picture || user.avatar) {
      return getMediaUrl(user.profile_picture || user.avatar);
    }
    const seed = user.first_name || (user.username && !user.username.includes('@') ? user.username : 'Student');
    return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(seed)}&backgroundColor=e2e8f0&textColor=475569`;
  };

  const getStudentName = (user) => {
    // Combine first, middle, last name from database
    const parts = [user.first_name, user.middle_name, user.last_name]
      .map((p) => String(p || "").trim())
      .filter(Boolean);
    if (parts.length > 0) {
      return parts.join(" ");
    }
    if (user.full_name && !user.full_name.includes("@")) {
      return user.full_name.trim();
    }
    if (user.username && !user.username.includes("@")) {
      return user.username.trim();
    }
    return "Student";
  };

  const getSchoolInitials = (user) => {
    const orgName = getOrgName(user);
    if (!orgName || orgName === 'ISOMA') {
      const c = getCohortObj(user);
      if (c?.name && !c.name.includes('Class Session')) {
        const clean = c.name
          .replace(/\b(Grade|Stream|Stage|Term|Year|Batch|Holiday|\d+)\b/gi, '')
          .replace(/[^\w\s-]/g, '')
          .trim();
        const words = clean.split(/[\s-]+/).filter((w) => w.length > 0 && /^[a-zA-Z]/.test(w));
        if (words.length >= 2) {
          return words.map((w) => w[0].toUpperCase()).join('');
        }
      }
      return 'ISOMA';
    }
    const clean = orgName.replace(/[^\w\s-]/g, '').trim();
    const words = clean.split(/[\s-]+/).filter((w) => w.length > 0);
    if (words.length === 1) {
      return words[0].slice(0, 5).toUpperCase();
    }
    return words.map((w) => w[0].toUpperCase()).join('');
  };

  const getStudentNumber = (user, index = 0) => {
    if (user?.student_number) return String(user.student_number).toUpperCase();
    if (user?.student_id && typeof user.student_id === 'string' && /[A-Z]+\d+/i.test(user.student_id)) {
      return user.student_id.toUpperCase();
    }
    const initials = getSchoolInitials(user);
    if (user?.username) {
      const cleanUname = user.username.trim().toUpperCase();
      if (cleanUname.startsWith(initials)) {
        const numPart = cleanUname.replace(initials, '').replace(/^[-_]/, '');
        if (/^\d+$/.test(numPart)) return `${initials}${numPart.padStart(3, '0')}`;
      }
      const numMatch = cleanUname.match(/\d+$/);
      if (numMatch) return `${initials}${numMatch[0].padStart(3, '0')}`;
    }
    if (user?.email) {
      const prefix = user.email.split('@')[0];
      const emailNumMatch = prefix.match(/\d+$/);
      if (emailNumMatch) return `${initials}${emailNumMatch[0].padStart(3, '0')}`;
    }
    const seq = typeof index === 'number' ? index + 1 : (user?.id || 1);
    return `${initials}${String(seq).padStart(3, '0')}`;
  };

  const getEmailFontSize = (email = '') => {
    const len = (email || '').length;
    if (len <= 20) return 'text-[11px] tracking-tight';
    if (len <= 25) return 'text-[10px] tracking-tight';
    if (len <= 30) return 'text-[9px] tracking-tight';
    if (len <= 36) return 'text-[8px] tracking-tighter';
    return 'text-[7.5px] tracking-tighter';
  };

  // Filter to verified accounts if requested
  const targetUsers = onlyVerified
    ? (users || []).filter((u) => Boolean(u.is_verified))
    : (users || []);

  // Chunk users into pages of 8 (2 columns x 4 rows)
  const pages = [];
  for (let i = 0; i < targetUsers.length; i += 8) {
    pages.push(targetUsers.slice(i, i + 8));
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-[230mm] max-h-[90vh] overflow-y-auto sm:rounded-2xl p-2 sm:p-6">
        <DialogHeader className="flex flex-row items-center justify-between border-b pb-4">
          <div>
            <DialogTitle>Print Name Tags ({targetUsers.length} verified accounts)</DialogTitle>
            <DialogDescription className="sr-only">Print preview for Name Tags</DialogDescription>
          </div>
          <div className="flex gap-2 pr-8">
            <Button
              size="sm"
              onClick={() => handlePrint()}
              disabled={targetUsers.length === 0}
              className="gap-2"
            >
              <Printer className="w-4 h-4" /> Print Tags
            </Button>
          </div>
        </DialogHeader>

        {targetUsers.length === 0 ? (
          <div className="p-12 text-center text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200 my-4">
            <UserIcon className="w-12 h-12 mx-auto mb-3 opacity-30 text-slate-400" />
            <p className="font-semibold text-slate-800 text-base">No verified student accounts found</p>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Only verified student accounts are printed on name tags. Please verify students before printing.
            </p>
          </div>
        ) : (
          /* Printable Area - Isolated by react-to-print */
          <div className="bg-slate-100/50 text-black w-full max-w-full overflow-hidden flex justify-center rounded-md border p-2 sm:p-4">
            <div className="mobile-print-preview mx-auto w-[210mm] bg-white shadow-sm print:shadow-none print:!w-auto">
              <div ref={componentRef} className="w-full bg-white print-container overflow-hidden" style={{ fontFamily: '"Inter", sans-serif' }}>
                <style dangerouslySetInnerHTML={{__html: `
                  .mobile-print-preview { zoom: 0.35; }
                  @media (min-width: 480px) { .mobile-print-preview { zoom: 0.6; } }
                  @media (min-width: 640px) { .mobile-print-preview { zoom: 0.8; } }
                  @media (min-width: 768px) { .mobile-print-preview { zoom: 1; } }
                  
                  @media print {
                    .mobile-print-preview { zoom: 1 !important; width: 100% !important; margin: 0 !important; }
                    @page { size: A4 portrait; margin: 20mm 6mm 6mm 6mm; }
                    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; background: white; }
                    .name-tag-page { break-after: page; padding: 0 !important; }
                    .name-tag-page:last-child { break-after: auto; }
                  }
                `}} />
              
              {pages.map((pageUsers, pageIndex) => (
                <div key={pageIndex} className="name-tag-page grid grid-cols-[85.6mm_85.6mm] gap-x-[15mm] gap-y-[10mm] justify-center content-start pt-[12mm] h-[265mm] mx-auto w-[186.2mm] relative">
                  {pageUsers.map((user, i) => {
                    const globalIndex = pageIndex * 8 + i;
                    const studentName = getStudentName(user);
                    const orgLogo = getOrgLogo(user);
                    const orgName = getOrgName(user);
                    const cohortName = getCohortName(user);
                    const classAndYear = getClassAndYear(user);
                    const studentNumber = getStudentNumber(user, globalIndex);

                    return (
                      <div key={user.id || i} className="border-[1.5px] border-slate-900 rounded-lg p-[3mm] flex flex-col justify-between h-[54mm] w-[85.6mm] relative overflow-hidden bg-white shadow-sm print:shadow-none box-border">
                        
                        {/* Header: Above top line has Organization Logo and Name */}
                        <div className="shrink-0">
                          <div className="flex justify-between items-center h-[5.5mm] mb-1">
                            <div className="flex items-center gap-1.5 min-w-0 flex-1">
                              {orgLogo ? (
                                <img
                                  src={orgLogo}
                                  alt={orgName}
                                  className="h-[5mm] max-w-[26mm] object-contain shrink-0"
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                  }}
                                />
                              ) : null}
                              <span className="text-[9px] font-black text-slate-800 tracking-wider uppercase truncate" title={orgName}>
                                {orgName}
                              </span>
                            </div>
                            <div className="shrink-0 text-[8px] font-black font-mono text-slate-900 uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 border border-slate-300 shadow-xs" title={`Student ID: ${studentNumber}`}>
                              {studentNumber}
                            </div>
                          </div>

                          {/* Top separator line */}
                          <div className="border-b-[1.5px] border-slate-300 w-full mb-1"></div>

                          {/* Below top line: Cohort Name */}
                          <div className="truncate text-[9.5px] font-black text-slate-900 leading-tight" title={cohortName}>
                            {cohortName}
                          </div>

                          {/* Below that: Class and Year fetched from cohort */}
                          <div className="truncate text-[8px] font-bold text-slate-600 leading-tight mt-0.5" title={classAndYear}>
                            {classAndYear}
                          </div>
                        </div>
                        
                        {/* Body: Avatar and Details */}
                        <div className="flex gap-2.5 items-center flex-1 min-h-0 overflow-hidden my-1">
                          <div className="w-[14mm] h-[14mm] rounded-full border-[1.5px] border-slate-900 overflow-hidden shrink-0 bg-slate-100 flex items-center justify-center p-0.5">
                             <img 
                                src={getProfilePic(user)} 
                                alt={studentName} 
                                className="w-full h-full object-cover rounded-full" 
                                onError={(e) => {
                                  e.target.src = 'https://api.dicebear.com/7.x/initials/svg?seed=U';
                                }} 
                              />
                          </div>
                          <div className="flex-1 min-w-0 flex flex-col justify-center overflow-hidden">
                            <div className="truncate text-[10.5px] leading-tight text-slate-900" title={`Name: ${studentName}`}>
                              <span className="font-bold text-slate-700">Name: </span>
                              <span className="font-black text-slate-950">{studentName}</span>
                            </div>
                            
                            <div className="truncate text-[8px] font-mono leading-tight text-slate-700 mt-0.5" title={`ID: ${studentNumber}`}>
                              <span className="font-bold uppercase tracking-wider text-slate-600">ID: </span>
                              <span className="font-black text-slate-950 font-mono">{studentNumber}</span>
                            </div>

                            {/* Email: Shifted below EMAIL: label, bold & visible, modern font, never wrapping and never cutting anything out */}
                            <div className="min-w-0 mt-0.5" title={`Email: ${user.email || ""}`}>
                              <span className="block font-bold text-slate-700 text-[8px] uppercase tracking-wider leading-none">
                                Email:
                              </span>
                              <div className="mt-0.5 min-w-0">
                                <span className={`font-black ${getEmailFontSize(user.email)} text-slate-950 font-mono whitespace-nowrap block leading-tight underline decoration-slate-400 decoration-1 underline-offset-2`}>
                                  {user.email || "No email provided"}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Footer: Password box - bottom line on top of password section removed, only dashed write-in line remains */}
                        <div className="mt-auto shrink-0 pb-0.5">
                          <div className="flex items-end gap-1.5">
                            <span className="text-[8.5px] font-black text-slate-900 uppercase tracking-wider shrink-0">Password:</span>
                            <div className="flex-1 border-b-[1.5px] border-slate-800 border-dashed h-2.5"></div>
                          </div>
                        </div>
                        
                      </div>
                    );
                  })}
                  
                  {/* Page number */}
                  <div className="absolute bottom-0 left-0 right-0 text-center text-[10px] text-slate-400">
                    Page {pageIndex + 1} of {pages.length}
                  </div>
                </div>
              ))}
              
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
