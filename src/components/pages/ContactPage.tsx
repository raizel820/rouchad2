'use client';

import { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send, MessageCircle, Instagram, Facebook, Twitter, Check, HelpCircle, MapPinned, X } from 'lucide-react';
import { useStore } from '@/store/store';
import { toast } from '@/lib/toast';
import { motion, AnimatePresence } from 'framer-motion';

const faqQuickLinks = [
  { q: 'How do I track my order?', page: 'order-tracking' as const },
  { q: 'What is the return policy?', page: 'returns-refunds' as const },
  { q: 'How long does shipping take?', page: 'help-center' as const },
  { q: 'Do you offer international shipping?', page: 'help-center' as const },
];

export function ContactPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '', email: '', subject: '', message: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        toast('Message sent successfully! We\'ll get back to you soon.');
        setFormData({ name: '', email: '', subject: '', message: '' });
        setIsSubmitted(true);
        setTimeout(() => setIsSubmitted(false), 4000);
      } else {
        toast('Failed to send message. Please try again.', 'error');
      }
    } catch {
      toast('Failed to send message. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const isFieldActive = (field: string) => formData[field as keyof typeof formData].length > 0;

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
            Get in Touch
          </motion.h1>
          <motion.p
            className="text-[#8b6f63]/70 dark:text-[#e8ddd5]/50 max-w-md mx-auto"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            We&apos;d love to hear from you. Our team is here to help with any questions.
          </motion.p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Contact Info Cards with hover lift */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {[
            { icon: <Phone size={24} />, title: 'Call Us', details: ['+1 (800) 123-4567', 'Mon-Fri: 9AM - 6PM EST'] },
            { icon: <Mail size={24} />, title: 'Email Us', details: ['support@rarebeauty.com', 'orders@rarebeauty.com'] },
            { icon: <MapPin size={24} />, title: 'Visit Us', details: ['123 Beauty Lane', 'New York, NY 10001'] },
          ].map((card, idx) => (
            <motion.div
              key={card.title}
              className="bg-white dark:bg-[#2d1f24] rounded-xl p-6 shadow-sm border border-[#f5e6e0] dark:border-[#3d2f34] text-center cursor-default
                hover:-translate-y-1 hover:shadow-md hover:shadow-[#d4a5a5]/10 dark:hover:shadow-[#d4a5a5]/5 transition-all duration-300"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * idx }}
            >
              <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4
                bg-gradient-to-br from-[#fef5f1] to-[#f5e6e0] dark:from-[#3d2f34] dark:to-[#4d3f44] text-[#d4a5a5] dark:text-[#d4a5a5]">
                {card.icon}
              </div>
              <h3 className="text-lg font-serif text-[#8b6f63] dark:text-[#e8ddd5] mb-2">{card.title}</h3>
              {card.details.map((detail) => (
                <p key={detail} className="text-sm text-[#8b6f63]/70 dark:text-[#e8ddd5]/60">{detail}</p>
              ))}
            </motion.div>
          ))}
        </div>

        {/* Decorative Map Placeholder */}
        <motion.div
          className="mb-12 rounded-xl overflow-hidden border border-[#f5e6e0] dark:border-[#3d2f34]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <div className="relative h-48 md:h-64 bg-gradient-to-br from-[#fef5f1] via-[#f5e6e0] to-[#e8d5cc] dark:from-[#2d1f24] dark:via-[#3d2f34] dark:to-[#4d3f44]">
            {/* Decorative grid lines */}
            <div className="absolute inset-0 opacity-10 dark:opacity-20">
              {[...Array(6)].map((_, i) => (
                <div key={`h-${i}`} className="absolute w-full h-px bg-[#8b6f63]" style={{ top: `${(i + 1) * 16}%` }} />
              ))}
              {[...Array(8)].map((_, i) => (
                <div key={`v-${i}`} className="absolute h-full w-px bg-[#8b6f63]" style={{ left: `${(i + 1) * 12}%` }} />
              ))}
            </div>
            {/* Pin markers */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
              <div className="relative">
                <div className="absolute inset-0 bg-[#d4a5a5]/30 rounded-full animate-ping" />
                <div className="relative w-10 h-10 bg-[#d4a5a5] rounded-full flex items-center justify-center shadow-lg shadow-[#d4a5a5]/30">
                  <MapPinned size={18} className="text-white" />
                </div>
              </div>
              <div className="mt-2 px-3 py-1 bg-white dark:bg-[#2d1f24] rounded-full shadow-md text-xs font-medium text-[#8b6f63] dark:text-[#e8ddd5]">
                Rare Beauty HQ
              </div>
            </div>
            {/* Secondary pin */}
            <motion.div
              className="absolute top-[30%] left-[25%]"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: 'spring' }}
            >
              <div className="w-6 h-6 bg-[#d4a5a5]/60 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full" />
              </div>
            </motion.div>
            <motion.div
              className="absolute top-[40%] right-[30%]"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.7, type: 'spring' }}
            >
              <div className="w-6 h-6 bg-[#d4a5a5]/60 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full" />
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* FAQ Quick Links */}
        <motion.div
          className="mb-12 max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <HelpCircle size={20} className="text-[#d4a5a5]" />
            <h3 className="text-lg font-serif text-[#8b6f63] dark:text-[#e8ddd5]">Quick Answers</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {faqQuickLinks.map((faq, idx) => (
              <button
                key={idx}
                onClick={() => useStore.getState().navigate(faq.page)}
                className="flex items-center gap-3 p-3 rounded-lg bg-white dark:bg-[#2d1f24] border border-[#f5e6e0] dark:border-[#3d2f34]
                  hover:border-[#d4a5a5] dark:hover:border-[#d4a5a5] hover:bg-[#fef5f1] dark:hover:bg-[#3d2f34] transition-all duration-200 text-left group"
              >
                <div className="w-8 h-8 rounded-full bg-[#fef5f1] dark:bg-[#3d2f34] flex items-center justify-center flex-shrink-0
                  group-hover:bg-[#d4a5a5] group-hover:text-white transition-colors">
                  <HelpCircle size={14} className="text-[#d4a5a5] group-hover:text-white transition-colors" />
                </div>
                <span className="text-sm text-[#8b6f63] dark:text-[#e8ddd5] group-hover:text-[#d4a5a5] dark:group-hover:text-[#d4a5a5] transition-colors">
                  {faq.q}
                </span>
              </button>
            ))}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Contact Form with floating labels */}
          <motion.div
            className="bg-white dark:bg-[#2d1f24] rounded-xl p-8 shadow-sm border border-[#f5e6e0] dark:border-[#3d2f34] relative overflow-hidden"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            {/* Success overlay */}
            <AnimatePresence>
              {isSubmitted && (
                <motion.div
                  className="absolute inset-0 bg-white dark:bg-[#2d1f24] z-10 flex flex-col items-center justify-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <motion.div
                    className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
                  >
                    <Check size={32} className="text-green-500" />
                  </motion.div>
                  <motion.p
                    className="text-lg font-serif text-[#8b6f63] dark:text-[#e8ddd5]"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    Message Sent!
                  </motion.p>
                  <motion.p
                    className="text-sm text-[#8b6f63]/60 dark:text-[#e8ddd5]/50 mt-1"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    We&apos;ll get back to you soon.
                  </motion.p>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex items-center gap-2 mb-6">
              <MessageCircle className="text-[#d4a5a5]" size={24} />
              <h2 className="text-xl font-serif text-[#8b6f63] dark:text-[#e8ddd5]">Send Us a Message</h2>
            </div>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Name field with floating label */}
                <div className="relative">
                  <input
                    type="text" name="name" value={formData.name} onChange={handleChange}
                    placeholder=" " required
                    className={`peer w-full px-4 py-3.5 rounded-lg bg-[#fef5f1] dark:bg-[#3d2f34] text-[#8b6f63] dark:text-[#e8ddd5] placeholder:text-transparent
                      focus:outline-none focus:ring-2 focus:ring-[#d4a5a5] dark:focus:ring-[#d4a5a5] transition-all duration-200
                      ${isFieldActive('name') ? 'ring-2 ring-[#d4a5a5]/30 dark:ring-[#d4a5a5]/30' : ''}`}
                  />
                  <label className="absolute left-4 transition-all duration-200 pointer-events-none
                    peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm peer-placeholder-shown:text-[#8b6f63]/40 dark:peer-placeholder-shown:text-[#e8ddd5]/30
                    peer-focus:top-1.5 peer-focus:text-xs peer-focus:text-[#d4a5a5] dark:peer-focus:text-[#d4a5a5]
                    -top-1.5 text-xs text-[#d4a5a5] dark:text-[#d4a5a5] bg-[#fef5f1] dark:bg-[#3d2f34] px-1 rounded">
                    Your Name
                  </label>
                </div>
                {/* Email field with floating label */}
                <div className="relative">
                  <input
                    type="email" name="email" value={formData.email} onChange={handleChange}
                    placeholder=" " required
                    className={`peer w-full px-4 py-3.5 rounded-lg bg-[#fef5f1] dark:bg-[#3d2f34] text-[#8b6f63] dark:text-[#e8ddd5] placeholder:text-transparent
                      focus:outline-none focus:ring-2 focus:ring-[#d4a5a5] dark:focus:ring-[#d4a5a5] transition-all duration-200
                      ${isFieldActive('email') ? 'ring-2 ring-[#d4a5a5]/30 dark:ring-[#d4a5a5]/30' : ''}`}
                  />
                  <label className="absolute left-4 transition-all duration-200 pointer-events-none
                    peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm peer-placeholder-shown:text-[#8b6f63]/40 dark:peer-placeholder-shown:text-[#e8ddd5]/30
                    peer-focus:top-1.5 peer-focus:text-xs peer-focus:text-[#d4a5a5] dark:peer-focus:text-[#d4a5a5]
                    -top-1.5 text-xs text-[#d4a5a5] dark:text-[#d4a5a5] bg-[#fef5f1] dark:bg-[#3d2f34] px-1 rounded">
                    Email Address
                  </label>
                </div>
              </div>
              {/* Subject field with floating label */}
              <div className="relative">
                <input
                  type="text" name="subject" value={formData.subject} onChange={handleChange}
                  placeholder=" " required
                  className={`peer w-full px-4 py-3.5 rounded-lg bg-[#fef5f1] dark:bg-[#3d2f34] text-[#8b6f63] dark:text-[#e8ddd5] placeholder:text-transparent
                    focus:outline-none focus:ring-2 focus:ring-[#d4a5a5] dark:focus:ring-[#d4a5a5] transition-all duration-200
                    ${isFieldActive('subject') ? 'ring-2 ring-[#d4a5a5]/30 dark:ring-[#d4a5a5]/30' : ''}`}
                />
                <label className="absolute left-4 transition-all duration-200 pointer-events-none
                  peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm peer-placeholder-shown:text-[#8b6f63]/40 dark:peer-placeholder-shown:text-[#e8ddd5]/30
                  peer-focus:top-1.5 peer-focus:text-xs peer-focus:text-[#d4a5a5] dark:peer-focus:text-[#d4a5a5]
                  -top-1.5 text-xs text-[#d4a5a5] dark:text-[#d4a5a5] bg-[#fef5f1] dark:bg-[#3d2f34] px-1 rounded">
                  Subject
                </label>
              </div>
              {/* Message field with floating label + character count */}
              <div className="relative">
                <textarea
                  name="message" value={formData.message} onChange={handleChange}
                  placeholder=" " rows={5} required
                  className={`peer w-full px-4 py-3.5 rounded-lg bg-[#fef5f1] dark:bg-[#3d2f34] text-[#8b6f63] dark:text-[#e8ddd5] placeholder:text-transparent
                    focus:outline-none focus:ring-2 focus:ring-[#d4a5a5] dark:focus:ring-[#d4a5a5] resize-none transition-all duration-200
                    ${isFieldActive('message') ? 'ring-2 ring-[#d4a5a5]/30 dark:ring-[#d4a5a5]/30' : ''}`}
                />
                <label className="absolute left-4 transition-all duration-200 pointer-events-none
                  peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm peer-placeholder-shown:text-[#8b6f63]/40 dark:peer-placeholder-shown:text-[#e8ddd5]/30
                  peer-focus:top-1.5 peer-focus:text-xs peer-focus:text-[#d4a5a5] dark:peer-focus:text-[#d4a5a5]
                  -top-1.5 text-xs text-[#d4a5a5] dark:text-[#d4a5a5] bg-[#fef5f1] dark:bg-[#3d2f34] px-1 rounded">
                  Your Message
                </label>
                <span className="absolute bottom-3 right-4 text-xs text-[#8b6f63]/40 dark:text-[#e8ddd5]/30">
                  {formData.message.length}/500
                </span>
              </div>
              <motion.button
                type="submit" disabled={isLoading || formData.message.length > 500}
                className="w-full py-3 bg-[#d4a5a5] text-white rounded-full hover:bg-[#c89a9a] transition-all disabled:opacity-50 flex items-center justify-center gap-2 active:scale-[0.98] shadow-md shadow-[#d4a5a5]/20"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
              >
                {isLoading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  >
                    <Send size={18} />
                  </motion.div>
                ) : (
                  <>
                    <Send size={18} />
                    Send Message
                  </>
                )}
              </motion.button>
            </form>
          </motion.div>

          {/* Business Hours & Social */}
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="bg-white dark:bg-[#2d1f24] rounded-xl p-8 shadow-sm border border-[#f5e6e0] dark:border-[#3d2f34]">
              <div className="flex items-center gap-2 mb-6">
                <Clock className="text-[#d4a5a5]" size={24} />
                <h2 className="text-xl font-serif text-[#8b6f63] dark:text-[#e8ddd5]">Business Hours</h2>
              </div>
              <div className="space-y-3">
                {[
                  { day: 'Monday - Friday', hours: '9:00 AM - 6:00 PM EST' },
                  { day: 'Saturday', hours: '10:00 AM - 4:00 PM EST' },
                  { day: 'Sunday', hours: 'Closed' },
                ].map((schedule) => (
                  <div key={schedule.day} className="flex justify-between py-2 border-b border-[#f5e6e0] dark:border-[#3d2f34]/60 last:border-0">
                    <span className="text-sm text-[#8b6f63] dark:text-[#e8ddd5]">{schedule.day}</span>
                    <span className={`text-sm ${schedule.hours === 'Closed' ? 'text-[#d4a5a5]' : 'text-[#8b6f63]/70 dark:text-[#e8ddd5]/60'}`}>
                      {schedule.hours}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#fef5f1] dark:bg-[#2d1f24] rounded-xl p-8 border border-[#f5e6e0]/50 dark:border-[#3d2f34]/60">
              <h2 className="text-xl font-serif text-[#8b6f63] dark:text-[#e8ddd5] mb-4">Follow Us</h2>
              <p className="text-sm text-[#8b6f63]/70 dark:text-[#e8ddd5]/50 mb-6">Stay connected with us on social media for the latest updates, beauty tips, and exclusive offers.</p>
              <div className="flex gap-3">
                {[
                  { icon: <Instagram size={20} />, label: 'Instagram', url: 'https://instagram.com/rarebeauty' },
                  { icon: <Facebook size={20} />, label: 'Facebook', url: 'https://facebook.com/rarebeauty' },
                  { icon: <Twitter size={20} />, label: 'Twitter', url: 'https://twitter.com/rarebeauty' },
                ].map((social) => (
                  <motion.button
                    key={social.label}
                    className="w-12 h-12 bg-white dark:bg-[#3d2f34] rounded-full flex items-center justify-center text-[#8b6f63] dark:text-[#e8ddd5]
                      hover:bg-[#d4a5a5] hover:text-white transition-all shadow-sm border border-[#f5e6e0]/50 dark:border-[#3d2f34]"
                    aria-label={social.label}
                    onClick={() => window.open(social.url, '_blank', 'noopener,noreferrer')}
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {social.icon}
                  </motion.button>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#d4a5a5] to-[#c89a9a] rounded-xl p-8 text-white">
              <h3 className="text-xl font-serif mb-2">Need Quick Help?</h3>
              <p className="text-sm opacity-90 mb-4">Check our FAQ section for instant answers to common questions.</p>
              <button
                onClick={() => useStore.getState().navigate('help-center')}
                className="px-6 py-2 bg-white text-[#d4a5a5] rounded-full text-sm hover:bg-white/90 transition-colors"
              >
                Visit Help Center
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Floating Live Chat CTA */}
      <motion.button
        className="fixed bottom-6 right-6 w-14 h-14 bg-[#d4a5a5] text-white rounded-full shadow-lg shadow-[#d4a5a5]/30
          flex items-center justify-center z-50 hover:bg-[#c89a9a] transition-colors group"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1, type: 'spring', stiffness: 200, damping: 15 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => useStore.getState().navigate('contact')}
      >
        <span className="absolute inset-0 rounded-full bg-[#d4a5a5] animate-ping opacity-20" />
        <MessageCircle size={24} className="relative z-10" />
      </motion.button>
    </div>
  );
}
