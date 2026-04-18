'use client';

import { useStore } from '@/store/store';
import { motion } from 'framer-motion';

export function Hero() {
  const { navigate } = useStore();

  return (
    <div className="relative bg-gradient-to-br from-[#fef5f1] via-[#fdf0eb] to-[#f5e6e0] overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-10 right-10 w-64 h-64 bg-[#d4a5a5]/10 rounded-full blur-3xl" />
      <div className="absolute bottom-10 left-10 w-48 h-48 bg-[#d4a5a5]/15 rounded-full blur-2xl" />
      <div className="absolute top-1/2 right-1/4 w-32 h-32 bg-[#8b6f63]/5 rounded-full blur-2xl" />

      <div className="container mx-auto px-4 py-16 lg:py-24 relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.p
              className="text-sm text-[#8b6f63]/70 uppercase tracking-widest"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              Radiance More Than A Season
            </motion.p>
            <motion.h1
              className="text-4xl lg:text-5xl xl:text-6xl font-serif text-[#8b6f63] leading-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              Let Beauty Be
              <br />
              <span className="text-[#d4a5a5]">What You Feel</span>
            </motion.h1>
            <motion.p
              className="text-[#8b6f63]/70 max-w-md"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              Discover our collection of premium cosmetics designed to enhance your natural beauty and confidence.
            </motion.p>
            <motion.div
              className="flex flex-wrap gap-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <button
                onClick={() => navigate('products')}
                className="px-8 py-3 bg-[#d4a5a5] text-white rounded-full hover:bg-[#c89a9a] transition-all hover:shadow-lg hover:shadow-[#d4a5a5]/25 active:scale-95"
              >
                Shop Now
              </button>
              <button
                onClick={() => navigate('products')}
                className="px-8 py-3 border-2 border-[#d4a5a5] text-[#d4a5a5] rounded-full hover:bg-[#d4a5a5] hover:text-white transition-all active:scale-95"
              >
                View Collection
              </button>
            </motion.div>

            {/* Stats */}
            <motion.div
              className="flex gap-8 pt-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              <div>
                <p className="text-2xl font-serif text-[#8b6f63]">200+</p>
                <p className="text-xs text-[#8b6f63]/70">Products</p>
              </div>
              <div>
                <p className="text-2xl font-serif text-[#8b6f63]">50K+</p>
                <p className="text-xs text-[#8b6f63]/70">Happy Customers</p>
              </div>
              <div>
                <p className="text-2xl font-serif text-[#8b6f63]">4.9</p>
                <p className="text-xs text-[#8b6f63]/70">Average Rating</p>
              </div>
            </motion.div>
          </motion.div>

          <motion.div
            className="relative"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="relative bg-gradient-to-br from-[#f5e6e0] to-[#d4a5a5]/30 rounded-2xl aspect-square flex items-center justify-center overflow-hidden">
              {/* Decorative circles */}
              <div className="absolute w-80 h-80 rounded-full bg-[#d4a5a5]/10 -top-10 -right-10" />
              <div className="absolute w-60 h-60 rounded-full bg-[#8b6f63]/5 bottom-0 left-0" />

              <div className="text-center z-10 p-8">
                <div className="w-24 h-24 bg-[#d4a5a5]/20 rounded-full mx-auto mb-6 flex items-center justify-center">
                  <span className="text-5xl">✨</span>
                </div>
                <h3 className="text-2xl font-serif text-[#8b6f63] mb-2">Premium Beauty</h3>
                <p className="text-sm text-[#8b6f63]/70">Cruelty-free & Vegan</p>
                <div className="flex justify-center gap-4 mt-6">
                  <div className="w-16 h-16 bg-white/60 rounded-xl flex items-center justify-center shadow-sm">
                    <span className="text-2xl">🌸</span>
                  </div>
                  <div className="w-16 h-16 bg-white/60 rounded-xl flex items-center justify-center shadow-sm">
                    <span className="text-2xl">💎</span>
                  </div>
                  <div className="w-16 h-16 bg-white/60 rounded-xl flex items-center justify-center shadow-sm">
                    <span className="text-2xl">🌹</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
