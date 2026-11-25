/**
 * CourseReviewSummary -- Displays average rating and distribution bars.
 */
import StarRating from "@/components/courses/catalog/StarRating";

export default function CourseReviewSummary({
  avgRating = 0,
  totalReviews = 0,
  distribution = {},
}) {
  // distribution is an object like {"1": 5, "2": 10, "3": 20, "4": 50, "5": 100}

  const starsArray = [5, 4, 3, 2, 1];

  return (
    <div className="flex flex-col md:flex-row gap-8 items-start md:items-center w-full max-w-3xl">
      {/* Left side: Big number */}
      <div className="flex flex-col items-center justify-center text-center w-full md:w-auto shrink-0">
        <span className="text-6xl font-bold text-amber-400 mb-2 leading-none">
          {avgRating > 0 ? avgRating.toFixed(1) : "0.0"}
        </span>
        <StarRating rating={avgRating} size={18} />
        <span className="text-foreground/50 font-semibold mt-2">
          Course Rating
        </span>
      </div>

      {/* Right side: Distribution bars */}
      <div className="flex-1 w-full space-y-2">
        {starsArray.map((star) => {
          const count = distribution[star] || 0;
          const percent = totalReviews > 0 ? (count / totalReviews) * 100 : 0;

          return (
            <div key={star} className="flex items-center gap-3 text-sm">
              <div className="w-40 flex items-center shrink-0">
                <StarRating rating={star} size={14} />
              </div>

              {/* Progress bar */}
              <div className="flex-1 h-2 bg-primary/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white/40"
                  style={{ width: `${percent}%` }}
                />
              </div>

              <div className="w-12 text-right text-blue-400 underline underline-offset-2 hover:text-blue-300 cursor-pointer">
                {Math.round(percent)}%
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
