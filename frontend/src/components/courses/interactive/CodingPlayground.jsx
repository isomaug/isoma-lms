import React, { useState, useEffect, useRef } from "react";
import { Maximize2, Minimize2, Download, Upload, Trash2, Folder, ExternalLink, Loader2, Copy, Check, Edit3, Save, School, Sparkles, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { apiFetch } from "@/api/client/apiClient";
import { Link } from "react-router-dom";

const PLAYGROUND_URLS = {
  scratchjr: "https://stackkidi.org/",
  scratch: "https://scratch.mit.edu/projects/editor/",
  makecode_microbit: "https://makecode.microbit.org/#",
  makecode_arcade: "https://arcade.makecode.com/#",
  wokwi_arduino: "https://wokwi.com/projects/new/arduino-uno",
  wokwi_esp32: "https://wokwi.com/projects/new/arduino-uno",
  tinkercad: "https://www.tinkercad.com/circuits",
};

const PLAYGROUND_NAMES = {
  scratchjr: "Stack KIDI Editor",
  scratch: "Scratch Block Editor",
  makecode_microbit: "Microsoft MakeCode for micro:bit",
  makecode_arcade: "Microsoft MakeCode Arcade",
  wokwi_arduino: "Wokwi Arduino Simulator",
  wokwi_esp32: "Wokwi Arduino Simulator",
  tinkercad: "Tinkercad Arduino Circuits",
  custom: "Custom Playground",
};

const TINKERCAD_URL = "https://www.tinkercad.com/circuits";
const WOKWI_ARDUINO_URL = "https://wokwi.com/projects/new/arduino-uno";

const MAKECODE_MICROBIT_URL = "https://makecode.microbit.org/#";
/** Self-hosted TurboWarp / scratch-gui when set; otherwise TurboWarp until that host is live. */
const SCRATCH_EMBED_URL =
  import.meta.env.VITE_SCRATCH_EMBED_URL || "https://turbowarp.org/editor";
const IFRAME_ALLOW =
  "accelerometer; autoplay; camera; clipboard-read; clipboard-write; encrypted-media; fullscreen; geolocation; gyroscope; hid; microphone; midi; serial; unload; usb; xr-spatial-tracking";

function ScratchCatMark({ size = 168 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 160 160"
      aria-hidden="true"
      className="scratch-cat-mark"
    >
      <style>
        {`
          .scratch-cat-mark { overflow: visible; }
          .scratch-cat-bob { transform-origin: 80px 92px; animation: scratch-bob 2.4s ease-in-out infinite; }
          .scratch-cat-ear-l { transform-origin: 42px 38px; animation: scratch-ear-l 2.4s ease-in-out infinite; }
          .scratch-cat-ear-r { transform-origin: 118px 38px; animation: scratch-ear-r 2.4s ease-in-out infinite; }
          .scratch-cat-lid { transform-origin: center; animation: scratch-blink 3.2s ease-in-out infinite; }
          @keyframes scratch-bob {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-7px); }
          }
          @keyframes scratch-ear-l {
            0%, 100% { transform: rotate(0deg); }
            50% { transform: rotate(-8deg); }
          }
          @keyframes scratch-ear-r {
            0%, 100% { transform: rotate(0deg); }
            50% { transform: rotate(8deg); }
          }
          @keyframes scratch-blink {
            0%, 88%, 100% { transform: scaleY(1); }
            92% { transform: scaleY(0.08); }
          }
        `}
      </style>
      <g className="scratch-cat-bob">
        <ellipse cx="80" cy="108" rx="46" ry="32" fill="#FF8C1A" />
        <ellipse cx="80" cy="114" rx="28" ry="18" fill="#FFD36A" />
        <circle cx="80" cy="68" r="42" fill="#FF8C1A" />
        <path className="scratch-cat-ear-l" d="M28 58 L42 18 L62 48 Z" fill="#FF8C1A" />
        <path className="scratch-cat-ear-l" d="M36 52 L44 28 L56 48 Z" fill="#FFB347" />
        <path className="scratch-cat-ear-r" d="M132 58 L118 18 L98 48 Z" fill="#FF8C1A" />
        <path className="scratch-cat-ear-r" d="M124 52 L116 28 L104 48 Z" fill="#FFB347" />
        <ellipse cx="64" cy="66" rx="11" ry="13" fill="#fff" />
        <ellipse cx="96" cy="66" rx="11" ry="13" fill="#fff" />
        <g className="scratch-cat-lid">
          <ellipse cx="64" cy="67" rx="5" ry="7" fill="#2D2D2D" />
          <ellipse cx="96" cy="67" rx="5" ry="7" fill="#2D2D2D" />
          <circle cx="66" cy="65" r="2" fill="#fff" />
          <circle cx="98" cy="65" r="2" fill="#fff" />
        </g>
        <ellipse cx="80" cy="82" rx="7" ry="5" fill="#E36B00" />
        <path d="M80 86 Q68 96 58 90" fill="none" stroke="#2D2D2D" strokeWidth="2.2" strokeLinecap="round" />
        <path d="M80 86 Q92 96 102 90" fill="none" stroke="#2D2D2D" strokeWidth="2.2" strokeLinecap="round" />
        <circle cx="38" cy="118" r="11" fill="#FF8C1A" />
        <circle cx="122" cy="118" r="11" fill="#FF8C1A" />
      </g>
    </svg>
  );
}

function Scratch3Launch({ url }) {
  const openEditor = () => window.open(url, "_blank", "noopener,noreferrer");
  return (
    <button
      type="button"
      onClick={openEditor}
      className="w-full h-full min-h-0 rounded-lg border-0 bg-[#4D97FF] hover:bg-[#3d86ee] text-white flex flex-col items-center justify-center gap-4 px-6 transition-colors"
    >
      <ScratchCatMark />
      <span className="text-lg sm:text-xl font-black uppercase tracking-wide">Scratch 3.0</span>
      <span className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wide bg-white text-[#4D97FF] px-5 py-2.5 rounded-md">
        <ExternalLink size={16} /> Open editor
      </span>
    </button>
  );
}

function MakeCodeBoard({ size = 168 }) {
  const heart = new Set([
    "1,0",
    "3,0",
    "0,1",
    "1,1",
    "2,1",
    "3,1",
    "4,1",
    "0,2",
    "1,2",
    "2,2",
    "3,2",
    "4,2",
    "1,3",
    "2,3",
    "3,3",
    "2,4",
  ]);
  const leds = [];
  for (let y = 0; y < 5; y += 1) {
    for (let x = 0; x < 5; x += 1) {
      const on = heart.has(`${x},${y}`);
      leds.push(
        <circle
          key={`${x}-${y}`}
          cx={40 + x * 20}
          cy={48 + y * 18}
          r="5.5"
          fill={on ? "#FF3B30" : "#2A2A2A"}
          className={on ? "makecode-led" : undefined}
          style={on ? { animationDelay: `${(x + y) * 0.1}s` } : undefined}
        />,
      );
    }
  }
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 160 160"
      aria-hidden="true"
      className="makecode-board"
    >
      <style>
        {`
          .makecode-board { overflow: visible; }
          .makecode-bob { transform-origin: 80px 88px; animation: makecode-bob 2.4s ease-in-out infinite; }
          .makecode-led { animation: makecode-pulse 1.6s ease-in-out infinite; }
          @keyframes makecode-bob {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-7px); }
          }
          @keyframes makecode-pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.22; }
          }
        `}
      </style>
      <g className="makecode-bob">
        <rect x="62" y="14" width="36" height="12" rx="3" fill="#C8CCD0" />
        <rect x="18" y="24" width="124" height="116" rx="16" fill="#1A1A1A" />
        <rect x="26" y="32" width="108" height="100" rx="12" fill="#111111" />
        {leds}
        <circle cx="40" cy="128" r="9" fill="#D8D8D8" />
        <text x="40" y="132" textAnchor="middle" fontSize="9" fontWeight="700" fill="#222">A</text>
        <circle cx="120" cy="128" r="9" fill="#D8D8D8" />
        <text x="120" y="132" textAnchor="middle" fontSize="9" fontWeight="700" fill="#222">B</text>
      </g>
    </svg>
  );
}

function MakeCodeLaunch({ url, label = "MakeCode micro:bit" }) {
  const openEditor = () => window.open(url, "_blank", "noopener,noreferrer");
  return (
    <button
      type="button"
      onClick={openEditor}
      className="w-full h-full min-h-0 rounded-lg border-0 bg-[#FF8C00] hover:bg-[#e07d00] text-white flex flex-col items-center justify-center gap-4 px-6 transition-colors"
    >
      <MakeCodeBoard />
      <span className="text-lg sm:text-xl font-black uppercase tracking-wide">{label}</span>
      <span className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wide bg-white text-[#FF8C00] px-5 py-2.5 rounded-md">
        <ExternalLink size={16} /> Open editor
      </span>
    </button>
  );
}

function ArduinoUnoBoard({ size = 188 }) {
  return (
    <svg
      width={size}
      height={Math.round(size * 0.72)}
      viewBox="0 0 220 158"
      aria-hidden="true"
      className="arduino-board"
    >
      <style>
        {`
          .arduino-board { overflow: visible; }
          .arduino-bob { transform-origin: 110px 80px; animation: arduino-bob 2.4s ease-in-out infinite; }
          .arduino-led { animation: arduino-blink 1.2s steps(2) infinite; }
          .arduino-pwr { animation: arduino-pulse 1.8s ease-in-out infinite; }
          @keyframes arduino-bob {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-6px); }
          }
          @keyframes arduino-blink {
            0%, 49% { opacity: 1; }
            50%, 100% { opacity: 0.15; }
          }
          @keyframes arduino-pulse {
            0%, 100% { opacity: 0.55; }
            50% { opacity: 1; }
          }
        `}
      </style>
      <g className="arduino-bob">
        <rect x="18" y="18" width="184" height="122" rx="10" fill="#008184" />
        <rect x="24" y="24" width="172" height="110" rx="7" fill="#00979D" />
        <rect x="4" y="58" width="28" height="22" rx="3" fill="#C8CCD0" />
        <rect x="8" y="62" width="16" height="14" rx="1" fill="#2D2D2D" />
        <rect x="178" y="64" width="28" height="18" rx="6" fill="#1A1A1A" />
        <rect x="72" y="48" width="56" height="44" rx="3" fill="#111111" />
        <text x="100" y="74" textAnchor="middle" fontSize="8" fontWeight="700" fill="#E8E8E8">
          ATmega
        </text>
        <circle className="arduino-pwr" cx="46" cy="40" r="5" fill="#22C55E" />
        <circle className="arduino-led" cx="62" cy="40" r="5" fill="#F97316" />
        <rect x="36" y="108" width="148" height="10" rx="1" fill="#111111" />
        <rect x="36" y="122" width="148" height="6" rx="1" fill="#111111" />
      </g>
    </svg>
  );
}

function ArduinoLaunch({ url, label = "Wokwi Arduino" }) {
  const openEditor = () => window.open(url, "_blank", "noopener,noreferrer");
  return (
    <button
      type="button"
      onClick={openEditor}
      className="w-full h-full min-h-0 rounded-lg border-0 bg-[#008184] hover:bg-[#006f72] text-white flex flex-col items-center justify-center gap-4 px-6 transition-colors"
    >
      <ArduinoUnoBoard />
      <span className="text-lg sm:text-xl font-black uppercase tracking-wide">{label}</span>
      <span className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wide bg-white text-[#008184] px-5 py-2.5 rounded-md">
        <ExternalLink size={16} /> Open editor
      </span>
    </button>
  );
}

function TinkercadClassroomLaunch({
  cohort,
  me,
  isInstructorOrAdmin,
  onCohortUpdated,
  url = TINKERCAD_URL,
}) {
  const [copiedName, setCopiedName] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [isEditingCode, setIsEditingCode] = useState(false);
  const [inputCode, setInputCode] = useState(cohort?.tinkercad_class_code || "");
  const [savingCode, setSavingCode] = useState(false);
  const [uploadingRoster, setUploadingRoster] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    setInputCode(cohort?.tinkercad_class_code || "");
  }, [cohort?.tinkercad_class_code]);

  const rawCode = (cohort?.tinkercad_class_code || "").trim();
  const hasClassCode = Boolean(rawCode);

  const studentFullName = (() => {
    if (!me) return "Student";
    const full = `${me.first_name || ""} ${me.last_name || ""}`.trim();
    if (full) return full;
    if (me.full_name) return me.full_name.trim();
    if (me.username && !me.username.includes("@")) return me.username;
    if (me.email) {
      const raw = me.email.split("@")[0].replace(/[._+\-]+/g, " ");
      const formatted = raw
        .split(" ")
        .filter(Boolean)
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(" ");
      if (formatted) return formatted;
    }
    return me.username || "Student";
  })();

  const studentNickname = cohort?.my_tinkercad_nickname || studentFullName;

  const cleanCode =
    rawCode.startsWith("http://") || rawCode.startsWith("https://")
      ? rawCode.split("/").filter(Boolean).pop().replace(/[\s\-_]+/g, "").toUpperCase()
      : rawCode.replace(/[\s\-_]+/g, "").toUpperCase();

  const joinUrl = (() => {
    if (!rawCode) return TINKERCAD_URL;
    if (rawCode.startsWith("http://") || rawCode.startsWith("https://")) return rawCode;
    return `https://www.tinkercad.com/joinclass/${cleanCode}`;
  })();

  const handleCopy = (text, type) => {
    if (!text) return;
    try {
      navigator.clipboard.writeText(text);
      if (type === "name") {
        setCopiedName(true);
        setTimeout(() => setCopiedName(false), 2000);
        toast.success(`Copied nickname "${text}" to clipboard!`);
      } else {
        setCopiedCode(true);
        setTimeout(() => setCopiedCode(false), 2000);
        toast.success(`Copied class code "${text}" to clipboard!`);
      }
    } catch {
      toast.error("Failed to copy to clipboard");
    }
  };

  const handleJoinClass = () => {
    if (hasClassCode) {
      try {
        navigator.clipboard.writeText(studentNickname);
        setCopiedName(true);
        setTimeout(() => setCopiedName(false), 2500);
      } catch {}
      toast.success(`Copied "${studentNickname}" to clipboard! Paste your nickname in Tinkercad.`);
      window.open(joinUrl, "_blank", "noopener,noreferrer");
    } else {
      window.open(TINKERCAD_URL, "_blank", "noopener,noreferrer");
    }
  };

  const handleSaveCode = async (e) => {
    e.preventDefault();
    if (!cohort?.id) {
      toast.error("No active cohort found to update.");
      return;
    }
    setSavingCode(true);
    try {
      let res = await apiFetch(`/api/courses/cohorts/${cohort.id}/tinkercad/`, {
        method: "POST",
        body: JSON.stringify({ tinkercad_class_code: inputCode.trim() }),
      });
      if (!res.ok && (res.status === 404 || res.status === 405)) {
        res = await apiFetch(`/api/admin/cohorts/${cohort.id}/`, {
          method: "PATCH",
          body: JSON.stringify({ tinkercad_class_code: inputCode.trim() }),
        });
      }
      if (res.ok) {
        const data = await res.json().catch(() => ({}));
        toast.success("Tinkercad Classroom code updated!");
        setIsEditingCode(false);
        onCohortUpdated?.({
          id: cohort.id,
          tinkercad_class_code: data.tinkercad_class_code || inputCode.trim(),
          tinkercad_roster: data.tinkercad_roster || cohort.tinkercad_roster,
        });
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.error || "Failed to update class code.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error while updating class code.");
    } finally {
      setSavingCode(false);
    }
  };

  const handleUploadRosterPdf = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      toast.error("Please upload a PDF file exported from Tinkercad.");
      return;
    }
    if (!cohort?.id) {
      toast.error("No active cohort found to update.");
      return;
    }
    setUploadingRoster(true);
    try {
      const formData = new FormData();
      formData.append("roster_pdf", file);
      const res = await apiFetch(`/api/courses/cohorts/${cohort.id}/tinkercad-roster-upload/`, {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        toast.success(data.message || `Roster uploaded! Found ${data.roster?.count || 0} students.`);
        if (data.class_code) {
          setInputCode(data.class_code);
        }
        onCohortUpdated?.({
          id: cohort.id,
          tinkercad_class_code: data.class_code || cohort.tinkercad_class_code,
          tinkercad_roster: data.roster || cohort.tinkercad_roster,
        });
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.error || "Failed to extract Tinkercad roster from PDF.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error while uploading roster PDF.");
    } finally {
      setUploadingRoster(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="w-full min-h-[480px] bg-gradient-to-b from-slate-950 via-zinc-900 to-black text-white p-4 sm:p-6 flex flex-col items-center justify-center">
      <input
        type="file"
        ref={fileInputRef}
        accept=".pdf"
        className="hidden"
        onChange={handleUploadRosterPdf}
      />
      <div className="w-full max-w-lg mx-auto flex flex-col my-auto py-2">
        {hasClassCode ? (
          <div className="w-full p-4 sm:p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800 shadow-2xl space-y-3.5">
            {/* Header */}
            <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-zinc-800">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-[#FF6A13]/20 text-[#FF6A13] flex items-center justify-center shrink-0">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-xs sm:text-sm font-black text-white truncate">
                    Tinkercad Circuits
                  </h3>
                  {cohort?.name && (
                    <p className="text-[10.5px] text-zinc-400 truncate max-w-xs">{cohort.name}</p>
                  )}
                </div>
              </div>
              {isInstructorOrAdmin && (
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingRoster}
                    title="Upload student roster PDF exported from Tinkercad to automatically link student nicknames"
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-[11px] font-bold border border-zinc-700 transition-colors disabled:opacity-50"
                  >
                    {uploadingRoster ? <Loader2 className="w-3 h-3 animate-spin text-[#FF8533]" /> : <Upload className="w-3 h-3 text-[#FF8533]" />}
                    <span>{uploadingRoster ? "Parsing..." : "Upload Roster PDF"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditingCode((v) => !v)}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-[11px] font-bold border border-zinc-700 transition-colors"
                  >
                    <Edit3 className="w-3 h-3 text-[#FF8533]" />
                    <span>Edit Code</span>
                  </button>
                </div>
              )}
            </div>

            {/* Inline Instructor Code Editor */}
            {isEditingCode && (
              <form
                onSubmit={handleSaveCode}
                className="p-3 rounded-xl bg-zinc-950/80 border border-[#FF6A13]/40 space-y-2 text-left"
              >
                <div className="flex items-center justify-between">
                  <label className="block text-[10.5px] font-bold text-zinc-300">
                    Change Classroom Code / URL
                  </label>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-[10px] text-[#FF8533] hover:underline font-bold"
                  >
                    Or upload Roster PDF →
                  </button>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={inputCode}
                    onChange={(e) => setInputCode(e.target.value)}
                    placeholder="e.g. DDX4D5SQX or https://www.tinkercad.com/joinclass/..."
                    className="flex-1 px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#FF6A13]"
                    autoFocus
                  />
                  <button
                    type="submit"
                    disabled={savingCode}
                    className="px-3 py-1.5 rounded-lg bg-[#FF6A13] hover:bg-[#E05300] text-white text-xs font-bold disabled:opacity-50"
                  >
                    {savingCode ? "..." : "Save"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditingCode(false)}
                    className="px-2.5 py-1.5 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white text-xs font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {/* Code & Nickname Minimalist Pills */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left">
              {/* Classroom Code */}
              <div className="p-2.5 rounded-xl bg-zinc-950/80 border border-zinc-800 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <span className="block text-[9px] font-extrabold uppercase tracking-wider text-zinc-400">
                    Class Code
                  </span>
                  <span className="font-mono font-black text-xs sm:text-sm text-[#FF8533] tracking-wide truncate block">
                    {cleanCode || rawCode}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(cleanCode || rawCode, "code")}
                  title="Copy Classroom Code"
                  className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors shrink-0"
                >
                  {copiedCode ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>

              {/* Student Nickname */}
              <div className="p-2.5 rounded-xl bg-zinc-950/80 border border-zinc-800 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <span className="block text-[9px] font-extrabold uppercase tracking-wider text-zinc-400 flex items-center gap-1">
                    Your Nickname
                    {cohort?.my_tinkercad_nickname && (
                      <span className="text-[8px] bg-emerald-500/20 text-emerald-400 px-1 rounded font-bold">Roster</span>
                    )}
                  </span>
                  <span className="font-extrabold text-xs sm:text-sm text-white truncate block" title={studentNickname}>
                    {studentNickname}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(studentNickname, "name")}
                  title="Copy Student Nickname"
                  className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors shrink-0"
                >
                  {copiedName ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>

            {/* Single Action Button */}
            <div className="pt-1 space-y-1.5">
              <button
                type="button"
                onClick={handleJoinClass}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 sm:py-3 rounded-xl bg-gradient-to-r from-[#FF6A13] to-[#E05300] hover:from-[#FF7A29] hover:to-[#EF5E0C] text-white font-extrabold text-xs sm:text-sm shadow-lg shadow-[#FF6A13]/25 hover:shadow-xl hover:shadow-[#FF6A13]/40 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <span>Join Tinkercad Class</span>
                <ExternalLink className="w-4 h-4" />
              </button>
              <p className="text-[10.5px] text-zinc-400 text-center">
                ✨ Copies &quot;<strong className="text-zinc-200">{studentNickname}</strong>&quot; → click &quot;Join with Nickname&quot; &amp; paste.
              </p>
            </div>

            {/* Footer Workspace Link */}
            <div className="pt-1 flex items-center justify-center text-[11px] text-zinc-500">
              <button
                type="button"
                onClick={() => window.open(TINKERCAD_URL, "_blank", "noopener,noreferrer")}
                className="hover:text-zinc-300 underline underline-offset-2 transition-colors"
              >
                Or open personal Tinkercad workspace
              </button>
            </div>
          </div>
        ) : (
          /* Empty state - minimal */
          <div className="w-full max-w-sm mx-auto p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800 text-center space-y-3">
            <div className="w-9 h-9 rounded-full bg-[#008184]/20 text-[#00A896] flex items-center justify-center mx-auto">
              <School className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-white">
                {isInstructorOrAdmin ? "No Class Code Set" : "Tinkercad Circuits"}
              </h3>
              <p className="text-[11px] text-zinc-400 mt-1">
                {isInstructorOrAdmin
                  ? "Upload your Tinkercad PDF roster or set class code for 1-click student access."
                  : "Practice circuits on the open Tinkercad workspace."}
              </p>
            </div>
            <div className="pt-1 flex flex-col sm:flex-row items-center justify-center gap-2">
              {isInstructorOrAdmin ? (
                <>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingRoster}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs shadow-md transition-all border border-zinc-700 disabled:opacity-50"
                  >
                    {uploadingRoster ? <Loader2 className="w-3.5 h-3.5 animate-spin text-[#FF8533]" /> : <Upload className="w-3.5 h-3.5 text-[#FF8533]" />}
                    <span>Upload Roster PDF</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditingCode(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#FF6A13] hover:bg-[#E05300] text-white font-bold text-xs shadow-md transition-all"
                  >
                    <Edit3 className="w-3.5 h-3.5" /> Set Class Code
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => window.open(TINKERCAD_URL, "_blank", "noopener,noreferrer")}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#008184] hover:bg-[#006f72] text-white font-bold text-xs shadow-md transition-all"
                >
                  <span>Open Tinkercad Circuits</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function RealFolderIcon({ size = 28 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 26"
      fill="none"
      aria-hidden="true"
      className="shrink-0"
    >
      <path
        d="M1.5 7.2C1.5 5.6 2.8 4.4 4.4 4.4h7.1l1.6 1.7h14.5c1.6 0 2.9 1.3 2.9 2.9v12.3c0 1.6-1.3 2.9-2.9 2.9H4.4c-1.6 0-2.9-1.3-2.9-2.9V7.2z"
        fill="#E9B949"
      />
      <path
        d="M1.5 10.2h29v10.1c0 1.6-1.3 2.9-2.9 2.9H4.4c-1.6 0-2.9-1.3-2.9-2.9V10.2z"
        fill="#F6D36B"
      />
      <path
        d="M4.2 4.4h7.4c.3 0 .6.1.8.3l1.3 1.4H4.8c-.9 0-1.6-.7-1.6-1.6 0-.1.4-.1 1-.1z"
        fill="#D4A017"
      />
    </svg>
  );
}

function isYears1to2(course) {
  const blob = `${course?.title || ""} ${course?.slug || ""}`.toLowerCase();
  return /\bstage[\s-]*[12]\b/.test(blob) || /\byear[\s-]*[12]\b/.test(blob);
}

function isYears3to4(course) {
  const blob = `${course?.title || ""} ${course?.slug || ""}`.toLowerCase();
  return /\bstage[\s-]*[34]\b/.test(blob) || /\byear[\s-]*[34]\b/.test(blob);
}

function isYears5to6(course) {
  const blob = `${course?.title || ""} ${course?.slug || ""}`.toLowerCase();
  return /\bstage[\s-]*[56]\b/.test(blob) || /\byear[\s-]*[56]\b/.test(blob);
}

export default function CodingPlayground({
  lesson,
  courseSlug,
  course,
  cohort,
  me,
  isInstructorOrAdmin,
  onCohortUpdated,
}) {
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [projects, setProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedTool, setSelectedTool] = useState("makecode");
  const containerRef = useRef(null);

  const showJuniorChooser =
    isYears1to2(course) ||
    (!isYears3to4(course) && !isYears5to6(course) && lesson?.playground_type === "scratchjr");
  const showArduinoChooser =
    isYears5to6(course) ||
    lesson?.playground_type === "tinkercad" ||
    lesson?.playground_type === "wokwi_arduino" ||
    lesson?.playground_type === "wokwi_esp32";
  const showSeniorChooser =
    !showArduinoChooser &&
    (isYears3to4(course) || lesson?.playground_type === "makecode_microbit");
  const showChooser = showJuniorChooser || showSeniorChooser || showArduinoChooser;

  useEffect(() => {
    if (showJuniorChooser) setSelectedTool("scratchjr");
    else if (showArduinoChooser) setSelectedTool("tinkercad");
    else setSelectedTool("makecode");
  }, [lesson?.id, showJuniorChooser, showArduinoChooser]);

  const activeType = showJuniorChooser
    ? selectedTool === "scratch"
      ? "scratch"
      : "scratchjr"
    : showArduinoChooser
    ? selectedTool === "wokwi"
      ? "wokwi_arduino"
      : "tinkercad"
    : showSeniorChooser
    ? selectedTool === "scratch"
      ? "scratch"
      : "makecode_microbit"
    : lesson?.playground_type;

  const embedUrl =
    activeType === "custom"
      ? lesson?.playground_custom_url
      : activeType === "scratch"
      ? SCRATCH_EMBED_URL
      : activeType === "makecode_microbit"
      ? MAKECODE_MICROBIT_URL
      : activeType === "tinkercad"
      ? TINKERCAD_URL
      : activeType === "wokwi_arduino" || activeType === "wokwi_esp32"
      ? WOKWI_ARDUINO_URL
      : PLAYGROUND_URLS[activeType] || PLAYGROUND_URLS.scratchjr;

  const openUrl = activeType === "scratch" ? SCRATCH_EMBED_URL : embedUrl;
  const editorName = PLAYGROUND_NAMES[activeType] || "Coding Playground";
  const isScratch = activeType === "scratch";
  const isMakeCode = (activeType || "").startsWith("makecode_");
  const isArduino =
    activeType === "tinkercad" ||
    activeType === "wokwi_arduino" ||
    activeType === "wokwi_esp32";
  const isFillLayout =
    showChooser || isMakeCode || isArduino || activeType === "scratchjr" || activeType === "scratch";

  const toggleFullScreen = () => {
    if (!isFullScreen) {
      if (containerRef.current?.requestFullscreen) {
        containerRef.current.requestFullscreen().catch(() => {});
      }
      setIsFullScreen(true);
    } else {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullScreen(false);
    }
  };

  useEffect(() => {
    const handleFSChange = () => {
      if (!document.fullscreenElement) {
        setIsFullScreen(false);
      }
    };
    document.addEventListener("fullscreenchange", handleFSChange);
    return () => document.removeEventListener("fullscreenchange", handleFSChange);
  }, []);

  const fetchProjects = async () => {
    if (!lesson?.id || !courseSlug) return;
    setLoadingProjects(true);
    try {
      const res = await apiFetch(`/api/courses/${courseSlug}/lessons/${lesson.id}/projects/`);
      if (res.ok) {
        const data = await res.json();
        setProjects(data);
      }
    } catch (err) {
      console.error("Failed to load projects:", err);
    } finally {
      setLoadingProjects(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [lesson?.id, courseSlug]);

  const handleUploadProject = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      toast.error("Please select a file to upload.");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("name", projectName || selectedFile.name);

    try {
      const res = await apiFetch(`/api/courses/${courseSlug}/lessons/${lesson.id}/projects/`, {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        toast.success("Project saved successfully to your cloud account!");
        setSelectedFile(null);
        setProjectName("");
        setShowUploadModal(false);
        fetchProjects();
      } else {
        const errData = await res.json();
        toast.error(errData.error || "Failed to save project.");
      }
    } catch (err) {
      toast.error("Network error while saving project.");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (!window.confirm("Are you sure you want to delete this saved project?")) return;
    try {
      const res = await apiFetch(`/api/courses/projects/${projectId}/delete/`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("Project deleted.");
        fetchProjects();
      }
    } catch (err) {
      toast.error("Failed to delete project.");
    }
  };

  return (
    <div 
      ref={containerRef}
      className={`font-sans text-[14px] ${
        isFullScreen 
          ? "fixed inset-0 top-0 left-0 w-screen h-screen z-[99990] bg-black m-0 p-0 overflow-hidden flex flex-col"
          : "relative flex flex-col min-h-0 space-y-4 pb-24"
      }`}
    >
      {/* Sleek Floating Control Overlay when Fullscreen (Slight Rounded Edges) */}
      {isFullScreen && (
        <div className="absolute top-3 right-3 z-[99995] flex items-center gap-2 bg-card/90 backdrop-blur-md border border-border/80 px-3 py-1.5 rounded-lg shadow-2xl text-xs font-semibold text-foreground opacity-80 hover:opacity-100 transition-opacity">
          <span className="text-[11px] font-bold text-muted-foreground hidden sm:inline">{editorName}</span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowUploadModal(true)}
            className="h-7 text-[11px] font-semibold gap-1 px-2.5 rounded-md"
          >
            <Upload size={13} /> Save Project
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={toggleFullScreen}
            className="h-7 w-7 p-0 rounded-md hover:bg-muted text-foreground"
            title="Exit Fullscreen"
          >
            <Minimize2 size={15} />
          </Button>
        </div>
      )}

      {!isFullScreen && (
        <div className="shrink-0 mb-2 bg-card border border-border shadow-sm rounded-lg">
          <div
            className="grid items-center gap-x-2 px-2 sm:px-3 h-12 sm:h-14"
            style={{ gridTemplateColumns: "minmax(0,1fr) auto" }}
          >
            <div className="flex items-center gap-2 min-w-0 overflow-hidden">
              <RealFolderIcon size={30} />
              {showChooser && (
                <div className="flex items-stretch h-8 sm:h-9 gap-1.5 shrink-0">
                  {showJuniorChooser ? (
                    <>
                      <button
                        type="button"
                        onClick={() => setSelectedTool("scratchjr")}
                        className={`h-full rounded-md px-3 sm:px-4 text-[10px] sm:text-xs font-bold uppercase tracking-wide whitespace-nowrap ${
                          selectedTool === "scratchjr"
                            ? "bg-[#F5A623] text-white"
                            : "bg-[#222222] text-white hover:bg-[#F5A623]"
                        }`}
                        title="Stack KIDI"
                      >
                        Stack KIDI
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedTool("scratch")}
                        className={`h-full rounded-md px-3 sm:px-4 text-[10px] sm:text-xs font-bold uppercase tracking-wide whitespace-nowrap ${
                          selectedTool === "scratch"
                            ? "bg-[#4D97FF] text-white"
                            : "bg-[#222222] text-white hover:bg-[#4D97FF]"
                        }`}
                        title="Scratch 3.0"
                      >
                        Scratch 3.0
                      </button>
                    </>
                  ) : showArduinoChooser ? (
                    <>
                      <button
                        type="button"
                        onClick={() => setSelectedTool("tinkercad")}
                        className={`h-full rounded-md px-3 sm:px-4 text-[10px] sm:text-xs font-bold uppercase tracking-wide whitespace-nowrap flex items-center gap-1.5 ${
                          selectedTool === "tinkercad"
                            ? "bg-[#FF6A13] text-white"
                            : "bg-[#222222] text-white hover:bg-[#FF6A13]"
                        }`}
                        title={cohort?.tinkercad_class_code ? `Tinkercad Classroom (${cohort.tinkercad_class_code})` : "Tinkercad Arduino Circuits"}
                      >
                        <span>Tinkercad</span>
                        {cohort?.tinkercad_class_code && (
                          <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" title="Class code linked" />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedTool("wokwi")}
                        className={`h-full rounded-md px-3 sm:px-4 text-[10px] sm:text-xs font-bold uppercase tracking-wide whitespace-nowrap ${
                          selectedTool === "wokwi"
                            ? "bg-[#18B69B] text-white"
                            : "bg-[#222222] text-white hover:bg-[#18B69B]"
                        }`}
                        title="Wokwi Arduino Simulator"
                      >
                        Wokwi
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => setSelectedTool("makecode")}
                        className={`h-full rounded-md px-3 sm:px-4 text-[10px] sm:text-xs font-bold uppercase tracking-wide whitespace-nowrap ${
                          selectedTool === "makecode"
                            ? "bg-[#FF8C00] text-white"
                            : "bg-[#222222] text-white hover:bg-[#FF8C00]"
                        }`}
                        title="Microsoft MakeCode for micro:bit"
                      >
                        MakeCode micro:bit
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedTool("scratch")}
                        className={`h-full rounded-md px-3 sm:px-4 text-[10px] sm:text-xs font-bold uppercase tracking-wide whitespace-nowrap ${
                          selectedTool === "scratch"
                            ? "bg-[#4D97FF] text-white"
                            : "bg-[#222222] text-white hover:bg-[#4D97FF]"
                        }`}
                        title="Scratch 3.0"
                      >
                        Scratch 3.0
                      </button>
                    </>
                  )}
                </div>
              )}
              <div className="min-w-0 overflow-hidden">
                <h3 className="text-xs sm:text-sm font-bold text-foreground truncate">{editorName}</h3>
                <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
                  {isScratch || isMakeCode || isArduino
                    ? "Open the editor to code, then save your progress."
                    : "Code and test directly below, then download or save your progress."}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-1 sm:gap-2 min-w-0">
              {lesson?.playground_starter_file && (
                <a
                  href={lesson.playground_starter_file}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-8 sm:h-9 items-center gap-1.5 px-3 rounded-md text-[11px] sm:text-xs font-semibold bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors whitespace-nowrap"
                >
                  <Download size={14} className="shrink-0" /> Download
                </a>
              )}

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowUploadModal(true)}
                className="h-8 sm:h-9 rounded-md px-3 text-[11px] sm:text-xs font-semibold gap-1.5 whitespace-nowrap hover:scale-100 active:scale-100"
              >
                <Upload size={14} className="shrink-0" /> Save
              </Button>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  const el = document.getElementById("saved-projects");
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="inline-flex h-8 sm:h-9 items-center gap-1.5 px-3 rounded-md text-[11px] sm:text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors whitespace-nowrap border-0"
              >
                <Folder size={14} className="shrink-0" /> Projects
              </Button>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={toggleFullScreen}
                className="h-8 sm:h-9 w-8 sm:w-9 p-0 rounded-md shrink-0 hover:scale-100 active:scale-100"
                title={isFullScreen ? "Exit Full Screen" : "Full Screen Mode"}
              >
                <Maximize2 size={16} />
              </Button>
              {openUrl && (
                <a
                  href={openUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-8 sm:h-9 items-center gap-1.5 px-2.5 rounded-md text-[11px] sm:text-xs font-semibold bg-primary text-primary-foreground hover:opacity-90 whitespace-nowrap"
                  title={activeType === "scratch" ? "Open Scratch 3.0 editor" : `Open ${editorName}`}
                >
                  <ExternalLink size={14} className="shrink-0" /> Open
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {!isFullScreen && activeType !== "tinkercad" && cohort?.tinkercad_class_code && (
        <div className="shrink-0 mb-2 px-3 py-2 rounded-lg bg-[#FF6A13]/10 border border-[#FF6A13]/30 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 min-w-0">
            <Sparkles className="w-4 h-4 text-[#FF6A13] shrink-0" />
            <span className="truncate text-foreground font-medium">
              Tinkercad Class linked: <strong className="font-mono text-[#FF6A13] font-bold">{cohort.tinkercad_class_code}</strong>
            </span>
          </div>
          <button
            type="button"
            onClick={() => setSelectedTool("tinkercad")}
            className="px-2.5 py-1 rounded bg-[#FF6A13] hover:bg-[#E05300] text-white text-[11px] font-bold shrink-0 transition-colors"
          >
            Switch to Tinkercad Class →
          </button>
        </div>
      )}

      <div className={`w-full relative overflow-hidden ${activeType === "tinkercad" ? "bg-zinc-950 rounded-2xl border border-zinc-800 shadow-lg" : "bg-white"} ${isFullScreen ? "flex-1 w-full h-full m-0 p-0 border-0 rounded-none" : activeType === "tinkercad" ? "min-h-[480px]" : "rounded-xl border border-border shadow-sm h-[680px] sm:h-[750px]"}`}>
        {isScratch ? (
          <Scratch3Launch url={SCRATCH_EMBED_URL} />
        ) : isMakeCode ? (
          <MakeCodeLaunch
            url={embedUrl}
            label={activeType === "makecode_arcade" ? "MakeCode Arcade" : "MakeCode micro:bit"}
          />
        ) : isArduino ? (
          activeType === "tinkercad" ? (
            <TinkercadClassroomLaunch
              cohort={cohort}
              me={me}
              isInstructorOrAdmin={isInstructorOrAdmin}
              onCohortUpdated={onCohortUpdated}
              url={embedUrl}
            />
          ) : (
            <ArduinoLaunch
              url={embedUrl}
              label={activeType === "wokwi_esp32" ? "Wokwi ESP32" : "Wokwi Arduino"}
            />
          )
        ) : (
          <iframe
            key={embedUrl}
            src={embedUrl}
            title={editorName}
            scrolling="no"
            className="w-full h-full border-0 m-0 p-0 block bg-white overflow-hidden"
            style={{ overflow: "hidden" }}
            allow={IFRAME_ALLOW}
            sandbox="allow-forms allow-modals allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts allow-downloads allow-pointer-lock"
          />
        )}
      </div>

      {/* Saved Projects List for this Lesson */}
      {!isFullScreen && (
        <div id="saved-projects" className="bg-card border border-border rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs sm:text-sm font-bold text-foreground flex items-center gap-2">
              <Folder size={16} className="text-primary" /> My Saved Lesson Projects
            </h4>
            <span className="text-[11px] text-muted-foreground">{projects.length} files saved</span>
          </div>

          {loadingProjects ? (
            <div className="flex items-center gap-2 text-xs text-muted-foreground py-2">
              <Loader2 size={14} className="animate-spin" /> Loading your saved files...
            </div>
          ) : projects.length === 0 ? (
            <p className="text-xs text-muted-foreground italic py-1">
              You haven't saved any projects for this lesson yet. Export your work from the editor and click "Save My Project" above to upload it to your cloud dashboard.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              {projects.map((proj) => (
                <div
                  key={proj.id}
                  className="flex items-center justify-between gap-2 p-2.5 rounded-lg border border-border/80 bg-background/60 hover:bg-muted/40 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-foreground truncate">{proj.name}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {new Date(proj.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {proj.file_url && (
                      <a
                        href={proj.file_url}
                        download
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground"
                        title="Download file"
                      >
                        <Download size={14} />
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={() => handleDeleteProject(proj.id)}
                      className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                      title="Delete project"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Upload Project Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-[999999] bg-background/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-xl p-5 max-w-sm w-full space-y-4 shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-sm font-bold text-foreground">Save Project to Cloud Dashboard</h3>
            <p className="text-xs text-muted-foreground">
              Download your project file (.sb3, .hex, .ino, etc.) from the editor, then select it here to store in your portfolio.
            </p>

            <form onSubmit={handleUploadProject} className="space-y-3">
              <div>
                <label className="text-[11px] font-semibold text-foreground block mb-1">Project Name (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g., My Scratch Game v1"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-foreground block mb-1">Project File</label>
                <input
                  type="file"
                  onChange={(e) => setSelectedFile(e.target.files[0])}
                  className="w-full text-xs text-muted-foreground file:mr-2 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-primary-foreground hover:file:opacity-90"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowUploadModal(false)}
                  className="text-xs h-8"
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={uploading} className="text-xs h-8 font-semibold gap-1.5">
                  {uploading ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />} Save Project
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
