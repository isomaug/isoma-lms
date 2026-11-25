import React, { useState, useEffect } from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import DOMPurify from "dompurify";
import { marked } from "marked";
import {
  FaCheckCircle,
  FaTimesCircle,
  FaStar,
  FaChevronRight,
  FaChevronLeft,
  FaUndo,
  FaList,
  FaTrophy,
  FaBookOpen,
} from "react-icons/fa";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";

const playChoiceSound = () => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    if (ctx.state === "suspended") ctx.resume();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.12);
  } catch {
    // Audio feedback is optional.
  }
};

const playDuolingoPassSound = () => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    if (ctx.state === "suspended") ctx.resume();

    // Play celebratory Duolingo chord: C5 - E5 - G5 - C6
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, ctx.currentTime + index * 0.08);
      gain.gain.setValueAtTime(0.35, ctx.currentTime + index * 0.08);
      gain.gain.exponentialRampToValueAtTime(
        0.001,
        ctx.currentTime + index * 0.08 + 0.45
      );
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + index * 0.08);
      osc.stop(ctx.currentTime + index * 0.08 + 0.45);
    });
  } catch (e) {
    console.log("Audio not supported", e);
  }
};

const playDuolingoFailSound = () => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    if (ctx.state === "suspended") ctx.resume();

    // Play descending "tee tee" chord for failure: F4 - D4
    const notes = [349.23, 293.66];
    notes.forEach((freq, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, ctx.currentTime + index * 0.2);
      gain.gain.setValueAtTime(0.35, ctx.currentTime + index * 0.2);
      gain.gain.exponentialRampToValueAtTime(
        0.001,
        ctx.currentTime + index * 0.2 + 0.45
      );
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + index * 0.2);
      osc.stop(ctx.currentTime + index * 0.2 + 0.45);
    });
  } catch (e) {
    console.log("Audio not supported", e);
  }
};

const triggerHapticFeedback = () => {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    try {
      navigator.vibrate([100, 50, 100, 50, 150]);
    } catch {
      // Haptic feedback is optional.
    }
  }
};

