import React, { useMemo, useState } from "react";
import { Calendar, CheckCircle2 } from "lucide-react";
import { customToast, statusModal } from "../GlobalPopup";
import { UniversalSelect } from "../ui/UniversalSelect";
import RegistrationWizardShell, { calculateAgeInfo } from "./RegistrationWizardShell";

const STEPS = [
  { id: "bio", shortTitle: "Personal Info", title: "Student Personal & Bio Information" },
  { id: "placement", shortTitle: "Class & Boarding", title: "Class Placement, Boarding & Transport" },
  { id: "guardian", shortTitle: "Parent & Emergency", title: "Parent / Guardian & Emergency Contact" },
  { id: "medical", shortTitle: "Medical & Review", title: "Medical Profile, Canteen & Final Review" },
];

const INITIAL_STUDENT = {
  full_name: "",
  gender: "Female",
  date_of_birth: "",
  nationality: "Ugandan",
  nin_or_lin: "",
  home_address: "",
  class_stream_id: "",
  boarding_status: "BOARDING",
  previous_school: "",
  house_name: "Nile House",
  dormitory_room: "",
  bed_number: "",
  bus_route: "",
  pickup_stop: "",
  parent_name: "",
  parent_relationship: "Parent / Guardian",
  parent_phone: "",
  parent_email: "",
  emergency_contact_name: "",
  emergency_contact_phone: "",
  blood_group: "O+",
  allergies: "None reported",
  canteen_daily_limit_ugx: "10000",
};

