'use client';

import { useEffect, useState } from 'react';
import { useStore } from '@/store/store';
import { ProductCard } from '@/components/ProductCard';
import { Filter, Search } from 'lucide-react';
import { motion } from 'framer-motion';

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
    <div className="container mx-auto px-4 py-12">
      {/* Header */}
      <motion.div className="mb-8" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-serif text-[#8b6f63] mb-2">Our Products</h1>
        <p className="text-[#8b6f63]/70">Discover our complete collection of premium cosmetics</p>
      </motion.div>

      {/* Search */}
      <form onSubmit={handleSearch} className="mb-6 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8b6f63]/50" size={18} />
          <input
            type="text"
            placeholder="Search products..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[#fef5f1] rounded-full text-sm text-[#8b6f63] placeholder:text-[#8b6f63]/40 focus:outline-none focus:ring-2 focus:ring-[#d4a5a5]"
          />
        </div>
      </form>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="flex items-center gap-2 flex-wrap">
          <Filter size={20} className="text-[#8b6f63]" />
          <span className="text-sm text-[#8b6f63]">Category:</span>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm transition-all ${
                selectedCategory === category
                  ? 'bg-[#d4a5a5] text-white shadow-sm'
                  : 'bg-[#fef5f1] text-[#8b6f63] hover:bg-[#f5e6e0]'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="md:ml-auto flex items-center gap-2">
          <span className="text-sm text-[#8b6f63]">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 rounded-full bg-[#fef5f1] text-[#8b6f63] text-sm focus:outline-none focus:ring-2 focus:ring-[#d4a5a5]"
          >
            <option value="featured">Featured</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="rating">Highest Rated</option>
            <option value="newest">Newest</option>
          </select>
        </div>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-square bg-[#fef5f1] rounded-xl" />
              <div className="mt-4 h-4 bg-[#fef5f1] rounded w-3/4" />
              <div className="mt-2 h-4 bg-[#fef5f1] rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-16">
          <span className="text-5xl mb-4 block">🔍</span>
          <p className="text-[#8b6f63]/70 text-lg">No products found</p>
          <p className="text-[#8b6f63]/50 text-sm mt-1">Try adjusting your filters or search</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
        </div>
      )}

      {/* Results count */}
      {!loading && products.length > 0 && (
        <p className="text-center text-sm text-[#8b6f63]/50 mt-8">
          Showing {products.length} product{products.length !== 1 ? 's' : ''}
        </p>
      )}
    </div>
  );
}
