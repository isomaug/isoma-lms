import React from "react";

export function Skeleton({ className = "", ...props }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-muted/60 ${className}`}
      {...props}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="p-4 rounded-xl border border-border bg-card/50 space-y-3 animate-pulse">
      <div className="h-32 bg-muted/60 rounded-lg w-full" />
      <div className="h-4 bg-muted/60 rounded w-3/4" />
      <div className="h-3 bg-muted/60 rounded w-1/2" />
    </div>
  );
}

export function ListSkeleton({ count = 3 }) {
  return (
    <div className="space-y-2.5 w-full">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="h-12 bg-muted/50 rounded-lg w-full animate-pulse border border-border/40"
        />
      ))}
    </div>
  );
}
