'use client';

/* ─── Shimmer helper ─────────────────────────────────────────────── */
/** Inline shimmer wrapper – provides the moving gradient for any child element. */
function Shimmer({ className = '', children }: { className?: string; children?: React.ReactNode }) {
  return (
    <div className={`skeleton-shimmer ${className}`}>
      {children}
    </div>
  );
}

/* ─── Product Card Skeleton ──────────────────────────────────────── */
export function ProductCardSkeleton() {
  return (
    <div className="group">
      {/* Image area */}
      <Shimmer className="aspect-square rounded-xl" />
      {/* Text lines */}
      <div className="mt-4 space-y-2.5">
        <Shimmer className="h-3 rounded w-1/3" />
        <Shimmer className="h-4 rounded w-3/4" />
        <div className="flex items-center justify-between">
          <Shimmer className="h-4 rounded w-1/3" />
          <Shimmer className="h-3 rounded w-12" />
        </div>
      </div>
    </div>
  );
}

/* ─── Compact Product Card Skeleton (for horizontal scroll) ─────── */
export function ProductCardCompactSkeleton() {
  return (
    <div className="flex-shrink-0 w-[220px] sm:w-[240px]">
      <Shimmer className="aspect-square rounded-xl" />
      <div className="mt-4 space-y-2.5">
        <Shimmer className="h-3 rounded w-1/3" />
        <Shimmer className="h-4 rounded w-3/4" />
        <Shimmer className="h-4 rounded w-1/2" />
      </div>
    </div>
  );
}

