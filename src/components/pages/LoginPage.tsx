'use client';

import { useState } from 'react';
import { useStore } from '@/store/store';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
// Inline toast function
function toast(message: string, type: 'success' | 'error' | 'info' = 'success') {
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

import { motion } from 'framer-motion';

export function LoginPage() {
  const { login, navigate } = useStore();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // Check admin credentials first
      if (formData.email === 'admin' && formData.password === 'admin') {
        login({
          id: 'admin',
          name: 'Admin',
          email: 'admin@rarebeauty.com',
          role: 'admin',
        });
        toast('Welcome, Admin!');
        navigate('admin');
        return;
      }

      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) {
        toast(data.error || 'Invalid credentials', 'error');
        return;
      }
      login(data);
      toast('Welcome back!');
      navigate('home');
    } catch {
      toast('Failed to login', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fef5f1] flex">
      <motion.div className="flex-1 flex items-center justify-center p-8" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <button onClick={() => navigate('home')} className="text-3xl font-serif text-[#8b6f63] inline-block mb-2 hover:text-[#d4a5a5] transition-colors">Rare Beauty</button>
            <h1 className="text-2xl text-[#8b6f63] mb-2">Welcome Back</h1>
            <p className="text-[#8b6f63]/70">Sign in to your account to continue</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm text-[#8b6f63] mb-2"><Mail size={16} className="inline mr-2" />Email / Username</label>
                <input type="text" name="email" value={formData.email} onChange={handleChange} placeholder="Enter your email or username" required
                  className="w-full px-4 py-3 rounded-lg bg-[#fef5f1] text-[#8b6f63] placeholder:text-[#8b6f63]/40 focus:outline-none focus:ring-2 focus:ring-[#d4a5a5]" />
              </div>
              <div>
                <label className="block text-sm text-[#8b6f63] mb-2"><Lock size={16} className="inline mr-2" />Password</label>
                <div className="relative">
                  <input type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange} placeholder="Enter your password" required
                    className="w-full px-4 py-3 rounded-lg bg-[#fef5f1] text-[#8b6f63] placeholder:text-[#8b6f63]/40 focus:outline-none focus:ring-2 focus:ring-[#d4a5a5]" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8b6f63]/50 hover:text-[#8b6f63]">
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={isLoading}
                className="w-full py-3 bg-[#d4a5a5] text-white rounded-full hover:bg-[#c89a9a] transition-all disabled:opacity-50 active:scale-[0.98]">
                {isLoading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-[#8b6f63]/70">
              Don&apos;t have an account?{' '}
              <button onClick={() => navigate('signup')} className="text-[#d4a5a5] hover:underline font-medium">Sign up</button>
            </p>
          </div>
        </div>
      </motion.div>

      <div className="hidden lg:block lg:flex-1 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#d4a5a5] to-[#8b6f63] opacity-90" />
        <div className="absolute inset-0 flex items-center justify-center p-12">
          <div className="text-center text-white space-y-6">
            <h2 className="text-4xl font-serif">Discover Your Beauty</h2>
            <p className="text-xl opacity-90">Premium cosmetics for everyone</p>
            <div className="grid grid-cols-3 gap-4 mt-12">
              {[['🌸', 'Makeup'], ['🌿', 'Skincare'], ['🌹', 'Perfume']].map(([emoji, label]) => (
                <div key={label as string} className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
                  <span className="text-3xl">{emoji}</span>
                  <p className="text-sm mt-2">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
