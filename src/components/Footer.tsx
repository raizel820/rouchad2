'use client';

import { useState } from 'react';
import { Facebook, Instagram, Twitter, Mail, Loader2 } from 'lucide-react';
import { useStore } from '@/store/store';

// Inline toast to avoid module caching issues with Turbopack
function showToast(message: string, type: 'success' | 'error' | 'info' = 'success') {
  let container = document.getElementById('__toast_container__') as HTMLDivElement | null;
  if (!container) {
    container = document.createElement('div');
    container.id = '__toast_container__';
    container.style.cssText = 'position:fixed;top:1rem;right:1rem;z-index:9999;display:flex;flex-direction:column;gap:0.5rem;max-width:24rem;width:100%;pointer-events:none;';
    document.body.appendChild(container);
  }
  const colors = { success: '#10b981', error: '#ef4444', info: '#3b82f6' };
  const el = document.createElement('div');
  el.style.cssText = 'pointer-events:auto;background:white;border-radius:0.75rem;box-shadow:0 10px 15px -3px rgba(0,0,0,0.1),0 4px 6px -4px rgba(0,0,0,0.1);border:1px solid #f3f4f6;border-left:4px solid ' + colors[type] + ';padding:0.75rem 1rem;display:flex;align-items:flex-start;gap:0.75rem;transform:translateX(120%);opacity:0;transition:transform 0.3s cubic-bezier(0.34,1.56,0.64,1),opacity 0.3s ease;max-width:100%;';
  el.innerHTML = '<p style="flex:1;font-size:0.875rem;color:#374151;line-height:1.4;margin:0">' + message + '</p><button style="color:#9ca3af;background:none;border:none;cursor:pointer;padding:0;font-size:1rem;line-height:1" aria-label="Close">&times;</button>';
  el.querySelector('button')!.addEventListener('click', () => { el.style.transform = 'translateX(120%)'; el.style.opacity = '0'; setTimeout(() => el.remove(), 300); });
  container.appendChild(el);
  requestAnimationFrame(() => { el.style.transform = 'translateX(0)'; el.style.opacity = '1'; });
  setTimeout(() => { el.style.transform = 'translateX(120%)'; el.style.opacity = '0'; setTimeout(() => el.remove(), 300); }, 4000);
}

const toast = showToast;

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
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-3 bg-[#d4a5a5] text-white rounded-full hover:bg-[#c89a9a] transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Subscribing...
                </>
              ) : (
                'Subscribe'
              )}
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
              <button onClick={() => window.open('https://facebook.com/rarebeauty', '_blank', 'noopener,noreferrer')} className="p-2 bg-white rounded-full hover:bg-[#d4a5a5] group transition-colors" aria-label="Facebook">
                <Facebook size={18} className="text-[#8b6f63] group-hover:text-white transition-colors" />
              </button>
              <button onClick={() => window.open('https://instagram.com/rarebeauty', '_blank', 'noopener,noreferrer')} className="p-2 bg-white rounded-full hover:bg-[#d4a5a5] group transition-colors" aria-label="Instagram">
                <Instagram size={18} className="text-[#8b6f63] group-hover:text-white transition-colors" />
              </button>
              <button onClick={() => window.open('https://twitter.com/rarebeauty', '_blank', 'noopener,noreferrer')} className="p-2 bg-white rounded-full hover:bg-[#d4a5a5] group transition-colors" aria-label="Twitter">
                <Twitter size={18} className="text-[#8b6f63] group-hover:text-white transition-colors" />
              </button>
              <button onClick={() => navigate('contact')} className="p-2 bg-white rounded-full hover:bg-[#d4a5a5] group transition-colors" aria-label="Email us">
                <Mail size={18} className="text-[#8b6f63] group-hover:text-white transition-colors" />
              </button>
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
              <li><button onClick={() => navigate('contact')} className="hover:text-[#d4a5a5] transition-colors">Our Story</button></li>
              <li><button onClick={() => navigate('contact')} className="hover:text-[#d4a5a5] transition-colors">Sustainability</button></li>
              <li><button onClick={() => navigate('help-center')} className="hover:text-[#d4a5a5] transition-colors">Privacy Policy</button></li>
              <li><button onClick={() => navigate('help-center')} className="hover:text-[#d4a5a5] transition-colors">Terms of Service</button></li>
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
