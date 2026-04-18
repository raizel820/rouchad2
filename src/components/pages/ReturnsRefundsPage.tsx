'use client';

import { useState } from 'react';
import { useStore } from '@/store/store';
import { RotateCcw, Package, Clock, AlertCircle, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { motion } from 'framer-motion';

export function ReturnsRefundsPage() {
  const { navigate } = useStore();

  const faqs = [
    {
      q: 'What is your return policy?',
      a: 'We offer a 30-day return policy on all unused and unopened items in their original packaging. Items must be returned within 30 days of delivery for a full refund.',
    },
    {
      q: 'How do I initiate a return?',
      a: 'Log into your account, go to your order history, select the order you want to return, and click "Return Items". Follow the steps to print a prepaid return label and ship the item back.',
    },
    {
      q: 'How long does it take to receive my refund?',
      a: 'Once we receive and inspect your returned items, refunds are processed within 5-7 business days. The refund will be applied to your original payment method.',
    },
    {
      q: 'Can I exchange an item instead of returning it?',
      a: 'Yes! We offer free exchanges. Simply initiate a return and select "Exchange" instead of refund. You can choose a different shade, size, or product of equal or lesser value.',
    },
    {
      q: 'What items cannot be returned?',
      a: 'Opened or used cosmetics, personalized items, gift cards, and sale items marked as "Final Sale" cannot be returned. However, if you received a damaged or defective item, please contact us immediately.',
    },
    {
      q: 'Who pays for return shipping?',
      a: 'We provide free return shipping on all eligible returns. A prepaid return label will be emailed to you when you initiate a return.',
    },
  ];

  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-[#fef5f1] to-[#f5e6e0] py-16">
        <div className="container mx-auto px-4 text-center">
          <motion.h1
            className="text-4xl font-serif text-[#8b6f63] mb-4"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Returns & Refunds
          </motion.h1>
          <motion.p
            className="text-[#8b6f63]/70 max-w-md mx-auto"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            We want you to love your purchase. If you don&apos;t, we make returns easy.
          </motion.p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Return Steps */}
        <div className="max-w-3xl mx-auto mb-12">
          <h2 className="text-2xl font-serif text-[#8b6f63] mb-8 text-center">How to Return an Item</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: <Package size={28} />, step: '1', title: 'Initiate Return', desc: 'Go to your order history and select the items you want to return.' },
              { icon: <RotateCcw size={28} />, step: '2', title: 'Ship It Back', desc: 'Print the prepaid return label and drop off your package at any shipping location.' },
              { icon: <CheckCircle size={28} />, step: '3', title: 'Get Your Refund', desc: 'Once received, your refund will be processed within 5-7 business days.' },
            ].map((item, idx) => (
              <motion.div
                key={item.step}
                className="bg-white rounded-xl p-6 shadow-sm border border-[#f5e6e0]/50 text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * idx }}
              >
                <div className="w-14 h-14 bg-[#fef5f1] rounded-full flex items-center justify-center mx-auto mb-4 text-[#d4a5a5]">
                  {item.icon}
                </div>
                <div className="text-xs text-[#d4a5a5] font-medium mb-1">STEP {item.step}</div>
                <h3 className="text-[#8b6f63] font-medium mb-2">{item.title}</h3>
                <p className="text-sm text-[#8b6f63]/70">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Policy Details */}
        <div className="max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <motion.div
            className="bg-white rounded-xl p-6 shadow-sm border border-[#f5e6e0]/50"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle className="text-green-500" size={20} />
              <h3 className="text-lg font-serif text-[#8b6f63]">Eligible for Return</h3>
            </div>
            <ul className="space-y-2 text-sm text-[#8b6f63]/70">
              {['Unused and unopened items', 'In original packaging', 'Within 30 days of delivery', 'Regular-priced items', 'Gifts (with receipt or order number)'].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            className="bg-white rounded-xl p-6 shadow-sm border border-[#f5e6e0]/50"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle className="text-red-400" size={20} />
              <h3 className="text-lg font-serif text-[#8b6f63]">Not Eligible</h3>
            </div>
            <ul className="space-y-2 text-sm text-[#8b6f63]/70">
              {['Opened or used cosmetics', 'Personalized items', 'Gift cards', 'Final Sale items', 'Items after 30 days'].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-red-400 rounded-full" />
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Refund Timeline */}
        <motion.div
          className="max-w-3xl mx-auto bg-[#fef5f1] rounded-xl p-6 mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Clock className="text-[#d4a5a5]" size={20} />
            <h3 className="text-lg font-serif text-[#8b6f63]">Refund Timeline</h3>
          </div>
          <div className="space-y-3">
            {[
              { label: 'Return shipped', time: 'Day 0' },
              { label: 'Return received at warehouse', time: '3-5 business days' },
              { label: 'Return inspected and approved', time: '1-2 business days' },
              { label: 'Refund processed', time: '5-7 business days' },
            ].map((step, idx) => (
              <div key={step.label} className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-xs text-[#8b6f63] font-medium shadow-sm">
                  {idx + 1}
                </div>
                <span className="flex-1 text-sm text-[#8b6f63]">{step.label}</span>
                <span className="text-xs text-[#8b6f63]/50">{step.time}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* FAQ */}
        <div className="max-w-3xl mx-auto mb-12">
          <h2 className="text-2xl font-serif text-[#8b6f63] mb-6 text-center">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <motion.div
                key={idx}
                className="bg-white rounded-xl border border-[#f5e6e0]/50 overflow-hidden"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * idx }}
              >
                <button
                  onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                  className="w-full flex items-center justify-between p-4 text-left"
                >
                  <span className="text-sm text-[#8b6f63] font-medium">{faq.q}</span>
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
        </div>

        {/* Contact CTA */}
        <motion.div
          className="max-w-3xl mx-auto bg-gradient-to-r from-[#d4a5a5] to-[#c89a9a] rounded-xl p-8 text-center text-white"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h3 className="text-xl font-serif mb-2">Still Need Help?</h3>
          <p className="text-sm opacity-90 mb-4">Our customer service team is here to assist you with any return or refund questions.</p>
          <button
            onClick={() => navigate('contact')}
            className="px-6 py-2 bg-white text-[#d4a5a5] rounded-full text-sm hover:bg-white/90 transition-colors"
          >
            Contact Support
          </button>
        </motion.div>
      </div>
    </div>
  );
}
