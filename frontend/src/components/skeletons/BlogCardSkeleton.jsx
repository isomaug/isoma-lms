import { Skeleton } from "../ui/skeleton";

export default function BlogCardSkeleton() {
  return (
    <div className="bg-card border border-border shadow-sm overflow-hidden rounded-none flex flex-col h-full">
      <Skeleton className="w-full h-48 rounded-none" />
      <div className="p-5 sm:p-6 flex flex-col flex-grow space-y-4">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-6 w-1/2 mb-2" />
        <div className="space-y-2 flex-grow">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
        <div className="flex justify-between items-center mt-auto pt-4 border-t border-border/50">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16" />
        </div>
      </div>
    </div>
  );
}
