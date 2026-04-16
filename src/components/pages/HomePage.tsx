'use client';

import { useEffect, useState } from 'react';
import { useStore } from '@/store/store';
import { Hero } from '@/components/Hero';
import { ProductCard } from '@/components/ProductCard';
import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';

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
                <div className="aspect-square bg-[#fef5f1] rounded-xl" />
                <div className="mt-4 h-4 bg-[#fef5f1] rounded w-3/4" />
                <div className="mt-2 h-4 bg-[#fef5f1] rounded w-1/2" />
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
            { subtitle: 'COLLECTION', title: 'SALE\n25% OFF', desc: 'On Everything', cat: 'All' },
            { subtitle: 'SKINCARE', title: 'Get Upto 30% Off\nBest Skincare Picks', desc: 'Natural Beauty', cat: 'Skincare' },
            { subtitle: 'WELLNESS', title: 'Health &\nBeauty Treatments', desc: 'Wellness Range', cat: 'All' },
          ].map((banner, idx) => (
            <motion.div
              key={idx}
              className={`${idx === 1 ? 'bg-[#e8f5e9]' : 'bg-[#fef5f1]'} rounded-xl p-8 relative overflow-hidden hover:shadow-md transition-shadow cursor-pointer`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * idx }}
              onClick={() => handleCategoryClick(banner.cat)}
            >
              <div className="relative z-10">
                <p className="text-sm text-[#8b6f63]/70 mb-2">{banner.subtitle}</p>
                <h3 className="text-2xl font-serif text-[#8b6f63] mb-4 whitespace-pre-line">{banner.title}</h3>
                <p className="text-sm text-[#8b6f63]/70 mb-4">{banner.desc}</p>
                <span className="inline-block px-6 py-2 bg-[#d4a5a5] text-white text-sm rounded-full hover:bg-[#c89a9a] transition-colors">
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
          <h2 className="text-3xl font-serif text-[#8b6f63] mb-2">Glow Naturally with Rare Beauty</h2>
          <div className="flex justify-center gap-6 mt-6 text-sm">
            {categories.map((cat) => (
              <button key={cat} onClick={() => handleCategoryClick(cat)} className="text-[#8b6f63] hover:text-[#d4a5a5] transition-colors">
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
            className="inline-block px-8 py-3 border-2 border-[#d4a5a5] text-[#d4a5a5] rounded-full hover:bg-[#d4a5a5] hover:text-white transition-all active:scale-95"
          >
            View All Products
          </button>
        </div>
      </section>

      {/* Bottom Banners */}
      <section className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { subtitle: 'COLLECTION', title: 'Super Natural Beauty', cat: 'Skincare', emoji: '🌿' },
            { subtitle: 'TOP PRODUCT', title: '10% Off\nBody Butter', cat: 'Skincare', emoji: '🧴' },
          ].map((banner, idx) => (
            <motion.div
              key={idx}
              className="bg-[#fef5f1] rounded-xl p-8 flex items-center gap-6 hover:shadow-md transition-shadow cursor-pointer"
              initial={{ opacity: 0, x: idx === 0 ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              onClick={() => handleCategoryClick(banner.cat)}
            >
              <div className="flex-1">
                <p className="text-sm text-[#8b6f63]/70 mb-2">{banner.subtitle}</p>
                <h3 className="text-2xl font-serif text-[#8b6f63] mb-4 whitespace-pre-line">{banner.title}</h3>
                <span className="inline-block px-6 py-2 bg-[#d4a5a5] text-white text-sm rounded-full hover:bg-[#c89a9a] transition-colors">
                  Shop Now
                </span>
              </div>
              <div className="w-32 h-32 bg-gradient-to-br from-[#d4a5a5]/20 to-[#8b6f63]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="text-5xl">{banner.emoji}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: '🚚', title: 'Free Shipping', desc: 'On orders over $50' },
            { icon: '↩️', title: 'Easy Returns', desc: '30-day return policy' },
            { icon: '🔒', title: 'Secure Payment', desc: '100% secure checkout' },
            { icon: '💬', title: '24/7 Support', desc: 'Dedicated support' },
          ].map((feature, idx) => (
            <motion.div
              key={idx}
              className="text-center p-6 bg-white rounded-xl shadow-sm border border-[#f5e6e0]/50"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * idx }}
            >
              <span className="text-3xl mb-3 block">{feature.icon}</span>
              <h3 className="text-[#8b6f63] font-medium mb-1">{feature.title}</h3>
              <p className="text-sm text-[#8b6f63]/70">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-[#fef5f1] py-16">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-serif text-[#8b6f63] mb-2">What Our Customers Say</h2>
            <p className="text-[#8b6f63]/60 mt-2">Real reviews from real beauty lovers</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {testimonials.map((testimonial, idx) => (
              <motion.div
                key={idx}
                className="bg-white rounded-xl p-6 shadow-sm border border-[#f5e6e0]/50 relative"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.5, delay: 0.15 * idx }}
              >
                <Quote size={28} className="text-[#d4a5a5]/20 absolute top-4 right-4" />
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      className={i < testimonial.rating ? 'fill-[#d4a5a5] text-[#d4a5a5]' : 'text-[#8b6f63]/20'}
                    />
                  ))}
                </div>
                <p className="text-sm text-[#8b6f63]/70 leading-relaxed mb-6">{testimonial.text}</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#d4a5a5] to-[#8b6f63] flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xs font-semibold">{testimonial.initials}</span>
                  </div>
                  <span className="text-sm font-medium text-[#8b6f63]">{testimonial.name}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
