import { ProductCardSkeleton } from '@/components/SkeletonCard';

export default function TiendaLoading() {
  return (
    <div className="pb-28 md:pb-12">
      <div className="md:max-w-5xl md:mx-auto md:px-6 md:pt-8 md:grid md:grid-cols-[1fr_1.2fr] md:gap-10 md:items-start">
        {/* Cover skeleton */}
        <div>
          <div className="skeleton h-56 md:h-[420px] w-full max-w-[480px] md:max-w-none mx-auto rounded-none md:rounded-[16px]" aria-hidden="true" />
          <div className="hidden md:block mt-5">
            <div className="skeleton h-14 w-full rounded-[16px]" />
          </div>
        </div>
        <div className="max-w-[480px] md:max-w-none mx-auto px-4 md:px-0 py-5 md:py-0 space-y-4">
          <div className="skeleton h-5 w-20 rounded-full" />
          <div className="skeleton h-7 w-3/4" />
          <div className="skeleton h-4 w-full" />
          <div className="skeleton h-4 w-4/5" />
          <hr className="border-border" />
          <div className="skeleton h-5 w-24" />
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
