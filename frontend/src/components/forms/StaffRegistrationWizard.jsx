import React, { useMemo, useState } from "react";
import { Calendar, CheckCircle2 } from "lucide-react";
import { customToast, statusModal } from "../GlobalPopup";
import { UniversalSelect } from "../ui/UniversalSelect";
import RegistrationWizardShell, { calculateAgeInfo } from "./RegistrationWizardShell";

const STEPS = [
  { id: "bio", shortTitle: "Personal Info", title: "Staff Personal & Contact Details" },
  { id: "role", shortTitle: "Role & Curricula", title: "Portal Role, Curricula & Teaching Load" },
  { id: "hr", shortTitle: "HR & Payroll", title: "HR Stage, Qualifications & Payroll" },
  { id: "nok", shortTitle: "Next of Kin", title: "Next of Kin & Final Review" },
];

const DEPARTMENTS = [
  "Administration",
  "Sciences",
  "Mathematics & ICT",
  "Languages & Humanities",
  "Finance & Bursar",
  "Human Resources",
  "Boarding & Welfare",
  "Sickbay & Health",
  "Library",
  "Transport & Security",
  "Games & Co-Curricular",
];

export default function StaffRegistrationWizard({
  slug,
  roleOptions = [],
  selectedCurricula = [],
  classes = [],
  subjects = [],
  subjectPlural = "Subjects",
  onSuccess,
}) {
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    full_name: "",
    gender: "Male",
    date_of_birth: "",
    nationality: "Ugandan",
    national_id: "",
    email: "",
    phone: "",
    home_address: "",
    role: "TEACHER",
    department: "Sciences",
    assigned_curricula: selectedCurricula.length ? [selectedCurricula[0]] : [],
    assigned_class_ids: [],
    assigned_subject_ids: [],
    hr_stage: "ONBOARDED",
    contract_type: "FULL_TIME",
    qualification: "",
    years_experience: "2",
    salary_ugx: "1200000",
    bank_or_momo_account: "",
    next_of_kin_name: "",
    next_of_kin_phone: "",
  });

  const ageInfo = useMemo(() => calculateAgeInfo(form.date_of_birth), [form.date_of_birth]);

  function validateStep(idx) {
    if (idx === 0) {
      if (!form.full_name.trim() || !form.email.trim()) {
        customToast.error("Full name and email address are required.");
        return false;
      }
      if (form.date_of_birth && ageInfo?.invalid) {
        customToast.error("Date of Birth cannot be in the future.");
        return false;
      }
    }
    if (idx === 1 && (!form.assigned_curricula || form.assigned_curricula.length === 0)) {
      customToast.error("Assign at least one school curriculum.");
      return false;
    }
    return true;
  }

  function handleNext() {
    if (!validateStep(step)) return;
    setStep((s) => Math.min(STEPS.length - 1, s + 1));
  }

  function handlePrev() {
    setStep((s) => Math.max(0, s - 1));
  }

  function handleSaveDraft() {
    const key = `isoma_draft_staff_${slug}`;
    localStorage.setItem(key, JSON.stringify({ step, form }));
    statusModal.draft({
      title: "Staff Registration Saved as Draft",
      message: "You can resume onboarding this staff member later.",
      details: [
        `Staff Name: ${form.full_name || "Unnamed Staff"}`,
        `Role Portal: ${form.role} · Section ${step + 1} of ${STEPS.length}`,
      ],
      nextLabel: "Go to Staff Directory",
      nextRoute: "/onboarding",
      secondaryLabel: "Keep Editing",
    });
  }

  async function handleSubmit() {
    if (!validateStep(step)) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/tenant/institutions/${encodeURIComponent(slug)}/staff/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Could not register staff member.");
      localStorage.removeItem(`isoma_draft_staff_${slug}`);
      setStep(0);
      setForm((prev) => ({
        ...prev,
        full_name: "",
        email: "",
        phone: "",
        national_id: "",
        home_address: "",
        qualification: "",
        bank_or_momo_account: "",
        next_of_kin_name: "",
        next_of_kin_phone: "",
      }));
      if (onSuccess) onSuccess(data);
      statusModal.success({
        title: "Staff Member Registered",
        message: `${data.full_name} has been added to your school HR pipeline and portal directory.`,
        details: [
          `Role Portal: ${data.role_label}`,
          `Email: ${data.email} · Default Password: Isoma2026!`,
          `HR Stage: ${data.hr_stage_label || form.hr_stage}`,
        ],
        nextLabel: "Open Staff Directory",
        nextRoute: "/onboarding",
        secondaryLabel: "Register Another",
      });
    } catch (err) {
      statusModal.rejected({
        title: "Staff Registration Rejected",
        message: err.message || "Please verify the staff details and try again.",
        nextLabel: "Review & Fix",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <RegistrationWizardShell
      steps={STEPS}
      currentStep={step}
      onStepChange={setStep}
      onPrev={handlePrev}
      onNext={handleNext}
      onSaveDraft={handleSaveDraft}
      onSubmit={handleSubmit}
      submitting={submitting}
      submitLabel="Complete Staff Registration"
    >
      {step === 0 && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-700">Full Name *</label>
              <input
                type="text"
                required
                value={form.full_name}
                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                placeholder="e.g. Mr. Musa Lubega"
                className="w-full rounded-lg border border-gray-200 px-3 text-xs focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700">Email Address *</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="staff@school.ac.ug"
                className="w-full rounded-lg border border-gray-200 px-3 text-xs focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700">Phone Number *</label>
              <input
                type="text"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+256772..."
                className="w-full rounded-lg border border-gray-200 px-3 text-xs focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-700">Gender</label>
              <UniversalSelect
                value={form.gender}
                onChange={(val) => setForm({ ...form, gender: val })}
                options={[
                  { value: "Male", label: "Male" },
                  { value: "Female", label: "Female" },
                ]}
                searchable={false}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700">Date of Birth</label>
              <input
                type="date"
                value={form.date_of_birth}
                onChange={(e) => setForm({ ...form, date_of_birth: e.target.value })}
                className="w-full rounded-lg border border-gray-200 px-3 text-xs focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700">Calculated Age (Auto)</label>
              <div className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-xs font-bold text-primary inline-flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 shrink-0" />
                <span>{ageInfo ? ageInfo.label : "Select Date of Birth"}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-700">Nationality</label>
              <input
                type="text"
                value={form.nationality}
                onChange={(e) => setForm({ ...form, nationality: e.target.value })}
                className="w-full rounded-lg border border-gray-200 px-3 text-xs focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700">National ID (NIN)</label>
              <input
                type="text"
                value={form.national_id}
                onChange={(e) => setForm({ ...form, national_id: e.target.value })}
                placeholder="CM / CF..."
                className="w-full rounded-lg border border-gray-200 px-3 text-xs focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700">Home Address</label>
              <input
                type="text"
                value={form.home_address}
                onChange={(e) => setForm({ ...form, home_address: e.target.value })}
                placeholder="e.g. Entebbe / Wakiso"
                className="w-full rounded-lg border border-gray-200 px-3 text-xs focus:outline-none focus:border-primary"
              />
            </div>
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-700">Role Portal *</label>
              <UniversalSelect
                value={form.role}
                onChange={(val) => setForm({ ...form, role: val })}
                options={roleOptions}
                placeholder="Select role..."
                searchPlaceholder="Search roles..."
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700">Department</label>
              <UniversalSelect
                value={form.department}
                onChange={(val) => setForm({ ...form, department: val })}
                options={DEPARTMENTS.map((d) => ({ value: d, label: d }))}
                placeholder="Select department..."
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700">Assigned Curricula *</label>
              <UniversalSelect
                multiple
                minSelected={1}
                value={form.assigned_curricula}
                onChange={(vals) => setForm({ ...form, assigned_curricula: vals })}
                options={selectedCurricula.map((c) => ({ value: c, label: c.replace(/_/g, " ") }))}
                placeholder="Select curricula..."
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-700">Assigned Classes (Admin-created)</label>
              <UniversalSelect
                multiple
                value={form.assigned_class_ids}
                onChange={(vals) => setForm({ ...form, assigned_class_ids: vals })}
                options={classes.map((c) => ({
                  value: String(c.id),
                  label: `${c.name} (${c.curriculum_label})`,
                }))}
                placeholder="Assign classes..."
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700">Assigned {subjectPlural}</label>
              <UniversalSelect
                multiple
                value={form.assigned_subject_ids}
                onChange={(vals) => setForm({ ...form, assigned_subject_ids: vals })}
                options={subjects.map((s) => ({
                  value: String(s.id),
                  label: `${s.name} - ${s.class_stream_name}`,
                }))}
                placeholder={`Assign ${subjectPlural.toLowerCase()}...`}
              />
            </div>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-700">HR Pipeline Stage</label>
              <UniversalSelect
                value={form.hr_stage}
                onChange={(val) => setForm({ ...form, hr_stage: val })}
                options={[
                  { value: "APPLIED", label: "Applied" },
                  { value: "SHORTLISTED", label: "Shortlisted" },
                  { value: "INTERVIEWED", label: "Interviewed" },
                  { value: "OFFERED", label: "Offer Issued" },
                  { value: "ONBOARDED", label: "Onboarded" },
                  { value: "ACTIVE", label: "Active Staff" },
                ]}
                searchable={false}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700">Contract Type</label>
              <UniversalSelect
                value={form.contract_type}
                onChange={(val) => setForm({ ...form, contract_type: val })}
                options={[
                  { value: "FULL_TIME", label: "Full Time" },
                  { value: "PART_TIME", label: "Part Time" },
                  { value: "FIXED_TERM", label: "Fixed Term" },
                  { value: "PROBATION", label: "Probationary" },
                ]}
                searchable={false}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700">Years of Experience</label>
              <input
                type="number"
                min="0"
                max="50"
                value={form.years_experience}
                onChange={(e) => setForm({ ...form, years_experience: e.target.value })}
                className="w-full rounded-lg border border-gray-200 px-3 text-xs focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-700">Highest Qualification</label>
              <input
                type="text"
                value={form.qualification}
                onChange={(e) => setForm({ ...form, qualification: e.target.value })}
                placeholder="e.g. B.Sc. with Education"
                className="w-full rounded-lg border border-gray-200 px-3 text-xs focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700">Monthly Salary (UGX)</label>
              <input
                type="number"
                min="0"
                step="50000"
                value={form.salary_ugx}
                onChange={(e) => setForm({ ...form, salary_ugx: e.target.value })}
                className="w-full rounded-lg border border-gray-200 px-3 text-xs focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700">Bank / Mobile Money Account</label>
              <input
                type="text"
                value={form.bank_or_momo_account}
                onChange={(e) => setForm({ ...form, bank_or_momo_account: e.target.value })}
                placeholder="Stanbic / MTN MoMo No."
                className="w-full rounded-lg border border-gray-200 px-3 text-xs focus:outline-none focus:border-primary"
              />
            </div>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-700">Next of Kin Full Name</label>
              <input
                type="text"
                value={form.next_of_kin_name}
                onChange={(e) => setForm({ ...form, next_of_kin_name: e.target.value })}
                placeholder="e.g. Mrs. Sarah Lubega"
                className="w-full rounded-lg border border-gray-200 px-3 text-xs focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700">Next of Kin Phone</label>
              <input
                type="text"
                value={form.next_of_kin_phone}
                onChange={(e) => setForm({ ...form, next_of_kin_phone: e.target.value })}
                placeholder="+25677..."
                className="w-full rounded-lg border border-gray-200 px-3 text-xs focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 space-y-2 text-xs">
            <p className="font-bold text-primary inline-flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              Staff Onboarding Summary Review
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 pt-1 text-[11px] text-gray-700">
              <p><span className="font-semibold text-gray-900">Name:</span> {form.full_name} ({form.gender})</p>
              <p><span className="font-semibold text-gray-900">Age:</span> {ageInfo?.label || "-"}</p>
              <p><span className="font-semibold text-gray-900">Role:</span> {form.role} ({form.department})</p>
              <p><span className="font-semibold text-gray-900">Curricula:</span> {form.assigned_curricula.map((c) => c.replace(/_/g, " ")).join(", ")}</p>
              <p><span className="font-semibold text-gray-900">HR Stage:</span> {form.hr_stage} ({form.contract_type})</p>
              <p><span className="font-semibold text-gray-900">Monthly Salary:</span> UGX {Number(form.salary_ugx || 0).toLocaleString()}</p>
            </div>
          </div>
        </div>
      )}
    </RegistrationWizardShell>
  );
}
