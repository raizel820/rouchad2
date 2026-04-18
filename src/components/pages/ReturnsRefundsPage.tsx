'use client';

import { useState } from 'react';
import { useStore } from '@/store/store';
import { RotateCcw, Package, Clock, AlertCircle, CheckCircle, ChevronDown, PackageCheck, PackageOpen, ClipboardCheck, BadgeDollarSign, Truck, Shield, Gift } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const refundSteps = [
  { label: 'Requested', icon: <PackageOpen size={18} />, desc: 'Return request submitted' },
  { label: 'Shipped', icon: <Truck size={18} />, desc: 'Package on the way back' },
  { label: 'Received', icon: <PackageCheck size={18} />, desc: 'Arrived at warehouse' },
  { label: 'Inspected', icon: <ClipboardCheck size={18} />, desc: 'Quality check complete' },
  { label: 'Refunded', icon: <BadgeDollarSign size={18} />, desc: 'Money returned to you' },
];

const policyHighlights = [
  { icon: <Shield size={28} />, title: '30-Day Returns', desc: 'Return unused items within 30 days for a full refund.' },
  { icon: <Truck size={28} />, title: 'Free Return Shipping', desc: 'We provide prepaid return labels on all eligible returns.' },
  { icon: <Gift size={28} />, title: 'Easy Exchanges', desc: 'Swap for a different shade, size, or product hassle-free.' },
];

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
  const [returnForm, setReturnForm] = useState({ orderNumber: '', reason: 'changed-mind' });
  const [demoProgress, setDemoProgress] = useState(2);

  return (
    <div className="min-h-screen">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-[#fef5f1] to-[#f5e6e0] dark:from-[#2d1f24] dark:to-[#3d2f34] py-16">
        <div className="container mx-auto px-4 text-center">
          <motion.h1
            className="text-4xl font-serif text-[#8b6f63] dark:text-[#e8ddd5] mb-4"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Returns & Refunds
          </motion.h1>
          <motion.p
            className="text-[#8b6f63]/70 dark:text-[#e8ddd5]/50 max-w-md mx-auto"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            We want you to love your purchase. If you don&apos;t, we make returns easy.
          </motion.p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Policy Highlights */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {policyHighlights.map((card, idx) => (
              <motion.div
                key={card.title}
                className="bg-white dark:bg-[#2d1f24] rounded-xl p-6 shadow-sm border border-[#f5e6e0] dark:border-[#3d2f34] text-center
                  hover:-translate-y-1 hover:shadow-md hover:shadow-[#d4a5a5]/10 dark:hover:shadow-[#d4a5a5]/5 transition-all duration-300"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * idx, type: 'spring', stiffness: 150, damping: 20 }}
              >
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#fef5f1] to-[#f5e6e0] dark:from-[#3d2f34] dark:to-[#4d3f44] flex items-center justify-center mx-auto mb-4 text-[#d4a5a5]">
                  {card.icon}
                </div>
                <h3 className="text-base font-serif text-[#8b6f63] dark:text-[#e8ddd5] font-medium mb-2">{card.title}</h3>
                <p className="text-sm text-[#8b6f63]/70 dark:text-[#e8ddd5]/60">{card.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Return Steps with animated entrance */}
        <div className="max-w-3xl mx-auto mb-12">
          <h2 className="text-2xl font-serif text-[#8b6f63] dark:text-[#e8ddd5] mb-8 text-center">How to Return an Item</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: <Package size={28} />, step: '1', title: 'Initiate Return', desc: 'Go to your order history and select the items you want to return.' },
              { icon: <RotateCcw size={28} />, step: '2', title: 'Ship It Back', desc: 'Print the prepaid return label and drop off your package at any shipping location.' },
              { icon: <CheckCircle size={28} />, step: '3', title: 'Get Your Refund', desc: 'Once received, your refund will be processed within 5-7 business days.' },
            ].map((item, idx) => (
              <motion.div
                key={item.step}
                className="bg-white dark:bg-[#2d1f24] rounded-xl p-6 shadow-sm border border-[#f5e6e0] dark:border-[#3d2f34] text-center relative overflow-hidden group"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 * idx, type: 'spring', stiffness: 120, damping: 18 }}
                whileHover={{ y: -4 }}
              >
                {/* Step number watermark */}
                <span className="absolute -top-3 -right-2 text-7xl font-bold text-[#f5e6e0]/40 dark:text-[#3d2f34] select-none">
                  {item.step}
                </span>
                <div className="relative z-10">
                  <motion.div
                    className="w-14 h-14 rounded-full bg-gradient-to-br from-[#fef5f1] to-[#f5e6e0] dark:from-[#3d2f34] dark:to-[#4d3f44] flex items-center justify-center mx-auto mb-4 text-[#d4a5a5]"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                  >
                    {item.icon}
                  </motion.div>
                  <div className="text-xs text-[#d4a5a5] font-medium mb-1">STEP {item.step}</div>
                  <h3 className="text-[#8b6f63] dark:text-[#e8ddd5] font-medium mb-2">{item.title}</h3>
                  <p className="text-sm text-[#8b6f63]/70 dark:text-[#e8ddd5]/60">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Return Initiation Form (UI only) */}
        <motion.div
          className="max-w-3xl mx-auto mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="bg-white dark:bg-[#2d1f24] rounded-xl p-6 md:p-8 shadow-sm border border-[#f5e6e0] dark:border-[#3d2f34]">
            <div className="flex items-center gap-2 mb-6">
              <RotateCcw className="text-[#d4a5a5]" size={24} />
              <h2 className="text-xl font-serif text-[#8b6f63] dark:text-[#e8ddd5]">Initiate a Return</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm text-[#8b6f63] dark:text-[#e8ddd5]/70 mb-2">Order Number</label>
                <input
                  type="text"
                  value={returnForm.orderNumber}
                  onChange={(e) => setReturnForm({ ...returnForm, orderNumber: e.target.value })}
                  placeholder="e.g. RB-2024-12345"
                  className="w-full px-4 py-3 rounded-lg bg-[#fef5f1] dark:bg-[#3d2f34] text-[#8b6f63] dark:text-[#e8ddd5] placeholder:text-[#8b6f63]/40 dark:placeholder:text-[#e8ddd5]/30 focus:outline-none focus:ring-2 focus:ring-[#d4a5a5] transition-all"
                />
              </div>
              <div>
                <label className="block text-sm text-[#8b6f63] dark:text-[#e8ddd5]/70 mb-2">Return Reason</label>
                <select
                  value={returnForm.reason}
                  onChange={(e) => setReturnForm({ ...returnForm, reason: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg bg-[#fef5f1] dark:bg-[#3d2f34] text-[#8b6f63] dark:text-[#e8ddd5] focus:outline-none focus:ring-2 focus:ring-[#d4a5a5] transition-all appearance-none"
                >
                  <option value="changed-mind">Changed my mind</option>
                  <option value="wrong-item">Wrong item received</option>
                  <option value="damaged">Item damaged</option>
                  <option value="defective">Defective product</option>
                  <option value="different-color">Wrong color/shade</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            <div className="bg-[#fef5f1] dark:bg-[#3d2f34]/50 rounded-lg p-4 mb-4">
              <h4 className="text-sm font-medium text-[#8b6f63] dark:text-[#e8ddd5] mb-3">Select items to return</h4>
              <div className="space-y-2">
                {[
                  { name: 'Lip Soufflé Matte Lip Cream', color: 'Courage', qty: 1, price: 24 },
                  { name: 'Warm Wishes Effortless Bronzer', color: 'Happy Sol', qty: 1, price: 30 },
                  { name: 'Soft Pinch Tinted Lip Oil', color: 'Joy', qty: 2, price: 20 },
                ].map((item, idx) => (
                  <label key={idx} className="flex items-center gap-3 p-3 bg-white dark:bg-[#2d1f24] rounded-lg border border-[#f5e6e0] dark:border-[#3d2f34]/60 cursor-pointer hover:border-[#d4a5a5] dark:hover:border-[#d4a5a5] transition-colors group">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded border-[#f5e6e0] dark:border-[#3d2f34] text-[#d4a5a5] focus:ring-[#d4a5a5] accent-[#d4a5a5]"
                      defaultChecked={idx < 2}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-[#8b6f63] dark:text-[#e8ddd5] font-medium truncate">{item.name}</p>
                      <p className="text-xs text-[#8b6f63]/50 dark:text-[#e8ddd5]/40">Color: {item.color} · Qty: {item.qty}</p>
                    </div>
                    <span className="text-sm text-[#8b6f63] dark:text-[#e8ddd5] font-medium">${item.price}</span>
                  </label>
                ))}
              </div>
            </div>
            <button
              className="w-full py-3 bg-[#d4a5a5] text-white rounded-full hover:bg-[#c89a9a] transition-all active:scale-[0.98] shadow-md shadow-[#d4a5a5]/20 flex items-center justify-center gap-2"
              onClick={() => navigate('contact')}
            >
              <RotateCcw size={18} />
              Submit Return Request
            </button>
          </div>
        </motion.div>

        {/* Policy Details */}
        <div className="max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <motion.div
            className="bg-white dark:bg-[#2d1f24] rounded-xl p-6 shadow-sm border border-[#f5e6e0] dark:border-[#3d2f34]"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle className="text-green-500" size={20} />
              <h3 className="text-lg font-serif text-[#8b6f63] dark:text-[#e8ddd5]">Eligible for Return</h3>
            </div>
            <ul className="space-y-2 text-sm text-[#8b6f63]/70 dark:text-[#e8ddd5]/60">
              {['Unused and unopened items', 'In original packaging', 'Within 30 days of delivery', 'Regular-priced items', 'Gifts (with receipt or order number)'].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            className="bg-white dark:bg-[#2d1f24] rounded-xl p-6 shadow-sm border border-[#f5e6e0] dark:border-[#3d2f34]"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle className="text-red-400" size={20} />
              <h3 className="text-lg font-serif text-[#8b6f63] dark:text-[#e8ddd5]">Not Eligible</h3>
            </div>
            <ul className="space-y-2 text-sm text-[#8b6f63]/70 dark:text-[#e8ddd5]/60">
              {['Opened or used cosmetics', 'Personalized items', 'Gift cards', 'Final Sale items', 'Items after 30 days'].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-red-400 rounded-full flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Refund Progress Tracker */}
        <motion.div
          className="max-w-3xl mx-auto mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <div className="bg-white dark:bg-[#2d1f24] rounded-xl p-6 md:p-8 shadow-sm border border-[#f5e6e0] dark:border-[#3d2f34]">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Clock className="text-[#d4a5a5]" size={20} />
                <h3 className="text-lg font-serif text-[#8b6f63] dark:text-[#e8ddd5]">Refund Progress</h3>
              </div>
              <button
                onClick={() => setDemoProgress((p) => (p + 1) % refundSteps.length)}
                className="text-xs text-[#d4a5a5] hover:text-[#c89a9a] transition-colors"
              >
                Demo: Next Step →
              </button>
            </div>
            {/* Progress bar */}
            <div className="relative mb-6">
              <div className="h-2 bg-[#fef5f1] dark:bg-[#3d2f34] rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-[#d4a5a5] to-[#c89a9a] rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${(demoProgress / (refundSteps.length - 1)) * 100}%` }}
                  transition={{ duration: 0.6, ease: 'easeInOut' }}
                />
              </div>
            </div>
            {/* Steps */}
            <div className="space-y-4">
              {refundSteps.map((step, idx) => {
                const isCompleted = idx < demoProgress;
                const isCurrent = idx === demoProgress;
                const isPending = idx > demoProgress;
                return (
                  <motion.div
                    key={step.label}
                    className={`flex items-center gap-4 p-3 rounded-lg transition-colors duration-300 ${
                      isCurrent ? 'bg-[#d4a5a5]/10 dark:bg-[#d4a5a5]/10' : ''
                    }`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 * idx }}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                      isCompleted
                        ? 'bg-[#d4a5a5] text-white shadow-md shadow-[#d4a5a5]/30'
                        : isCurrent
                          ? 'bg-[#d4a5a5] text-white shadow-lg shadow-[#d4a5a5]/40 ring-4 ring-[#d4a5a5]/20'
                          : 'bg-[#fef5f1] dark:bg-[#3d2f34] text-[#8b6f63]/30 dark:text-[#e8ddd5]/20'
                    }`}>
                      {isCompleted ? <CheckCircle size={18} /> : step.icon}
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm font-medium transition-colors duration-300 ${
                        isPending ? 'text-[#8b6f63]/40 dark:text-[#e8ddd5]/30' : 'text-[#8b6f63] dark:text-[#e8ddd5]'
                      }`}>
                        {step.label}
                        {isCurrent && (
                          <span className="ml-2 text-xs text-[#d4a5a5] bg-[#d4a5a5]/10 dark:bg-[#d4a5a5]/15 px-2 py-0.5 rounded-full">In Progress</span>
                        )}
                      </p>
                      <p className={`text-xs mt-0.5 transition-colors duration-300 ${
                        isPending ? 'text-[#8b6f63]/30 dark:text-[#e8ddd5]/20' : 'text-[#8b6f63]/60 dark:text-[#e8ddd5]/50'
                      }`}>{step.desc}</p>
                    </div>
                    {isCompleted && (
                      <motion.span
                        className="text-xs text-green-500 dark:text-green-400 font-medium"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                      >
                        Done
                      </motion.span>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Refund Timeline (Visual Vertical Timeline) */}
        <motion.div
          className="max-w-3xl mx-auto mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <div className="bg-[#fef5f1] dark:bg-[#2d1f24] rounded-xl p-6 md:p-8 border border-[#f5e6e0]/50 dark:border-[#3d2f34]">
            <div className="flex items-center gap-2 mb-6">
              <Clock className="text-[#d4a5a5]" size={20} />
              <h3 className="text-lg font-serif text-[#8b6f63] dark:text-[#e8ddd5]">Refund Timeline</h3>
            </div>
            <div className="relative">
              {/* Vertical line */}
              <div className="absolute left-5 top-2 bottom-2 w-0.5 bg-gradient-to-b from-[#d4a5a5] via-[#d4a5a5]/50 to-[#d4a5a5]/10 dark:from-[#d4a5a5] dark:via-[#d4a5a5]/50 dark:to-[#d4a5a5]/10" />
              <div className="space-y-6">
                {[
                  { label: 'Return shipped', time: 'Day 0', desc: 'Drop off package at shipping location' },
                  { label: 'Return received at warehouse', time: '3-5 business days', desc: 'Package arrives and is logged' },
                  { label: 'Return inspected and approved', time: '1-2 business days', desc: 'Quality inspection complete' },
                  { label: 'Refund processed', time: '5-7 business days', desc: 'Refund applied to original payment' },
                ].map((step, idx) => (
                  <motion.div
                    key={step.label}
                    className="relative flex gap-5"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * idx, type: 'spring', stiffness: 120, damping: 20 }}
                  >
                    {/* Circle node */}
                    <div className="relative flex-shrink-0 z-10">
                      <div className="w-10 h-10 rounded-full bg-white dark:bg-[#3d2f34] border-2 border-[#d4a5a5] flex items-center justify-center text-xs text-[#d4a5a5] font-bold shadow-sm">
                        {idx + 1}
                      </div>
                    </div>
                    {/* Content */}
                    <div className="pb-2 flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-sm font-medium text-[#8b6f63] dark:text-[#e8ddd5]">{step.label}</span>
                        <span className="text-xs text-[#d4a5a5] bg-[#d4a5a5]/10 dark:bg-[#d4a5a5]/15 px-2 py-0.5 rounded-full font-medium">{step.time}</span>
                      </div>
                      <p className="text-sm text-[#8b6f63]/60 dark:text-[#e8ddd5]/50">{step.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* FAQ */}
        <div className="max-w-3xl mx-auto mb-12">
          <h2 className="text-2xl font-serif text-[#8b6f63] dark:text-[#e8ddd5] mb-6 text-center">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <motion.div
                key={idx}
                className="bg-white dark:bg-[#2d1f24] rounded-xl border border-[#f5e6e0] dark:border-[#3d2f34] overflow-hidden"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * idx }}
                layout
              >
                <button
                  onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                  className="w-full flex items-center justify-between p-4 text-left"
                >
                  <span className="text-sm text-[#8b6f63] dark:text-[#e8ddd5] font-medium">{faq.q}</span>
                  <motion.div
                    animate={{ rotate: expandedFaq === idx ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown size={18} className="text-[#8b6f63]/50 dark:text-[#e8ddd5]/40 flex-shrink-0" />
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
                        <p className="text-sm text-[#8b6f63]/70 dark:text-[#e8ddd5]/60 leading-relaxed">{faq.a}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Contact CTA */}
        <motion.div
          className="max-w-3xl mx-auto bg-gradient-to-r from-[#d4a5a5] to-[#c89a9a] rounded-xl p-8 text-center text-white"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
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
