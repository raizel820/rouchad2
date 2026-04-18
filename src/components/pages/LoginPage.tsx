'use client';

import { useState } from 'react';
import { useStore } from '@/store/store';
import { Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import { toast } from '@/lib/toast';
import { motion } from 'framer-motion';
import Image from 'next/image';

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
      if (data.role === 'admin') {
        toast('Welcome, Admin!');
        navigate('admin');
      } else {
        toast('Welcome back!');
        navigate('home');
      }
    } catch {
      toast('Failed to login', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    navigate('contact');
    setTimeout(() => {
      toast('Please contact support for password reset');
    }, 300);
  };

  const handleSocialLogin = () => {
    toast('Social login coming soon');
  };

  return (
    <div className="min-h-screen bg-[#fef5f1] dark:bg-[#1a1215] flex">
      <motion.div
        className="flex-1 flex items-center justify-center p-8"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <button
              onClick={() => navigate('home')}
              className="text-3xl font-serif text-[#8b6f63] dark:text-[#e8ddd5] inline-block mb-2 hover:text-[#d4a5a5] transition-colors"
            >
              Rare Beauty
            </button>
            <h1 className="text-2xl text-[#8b6f63] dark:text-[#e8ddd5] mb-2">Welcome Back</h1>
            <p className="text-[#8b6f63]/70 dark:text-[#e8ddd5]/60">Sign in to your account to continue</p>
          </div>

          <motion.div
            className="bg-white dark:bg-[#2d1f24] rounded-2xl shadow-lg p-8 border border-[#f5e6e0]/30 dark:border-[#3d2f34]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm text-[#8b6f63] dark:text-[#e8ddd5] mb-2">
                  <Mail size={16} className="inline mr-2" />Email / Username
                </label>
                <input
                  type="text"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email or username"
                  required
                  className="w-full px-4 py-3 rounded-lg bg-[#fef5f1] dark:bg-[#1a1215] text-[#8b6f63] dark:text-[#e8ddd5] placeholder:text-[#8b6f63]/40 dark:placeholder:text-[#e8ddd5]/30 focus:outline-none focus:ring-2 focus:ring-[#d4a5a5] border border-transparent dark:border-[#3d2f34] dark:focus:border-[#d4a5a5]"
                />
              </div>
              <div>
                <label className="block text-sm text-[#8b6f63] dark:text-[#e8ddd5] mb-2">
                  <Lock size={16} className="inline mr-2" />Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    required
                    className="w-full px-4 py-3 rounded-lg bg-[#fef5f1] dark:bg-[#1a1215] text-[#8b6f63] dark:text-[#e8ddd5] placeholder:text-[#8b6f63]/40 dark:placeholder:text-[#e8ddd5]/30 focus:outline-none focus:ring-2 focus:ring-[#d4a5a5] border border-transparent dark:border-[#3d2f34] dark:focus:border-[#d4a5a5]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8b6f63]/50 dark:text-[#e8ddd5]/40 hover:text-[#8b6f63] dark:hover:text-[#e8ddd5]"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-sm text-[#d4a5a5] hover:underline"
                >
                  Forgot Password?
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-[#d4a5a5] text-white rounded-full hover:bg-[#c89a9a] transition-all disabled:opacity-50 active:scale-[0.98] font-medium flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-4 my-6">
              <div className="flex-1 h-px bg-[#8b6f63]/20 dark:bg-[#3d2f34]" />
              <span className="text-sm text-[#8b6f63]/50 dark:text-[#e8ddd5]/40">or</span>
              <div className="flex-1 h-px bg-[#8b6f63]/20 dark:bg-[#3d2f34]" />
            </div>

            {/* Social Login Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleSocialLogin}
                className="w-full py-3 px-4 rounded-full border border-[#8b6f63]/20 dark:border-[#3d2f34] bg-white dark:bg-[#1a1215] text-[#8b6f63] dark:text-[#e8ddd5] hover:bg-[#fef5f1] dark:hover:bg-[#3d2f34] transition-all flex items-center justify-center gap-3 font-medium text-sm"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </button>
              <button
                onClick={handleSocialLogin}
                className="w-full py-3 px-4 rounded-full border border-[#8b6f63]/20 dark:border-[#3d2f34] bg-white dark:bg-[#1a1215] text-[#8b6f63] dark:text-[#e8ddd5] hover:bg-[#fef5f1] dark:hover:bg-[#3d2f34] transition-all flex items-center justify-center gap-3 font-medium text-sm"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                </svg>
                Continue with Apple
              </button>
            </div>

            <p className="mt-6 text-center text-sm text-[#8b6f63]/70 dark:text-[#e8ddd5]/60">
              Don&apos;t have an account?{' '}
              <button
                onClick={() => navigate('signup')}
                className="text-[#d4a5a5] hover:underline font-medium"
              >
                Sign up
              </button>
            </p>
          </motion.div>
        </div>
      </motion.div>

      {/* Right Panel with Product Images */}
      <div className="hidden lg:block lg:flex-1 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#d4a5a5] to-[#8b6f63] opacity-90" />
        <div className="absolute inset-0 flex items-center justify-center p-12">
          <div className="text-center text-white space-y-8">
            <motion.h2
              className="text-4xl font-serif"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              Discover Your Beauty
            </motion.h2>
            <motion.p
              className="text-xl opacity-90"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              Premium cosmetics for everyone
            </motion.p>
            <div className="grid grid-cols-3 gap-6 mt-8">
              {[
                { src: '/products/blush.png', label: 'Makeup' },
                { src: '/products/moisturizer.png', label: 'Skincare' },
                { src: '/products/perfume-rose.png', label: 'Perfume' },
              ].map((item, index) => (
                <motion.div
                  key={item.label}
                  className="flex flex-col items-center gap-3"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.15 }}
                >
                  <motion.div
                    className="w-28 h-28 rounded-full border-4 border-white/40 overflow-hidden bg-white/10 backdrop-blur-sm"
                    animate={{ y: [0, -8, 0] }}
                    transition={{
                      duration: 2.5,
                      repeat: Infinity,
                      ease: 'easeInOut',
                      delay: index * 0.5,
                    }}
                  >
                    <Image
                      src={item.src}
                      alt={item.label}
                      width={112}
                      height={112}
                      className="w-full h-full object-cover"
                    />
                  </motion.div>
                  <p className="text-sm font-medium opacity-90">{item.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
