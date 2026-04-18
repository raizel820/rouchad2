'use client';

import { useEffect, useState } from 'react';
import { useStore } from '@/store/store';
import { ProductCard } from '@/components/ProductCard';
import { ProductCardSkeleton } from '@/components/Skeletons';
import { Filter, Search, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
}

export function ProductsPage() {
  const { selectedCategory, setSelectedCategory, sortBy, setSortBy, searchQuery, setSearchQuery } = useStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [localSearch, setLocalSearch] = useState(searchQuery);

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
        setLoading(false);
      })
      .catch(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [selectedCategory, sortBy, searchQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(localSearch);
  };

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

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
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

          <div className="md:ml-auto flex items-center gap-2">
            <span className="text-sm text-[#8b6f63] dark:text-[#e8ddd5]/60">Sort by:</span>
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

        {/* Results count */}
        {!loading && (
          <motion.p
            key={selectedCategory + sortBy + searchQuery}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm text-[#8b6f63]/50 dark:text-[#e8ddd5]/30 mb-6"
          >
            Showing {products.length} product{products.length !== 1 ? 's' : ''}
            {selectedCategory !== 'All' && (
              <span> in <span className="text-[#d4a5a5] dark:text-[#d4a5a5] font-medium">{selectedCategory}</span></span>
            )}
            {searchQuery && (
              <span> matching &ldquo;<span className="text-[#d4a5a5] dark:text-[#d4a5a5] font-medium">{searchQuery}</span>&rdquo;</span>
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
              {[...Array(6)].map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </motion.div>
          ) : products.length === 0 ? (
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
            </motion.div>
          ) : (
            <motion.div
              key="products"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {products.map((product, idx) => (
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
