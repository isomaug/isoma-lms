import { Skeleton } from "../ui/skeleton";

export default function DetailSkeleton() {
  return (
    <div className="max-w-[680px] w-full mx-auto py-12 px-5 sm:px-6 min-h-[80vh]">
      <Skeleton className="h-4 w-24 mb-8" />

      {/* Title */}
      <Skeleton className="h-12 sm:h-16 w-full mb-4" />
      <Skeleton className="h-12 sm:h-16 w-3/4 mb-6" />

      {/* Meta */}
      <div className="flex items-center justify-between mt-8 mb-6 border-t border-b border-border py-3">
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-48" />
        </div>
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>

      {/* Image */}
      <Skeleton className="w-full h-[300px] sm:h-[400px] rounded-none mb-10" />

      {/* Content */}
      <div className="space-y-4">
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-11/12" />
        <Skeleton className="h-5 w-4/5" />
        <div className="h-6" /> {/* Spacer */}
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-10/12" />
      </div>
    </div>
  );
}
