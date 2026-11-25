import React, { useState } from "react";
import { Award, Search } from "lucide-react";
import { customToast } from "../../components/GlobalPopup";

export default function VerifyCertificate() {
  const [code, setCode] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    if (!code.trim()) {
      customToast.error("Enter a certificate or report card verification code.");
      return;
    }
    customToast.info(`Verification lookup for "${code.trim()}" will connect to the ported certificates table in Phase 1.`);
  }

  return (
    <div className="relative bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-primary/60 to-primary" />
      <div className="px-6 py-10 md:px-10 text-center max-w-xl mx-auto">
        <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
          <Award className="w-6 h-6" />
        </div>
        <h1 className="text-lg md:text-2xl font-bold text-gray-900 tracking-tight">
          Verify Certificate or Transcript
        </h1>
        <p className="text-sm text-gray-500 mt-1.5">
          Confirm the authenticity of any Isoma Open Academy certificate or institutional report card.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col sm:flex-row gap-2.5">
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="e.g. ISOMA-2026-CERT-0042"
            className="flex-1 rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm text-gray-800 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
          <button
            type="submit"
            className="bg-primary text-white font-medium px-6 py-2.5 rounded-lg hover:bg-primary-hover text-sm inline-flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          >
            <Search className="w-4 h-4" />
            Verify
          </button>
        </form>
      </div>
    </div>
  );
}
