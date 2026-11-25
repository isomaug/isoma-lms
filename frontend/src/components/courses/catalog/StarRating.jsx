/**
 * StarRating -- Renders filled/half/empty star icons using react-icons/fa.
 */
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";

export default function StarRating({ rating = 0, size = 14 }) {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalf = rating - fullStars >= 0.25 && rating - fullStars < 0.75;
  const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);

  for (let i = 0; i < fullStars; i++) {
    stars.push(
      <FaStar key={`full-${i}`} size={size} className="text-amber-400" />
    );
  }
  if (hasHalf) {
    stars.push(
      <FaStarHalfAlt key="half" size={size} className="text-amber-400" />
    );
  }
  for (let i = 0; i < emptyStars; i++) {
    stars.push(
      <FaRegStar key={`empty-${i}`} size={size} className="text-amber-400/40" />
    );
  }

  return <span className="inline-flex items-center gap-0.5">{stars}</span>;
}
