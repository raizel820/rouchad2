'use client';

import { useStore } from '@/store/store';
import { ProductCard } from '@/components/ProductCard';
import { Clock, X } from 'lucide-react';
import { toast } from '@/lib/toast';
import { motion } from 'framer-motion';

export function RecentlyViewedSection() {
  const { recentlyViewed, clearRecentlyViewed } = useStore();

  if (recentlyViewed.length === 0) return null;

  const handleClear = () => {
    clearRecentlyViewed();
    toast('Viewing history cleared');
  };

  return (
    <motion.section
      className="container mx-auto px-4 py-12"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#d4a5a5]/10 flex items-center justify-center">
            <Clock size={20} className="text-[#d4a5a5]" />
          </div>
          <div>
            <h2 className="text-2xl font-serif text-[#8b6f63]">Recently Viewed</h2>
            <p className="text-sm text-[#8b6f63]/50">Products you&apos;ve been exploring</p>
          </div>
        </div>
        <button
          onClick={handleClear}
          className="flex items-center gap-1.5 text-sm text-[#8b6f63]/50 hover:text-[#d4a5a5] transition-colors group"
        >
          <X size={14} className="group-hover:rotate-90 transition-transform duration-200" />
          Clear History
        </button>
      </div>

      <div className="relative">
        <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-thin" style={{ scrollbarWidth: 'thin', scrollbarColor: '#d4a5a5 transparent' }}>
          {recentlyViewed.map((product, idx) => (
            <motion.div
              key={product.id}
              className="flex-shrink-0 w-[220px] sm:w-[240px] snap-start"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}
