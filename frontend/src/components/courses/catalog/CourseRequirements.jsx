/**
 * CourseRequirements -- Renders a list of prerequisites.
 */
import { FaCircle } from "react-icons/fa";

export default function CourseRequirements({ requirements = [] }) {
  if (!requirements || requirements.length === 0) return null;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-foreground">Requirements</h2>
      <ul className="space-y-2 text-foreground/70 text-[15px]">
        {requirements.map((req, index) => (
          <li key={index} className="flex items-start gap-3">
            <FaCircle className="text-foreground/20 mt-2 shrink-0" size={6} />
            <span>{req}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
