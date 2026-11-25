import React, { useState, useEffect, useRef } from "react";
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from "docx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useReactToPrint } from "react-to-print";
import { apiFetch } from "@/api/client/apiClient";
import { toast } from "sonner";

export default function LessonAssignmentDoc({
  lesson,
  courseSlug,
  course,
  cohort,
  me,
  isInstructorOrAdmin,
  onXpEarned
}) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [grading, setGrading] = useState(false);
  const [savingStructure, setSavingStructure] = useState(false);
  const [generatingAi, setGeneratingAi] = useState(false);
  const [importing, setImporting] = useState(false);

  const [assignment, setAssignment] = useState(null);
  const [mySubmission, setMySubmission] = useState(null);
  const [allSubmissions, setAllSubmissions] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState(null);

  // Instructor workspace mode: 'preview' (test/fill), 'review' (grade students), 'edit' (edit questions)
  const [instructorMode, setInstructorMode] = useState("preview");

  // Form answers state
  const [answers, setAnswers] = useState({});
  const [partnerStudentId, setPartnerStudentId] = useState("");
  const [lastSavedTime, setLastSavedTime] = useState(null);
  const [isPendingAutosave, setIsPendingAutosave] = useState(false);

  // Teacher grading inputs
  const [gradeScore, setGradeScore] = useState("");
  const [gradeFeedback, setGradeFeedback] = useState("");

  // Edit Assignment Questions state
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editInstructions, setEditInstructions] = useState("");
  const [editMaxScore, setEditMaxScore] = useState(100);
  const [editQuestions, setEditQuestions] = useState([]);

  const autoSaveTimerRef = useRef(null);
  const fileInputRef = useRef(null);
  const printableDocRef = useRef(null);
  const [exportingPdf, setExportingPdf] = useState(false);

  // Fetch assignment & submissions
  const fetchAssignmentData = async () => {
    if (!lesson?.id) return;
    setLoading(true);
    try {
      const url = `/api/courses/lessons/${lesson.id}/assignment/${cohort?.id ? `?cohort_id=${cohort.id}` : ""}`;
      const res = await apiFetch(url);
      if (res.ok) {
        const data = await res.json();
        setAssignment(data.assignment);
        setMySubmission(data.my_submission);
        setAllSubmissions(data.all_submissions || []);

        // Populate edit form states
        if (data.assignment) {
          setEditTitle(data.assignment.title || "");
          setEditDescription(data.assignment.description || "");
          setEditInstructions(data.assignment.instructions || "");
          setEditMaxScore(data.assignment.max_score || 100);
          setEditQuestions(Array.isArray(data.assignment.questions) ? data.assignment.questions : []);
        }

        // Initialize student answers
        if (data.my_submission?.answers) {
          setAnswers(data.my_submission.answers);
        } else {
          const init = {};
          (data.assignment?.questions || []).forEach((q) => {
            init[q.id] = "";
          });
          setAnswers(init);
        }

        if (data.my_submission?.updated_at) {
          const t = new Date(data.my_submission.updated_at);
          if (!isNaN(t.getTime())) {
            setLastSavedTime(t.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
          }
        }

        if (data.my_submission?.paired_student_id) {
          setPartnerStudentId(data.my_submission.paired_student_id);
        }

        if (isInstructorOrAdmin && data.all_submissions?.length > 0) {
          setSelectedStudentId((prev) => prev || data.all_submissions[0].student_id);
          setInstructorMode("review");
        }
      }
    } catch (err) {
      console.error("Failed to load assignment:", err);
      toast.error("Could not load assignment worksheet.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignmentData();
  }, [lesson?.id, cohort?.id]);

  // Selected student submission for grading
  const selectedSubmission = isInstructorOrAdmin && selectedStudentId
    ? allSubmissions.find((s) => s.student_id === selectedStudentId)
    : mySubmission;

  const isGraded = mySubmission?.status === "graded";
  const isSubmitted = mySubmission?.status === "submitted" || isGraded;
  const isReviewingStudent = isInstructorOrAdmin && instructorMode === "review" && selectedSubmission;
  const isReadOnly = isReviewingStudent || (!isInstructorOrAdmin && isGraded);
  const displayAnswers = isReviewingStudent ? (selectedSubmission?.answers || {}) : answers;

  useEffect(() => {
    if (isInstructorOrAdmin && selectedSubmission) {
      setGradeScore(selectedSubmission.score !== null && selectedSubmission.score !== undefined ? String(selectedSubmission.score) : "");
      setGradeFeedback(selectedSubmission.feedback || "");
    }
  }, [selectedStudentId, isInstructorOrAdmin, selectedSubmission]);

  // Handle answer input
  const handleAnswerChange = (qId, val) => {
    const updated = { ...answers, [qId]: val };
    setAnswers(updated);
    setIsPendingAutosave(true);

    // Debounced autosave
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    autoSaveTimerRef.current = setTimeout(() => {
      saveDraft(updated, false);
    }, 2500);
  };

  // Save student draft
  const saveDraft = async (answersToSave = answers, showToast = true) => {
    if (!lesson?.id) return;
    setSaving(true);
    setIsPendingAutosave(false);
    try {
      const res = await apiFetch(`/api/courses/lessons/${lesson.id}/assignment/`, {
        method: "POST",
        body: JSON.stringify({
          answers: answersToSave,
          status: "draft",
          cohort_id: cohort?.id || null,
          paired_student_id: partnerStudentId ? Number(partnerStudentId) : null
        })
      });
      if (res.ok) {
        setLastSavedTime(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
        if (showToast) toast.success("Draft saved successfully.");
      } else {
        if (showToast) toast.error("Could not save draft.");
      }
    } catch (err) {
      if (showToast) toast.error("Could not save draft.");
    } finally {
      setSaving(false);
      setIsPendingAutosave(false);
    }
  };

  // Keyboard shortcut: Ctrl+S / Cmd+S to save draft immediately
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        if (!isReadOnly) {
          e.preventDefault();
          if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
          saveDraft(answers, true);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [answers, isReadOnly, lesson?.id, partnerStudentId, cohort?.id]);

  // Submit student assignment
  const handleSubmitAssignment = async () => {
    const hasAnyContent = Object.values(answers).some((txt) => txt && String(txt).trim().length > 0);
    if (!hasAnyContent) {
      toast.error("Please fill in your responses before submitting.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await apiFetch(`/api/courses/lessons/${lesson.id}/assignment/`, {
        method: "POST",
        body: JSON.stringify({
          answers,
          status: "submitted",
          cohort_id: cohort?.id || null,
          paired_student_id: partnerStudentId ? Number(partnerStudentId) : null
        })
      });
      if (res.ok) {
        toast.success("Assignment submitted to instructor. (+25 XP awarded)");
        onXpEarned?.(25);
        fetchAssignmentData();
      } else {
        toast.error("Failed to submit assignment.");
      }
    } catch (err) {
      toast.error("Network error while submitting.");
    } finally {
      setSubmitting(false);
    }
  };

  // Submit instructor grade
  const handleGradeSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSubmission?.id) return;
    const scoreNum = parseInt(gradeScore, 10);
    if (isNaN(scoreNum) || scoreNum < 0 || scoreNum > 100) {
      toast.error("Please enter a valid grade between 0 and 100.");
      return;
    }

    setGrading(true);
    try {
      const res = await apiFetch(`/api/courses/assignments/submissions/${selectedSubmission.id}/grade/`, {
        method: "POST",
        body: JSON.stringify({
          score: scoreNum,
          feedback: gradeFeedback.trim()
        })
      });
      if (res.ok) {
        toast.success(`Grade saved (${scoreNum}/100) and bonus XP awarded.`);
        fetchAssignmentData();
      } else {
        toast.error("Failed to record grade.");
      }
    } catch (err) {
      toast.error("Error submitting grade.");
    } finally {
      setGrading(false);
    }
  };

  // Instructor: Save edited assignment questions structure
  const handleSaveAssignmentStructure = async (e) => {
    e?.preventDefault();
    if (!lesson?.id) return;
    if (!editTitle.trim()) {
      toast.error("Assignment title cannot be empty.");
      return;
    }
    if (editQuestions.length === 0) {
      toast.error("Assignment must have at least one question section.");
      return;
    }

    setSavingStructure(true);
    try {
      const res = await apiFetch(`/api/courses/lessons/${lesson.id}/assignment/`, {
        method: "POST",
        body: JSON.stringify({
          action: "update_assignment",
          title: editTitle.trim(),
          description: editDescription.trim(),
          instructions: editInstructions.trim(),
          max_score: parseInt(editMaxScore, 10) || 100,
          questions: editQuestions
        })
      });

      if (res.ok) {
        const data = await res.json();
        setAssignment(data.assignment);
        toast.success("Assignment questions updated successfully.");
        setInstructorMode("preview");
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.error || "Failed to update assignment.");
      }
    } catch (err) {
      toast.error("Network error updating assignment questions.");
    } finally {
      setSavingStructure(false);
    }
  };

  // EkebuAI: Generate assignment from lesson curriculum
  const handleGenerateWithAi = async () => {
    if (!lesson?.id) return;
    setGeneratingAi(true);
    try {
      const res = await apiFetch(`/api/courses/lessons/${lesson.id}/assignment/`, {
        method: "POST",
        body: JSON.stringify({ action: "generate_with_ai" })
      });
      const data = await res.json();
      if (res.ok && data.assignment) {
        setEditTitle(data.assignment.title || "");
        setEditDescription(data.assignment.description || "");
        setEditInstructions(data.assignment.instructions || "");
        setEditMaxScore(data.assignment.max_score || 100);
        setEditQuestions(data.assignment.questions || []);
        setInstructorMode("edit");
        toast.success(`EkebuAI generated ${data.assignment.questions?.length || 0} questions from this lesson. Review and save changes.`);
      } else {
        toast.error(data.error || "Failed to generate assignment with EkebuAI.");
      }
    } catch (err) {
      toast.error("Network error generating assignment with EkebuAI.");
    } finally {
      setGeneratingAi(false);
    }
  };

  // Import Word (.docx) or Excel (.xlsx / .csv)
  const handleFileImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !lesson?.id) return;

    setImporting(true);
    try {
      const formData = new FormData();
      formData.append("action", "import_file");
      formData.append("file", file);

      const res = await apiFetch(`/api/courses/lessons/${lesson.id}/assignment/`, {
        method: "POST",
        body: formData
      });
      const data = await res.json();
      if (res.ok && data.assignment) {
        setEditTitle(data.assignment.title || "");
        setEditDescription(data.assignment.description || "");
        setEditInstructions(data.assignment.instructions || "");
        setEditMaxScore(data.assignment.max_score || 100);
        setEditQuestions(data.assignment.questions || []);
        setInstructorMode("edit");
        toast.success(`Imported ${data.assignment.questions?.length || 0} questions from ${file.name}. Review and save.`);
      } else {
        toast.error(data.error || "Failed to import assignment file.");
      }
    } catch (err) {
      toast.error("Error reading assignment file.");
    } finally {
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Question editing helpers
  const handleAddTextQuestion = () => {
    const nextNum = editQuestions.length + 1;
    const newQ = {
      id: `q_${Date.now()}`,
      type: "text",
      title: `${nextNum}. Question / Section Title`,
      prompt: "Provide specific guidelines or prompts for learners here.",
      placeholder: "Type your answer and notes here..."
    };
    setEditQuestions([...editQuestions, newQ]);
  };

  const handleAddMcqQuestion = () => {
    const nextNum = editQuestions.length + 1;
    const newQ = {
      id: `q_${Date.now()}`,
      type: "multiple_choice",
      title: `${nextNum}. Concept Check`,
      prompt: "Provide the multiple-choice question prompt here.",
      options: [
        { id: "a", text: "Option A text" },
        { id: "b", text: "Option B text" },
        { id: "c", text: "Option C text" },
        { id: "d", text: "Option D text" }
      ],
      correct_option: "a",
      explanation: "Explanation of the correct answer."
    };
    setEditQuestions([...editQuestions, newQ]);
  };

  const handleToggleQuestionType = (index, newType) => {
    const updated = [...editQuestions];
    const q = updated[index];
    if (q.type === newType) return;
    if (newType === "multiple_choice") {
      updated[index] = {
        ...q,
        type: "multiple_choice",
        options: q.options && q.options.length ? q.options : [
          { id: "a", text: "Option A" },
          { id: "b", text: "Option B" },
          { id: "c", text: "Option C" },
          { id: "d", text: "Option D" }
        ],
        correct_option: q.correct_option || "a",
        explanation: q.explanation || ""
      };
    } else {
      updated[index] = {
        ...q,
        type: "text",
        placeholder: q.placeholder || "Type your response here..."
      };
    }
    setEditQuestions(updated);
  };

  const handleUpdateQuestion = (index, field, value) => {
    const updated = [...editQuestions];
    updated[index] = { ...updated[index], [field]: value };
    setEditQuestions(updated);
  };

  const handleRemoveQuestion = (index) => {
    if (editQuestions.length <= 1) {
      toast.error("Assignment must have at least one question.");
      return;
    }
    const updated = editQuestions.filter((_, i) => i !== index);
    setEditQuestions(updated);
  };

  const handleMoveQuestion = (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= editQuestions.length) return;
    const updated = [...editQuestions];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, moved);
    setEditQuestions(updated);
  };

  // MCQ Options Helpers
  const handleAddOption = (qIndex) => {
    const updated = [...editQuestions];
    const q = { ...updated[qIndex] };
    const opts = [...(q.options || [])];
    const nextLetter = String.fromCharCode(97 + opts.length);
    opts.push({ id: nextLetter, text: `Option ${nextLetter.toUpperCase()}` });
    q.options = opts;
    updated[qIndex] = q;
    setEditQuestions(updated);
  };

  const handleUpdateOption = (qIndex, optIndex, field, value) => {
    const updated = [...editQuestions];
    const q = { ...updated[qIndex] };
    const opts = [...(q.options || [])];
    opts[optIndex] = { ...opts[optIndex], [field]: value };
    q.options = opts;
    updated[qIndex] = q;
    setEditQuestions(updated);
  };

  const handleRemoveOption = (qIndex, optIndex) => {
    const updated = [...editQuestions];
    const q = { ...updated[qIndex] };
    const opts = (q.options || []).filter((_, i) => i !== optIndex);
    if (opts.length < 2) {
      toast.error("Multiple-choice questions must have at least 2 options.");
      return;
    }
    q.options = opts;
    if (!opts.some((o) => o.id === q.correct_option)) {
      q.correct_option = opts[0].id;
    }
    updated[qIndex] = q;
    setEditQuestions(updated);
  };

  const handleSetCorrectOption = (qIndex, optId) => {
    const updated = [...editQuestions];
    updated[qIndex] = { ...updated[qIndex], correct_option: optId };
    setEditQuestions(updated);
  };

  const studentDisplayName = isReviewingStudent
    ? selectedSubmission?.student_name
    : me?.full_name || `${me?.first_name || ""} ${me?.last_name || ""}`.trim() || me?.username || "Learner";

  const rawLessonTitle = (lesson?.title || "").replace(/[-–]/g, "-").trim();
  const weekMatch = rawLessonTitle.match(/^(Week\s*\d+\s*-\s*Lesson\s*\d+)/i);
  const shortLesson = weekMatch ? weekMatch[1] : rawLessonTitle.replace(/^[--–:\s]+/, "");

  let baseDocTitle = assignment?.title || (shortLesson ? `${shortLesson} Worksheet` : "Lesson Worksheet");
  let docTitle = baseDocTitle
    .replace(/[-–]/g, "-")
    .trim();

  // If title was a raw Capstone Studio repeat, make it concise
  if (docTitle.toLowerCase().includes("capstone project studio")) {
    docTitle = shortLesson || "Capstone Project";
  }

  // Remove leading numbers with "-Section", e.g. "7-Section ", "Section ", etc.
  docTitle = docTitle.replace(/^\d+\s*-\s*Section\s*/i, "").replace(/^Section\s*/i, "");

  // Remove "Documentation" or "umentation" as requested
  docTitle = docTitle.replace(/\s*Documentation/gi, "").replace(/\s*umentation/gi, "").trim();

  // Strip any leading hyphens, colons, or whitespace so it never starts with "-Section"
  docTitle = docTitle.replace(/^[--–:\s]+/, "").replace(/[--–:\s]+$/, "").trim();

  // Clean printable document trigger via react-to-print
  const handlePrint = useReactToPrint({
    contentRef: printableDocRef,
    documentTitle: `${docTitle} - ${studentDisplayName}`.replace(/[-–]/g, "-"),
  });

  // Direct PDF export using html2canvas & jsPDF
  const handleExportPdf = async () => {
    const el = printableDocRef.current || document.getElementById("printable-assignment-doc");
    if (!el) {
      toast.error("Document element not found.");
      return;
    }

    setExportingPdf(true);
    const toastId = toast.loading("Generating high-resolution PDF document...");
    try {
      const canvas = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      // First page
      pdf.addImage(imgData, "PNG", 0, position, pdfWidth, imgHeight, undefined, "FAST");
      heightLeft -= pageHeight;

      // Subsequent pages if long document
      while (heightLeft > 0) {
        position -= pageHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, pdfWidth, imgHeight, undefined, "FAST");
        heightLeft -= pageHeight;
      }

      const safeTitle = (docTitle || "Assignment_Doc").replace(/[^\w.-]+/g, "_");
      const safeStudent = (studentDisplayName || "Learner").replace(/[^\w.-]+/g, "_");
      pdf.save(`${safeTitle}_${safeStudent}.pdf`);
      toast.success("PDF document downloaded successfully.", { id: toastId });
    } catch (err) {
      console.error("Failed to generate PDF:", err);
      toast.error("Could not export PDF. Please try Print -> Save as PDF.", { id: toastId });
    } finally {
      setExportingPdf(false);
    }
  };

  // Export native Microsoft Word Document (.docx)
  const handleExportWordDoc = async () => {
    if (!assignment) return;
    try {
      const studentName = isInstructorOrAdmin && instructorMode === "review" && selectedSubmission
        ? selectedSubmission.student_name
        : `${me?.first_name || ""} ${me?.last_name || ""}`.trim() || me?.username || "Student";

      const currentAnswers = isInstructorOrAdmin && instructorMode === "review" && selectedSubmission
        ? selectedSubmission.answers || {}
        : answers;

      const docChildren = [
        new Paragraph({
          text: course?.title || "STEM Course",
          spacing: { after: 80 }
        }),
        new Paragraph({
          text: docTitle || `${shortLesson || lesson?.title || "Lesson"} - Lesson Worksheet & Assignment`,
          heading: HeadingLevel.TITLE,
          spacing: { after: 120 }
        }),
        new Paragraph({
          text: assignment.description || "Complete your lesson writeup, circuit & code documentation, and reflections.",
          spacing: { after: 180 }
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "Lesson: ", bold: true }),
            new TextRun({ text: lesson?.title || "Lesson" }),
            new TextRun({ text: "   |   Author / Learner: ", bold: true }),
            new TextRun({ text: studentName }),
            new TextRun({ text: cohort?.name ? `   |   Cohort: ${cohort.name}` : "" }),
            new TextRun({ text: `   |   Date: ${new Date().toLocaleDateString()}` })
          ],
          spacing: { after: 200 }
        }),
        new Paragraph({
          text: "--------------------------------------------------------------------------------",
          spacing: { after: 200 }
        })
      ];

      (assignment.questions || []).forEach((q, idx) => {
        docChildren.push(
          new Paragraph({
            text: q.title || `Section ${idx + 1}`,
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 180, after: 80 }
          })
        );
        if (q.prompt) {
          docChildren.push(
            new Paragraph({
              children: [
                new TextRun({ text: q.prompt, italics: true, color: "444444" })
              ],
              spacing: { after: 120 }
            })
          );
        }

        if (q.type === "multiple_choice" && Array.isArray(q.options)) {
          q.options.forEach((opt, oIdx) => {
            const isSelected = currentAnswers[q.id] === opt.id || currentAnswers[q.id] === opt.text;
            const checkMark = isSelected ? "[X]" : "[  ]";
            const letter = (opt.id || String.fromCharCode(65 + oIdx)).toUpperCase();
            docChildren.push(
              new Paragraph({
                children: [
                  new TextRun({ text: `   ${checkMark}  ${letter}. `, bold: isSelected }),
                  new TextRun({ text: opt.text || "" })
                ],
                spacing: { after: 60 }
              })
            );
          });
          docChildren.push(new Paragraph({ text: "", spacing: { after: 140 } }));
        } else {
          const ansText = currentAnswers[q.id] || "[No response submitted]";
          docChildren.push(
            new Paragraph({
              text: ansText,
              spacing: { after: 200 }
            })
          );
        }
      });

      if (selectedSubmission?.status === "graded") {
        docChildren.push(
          new Paragraph({
            text: "Instructor Evaluation & Marks",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 250, after: 100 }
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "Score: ", bold: true }),
              new TextRun({ text: `${selectedSubmission.score} / ${assignment.max_score || 100}` }),
            ],
            spacing: { after: 100 }
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "Feedback: ", bold: true }),
              new TextRun({ text: selectedSubmission.feedback || "Evaluated." }),
            ],
            spacing: { after: 200 }
          })
        );
      }

      const doc = new Document({
        sections: [{ properties: {}, children: docChildren }]
      });

      const blob = await Packer.toBlob(doc);
      const safeTitle = (assignment.title || "Lesson_Assignment").replace(/[\s\W]+/g, "_");
      saveAs(blob, `${safeTitle}_${studentName.replace(/[\s\W]+/g, "_")}.docx`);
      toast.success("Microsoft Word document exported.");
    } catch (err) {
      console.error("Failed to generate docx:", err);
      toast.error("Could not export Word document.");
    }
  };

  if (loading) {
    return (
      <div className="py-16 text-center text-sm text-muted-foreground font-medium">
        Loading assignment worksheet...
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 sm:space-y-8 pb-24 font-sans print:p-0 print:max-w-none print:m-0">
      {/* High-fidelity Print & PDF CSS */}
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 12mm 15mm;
          }
          html, body {
            height: auto !important;
            overflow: visible !important;
            background: #ffffff !important;
            color: #000000 !important;
          }
          header, nav, aside, footer, [role="navigation"], .print\\:hidden, #site-header, #main-sidebar {
            display: none !important;
          }
          #printable-assignment-doc {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            color: #000000 !important;
            box-shadow: none !important;
            border: none !important;
          }
          .print-break-inside-avoid {
            break-inside: avoid;
            page-break-inside: avoid;
          }
        }
      `}</style>

      {/* Hidden File Input for Word / Excel import */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileImport}
        accept=".docx,.xlsx,.xls,.csv"
        className="hidden"
      />

      {/* Document Control Header - Strictly 1 firm single row */}
      <div className="bg-card border border-border rounded-xl px-3 py-2 sm:px-4 sm:py-2.5 shadow-xs print:hidden w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 w-full">
          {/* Left: Compact Title */}
          <div className="min-w-0 flex items-center gap-2 shrink">
            <h2 className="text-sm sm:text-base font-black text-foreground tracking-tight truncate">
              {docTitle}
            </h2>
            {isGraded && (
              <span className="px-2 py-0.5 rounded-md bg-emerald-600 text-white font-bold text-xs shadow-xs shrink-0">
                Graded: {mySubmission.score} / 100
              </span>
            )}
            {isSubmitted && !isGraded && (
              <span className="px-2 py-0.5 rounded-md bg-blue-600 text-white font-bold text-xs shadow-xs shrink-0">
                Submitted
              </span>
            )}
            {saving && (
              <span className="text-primary font-medium text-xs flex items-center gap-1 animate-pulse shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" /> Saving...
              </span>
            )}
            {isPendingAutosave && (
              <span className="text-amber-600 dark:text-amber-400 font-medium text-xs flex items-center gap-1 shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" /> Autosaving...
              </span>
            )}
          </div>

          {/* Right: All Actions - Strictly Top/Center Aligned on 1 Row */}
          <div className="flex items-center gap-1.5 flex-wrap shrink-0">
            {/* Instructor Mode Switcher: Preview, Submissions (0), Edit Questions */}
            {isInstructorOrAdmin && (
              <div className="inline-flex rounded-lg border border-border bg-muted/40 p-0.5 gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => setInstructorMode("preview")}
                  className={`px-2.5 py-1.5 rounded-md text-xs font-bold transition-colors text-center ${
                    instructorMode === "preview"
                      ? "bg-background text-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Preview
                </button>
                <button
                  type="button"
                  onClick={() => setInstructorMode("review")}
                  className={`px-2.5 py-1.5 rounded-md text-xs font-bold transition-colors text-center ${
                    instructorMode === "review"
                      ? "bg-background text-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Submissions ({allSubmissions.length})
                </button>
                <button
                  type="button"
                  onClick={() => setInstructorMode("edit")}
                  className={`px-2.5 py-1.5 rounded-md text-xs font-bold transition-colors text-center ${
                    instructorMode === "edit"
                      ? "bg-background text-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Edit Questions
                </button>
              </div>
            )}

            {/* AI Generate & Import (Instructor) */}
            {isInstructorOrAdmin && (
              <>
                <button
                  type="button"
                  onClick={handleGenerateWithAi}
                  disabled={generatingAi}
                  className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-bold shadow-xs transition-colors disabled:opacity-50 text-center shrink-0"
                >
                  {generatingAi ? "Generating..." : "AI Generate"}
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={importing}
                  className="px-2.5 py-1.5 rounded-lg border border-border bg-background hover:bg-muted text-xs font-semibold text-foreground transition-colors disabled:opacity-50 text-center shadow-xs shrink-0"
                >
                  {importing ? "Importing..." : "Import"}
                </button>
              </>
            )}

            {/* Export Word, Export PDF & Print */}
            <button
              type="button"
              onClick={handleExportWordDoc}
              className="px-2.5 py-1.5 rounded-lg border border-border bg-background hover:bg-muted text-xs font-semibold text-foreground transition-colors shadow-xs text-center shrink-0"
            >
              Export Word
            </button>
            <button
              type="button"
              onClick={handleExportPdf}
              disabled={exportingPdf}
              className="px-2.5 py-1.5 rounded-lg border border-border bg-background hover:bg-muted text-xs font-semibold text-foreground transition-colors shadow-xs text-center shrink-0 disabled:opacity-50"
            >
              {exportingPdf ? "Exporting PDF..." : "Export PDF"}
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="px-2.5 py-1.5 rounded-lg border border-border bg-background hover:bg-muted text-xs font-semibold text-foreground transition-colors shadow-xs text-center shrink-0"
            >
              Print
            </button>

            {/* Save (Ctrl+S) for Student / Preview */}
            {!isGraded && (
              <button
                type="button"
                onClick={() => saveDraft(answers, true)}
                disabled={saving || isPendingAutosave || (isInstructorOrAdmin && instructorMode !== "preview")}
                className="px-2.5 py-1.5 rounded-lg bg-muted hover:bg-muted/80 text-xs font-semibold text-foreground border border-border transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5 shadow-2xs shrink-0"
                title="Save (Ctrl+S)"
              >
                <svg className="w-3.5 h-3.5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
                {saving ? "Saving..." : isPendingAutosave ? "Autosaving..." : "Save"}
              </button>
            )}

            {/* Partner selector */}
            {cohort?.students && (
              <div className="flex items-center gap-1.5 pl-1 shrink-0">
                <span className="text-xs text-muted-foreground font-medium shrink-0">Partner:</span>
                <select
                  value={partnerStudentId}
                  onChange={(e) => setPartnerStudentId(e.target.value)}
                  disabled={isGraded || (isInstructorOrAdmin && instructorMode !== "preview")}
                  className="text-xs bg-background border border-border rounded-lg px-2 py-1 text-foreground"
                >
                  <option value="">Individual</option>
                  {cohort.students
                    .filter((s) => s.id !== me?.id)
                    .map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.full_name || `${s.first_name || ""} ${s.last_name || ""}`.trim() || s.username}
                      </option>
                    ))}
                </select>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Instructor Mode: Review / Grading Desk */}
      {isInstructorOrAdmin && instructorMode === "review" && (
        <div className="bg-card border border-border rounded-xl p-4 sm:p-5 shadow-xs space-y-4 print:hidden w-full">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h3 className="font-bold text-sm sm:text-base text-foreground">
              Student Submissions Review Desk
            </h3>

            {allSubmissions.length > 0 ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground font-semibold">Select Student:</span>
                <select
                  value={selectedStudentId || ""}
                  onChange={(e) => setSelectedStudentId(Number(e.target.value))}
                  className="text-xs font-semibold bg-background border border-border rounded-md px-2.5 py-1.5 text-foreground"
                >
                  {allSubmissions.map((sub) => (
                    <option key={sub.student_id} value={sub.student_id}>
                      {sub.student_name} ({sub.status === "graded" ? `Graded ${sub.score}/100` : sub.status})
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground italic">
                No student submissions received yet for this cohort.
              </p>
            )}
          </div>

          {selectedSubmission && (
            <form onSubmit={handleGradeSubmit} className="pt-3 border-t border-border grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="sm:col-span-1">
                <label className="block text-xs font-bold text-muted-foreground mb-1">
                  Grade Score (0-100)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={gradeScore}
                  onChange={(e) => setGradeScore(e.target.value)}
                  placeholder="e.g. 95"
                  className="w-full text-sm font-bold px-3 py-2 rounded-lg bg-background border border-border text-foreground"
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-muted-foreground mb-1">
                  Instructor Feedback &amp; Rubric Notes
                </label>
                <input
                  type="text"
                  value={gradeFeedback}
                  onChange={(e) => setGradeFeedback(e.target.value)}
                  placeholder="e.g. Thorough documentation, correct circuit connections, and sound analysis."
                  className="w-full text-sm px-3 py-2 rounded-lg bg-background border border-border text-foreground"
                />
              </div>

              <div className="sm:col-span-1 flex items-end">
                <button
                  type="submit"
                  disabled={grading}
                  className="w-full py-2 px-4 rounded-lg bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {grading ? "Saving..." : "Save Grade & Award XP"}
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Instructor Mode: Edit Assignment Structure & Questions */}
      {isInstructorOrAdmin && instructorMode === "edit" && (
        <form onSubmit={handleSaveAssignmentStructure} className="bg-card border border-border rounded-xl p-5 sm:p-6 shadow-xs space-y-6 print:hidden w-full">
          <div className="flex items-center justify-between gap-3 pb-3 border-b border-border">
            <div>
              <h3 className="font-bold text-base text-foreground">
                Edit Assignment &amp; Questions
              </h3>
              <p className="text-xs text-muted-foreground">
                Configure brief prompts and multiple-choice questions for all learners.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setInstructorMode("preview")}
                className="px-3 py-1.5 rounded-md border border-border text-xs font-semibold text-foreground hover:bg-muted"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={savingStructure}
                className="px-4 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 disabled:opacity-50"
              >
                {savingStructure ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>

          {/* General settings */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2 space-y-1">
              <label className="block text-xs font-bold text-foreground">Assignment Title</label>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full text-sm px-3 py-2 rounded-lg border border-border bg-background text-foreground"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-bold text-foreground">Max Score</label>
              <input
                type="number"
                min="10"
                max="500"
                value={editMaxScore}
                onChange={(e) => setEditMaxScore(e.target.value)}
                className="w-full text-sm px-3 py-2 rounded-lg border border-border bg-background text-foreground"
              />
            </div>
            <div className="sm:col-span-3 space-y-1">
              <label className="block text-xs font-bold text-foreground">Overview &amp; Purpose</label>
              <input
                type="text"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="Brief explanation of the task or brief."
                className="w-full text-sm px-3 py-2 rounded-lg border border-border bg-background text-foreground"
              />
            </div>
            <div className="sm:col-span-3 space-y-1">
              <label className="block text-xs font-bold text-foreground">Instructions for Students</label>
              <textarea
                rows={2}
                value={editInstructions}
                onChange={(e) => setEditInstructions(e.target.value)}
                placeholder="General student instructions."
                className="w-full text-sm p-3 rounded-lg border border-border bg-background text-foreground"
              />
            </div>
          </div>

          {/* Questions List */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Question Sections ({editQuestions.length})
              </h4>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleAddTextQuestion}
                  className="px-3 py-1 rounded-md border border-border bg-background hover:bg-muted text-xs font-bold text-foreground"
                >
                  + Add Open Text Section
                </button>
                <button
                  type="button"
                  onClick={handleAddMcqQuestion}
                  className="px-3 py-1 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-bold shadow-2xs"
                >
                  + Add Multiple Choice (MCQ)
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {editQuestions.map((q, idx) => {
                const isMcq = q.type === "multiple_choice";

                return (
                  <div key={q.id || idx} className="p-4 rounded-xl border border-border bg-muted/10 space-y-3">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-foreground">
                          Section {idx + 1}
                        </span>
                        {/* Question type switcher */}
                        <div className="inline-flex rounded-md border border-border bg-background p-0.5 text-[11px]">
                          <button
                            type="button"
                            onClick={() => handleToggleQuestionType(idx, "text")}
                            className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                              !isMcq ? "bg-muted text-foreground" : "text-muted-foreground"
                            }`}
                          >
                            Open Text
                          </button>
                          <button
                            type="button"
                            onClick={() => handleToggleQuestionType(idx, "multiple_choice")}
                            className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                              isMcq ? "bg-muted text-foreground" : "text-muted-foreground"
                            }`}
                          >
                            Multiple Choice
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleMoveQuestion(idx, -1)}
                          disabled={idx === 0}
                          className="px-2 py-0.5 rounded border border-border bg-background text-[11px] font-semibold text-foreground disabled:opacity-30"
                        >
                          Move Up
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveQuestion(idx, 1)}
                          disabled={idx === editQuestions.length - 1}
                          className="px-2 py-0.5 rounded border border-border bg-background text-[11px] font-semibold text-foreground disabled:opacity-30"
                        >
                          Move Down
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveQuestion(idx)}
                          className="px-2 py-0.5 rounded border border-red-500/20 bg-red-500/10 text-red-600 dark:text-red-400 text-[11px] font-semibold hover:bg-red-500/20"
                        >
                          Delete
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[11px] font-semibold text-muted-foreground">Section Title</label>
                      <input
                        type="text"
                        value={q.title || ""}
                        onChange={(e) => handleUpdateQuestion(idx, "title", e.target.value)}
                        placeholder="e.g. 1. Problem Statement"
                        className="w-full text-xs font-bold px-3 py-1.5 rounded-lg border border-border bg-background text-foreground"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[11px] font-semibold text-muted-foreground">Prompt / Question Guidelines</label>
                      <textarea
                        rows={2}
                        value={q.prompt || ""}
                        onChange={(e) => handleUpdateQuestion(idx, "prompt", e.target.value)}
                        placeholder="Explain what the learner must write or solve here..."
                        className="w-full text-xs p-2.5 rounded-lg border border-border bg-background text-foreground"
                      />
                    </div>

                    {/* Open text specific: placeholder */}
                    {!isMcq && (
                      <div className="space-y-1">
                        <label className="block text-[11px] font-semibold text-muted-foreground">Placeholder Text (Example / Hint)</label>
                        <input
                          type="text"
                          value={q.placeholder || ""}
                          onChange={(e) => handleUpdateQuestion(idx, "placeholder", e.target.value)}
                          placeholder="e.g. State the context, problem, and user..."
                          className="w-full text-xs px-3 py-1.5 rounded-lg border border-border bg-background text-foreground"
                        />
                      </div>
                    )}

                    {/* Multiple-choice specific: options list */}
                    {isMcq && (
                      <div className="space-y-3 pt-2 p-3 sm:p-4 rounded-xl border border-border bg-muted/30">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-foreground">
                            Choices (Select radio button for the correct key):
                          </span>
                          <button
                            type="button"
                            onClick={() => handleAddOption(idx)}
                            className="px-2.5 py-1 rounded-md bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-colors shadow-2xs"
                          >
                            + Add Option
                          </button>
                        </div>

                        <div className="space-y-2">
                          {(q.options || []).map((opt, oIdx) => {
                            const isCorrect = q.correct_option === opt.id;
                            const letter = (opt.id || String.fromCharCode(97 + oIdx)).toUpperCase();

                            return (
                              <div
                                key={opt.id || oIdx}
                                className={`flex items-center gap-2 p-2 rounded-xl border transition-all ${
                                  isCorrect
                                    ? "bg-emerald-600 border-emerald-600 text-white shadow-xs font-semibold"
                                    : "bg-background border-border text-foreground hover:bg-muted/40"
                                }`}
                              >
                                <label className="flex items-center gap-1.5 cursor-pointer shrink-0">
                                  <input
                                    type="radio"
                                    name={`correct_${q.id || idx}`}
                                    checked={isCorrect}
                                    onChange={() => handleSetCorrectOption(idx, opt.id)}
                                    className="cursor-pointer accent-white"
                                  />
                                  <span
                                    className={`text-xs font-black px-2 py-0.5 rounded-md ${
                                      isCorrect
                                        ? "bg-white text-emerald-950 shadow-2xs"
                                        : "bg-muted text-foreground font-bold"
                                    }`}
                                  >
                                    {letter}
                                  </span>
                                </label>

                                <input
                                  type="text"
                                  value={opt.text || ""}
                                  onChange={(e) => handleUpdateOption(idx, oIdx, "text", e.target.value)}
                                  placeholder={`Option ${letter} text`}
                                  className={`flex-1 text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                                    isCorrect
                                      ? "bg-white text-slate-900 border-white placeholder:text-slate-400 font-medium"
                                      : "bg-background border-border text-foreground"
                                  }`}
                                />

                                {(q.options || []).length > 2 && (
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveOption(idx, oIdx)}
                                    className={`text-xs px-2 py-1 rounded font-semibold transition-colors ${
                                      isCorrect
                                        ? "text-emerald-100 hover:text-white hover:bg-emerald-700"
                                        : "text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40"
                                    }`}
                                    title="Remove option"
                                  >
                                    Remove
                                  </button>
                                )}
                              </div>
                            );
                          })}
                        </div>

                        <div className="space-y-1 pt-1 border-t border-border/60">
                          <label className="block text-[11px] font-semibold text-muted-foreground">Explanation / Rubric Note</label>
                          <input
                            type="text"
                            value={q.explanation || ""}
                            onChange={(e) => handleUpdateQuestion(idx, "explanation", e.target.value)}
                            placeholder="Explanation of why the correct option is right."
                            className="w-full text-xs px-3 py-1.5 rounded-lg border border-border bg-background text-foreground"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="pt-2 flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleAddTextQuestion}
                  className="px-3.5 py-1.5 rounded-md border border-border bg-background hover:bg-muted text-xs font-bold text-foreground"
                >
                  + Add Text Section
                </button>
                <button
                  type="button"
                  onClick={handleAddMcqQuestion}
                  className="px-3.5 py-1.5 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-bold shadow-2xs"
                >
                  + Add Multiple Choice
                </button>
              </div>

              <button
                type="submit"
                disabled={savingStructure}
                className="px-5 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 disabled:opacity-50"
              >
                {savingStructure ? "Saving..." : "Save Assignment Changes"}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Main Document Paper Canvas (Printed directly or viewed on screen) */}
      {(!isInstructorOrAdmin || instructorMode !== "edit") && (
        <div
          id="printable-assignment-doc"
          ref={printableDocRef}
          className="bg-card border border-border rounded-2xl shadow-sm p-4 sm:p-10 space-y-8 w-full print:bg-white print:text-black print:border-none print:shadow-none print:p-0 print:m-0"
        >
          {/* Formal Document Title Header */}
          <div className="border-b-2 border-border/80 pb-6 space-y-3 text-center print:border-b-2 print:border-black print:pb-4">
            <p className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-muted-foreground print:text-black">
              {(course?.title || "AI Explorers (Ages 6-8) - Stage 1").replace(/[-–]/g, "-")}
            </p>
            <h1 className="text-2xl sm:text-4xl font-black text-foreground print:text-black tracking-tight leading-snug">
              {docTitle}
            </h1>
            {assignment?.description && (
              <p className="text-[11px] sm:text-sm md:text-base text-muted-foreground print:text-black leading-normal max-w-none text-center whitespace-nowrap overflow-hidden text-ellipsis px-1">
                {(assignment.description || "").replace(/[-–]/g, "-")}
              </p>
            )}

            <div className="pt-4 flex items-center justify-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground print:text-black font-semibold flex-wrap border-t border-border/60 print:border-gray-400">
              <span className="bg-muted/50 px-3 py-1 rounded-md"><strong>Lesson:</strong> {shortLesson}</span>
              <span className="bg-muted/50 px-3 py-1 rounded-md"><strong>Learner:</strong> {studentDisplayName}</span>
              {cohort?.name && (
                <span className="bg-muted/50 px-3 py-1 rounded-md"><strong>Cohort:</strong> {cohort.name}</span>
              )}
            </div>
          </div>

          {/* Question Sections */}
          <div className="space-y-6 sm:space-y-8">
            {(assignment?.questions || []).length === 0 ? (
              <div className="p-8 sm:p-12 text-center rounded-2xl border border-dashed border-border bg-muted/20 space-y-4 print:hidden">
                <div className="w-14 h-14 rounded-2xl bg-primary text-primary-foreground mx-auto flex items-center justify-center shadow-xs">
                  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="space-y-1.5">
                  <h4 className="font-extrabold text-base sm:text-xl text-foreground">
                    No Questions Yet
                  </h4>
                  <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
                    {isInstructorOrAdmin
                      ? "Add questions or generate with AI."
                      : "No questions assigned for this lesson yet."}
                  </p>
                </div>
                {isInstructorOrAdmin && (
                  <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2.5 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => setInstructorMode("edit")}
                      className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs sm:text-sm font-bold hover:bg-primary/90 transition-colors shadow-xs"
                    >
                      + Add Questions
                    </button>
                    <button
                      type="button"
                      onClick={handleGenerateWithAi}
                      disabled={generatingAi}
                      className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs sm:text-sm font-bold hover:bg-primary/90 transition-colors shadow-xs disabled:opacity-50"
                    >
                      {generatingAi ? "Generating..." : "AI Generate"}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              (assignment?.questions || []).map((q, idx) => {
              const answerText = displayAnswers[q.id] || "";
              const isMcq = q.type === "multiple_choice";
              const wordCount = !isMcq && answerText.trim() ? answerText.trim().split(/\s+/).length : 0;

              return (
                <div
                  key={q.id || idx}
                  className="print-break-inside-avoid print:break-inside-avoid p-4 sm:p-5 rounded-lg border border-border print:border-gray-300 bg-background print:bg-white space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1.5">
                      <h3 className="font-black text-lg sm:text-xl text-foreground print:text-black">
                        {q.title || `Section ${idx + 1}`}
                      </h3>
                      {q.prompt && (
                        <p className="text-sm sm:text-base text-muted-foreground print:text-black leading-relaxed font-normal">
                          {q.prompt}
                        </p>
                      )}
                    </div>
                    {!isMcq && (
                      <span className="text-xs sm:text-sm font-semibold text-muted-foreground tabular-nums shrink-0 print:hidden">
                        {wordCount} words
                      </span>
                    )}
                  </div>

                  {/* Multiple Choice rendering */}
                  {isMcq ? (
                    <div className="space-y-2 pt-1">
                      {/* Web View: Interactive Radio Cards */}
                      <div className="space-y-2 print:hidden">
                        {(q.options || []).map((opt, oIdx) => {
                          const isSelected = answerText === opt.id || answerText === opt.text;
                          const letter = (opt.id || String.fromCharCode(97 + oIdx)).toUpperCase();
                          const isKey = q.correct_option === opt.id;
                          const showGradingKey = isReviewingStudent || isGraded;

                          let stateClasses = "border-border bg-card hover:bg-muted/40 text-foreground";
                          let badgeClasses = "bg-muted text-foreground font-bold";

                          if (showGradingKey && isKey) {
                            stateClasses = "border-emerald-600 bg-emerald-600 text-white font-semibold shadow-xs";
                            badgeClasses = "bg-white text-emerald-950 font-black";
                          } else if (showGradingKey && isSelected && !isKey) {
                            stateClasses = "border-red-600 bg-red-600 text-white font-semibold shadow-xs";
                            badgeClasses = "bg-white text-red-950 font-black";
                          } else if (isSelected) {
                            stateClasses = "border-primary bg-primary text-primary-foreground font-semibold shadow-xs";
                            badgeClasses = "bg-white text-primary font-black";
                          }

                          return (
                            <label
                              key={opt.id || oIdx}
                              onClick={() => {
                                if (!isReadOnly) handleAnswerChange(q.id, opt.id);
                              }}
                              className={`flex items-start gap-3 p-3.5 rounded-xl border transition-all ${
                                isReadOnly ? "cursor-default" : "cursor-pointer"
                              } ${stateClasses}`}
                            >
                              <input
                                type="radio"
                                name={`mcq_${q.id}`}
                                checked={isSelected}
                                disabled={isReadOnly}
                                onChange={() => handleAnswerChange(q.id, opt.id)}
                                className="mt-1 cursor-pointer accent-white"
                              />
                              <div className="flex-1 text-sm sm:text-base leading-relaxed">
                                <span className={`mr-2.5 px-2 py-0.5 rounded text-xs sm:text-sm ${badgeClasses}`}>
                                  {letter}
                                </span>
                                <span>{opt.text}</span>
                                {showGradingKey && isKey && (
                                  <span className="ml-2 text-xs sm:text-sm font-black underline">
                                    (Correct Answer)
                                  </span>
                                )}
                              </div>
                            </label>
                          );
                        })}

                        {(isReviewingStudent || isGraded) && q.explanation && (
                          <p className="text-sm text-muted-foreground italic pt-1">
                            Note: {q.explanation}
                          </p>
                        )}

                        {!isReadOnly && (
                          <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/40 text-xs sm:text-sm">
                            <div className="flex items-center gap-2">
                              {saving ? (
                                <span className="text-primary text-xs sm:text-sm font-medium flex items-center gap-1.5">
                                  <span className="inline-block w-2 h-2 rounded-full bg-primary animate-pulse" />
                                  Saving...
                                </span>
                              ) : isPendingAutosave ? (
                                <span className="text-amber-600 dark:text-amber-400 text-xs sm:text-sm font-medium flex items-center gap-1.5">
                                  <span className="inline-block w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                                  Autosaving choice...
                                </span>
                              ) : lastSavedTime ? (
                                <span className="text-emerald-600 dark:text-emerald-400 text-xs sm:text-sm font-medium flex items-center gap-1.5">
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                  </svg>
                                  Choice saved at {lastSavedTime}
                                </span>
                              ) : (
                                <span className="text-xs sm:text-sm text-muted-foreground">
                                  Select an option to record response
                                </span>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={() => saveDraft(answers, true)}
                              disabled={saving || isPendingAutosave}
                              className="px-3.5 py-1.5 text-xs sm:text-sm font-bold rounded-lg border border-border bg-background hover:bg-muted text-foreground transition-colors disabled:opacity-50 flex items-center gap-1.5 shadow-2xs"
                              title="Save Draft (Ctrl+S)"
                            >
                              <svg className="w-3.5 h-3.5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                              </svg>
                              Save Draft
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Print View: Clean Circles for A4 Paper */}
                      <div className="hidden print:block space-y-1.5 pt-1">
                        {(q.options || []).map((opt, oIdx) => {
                          const isSelected = answerText === opt.id || answerText === opt.text;
                          const letter = (opt.id || String.fromCharCode(97 + oIdx)).toUpperCase();

                          return (
                            <div key={opt.id || oIdx} className="flex items-start gap-2 text-xs text-black">
                              <span className="font-mono text-xs">{isSelected ? "(●)" : "(  )"}</span>
                              <span className="font-bold">{letter}.</span>
                              <span>{opt.text}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    /* Open Text rendering */
                    <div>
                      {/* Web View: Writable Textarea */}
                      <textarea
                        rows={4}
                        value={answerText}
                        onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                        readOnly={isReadOnly}
                        disabled={false}
                        placeholder={
                          isReadOnly
                            ? "No response submitted."
                            : q.placeholder || "Type your response here..."
                        }
                        className={`w-full text-sm sm:text-base p-4 rounded-xl border border-input bg-card text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary resize-y leading-relaxed min-h-[140px] print:hidden ${
                          isReadOnly ? "bg-muted/30 text-muted-foreground cursor-default" : ""
                        }`}
                      />

                      {/* Question Answer Actions & Real-time Save Indicator */}
                      {!isReadOnly && (
                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/40 text-xs sm:text-sm print:hidden">
                          <div className="flex items-center gap-2">
                            {saving ? (
                              <span className="flex items-center gap-1.5 text-primary text-xs sm:text-sm font-medium animate-pulse">
                                <span className="inline-block w-2 h-2 rounded-full bg-primary" />
                                Saving draft...
                              </span>
                            ) : isPendingAutosave ? (
                              <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 text-xs sm:text-sm font-medium">
                                <span className="inline-block w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                                Autosaving in 2s...
                              </span>
                            ) : lastSavedTime ? (
                              <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-xs sm:text-sm font-medium">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                </svg>
                                Saved at {lastSavedTime}
                              </span>
                            ) : (
                              <span className="text-xs sm:text-sm text-muted-foreground font-medium">
                                Autosaves automatically as you type
                              </span>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={() => saveDraft(answers, true)}
                            disabled={saving || isPendingAutosave}
                            className="px-3.5 py-1.5 text-xs sm:text-sm font-bold rounded-lg border border-border bg-background hover:bg-muted text-foreground transition-colors disabled:opacity-50 flex items-center gap-1.5 shadow-2xs"
                            title="Save Draft (Ctrl+S)"
                          >
                            <svg className="w-3.5 h-3.5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                            </svg>
                            Save Draft
                          </button>
                        </div>
                      )}

                      {/* Print View: Complete text or ruled blank box */}
                      <div className="hidden print:block">
                        {answerText && answerText.trim() ? (
                          <div className="text-xs text-black border border-gray-300 rounded p-3 min-h-[60px] whitespace-pre-wrap leading-relaxed">
                            {answerText}
                          </div>
                        ) : (
                          <div className="border border-dashed border-gray-400 rounded p-3 min-h-[90px]">
                            <span className="text-[10px] text-gray-500 italic">
                              Learner Response / Solution Notes:
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            }))}
          </div>

          {/* Student Graded Review Notice */}
          {!isInstructorOrAdmin && isGraded && (
            <div className="p-4 rounded-lg border border-emerald-500/30 bg-emerald-500/5 space-y-1.5 print:border-gray-400 print:bg-white">
              <h4 className="font-bold text-xs sm:text-sm text-emerald-800 dark:text-emerald-300 print:text-black">
                Instructor Evaluation: {mySubmission.score} / 100
              </h4>
              {mySubmission.feedback && (
                <p className="text-xs text-foreground/80 print:text-black italic">
                  Feedback: "{mySubmission.feedback}"
                </p>
              )}
            </div>
          )}

          {/* Bottom Student Submission Bar */}
          {(!isInstructorOrAdmin || instructorMode === "preview") && !isGraded && (assignment?.questions || []).length > 0 && (
            <div className="pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 print:hidden">
              <div className="space-y-0.5">
                <p className="text-xs text-muted-foreground">
                  {isSubmitted
                    ? "Assignment submitted. You may update and resubmit prior to final evaluation."
                    : "Type your responses above. Work is autosaved automatically as you type."}
                </p>
                {lastSavedTime && (
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    All changes saved (last at {lastSavedTime})
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => saveDraft(answers, true)}
                  disabled={saving || isPendingAutosave}
                  className="flex-1 sm:flex-initial px-4 py-2 rounded-md border border-border bg-background hover:bg-muted text-xs font-semibold text-foreground transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
                  title="Save Draft (Ctrl+S)"
                >
                  <svg className="w-3.5 h-3.5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                  </svg>
                  {saving ? "Saving..." : isPendingAutosave ? "Autosaving..." : "Save Draft"}
                </button>
                <button
                  type="button"
                  onClick={handleSubmitAssignment}
                  disabled={submitting}
                  className="flex-1 sm:flex-initial px-5 py-2 rounded-md bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-colors disabled:opacity-50 shadow-xs flex items-center justify-center gap-1.5"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {submitting ? "Submitting..." : isSubmitted ? "Update Submission" : "Submit Assignment"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
