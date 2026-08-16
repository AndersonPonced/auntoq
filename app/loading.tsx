import StoreCardSkeleton from '@/components/SkeletonCard';

export default function Loading() {
  return (
    <div className="max-w-[480px] md:max-w-3xl lg:max-w-6xl mx-auto px-4 md:px-6 py-5 md:py-8 space-y-4 md:space-y-6">
      {/* Chip row skeleton */}
      <div className="flex gap-2 overflow-hidden">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="skeleton h-8 w-20 flex-shrink-0 rounded-[8px]" aria-hidden="true" />
        ))}
      </div>
      {/* Card skeletons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
        {Array.from({ length: 6 }).map((_, i) => (
          <StoreCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