export default function QuizPlayer({ quiz, courseSlug, onQuizSubmit, onReviewLesson }) {
  const [currentStep, setCurrentStep] = useState("start"); // start, question, review, result, answerReview
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({}); // { questionId: choiceId }
  const [result, setResult] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { width, height } = useWindowSize();
  const [showConfetti, setShowConfetti] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [reviewPage, setReviewPage] = useState(1);
  const [answerReviewPage, setAnswerReviewPage] = useState(1);
  const reviewPageSize = width < 768 ? 5 : 10;

  useEffect(() => {
    // Reset state when quiz changes
    setCurrentStep("start");
    setCurrentQuestionIndex(0);
    setAnswers({});
    setResult(null);
    setSubmitError("");
    setReviewPage(1);
    setAnswerReviewPage(1);
  }, [quiz]);

  const handleStart = () => {
    setCurrentStep("question");
  };

  const handleSelectChoice = (questionId, choiceId) => {
    playChoiceSound();
    setAnswers((prev) => ({
      ...prev,
      [questionId]: choiceId,
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      setCurrentStep("review");
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError("");
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(
        `/api/courses/${courseSlug}/quizzes/${quiz.id}/submit/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ answers }),
        }
      );

      const responseText = await response.text();
      let data = {};
      try {
        data = responseText ? JSON.parse(responseText) : {};
      } catch {
        data = {
          detail:
            "The server returned an unexpected error while submitting this quiz.",
        };
      }
      if (!response.ok) {
        throw new Error(
          data.detail || data.error || "The quiz could not be submitted."
        );
      }
      setResult(data);
      setCurrentStep("result");

      if (data.passed) {
        setShowConfetti(true);
        playDuolingoPassSound();
        triggerHapticFeedback();
        setTimeout(() => setShowConfetti(false), 5000);
      } else {
        playDuolingoFailSound();
        triggerHapticFeedback();
      }
    } catch (error) {
      console.error(error);
      setSubmitError(
        error.message || "Error submitting quiz. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStart = () => (
    <Motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col items-center justify-center min-h-[70vh] sm:min-h-[75vh] my-auto text-center max-w-2xl mx-auto px-4 py-8 font-['Inter',sans-serif] text-[14px]"
    >
      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-primary/10 rounded-2xl flex items-center justify-center mb-4 sm:mb-6 shrink-0 shadow-sm border border-primary/20">
        <FaStar className="text-3xl sm:text-4xl text-amber-500" />
      </div>
      <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold font-['Poppins',sans-serif] text-foreground mb-2 sm:mb-3 tracking-tight">
        {quiz.title}
      </h2>
      <p className="text-sm sm:text-base text-muted-foreground mb-8 leading-relaxed max-w-lg font-['Inter',sans-serif]">
        {quiz.description ||
          "Test your knowledge to earn XP and complete this section."}
      </p>
      <div className="w-full max-w-xl mx-auto flex flex-wrap items-center justify-around gap-3 sm:gap-6 text-[14px] font-['Inter',sans-serif] font-semibold text-foreground mb-8 bg-card border border-border/80 px-5 sm:px-6 py-4 rounded-xl shadow-md">
        <div className="flex items-center gap-1.5">
          <span className="text-muted-foreground font-normal">Questions: </span>
          <span className="font-bold text-foreground">
            {quiz.question_count || quiz.questions.length}
          </span>
        </div>
        <span className="text-muted-foreground/40 hidden xs:inline">•</span>
        <div className="flex items-center gap-1.5">
          <span className="text-muted-foreground font-normal">
            Passing Score:{" "}
          </span>
          <span className="font-bold text-foreground">
            {quiz.passing_score}%
          </span>
        </div>
        <span className="text-muted-foreground/40 hidden xs:inline">•</span>
        <div className="text-amber-500 font-bold flex items-center gap-1.5">
          <FaStar size={14} /> <span>+{quiz.points_reward} XP</span>
        </div>
      </div>
      <button
        onClick={handleStart}
        className="w-full sm:w-auto px-10 py-3.5 bg-primary text-primary-foreground font-bold text-sm sm:text-base rounded-xl shadow-xl hover:opacity-90 transition-all flex items-center justify-center gap-2 cursor-pointer"
      >
        Start Quiz <FaChevronRight size={14} />
      </button>
    </Motion.div>
  );

  const renderQuestion = () => {
    const q = quiz.questions[currentQuestionIndex];
    if (!q) return null;
    return (
      <div className="flex flex-col h-full max-w-3xl mx-auto px-4 py-3 font-['Inter',sans-serif] text-[14px]">
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-xs font-bold text-primary tracking-wider uppercase">
            Question {currentQuestionIndex + 1} of {quiz.questions.length}
          </span>
          <span className="text-xs font-semibold text-muted-foreground">
            {q.points} {q.points === 1 ? "Point" : "Points"}
          </span>
        </div>
        <div className="w-full bg-muted rounded-full h-1.5 mb-3 overflow-hidden">
          <div
            className="bg-primary h-full transition-all duration-300"
            style={{
              width: `${((currentQuestionIndex + 1) / quiz.questions.length) * 100}%`,
            }}
          />
        </div>
        <div className="prose prose-sm dark:prose-invert max-w-none mb-3 font-semibold text-foreground text-xs sm:text-sm md:text-base leading-snug">
          <div
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(marked(q.text)),
            }}
          />
        </div>
        <div className="space-y-2 flex-1 overflow-visible">
          {q.choices.map((choice) => {
            const isSelected = answers[q.id] === choice.id;
            return (
              <button
                key={choice.id}
                onClick={() => handleSelectChoice(q.id, choice.id)}
                className={`w-full p-3.5 rounded-xl text-left border transition-all flex items-center justify-between gap-3 text-xs sm:text-sm font-semibold cursor-pointer ${
                  isSelected
                    ? "border-primary bg-primary/10 text-foreground shadow-sm"
                    : "border-border bg-card text-foreground hover:bg-muted"
                }`}
              >
                <span className="leading-snug">{choice.text}</span>
                <div
                  className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full border flex items-center justify-center shrink-0 ${
                    isSelected
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-muted-foreground/40"
                  }`}
                >
                  {isSelected && (
                    <div className="w-2 h-2 rounded-full bg-primary-foreground" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
        <div className="flex justify-between items-center mt-4 p-3 border border-border bg-background/95 backdrop-blur-md sticky bottom-4 z-20 px-3 sm:px-4 rounded-2xl shadow-2xl w-full max-w-3xl mx-auto">
          <button
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            className="px-4 py-2.5 rounded-xl border border-border text-foreground hover:bg-muted text-xs font-bold disabled:opacity-40 transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <FaChevronLeft size={12} /> Previous
          </button>
          
          <button
            onClick={() => {
              if (onReviewLesson) onReviewLesson();
              else window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="px-4 py-2.5 font-bold rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-500 transition-all text-xs flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
          >
            <FaBookOpen size={12} /> <span className="hidden sm:inline">Review Lesson</span><span className="sm:hidden">Review</span>
          </button>

          <button
            onClick={handleNext}
            disabled={!answers[q.id]}
            className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow hover:opacity-90 disabled:opacity-40 transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            {currentQuestionIndex === quiz.questions.length - 1
              ? "Review Quiz"
              : "Next"}{" "}
            <FaChevronRight size={12} />
          </button>
        </div>
      </div>
    );
  };

  const renderReview = () => (
    <div className="flex flex-col h-full max-w-3xl mx-auto px-3 sm:px-4 py-3 font-['Inter',sans-serif] text-[14px] w-full max-w-full">
      <h3 className="text-lg sm:text-xl font-bold font-['Poppins',sans-serif] text-foreground mb-1">
        Review Your Answers
      </h3>
      <p className="mb-3 text-[14px] text-muted-foreground">
        Check your responses before submitting the quiz.
      </p>
      <div className="mb-3 flex items-center justify-between text-[14px]">
        <span className="font-semibold text-foreground">
          Answered {Object.keys(answers).length} of {quiz.questions.length}
        </span>
        <span className="text-muted-foreground">
          Page {reviewPage} of{" "}
          {Math.max(1, Math.ceil(quiz.questions.length / reviewPageSize))}
        </span>
      </div>
      <div className="space-y-2.5 flex-1 overflow-visible mb-3 w-full max-w-full">
        {quiz.questions
          .slice((reviewPage - 1) * reviewPageSize, reviewPage * reviewPageSize)
          .map((q, pageIndex) => {
            const idx = (reviewPage - 1) * reviewPageSize + pageIndex;
            const selectedChoiceId = answers[q.id];
            const selectedChoice = q.choices.find(
              (c) => c.id === selectedChoiceId
            );
            return (
              <div
                key={q.id}
                className="p-3 sm:p-3.5 bg-card border border-border rounded-xl flex items-start sm:items-center justify-between gap-3 text-[14px] w-full max-w-full overflow-hidden shadow-sm"
              >
                <div className="min-w-0 flex-1">
                  <span className="block break-words whitespace-normal text-[14px] font-bold text-foreground">
                    Q{idx + 1}: {q.text.replace(/<[^>]*>?/gm, "")}
                  </span>
                  <span className="mt-1 block break-words whitespace-normal text-[14px] text-muted-foreground">
                    Answer:{" "}
                    {selectedChoice ? selectedChoice.text : "Not answered"}
                  </span>
                </div>
                <button
                  onClick={() => {
                    setCurrentQuestionIndex(idx);
                    setCurrentStep("question");
                  }}
                  className="shrink-0 cursor-pointer rounded-lg bg-secondary px-3 py-1.5 text-[14px] font-semibold text-secondary-foreground hover:bg-secondary/80"
                >
                  Change
                </button>
              </div>
            );
          })}
      </div>
      {quiz.questions.length > reviewPageSize && (
        <div className="mb-3 flex items-center justify-center gap-2">
          <button
            type="button"
            disabled={reviewPage === 1}
            onClick={() => setReviewPage((page) => page - 1)}
            className="h-9 rounded-lg border border-border px-3 text-[14px] font-semibold disabled:opacity-40"
          >
            Previous
          </button>
          <button
            type="button"
            disabled={reviewPage * reviewPageSize >= quiz.questions.length}
            onClick={() => setReviewPage((page) => page + 1)}
            className="h-9 rounded-lg border border-border px-3 text-[14px] font-semibold disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
      {submitError && (
        <div className="mb-3 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-[14px] font-semibold text-destructive">
          {submitError}
        </div>
      )}
      <div className="flex justify-between items-center mt-4 p-3 border border-border bg-background/95 backdrop-blur-md sticky bottom-4 z-20 px-3 sm:px-4 rounded-2xl shadow-2xl w-full max-w-3xl mx-auto">
        <button
          onClick={() => setCurrentStep("question")}
          className="px-3.5 sm:px-4 py-2 rounded-xl border border-border text-foreground hover:bg-muted text-xs font-bold transition-colors cursor-pointer shrink-0"
        >
          Back to Questions
        </button>
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="px-5 sm:px-6 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-lg hover:opacity-90 transition-all flex items-center gap-2 cursor-pointer shrink-0"
        >
          {isSubmitting ? "Submitting..." : "Submit Quiz"}
        </button>
      </div>
    </div>
  );

  const renderResult = () => {
    if (!result) return null;
    const displayScore =
      result.score !== undefined
        ? result.score
        : result.score_percent !== undefined
          ? result.score_percent
          : result.passed
            ? quiz.passing_score || 100
            : 0;

    return (
      <Motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center min-h-[380px] text-center max-w-2xl mx-auto px-4 py-6 font-['Inter',sans-serif] text-[14px]"
      >
        {showConfetti && (
          <div className="fixed inset-0 pointer-events-none z-50">
            <Confetti
              width={width}
              height={height}
              recycle={false}
              numberOfPieces={350}
            />
          </div>
        )}

        {result.passed ? (
          <Motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 220, damping: 12 }}
            className="relative flex flex-col items-center mb-6"
          >
            <div className="w-24 h-24 sm:w-28 sm:h-28 bg-gradient-to-tr from-amber-500/20 via-yellow-400/20 to-amber-500/30 rounded-full flex items-center justify-center shadow-xl border-2 border-amber-400/60 relative">
              <FaTrophy className="text-5xl sm:text-6xl text-amber-500 drop-shadow-md animate-pulse" />
              {/* Popping Gold Stars around Trophy */}
              <Motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1.2 }}
                transition={{ delay: 0.3 }}
                className="absolute -top-2 -left-2 text-amber-400 text-2xl"
              >
                <FaStar />
              </Motion.div>
              <Motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1.4 }}
                transition={{ delay: 0.4 }}
                className="absolute -top-4 right-1 text-amber-400 text-3xl"
              >
                <FaStar />
              </Motion.div>
              <Motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1.2 }}
                transition={{ delay: 0.5 }}
                className="absolute -bottom-1 -right-2 text-amber-400 text-2xl"
              >
                <FaStar />
              </Motion.div>
            </div>
          </Motion.div>
        ) : (
          <Motion.div
            initial={{ x: -10 }}
            animate={{ x: [0, -10, 10, -10, 10, 0] }}
            transition={{ duration: 0.4 }}
            className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-4 shadow-sm border border-red-500/30"
          >
            <FaTimesCircle className="text-5xl text-red-500" />
          </Motion.div>
        )}

        {/* Beautiful Orange Score with Star */}
        <div className="flex items-center justify-center gap-2 mb-2">
          <FaStar className="text-amber-500 text-3xl sm:text-4xl animate-bounce" />
          <h2 className="text-4xl sm:text-5xl font-black font-['Poppins',sans-serif] text-amber-500 tracking-tight drop-shadow-sm">
            {displayScore}%
          </h2>
        </div>

        <h3 className="text-base sm:text-lg font-bold text-foreground/90 mb-4">
          {result.passed
            ? "Congratulations, you passed!"
            : `You need ${quiz.passing_score}% to pass.`}
        </h3>

        {result.xp_awarded > 0 && (
          <Motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-white px-5 py-2.5 rounded-xl font-extrabold text-sm shadow-md mb-6 flex items-center gap-2"
          >
            <FaStar className="animate-bounce" /> +{result.xp_awarded} XP
            Earned!
            <span className="text-[11px] font-normal opacity-90 border-l border-white/40 pl-2">
              {result.attempt_tier === "1st_attempt"
                ? "1st Attempt Bonus!"
                : result.attempt_tier === "2nd_attempt"
                  ? "2nd Attempt Bonus!"
                  : result.attempt_tier === "3rd_attempt"
                    ? "3rd Attempt Bonus!"
                    : "Retake Bonus!"}
            </span>
          </Motion.div>
        )}

        <div className="flex flex-col sm:flex-row justify-center gap-3 w-full">
          <button
            onClick={() => {
              setCurrentStep("start");
              setAnswers({});
              setCurrentQuestionIndex(0);
            }}
            className="px-5 py-2.5 font-bold rounded-xl bg-primary text-primary-foreground hover:opacity-90 transition-all text-xs flex items-center justify-center gap-2 cursor-pointer shadow-sm"
          >
            <FaUndo size={12} /> Retake Quiz
          </button>

          <button
            onClick={() => {
              if (onReviewLesson) onReviewLesson();
              else window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="px-5 py-2.5 font-bold rounded-xl bg-amber-500 hover:bg-amber-600 text-black transition-all text-xs flex items-center justify-center gap-2 cursor-pointer shadow-sm"
          >
            <FaBookOpen size={12} /> Review Lesson
          </button>

          <button
            onClick={() => setCurrentStep("answerReview")}
            className="px-5 py-2.5 font-bold rounded-xl bg-card border border-border text-foreground hover:bg-muted transition-all text-xs flex items-center justify-center gap-2 cursor-pointer shadow-sm"
          >
            <FaList size={12} /> Review Answers
          </button>

          {result.passed && onQuizSubmit && (
            <button
              onClick={() => onQuizSubmit(result)}
              className="px-6 py-2.5 font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-all text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              Continue to Next Lesson
            </button>
          )}
        </div>
      </Motion.div>
    );
  };

  const renderAnswerReview = () => {
    if (!result) return null;

    return (
      <div className="w-full max-w-4xl mx-auto py-4 px-2 sm:px-4 h-full flex flex-col font-['Inter',sans-serif] text-[14px] min-w-0 break-words">
        <div className="flex justify-between items-center mb-4 sm:mb-6 pb-3 sm:pb-4 border-b border-border">
          <h2 className="text-xl sm:text-2xl font-bold font-['Poppins',sans-serif] text-foreground">
            Answer Review
          </h2>
          <button
            onClick={() => setCurrentStep("result")}
            className="text-foreground/70 hover:text-foreground font-semibold text-xs sm:text-sm flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border/80 bg-card shadow-sm hover:bg-muted transition-colors cursor-pointer"
          >
            <FaChevronLeft size={12} /> Back to Score
          </button>
        </div>

        <div className="overflow-y-auto space-y-4 sm:space-y-6 pr-1 custom-scrollbar min-w-0 w-full">
          {quiz.questions
            .slice(
              (answerReviewPage - 1) * reviewPageSize,
              answerReviewPage * reviewPageSize
            )
            .map((q, pageIndex) => {
              const index = (answerReviewPage - 1) * reviewPageSize + pageIndex;
              const userAnswerId = answers[q.id];
              const correctAnswerId = result.correct_answers[q.id];
              const isCorrect =
                String(userAnswerId) === String(correctAnswerId);

              return (
                <div
                  key={q.id}
                  className="bg-card border border-border rounded-xl p-3.5 sm:p-6 shadow-sm overflow-hidden break-words min-w-0 w-full"
                >
                  <div className="flex items-start gap-2.5 sm:gap-3 mb-4 min-w-0 w-full">
                    <span
                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center text-white font-bold text-xs sm:text-sm shrink-0 ${isCorrect ? "bg-emerald-600" : "bg-destructive"}`}
                    >
                      {index + 1}
                    </span>
                    <div className="font-semibold text-foreground flex-1 min-w-0 break-words text-xs sm:text-sm md:text-base leading-relaxed">
                      <div
                        dangerouslySetInnerHTML={{
                          __html: DOMPurify.sanitize(marked(q.text)),
                        }}
                        className="prose dark:prose-invert prose-sm m-0 max-w-full overflow-x-auto [&>p:first-child]:mt-0 [&>p:last-child]:mb-0"
                      />
                    </div>
                  </div>

                  <div className="space-y-2.5 mb-4 min-w-0 w-full">
                    {q.choices.map((choice) => {
                      const isUserChoice =
                        String(choice.id) === String(userAnswerId);
                      const isActualCorrectChoice =
                        String(choice.id) === String(correctAnswerId);

                      let bgClass =
                        "bg-background border-border text-foreground/80";
                      let icon = null;

                      if (isActualCorrectChoice) {
                        bgClass =
                          "bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400";
                        icon = <FaCheckCircle className="text-emerald-500" />;
                      } else if (isUserChoice && !isCorrect) {
                        bgClass =
                          "bg-destructive/10 border-destructive text-destructive";
                        icon = <FaTimesCircle className="text-destructive" />;
                      }

                      return (
                        <div
                          key={choice.id}
                          className={`p-3 sm:p-4 rounded-xl border-2 flex items-start gap-2.5 sm:gap-3 ${bgClass} min-w-0 w-full overflow-hidden break-words flex-wrap sm:flex-nowrap`}
                        >
                          <div className="mt-0.5 shrink-0 text-sm sm:text-base">
                            {icon}
                          </div>
                          <div className="font-medium text-xs sm:text-sm flex-1 min-w-0 break-words leading-relaxed">
                            {choice.text}
                          </div>
                          {isUserChoice && (
                            <div className="mt-1 sm:mt-0 sm:ml-auto text-[10px] sm:text-xs font-bold uppercase tracking-wider opacity-90 px-2 py-0.5 rounded bg-muted/60 text-muted-foreground shrink-0">
                              Your Answer
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {result.explanations && result.explanations[q.id] && (
                    <div className="mt-3.5 p-3.5 sm:p-4 bg-muted/50 rounded-xl border border-border min-w-0 w-full overflow-hidden break-words">
                      <span className="font-bold text-xs sm:text-sm text-foreground/90 block mb-1">
                        Explanation:
                      </span>
                      <p className="text-foreground/80 text-xs sm:text-sm m-0 leading-relaxed break-words">
                        {result.explanations[q.id]}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
        </div>
        {quiz.questions.length > reviewPageSize && (
          <div className="mt-4 flex items-center justify-center gap-2">
            <button
              type="button"
              disabled={answerReviewPage === 1}
              onClick={() => setAnswerReviewPage((page) => page - 1)}
              className="h-10 rounded-lg border border-border px-4 text-[14px] font-semibold disabled:opacity-40"
            >
              Previous
            </button>
            <span className="text-[14px] text-muted-foreground">
              {answerReviewPage} /{" "}
              {Math.ceil(quiz.questions.length / reviewPageSize)}
            </span>
            <button
              type="button"
              disabled={
                answerReviewPage * reviewPageSize >= quiz.questions.length
              }
              onClick={() => setAnswerReviewPage((page) => page + 1)}
              className="h-10 rounded-lg border border-border px-4 text-[14px] font-semibold disabled:opacity-40"
            >
              Next
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full h-full min-h-[60vh] bg-background p-4 sm:p-6 md:p-8 flex flex-col justify-center items-center">
      <AnimatePresence mode="wait">
        {currentStep === "start" && renderStart()}
        {currentStep === "question" && renderQuestion()}
        {currentStep === "review" && renderReview()}
        {currentStep === "result" && renderResult()}
        {currentStep === "answerReview" && renderAnswerReview()}
      </AnimatePresence>
    </div>
  );
}
