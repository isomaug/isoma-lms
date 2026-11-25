import { Skeleton } from "../ui/skeleton";

export default function BlogPageSkeleton() {
  return (
    <div className="w-full mb-12">
      {/* Category Filter Skeleton - matches CategoryFilter bar */}
      <div className="flex items-center justify-between mt-2 mb-6 border-b border-border pb-4 w-full">
        <div className="flex items-center gap-3">
          <Skeleton className="h-5 w-5" />
          <Skeleton className="h-4 w-28 hidden sm:block" />
        </div>
        <Skeleton className="h-10 w-40" />
      </div>

      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 border-t-[3px] border-primary pt-6">
        {/* Left Column: Massive Hero Post */}
        <div className="w-full lg:w-2/3 flex flex-col">
          <Skeleton className="w-full relative aspect-[16/10] md:aspect-[16/9] lg:aspect-[4/3] mb-4 rounded-none" />
          <Skeleton className="h-3 w-16 mb-2" />
          <Skeleton className="h-8 w-3/4 mb-3" />
          <Skeleton className="h-4 w-full mb-1" />
          <Skeleton className="h-4 w-full mb-1" />
          <Skeleton className="h-4 w-2/3 mb-4" />
          <div className="flex items-center gap-3 mt-auto">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-3 w-3 rounded-full shrink-0" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>

        {/* Right Column: Stacked Secondary Posts */}
        <div className="w-full lg:w-1/3 flex flex-col gap-6 lg:border-l lg:border-border lg:pl-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className={`flex flex-col ${i !== 3 ? "border-b border-border pb-6" : ""}`}>
              <Skeleton className="h-3 w-16 mb-2" />
              <Skeleton className="h-6 w-full mb-1" />
              <Skeleton className="h-6 w-4/5 mb-3" />
              <div className="flex items-center gap-3">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-3 w-3 rounded-full shrink-0" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Skeleton for Category Block */}
      <div className="mt-16 flex flex-col gap-4">
        <div className="border-t-[3px] border-primary pt-6">
          <Skeleton className="h-7 w-48 mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex flex-col">
                <Skeleton className="h-3 w-16 mb-2" />
                <Skeleton className="h-5 w-full mb-1" />
                <Skeleton className="h-5 w-3/4 mb-3" />
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-4 w-2/3 mb-3" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
