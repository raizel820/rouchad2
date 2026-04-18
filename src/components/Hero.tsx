'use client';

import { useStore } from '@/store/store';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowDown } from 'lucide-react';
import { useRef } from 'react';

const floatingShapes = [
  { size: 'w-72 h-72', top: 'top-5', right: 'right-5', delay: 0, duration: 8 },
  { size: 'w-56 h-56', top: 'bottom-16', right: 'left-8', delay: 1.5, duration: 10 },
  { size: 'w-40 h-40', top: 'top-1/2', right: 'right-1/4', delay: 3, duration: 12 },
  { size: 'w-28 h-28', top: 'top-20', right: 'left-1/3', delay: 2, duration: 9 },
];

const productImages = [
  { src: '/products/blush.png', alt: 'Blush', label: 'Blush' },
  { src: '/products/lip-oil.png', alt: 'Lip Oil', label: 'Lip Oil' },
  { src: '/products/highlighter.png', alt: 'Highlighter', label: 'Highlighter' },
  { src: '/products/perfume-rose.png', alt: 'Rose Perfume', label: 'Rose Perfume' },
  { src: '/products/moisturizer.png', alt: 'Moisturizer', label: 'Moisturizer' },
];

const imageVariants = {
  hidden: { opacity: 0, scale: 0.85, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      delay: 0.5 + i * 0.12,
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
};

const floatingDots = [
  { top: 'top-[12%]', left: 'left-[8%]', size: 'w-2 h-2', delay: 0.3, duration: 3 },
  { top: 'top-[25%]', left: 'left-[15%]', size: 'w-1.5 h-1.5', delay: 0.8, duration: 4 },
  { top: 'top-[60%]', left: 'left-[5%]', size: 'w-2.5 h-2.5', delay: 1.2, duration: 3.5 },
  { top: 'top-[75%]', left: 'left-[12%]', size: 'w-1 h-1', delay: 0.5, duration: 5 },
  { top: 'top-[40%]', left: 'left-[20%]', size: 'w-1.5 h-1.5', delay: 2.0, duration: 4.5 },
  { top: 'top-[85%]', right: 'right-[10%]', size: 'w-2 h-2', delay: 1.0, duration: 3.8 },
  { top: 'top-[15%]', right: 'right-[15%]', size: 'w-1.5 h-1.5', delay: 1.8, duration: 4.2 },
  { top: 'top-[50%]', right: 'right-[8%]', size: 'w-1 h-1', delay: 0.7, duration: 5 },
];

export function Hero() {
  const { navigate } = useStore();
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const textY = useTransform(scrollYProgress, [0, 1], [0, 60]);
  const bgY = useTransform(scrollYProgress, [0, 1], [0, -30]);
  const opacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  return (
    <div ref={heroRef} className="relative bg-gradient-to-br from-[#fef5f1] via-[#fdf0eb] to-[#f5e6e0] dark:from-[#1a1215] dark:via-[#1e1518] dark:to-[#1a1215] overflow-hidden">
      {/* Parallax floating background shapes */}
      <motion.div className="absolute inset-0 pointer-events-none" style={{ y: bgY }}>
      {floatingShapes.map((shape, i) => (
        <motion.div
          key={i}
          className={`absolute ${shape.size} ${shape.top} rounded-full bg-[#d4a5a5]/10 dark:bg-[#d4a5a5]/5 blur-3xl pointer-events-none`}
          animate={{
            y: [0, -20, 10, -15, 0],
            x: [0, 12, -8, 15, 0],
            scale: [1, 1.08, 0.95, 1.05, 1],
          }}
          transition={{
            duration: shape.duration,
            delay: shape.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
      </motion.div>

      {/* Sparkle dots near heading area */}
      <div className="absolute top-[18%] left-[4%] hidden lg:block pointer-events-none">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1.5 h-1.5 rounded-full bg-[#d4a5a5]"
            style={{ top: `${i * 18}px`, left: `${i * 12}px` }}
            animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1.2, 0.8] }}
            transition={{ duration: 2, delay: i * 0.4, repeat: Infinity, ease: 'easeInOut' }}
          />
        ))}
      </div>

      {/* Floating decorative dots scattered across the hero */}
      {floatingDots.map((dot, i) => (
        <motion.div
          key={`dot-${i}`}
          className={`absolute ${dot.top} ${dot.left || ''} ${dot.right || ''} ${dot.size} rounded-full bg-[#d4a5a5]/30 dark:bg-[#d4a5a5]/20 pointer-events-none`}
          animate={{
            y: [0, -8, 4, -6, 0],
            opacity: [0.3, 0.8, 0.4, 0.9, 0.3],
          }}
          transition={{
            duration: dot.duration,
            delay: dot.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}

      <motion.div className="container mx-auto px-4 py-16 lg:py-24 relative" style={{ y: textY, opacity }}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left side - Text content */}
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.p
              className="text-sm text-[#8b6f63]/70 dark:text-[#d4a5a5]/60 uppercase tracking-widest"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              Radiance More Than A Season
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="relative"
            >
              <h1 className="text-4xl lg:text-5xl xl:text-6xl font-serif leading-tight">
                <span className="bg-gradient-to-r from-[#8b6f63] via-[#a8877c] to-[#8b6f63] dark:from-[#e8ddd5] dark:via-[#f5ebe3] dark:to-[#e8ddd5] bg-clip-text text-transparent">
                  Let Beauty Be
                </span>
                <br />
                <span className="text-[#d4a5a5]">What You Feel</span>
              </h1>
              {/* Animated gradient underline */}
              <motion.div
                className="h-1 mt-3 rounded-full bg-gradient-to-r from-[#d4a5a5] via-[#e8c4c4] to-[#d4a5a5] dark:from-[#d4a5a5] dark:via-[#f0d0d0] dark:to-[#d4a5a5]"
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: '100%', opacity: 1 }}
                transition={{ delay: 0.7, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              />
            </motion.div>

            <motion.p
              className="text-[#8b6f63]/70 dark:text-[#e8ddd5]/60 max-w-md text-base lg:text-lg"
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
                className="relative px-8 py-3 bg-gradient-to-r from-[#d4a5a5] to-[#c89a9a] text-white rounded-full transition-all duration-300 active:scale-95 cursor-pointer group overflow-hidden hover:shadow-[0_0_24px_rgba(212,165,165,0.5)]"
              >
                <span className="relative z-10">Shop Now</span>
                <span className="absolute inset-0 bg-gradient-to-r from-[#c89a9a] to-[#d4a5a5] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </button>
              <button
                onClick={() => navigate('products')}
                className="px-8 py-3 border-2 border-[#d4a5a5] text-[#d4a5a5] rounded-full hover:bg-[#d4a5a5] hover:text-white transition-all duration-300 active:scale-95 cursor-pointer hover:shadow-[0_0_20px_rgba(212,165,165,0.3)]"
              >
                View Collection
              </button>
            </motion.div>

            {/* Stats with separator */}
            <motion.div
              className="flex gap-8 pt-6 border-t border-[#d4a5a5]/20 dark:border-[#d4a5a5]/15"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              <div>
                <p className="text-2xl font-serif text-[#8b6f63] dark:text-[#e8ddd5]">200+</p>
                <p className="text-xs text-[#8b6f63]/70 dark:text-[#e8ddd5]/50">Products</p>
              </div>
              <div>
                <p className="text-2xl font-serif text-[#8b6f63] dark:text-[#e8ddd5]">50K+</p>
                <p className="text-xs text-[#8b6f63]/70 dark:text-[#e8ddd5]/50">Happy Customers</p>
              </div>
              <div>
                <p className="text-2xl font-serif text-[#8b6f63] dark:text-[#e8ddd5]">4.9</p>
                <p className="text-xs text-[#8b6f63]/70 dark:text-[#e8ddd5]/50">Average Rating</p>
              </div>
            </motion.div>
          </motion.div>

          {/* Right side - Product image collage */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="relative min-h-[420px] lg:min-h-[520px]">
              {/* Decorative rose-gold circular frames */}
              <div className="absolute w-56 h-56 lg:w-72 lg:h-72 rounded-full border-2 border-[#d4a5a5]/20 dark:border-[#d4a5a5]/10 -top-4 right-0 lg:right-4" />
              <div className="absolute w-40 h-40 lg:w-52 lg:h-52 rounded-full border-2 border-[#d4a5a5]/15 dark:border-[#d4a5a5]/8 bottom-4 -left-4 lg:bottom-8" />
              <div className="absolute w-24 h-24 lg:w-32 lg:h-32 rounded-full bg-[#d4a5a5]/8 dark:bg-[#d4a5a5]/5 top-1/2 left-1/3" />

              {/* Main large image - blush */}
              <motion.div
                className="absolute top-0 right-0 lg:top-2 lg:right-4 z-20"
                custom={0}
                variants={imageVariants}
                initial="hidden"
                animate="visible"
              >
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-br from-[#d4a5a5]/30 to-[#d4a5a5]/5 rounded-2xl blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative w-48 h-56 lg:w-56 lg:h-64 rounded-2xl overflow-hidden shadow-lg shadow-[#d4a5a5]/15 dark:shadow-[#d4a5a5]/10 ring-1 ring-white/50 dark:ring-[#3d2f34]/50 bg-white dark:bg-[#2d1f24] p-3 transition-transform duration-500 group-hover:scale-[1.03]">
                    <img
                      src={productImages[0].src}
                      alt={productImages[0].alt}
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
              </motion.div>

              {/* Secondary image - lip oil */}
              <motion.div
                className="absolute top-12 left-0 lg:top-16 lg:left-2 z-10"
                custom={1}
                variants={imageVariants}
                initial="hidden"
                animate="visible"
              >
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-br from-[#d4a5a5]/25 to-[#d4a5a5]/5 rounded-xl blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative w-36 h-44 lg:w-44 lg:h-52 rounded-xl overflow-hidden shadow-md shadow-[#d4a5a5]/10 dark:shadow-[#d4a5a5]/5 ring-1 ring-white/50 dark:ring-[#3d2f34]/50 bg-white dark:bg-[#2d1f24] p-2.5 transition-transform duration-500 group-hover:scale-[1.04]">
                    <img
                      src={productImages[1].src}
                      alt={productImages[1].alt}
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
              </motion.div>

              {/* Bottom left - highlighter */}
              <motion.div
                className="absolute bottom-16 left-0 lg:bottom-20 lg:left-4 z-20"
                custom={2}
                variants={imageVariants}
                initial="hidden"
                animate="visible"
              >
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-br from-[#d4a5a5]/25 to-[#d4a5a5]/5 rounded-xl blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative w-32 h-40 lg:w-40 lg:h-48 rounded-xl overflow-hidden shadow-md shadow-[#d4a5a5]/10 dark:shadow-[#d4a5a5]/5 ring-1 ring-white/50 dark:ring-[#3d2f34]/50 bg-white dark:bg-[#2d1f24] p-2.5 transition-transform duration-500 group-hover:scale-[1.04]">
                    <img
                      src={productImages[2].src}
                      alt={productImages[2].alt}
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
              </motion.div>

              {/* Bottom center - perfume rose */}
              <motion.div
                className="absolute bottom-4 left-1/2 -translate-x-1/2 lg:bottom-8 lg:left-1/2 z-10"
                custom={3}
                variants={imageVariants}
                initial="hidden"
                animate="visible"
              >
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-br from-[#d4a5a5]/25 to-[#d4a5a5]/5 rounded-xl blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative w-28 h-36 lg:w-36 lg:h-44 rounded-xl overflow-hidden shadow-md shadow-[#d4a5a5]/10 dark:shadow-[#d4a5a5]/5 ring-1 ring-white/50 dark:ring-[#3d2f34]/50 bg-white dark:bg-[#2d1f24] p-2 transition-transform duration-500 group-hover:scale-[1.05]">
                    <img
                      src={productImages[3].src}
                      alt={productImages[3].alt}
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
              </motion.div>

              {/* Top right small - moisturizer */}
              <motion.div
                className="absolute top-0 right-36 lg:top-4 lg:right-52 z-10"
                custom={4}
                variants={imageVariants}
                initial="hidden"
                animate="visible"
              >
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-br from-[#d4a5a5]/20 to-[#d4a5a5]/5 rounded-lg blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative w-24 h-28 lg:w-28 lg:h-34 rounded-lg overflow-hidden shadow-sm shadow-[#d4a5a5]/10 dark:shadow-[#d4a5a5]/5 ring-1 ring-white/50 dark:ring-[#3d2f34]/50 bg-white dark:bg-[#2d1f24] p-2 transition-transform duration-500 group-hover:scale-[1.05]">
                    <img
                      src={productImages[4].src}
                      alt={productImages[4].alt}
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
        {/* Scroll Down Indicator */}
        <motion.div
          className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
        >
          <span className="text-xs text-[#8b6f63]/50 dark:text-[#a89898]/40 uppercase tracking-widest">Explore</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            <ArrowDown size={18} className="text-[#d4a5a5]/60" />
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}
