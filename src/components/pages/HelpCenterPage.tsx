'use client';

import { useState } from 'react';
import { useStore } from '@/store/store';
import { HelpCircle, ChevronDown, ChevronUp, Search, Package, CreditCard, Truck, RotateCcw, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';

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
  { category: 'Shipping', q: 'How do I track my package?', a: 'Once your order ships, you\'ll receive an email with a tracking number. You can also track your order on our Track Order page.' },
  { category: 'Payment', q: 'What payment methods do you accept?', a: 'We accept all major credit cards (Visa, MasterCard, Amex), PayPal, Apple Pay, Google Pay, and Afterpay for buy-now-pay-later.' },
  { category: 'Payment', q: 'Is my payment information secure?', a: 'Absolutely. We use industry-standard SSL encryption and never store your full credit card details. All transactions are processed through secure PCI-compliant payment gateways.' },
  { category: 'Returns', q: 'What is your return policy?', a: 'We offer a 30-day return policy on unused and unopened items in their original packaging. Visit our Returns & Refunds page for full details.' },
  { category: 'Returns', q: 'How long do refunds take?', a: 'Refunds are processed within 5-7 business days after we receive and inspect your returned items. The refund will be applied to your original payment method.' },
];

export function HelpCenterPage() {
  const { navigate } = useStore();
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFaqs = faqs.filter((faq) => {
    const matchesCategory = activeCategory === 'All' || faq.category === activeCategory;
    const matchesSearch = !searchQuery || faq.q.toLowerCase().includes(searchQuery.toLowerCase()) || faq.a.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-[#fef5f1] to-[#f5e6e0] py-16">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            className="w-16 h-16 bg-[#d4a5a5]/20 rounded-full flex items-center justify-center mx-auto mb-4"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <HelpCircle className="text-[#d4a5a5]" size={32} />
          </motion.div>
          <motion.h1
            className="text-4xl font-serif text-[#8b6f63] mb-4"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Help Center
          </motion.h1>
          <motion.p
            className="text-[#8b6f63]/70 max-w-md mx-auto mb-8"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            Find answers to common questions and get the help you need.
          </motion.p>

          {/* Search */}
          <motion.div
            className="max-w-lg mx-auto relative"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8b6f63]/50" size={20} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for help..."
              className="w-full pl-12 pr-4 py-3 bg-white rounded-full text-sm text-[#8b6f63] placeholder:text-[#8b6f63]/40 focus:outline-none focus:ring-2 focus:ring-[#d4a5a5] shadow-sm"
            />
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Categories */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto mb-12">
          {categories.map((cat, idx) => (
            <motion.button
              key={cat.label}
              onClick={() => setActiveCategory(activeCategory === cat.label ? 'All' : cat.label)}
              className={`p-4 rounded-xl text-center transition-all ${
                activeCategory === cat.label
                  ? 'bg-[#d4a5a5] text-white shadow-md'
                  : 'bg-white text-[#8b6f63] hover:bg-[#fef5f1] shadow-sm border border-[#f5e6e0]/50'
              }`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * idx }}
            >
              <div className={`mx-auto mb-2 ${activeCategory === cat.label ? 'text-white' : 'text-[#d4a5a5]'}`}>{cat.icon}</div>
              <p className="text-sm font-medium">{cat.label}</p>
              <p className={`text-xs mt-1 ${activeCategory === cat.label ? 'text-white/80' : 'text-[#8b6f63]/50'}`}>{cat.desc}</p>
            </motion.button>
          ))}
        </div>

        {/* FAQ List */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-xl font-serif text-[#8b6f63] mb-6">
            {searchQuery ? `Results for "${searchQuery}"` : activeCategory === 'All' ? 'All Questions' : `${activeCategory} Questions`}
            <span className="text-sm text-[#8b6f63]/50 ml-2">({filteredFaqs.length})</span>
          </h2>

          {filteredFaqs.length === 0 ? (
            <div className="text-center py-12">
              <HelpCircle size={48} className="text-[#8b6f63]/20 mx-auto mb-4" />
              <p className="text-[#8b6f63]/70">No results found. Try a different search term.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredFaqs.map((faq, idx) => (
                <motion.div
                  key={idx}
                  className="bg-white rounded-xl border border-[#f5e6e0]/50 overflow-hidden"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.03 * idx }}
                >
                  <button
                    onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                    className="w-full flex items-center gap-3 p-4 text-left"
                  >
                    <span className="px-2 py-1 bg-[#fef5f1] text-[#8b6f63]/70 text-xs rounded-full">{faq.category}</span>
                    <span className="flex-1 text-sm text-[#8b6f63] font-medium">{faq.q}</span>
                    {expandedFaq === idx ? (
                      <ChevronUp size={18} className="text-[#8b6f63]/50 flex-shrink-0" />
                    ) : (
                      <ChevronDown size={18} className="text-[#8b6f63]/50 flex-shrink-0" />
                    )}
                  </button>
                  {expandedFaq === idx && (
                    <div className="px-4 pb-4 border-t border-[#f5e6e0]/50 pt-3">
                      <p className="text-sm text-[#8b6f63]/70 leading-relaxed">{faq.a}</p>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Contact CTA */}
        <motion.div
          className="max-w-3xl mx-auto mt-12 bg-[#fef5f1] rounded-xl p-8 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <MessageCircle className="text-[#d4a5a5] mx-auto mb-3" size={32} />
          <h3 className="text-xl font-serif text-[#8b6f63] mb-2">Can&apos;t Find Your Answer?</h3>
          <p className="text-sm text-[#8b6f63]/70 mb-4">Our support team is ready to help you with any questions.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => navigate('contact')}
              className="px-6 py-2 bg-[#d4a5a5] text-white rounded-full text-sm hover:bg-[#c89a9a] transition-colors"
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
