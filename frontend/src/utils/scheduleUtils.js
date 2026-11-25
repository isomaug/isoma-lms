/**
 * Helper utilities for Cohort Scheduling & Timetables
 */

export const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
export const FULL_DAY_NAMES = [
  "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
];

/** Status styles - dark solid fills for timetable chips/stats. */
export const SCHEDULE_STATUSES = [
  { value: "scheduled", label: "Remaining", color: "blue", badgeClass: "bg-blue-800 text-white border border-blue-900 font-bold shadow-none", cardClass: "border-blue-800/40 bg-card text-foreground", solidStat: "bg-blue-800 text-white border border-blue-900" },
  { value: "taught", label: "Taught", color: "emerald", badgeClass: "bg-emerald-800 text-white border border-emerald-900 font-bold shadow-none", cardClass: "border-emerald-800/40 bg-card text-foreground", solidStat: "bg-emerald-800 text-white border border-emerald-900" },
  { value: "postponed", label: "Postponed", color: "amber", badgeClass: "bg-amber-700 text-white border border-amber-900 font-bold shadow-none", cardClass: "border-amber-700/40 bg-card text-foreground", solidStat: "bg-amber-700 text-white border border-amber-900" },
  { value: "missed", label: "Missed", color: "rose", badgeClass: "bg-rose-800 text-white border border-rose-900 font-bold shadow-none", cardClass: "border-rose-800/40 bg-card text-foreground", solidStat: "bg-rose-800 text-white border border-rose-900" },
  { value: "covered", label: "Covered", color: "purple", badgeClass: "bg-purple-800 text-white border border-purple-900 font-bold shadow-none", cardClass: "border-purple-800/40 bg-card text-foreground", solidStat: "bg-purple-800 text-white border border-purple-900" },
];

export function getStatusConfig(status) {
  return SCHEDULE_STATUSES.find(s => s.value === status) || SCHEDULE_STATUSES[0];
}

export function localISODate(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** e.g. Today is Wednesday, 23rd Sept 2026 - pass includeYear: false for "… 23rd Sept" */
export function formatTodayLabel(d = new Date(), { includeYear = true } = {}) {
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"
  ];
  const dayNum = d.getDate();
  let suffix = "th";
  if (dayNum === 1 || dayNum === 21 || dayNum === 31) suffix = "st";
  else if (dayNum === 2 || dayNum === 22) suffix = "nd";
  else if (dayNum === 3 || dayNum === 23) suffix = "rd";
  const base = `Today is ${days[d.getDay()]}, ${dayNum}${suffix} ${months[d.getMonth()]}`;
  return includeYear ? `${base} ${d.getFullYear()}` : base;
}

function parseClockToMinutes(t) {
  if (!t) return null;
  const parts = String(t).split(":");
  const hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1] || "0", 10);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;
  return hours * 60 + minutes;
}

/** Returns "1h 30m", "45m", or null */
export function formatSessionDuration(startTime, endTime) {
  const start = parseClockToMinutes(startTime);
  const end = parseClockToMinutes(endTime);
  if (start == null || end == null) return null;
  let diff = end - start;
  if (diff <= 0) return null;
  const h = Math.floor(diff / 60);
  const m = diff % 60;
  if (h && m) return `${h}h ${m}m`;
  if (h) return `${h}h`;
  return `${m}m`;
}

/**
 * Formats date and optional times as: Mon, 21st Sept 2026 · ends 10:00am
 * or Mon, 21st Sept 2026 7:30am–10:00am when both are set.
 */
export function formatLessonScheduleDate(dateStr, timeStr, endTimeStr) {
  if (!dateStr) return "";
  try {
    const parts = dateStr.split("-").map(Number);
    if (parts.length !== 3) return dateStr;
    const date = new Date(parts[0], parts[1] - 1, parts[2]);
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const months = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"
    ];

    const dayNum = date.getDate();
    let suffix = "th";
    if (dayNum === 1 || dayNum === 21 || dayNum === 31) suffix = "st";
    else if (dayNum === 2 || dayNum === 22) suffix = "nd";
    else if (dayNum === 3 || dayNum === 23) suffix = "rd";

    const dayName = days[date.getDay()];
    const monthName = months[date.getMonth()];
    const year = date.getFullYear();

    const formatClock = (t) => {
      if (!t) return "";
      const tParts = String(t).split(":");
      let hours = parseInt(tParts[0], 10);
      if (Number.isNaN(hours)) return "";
      const minutes = tParts[1] ? tParts[1].padStart(2, "0") : "00";
      const ampm = hours >= 12 ? "pm" : "am";
      hours = hours % 12 || 12;
      return `${hours}:${minutes}${ampm}`;
    };

    const startFmt = formatClock(timeStr);
    const endFmt = formatClock(endTimeStr);

    let timePart = "";
    if (startFmt && endFmt) timePart = ` ${startFmt}–${endFmt}`;
    else if (endFmt) timePart = ` · ends ${endFmt}`;
    else if (startFmt) timePart = ` ${startFmt}`;

    return `${dayName}, ${dayNum}${suffix} ${monthName} ${year}${timePart}`;
  } catch (err) {
    return dateStr;
  }
}

