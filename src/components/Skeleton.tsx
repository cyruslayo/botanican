import { cn } from "@/lib/utils";

export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-surface-variant/40", className)}
      {...props}
    />
  );
}

export function ProductCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("w-full flex flex-col gap-4", className)}>
      <Skeleton className="w-full aspect-[4/5] rounded-xl" />
      <div className="space-y-3 px-4 flex flex-col items-center">
        <Skeleton className="h-6 w-3/4 rounded-md" />
        <Skeleton className="h-4 w-5/6 rounded-md" />
        <Skeleton className="h-4 w-1/4 rounded-md" />
      </div>
    </div>
  );
}

export function AdminTableSkeleton({ columns = 5, rows = 5 }: { columns?: number, rows?: number }) {
  return (
    <div className="w-full">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4 border-b border-outline-variant/50">
          {Array.from({ length: columns }).map((_, j) => (
            <Skeleton
              key={j}
              className={`h-5 ${j === 0 ? 'w-1/3' : j === columns - 1 ? 'w-12 ml-auto' : 'w-1/4'}`}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
