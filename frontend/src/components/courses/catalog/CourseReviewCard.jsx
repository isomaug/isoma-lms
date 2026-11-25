/**
 * CourseReviewCard -- Individual user review.
 */
import StarRating from "@/components/courses/catalog/StarRating";
import { FaEllipsisV } from "react-icons/fa";

export default function CourseReviewCard({ review }) {
  const { username, first_name, last_name, avatar, rating, comment, created_at } = review;

  const displayName = review.full_name || [first_name, last_name].filter(Boolean).join(" ") || username || "Student";
  const initials = displayName ? displayName.substring(0, 2).toUpperCase() : "ST";

  const dateStr = new Date(created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
  });

  return (
    <div className="py-6 border-t border-border first:border-0">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          {avatar ? (
            <img src={avatar} alt={displayName} className="w-12 h-12 rounded-full object-cover shrink-0" />
          ) : (
            <div className="w-12 h-12 rounded-full bg-background border border-border flex items-center justify-center text-foreground font-bold shrink-0">
              {initials}
            </div>
          )}

          <div>
            <h4 className="font-semibold text-foreground">{displayName}</h4>
            <div className="flex items-center gap-2 mt-1">
              <StarRating rating={rating} size={12} />
              <span className="text-xs text-foreground/40">{dateStr}</span>
            </div>
            {comment && (
              <p className="mt-4 text-foreground/80 text-sm leading-relaxed whitespace-pre-wrap">
                {comment}
              </p>
            )}
          </div>
        </div>

        {/* Options button (mock) */}
        <button className="text-foreground/30 hover:text-foreground/60 p-2">
          <FaEllipsisV size={14} />
        </button>
      </div>
    </div>
  );
}
