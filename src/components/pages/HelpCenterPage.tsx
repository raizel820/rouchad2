'use client';

import { useState, useMemo } from 'react';
import { useStore } from '@/store/store';
import { HelpCircle, ChevronDown, Search, Package, CreditCard, Truck, RotateCcw, MessageCircle, TrendingUp, ThumbsUp, ThumbsDown, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const categories = [
  { icon: <Package size={24} />, label: 'Orders', desc: 'Order status, modifications, cancellations' },
  { icon: <Truck size={24} />, label: 'Shipping', desc: 'Delivery times, tracking, shipping options' },
  { icon: <CreditCard size={24} />, label: 'Payment', desc: 'Payment methods, billing, gift cards' },
  { icon: <RotateCcw size={24} />, label: 'Returns', desc: 'Return policy, exchanges, refunds' },
];

const faqs = [
  { category: 'Orders', q: 'How can I check my order status?', a: 'You can check your order status by going to our Track Order page and entering your order number. You can also log into your account to view all your orders and their current status.' },
  { category: 'Orders', q: 'Can I modify or cancel my order?', a: 'Orders can be modified or cancelled within 1 hour of placement. After that, orders enter processing and cannot be changed. Please contact our support team immediately if you need to make changes.' },
  { category: 'Orders', q: 'Do you offer gift wrapping?', a: 'Yes! We offer complimentary gift wrapping on all orders. You can select the gift wrap option during checkout. We also include a personalized message card with your gift.' },
  { category: 'Shipping', q: 'What are your shipping options?', a: 'We offer Standard Shipping (5-7 business days, free on orders over $50), Express Shipping (2-3 business days, $9.99), and Next Day Delivery (1 business day, $19.99).' },
  { category: 'Shipping', q: 'Do you ship internationally?', a: 'Yes, we ship to over 50 countries worldwide. International shipping rates and delivery times vary by destination. Import duties and taxes may apply.' },
  { category: 'Shipping', q: 'How do I track my package?', a: "Once your order ships, you'll receive an email with a tracking number. You can also track your order on our Track Order page." },
  { category: 'Payment', q: 'What payment methods do you accept?', a: 'We accept all major credit cards (Visa, MasterCard, Amex), PayPal, Apple Pay, Google Pay, and Afterpay for buy-now-pay-later.' },
  { category: 'Payment', q: 'Is my payment information secure?', a: 'Absolutely. We use industry-standard SSL encryption and never store your full credit card details. All transactions are processed through secure PCI-compliant payment gateways.' },
  { category: 'Returns', q: 'What is your return policy?', a: 'We offer a 30-day return policy on unused and unopened items in their original packaging. Visit our Returns & Refunds page for full details.' },
  { category: 'Returns', q: 'How long do refunds take?', a: 'Refunds are processed within 5-7 business days after we receive and inspect your returned items. The refund will be applied to your original payment method.' },
];

const popularTopics = [
  'Order tracking',
  'Return policy',
  'Shipping time',
  'Gift wrapping',
  'Payment methods',
  'International shipping',
];

function highlightText(text: string, query: string) {
  if (!query.trim()) return text;
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);
  return parts.map((part, i) =>
    regex.test(part) ? (
      <span key={i} className="text-[#d4a5a5] dark:text-[#d4a5a5] font-semibold bg-[#d4a5a5]/10 dark:bg-[#d4a5a5]/15 px-0.5 rounded">{part}</span>
    ) : (
      part
    )
  );
}

