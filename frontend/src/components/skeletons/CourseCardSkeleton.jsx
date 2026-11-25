export default function CourseCardSkeleton() {
  return (
    <div className="w-full flex flex-col gap-2 animate-pulse">
      {/* Thumbnail */}
      <div className="w-full aspect-video bg-muted/80" />

      {/* Content */}
      <div className="flex flex-col gap-2 mt-1">
        {/* Title */}
        <div className="h-4 bg-muted/80 rounded w-full" />
        <div className="h-4 bg-muted/80 rounded w-4/5" />

        {/* Instructor */}
        <div className="h-3 bg-muted/60 rounded w-1/2 mt-1" />

        {/* Rating row */}
        <div className="flex gap-2 mt-1">
          <div className="h-3 bg-muted/60 rounded w-24" />
        </div>

        {/* Meta */}
        <div className="h-3 bg-muted/60 rounded w-3/4 mt-1" />

        {/* Price */}
        <div className="h-4 bg-muted/80 rounded w-1/4 mt-2" />
      </div>
    </div>
  );
}
