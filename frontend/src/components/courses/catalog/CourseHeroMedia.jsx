import { BookOpen } from "lucide-react";
import { FaPlayCircle } from "react-icons/fa";
import SmartImage from "@/components/media/SmartImage";

export default function CourseHeroMedia({
  course,
  imageLoadFailed,
  onImageError,
  onPreview,
}) {
  const hasImage = Boolean(course.thumbnail) && !imageLoadFailed;
  const hasPreview = Boolean(course.preview_video_url);

  return (
    <div className="relative min-w-0 aspect-video w-full overflow-hidden rounded-md border border-white/15 bg-[#0b1d30] shadow-xl shadow-black/20">
      {hasImage ? (
        <SmartImage
          src={course.thumbnail}
          alt={course.title}
          fetchPriority="high"
          onError={onImageError}
          className="absolute inset-0 h-full w-full object-cover"
          containerClassName="absolute inset-0 h-full w-full"
          optimizedWidth={1200}
        />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center text-white">
          <BookOpen className="h-11 w-11 text-white/70" aria-hidden="true" />
          <span className="max-w-lg font-semibold">{course.title}</span>
        </div>
      )}

    </div>
  );
}
