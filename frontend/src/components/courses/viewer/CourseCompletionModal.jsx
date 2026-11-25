import React, { useEffect, useState } from "react";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";
import { FaAward, FaTimes, FaSpinner, FaDownload } from "react-icons/fa";

export default function CourseCompletionModal({
  isOpen,
  onClose,
  certificateUrl,
  courseTitle,
  moduleTitle,
  moduleId,
  courseSlug,
  onCertificateClaimed,
}) {
  const { width, height } = useWindowSize();
  const [showConfetti, setShowConfetti] = useState(false);

  const [nameInput, setNameInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // We only show the form if the certificateUrl hasn't been set yet
  const needsToClaim = !certificateUrl;

  useEffect(() => {
    if (isOpen) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 8000);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleClaimCertificate = async (e) => {
    e.preventDefault();
    if (!nameInput.trim()) {
      setError("Please enter a name for your certificate.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const token = localStorage.getItem("access_token");
      const url = moduleId 
        ? `/api/courses/${courseSlug}/claim-certificate/?module_id=${moduleId}`
        : `/api/courses/${courseSlug}/claim-certificate/`;
        
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name_on_certificate: nameInput }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to generate certificate");
      }

      if (onCertificateClaimed && data.certificate_url) {
        onCertificateClaimed(data.certificate_url);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Confetti Canvas */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-[110]">
          <Confetti
            width={width}
            height={height}
            recycle={needsToClaim ? true : false}
            numberOfPieces={needsToClaim ? 200 : 400}
            gravity={0.15}
          />
        </div>
      )}

      {/* Modal Content */}
      {!needsToClaim ? (
        <div 
          className="relative w-[90vw] h-[75vh] max-w-5xl bg-transparent rounded-none overflow-hidden flex flex-col z-[120] mx-auto mt-5 mb-auto shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="absolute top-4 right-4 z-10 flex gap-2">
            <a
              href={certificateUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-black/50 hover:bg-black/80 text-white p-3 rounded-full backdrop-blur-md transition-all shadow-lg"
              title="Download / Open in New Tab"
            >
              <FaDownload />
            </a>
            <button
              onClick={onClose}
              className="bg-black/50 hover:bg-red-500/80 text-white p-3 rounded-full backdrop-blur-md transition-all shadow-lg"
              title="Close Viewer"
            >
              <FaTimes />
            </button>
          </div>
          <iframe
            src={`${certificateUrl}#toolbar=0&navpanes=0&scrollbar=0&view=Fit`}
            className="w-full h-full border-none flex-1 bg-white"
            title="Certificate Viewer"
          />
        </div>
      ) : (
        <div className="relative bg-background border border-border shadow-2xl rounded-none w-full max-w-md p-8 text-center z-[120] transform transition-all animate-in fade-in zoom-in duration-300">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-foreground/50 hover:text-foreground transition-colors"
          >
            <FaTimes size={20} />
          </button>
  
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <FaAward className="text-primary text-4xl" />
          </div>
  
          <h2 className="text-3xl font-bold text-foreground mb-3">
            Congratulations!
          </h2>
  
          <p className="text-foreground/80 mb-6 leading-relaxed">
            You have successfully completed <strong>{moduleTitle || courseTitle}</strong>. Your
            hard work has paid off!
          </p>
  
          <form onSubmit={handleClaimCertificate} className="text-left mb-4">
            <label className="block text-sm font-semibold text-foreground mb-2">
              Enter your name for the Certificate:
            </label>
            <input
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder="e.g. Peter Gordon Ekebu"
              className="w-full p-3 rounded-lg border border-border bg-background text-foreground mb-4 focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
  
            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
  
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {isSubmitting ? (
                <>
                  <FaSpinner className="animate-spin" /> Generating...
                </>
              ) : (
                <>
                  <FaAward /> Claim Certificate
                </>
              )}
            </button>
          </form>
          <button
            onClick={onClose}
            className="w-full py-3 bg-transparent border border-border text-foreground font-medium rounded-lg hover:bg-muted transition-colors"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