/**
 * Calculates timetable summary stats
 */
export function calculateTimetableStats(cohort, schedules = []) {
  const list = schedules || cohort?.schedules || [];
  const total = list.length;

  let taught = 0;
  let missed = 0;
  let postponed = 0;
  let covered = 0;
  let scheduled = 0;

  list.forEach(item => {
    const s = item.status || "scheduled";
    if (s === "taught") taught++;
    else if (s === "missed") missed++;
    else if (s === "postponed") postponed++;
    else if (s === "covered") covered++;
    else scheduled++;
  });

  const remaining = scheduled;

  let weeksCount = 0;
  if (cohort?.start_date && cohort?.end_date) {
    const s = new Date(cohort.start_date);
    const e = new Date(cohort.end_date);
    if (e >= s) {
      const diffTime = Math.abs(e - s);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      weeksCount = Math.ceil(diffDays / 7);
    }
  }

  return {
    total,
    taught,
    missed,
    postponed,
    covered,
    scheduled,
    remaining,
    weeksCount,
    scheduleDays: cohort?.schedule_days || [],
    scheduleTime: cohort?.schedule_time || "",
    scheduleEndTime: cohort?.schedule_end_time || "",
    holidays: cohort?.holidays || []
  };
}

/** Normalize holiday entries: string date OR { date, label/activity }. */
export function holidayDate(entry) {
  if (!entry) return "";
  if (typeof entry === "string") return entry.trim();
  return String(entry.date || "").trim();
}

export function holidayLabel(entry) {
  if (!entry || typeof entry === "string") return "";
  return String(entry.label || entry.activity || "").trim();
}

export function formatHolidayChip(entry) {
  const date = holidayDate(entry);
  const label = holidayLabel(entry);
  let dateText = date;
  try {
    const d = new Date(`${date}T12:00:00`);
    if (!Number.isNaN(d.getTime())) {
      dateText = d.toLocaleDateString(undefined, {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    }
  } catch {
    /* keep raw */
  }
  return label ? `${dateText} · ${label}` : dateText;
}

export function normalizeHolidays(list = []) {
  const seen = new Set();
  const out = [];
  for (const entry of list || []) {
    const date = holidayDate(entry);
    if (!date || seen.has(date)) continue;
    seen.add(date);
    const label = holidayLabel(entry);
    out.push(label ? { date, label } : { date, label: "" });
  }
  return out.sort((a, b) => a.date.localeCompare(b.date));
}

export function holidayDatesSet(list = []) {
  return new Set(normalizeHolidays(list).map((h) => h.date));
}

/**
 * Resolves the accurate display title for a schedule entry.
 * If a break or holiday shifted lessons, it ensures the week number in the title
 * matches the actual calendar week of the session (e.g., if Week 9 was half term,
 * the next session is Week 10, not Week 9 again).
 */
export function getScheduleDisplayTitle(schedule, cohortStartDate) {
  if (!schedule) return "";
  let title = schedule.custom_title || schedule.lesson_title || "";
  if (!title) return "";

  if (schedule.activity_type === "half_term_break" || schedule.activity_type === "holiday") {
    return title;
  }

  if (schedule.date && cohortStartDate) {
    try {
      const partsStart = String(cohortStartDate).split("-").map(Number);
      const partsCur = String(schedule.date).split("-").map(Number);
      if (partsStart.length === 3 && partsCur.length === 3) {
        const start = new Date(partsStart[0], partsStart[1] - 1, partsStart[2]);
        const cur = new Date(partsCur[0], partsCur[1] - 1, partsCur[2]);

        const startMonday = new Date(start);
        startMonday.setDate(start.getDate() - ((start.getDay() + 6) % 7));
        const curMonday = new Date(cur);
        curMonday.setDate(cur.getDate() - ((cur.getDay() + 6) % 7));

        const diffWeeks = Math.round((curMonday - startMonday) / (7 * 24 * 60 * 60 * 1000));
        const actualWeek = Math.max(1, diffWeeks + 1);

        const m = title.match(/^(?:Week\s*(\d+)|W(\d+))(\s*[-:].*)$/i);
        if (m) {
          const curNum = parseInt(m[1] || m[2], 10);
          if (curNum !== actualWeek) {
            title = `Week ${actualWeek}${m[3]}`;
          }
        }
      }
    } catch {
      // keep original title
    }
  }
  return title;
}

