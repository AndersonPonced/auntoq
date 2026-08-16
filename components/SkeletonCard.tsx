/** Skeleton placeholder for StoreCard while loading */
export default function StoreCardSkeleton() {
  return (
    <div className="bg-surface rounded-[16px] border border-border overflow-hidden" aria-hidden="true">
      {/* Cover image placeholder */}
      <div className="skeleton h-40 w-full rounded-none" />
      {/* Content */}
      <div className="p-4 space-y-3">
        <div className="skeleton h-4 w-20 rounded-full" />
        <div className="skeleton h-5 w-3/4" />
        <div className="skeleton h-3.5 w-full" />
        <div className="skeleton h-3.5 w-5/6" />
        <div className="flex gap-4 pt-1">
          <div className="skeleton h-3 w-24" />
          <div className="skeleton h-3 w-20" />
        </div>
      </div>
    </div>
  );
}

/** Skeleton placeholder for ProductCard */
export function ProductCardSkeleton() {
  return (
    <div className="bg-surface rounded-[16px] border border-border overflow-hidden" aria-hidden="true">
      <div className="skeleton aspect-square w-full rounded-none" />
      <div className="p-3 space-y-2">
        <div className="skeleton h-3.5 w-3/4" />
        <div className="skeleton h-5 w-1/2" />
      </div>
    </div>
  );
}
