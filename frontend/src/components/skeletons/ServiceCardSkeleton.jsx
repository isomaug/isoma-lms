import { Skeleton } from "../ui/skeleton";

export default function ServiceCardSkeleton() {
  return (
    <div className="flex flex-col h-full shadow-md rounded-lg overflow-hidden border border-border bg-card">
      <div className="p-6 space-y-3">
        <Skeleton className="h-6 w-2/3" />
        <Skeleton className="h-4 w-1/2" />
      </div>
      <div className="p-6 flex-1 space-y-4 pt-0">
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
        </div>
        <div className="space-y-2 mt-4">
          <Skeleton className="h-3 w-32 mb-2" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-11/12" />
          <Skeleton className="h-4 w-4/5" />
        </div>
      </div>
      <div className="border-t border-border/50 p-6 flex items-center justify-between">
        <div className="space-y-1">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-3 w-16" />
        </div>
        <Skeleton className="h-9 w-24 rounded-md" />
      </div>
    </div>
  );
}
