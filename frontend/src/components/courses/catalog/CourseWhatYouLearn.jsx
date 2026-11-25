/**
 * CourseWhatYouLearn -- Renders a 2-column grid of checkmarks with learning outcomes.
 */
import { FaCircle } from "react-icons/fa";

export default function CourseWhatYouLearn({ items = [] }) {
  if (!items || items.length === 0) return null;

  return (
    <div className="border border-border rounded-lg p-6 bg-background/50">
      <h2 className="text-xl font-semibold text-foreground mb-4">
        What you'll learn
      </h2>
      <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 text-sm text-foreground/80">
        {items.map((item, index) => (
          <li key={index} className="flex items-start gap-3">
            <FaCircle className="text-foreground mt-1.5 shrink-0" size={6} />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
