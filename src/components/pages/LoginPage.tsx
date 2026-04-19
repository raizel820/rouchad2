'use client';

import { useState } from 'react';
import { useStore } from '@/store/store';
import { Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import { toast } from '@/lib/toast';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

function FloatingInput({
  id,
  name,
  type,
  value,
  onChange,
  placeholder,
  required,
  Icon,
  showPassword,
  onTogglePassword,
}: {
  id: string;
  name: string;
  type: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  required?: boolean;
  Icon: React.ElementType;
  showPassword?: boolean;
  onTogglePassword?: () => void;
}) {
  const [isFocused, setIsFocused] = useState(false);
  const isActive = isFocused || value.length > 0;

  return (
    <div className="relative">
      <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-200 ${isActive ? 'text-[#d4a5a5] dark:text-[#d4a5a5]' : 'text-[#8b6f63]/40 dark:text-[#a89898]/50'}`}>
        <Icon size={18} />
      </div>
      <input
        id={id}
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={isActive ? placeholder : ' '}
        required={required}
        className={`peer w-full pl-11 ${onTogglePassword ? 'pr-11' : 'pr-4'} py-4 rounded-xl bg-[#fef5f1] dark:bg-[#1a1215] text-[#8b6f63] dark:text-[#e8ddd5] placeholder:text-transparent focus:outline-none border-2 transition-all duration-300 ${isFocused ? 'border-[#d4a5a5] dark:border-[#d4a5a5] shadow-[0_0_0_3px_rgba(212,165,165,0.15)] dark:shadow-[0_0_0_3px_rgba(212,165,165,0.1)]' : 'border-transparent dark:border-[#3d2f34]'}`}
      />
      <label
        htmlFor={id}
        className={`absolute left-11 transition-all duration-200 pointer-events-none ${
          isActive
            ? 'top-2.5 text-[10px] font-semibold tracking-wide uppercase text-[#d4a5a5] dark:text-[#d4a5a5]'
            : 'top-1/2 -translate-y-1/2 text-sm text-[#8b6f63]/50 dark:text-[#a89898]/60'
        }`}
      >
        {placeholder}
      </label>
      {onTogglePassword && (
        <button
          type="button"
          onClick={onTogglePassword}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8b6f63]/40 dark:text-[#a89898]/50 hover:text-[#8b6f63] dark:hover:text-[#e8ddd5] transition-colors p-1"
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      )}
    </div>
  );
}

export function LoginPage() {
  const { login, navigate, shopSettings } = useStore();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [shakeError, setShakeError] = useState(false);

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
        setShakeError(true);
        setTimeout(() => setShakeError(false), 600);
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
      setShakeError(true);
      setTimeout(() => setShakeError(false), 600);
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
    <div className="min-h-screen bg-[#fef5f1] dark:bg-[#1a1215] flex relative overflow-hidden">
      {/* Decorative background shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-[#d4a5a5]/5 dark:bg-[#d4a5a5]/3" />
        <div className="absolute -bottom-48 -right-48 w-[500px] h-[500px] rounded-full bg-[#8b6f63]/5 dark:bg-[#8b6f63]/3" />
        <div className="absolute top-1/3 left-1/4 w-64 h-64 rounded-full bg-[#f5e6e0]/30 dark:bg-[#3d2f34]/10 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/3 w-48 h-48 rounded-full bg-[#d4a5a5]/10 dark:bg-[#d4a5a5]/5 blur-2xl" />
      </div>

      {/* Left Panel - Form */}
      <motion.div
        className="flex-1 flex items-center justify-center p-8 relative z-10"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <motion.button
              onClick={() => navigate('home')}
              className="text-3xl font-serif text-[#8b6f63] dark:text-[#e8ddd5] inline-block mb-2 hover:text-[#d4a5a5] dark:hover:text-[#d4a5a5] transition-colors"
              whileHover={{ scale: 1.02 }}
            >
              {shopSettings.shopName}
            </motion.button>
            <motion.h1
              className="text-2xl text-[#8b6f63] dark:text-[#e8ddd5] mb-2 font-serif"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              Welcome Back
            </motion.h1>
            <motion.p
              className="text-[#8b6f63]/70 dark:text-[#e8ddd5]/60 text-sm"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              Sign in to your account to continue
            </motion.p>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key="login-card"
              className="bg-white dark:bg-[#2d1f24] rounded-2xl shadow-xl shadow-[#8b6f63]/5 dark:shadow-black/20 p-8 border border-[#f5e6e0]/30 dark:border-[#3d2f34]"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
            >
              <AnimatePresence>
                {shakeError && (
                  <motion.div
                    initial={false}
                    animate={{ x: [0, -8, 8, -6, 6, -3, 3, 0] }}
                    transition={{ duration: 0.5 }}
                  >
                    <div className="h-1" />
                  </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={handleSubmit} className="space-y-5">
                <FloatingInput
                  id="login-email"
                  name="email"
                  type="text"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Email / Username"
                  required
                  Icon={Mail}
                />

                <FloatingInput
                  id="login-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Password"
                  required
                  Icon={Lock}
                  showPassword={showPassword}
                  onTogglePassword={() => setShowPassword(!showPassword)}
                />

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer select-none group">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-4.5 h-4.5 w-[18px] h-[18px] rounded border-2 border-[#f5e6e0] dark:border-[#3d2f34] bg-white dark:bg-[#1a1215] peer-checked:bg-[#d4a5a5] peer-checked:border-[#d4a5a5] transition-all duration-200 flex items-center justify-center">
                        <svg
                          className={`w-3 h-3 text-white transition-all duration-200 ${rememberMe ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={3}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    </div>
                    <span className="text-xs text-[#8b6f63]/70 dark:text-[#a89898] group-hover:text-[#8b6f63] dark:group-hover:text-[#e8ddd5] transition-colors">
                      Remember me
                    </span>
                  </label>

                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-xs text-[#d4a5a5] hover:text-[#c89a9a] dark:hover:text-[#d4a5a5] transition-colors"
                  >
                    Forgot Password?
                  </button>
                </div>

                <motion.button
                  type="submit"
                  disabled={isLoading}
                  whileHover={{ scale: isLoading ? 1 : 1.01 }}
                  whileTap={{ scale: isLoading ? 1 : 0.99 }}
                  className="w-full py-3.5 bg-gradient-to-r from-[#d4a5a5] to-[#c89a9a] text-white rounded-xl hover:from-[#c89a9a] hover:to-[#b88a8a] transition-all disabled:opacity-60 font-medium flex items-center justify-center gap-2 shadow-lg shadow-[#d4a5a5]/20"
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </motion.button>
              </form>

              {/* Divider */}
              <div className="flex items-center gap-4 my-6">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#8b6f63]/15 dark:via-[#3d2f34] to-transparent" />
                <span className="text-xs text-[#8b6f63]/40 dark:text-[#a89898]/60 uppercase tracking-wider font-medium">
                  or continue with
                </span>
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#8b6f63]/15 dark:via-[#3d2f34] to-transparent" />
              </div>

              {/* Social Login Buttons */}
              <div className="space-y-3">
                <motion.button
                  whileHover={{ scale: 1.01, y: -1 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={handleSocialLogin}
                  className="w-full py-3 px-4 rounded-xl border-2 border-[#f5e6e0] dark:border-[#3d2f34] bg-white dark:bg-[#1a1215] text-[#8b6f63] dark:text-[#e8ddd5] hover:border-[#8b6f63]/30 dark:hover:border-[#a89898]/30 hover:shadow-md transition-all flex items-center justify-center gap-3 font-medium text-sm"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.01, y: -1 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={handleSocialLogin}
                  className="w-full py-3 px-4 rounded-xl border-2 border-[#f5e6e0] dark:border-[#3d2f34] bg-white dark:bg-[#1a1215] text-[#8b6f63] dark:text-[#e8ddd5] hover:border-[#8b6f63]/30 dark:hover:border-[#a89898]/30 hover:shadow-md transition-all flex items-center justify-center gap-3 font-medium text-sm"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                  </svg>
                  Continue with Apple
                </motion.button>
              </div>

              {/* Demo credentials hint */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.4 }}
                className="mt-5 px-4 py-3 bg-[#fef5f1] dark:bg-[#1a1215] rounded-xl border border-[#f5e6e0] dark:border-[#3d2f34]"
              >
                <p className="text-[11px] text-[#8b6f63]/50 dark:text-[#a89898]/60 leading-relaxed">
                  <span className="font-semibold text-[#8b6f63]/70 dark:text-[#a89898]/80">Demo:</span> Use any email &amp; password to explore, or try{' '}
                  <code className="px-1.5 py-0.5 bg-white dark:bg-[#2d1f24] rounded text-[10px] font-mono text-[#d4a5a5] dark:text-[#d4a5a5]">
                    admin@rare.com
                  </code>
                </p>
              </motion.div>

              <p className="mt-6 text-center text-sm text-[#8b6f63]/70 dark:text-[#e8ddd5]/60">
                Don&apos;t have an account?{' '}
                <button
                  onClick={() => navigate('signup')}
                  className="text-[#d4a5a5] hover:text-[#c89a9a] dark:hover:text-[#d4a5a5] underline underline-offset-4 decoration-[#d4a5a5]/30 hover:decoration-[#d4a5a5] font-medium transition-all"
                >
                  Sign up
                </button>
              </p>
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Right Panel with Product Images */}
      <div className="hidden lg:block lg:flex-1 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#d4a5a5] to-[#8b6f63] opacity-90" />
        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `radial-gradient(circle at 25px 25px, white 1px, transparent 0)`,
          backgroundSize: '50px 50px'
        }} />
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
