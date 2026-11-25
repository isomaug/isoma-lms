import { Skeleton } from "../ui/skeleton";

export default function NewsPageSkeleton() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 animate-in fade-in duration-700 w-full">
      {/* Main News Content */}
      <div className="lg:col-span-8 flex flex-col gap-6 lg:gap-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {/* Featured Hero Image */}
          <Skeleton className="w-full aspect-square rounded-md" />
          
          {/* More News */}
          <div className="bg-card rounded-md border border-border shadow-sm p-5 flex flex-col aspect-square">
             <Skeleton className="h-6 w-32 mb-6" />
             <div className="flex flex-col gap-4 flex-1">
               {[1, 2, 3].map((i) => (
                 <div key={i} className="flex gap-3 items-start border-b border-border pb-4 last:border-0 last:pb-0">
                   <Skeleton className="w-20 h-20 sm:w-24 sm:h-24 rounded-md shrink-0" />
                   <div className="flex-1 space-y-2">
                     <Skeleton className="h-4 w-full" />
                     <Skeleton className="h-4 w-4/5" />
                     <Skeleton className="h-3 w-20 mt-2" />
                   </div>
                 </div>
               ))}
             </div>
          </div>
        </div>

        {/* Featured Post Text */}
        <div className="pt-2 lg:pt-0 space-y-3">
          <Skeleton className="h-4 w-32 mb-2" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-3/4 mb-2" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
        </div>
      </div>

      {/* Events Sidebar */}
      <div className="lg:col-span-4">
        <div className="bg-card rounded-md border border-border shadow-sm p-5 flex flex-col min-h-[500px]">
          <Skeleton className="h-6 w-24 mb-6" />
          <div className="flex flex-col gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex flex-col gap-2 pb-6 border-b border-border/50 last:border-0 last:pb-0">
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-3/4" />
                <div className="space-y-1 mt-2">
                  <Skeleton className="h-3 w-40" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
