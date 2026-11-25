/**
 * CourseStickyPurchase -- Purchase panel on the course landing page.
 */
import CourseIncludes from "@/components/courses/catalog/CourseIncludes";
import { useCart } from "@/context/CartContext";
import { useCurrency } from "@/context/CurrencyContext";
import CurrencySelector from "@/components/common/CurrencySelector";
import SmartImage from "@/components/media/SmartImage";
import { FaPlayCircle } from "react-icons/fa";

export default function CourseStickyPurchase({ course, onEnroll, onPreview }) {
  const { isInCart } = useCart();
  const { formatPrice } = useCurrency();

  const {
    price_ugx,
    original_price_ugx,
    discount_percent,
    total_duration_minutes,
    total_lessons,
  } = course;

  const isFree = Number(price_ugx) === 0;
  const hasPreview = Boolean(course?.preview_video_url);

  return (
    <aside
      aria-label="Course enrollment"
      className="min-w-0 rounded-md border border-white/15 bg-background text-foreground shadow-xl shadow-black/15 flex flex-col overflow-hidden"
    >
      {/* Top Preview Thumbnail Header with Video Click Sign */}
      {course.thumbnail && (
        <div className="relative aspect-video max-h-[140px] sm:max-h-[155px] w-full overflow-hidden border-b border-white/10 bg-[#0b1d30]">
          <SmartImage
            src={course.thumbnail}
            alt={course.title}
            className="w-full h-full object-cover"
            containerClassName="w-full h-full"
            optimizedWidth={600}
          />
          {hasPreview ? (
            <button
              type="button"
              onClick={onPreview}
              aria-label={`Preview ${course.title}`}
              className="group absolute inset-0 flex flex-col items-center justify-center bg-black/40 text-white transition-colors hover:bg-black/25 focus-visible:outline-none cursor-pointer z-10"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm transition-transform group-hover:scale-110 shadow-md">
                <FaPlayCircle className="h-7 w-7 text-white" aria-hidden="true" />
              </span>
              <span className="mt-1 text-[11px] font-bold drop-shadow-md tracking-wide">
                Preview this course
              </span>
            </button>
          ) : (
            <div className="absolute bottom-2 left-2 z-10">
              <span className="bg-black/60 backdrop-blur-sm text-white font-medium text-[10px] px-2 py-0.5 rounded-sm">
                Course Preview
              </span>
            </div>
          )}
        </div>
      )}

      <div className="flex flex-col p-3">
        {/* Conditional Enrolled State or Purchase State */}
        {course.is_enrolled ? (
          <div className="mb-3 flex flex-col gap-2">
            <div className="rounded-md border border-amber-500/30 bg-amber-500/10 p-3">
              <div className="mb-1.5 flex items-center gap-2.5">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-amber-500 text-white">
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </span>
                <h3 className="font-bold text-sm text-foreground">
                  Premium lifetime access
                </h3>
              </div>
              <p className="text-xs leading-4 text-muted-foreground">
                You have full access to this course and all future updates.
              </p>
            </div>

            <button
              type="button"
              onClick={onEnroll}
              className="flex min-h-10 w-full items-center justify-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <span>
                {course.is_past_paper
                  ? "Open paper"
                  : course.progress_percent === 100
                    ? "Review Course"
                    : "Resume Course"}
              </span>
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                />
              </svg>
            </button>
          </div>
        ) : (
          <>
            {/* Currency & Price Row */}
            <div className="mb-1 flex items-center justify-between gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                Course access
              </span>
              <CurrencySelector />
            </div>
            <div className="mb-2 flex min-w-0 flex-wrap items-baseline gap-x-2.5 gap-y-1">
              <span className="min-w-0 break-words text-xl font-bold leading-tight tabular-nums text-foreground sm:text-2xl">
                {isFree ? "Free" : formatPrice(price_ugx)}
              </span>
              {!isFree &&
                original_price_ugx &&
                Number(original_price_ugx) > Number(price_ugx) && (
                  <div className="flex flex-wrap items-baseline gap-1.5">
                    <span className="text-xs leading-none text-muted-foreground line-through">
                      {formatPrice(original_price_ugx)}
                    </span>
                    <span className="text-xs font-semibold leading-none text-foreground">
                      {discount_percent}% off
                    </span>
                  </div>
                )}
            </div>

            {/* Action Button */}
            <button
              type="button"
              onClick={onEnroll}
              className="mb-1.5 min-h-10 w-full rounded-md bg-blue-600 px-3 py-2 text-sm font-bold text-white transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 focus-visible:ring-offset-2"
            >
              {course.is_past_paper
                ? isFree
                  ? "Open past paper"
                  : isInCart(course?.id)
                    ? "Go to Cart"
                    : "Add paper to Cart"
                : isFree
                  ? "Enroll Now"
                  : isInCart(course?.id)
                    ? "Go to Cart"
                    : "Add to Cart"}
            </button>

            <p className="mb-2 text-center text-[11px] text-muted-foreground">
              {course.is_past_paper && !course.past_paper_summary?.solution_ready
                ? "PDFs available now. Worked solutions publish after instructor review."
                : "30-Day Money-Back Guarantee"}
            </p>
          </>
        )}

        {/* Includes */}
        <div className="mt-auto border-t border-border pt-2.5">
          <CourseIncludes
            totalDurationMinutes={total_duration_minutes}
            numLessons={total_lessons}
            isPastPaper={Boolean(course.is_past_paper)}
            pastPaperSummary={course.past_paper_summary}
          />
        </div>
      </div>
    </aside>
  );
}