/* ─── Hero Skeleton ──────────────────────────────────────────────── */
export function HeroSkeleton() {
  return (
    <div className="relative w-full h-[520px] sm:h-[600px] lg:h-[680px] overflow-hidden">
      {/* Full-width gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#f5e6e0] via-[#fef5f1] to-[#d4a5a5]/30 dark:from-[#3d2f34] dark:via-[#2d1f24] dark:to-[#4d3f44]/30" />
      {/* Decorative circles */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-[#d4a5a5]/10 dark:bg-[#d4a5a5]/5 animate-pulse" />
      <div className="absolute bottom-1/3 right-1/4 w-48 h-48 rounded-full bg-[#d4a5a5]/10 dark:bg-[#d4a5a5]/5 animate-pulse [animation-delay:0.5s]" />
      {/* Content placeholders */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full px-4 text-center">
        <Shimmer className="h-4 rounded-full w-32 mb-6" />
        <Shimmer className="h-12 sm:h-14 rounded w-72 sm:w-96 mb-4" />
        <Shimmer className="h-6 rounded w-64 sm:w-80 mb-8" />
        <div className="flex gap-4">
          <Shimmer className="h-12 rounded-full w-40" />
          <Shimmer className="h-12 rounded-full w-40" />
        </div>
        {/* Scroll indicator */}
        <div className="absolute bottom-8">
          <Shimmer className="h-8 w-8 rounded-full" />
        </div>
      </div>
    </div>
  );
}

/* ─── Banner Skeleton ───────────────────────────────────────────── */
export function BannerSkeleton() {
  return (
    <div className="rounded-xl min-h-[220px] overflow-hidden">
      <Shimmer className="h-full w-full rounded-xl" />
    </div>
  );
}

/* ─── Testimonial Card Skeleton ─────────────────────────────────── */
export function TestimonialCardSkeleton() {
  return (
    <div className="bg-white dark:bg-[#2d1f24] rounded-xl p-6 shadow-sm border border-[#f5e6e0]/50 dark:border-[#3d2f34]">
      {/* Quote icon placeholder */}
      <div className="flex justify-end mb-4">
        <Shimmer className="h-8 w-8 rounded" />
      </div>
      {/* Star rating */}
      <div className="flex gap-1 mb-4">
        {[...Array(5)].map((_, i) => (
          <Shimmer key={i} className="h-4 w-4 rounded" />
        ))}
      </div>
      {/* Text lines */}
      <div className="space-y-2 mb-6">
        <Shimmer className="h-3 rounded w-full" />
        <Shimmer className="h-3 rounded w-full" />
        <Shimmer className="h-3 rounded w-4/5" />
      </div>
      {/* Avatar + name */}
      <div className="flex items-center gap-3">
        <Shimmer className="w-10 h-10 rounded-full flex-shrink-0" />
        <div className="space-y-2">
          <Shimmer className="h-4 rounded w-28" />
          <Shimmer className="h-3 rounded w-24" />
        </div>
      </div>
    </div>
  );
}

/* ─── Filter Panel Skeleton ─────────────────────────────────────── */
export function FilterPanelSkeleton() {
  return (
    <div className="bg-[#fef5f1]/70 dark:bg-[#2d1f24]/70 rounded-2xl p-6 mb-6 border border-[#f5e6e0]/60 dark:border-[#3d2f34]/60 backdrop-blur-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <Shimmer className="h-4 rounded w-32" />
        <Shimmer className="h-3 rounded w-24" />
      </div>
      {/* Filter sections grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* Price Range */}
        <div className="space-y-3">
          <Shimmer className="h-4 rounded w-24" />
          <Shimmer className="h-2 rounded w-full" />
          <div className="flex justify-between">
            <Shimmer className="h-3 rounded w-8" />
            <Shimmer className="h-3 rounded w-8" />
          </div>
        </div>
        {/* Rating */}
        <div className="space-y-3">
          <Shimmer className="h-4 rounded w-28" />
          <div className="flex gap-1.5">
            {[...Array(5)].map((_, i) => (
              <Shimmer key={i} className="h-7 rounded-full w-14" />
            ))}
          </div>
        </div>
        {/* On Sale toggle */}
        <div className="space-y-3">
          <Shimmer className="h-4 rounded w-28" />
          <Shimmer className="h-9 rounded-full w-24" />
          <Shimmer className="h-3 rounded w-40" />
        </div>
      </div>
    </div>
  );
}

/* ─── Feature Card Skeleton ─────────────────────────────────────── */
export function FeatureCardSkeleton() {
  return (
    <div className="text-center p-6 bg-white dark:bg-[#2d1f24] rounded-xl shadow-sm border border-[#f5e6e0]/50 dark:border-[#3d2f34]">
      <div className="inline-flex items-center justify-center w-14 h-14 bg-[#fef5f1] dark:bg-[#3d2f34] rounded-full mb-4">
        <Shimmer className="h-6 w-6 rounded" />
      </div>
      <Shimmer className="h-4 rounded w-24 mx-auto mb-1" />
      <Shimmer className="h-3 rounded w-32 mx-auto" />
    </div>
  );
}

/* ─── Home Page Full Skeleton ───────────────────────────────────── */
export function HomePageSkeleton() {
  return (
    <div>
      {/* Hero skeleton */}
      <HeroSkeleton />

      {/* Promotional banners - 3 columns */}
      <section className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <BannerSkeleton key={`banner-${i}`} />
          ))}
        </div>
      </section>

      {/* Sale section - horizontal scroll */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {/* Section header */}
          <div className="text-center mb-8">
            <Shimmer className="h-8 rounded w-48 mx-auto mb-3" />
            <Shimmer className="h-4 rounded w-64 mx-auto mb-4" />
            <Shimmer className="h-[2px] rounded w-48 mx-auto mb-4" />
            <div className="flex justify-center gap-2 mb-4">
              {[...Array(2)].map((_, i) => (
                <Shimmer key={i} className="h-7 rounded-full w-24" />
              ))}
            </div>
            {/* Countdown timer skeleton */}
            <div className="flex justify-center gap-1.5">
              {[...Array(4)].map((_, i) => (
                <Shimmer key={i} className="w-10 h-10 rounded-md" />
              ))}
            </div>
          </div>
          {/* Horizontal scroll product cards */}
          <div className="flex gap-5 overflow-hidden pb-4">
            {[...Array(4)].map((_, i) => (
              <ProductCardCompactSkeleton key={`sale-${i}`} />
            ))}
          </div>
        </div>
      </section>

      {/* Featured products - grid of 4 */}
      <section className="container mx-auto px-4 py-12">
        {/* Section header */}
        <div className="text-center mb-12">
          <Shimmer className="h-8 rounded w-72 mx-auto mb-2" />
          <Shimmer className="h-4 rounded w-52 mx-auto mb-3" />
          <Shimmer className="h-[2px] rounded w-64 mx-auto mb-4" />
          <Shimmer className="h-3 rounded w-36 mx-auto mb-4" />
          {/* Marquee placeholder */}
          <div className="flex justify-center gap-8 mt-4 mb-6">
            {[...Array(6)].map((_, i) => (
              <Shimmer key={i} className="h-4 rounded w-16" />
            ))}
          </div>
          {/* Category buttons */}
          <div className="flex justify-center gap-6 mt-4">
            {[...Array(4)].map((_, i) => (
              <Shimmer key={i} className="h-4 rounded w-16" />
            ))}
          </div>
        </div>
        {/* Product grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, i) => (
            <ProductCardSkeleton key={`feat-${i}`} />
          ))}
        </div>
        {/* CTA button */}
        <div className="text-center">
          <Shimmer className="h-11 rounded-full w-44 mx-auto" />
        </div>
      </section>

      {/* Bottom banners - 2 columns */}
      <section className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => (
            <BannerSkeleton key={`bottom-${i}`} />
          ))}
        </div>
      </section>

      {/* Features - 4 columns */}
      <section className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <FeatureCardSkeleton key={`feat-card-${i}`} />
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-[#fef5f1] dark:bg-[#1a1215] py-16">
        <div className="container mx-auto px-4">
          {/* Section header */}
          <div className="text-center mb-12">
            <Shimmer className="h-8 rounded w-64 mx-auto mb-2" />
            <Shimmer className="h-4 rounded w-48 mx-auto" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[...Array(3)].map((_, i) => (
              <TestimonialCardSkeleton key={`test-${i}`} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

/* ─── Products Page Full Skeleton ───────────────────────────────── */
export function ProductsPageSkeleton() {
  return (
    <div className="min-h-screen bg-[#1a1215]/0 dark:bg-[#1a1215] transition-colors">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8 space-y-2">
          <Shimmer className="h-8 rounded w-48" />
          <Shimmer className="h-4 rounded w-72" />
        </div>

        {/* Search bar */}
        <div className="mb-6 max-w-md">
          <Shimmer className="h-10 rounded-full w-full" />
        </div>

        {/* Category pills + Sort row */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex items-center gap-2 flex-wrap">
            <Shimmer className="h-5 w-5 rounded" />
            <Shimmer className="h-4 rounded w-16" />
            {[...Array(5)].map((_, i) => (
              <Shimmer key={i} className="h-8 rounded-full w-20" />
            ))}
          </div>
          <div className="md:ml-auto flex items-center gap-3">
            <Shimmer className="h-8 rounded-full w-24" />
            <Shimmer className="h-8 rounded-full w-36" />
          </div>
        </div>

        {/* Filter panel */}
        <FilterPanelSkeleton />

        {/* Results count */}
        <div className="mb-6">
          <Shimmer className="h-4 rounded w-40" />
        </div>

        {/* Products grid - 12 cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(12)].map((_, i) => (
            <ProductCardSkeleton key={`prod-${i}`} />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Product Detail Skeleton (existing, kept for backwards compat) */
export function ProductDetailSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Left: Image placeholder */}
        <Shimmer className="aspect-square rounded-xl" />

        {/* Right: Content placeholders */}
        <div className="space-y-6">
          {/* Category */}
          <Shimmer className="h-4 rounded w-1/4" />
          {/* Title */}
          <Shimmer className="h-8 rounded w-3/4" />
          {/* Rating row */}
          <div className="flex gap-2">
            <Shimmer className="h-4 rounded w-24" />
            <Shimmer className="h-4 rounded w-20" />
          </div>
          {/* Price */}
          <Shimmer className="h-8 rounded w-1/3" />
          {/* Description lines */}
          <div className="space-y-2">
            <Shimmer className="h-4 rounded w-full" />
            <Shimmer className="h-4 rounded w-full" />
            <Shimmer className="h-4 rounded w-2/3" />
          </div>
          {/* Quantity row */}
          <Shimmer className="h-10 rounded w-40" />
          {/* Buttons */}
          <div className="flex gap-4 pt-2">
            <Shimmer className="h-14 rounded-full flex-1" />
            <Shimmer className="h-14 rounded-full w-36" />
          </div>
          {/* Additional info */}
          <div className="border-t border-[#8b6f63]/10 dark:border-[#3d2f34] pt-6 space-y-3">
            <Shimmer className="h-4 rounded w-48" />
            <Shimmer className="h-4 rounded w-52" />
            <Shimmer className="h-4 rounded w-44" />
          </div>
        </div>
      </div>
    </div>
  );
}
