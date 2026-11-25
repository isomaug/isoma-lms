import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  FaCheckCircle,
  FaTimesCircle,
  FaSearch,
  FaSpinner,
} from "react-icons/fa";
import { apiFetch } from "@/api/client/apiClient";

export default function VerifyCertificate() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialId = searchParams.get("id") || "";

  const [verifyId, setVerifyId] = useState(initialId);
  const [isVerifying, setIsVerifying] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleVerify = async (idToVerify) => {
    if (!idToVerify.trim()) return;

    setIsVerifying(true);
    setResult(null);
    setError(null);

    try {
      const res = await apiFetch(
        `/api/courses/certificates/verify/${idToVerify.trim()}/`
      );
      const data = await res.json();

      if (res.ok && data.valid) {
        setResult(data);
      } else {
        setError(data.detail || "Certificate not found or invalid.");
      }
    } catch (err) {
      setError("Network error. Please try again later.");
    } finally {
      setIsVerifying(false);
    }
  };

  useEffect(() => {
    if (initialId) {
      handleVerify(initialId);
    }
  }, []);

  const onSubmit = (e) => {
    e.preventDefault();
    if (verifyId) {
      setSearchParams({ id: verifyId });
      handleVerify(verifyId);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 bg-background flex flex-col items-center">
      <div className="w-full max-w-2xl px-4">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Verify Certificate
          </h1>
          <p className="text-foreground/70 text-lg">
            Enter a Verification ID to confirm the authenticity of a
            certificate.
          </p>
        </div>

        <div className="bg-muted/30 border border-border rounded-2xl p-6 sm:p-10 shadow-lg">
          <form
            onSubmit={onSubmit}
            className="flex flex-col sm:flex-row gap-3 mb-8"
          >
            <input
              type="text"
              value={verifyId}
              onChange={(e) => setVerifyId(e.target.value)}
              placeholder="e.g. 123e4567-e89b-12d3-a456-426614174000"
              className="flex-1 px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
            <button
              type="submit"
              disabled={isVerifying}
              className="px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {isVerifying ? (
                <FaSpinner className="animate-spin" />
              ) : (
                <FaSearch />
              )}
              Verify
            </button>
          </form>

          {error && (
            <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-xl text-center">
              <FaTimesCircle className="text-red-500 text-5xl mx-auto mb-4" />
              <h3 className="text-xl font-bold text-foreground mb-2">
                Verification Failed
              </h3>
              <p className="text-red-500">{error}</p>
            </div>
          )}

          {result && (
            <div className="p-6 bg-green-500/10 border border-green-500/20 rounded-xl text-center animate-in fade-in zoom-in duration-300">
              <FaCheckCircle className="text-green-500 text-5xl mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-foreground mb-2">
                Certificate Verified!
              </h3>
              <p className="text-green-600 font-medium mb-6">
                This is a valid, authentic certificate.
              </p>

              <div className="bg-background rounded-lg p-6 border border-border text-left space-y-4">
                <div>
                  <p className="text-sm text-foreground/60 uppercase tracking-wider font-semibold">
                    Student Name
                  </p>
                  <p className="text-lg font-medium text-foreground">
                    {result.user_name}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-foreground/60 uppercase tracking-wider font-semibold">
                    Course Completed
                  </p>
                  <p className="text-lg font-medium text-foreground">
                    {result.course_title}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-foreground/60 uppercase tracking-wider font-semibold">
                    Date Issued
                  </p>
                  <p className="text-lg font-medium text-foreground">
                    {new Date(result.issued_at).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-foreground/60 uppercase tracking-wider font-semibold">
                    Verification ID
                  </p>
                  <p className="text-sm font-mono text-foreground bg-muted p-2 rounded mt-1">
                    {result.uuid}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