export default function StudentRegistrationWizard({ slug, classes = [], onSuccess }) {
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState(() => ({
    ...INITIAL_STUDENT,
    class_stream_id: classes[0] ? String(classes[0].id) : "",
  }));

  const ageInfo = useMemo(() => calculateAgeInfo(form.date_of_birth), [form.date_of_birth]);
  const selectedClass = classes.find((c) => String(c.id) === String(form.class_stream_id));

  function validateStep(idx) {
    if (idx === 0) {
      if (!form.full_name.trim()) {
        customToast.error("Please enter the student's full name.");
        return false;
      }
      if (!form.date_of_birth) {
        customToast.error("Please enter Date of Birth so age can be calculated.");
        return false;
      }
      if (ageInfo?.invalid) {
        customToast.error("Date of Birth cannot be in the future.");
        return false;
      }
    }
    if (idx === 1 && !form.class_stream_id && classes.length > 0) {
      customToast.error("Please select a class stream.");
      return false;
    }
    if (idx === 2) {
      if (!form.parent_name.trim() || !form.parent_phone.trim()) {
        customToast.error("Parent / Guardian name and phone number are required.");
        return false;
      }
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
    const key = `isoma_draft_student_${slug}`;
    localStorage.setItem(key, JSON.stringify({ step, form }));
    statusModal.draft({
      title: "Student Registration Saved as Draft",
      message: "You can return anytime to finish admitting this student.",
      details: [
        `Student: ${form.full_name || "Unnamed Student"}`,
        `Saved at Section ${step + 1} of ${STEPS.length} (${STEPS[step].shortTitle})`,
      ],
      nextLabel: "Go to Student Registry",
      nextRoute: "/admissions",
      secondaryLabel: "Keep Editing",
    });
  }

  async function handleSubmit() {
    if (!validateStep(step)) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/academics/students/?tenant=${encodeURIComponent(slug)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Could not admit student.");
      localStorage.removeItem(`isoma_draft_student_${slug}`);
      setForm({
        ...INITIAL_STUDENT,
        class_stream_id: classes[0] ? String(classes[0].id) : "",
      });
      setStep(0);
      if (onSuccess) onSuccess(data);
      statusModal.success({
        title: "Student Admitted Successfully",
        message: `${data.full_name} is now enrolled and linked across Academics, Library, Canteen, Medical, and Campus 360.`,
        details: [
          `Registration No: ${data.registration_number}`,
          `Class Stream: ${data.class_stream_name}`,
          `Parent / Contact: ${data.parent_name || "-"} (${data.parent_phone || "-"})`,
        ],
        nextLabel: "View Student Registry",
        nextRoute: "/admissions",
        secondaryLabel: "Admit Another",
      });
    } catch (err) {
      statusModal.rejected({
        title: "Student Admission Rejected",
        message: err.message || "Please verify the student details and try again.",
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
      submitLabel="Admit Student & Generate Reg. Number"
    >
      {step === 0 && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-700">Student Full Name *</label>
              <input
                type="text"
                required
                value={form.full_name}
                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                placeholder="e.g. Nakato Grace Namuli"
                className="w-full rounded-lg border border-gray-200 px-3 text-xs focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700">Gender *</label>
              <UniversalSelect
                value={form.gender}
                onChange={(val) => setForm({ ...form, gender: val })}
                options={[
                  { value: "Female", label: "Female" },
                  { value: "Male", label: "Male" },
                ]}
                searchable={false}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700">Nationality</label>
              <input
                type="text"
                value={form.nationality}
                onChange={(e) => setForm({ ...form, nationality: e.target.value })}
                placeholder="Ugandan"
                className="w-full rounded-lg border border-gray-200 px-3 text-xs focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-700">Date of Birth *</label>
              <input
                type="date"
                required
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
            <div>
              <label className="text-xs font-semibold text-gray-700">LIN / Birth Cert No.</label>
              <input
                type="text"
                value={form.nin_or_lin}
                onChange={(e) => setForm({ ...form, nin_or_lin: e.target.value })}
                placeholder="Optional Learner ID"
                className="w-full rounded-lg border border-gray-200 px-3 text-xs focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-700">Home Address / District</label>
            <input
              type="text"
              value={form.home_address}
              onChange={(e) => setForm({ ...form, home_address: e.target.value })}
              placeholder="e.g. Ntinda, Kampala"
              className="w-full rounded-lg border border-gray-200 px-3 text-xs focus:outline-none focus:border-primary"
            />
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-700">Class Stream *</label>
              <UniversalSelect
                value={form.class_stream_id}
                onChange={(val) => setForm({ ...form, class_stream_id: val })}
                options={classes.map((c) => ({
                  value: String(c.id),
                  label: `${c.name} (${c.curriculum_label})`,
                }))}
                placeholder="Select class stream..."
                searchPlaceholder="Search classes..."
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700">Boarding Status *</label>
              <UniversalSelect
                value={form.boarding_status}
                onChange={(val) => setForm({ ...form, boarding_status: val })}
                options={[
                  { value: "BOARDING", label: "Boarding Student" },
                  { value: "DAY", label: "Day Scholar" },
                ]}
                searchable={false}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700">Previous School</label>
              <input
                type="text"
                value={form.previous_school}
                onChange={(e) => setForm({ ...form, previous_school: e.target.value })}
                placeholder="e.g. Kampala Parents School"
                className="w-full rounded-lg border border-gray-200 px-3 text-xs focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          {form.boarding_status === "BOARDING" ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-gray-100">
              <div>
                <label className="text-xs font-semibold text-gray-700">Boarding House</label>
                <UniversalSelect
                  value={form.house_name}
                  onChange={(val) => setForm({ ...form, house_name: val })}
                  options={[
                    { value: "Nile House", label: "Nile House" },
                    { value: "Victoria House", label: "Victoria House" },
                    { value: "Rwenzori House", label: "Rwenzori House" },
                    { value: "Elgon House", label: "Elgon House" },
                  ]}
                  searchable={false}
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-700">Dormitory Room</label>
                <input
                  type="text"
                  value={form.dormitory_room}
                  onChange={(e) => setForm({ ...form, dormitory_room: e.target.value })}
                  placeholder="e.g. Wing 1 - Room 104"
                  className="w-full rounded-lg border border-gray-200 px-3 text-xs focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-700">Bed Number</label>
                <input
                  type="text"
                  value={form.bed_number}
                  onChange={(e) => setForm({ ...form, bed_number: e.target.value })}
                  placeholder="e.g. B-08"
                  className="w-full rounded-lg border border-gray-200 px-3 text-xs focus:outline-none focus:border-primary"
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-gray-100">
              <div>
                <label className="text-xs font-semibold text-gray-700">School Bus Route (Optional)</label>
                <input
                  type="text"
                  value={form.bus_route}
                  onChange={(e) => setForm({ ...form, bus_route: e.target.value })}
                  placeholder="e.g. Entebbe Highway Express"
                  className="w-full rounded-lg border border-gray-200 px-3 text-xs focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-700">Pickup Stage / Stop</label>
                <input
                  type="text"
                  value={form.pickup_stop}
                  onChange={(e) => setForm({ ...form, pickup_stop: e.target.value })}
                  placeholder="e.g. Kajjansi Stage"
                  className="w-full rounded-lg border border-gray-200 px-3 text-xs focus:outline-none focus:border-primary"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-700">Parent / Guardian Name *</label>
              <input
                type="text"
                required
                value={form.parent_name}
                onChange={(e) => setForm({ ...form, parent_name: e.target.value })}
                placeholder="e.g. Mr. Robert Kigozi"
                className="w-full rounded-lg border border-gray-200 px-3 text-xs focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700">Relationship</label>
              <UniversalSelect
                value={form.parent_relationship}
                onChange={(val) => setForm({ ...form, parent_relationship: val })}
                options={[
                  { value: "Father", label: "Father" },
                  { value: "Mother", label: "Mother" },
                  { value: "Parent / Guardian", label: "Guardian" },
                  { value: "Sponsor", label: "Sponsor" },
                ]}
                searchable={false}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700">Parent Phone *</label>
              <input
                type="text"
                required
                value={form.parent_phone}
                onChange={(e) => setForm({ ...form, parent_phone: e.target.value })}
                placeholder="+256772..."
                className="w-full rounded-lg border border-gray-200 px-3 text-xs focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-700">Parent Email</label>
              <input
                type="email"
                value={form.parent_email}
                onChange={(e) => setForm({ ...form, parent_email: e.target.value })}
                placeholder="parent@example.com"
                className="w-full rounded-lg border border-gray-200 px-3 text-xs focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700">Emergency Contact Name</label>
              <input
                type="text"
                value={form.emergency_contact_name}
                onChange={(e) => setForm({ ...form, emergency_contact_name: e.target.value })}
                placeholder="Alternate person"
                className="w-full rounded-lg border border-gray-200 px-3 text-xs focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700">Emergency Phone</label>
              <input
                type="text"
                value={form.emergency_contact_phone}
                onChange={(e) => setForm({ ...form, emergency_contact_phone: e.target.value })}
                placeholder="+256701..."
                className="w-full rounded-lg border border-gray-200 px-3 text-xs focus:outline-none focus:border-primary"
              />
            </div>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-700">Blood Group</label>
              <UniversalSelect
                value={form.blood_group}
                onChange={(val) => setForm({ ...form, blood_group: val })}
                options={["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"].map((bg) => ({
                  value: bg,
                  label: bg,
                }))}
                searchable={false}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700">Allergies / Medical Notes</label>
              <input
                type="text"
                value={form.allergies}
                onChange={(e) => setForm({ ...form, allergies: e.target.value })}
                placeholder="None reported"
                className="w-full rounded-lg border border-gray-200 px-3 text-xs focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700">Canteen Daily Spend Limit (UGX)</label>
              <input
                type="number"
                min="0"
                step="1000"
                value={form.canteen_daily_limit_ugx}
                onChange={(e) => setForm({ ...form, canteen_daily_limit_ugx: e.target.value })}
                className="w-full rounded-lg border border-gray-200 px-3 text-xs focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 space-y-2 text-xs">
            <p className="font-bold text-primary inline-flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              Admission Summary Review
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 pt-1 text-[11px] text-gray-700">
              <p><span className="font-semibold text-gray-900">Student:</span> {form.full_name} ({form.gender})</p>
              <p><span className="font-semibold text-gray-900">Age:</span> {ageInfo?.label || "-"}</p>
              <p><span className="font-semibold text-gray-900">Class:</span> {selectedClass ? `${selectedClass.name} (${selectedClass.curriculum_label})` : "-"}</p>
              <p><span className="font-semibold text-gray-900">Boarding:</span> {form.boarding_status === "BOARDING" ? `${form.house_name} ${form.dormitory_room}` : "Day Scholar"}</p>
              <p><span className="font-semibold text-gray-900">Parent:</span> {form.parent_name} ({form.parent_phone})</p>
              <p><span className="font-semibold text-gray-900">Medical:</span> Blood {form.blood_group} · {form.allergies}</p>
            </div>
          </div>
        </div>
      )}
    </RegistrationWizardShell>
  );
}
