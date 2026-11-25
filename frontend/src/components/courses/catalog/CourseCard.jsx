/**
 * CourseCard -- Udemy-style course card for grid listings.
 * Displays thumbnail, title, instructor, rating, price, and badge.
 */
import { Link } from "react-router-dom";
import StarRating from "@/components/courses/catalog/StarRating";
import CourseBadge from "@/components/courses/catalog/CourseBadge";
import { useCurrency } from "@/context/CurrencyContext";
import SmartImage from "@/components/media/SmartImage";

export default function CourseCard({ course, isEnrolledOverride }) {
  const { formatPrice } = useCurrency();
  const {
    slug,
    title,
    thumbnail,
    instructor_name,
    avg_rating,
    total_reviews,
    price_ugx,
    original_price_ugx,
    is_bestseller,
    enrollment_count,
    total_lessons,
    total_duration_minutes,
    level,
  } = course || {};

  const hours = Math.floor((total_duration_minutes || 0) / 60);
  const mins = (total_duration_minutes || 0) % 60;
  const durationLabel = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

  const isEnrolled = isEnrolledOverride || course?.is_enrolled;
  const targetUrl = isEnrolled
    ? course?.is_past_paper
      ? `/courses/${slug}/paper`
      : `/courses/${slug}/learn`
    : `/courses/${slug}`;

  return (
    <Link
      to={targetUrl}
      className="group flex flex-col h-full bg-card rounded-md border border-border overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 relative text-left"
    >
      {/* Thumbnail Container */}
      <div className="relative aspect-video overflow-hidden bg-muted shrink-0 rounded-t-md">
        {thumbnail ? (
          <SmartImage
            src={thumbnail}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
            containerClassName="w-full h-full"
            loading="lazy"
            optimizedWidth={600}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground">
            <span className="text-xs">No thumbnail</span>
          </div>
        )}

        {/* Floating Top-Left Badge (Udemy Style) */}
        {is_bestseller && (
          <div className="absolute top-2.5 left-2.5 z-10">
            <span className="bg-[#eceb98] text-[#3d3c0a] dark:bg-amber-400 dark:text-black font-extrabold text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-sm shadow-sm">
              Bestseller
            </span>
          </div>
        )}

        {/* Overlay for enrolled state */}
        {isEnrolled && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20">
            <div className="bg-primary text-primary-foreground font-semibold px-4 py-2 rounded-full text-xs shadow-lg flex items-center gap-2 transform translate-y-2 group-hover:translate-y-0 transition-all duration-200">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
              {course?.is_past_paper ? "Open paper" : "Resume Course"}
            </div>
          </div>
        )}
      </div>

      {/* Content Container */}
      <div className="p-4 flex flex-col flex-1 justify-between gap-3">
        <div className="flex flex-col gap-1">
          {/* Title */}
          <h3 className="text-foreground font-bold text-sm sm:text-[15px] leading-snug line-clamp-2 group-hover:text-primary transition-colors">
            {title}
          </h3>

          {/* Instructor */}
          <p className="text-muted-foreground text-xs font-sans truncate">
            {instructor_name || "Peter Gordon Ekebu"}
          </p>

          {/* Rating Row */}
          <div className="flex items-center gap-1.5 mt-1">
            <span className="text-amber-700 dark:text-amber-400 font-extrabold text-xs">
              {avg_rating > 0 ? avg_rating.toFixed(1) : "4.8"}
            </span>
            <StarRating rating={avg_rating > 0 ? avg_rating : 4.8} size={12} />
            <span className="text-muted-foreground text-[11px]">
              ({(total_reviews || 0).toLocaleString()})
            </span>
          </div>

          {/* Meta Details */}
          <p className="text-muted-foreground text-[11px] mt-0.5 font-medium">
            {durationLabel} total · {total_lessons || 0} lessons · {level || "All Levels"}
          </p>
        </div>

        {/* Bottom Price Row / Enrolled Status */}
        <div className="pt-2 border-t border-border/60 flex items-center justify-between">
          {isEnrolled ? (
            <span className="bg-green-500/10 text-green-600 dark:text-green-400 font-bold px-2.5 py-1 rounded-md text-[11px] flex items-center gap-1 border border-green-500/20">
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Enrolled
            </span>
          ) : (
            <div className="flex items-baseline gap-2">
              <span className="text-foreground font-extrabold text-base tracking-tight">
                {formatPrice(price_ugx)}
              </span>
              {original_price_ugx &&
                Number(original_price_ugx) > Number(price_ugx) && (
                  <span className="text-muted-foreground/60 text-xs line-through font-normal">
                    {formatPrice(original_price_ugx)}
                  </span>
                )}
            </div>
          )}

          {enrollment_count > 0 && (
            <span className="text-muted-foreground text-[10px] font-medium">
              {enrollment_count.toLocaleString()} students
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
