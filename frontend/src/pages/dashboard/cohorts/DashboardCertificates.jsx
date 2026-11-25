import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaCertificate, FaDownload, FaCheckCircle, FaTimes, FaEye } from "react-icons/fa";
import { Link } from "react-router-dom";

export default function DashboardCertificates() {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCertPdf, setSelectedCertPdf] = useState(null);

  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) throw new Error("Authentication required");

        const response = await fetch("/api/courses/certificates/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch certificates");
        }

        const data = await response.json();
        setCertificates(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCertificates();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="w-10 h-10 border-4 border-border border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-6 rounded-xl">
        <p className="font-semibold">Error Loading Certificates</p>
        <p className="text-sm opacity-80">{error}</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-foreground">My Certificates</h2>
        <p className="text-muted-foreground mt-1 text-sm">
          View and download your earned course completion certificates.
        </p>
      </div>

      {certificates.length === 0 ? (
        <div className="bg-card border border-border p-12 rounded-xl text-center flex flex-col items-center justify-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <FaCertificate className="text-3xl text-primary/50" />
          </div>
          <h3 className="text-xl font-bold text-foreground mb-2">No Certificates Yet</h3>
          <p className="text-muted-foreground text-sm max-w-md mb-6">
            Complete all lessons and quizzes in a course to earn your official completion certificate!
          </p>
          <Link
            to="/dashboard"
            className="px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors"
          >
            Continue Learning
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {certificates.map((cert, index) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              key={cert.uuid}
              className="bg-card border border-border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group flex flex-col"
            >
              {/* Certificate Preview Placeholder */}
              <div className="bg-muted p-6 flex flex-col items-center justify-center border-b border-border relative h-48">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent"></div>
                <FaCertificate className="text-5xl text-amber-500 mb-3 z-10 drop-shadow-md" />
                <h4 className="font-serif text-lg font-bold text-foreground text-center z-10 px-4 line-clamp-2 leading-tight">
                  {cert.course_title}
                </h4>
                {cert.module_title && (
                  <p className="text-xs font-semibold text-primary z-10 mt-2 bg-primary/10 px-2 py-0.5 rounded">
                    {cert.module_title}
                  </p>
                )}
                <div className="absolute bottom-3 left-0 w-full text-center z-10">
                  <span className="text-[10px] text-muted-foreground font-medium tracking-wider uppercase">
                    ID: {cert.uuid.split('-')[0]}
                  </span>
                </div>
              </div>

              <div className="p-5 flex flex-col flex-1 justify-between">
                <div className="mb-4 flex-1">
                  <div className="flex items-center gap-1.5 text-xs text-foreground/50 mb-3">
                    {cert.is_approved ? (
                      <>
                        <FaCheckCircle className="text-green-500 text-xs" />
                        <span className="text-xs font-semibold uppercase tracking-wider text-green-500">
                          Officially Certified
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                        <span className="text-xs font-semibold uppercase tracking-wider text-amber-500">
                          Pending Approval
                        </span>
                      </>
                    )}
                  </div>
                  <h3 className="font-bold text-foreground line-clamp-1" title={cert.course_title}>
                    {cert.course_title}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Issued: {new Date(cert.issued_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>

                <div className="flex gap-2">
                  {cert.is_approved && cert.pdf_url ? (
                    <button
                      onClick={() => setSelectedCertPdf(cert.pdf_url)}
                      className="flex-1 px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors"
                    >
                      <FaEye /> View
                    </button>
                  ) : (
                    <button disabled className="flex-1 px-4 py-2 bg-muted text-muted-foreground text-sm font-medium rounded flex items-center justify-center gap-2 cursor-not-allowed">
                      {cert.is_approved ? "Processing..." : "Pending Approval"}
                    </button>
                  )}
                  <Link
                    to={`/courses/${cert.course_slug}`}
                    className="px-4 py-2 border border-border text-foreground hover:bg-muted text-sm font-medium rounded transition-colors"
                  >
                    View Course
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Frameless Modal Overlay for Inline Viewing */}
      <AnimatePresence>
        {selectedCertPdf && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 md:p-8"
            onClick={() => setSelectedCertPdf(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-[90vw] h-[75vh] max-w-5xl bg-transparent rounded-none overflow-hidden flex flex-col mx-auto mt-5 mb-auto shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="absolute top-4 right-4 z-10 flex gap-2">
                <a
                  href={selectedCertPdf}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-black/50 hover:bg-black/80 text-white p-3 rounded-full backdrop-blur-md transition-all shadow-lg"
                  title="Download / Open in New Tab"
                >
                  <FaDownload />
                </a>
                <button
                  onClick={() => setSelectedCertPdf(null)}
                  className="bg-black/50 hover:bg-red-500/80 text-white p-3 rounded-full backdrop-blur-md transition-all shadow-lg"
                  title="Close Viewer"
                >
                  <FaTimes />
                </button>
              </div>
              <iframe
                src={`${selectedCertPdf}#toolbar=0&navpanes=0&scrollbar=0&view=Fit`}
                className="w-full h-full border-none flex-1 bg-white"
                title="Certificate Viewer"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
