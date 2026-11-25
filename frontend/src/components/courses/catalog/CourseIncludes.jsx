/**
 * CourseIncludes -- Shows the "This course includes:" list
 * often displayed on the sticky purchase sidebar.
 */
import {
  FaVideo,
  FaFileAlt,
  FaDownload,
  FaInfinity,
  FaMobileAlt,
  FaCertificate,
  FaCheckCircle,
} from "react-icons/fa";

function formatDuration(totalDurationMinutes) {
  const minutes = Number(totalDurationMinutes);

  if (!Number.isFinite(minutes) || minutes <= 0) {
    return "Self-paced video lessons";
  }

  if (minutes < 60) {
    return `${minutes} minute${minutes === 1 ? "" : "s"} of on-demand video`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  const hoursLabel = `${hours} hour${hours === 1 ? "" : "s"}`;

  if (remainingMinutes === 0) {
    return `${hoursLabel} of on-demand video`;
  }

  return `${hoursLabel} ${remainingMinutes} min of on-demand video`;
}

function formatLessons(numLessons) {
  const lessons = Number(numLessons);

  if (!Number.isFinite(lessons) || lessons <= 0) {
    return "Structured course lessons";
  }

  return `${lessons} lesson${lessons === 1 ? "" : "s"}`;
}

export default function CourseIncludes({
  totalDurationMinutes,
  numLessons,
  isPastPaper = false,
  pastPaperSummary = null,
}) {
  const itemClassName = "flex items-start gap-3";
  const iconClassName = "mt-0.5 h-4 w-4 shrink-0 text-muted-foreground";
  const questionCount = Number(pastPaperSummary?.question_count || 0);
  const solutionReady = Boolean(pastPaperSummary?.solution_ready);

  if (isPastPaper) {
    return (
      <div className="space-y-2.5">
        <h3 className="text-sm font-semibold text-foreground">
          This past paper includes:
        </h3>
        <ul className="space-y-2 text-sm leading-5 text-muted-foreground">
          <li className={itemClassName}>
            <FaFileAlt className={iconClassName} aria-hidden="true" />
            <span>
              {questionCount > 0
                ? `${questionCount} question${questionCount === 1 ? "" : "s"} with mark-scheme alignment`
                : "Question paper workspace"}
            </span>
          </li>
          <li className={itemClassName}>
            <FaDownload className={iconClassName} aria-hidden="true" />
            <span>Authorised question paper and mark scheme PDFs</span>
          </li>
          <li className={itemClassName}>
            <FaCheckCircle className={iconClassName} aria-hidden="true" />
            <span>
              {solutionReady
                ? "Step-by-step worked solutions ready to open"
                : "Worked solutions pending instructor review"}
            </span>
          </li>
          <li className={itemClassName}>
            <FaInfinity className={iconClassName} aria-hidden="true" />
            <span>Full lifetime access after enrolment</span>
          </li>
        </ul>
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      <h3 className="text-sm font-semibold text-foreground">
        This course includes:
      </h3>
      <ul className="space-y-2 text-sm leading-5 text-muted-foreground">
        <li className={itemClassName}>
          <FaVideo className={iconClassName} aria-hidden="true" />
          <span>{formatDuration(totalDurationMinutes)}</span>
        </li>
        <li className={itemClassName}>
          <FaFileAlt className={iconClassName} aria-hidden="true" />
          <span>{formatLessons(numLessons)}</span>
        </li>
        <li className={itemClassName}>
          <FaDownload className={iconClassName} aria-hidden="true" />
          <span>Downloadable resources</span>
        </li>
        <li className={itemClassName}>
          <FaInfinity className={iconClassName} aria-hidden="true" />
          <span>Full lifetime access</span>
        </li>
        <li className={itemClassName}>
          <FaMobileAlt className={iconClassName} aria-hidden="true" />
          <span>Access on mobile and TV</span>
        </li>
        <li className={itemClassName}>
          <FaCertificate className={iconClassName} aria-hidden="true" />
          <span>Certificate of completion</span>
        </li>
      </ul>
    </div>
  );
}
