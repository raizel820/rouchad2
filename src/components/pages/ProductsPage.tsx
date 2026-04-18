'use client';

import { useEffect, useState, useMemo } from 'react';
import { useStore } from '@/store/store';
import { ProductCard } from '@/components/ProductCard';
import { ProductCardSkeleton, FilterPanelSkeleton } from '@/components/Skeletons';
import { Filter, Search, ChevronDown, Star, X, SlidersHorizontal, Tag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Slider } from '@/components/ui/slider';

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  image: string;
  description: string;
  badge?: string;
  rating: number;
  reviewCount: number;
  discountedPrice?: number;
  effectiveDiscount?: number;
  savings?: number;
  saleName?: string | null;
  onSale?: boolean;
}

const STAR_OPTIONS = [4, 3, 2, 1];

export function ProductsPage() {
  const { selectedCategory, setSelectedCategory, sortBy, setSortBy, searchQuery, setSearchQuery } = useStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [localSearch, setLocalSearch] = useState(searchQuery);

  // Advanced filter state
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100]);
  const [maxPriceBound, setMaxPriceBound] = useState(100);
  const [minRating, setMinRating] = useState(0);
  const [onSaleOnly, setOnSaleOnly] = useState(false);

  const categories = ['All', 'Makeup', 'Skincare', 'Haircare', 'Perfume'];

  useEffect(() => {
    let cancelled = false;
    const params = new URLSearchParams();
    if (selectedCategory !== 'All') params.set('category', selectedCategory);
    if (sortBy !== 'featured') params.set('sort', sortBy);
    if (searchQuery) params.set('search', searchQuery);

    fetch(`/api/products?${params.toString()}`)
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        setProducts(data);
        // Compute the actual max price from returned products
        if (Array.isArray(data) && data.length > 0) {
          const maxP = Math.max(...data.map((p: Product) => p.price));
          setMaxPriceBound(maxP);
          setPriceRange([0, maxP]);
        }
        setLoading(false);
      })
      .catch(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [selectedCategory, sortBy, searchQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(localSearch);
  };

  // Whether any advanced filter is active
  const hasActiveFilters = useMemo(
    () => priceRange[0] > 0 || priceRange[1] < maxPriceBound || minRating > 0 || onSaleOnly,
    [priceRange, maxPriceBound, minRating, onSaleOnly]
  );

  // Clear all advanced filters
  const clearFilters = () => {
    setPriceRange([0, maxPriceBound]);
    setMinRating(0);
    setOnSaleOnly(false);
  };

  // Client-side filtering
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Price filter — use original price
      if (p.price < priceRange[0] || p.price > priceRange[1]) return false;
      // Rating filter
      if (minRating > 0 && p.rating < minRating) return false;
      // On-sale filter
      if (onSaleOnly && !p.onSale) return false;
      return true;
    });
  }, [products, priceRange, minRating, onSaleOnly]);

  return (
    <div className="min-h-screen bg-[#1a1215]/0 dark:bg-[#1a1215] transition-colors">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <motion.div className="mb-8" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-serif text-[#8b6f63] dark:text-[#e8ddd5] mb-2">Our Products</h1>
          <p className="text-[#8b6f63]/70 dark:text-[#e8ddd5]/50">Discover our complete collection of premium cosmetics</p>
        </motion.div>

        {/* Search */}
        <form onSubmit={handleSearch} className="mb-6 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8b6f63]/50 dark:text-[#e8ddd5]/30" size={18} />
            <input
              type="text"
              placeholder="Search products..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[#fef5f1] dark:bg-[#2d1f24] rounded-full text-sm text-[#8b6f63] dark:text-[#e8ddd5] placeholder:text-[#8b6f63]/40 dark:placeholder:text-[#e8ddd5]/30 focus:outline-none focus:ring-2 focus:ring-[#d4a5a5] border border-transparent dark:border-[#3d2f34] dark:focus:border-[#d4a5a5] transition-colors"
            />
          </div>
        </form>

        {/* Category Pills + Sort Row */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex items-center gap-2 flex-wrap">
            <Filter size={20} className="text-[#8b6f63] dark:text-[#e8ddd5]/60" />
            <span className="text-sm text-[#8b6f63] dark:text-[#e8ddd5]/60">Category:</span>
            <div className="relative flex items-center gap-1">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className="relative px-4 py-2 rounded-full text-sm transition-colors"
                >
                  {selectedCategory === category && (
                    <motion.span
                      layoutId="category-pill"
                      className="absolute inset-0 bg-[#d4a5a5] text-white rounded-full"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span className={`relative z-10 ${selectedCategory === category ? 'text-white' : 'text-[#8b6f63] dark:text-[#e8ddd5]/70'} hover:text-[#8b6f63] dark:hover:text-[#e8ddd5] transition-colors`}>
                    {category}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="md:ml-auto flex items-center gap-3">
            {/* Advanced Filters Toggle */}
            <button
              onClick={() => setShowFilters((v) => !v)}
              className={`relative inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-colors ${
                showFilters || hasActiveFilters
                  ? 'bg-[#d4a5a5] text-white'
                  : 'bg-[#fef5f1] dark:bg-[#2d1f24] text-[#8b6f63] dark:text-[#e8ddd5] border border-transparent dark:border-[#3d2f34]'
              }`}
            >
              <SlidersHorizontal size={15} />
              Filters
              {hasActiveFilters && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  !
                </span>
              )}
            </button>

            {/* Sort */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none pl-4 pr-10 py-2 rounded-full bg-[#fef5f1] dark:bg-[#2d1f24] text-[#8b6f63] dark:text-[#e8ddd5] text-sm focus:outline-none focus:ring-2 focus:ring-[#d4a5a5] border border-transparent dark:border-[#3d2f34] dark:focus:border-[#d4a5a5] cursor-pointer transition-colors"
              >
                <option value="featured">Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
                <option value="newest">Newest</option>
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8b6f63]/50 dark:text-[#e8ddd5]/30 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Advanced Filters Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <div className="bg-[#fef5f1]/70 dark:bg-[#2d1f24]/70 rounded-2xl p-6 mb-6 border border-[#f5e6e0]/60 dark:border-[#3d2f34]/60 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-sm font-semibold text-[#8b6f63] dark:text-[#e8ddd5] tracking-wide uppercase">
                    Advanced Filters
                  </h3>
                  {hasActiveFilters && (
                    <button
                      onClick={clearFilters}
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                    >
                      <X size={13} />
                      Clear All Filters
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  {/* Price Range */}
                  <div>
                    <label className="block text-sm font-medium text-[#8b6f63]/80 dark:text-[#e8ddd5]/70 mb-3">
                      Price Range
                    </label>
                    <div className="px-1">
                      <Slider
                        min={0}
                        max={maxPriceBound}
                        step={1}
                        value={priceRange}
                        onValueChange={(val) => setPriceRange(val as [number, number])}
                        className="[&_[data-slot=slider-track]]:bg-[#e8d5ce] dark:[&_[data-slot=slider-track]]:bg-[#3d2f34] [&_[data-slot=slider-range]]:bg-[#d4a5a5] [&_[data-slot=slider-thumb]]:border-[#d4a5a5] [&_[data-slot=slider-thumb]]:hover:ring-[#d4a5a5]/30"
                      />
                    </div>
                    <div className="flex items-center justify-between mt-2 text-xs text-[#8b6f63]/60 dark:text-[#e8ddd5]/40">
                      <span>${priceRange[0]}</span>
                      <span>${priceRange[1]}</span>
                    </div>
                  </div>

                  {/* Rating Filter */}
                  <div>
                    <label className="block text-sm font-medium text-[#8b6f63]/80 dark:text-[#e8ddd5]/70 mb-3">
                      Minimum Rating
                    </label>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setMinRating(0)}
                        className={`relative px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                          minRating === 0
                            ? 'text-white'
                            : 'text-[#8b6f63]/70 dark:text-[#e8ddd5]/60 hover:text-[#8b6f63] dark:hover:text-[#e8ddd5]'
                        }`}
                      >
                        {minRating === 0 && (
                          <motion.span
                            layoutId="rating-pill"
                            className="absolute inset-0 bg-[#d4a5a5] rounded-full"
                            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                          />
                        )}
                        <span className="relative z-10">All</span>
                      </button>
                      {STAR_OPTIONS.map((r) => (
                        <button
                          key={r}
                          onClick={() => setMinRating(r)}
                          className={`relative inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                            minRating === r
                              ? 'text-white'
                              : 'text-[#8b6f63]/70 dark:text-[#e8ddd5]/60 hover:text-[#8b6f63] dark:hover:text-[#e8ddd5]'
                          }`}
                        >
                          {minRating === r && (
                            <motion.span
                              layoutId="rating-pill"
                              className="absolute inset-0 bg-[#d4a5a5] rounded-full"
                              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                            />
                          )}
                          <span className="relative z-10 inline-flex items-center gap-1">
                            {r}+
                            <Star size={11} className="fill-[#d4a5a5] text-[#d4a5a5]" />
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* On Sale Toggle */}
                  <div>
                    <label className="block text-sm font-medium text-[#8b6f63]/80 dark:text-[#e8ddd5]/70 mb-3">
                      Special Offers
                    </label>
                    <button
                      onClick={() => setOnSaleOnly((v) => !v)}
                      className={`relative inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        onSaleOnly
                          ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-sm'
                          : 'bg-white dark:bg-[#3d2f34] text-[#8b6f63]/70 dark:text-[#e8ddd5]/60 hover:text-[#8b6f63] dark:hover:text-[#e8ddd5] border border-[#f5e6e0]/60 dark:border-[#4d3f44]'
                      }`}
                    >
                      <Tag size={14} className={onSaleOnly ? 'text-white' : 'text-red-400'} />
                      <span>On Sale</span>
                      {onSaleOnly && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                        >
                          <X size={12} className="ml-0.5 opacity-80" />
                        </motion.span>
                      )}
                    </button>
                    {onSaleOnly && (
                      <motion.p
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-xs text-red-500/70 dark:text-red-400/60 mt-2"
                      >
                        Showing discounted items only
                      </motion.p>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Active filter summary when panel is closed */}
        {!showFilters && hasActiveFilters && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-wrap items-center gap-2 mb-6"
          >
            <span className="text-xs text-[#8b6f63]/60 dark:text-[#e8ddd5]/40">Active filters:</span>
            {priceRange[0] > 0 && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#fef5f1] dark:bg-[#2d1f24] text-xs text-[#8b6f63] dark:text-[#e8ddd5]/70 rounded-full border border-[#f5e6e0]/60 dark:border-[#3d2f34]">
                From ${priceRange[0]}
                <button onClick={() => setPriceRange([0, priceRange[1]])}><X size={10} className="opacity-50 hover:opacity-100" /></button>
              </span>
            )}
            {priceRange[1] < maxPriceBound && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#fef5f1] dark:bg-[#2d1f24] text-xs text-[#8b6f63] dark:text-[#e8ddd5]/70 rounded-full border border-[#f5e6e0]/60 dark:border-[#3d2f34]">
                Up to ${priceRange[1]}
                <button onClick={() => setPriceRange([priceRange[0], maxPriceBound])}><X size={10} className="opacity-50 hover:opacity-100" /></button>
              </span>
            )}
            {minRating > 0 && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#fef5f1] dark:bg-[#2d1f24] text-xs text-[#8b6f63] dark:text-[#e8ddd5]/70 rounded-full border border-[#f5e6e0]/60 dark:border-[#3d2f34]">
                {minRating}+ Stars
                <button onClick={() => setMinRating(0)}><X size={10} className="opacity-50 hover:opacity-100" /></button>
              </span>
            )}
            {onSaleOnly && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-50 dark:bg-red-500/10 text-xs text-red-500 dark:text-red-400 rounded-full border border-red-100 dark:border-red-500/20">
                On Sale
                <button onClick={() => setOnSaleOnly(false)}><X size={10} className="opacity-50 hover:opacity-100" /></button>
              </span>
            )}
            <button
              onClick={clearFilters}
              className="text-xs font-medium text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 transition-colors ml-1"
            >
              Clear all
            </button>
          </motion.div>
        )}

        {/* Filter panel skeleton when loading */}
        {loading && showFilters && (
          <FilterPanelSkeleton />
        )}

        {/* Results count */}
        {!loading && (
          <motion.p
            key={selectedCategory + sortBy + searchQuery + priceRange.join('-') + minRating + onSaleOnly}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm text-[#8b6f63]/50 dark:text-[#e8ddd5]/30 mb-6"
          >
            Showing {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
            {selectedCategory !== 'All' && (
              <span> in <span className="text-[#d4a5a5] dark:text-[#d4a5a5] font-medium">{selectedCategory}</span></span>
            )}
            {searchQuery && (
              <span> matching &ldquo;<span className="text-[#d4a5a5] dark:text-[#d4a5a5] font-medium">{searchQuery}</span>&rdquo;</span>
            )}
            {hasActiveFilters && (
              <span className="text-[#d4a5a5] dark:text-[#d4a5a5]/80"> (filtered)</span>
            )}
          </motion.p>
        )}

        {/* Products Grid */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {[...Array(8)].map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </motion.div>
          ) : filteredProducts.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-center py-16"
            >
              <Search size={48} className="mx-auto mb-4 text-[#8b6f63]/20 dark:text-[#e8ddd5]/10" />
              <p className="text-[#8b6f63]/70 dark:text-[#e8ddd5]/50 text-lg">No products found</p>
              <p className="text-[#8b6f63]/50 dark:text-[#e8ddd5]/30 text-sm mt-1">Try adjusting your filters or search</p>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="mt-4 inline-flex items-center gap-2 px-6 py-2.5 bg-[#d4a5a5] text-white text-sm rounded-full hover:bg-[#c89a9a] transition-all active:scale-95"
                >
                  <X size={14} />
                  Clear All Filters
                </button>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="products"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {filteredProducts.map((product, idx) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.03 * idx }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
