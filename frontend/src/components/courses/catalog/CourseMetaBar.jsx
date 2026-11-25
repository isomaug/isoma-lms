/**
 * CourseMetaBar -- Displays rating, enrollment count, instructor, last updated.
 * Used at the top of the CourseLanding page header.
 */
import StarRating from "@/components/courses/catalog/StarRating";
import { FaUsers, FaClock, FaUser, FaGlobe, FaChartBar } from "react-icons/fa";

export default function CourseMetaBar({
  avg_rating,
  total_reviews,
  enrollment_count,
  instructor_name,
  updated_at,
  language,
  level,
}) {
  const updatedDate = updated_at
    ? new Date(updated_at).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-xs text-white/80 mt-2">
      {/* Rating */}
      <div className="flex items-center gap-1.5">
        <span className="text-amber-400 font-bold">
          {avg_rating > 0 ? avg_rating.toFixed(1) : "--"}
        </span>
        <StarRating rating={avg_rating} size={13} />
        <span className="underline">
          ({(total_reviews || 0).toLocaleString()} rating{total_reviews !== 1 ? "s" : ""})
        </span>
      </div>

      {/* Students */}
      <div className="flex items-center gap-1.5">
        <FaUsers size={13} className="text-white/60" />
        <span>{(enrollment_count || 0).toLocaleString()} students</span>
      </div>

      {/* Instructor */}
      <div className="flex items-center gap-1.5">
        <FaUser size={12} className="text-white/60" />
        <span>
          Created by <span className="text-blue-400 underline">{instructor_name}</span>
        </span>
      </div>

      {/* Last Updated */}
      {updatedDate && (
        <div className="flex items-center gap-1.5">
          <FaClock size={12} className="text-white/60" />
          <span>Last updated {updatedDate}</span>
        </div>
      )}

      {/* Language */}
      {language && (
        <div className="flex items-center gap-1.5">
          <FaGlobe size={12} className="text-white/60" />
          <span>{language}</span>
        </div>
      )}

      {/* Level */}
      {level && (
        <div className="flex items-center gap-1.5">
          <FaChartBar size={12} className="text-white/60" />
          <span className="capitalize">{level}</span>
        </div>
      )}
    </div>
  );
}
