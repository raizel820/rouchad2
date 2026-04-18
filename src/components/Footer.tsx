'use client';

import { useState } from 'react';
import { Facebook, Instagram, Twitter, Mail, Loader2, Gift, Send, ShieldCheck, Leaf, Recycle, Heart } from 'lucide-react';
import { useStore } from '@/store/store';
import { toast } from '@/lib/toast';

export function Footer() {
  const { navigate, setSelectedCategory } = useStore();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      toast('Please enter a valid email address', 'error');
      return;
    }

    if (!EMAIL_REGEX.test(trimmedEmail)) {
      toast('Please enter a valid email address', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmedEmail }),
      });

      const data = await res.json();

      if (res.ok) {
        toast('Thanks for subscribing! 🎉');
        setEmail('');
      } else if (res.status === 409) {
        toast('This email is already subscribed', 'error');
      } else if (data.error) {
        toast(data.error, 'error');
      } else {
        toast('Something went wrong. Please try again.', 'error');
      }
    } catch {
      toast('Something went wrong. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleShopLink = (category: string) => {
    setSelectedCategory(category);
    navigate('products');
  };

  const footerLinkClass =
    "hover:text-[#d4a5a5] dark:hover:text-[#d4a5a5] transition-all duration-200 hover:translate-x-1 inline-block";

  return (
    <footer className="bg-[#fef5f1] dark:bg-[#1a1215] mt-auto">
      {/* Newsletter Section */}
      <div className="bg-[#f5e6e0] dark:bg-[#2d1f24] py-14">
        <div className="container mx-auto px-4 text-center">
          <Gift
            size={32}
            className="mx-auto mb-3 text-[#d4a5a5] dark:text-[#d4a5a5]"
            strokeWidth={1.5}
          />
          <h2 className="text-2xl font-serif text-[#8b6f63] dark:text-[#e8ddd5] mb-1">
            Sign up now &amp; get 10% off
          </h2>
          <p className="text-xs font-medium tracking-wide uppercase text-[#d4a5a5]/70 dark:text-[#d4a5a5]/60 mb-1">
            Join 50,000+ subscribers
          </p>
          <p className="text-sm text-[#8b6f63]/70 dark:text-[#a89898] mb-6">
            Subscribe to get information on discounts, new products, and more
          </p>
          <form
            onSubmit={handleSubscribe}
            className="max-w-md mx-auto flex gap-2"
          >
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 px-5 py-3.5 rounded-full bg-white dark:bg-[#3d2f34] text-[#8b6f63] dark:text-[#e8ddd5] placeholder:text-[#8b6f63]/40 dark:placeholder:text-[#a89898]/50 focus:outline-none focus:ring-2 focus:ring-[#d4a5a5] focus:ring-offset-2 focus:ring-offset-[#f5e6e0] dark:focus:ring-offset-[#2d1f24] transition-shadow"
              required
            />
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-3.5 bg-[#d4a5a5] text-white rounded-full hover:bg-[#c89a9a] hover:shadow-lg transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Subscribing...
                </>
              ) : (
                <>
                  Subscribe
                  <Send size={15} className="group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Gradient border between newsletter and main footer */}
      <div className="h-px bg-gradient-to-r from-transparent via-[#d4a5a5]/40 dark:via-[#d4a5a5]/25 to-transparent" />

      {/* Main Footer */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <h3 className="text-xl font-serif text-[#8b6f63] dark:text-[#e8ddd5]">
                Rare Beauty
              </h3>
              <span className="w-1.5 h-1.5 rounded-full bg-[#d4a5a5]" aria-hidden="true" />
            </div>
            <p className="text-sm text-[#8b6f63]/70 dark:text-[#a89898] mb-5">
              Let beauty be what you feel. Premium cosmetics for everyone.
            </p>

            {/* Trust Badges */}
            <div className="flex flex-wrap gap-2 mb-5">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full border border-[#d4a5a5]/30 dark:border-[#3d2f34] bg-white/50 dark:bg-[#2d1f24]/50 text-xs text-[#8b6f63] dark:text-[#a89898]">
                <ShieldCheck size={12} className="text-[#d4a5a5] dark:text-[#d4a5a5]" />
                Cruelty Free
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full border border-[#d4a5a5]/30 dark:border-[#3d2f34] bg-white/50 dark:bg-[#2d1f24]/50 text-xs text-[#8b6f63] dark:text-[#a89898]">
                <Leaf size={12} className="text-[#d4a5a5] dark:text-[#d4a5a5]" />
                Vegan
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full border border-[#d4a5a5]/30 dark:border-[#3d2f34] bg-white/50 dark:bg-[#2d1f24]/50 text-xs text-[#8b6f63] dark:text-[#a89898]">
                <Recycle size={12} className="text-[#d4a5a5] dark:text-[#d4a5a5]" />
                Sustainable
              </span>
            </div>

            {/* Social Media */}
            <div className="flex gap-3">
              <button
                onClick={() => window.open('https://facebook.com/rarebeauty', '_blank', 'noopener,noreferrer')}
                className="p-2.5 bg-white dark:bg-[#2d1f24] rounded-full hover:bg-[#d4a5a5] hover:scale-110 hover:shadow-md group transition-all duration-200"
                aria-label="Facebook"
              >
                <Facebook size={18} className="text-[#8b6f63] dark:text-[#e8ddd5] group-hover:text-white transition-colors" />
              </button>
              <button
                onClick={() => window.open('https://instagram.com/rarebeauty', '_blank', 'noopener,noreferrer')}
                className="p-2.5 bg-white dark:bg-[#2d1f24] rounded-full hover:bg-[#d4a5a5] hover:scale-110 hover:shadow-md group transition-all duration-200"
                aria-label="Instagram"
              >
                <Instagram size={18} className="text-[#8b6f63] dark:text-[#e8ddd5] group-hover:text-white transition-colors" />
              </button>
              <button
                onClick={() => window.open('https://twitter.com/rarebeauty', '_blank', 'noopener,noreferrer')}
                className="p-2.5 bg-white dark:bg-[#2d1f24] rounded-full hover:bg-[#d4a5a5] hover:scale-110 hover:shadow-md group transition-all duration-200"
                aria-label="Twitter"
              >
                <Twitter size={18} className="text-[#8b6f63] dark:text-[#e8ddd5] group-hover:text-white transition-colors" />
              </button>
              <button
                onClick={() => navigate('contact')}
                className="p-2.5 bg-white dark:bg-[#2d1f24] rounded-full hover:bg-[#d4a5a5] hover:scale-110 hover:shadow-md group transition-all duration-200"
                aria-label="Email us"
              >
                <Mail size={18} className="text-[#8b6f63] dark:text-[#e8ddd5] group-hover:text-white transition-colors" />
              </button>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className="text-sm font-medium text-[#8b6f63] dark:text-[#e8ddd5] mb-4">Shop</h4>
            <ul className="space-y-2 text-sm text-[#8b6f63]/70 dark:text-[#a89898]">
              {['Makeup', 'Skincare', 'Haircare', 'Perfume'].map((cat) => (
                <li key={cat}>
                  <button onClick={() => handleShopLink(cat)} className={footerLinkClass}>
                    {cat}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Help */}
          <div>
            <h4 className="text-sm font-medium text-[#8b6f63] dark:text-[#e8ddd5] mb-4">Help</h4>
            <ul className="space-y-2 text-sm text-[#8b6f63]/70 dark:text-[#a89898]">
              <li><button onClick={() => navigate('contact')} className={footerLinkClass}>Contact Us</button></li>
              <li><button onClick={() => navigate('order-tracking')} className={footerLinkClass}>Track Order</button></li>
              <li><button onClick={() => navigate('returns-refunds')} className={footerLinkClass}>Returns</button></li>
              <li><button onClick={() => navigate('help-center')} className={footerLinkClass}>FAQs</button></li>
            </ul>
          </div>

          {/* About */}
          <div>
            <h4 className="text-sm font-medium text-[#8b6f63] dark:text-[#e8ddd5] mb-4">About</h4>
            <ul className="space-y-2 text-sm text-[#8b6f63]/70 dark:text-[#a89898]">
              <li><button onClick={() => navigate('contact')} className={footerLinkClass}>Our Story</button></li>
              <li><button onClick={() => navigate('contact')} className={footerLinkClass}>Sustainability</button></li>
              <li><button onClick={() => navigate('help-center')} className={footerLinkClass}>Privacy Policy</button></li>
              <li><button onClick={() => navigate('help-center')} className={footerLinkClass}>Terms of Service</button></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-[#8b6f63]/20 dark:border-[#3d2f34] pt-8">
          {/* Payment Method Icons */}
          <div className="flex flex-wrap items-center justify-center gap-4 mb-5">
            {['Visa', 'Mastercard', 'Amex', 'PayPal'].map((method) => (
              <span
                key={method}
                className="inline-flex items-center px-3 py-1 rounded border border-[#8b6f63]/15 dark:border-[#3d2f34] bg-white/60 dark:bg-[#2d1f24]/60 text-xs font-medium text-[#8b6f63]/60 dark:text-[#a89898]/70 tracking-wide"
              >
                {method}
              </span>
            ))}
          </div>

          {/* Policy Links */}
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 mb-5 text-xs text-[#8b6f63]/60 dark:text-[#a89898]/70">
            <button onClick={() => navigate('help-center')} className="hover:text-[#d4a5a5] dark:hover:text-[#d4a5a5] transition-colors">
              Privacy Policy
            </button>
            <span className="text-[#8b6f63]/30 dark:text-[#3d2f34]" aria-hidden="true">|</span>
            <button onClick={() => navigate('help-center')} className="hover:text-[#d4a5a5] dark:hover:text-[#d4a5a5] transition-colors">
              Terms of Service
            </button>
            <span className="text-[#8b6f63]/30 dark:text-[#3d2f34]" aria-hidden="true">|</span>
            <button onClick={() => navigate('help-center')} className="hover:text-[#d4a5a5] dark:hover:text-[#d4a5a5] transition-colors">
              Cookie Policy
            </button>
          </div>

          {/* Copyright */}
          <p className="text-center text-xs text-[#8b6f63]/50 dark:text-[#a89898]/50">
            &copy; {new Date().getFullYear()} Rare Beauty. All rights reserved.{' '}
            <span className="inline-flex align-middle mx-0.5" aria-hidden="true">
              <Heart size={10} className="text-[#d4a5a5]/50 dark:text-[#d4a5a5]/40" />
            </span>{' '}
            Made with love
          </p>
        </div>
      </div>
    </footer>
  );
}
