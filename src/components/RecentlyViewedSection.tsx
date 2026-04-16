'use client';

import { useStore } from '@/store/store';
import { ProductCard } from '@/components/ProductCard';
import { Clock, X } from 'lucide-react';
import { motion } from 'framer-motion';
// Inline toast function
function toast(message: string, type: 'success' | 'error' | 'info' = 'success') {
  let container = document.getElementById('__toast_container__') as HTMLDivElement | null;
  if (!container) {
    container = document.createElement('div');
    container.id = '__toast_container__';
    container.style.cssText = 'position:fixed;top:1rem;right:1rem;z-index:9999;display:flex;flex-direction:column;gap:0.5rem;max-width:24rem;width:100%;pointer-events:none;';
    document.body.appendChild(container);
  }
  const colors = { success: '#10b981', error: '#ef4444', info: '#3b82f6' };
  const el = document.createElement('div');
  el.style.cssText = 'pointer-events:auto;background:white;border-radius:0.75rem;box-shadow:0 10px 15px -3px rgba(0,0,0,0.1),0 4px 6px -4px rgba(0,0,0,0.1);border:1px solid #f3f4f6;border-left:4px solid ' + colors[type] + ';padding:0.75rem 1rem;display:flex;align-items:flex-start;gap:0.75rem;transform:translateX(120%);opacity:0;transition:transform 0.3s cubic-bezier(0.34,1.56,0.64,1),opacity 0.3s ease;max-width:100%;';
  el.innerHTML = '<p style="flex:1;font-size:0.875rem;color:#374151;line-height:1.4;margin:0">' + message + '</p><button style="color:#9ca3af;background:none;border:none;cursor:pointer;padding:0;font-size:1rem;line-height:1" aria-label="Close">&times;</button>';
  el.querySelector('button')!.addEventListener('click', () => { el.style.transform = 'translateX(120%)'; el.style.opacity = '0'; setTimeout(() => el.remove(), 300); });
  container.appendChild(el);
  requestAnimationFrame(() => { el.style.transform = 'translateX(0)'; el.style.opacity = '1'; });
  setTimeout(() => { el.style.transform = 'translateX(120%)'; el.style.opacity = '0'; setTimeout(() => el.remove(), 300); }, 4000);
}


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
