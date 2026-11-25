/**
 * InstructorProfile -- Displays instructor stats and bio.
 */
import { FaStar, FaUsers, FaPlayCircle } from "react-icons/fa";

export default function InstructorProfile({
  name,
  bio,
  avatarUrl,
  rating = "4.7",
  numStudents = "5,000",
  numCourses = "5",
}) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-foreground">Instructor</h2>

      <div>
        <a
          href="#instructor"
          className="text-xl font-bold text-blue-400 underline underline-offset-2 hover:text-blue-300"
        >
          {name}
        </a>
        <p className="text-foreground/50 text-sm mt-1">
          Software Engineer & Educator
        </p>
      </div>

      <div className="flex items-start gap-6 pt-2">
        {/* Avatar */}
        <div className="w-24 h-24 rounded-full overflow-hidden shrink-0 border border-border bg-background/50 flex items-center justify-center">
          <img
            src={avatarUrl || "/ekebu-profile-pic.png"}
            alt={name}
            className="w-full h-full object-cover object-[center_10%]"
          />
        </div>

        {/* Stats */}
        <ul className="space-y-2 text-sm text-foreground/80">
          <li className="flex items-center gap-3">
            <FaStar className="text-amber-400" size={14} />
            <span>{rating} Instructor Rating</span>
          </li>
          <li className="flex items-center gap-3">
            <FaUsers className="text-foreground/40" size={14} />
            <span>{numStudents} Students</span>
          </li>
          <li className="flex items-center gap-3">
            <FaPlayCircle className="text-foreground/40" size={14} />
            <span>{numCourses} Courses</span>
          </li>
        </ul>
      </div>

      {/* Bio */}
      {bio && (
        <div className="prose prose-invert prose-sm max-w-none text-foreground/70 mt-4 leading-relaxed">
          <p>{bio}</p>
        </div>
      )}
    </div>
  );
}
