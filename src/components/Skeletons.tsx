'use client';

export function ProductCardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="aspect-square bg-[#f5e6e0]/30 rounded-xl" />
      <div className="mt-4 space-y-2">
        <div className="h-3 bg-[#f5e6e0]/30 rounded w-1/3" />
        <div className="h-4 bg-[#f5e6e0]/30 rounded w-3/4" />
        <div className="h-4 bg-[#f5e6e0]/30 rounded w-1/2" />
      </div>
    </div>
  );
}

export function ProductDetailSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Left: Image placeholder */}
        <div className="aspect-square bg-[#f5e6e0]/30 rounded-xl animate-pulse" />

        {/* Right: Content placeholders */}
        <div className="space-y-6 animate-pulse">
          {/* Category */}
          <div className="h-4 bg-[#f5e6e0]/30 rounded w-1/4" />
          {/* Title */}
          <div className="h-8 bg-[#f5e6e0]/30 rounded w-3/4" />
          {/* Rating row */}
          <div className="flex gap-2">
            <div className="h-4 bg-[#f5e6e0]/30 rounded w-24" />
            <div className="h-4 bg-[#f5e6e0]/30 rounded w-20" />
          </div>
          {/* Price */}
          <div className="h-8 bg-[#f5e6e0]/30 rounded w-1/3" />
          {/* Description lines */}
          <div className="space-y-2">
            <div className="h-4 bg-[#f5e6e0]/30 rounded w-full" />
            <div className="h-4 bg-[#f5e6e0]/30 rounded w-full" />
            <div className="h-4 bg-[#f5e6e0]/30 rounded w-2/3" />
          </div>
          {/* Quantity row */}
          <div className="h-10 bg-[#f5e6e0]/30 rounded w-40" />
          {/* Buttons */}
          <div className="flex gap-4 pt-2">
            <div className="h-14 bg-[#f5e6e0]/30 rounded-full flex-1" />
            <div className="h-14 bg-[#f5e6e0]/30 rounded-full w-36" />
          </div>
          {/* Additional info */}
          <div className="border-t border-[#8b6f63]/10 pt-6 space-y-3">
            <div className="h-4 bg-[#f5e6e0]/30 rounded w-48" />
            <div className="h-4 bg-[#f5e6e0]/30 rounded w-52" />
            <div className="h-4 bg-[#f5e6e0]/30 rounded w-44" />
          </div>
        </div>
      </div>
    </div>
  );
}
