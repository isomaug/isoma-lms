import React from "react";
import { ChevronLeft, ChevronRight, Check, FilePenLine } from "lucide-react";

export function calculateAgeInfo(dobString) {
  if (!dobString) return null;
  const dob = new Date(dobString);
  if (Number.isNaN(dob.getTime())) return null;
  const today = new Date();
  let years = today.getFullYear() - dob.getFullYear();
  let months = today.getMonth() - dob.getMonth();
  let days = today.getDate() - dob.getDate();
  if (days < 0) {
    months -= 1;
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }
  if (years < 0) return { years: 0, months: 0, label: "Invalid future date", invalid: true };
  return {
    years,
    months,
    label: months > 0 ? `${years} yrs, ${months} mos` : `${years} yrs`,
    invalid: false,
  };
}

export default function RegistrationWizardShell({
  steps,
  currentStep,
  onStepChange,
  onPrev,
  onNext,
  onSaveDraft,
  onSubmit,
  submitting = false,
  submitLabel = "Complete Registration",
  children,
}) {
  const isFirst = currentStep === 0;
  const isLast = currentStep === steps.length - 1;
  const progressPct = Math.round(((currentStep + 1) / steps.length) * 100);

  return (
    <div className="flex-1 flex flex-col bg-white rounded-t-2xl rounded-b-none shadow-sm border border-b-0 border-gray-100 overflow-hidden h-[calc(100dvh-13.5rem)] min-h-[480px] max-h-[760px]">
      {/* Pinned Stepper Header (Mobile-Optimized) */}
      <div className="shrink-0 border-b border-gray-100 px-4 py-3.5 sm:px-8 sm:py-4 bg-white">
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div>
            <p className="text-[10px] font-bold text-primary uppercase tracking-widest">
              Section {currentStep + 1} of {steps.length}
            </p>
            <h2 className="text-sm sm:text-base font-bold text-gray-900 leading-tight">
              {steps[currentStep].title}
            </h2>
          </div>
          <span className="text-xs font-bold text-primary shrink-0">{progressPct}%</span>
        </div>

        {/* Step Pills */}
        <div className="grid grid-cols-4 gap-1.5 sm:gap-2.5">
          {steps.map((step, idx) => {
            const completed = idx < currentStep;
            const active = idx === currentStep;
            return (
              <button
                key={step.id}
                type="button"
                onClick={() => {
                  if (idx <= currentStep) onStepChange(idx);
                }}
                disabled={idx > currentStep}
                className={`flex items-center gap-1.5 rounded-lg border px-2 py-1.5 text-left transition-all ${
                  active
                    ? "border-primary bg-primary/5 text-primary"
                    : completed
                    ? "border-emerald-200 bg-emerald-50/60 text-emerald-700 hover:border-emerald-300"
                    : "border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed"
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center shrink-0 ${
                    active
                      ? "bg-primary text-white"
                      : completed
                      ? "bg-emerald-600 text-white"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {completed ? <Check className="w-3 h-3" /> : idx + 1}
                </span>
                <span className="hidden sm:inline text-[11px] font-semibold truncate">
                  {step.shortTitle || step.title}
                </span>
              </button>
            );
          })}
        </div>

        {/* Thin Progress Bar */}
        <div className="mt-3 h-1 w-full rounded-full bg-gray-100 overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300 ease-out"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Fixed-Height Scrollable Section Body */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (isLast) onSubmit();
          else onNext();
        }}
        className="flex-1 flex flex-col min-h-0"
      >
        <div className="flex-1 overflow-y-auto px-4 py-5 sm:px-8 sm:py-6">
          <div key={currentStep} className="page-enter w-full space-y-5">
            {children}
          </div>
        </div>

        {/* Pinned Navigation Footer (Prev / Save Draft / Next / Submit) */}
        <div className="shrink-0 border-t border-gray-100 bg-gray-50/80 px-4 py-3.5 sm:px-8 flex items-center justify-between gap-2 sm:gap-3">
          <button
            type="button"
            disabled={isFirst || submitting}
            onClick={onPrev}
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3.5 sm:px-4 py-2.5 text-xs font-semibold text-gray-700 hover:border-primary hover:text-primary disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>

          <div className="flex items-center gap-2 sm:gap-3">
            {onSaveDraft && (
              <button
                type="button"
                disabled={submitting}
                onClick={onSaveDraft}
                className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-gray-700 hover:border-amber-500 hover:text-amber-700 transition-colors"
              >
                <FilePenLine className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Save Draft</span>
              </button>
            )}

            {isLast ? (
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 sm:px-5 py-2.5 text-xs font-semibold text-white hover:bg-primary-hover disabled:opacity-60 transition-colors"
              >
                <Check className="w-4 h-4" />
                {submitting ? "Submitting..." : submitLabel}
              </button>
            ) : (
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 sm:px-5 py-2.5 text-xs font-semibold text-white hover:bg-primary-hover transition-colors"
              >
                Next Section
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
