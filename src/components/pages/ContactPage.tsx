'use client';

import { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send, MessageCircle, Instagram, Facebook, Twitter } from 'lucide-react';
import { useStore } from '@/store/store';
import { toast } from '@/lib/toast';
import { motion } from 'framer-motion';

export function ContactPage() {
  const [isLoading, setIsLoading] = useState(false);
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
      } else {
        toast('Failed to send message. Please try again.', 'error');
      }
    } catch {
      toast('Failed to send message. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

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
            Get in Touch
          </motion.h1>
          <motion.p
            className="text-[#8b6f63]/70 max-w-md mx-auto"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            We&apos;d love to hear from you. Our team is here to help with any questions.
          </motion.p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Contact Info Cards */}
          {[
            { icon: <Phone size={24} />, title: 'Call Us', details: ['+1 (800) 123-4567', 'Mon-Fri: 9AM - 6PM EST'] },
            { icon: <Mail size={24} />, title: 'Email Us', details: ['support@rarebeauty.com', 'orders@rarebeauty.com'] },
            { icon: <MapPin size={24} />, title: 'Visit Us', details: ['123 Beauty Lane', 'New York, NY 10001'] },
          ].map((card, idx) => (
            <motion.div
              key={card.title}
              className="bg-white rounded-xl p-6 shadow-sm border border-[#f5e6e0]/50 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * idx }}
            >
              <div className="w-14 h-14 bg-[#fef5f1] rounded-full flex items-center justify-center mx-auto mb-4 text-[#d4a5a5]">
                {card.icon}
              </div>
              <h3 className="text-lg font-serif text-[#8b6f63] mb-2">{card.title}</h3>
              {card.details.map((detail) => (
                <p key={detail} className="text-sm text-[#8b6f63]/70">{detail}</p>
              ))}
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Contact Form */}
          <motion.div
            className="bg-white rounded-xl p-8 shadow-sm border border-[#f5e6e0]/50"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="flex items-center gap-2 mb-6">
              <MessageCircle className="text-[#d4a5a5]" size={24} />
              <h2 className="text-xl font-serif text-[#8b6f63]">Send Us a Message</h2>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-[#8b6f63] mb-2">Your Name</label>
                  <input
                    type="text" name="name" value={formData.name} onChange={handleChange}
                    placeholder="John Doe" required
                    className="w-full px-4 py-3 rounded-lg bg-[#fef5f1] text-[#8b6f63] placeholder:text-[#8b6f63]/40 focus:outline-none focus:ring-2 focus:ring-[#d4a5a5]"
                  />
                </div>
                <div>
                  <label className="block text-sm text-[#8b6f63] mb-2">Email Address</label>
                  <input
                    type="email" name="email" value={formData.email} onChange={handleChange}
                    placeholder="john@example.com" required
                    className="w-full px-4 py-3 rounded-lg bg-[#fef5f1] text-[#8b6f63] placeholder:text-[#8b6f63]/40 focus:outline-none focus:ring-2 focus:ring-[#d4a5a5]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-[#8b6f63] mb-2">Subject</label>
                <input
                  type="text" name="subject" value={formData.subject} onChange={handleChange}
                  placeholder="How can we help?" required
                  className="w-full px-4 py-3 rounded-lg bg-[#fef5f1] text-[#8b6f63] placeholder:text-[#8b6f63]/40 focus:outline-none focus:ring-2 focus:ring-[#d4a5a5]"
                />
              </div>
              <div>
                <label className="block text-sm text-[#8b6f63] mb-2">Message</label>
                <textarea
                  name="message" value={formData.message} onChange={handleChange}
                  placeholder="Tell us more about your inquiry..." rows={5} required
                  className="w-full px-4 py-3 rounded-lg bg-[#fef5f1] text-[#8b6f63] placeholder:text-[#8b6f63]/40 focus:outline-none focus:ring-2 focus:ring-[#d4a5a5] resize-none"
                />
              </div>
              <button
                type="submit" disabled={isLoading}
                className="w-full py-3 bg-[#d4a5a5] text-white rounded-full hover:bg-[#c89a9a] transition-all disabled:opacity-50 flex items-center justify-center gap-2 active:scale-[0.98]"
              >
                <Send size={18} />
                {isLoading ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </motion.div>

          {/* Business Hours & Social */}
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="bg-white rounded-xl p-8 shadow-sm border border-[#f5e6e0]/50">
              <div className="flex items-center gap-2 mb-6">
                <Clock className="text-[#d4a5a5]" size={24} />
                <h2 className="text-xl font-serif text-[#8b6f63]">Business Hours</h2>
              </div>
              <div className="space-y-3">
                {[
                  { day: 'Monday - Friday', hours: '9:00 AM - 6:00 PM EST' },
                  { day: 'Saturday', hours: '10:00 AM - 4:00 PM EST' },
                  { day: 'Sunday', hours: 'Closed' },
                ].map((schedule) => (
                  <div key={schedule.day} className="flex justify-between py-2 border-b border-[#f5e6e0]/50 last:border-0">
                    <span className="text-sm text-[#8b6f63]">{schedule.day}</span>
                    <span className="text-sm text-[#8b6f63]/70">{schedule.hours}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#fef5f1] rounded-xl p-8">
              <h2 className="text-xl font-serif text-[#8b6f63] mb-4">Follow Us</h2>
              <p className="text-sm text-[#8b6f63]/70 mb-6">Stay connected with us on social media for the latest updates, beauty tips, and exclusive offers.</p>
              <div className="flex gap-3">
                {[
                  { icon: <Instagram size={20} />, label: 'Instagram', url: 'https://instagram.com/rarebeauty' },
                  { icon: <Facebook size={20} />, label: 'Facebook', url: 'https://facebook.com/rarebeauty' },
                  { icon: <Twitter size={20} />, label: 'Twitter', url: 'https://twitter.com/rarebeauty' },
                ].map((social) => (
                  <button
                    key={social.label}
                    className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-[#8b6f63] hover:bg-[#d4a5a5] hover:text-white transition-all shadow-sm"
                    aria-label={social.label}
                    onClick={() => window.open(social.url, '_blank', 'noopener,noreferrer')}
                  >
                    {social.icon}
                  </button>
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
    </div>
  );
}
