import { Skeleton } from "../ui/skeleton";

export default function ProjectCardSkeleton() {
  return (
    <div className="w-full h-full aspect-square rounded-none border border-border bg-zinc-950/20 flex items-center justify-center p-6 animate-pulse">
      <Skeleton className="h-6 w-2/3 rounded-none bg-muted/40" />
    </div>
  );
}
