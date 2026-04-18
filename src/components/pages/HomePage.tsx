'use client';

import { useEffect, useState } from 'react';
import { useStore } from '@/store/store';
import { Hero } from '@/components/Hero';
import { ProductCard } from '@/components/ProductCard';
import { RecentlyViewedSection } from '@/components/RecentlyViewedSection';
import { motion } from 'framer-motion';
import {
  Star,
  Quote,
  Truck,
  RotateCcw,
  ShieldCheck,
  MessageCircle,
  ArrowRight,
  BadgeCheck,
} from 'lucide-react';

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

const testimonials = [
  {
    name: 'Sarah Mitchell',
    initials: 'SM',
    text: 'Rare Beauty has completely transformed my makeup routine. The products are incredibly lightweight yet provide amazing coverage. I especially love the Liquid Touch Foundation — it looks like my skin but better!',
    rating: 5,
  },
  {
    name: 'Emily Chen',
    initials: 'EC',
    text: 'The skincare collection is absolutely divine. My skin has never felt so hydrated and radiant. The Glow Wand is my holy grail product — I use it every single day and always get compliments!',
    rating: 5,
  },
  {
    name: 'Jessica Rivera',
    initials: 'JR',
    text: "I was skeptical at first, but Rare Beauty exceeded all my expectations. The Lip Soufflé in the shade Joy is the most beautiful lip color I've ever worn. Plus, I love that they're cruelty-free!",
    rating: 4,
  },
];

const features = [
  { icon: Truck, title: 'Free Shipping', desc: 'On orders over $50' },
  { icon: RotateCcw, title: 'Easy Returns', desc: '30-day return policy' },
  { icon: ShieldCheck, title: 'Secure Payment', desc: '100% secure checkout' },
  { icon: MessageCircle, title: '24/7 Support', desc: 'Dedicated support' },
];

const marqueeItems = ['Vogue', 'Elle', 'Allure', 'Harper\'s Bazaar', 'Cosmopolitan', 'Glamour', 'InStyle', 'Marie Claire'];

