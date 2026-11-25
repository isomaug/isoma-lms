/**
 * LessonItem -- Individual lesson row within the curriculum accordion.
 */
import { FaPlayCircle, FaFileAlt } from "react-icons/fa";

export default function LessonItem({ lesson, onClickPreview }) {
  const { title, duration_minutes, is_preview } = lesson;

  const isVideo = true; // Assuming all lessons have video for now based on the model

  return (
    <div className="flex items-center justify-between py-3 px-4 text-sm text-foreground/70 hover:bg-primary/5 transition-colors group">
      <div className="flex items-center gap-3">
        {isVideo ? (
          <FaPlayCircle
            size={14}
            className="text-foreground/40 group-hover:text-blue-400 transition-colors"
          />
        ) : (
          <FaFileAlt
            size={14}
            className="text-foreground/40 group-hover:text-blue-400 transition-colors"
          />
        )}

        {is_preview && onClickPreview ? (
          <button
            onClick={() => onClickPreview(lesson)}
            className="text-blue-400 hover:text-blue-300 underline underline-offset-2 text-left"
          >
            {title}
          </button>
        ) : (
          <span>{title}</span>
        )}
      </div>

      <div className="flex items-center gap-4 text-xs">
        {is_preview && onClickPreview && (
          <button
            onClick={() => onClickPreview(lesson)}
            className="text-blue-400 hover:text-blue-300 hidden md:block"
          >
            Preview
          </button>
        )}
        <span className="text-foreground/40 w-12 text-right">
          {duration_minutes ? `${duration_minutes}:00` : "0:00"}
        </span>
      </div>
    </div>
  );
}
