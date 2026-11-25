import { useEffect, useState, useMemo } from "react";
import {
  FaTimes,
  FaFileAlt,
  FaDownload,
  FaExternalLinkAlt,
  FaSpinner,
  FaImage,
  FaEdit,
} from "react-icons/fa";

/**
 * Check if the URL points to an image file.
 */
function isImage(url) {
  if (!url) return false;
  const lower = url.toLowerCase();
  return (
    lower.endsWith(".png") ||
    lower.endsWith(".jpg") ||
    lower.endsWith(".jpeg") ||
    lower.endsWith(".webp") ||
    lower.endsWith(".svg") ||
    lower.endsWith(".gif")
  );
}

/**
 * Get a friendly format label from the filename or URL.
 */
function getFormatLabel(url) {
  if (!url) return "DOC";
  const clean = url.split("?")[0];
  const ext = clean.split(".").pop()?.toUpperCase();
  return ext && ext.length <= 5 ? ext : "DOC";
}

/**
 * DocumentPreviewModal
 * Displays course/lesson documents in an on-screen popup modal.
 * Adapts to white/dark theme, uses solid high-contrast colors, never cuts off at screen bottom,
 * and provides direct Google Docs editing capabilities.
 */
export default function DocumentPreviewModal({ isOpen, onClose, doc }) {
  const [loading, setLoading] = useState(true);

  // Close on Escape key press
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prevOverflow;
      };
    }
  }, [isOpen]);

  // Reset loading state whenever a new doc is opened
  useEffect(() => {
    if (isOpen && doc) {
      setLoading(true);
    }
  }, [isOpen, doc]);

  const fileUrl = doc?.file || "";
  const isImg = isImage(fileUrl);
  const formatLabel = getFormatLabel(fileUrl);
  const downloadUrl = doc?.download_url || (doc?.id ? `/api/courses/materials/${doc.id}/download/` : fileUrl);

  // Determine Google Docs viewer vs editable iframe URL
  const { iframeSrc, googleEditUrl, isNativeGoogleDoc } = useMemo(() => {
    if (!fileUrl) {
      return { iframeSrc: "", googleEditUrl: "", isNativeGoogleDoc: false };
    }

    if (fileUrl.includes("docs.google.com/document")) {
      const editBase = fileUrl.replace(/\/preview.*|\/view.*/, "");
      return {
        iframeSrc: `${editBase}/edit?embedded=true`,
        googleEditUrl: `${editBase}/edit`,
        isNativeGoogleDoc: true,
      };
    }

    if (fileUrl.includes("docs.google.com/spreadsheets")) {
      const editBase = fileUrl.replace(/\/preview.*|\/view.*/, "");
      return {
        iframeSrc: `${editBase}/edit?embedded=true`,
        googleEditUrl: `${editBase}/edit`,
        isNativeGoogleDoc: true,
      };
    }

    if (fileUrl.includes("docs.google.com/presentation")) {
      const editBase = fileUrl.replace(/\/preview.*|\/view.*/, "");
      return {
        iframeSrc: `${editBase}/edit?embedded=true`,
        googleEditUrl: `${editBase}/edit`,
        isNativeGoogleDoc: true,
      };
    }

    // For uploaded files (S3 .docx, .pdf, .xlsx), use Google Docs Viewer for preview
    const viewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(fileUrl)}&embedded=true`;
    // For Google Docs editing of uploaded Word files, provide quick Google Docs creation / open
    const editUrl = `https://docs.google.com/document/create`;

    return {
      iframeSrc: viewerUrl,
      googleEditUrl: editUrl,
      isNativeGoogleDoc: false,
    };
  }, [fileUrl]);

  if (!isOpen || !doc) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Document Preview: ${doc.title || "Lesson Material"}`}
      className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200 overflow-hidden"
      onClick={onClose}
    >
      {/* Modal Card - Sized to fit comfortably inside screen without bottom cut-off */}
      <div
        className="relative w-full max-w-5xl h-[86vh] max-h-[840px] bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-900 dark:text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <header className="h-14 sm:h-16 px-4 sm:px-6 bg-slate-100 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 shrink-0 select-none">
          {/* Document Title & Lesson Info */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm">
              {isImg ? <FaImage className="w-4 h-4 sm:w-5 sm:h-5" /> : <FaFileAlt className="w-4 h-4 sm:w-5 sm:h-5" />}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate max-w-md" title={doc.title}>
                  {doc.title || "Document Preview"}
                </h3>
                <span className="shrink-0 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-blue-700 text-white shadow-sm">
                  {formatLabel}
                </span>
                {doc.is_instructor_only && (
                  <span className="shrink-0 px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-rose-600 text-white shadow-sm">
                    Instructor Only
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-[11px] text-slate-600 dark:text-slate-400 truncate mt-0.5">
                {doc.lessonTitle && (
                  <span className="truncate font-semibold text-slate-800 dark:text-slate-300">
                    {doc.moduleTitle ? `${doc.moduleTitle} · ` : ""}{doc.lessonTitle}
                  </span>
                )}
                <span>•</span>
                <span className="truncate">
                  {doc.is_instructor_only ? "Lesson Plan Document" : "Supplementary Material"}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons - Solid High Contrast Colours */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Edit in Google Docs button */}
            {isNativeGoogleDoc ? (
              <a
                href={googleEditUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 sm:px-3.5 sm:py-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
                title="Open and edit live in Google Docs"
              >
                <FaEdit className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Edit in Google Docs</span>
              </a>
            ) : (
              <a
                href={googleEditUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 sm:px-3.5 sm:py-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
                title="Open a blank document in Google Docs to edit or copy content"
              >
                <FaEdit className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Google Docs</span>
              </a>
            )}

            {/* Direct Download Button (Solid Emerald) */}
            <a
              href={downloadUrl}
              download
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 sm:px-4 sm:py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
              title="Download file to your computer"
            >
              <FaDownload className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Download</span>
            </a>

            {/* Open in External Tab Fallback */}
            <a
              href={isImg ? fileUrl : (doc.download_url || fileUrl)}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 sm:px-3 sm:py-2 bg-slate-700 hover:bg-slate-800 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
              title="Open raw file in a new tab"
            >
              <FaExternalLinkAlt className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">Raw File</span>
            </a>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="p-2 sm:p-2.5 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-rose-600 active:bg-rose-700 text-slate-700 dark:text-slate-300 hover:text-white transition-all cursor-pointer shadow-sm"
              title="Close preview (Esc)"
              aria-label="Close document preview"
            >
              <FaTimes className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Modal Body / Viewer - min-h-0 prevents bottom flex overflow */}
        <div className="relative flex-1 w-full min-h-0 bg-slate-100 dark:bg-slate-950 overflow-hidden flex items-center justify-center">
          {/* Loading state indicator */}
          {loading && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-white/95 dark:bg-slate-950/95 text-slate-800 dark:text-slate-200">
              <FaSpinner className="w-8 h-8 text-blue-600 animate-spin" />
              <p className="text-xs sm:text-sm font-bold">Loading document preview...</p>
            </div>
          )}

          {isImg ? (
            <div className="w-full h-full p-4 overflow-auto flex items-center justify-center">
              <img
                src={fileUrl}
                alt={doc.title || "Material preview"}
                onLoad={() => setLoading(false)}
                onError={() => setLoading(false)}
                className="max-w-full max-h-full object-contain rounded-lg shadow-md select-none"
              />
            </div>
          ) : (
            <iframe
              title={`Preview of ${doc.title || "Document"}`}
              src={iframeSrc}
              onLoad={() => setLoading(false)}
              onError={() => setLoading(false)}
              className="w-full h-full border-0 bg-white"
              sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
            />
          )}
        </div>

        {/* Footer info bar - guaranteed visible inside viewport */}
        <footer className="h-10 px-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 shrink-0 select-none">
          <span className="truncate">
            {isNativeGoogleDoc
              ? "Live editable Google Doc workspace"
              : "Document preview powered by Google Docs Viewer"}
          </span>
          <div className="flex items-center gap-3 shrink-0">
            <span>Press <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono text-[10px] text-slate-700 dark:text-slate-300 font-bold">Esc</kbd> to exit</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