export function HomePage() {
  const { navigate, setSelectedCategory } = useStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/products')
      .then((r) => r.json())
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const featuredProducts = products.slice(0, 4);
  const categories = ['Makeup', 'Skincare', 'Haircare', 'Perfume'];

  const handleCategoryClick = (cat: string) => {
    setSelectedCategory(cat);
    navigate('products');
  };

  if (loading) {
    return (
      <div>
        <Hero />
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-square bg-[#fef5f1] dark:bg-[#2d1f24] rounded-xl" />
                <div className="mt-4 h-4 bg-[#fef5f1] dark:bg-[#2d1f24] rounded w-3/4" />
                <div className="mt-2 h-4 bg-[#fef5f1] dark:bg-[#2d1f24] rounded w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Hero />

      {/* Promotional Banners */}
      <section className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              subtitle: 'COLLECTION',
              title: 'SALE\n25% OFF',
              desc: 'On Everything',
              cat: 'All',
              gradient: 'from-[#d4a5a5]/90 to-[#c07e6e]/80',
              image: '/products/blush.png',
              darkGradient: 'from-[#3d2f34]/95 to-[#2d1f24]/90',
            },
            {
              subtitle: 'SKINCARE',
              title: 'Get Upto 30% Off\nBest Skincare Picks',
              desc: 'Natural Beauty',
              cat: 'Skincare',
              gradient: 'from-[#a8d8b9]/85 to-[#7ec8a0]/75',
              image: '/products/moisturizer.png',
              darkGradient: 'from-[#2d3d2f]/95 to-[#1f2d24]/90',
            },
            {
              subtitle: 'WELLNESS',
              title: 'Health &\nBeauty Treatments',
              desc: 'Wellness Range',
              cat: 'All',
              gradient: 'from-[#e8b4c8]/85 to-[#d4a5a5]/80',
              image: '/products/serum.png',
              darkGradient: 'from-[#3d2f34]/95 to-[#2d1f24]/90',
            },
          ].map((banner, idx) => (
            <motion.div
              key={idx}
              className="rounded-xl p-10 relative overflow-hidden cursor-pointer group min-h-[220px] hover:shadow-lg transition-shadow"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * idx }}
              onClick={() => handleCategoryClick(banner.cat)}
            >
              {/* Gradient overlay */}
              <div className={`absolute inset-0 bg-gradient-to-br ${banner.gradient} dark:${banner.darkGradient}`} />
              {/* Product image thumbnail */}
              <img
                src={banner.image}
                alt=""
                className="absolute bottom-0 right-0 w-36 h-36 object-contain opacity-25 group-hover:opacity-35 transition-opacity pointer-events-none translate-x-4 translate-y-2"
              />
              <div className="relative z-10">
                <p className="text-sm text-white/80 mb-2 font-medium tracking-wider">{banner.subtitle}</p>
                <h3 className="text-2xl font-serif text-white mb-4 whitespace-pre-line leading-tight">{banner.title}</h3>
                <p className="text-sm text-white/70 mb-5">{banner.desc}</p>
                <span className="inline-block px-6 py-2.5 bg-white text-[#8b6f63] text-sm rounded-full hover:bg-white/90 hover:scale-105 active:scale-95 transition-all shadow-sm font-medium">
                  {idx === 1 ? 'Discover' : 'Shop Now'}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-serif text-[#8b6f63] dark:text-[#e8ddd5] mb-2">Glow Naturally with Rare Beauty</h2>
          {/* Animated decorative divider */}
          <motion.div
            className="h-[2px] bg-gradient-to-r from-transparent via-[#d4a5a5] to-transparent mx-auto mt-4 mb-3"
            initial={{ width: 0 }}
            whileInView={{ width: '80%' }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
          {/* AS SEEN IN marquee */}
          <p className="text-xs tracking-[0.25em] text-[#8b6f63]/50 dark:text-[#e8ddd5]/40 font-medium uppercase mb-4">As Seen In</p>
          <div className="flex justify-center gap-8 mt-4 text-sm overflow-hidden">
            <div className="flex animate-marquee gap-8">
              {[...marqueeItems, ...marqueeItems].map((mag, i) => (
                <span key={i} className="text-[#8b6f63]/40 dark:text-[#e8ddd5]/30 font-serif italic text-base whitespace-nowrap hover:text-[#d4a5a5] transition-colors">
                  {mag}
                </span>
              ))}
            </div>
          </div>
          <div className="flex justify-center gap-6 mt-8 text-sm">
            {categories.map((cat) => (
              <button key={cat} onClick={() => handleCategoryClick(cat)} className="text-[#8b6f63] dark:text-[#e8ddd5]/70 hover:text-[#d4a5a5] dark:hover:text-[#d4a5a5] transition-colors">
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {featuredProducts.map((product, idx) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * idx }}
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </div>

        <div className="text-center">
          <button
            onClick={() => handleCategoryClick('All')}
            className="inline-flex items-center gap-2 px-8 py-3 border-2 border-[#d4a5a5] text-[#d4a5a5] rounded-full hover:bg-[#d4a5a5] hover:text-white transition-all active:scale-95"
          >
            View All Products
            <ArrowRight size={16} />
          </button>
        </div>
      </section>

      {/* Bottom Banners */}
      <section className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            {
              subtitle: 'COLLECTION',
              title: 'Super Natural Beauty',
              cat: 'Skincare',
              image: '/products/moisturizer.png',
              gradient: 'from-[#a8d8b9]/30 to-[#fef5f1]/60',
              darkGradient: 'from-[#2d3d2f]/50 to-[#2d1f24]/80',
            },
            {
              subtitle: 'TOP PRODUCT',
              title: '10% Off\nBody Butter',
              cat: 'Skincare',
              image: '/products/body-butter.png',
              gradient: 'from-[#d4a5a5]/30 to-[#fef5f1]/60',
              darkGradient: 'from-[#3d2f34]/50 to-[#2d1f24]/80',
            },
          ].map((banner, idx) => (
            <motion.div
              key={idx}
              className="rounded-xl p-8 flex items-center gap-6 hover:shadow-lg transition-shadow cursor-pointer relative overflow-hidden bg-[#fef5f1] dark:bg-[#2d1f24]"
              initial={{ opacity: 0, x: idx === 0 ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              onClick={() => handleCategoryClick(banner.cat)}
            >
              {/* Gradient overlay */}
              <div className={`absolute inset-0 bg-gradient-to-br ${banner.gradient} dark:${banner.darkGradient} pointer-events-none`} />
              <div className="flex-1 relative z-10">
                <p className="text-sm text-[#8b6f63]/70 dark:text-[#e8ddd5]/50 mb-2 font-medium tracking-wider">{banner.subtitle}</p>
                <h3 className="text-2xl font-serif text-[#8b6f63] dark:text-[#e8ddd5] mb-4 whitespace-pre-line leading-tight">{banner.title}</h3>
                <span className="inline-block px-6 py-2.5 bg-[#d4a5a5] text-white text-sm rounded-full hover:bg-[#c89a9a] hover:scale-105 active:scale-95 transition-all shadow-sm font-medium">
                  Shop Now
                </span>
              </div>
              <div className="w-36 h-36 rounded-xl overflow-hidden flex-shrink-0 relative z-10">
                <img
                  src={banner.image}
                  alt={banner.title}
                  className="w-full h-full object-contain"
                />
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, idx) => {
            const IconComponent = feature.icon;
            return (
              <motion.div
                key={idx}
                className="text-center p-6 bg-white dark:bg-[#2d1f24] rounded-xl shadow-sm border border-[#f5e6e0]/50 dark:border-[#3d2f34] hover:shadow-md transition-shadow"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * idx }}
              >
                <div className="inline-flex items-center justify-center w-14 h-14 bg-[#fef5f1] dark:bg-[#3d2f34] rounded-full p-3 mb-4">
                  <IconComponent size={24} className="text-[#d4a5a5]" />
                </div>
                <h3 className="text-[#8b6f63] dark:text-[#e8ddd5] font-medium mb-1">{feature.title}</h3>
                <p className="text-sm text-[#8b6f63]/70 dark:text-[#e8ddd5]/50">{feature.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Recently Viewed */}
      <RecentlyViewedSection />

      {/* Testimonials */}
      <section className="bg-[#fef5f1] dark:bg-[#1a1215] py-16">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-serif text-[#8b6f63] dark:text-[#e8ddd5] mb-2">What Our Customers Say</h2>
            <p className="text-[#8b6f63]/60 dark:text-[#e8ddd5]/40 mt-2">Real reviews from real beauty lovers</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {testimonials.map((testimonial, idx) => (
              <motion.div
                key={idx}
                className="bg-white dark:bg-[#2d1f24] rounded-xl p-6 shadow-sm border border-[#f5e6e0]/50 dark:border-[#3d2f34] relative"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.6, delay: 0.15 * idx }}
              >
                <Quote size={40} className="text-[#d4a5a5]/15 dark:text-[#d4a5a5]/10 absolute top-4 right-4" />
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      className={i < testimonial.rating ? 'fill-[#d4a5a5] text-[#d4a5a5]' : 'text-[#8b6f63]/20 dark:text-[#e8ddd5]/20'}
                    />
                  ))}
                </div>
                <p className="text-sm text-[#8b6f63]/70 dark:text-[#e8ddd5]/60 leading-relaxed mb-6">{testimonial.text}</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#d4a5a5] to-[#8b6f63] flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xs font-semibold">{testimonial.initials}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-[#8b6f63] dark:text-[#e8ddd5]">{testimonial.name}</span>
                    <span className="inline-flex items-center gap-1 text-[10px] text-[#d4a5a5] dark:text-[#d4a5a5]/80 font-medium">
                      <BadgeCheck size={10} />
                      Verified Purchase
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
