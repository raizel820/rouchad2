'use client';

import { useState } from 'react';
import { Facebook, Instagram, Twitter, Mail } from 'lucide-react';
import { useStore } from '@/store/store';
import { toast } from 'sonner';

export function Footer() {
  const { navigate, setSelectedCategory } = useStore();
  const [email, setEmail] = useState('');

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      try {
        await fetch('/api/newsletter', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });
        toast.success('Successfully subscribed to our newsletter!');
        setEmail('');
      } catch {
        toast.error('Failed to subscribe. Please try again.');
      }
    }
  };

  const handleShopLink = (category: string) => {
    setSelectedCategory(category);
    navigate('products');
  };

  return (
    <footer className="bg-[#fef5f1] mt-auto">
      {/* Newsletter Section */}
      <div className="bg-[#f5e6e0] py-12">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-serif text-[#8b6f63] mb-2">Sign up now & get 10% off</h2>
          <p className="text-sm text-[#8b6f63]/70 mb-6">Subscribe to get information on discounts, new products, and more</p>
          <form onSubmit={handleSubscribe} className="max-w-md mx-auto flex gap-2">
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 px-4 py-3 rounded-full bg-white text-[#8b6f63] placeholder:text-[#8b6f63]/40 focus:outline-none focus:ring-2 focus:ring-[#d4a5a5]"
              required
            />
            <button type="submit" className="px-6 py-3 bg-[#d4a5a5] text-white rounded-full hover:bg-[#c89a9a] transition-colors">
              Subscribe
            </button>
          </form>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <h3 className="text-xl font-serif text-[#8b6f63] mb-4">Rare Beauty</h3>
            <p className="text-sm text-[#8b6f63]/70 mb-4">Let beauty be what you feel. Premium cosmetics for everyone.</p>
            <div className="flex gap-3">
              <a href="#" className="p-2 bg-white rounded-full hover:bg-[#d4a5a5] group transition-colors">
                <Facebook size={18} className="text-[#8b6f63] group-hover:text-white transition-colors" />
              </a>
              <a href="#" className="p-2 bg-white rounded-full hover:bg-[#d4a5a5] group transition-colors">
                <Instagram size={18} className="text-[#8b6f63] group-hover:text-white transition-colors" />
              </a>
              <a href="#" className="p-2 bg-white rounded-full hover:bg-[#d4a5a5] group transition-colors">
                <Twitter size={18} className="text-[#8b6f63] group-hover:text-white transition-colors" />
              </a>
              <a href="#" className="p-2 bg-white rounded-full hover:bg-[#d4a5a5] group transition-colors">
                <Mail size={18} className="text-[#8b6f63] group-hover:text-white transition-colors" />
              </a>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className="text-sm font-medium text-[#8b6f63] mb-4">Shop</h4>
            <ul className="space-y-2 text-sm text-[#8b6f63]/70">
              {['Makeup', 'Skincare', 'Haircare', 'Perfume'].map((cat) => (
                <li key={cat}>
                  <button onClick={() => handleShopLink(cat)} className="hover:text-[#d4a5a5] transition-colors">
                    {cat}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Help */}
          <div>
            <h4 className="text-sm font-medium text-[#8b6f63] mb-4">Help</h4>
            <ul className="space-y-2 text-sm text-[#8b6f63]/70">
              <li><button onClick={() => navigate('contact')} className="hover:text-[#d4a5a5] transition-colors">Contact Us</button></li>
              <li><button onClick={() => navigate('order-tracking')} className="hover:text-[#d4a5a5] transition-colors">Track Order</button></li>
              <li><button onClick={() => navigate('returns-refunds')} className="hover:text-[#d4a5a5] transition-colors">Returns</button></li>
              <li><button onClick={() => navigate('help-center')} className="hover:text-[#d4a5a5] transition-colors">FAQs</button></li>
            </ul>
          </div>

          {/* About */}
          <div>
            <h4 className="text-sm font-medium text-[#8b6f63] mb-4">About</h4>
            <ul className="space-y-2 text-sm text-[#8b6f63]/70">
              <li><a href="#" className="hover:text-[#d4a5a5] transition-colors">Our Story</a></li>
              <li><a href="#" className="hover:text-[#d4a5a5] transition-colors">Sustainability</a></li>
              <li><a href="#" className="hover:text-[#d4a5a5] transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-[#d4a5a5] transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-[#8b6f63]/20 pt-8 text-center">
          <p className="text-sm text-[#8b6f63]/70">
            &copy; {new Date().getFullYear()} Rare Beauty. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