export function HelpCenterPage() {
  const { navigate } = useStore();
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [helpfulRatings, setHelpfulRatings] = useState<Record<number, 'up' | 'down'>>({});

  const filteredFaqs = useMemo(() => {
    return faqs.filter((faq) => {
      const matchesCategory = activeCategory === 'All' || faq.category === activeCategory;
      const matchesSearch = !searchQuery || faq.q.toLowerCase().includes(searchQuery.toLowerCase()) || faq.a.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { All: faqs.length };
    faqs.forEach((faq) => {
      counts[faq.category] = (counts[faq.category] || 0) + 1;
    });
    return counts;
  }, []);

  const handleRate = (faqIdx: number, rating: 'up' | 'down') => {
    setHelpfulRatings((prev) => {
      if (prev[faqIdx] === rating) return { ...prev, [faqIdx]: undefined as unknown as 'up' };
      return { ...prev, [faqIdx]: rating };
    });
  };

  return (
    <div className="min-h-screen">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-[#fef5f1] to-[#f5e6e0] dark:from-[#2d1f24] dark:to-[#3d2f34] py-16">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            className="w-16 h-16 bg-[#d4a5a5]/20 dark:bg-[#d4a5a5]/10 rounded-full flex items-center justify-center mx-auto mb-4"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <HelpCircle className="text-[#d4a5a5]" size={32} />
          </motion.div>
          <motion.h1
            className="text-4xl font-serif text-[#8b6f63] dark:text-[#e8ddd5] mb-4"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Help Center
          </motion.h1>
          <motion.p
            className="text-[#8b6f63]/70 dark:text-[#e8ddd5]/50 max-w-md mx-auto mb-8"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            Find answers to common questions and get the help you need.
          </motion.p>

          {/* Search with clear button */}
          <motion.div
            className="max-w-lg mx-auto relative"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8b6f63]/50 dark:text-[#e8ddd5]/30" size={20} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for help..."
              className="w-full pl-12 pr-10 py-3 bg-white dark:bg-[#3d2f34] rounded-full text-sm text-[#8b6f63] dark:text-[#e8ddd5] placeholder:text-[#8b6f63]/40 dark:placeholder:text-[#e8ddd5]/30 focus:outline-none focus:ring-2 focus:ring-[#d4a5a5] shadow-sm border border-[#f5e6e0] dark:border-[#3d2f34]/60"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8b6f63]/40 dark:text-[#e8ddd5]/30 hover:text-[#8b6f63] dark:hover:text-[#e8ddd5] transition-colors"
              >
                <X size={16} />
              </button>
            )}
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Popular Topics */}
        <motion.div
          className="max-w-3xl mx-auto mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={18} className="text-[#d4a5a5]" />
            <h3 className="text-sm font-medium text-[#8b6f63] dark:text-[#e8ddd5] uppercase tracking-wider">Popular Topics</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {popularTopics.map((topic, idx) => (
              <motion.button
                key={topic}
                onClick={() => setSearchQuery(topic)}
                className="px-4 py-1.5 rounded-full bg-white dark:bg-[#2d1f24] border border-[#f5e6e0] dark:border-[#3d2f34]
                  text-sm text-[#8b6f63] dark:text-[#e8ddd5]/70 hover:border-[#d4a5a5] dark:hover:border-[#d4a5a5] hover:text-[#d4a5a5] dark:hover:text-[#d4a5a5] transition-all duration-200"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.05 * idx }}
                whileHover={{ scale: 1.05 }}
              >
                {topic}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Categories with count badges */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 max-w-3xl mx-auto mb-12">
          <motion.button
            onClick={() => setActiveCategory('All')}
            className={`p-4 rounded-xl text-center transition-all duration-200 ${
              activeCategory === 'All'
                ? 'bg-[#d4a5a5] text-white shadow-md shadow-[#d4a5a5]/20'
                : 'bg-white dark:bg-[#2d1f24] text-[#8b6f63] dark:text-[#e8ddd5] hover:bg-[#fef5f1] dark:hover:bg-[#3d2f34] shadow-sm border border-[#f5e6e0] dark:border-[#3d2f34]'
            }`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p className="text-sm font-medium">All</p>
            <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${
              activeCategory === 'All'
                ? 'bg-white/20 text-white'
                : 'bg-[#fef5f1] dark:bg-[#3d2f34] text-[#d4a5a5]'
            }`}>{categoryCounts['All']}</span>
          </motion.button>
          {categories.map((cat, idx) => (
            <motion.button
              key={cat.label}
              onClick={() => setActiveCategory(activeCategory === cat.label ? 'All' : cat.label)}
              className={`p-4 rounded-xl text-center transition-all duration-200 ${
                activeCategory === cat.label
                  ? 'bg-[#d4a5a5] text-white shadow-md shadow-[#d4a5a5]/20'
                  : 'bg-white dark:bg-[#2d1f24] text-[#8b6f63] dark:text-[#e8ddd5] hover:bg-[#fef5f1] dark:hover:bg-[#3d2f34] shadow-sm border border-[#f5e6e0] dark:border-[#3d2f34]'
              }`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * (idx + 1) }}
            >
              <div className={`mx-auto mb-2 ${activeCategory === cat.label ? 'text-white' : 'text-[#d4a5a5]'}`}>{cat.icon}</div>
              <p className="text-sm font-medium">{cat.label}</p>
              <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                activeCategory === cat.label
                  ? 'bg-white/20 text-white'
                  : 'bg-[#fef5f1] dark:bg-[#3d2f34] text-[#d4a5a5]'
              }`}>{categoryCounts[cat.label] || 0}</span>
            </motion.button>
          ))}
        </div>

        {/* FAQ List */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-xl font-serif text-[#8b6f63] dark:text-[#e8ddd5] mb-6">
            {searchQuery ? `Results for "${searchQuery}"` : activeCategory === 'All' ? 'All Questions' : `${activeCategory} Questions`}
            <span className="text-sm text-[#8b6f63]/50 dark:text-[#e8ddd5]/40 ml-2">({filteredFaqs.length})</span>
          </h2>

          {filteredFaqs.length === 0 ? (
            <motion.div
              className="text-center py-12"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#fef5f1] dark:bg-[#3d2f34] flex items-center justify-center">
                <HelpCircle size={32} className="text-[#8b6f63]/20 dark:text-[#e8ddd5]/20" />
              </div>
              <p className="text-[#8b6f63]/70 dark:text-[#e8ddd5]/60 mb-1">No results found for &quot;{searchQuery}&quot;</p>
              <p className="text-sm text-[#8b6f63]/50 dark:text-[#e8ddd5]/40 mb-4">Try searching with different keywords or browse by category.</p>
              <button
                onClick={() => setSearchQuery('')}
                className="px-4 py-2 bg-[#d4a5a5] text-white rounded-full text-sm hover:bg-[#c89a9a] transition-colors"
              >
                Clear Search
              </button>
            </motion.div>
          ) : (
            <div className="space-y-3">
              {filteredFaqs.map((faq, idx) => (
                <motion.div
                  key={idx}
                  className="bg-white dark:bg-[#2d1f24] rounded-xl border border-[#f5e6e0] dark:border-[#3d2f34] overflow-hidden"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.03 * idx }}
                  layout
                >
                  <button
                    onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                    className="w-full flex items-center gap-3 p-4 text-left"
                  >
                    <span className="px-2 py-1 bg-[#fef5f1] dark:bg-[#3d2f34] text-[#8b6f63]/70 dark:text-[#e8ddd5]/60 text-xs rounded-full flex-shrink-0">{faq.category}</span>
                    <span className="flex-1 text-sm text-[#8b6f63] dark:text-[#e8ddd5] font-medium">
                      {searchQuery ? highlightText(faq.q, searchQuery) : faq.q}
                    </span>
                    <motion.div
                      animate={{ rotate: expandedFaq === idx ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                      className="flex-shrink-0"
                    >
                      <ChevronDown size={18} className="text-[#8b6f63]/50 dark:text-[#e8ddd5]/40" />
                    </motion.div>
                  </button>
                  <AnimatePresence initial={false}>
                    {expandedFaq === idx && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-4 border-t border-[#f5e6e0] dark:border-[#3d2f34]/60 pt-3">
                          <p className="text-sm text-[#8b6f63]/70 dark:text-[#e8ddd5]/60 leading-relaxed">
                            {searchQuery ? highlightText(faq.a, searchQuery) : faq.a}
                          </p>
                          {/* Helpful rating */}
                          <div className="mt-4 pt-3 border-t border-[#f5e6e0]/50 dark:border-[#3d2f34]/40 flex items-center gap-3">
                            <span className="text-xs text-[#8b6f63]/50 dark:text-[#e8ddd5]/40">Was this helpful?</span>
                            <div className="flex gap-1">
                              <motion.button
                                onClick={() => handleRate(idx, 'up')}
                                className={`p-1.5 rounded-full border transition-all duration-200 ${
                                  helpfulRatings[idx] === 'up'
                                    ? 'border-green-400 bg-green-50 dark:bg-green-900/20 text-green-500'
                                    : 'border-[#f5e6e0] dark:border-[#3d2f34] text-[#8b6f63]/40 dark:text-[#e8ddd5]/30 hover:text-green-500 hover:border-green-400'
                                }`}
                                whileTap={{ scale: 0.9 }}
                              >
                                <ThumbsUp size={14} />
                              </motion.button>
                              <motion.button
                                onClick={() => handleRate(idx, 'down')}
                                className={`p-1.5 rounded-full border transition-all duration-200 ${
                                  helpfulRatings[idx] === 'down'
                                    ? 'border-red-400 bg-red-50 dark:bg-red-900/20 text-red-400'
                                    : 'border-[#f5e6e0] dark:border-[#3d2f34] text-[#8b6f63]/40 dark:text-[#e8ddd5]/30 hover:text-red-400 hover:border-red-400'
                                }`}
                                whileTap={{ scale: 0.9 }}
                              >
                                <ThumbsDown size={14} />
                              </motion.button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Contact CTA */}
        <motion.div
          className="max-w-3xl mx-auto mt-12 bg-[#fef5f1] dark:bg-[#2d1f24] rounded-xl p-8 text-center border border-[#f5e6e0]/50 dark:border-[#3d2f34]/60"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <MessageCircle className="text-[#d4a5a5] mx-auto mb-3" size={32} />
          <h3 className="text-xl font-serif text-[#8b6f63] dark:text-[#e8ddd5] mb-2">Can&apos;t Find Your Answer?</h3>
          <p className="text-sm text-[#8b6f63]/70 dark:text-[#e8ddd5]/50 mb-4">Our support team is ready to help you with any questions.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => navigate('contact')}
              className="px-6 py-2 bg-[#d4a5a5] text-white rounded-full text-sm hover:bg-[#c89a9a] transition-colors shadow-md shadow-[#d4a5a5]/20"
            >
              Contact Us
            </button>
            <button
              onClick={() => navigate('order-tracking')}
              className="px-6 py-2 border-2 border-[#d4a5a5] text-[#d4a5a5] rounded-full text-sm hover:bg-[#d4a5a5] hover:text-white transition-colors"
            >
              Track Order
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
