'use client';

import { useState, useMemo } from 'react';
import { useStore } from '@/store/store';
import { User, Mail, Lock, Eye, EyeOff, Phone, Check, Loader2, Sparkles } from 'lucide-react';
import { toast } from '@/lib/toast';
import { motion, AnimatePresence } from 'framer-motion';

function getPasswordStrength(password: string) {
  let score = 0;
  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    number: /\d/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\\/~`]/.test(password),
  };
  if (checks.length) score++;
  if (checks.uppercase) score++;
  if (checks.number) score++;
  if (checks.special) score++;

  let label = '';
  let color = '';
  let barColor = '';
  if (score === 0) { label = ''; color = ''; barColor = 'bg-[#e5e7eb] dark:bg-[#3d2f34]'; }
  else if (score === 1) { label = 'Weak'; color = 'text-red-500 dark:text-red-400'; barColor = 'bg-red-500'; }
  else if (score === 2) { label = 'Fair'; color = 'text-orange-500 dark:text-orange-400'; barColor = 'bg-orange-500'; }
  else if (score === 3) { label = 'Good'; color = 'text-yellow-500 dark:text-yellow-400'; barColor = 'bg-yellow-500'; }
  else { label = 'Strong'; color = 'text-green-500 dark:text-green-400'; barColor = 'bg-green-500'; }

  return { score, label, color, barColor, checks, percent: Math.min(100, (score / 4) * 100) };
}

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
        className={`peer w-full pl-11 ${onTogglePassword ? 'pr-11' : 'pr-4'} py-3.5 rounded-xl bg-[#fef5f1] dark:bg-[#1a1215] text-[#8b6f63] dark:text-[#e8ddd5] placeholder:text-transparent focus:outline-none border-2 transition-all duration-300 ${isFocused ? 'border-[#d4a5a5] dark:border-[#d4a5a5] shadow-[0_0_0_3px_rgba(212,165,165,0.15)] dark:shadow-[0_0_0_3px_rgba(212,165,165,0.1)]' : 'border-transparent dark:border-[#3d2f34]'}`}
      />
      <label
        htmlFor={id}
        className={`absolute left-11 transition-all duration-200 pointer-events-none ${
          isActive
            ? 'top-2 text-[10px] font-semibold tracking-wide uppercase text-[#d4a5a5] dark:text-[#d4a5a5]'
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

const steps = ['Account', 'Profile', 'Done'];

export function SignupPage() {
  const { login, navigate, shopSettings } = useStore();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    password: '', confirmPassword: '', agreeToTerms: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const passwordStrength = useMemo(() => getPasswordStrength(formData.password), [formData.password]);
  const passwordsMatch = formData.confirmPassword.length > 0 && formData.password === formData.confirmPassword;
  const passwordsMismatch = formData.confirmPassword.length > 0 && formData.password !== formData.confirmPassword;

  // Determine current step based on form state
  const currentStep = useMemo(() => {
    if (!formData.email && !formData.password) return 0;
    if (!formData.firstName && !formData.lastName) return 0;
    if (!formData.agreeToTerms) return 1;
    return 2;
  }, [formData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) { toast('Passwords do not match', 'error'); return; }
    if (!formData.agreeToTerms) { toast('Please agree to the terms', 'error'); return; }

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: `${formData.firstName} ${formData.lastName}`, email: formData.email, password: formData.password, phone: formData.phone }),
      });
      const data = await res.json();
      if (!res.ok) { toast(data.error || 'Failed to create account', 'error'); return; }

      // Show success animation
      setShowSuccess(true);
      setTimeout(() => {
        login(data);
        toast('Account created successfully!');
        navigate('home');
      }, 2000);
    } catch {
      toast('Failed to create account', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialSignup = () => {
    toast('Social signup coming soon');
  };

  return (
    <div className="min-h-screen bg-[#fef5f1] dark:bg-[#1a1215] flex relative overflow-hidden">
      {/* Decorative background shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-[#d4a5a5]/5 dark:bg-[#d4a5a5]/3" />
        <div className="absolute -bottom-48 -left-48 w-[500px] h-[500px] rounded-full bg-[#8b6f63]/5 dark:bg-[#8b6f63]/3" />
        <div className="absolute top-1/4 right-1/3 w-64 h-64 rounded-full bg-[#f5e6e0]/30 dark:bg-[#3d2f34]/10 blur-3xl" />
      </div>

      {/* Left Panel - Decorative */}
      <div className="hidden lg:block lg:flex-1 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#8b6f63] to-[#d4a5a5] opacity-90" />
        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `radial-gradient(circle at 25px 25px, white 1px, transparent 0)`,
          backgroundSize: '50px 50px'
        }} />
        <div className="absolute inset-0 flex items-center justify-center p-12">
          <div className="text-center text-white space-y-6">
            <motion.h2
              className="text-4xl font-serif"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              Join Our Beauty Community
            </motion.h2>
            <motion.p
              className="text-xl opacity-90"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              Start your journey to natural beauty
            </motion.p>
            <div className="mt-12 space-y-4">
              {[
                { emoji: '✨', title: 'Exclusive Offers', desc: 'Get 10% off your first order' },
                { emoji: '🎁', title: 'Early Access', desc: 'Be first to try new products' },
                { emoji: '💎', title: 'Loyalty Rewards', desc: 'Earn points on every purchase' },
              ].map((item, index) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="flex items-center gap-4 bg-white/15 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:bg-white/20 transition-colors"
                >
                  <span className="text-2xl">{item.emoji}</span>
                  <div className="text-left">
                    <p className="font-medium">{item.title}</p>
                    <p className="text-sm opacity-80">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <motion.div
        className="flex-1 flex items-center justify-center p-8 relative z-10"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="w-full max-w-md">
          <div className="text-center mb-6">
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
              Create Your Account
            </motion.h1>
            <motion.p
              className="text-[#8b6f63]/70 dark:text-[#e8ddd5]/60 text-sm"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              Join us and discover your natural beauty
            </motion.p>
          </div>

          {/* Step Indicator */}
          <motion.div
            className="flex items-center justify-center gap-0 mb-6"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {steps.map((step, index) => (
              <div key={step} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                      index <= currentStep
                        ? 'bg-[#d4a5a5] text-white shadow-md shadow-[#d4a5a5]/25'
                        : 'bg-[#f5e6e0] dark:bg-[#3d2f34] text-[#8b6f63]/40 dark:text-[#a89898]/50'
                    }`}
                  >
                    {index < currentStep ? <Check size={14} /> : index + 1}
                  </div>
                  <span className={`text-[10px] mt-1 font-medium transition-colors duration-300 ${
                    index <= currentStep ? 'text-[#d4a5a5] dark:text-[#d4a5a5]' : 'text-[#8b6f63]/40 dark:text-[#a89898]/50'
                  }`}>
                    {step}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-12 h-0.5 mx-2 mb-4 rounded-full transition-colors duration-300 ${
                    index < currentStep ? 'bg-[#d4a5a5]' : 'bg-[#f5e6e0] dark:bg-[#3d2f34]'
                  }`} />
                )}
              </div>
            ))}
          </motion.div>

          {/* Success State */}
          <AnimatePresence mode="wait">
            {showSuccess ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white dark:bg-[#2d1f24] rounded-2xl shadow-xl shadow-[#8b6f63]/5 dark:shadow-black/20 p-12 text-center border border-[#f5e6e0]/30 dark:border-[#3d2f34]"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
                  className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center mb-4"
                >
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.3 }}
                  >
                    <Check size={36} className="text-white" />
                  </motion.div>
                </motion.div>
                <motion.h3
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-xl font-serif text-[#8b6f63] dark:text-[#e8ddd5] mb-2"
                >
                  Welcome to {shopSettings.shopName}!
                </motion.h3>
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="text-sm text-[#8b6f63]/70 dark:text-[#e8ddd5]/60"
                >
                  Redirecting you to the store...
                </motion.p>
              </motion.div>
            ) : (
              <motion.div
                key="signup-form"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, duration: 0.4 }}
                className="bg-white dark:bg-[#2d1f24] rounded-2xl shadow-xl shadow-[#8b6f63]/5 dark:shadow-black/20 p-8 border border-[#f5e6e0]/30 dark:border-[#3d2f34]"
              >
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Name Fields */}
                  <div className="grid grid-cols-2 gap-3">
                    <FloatingInput
                      id="signup-firstName"
                      name="firstName"
                      type="text"
                      value={formData.firstName}
                      onChange={handleChange}
                      placeholder="First Name"
                      required
                      Icon={User}
                    />
                    <FloatingInput
                      id="signup-lastName"
                      name="lastName"
                      type="text"
                      value={formData.lastName}
                      onChange={handleChange}
                      placeholder="Last Name"
                      required
                      Icon={User}
                    />
                  </div>

                  <FloatingInput
                    id="signup-email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Email Address"
                    required
                    Icon={Mail}
                  />

                  <FloatingInput
                    id="signup-phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Phone (Optional)"
                    Icon={Phone}
                  />

                  {/* Password */}
                  <div>
                    <FloatingInput
                      id="signup-password"
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
                    {/* Password Strength Indicator */}
                    {formData.password.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-2 space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1 h-1.5 bg-[#f5e6e0] dark:bg-[#3d2f34] rounded-full overflow-hidden mr-3">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${passwordStrength.percent}%` }}
                              className={`h-full rounded-full ${passwordStrength.barColor} transition-colors duration-300`}
                            />
                          </div>
                          <span className={`text-[11px] font-semibold ${passwordStrength.color}`}>
                            {passwordStrength.label}
                          </span>
                        </div>
                        {/* Password Requirements Checklist */}
                        <div className="grid grid-cols-2 gap-1">
                          {[
                            { label: '8+ characters', met: passwordStrength.checks.length },
                            { label: 'Uppercase', met: passwordStrength.checks.uppercase },
                            { label: 'Number', met: passwordStrength.checks.number },
                            { label: 'Special char', met: passwordStrength.checks.special },
                          ].map((req) => (
                            <div key={req.label} className="flex items-center gap-1.5">
                              <motion.div
                                initial={false}
                                animate={{
                                  scale: req.met ? 1 : 0.8,
                                  backgroundColor: req.met ? '#d4a5a5' : 'transparent',
                                  borderColor: req.met ? '#d4a5a5' : '#f5e6e0',
                                }}
                                transition={{ duration: 0.2 }}
                                className="w-3.5 h-3.5 rounded border flex items-center justify-center flex-shrink-0"
                                style={{ borderColor: req.met ? '#d4a5a5' : undefined }}
                              >
                                {req.met && <Check size={9} className="text-white" strokeWidth={3} />}
                              </motion.div>
                              <span className={`text-[10px] transition-colors duration-200 ${
                                req.met ? 'text-[#8b6f63] dark:text-[#e8ddd5]' : 'text-[#8b6f63]/40 dark:text-[#a89898]/50'
                              }`}>
                                {req.label}
                              </span>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <FloatingInput
                      id="signup-confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Confirm Password"
                      required
                      Icon={Lock}
                      showPassword={showConfirmPassword}
                      onTogglePassword={() => setShowConfirmPassword(!showConfirmPassword)}
                    />
                    {passwordsMatch && (
                      <motion.p
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-[11px] text-green-600 dark:text-green-400 mt-1 flex items-center gap-1"
                      >
                        <Check size={12} /> Passwords match
                      </motion.p>
                    )}
                    {passwordsMismatch && (
                      <motion.p
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-[11px] text-red-500 dark:text-red-400 mt-1"
                      >
                        Passwords do not match
                      </motion.p>
                    )}
                  </div>

                  {/* Terms & Conditions */}
                  <label className="flex items-start gap-2.5 text-sm text-[#8b6f63] dark:text-[#a89898] cursor-pointer select-none group p-2.5 rounded-lg hover:bg-[#fef5f1] dark:hover:bg-[#1a1215] transition-colors">
                    <div className="relative mt-0.5">
                      <input
                        type="checkbox"
                        name="agreeToTerms"
                        checked={formData.agreeToTerms}
                        onChange={handleChange}
                        className="sr-only peer"
                      />
                      <div className="w-[18px] h-[18px] rounded border-2 border-[#f5e6e0] dark:border-[#3d2f34] bg-white dark:bg-[#1a1215] peer-checked:bg-[#d4a5a5] peer-checked:border-[#d4a5a5] transition-all duration-200 flex items-center justify-center">
                        <svg
                          className={`w-3 h-3 text-white transition-all duration-200 ${formData.agreeToTerms ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={3}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    </div>
                    <span className="text-xs leading-relaxed text-[#8b6f63]/70 dark:text-[#a89898]/80">
                      I agree to the{' '}
                      <span className="text-[#d4a5a5] dark:text-[#d4a5a5] hover:underline cursor-pointer">
                        Terms of Service
                      </span>{' '}
                      and{' '}
                      <span className="text-[#d4a5a5] dark:text-[#d4a5a5] hover:underline cursor-pointer">
                        Privacy Policy
                      </span>
                    </span>
                  </label>

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
                        Creating Account...
                      </>
                    ) : (
                      <>
                        <Sparkles size={16} />
                        Create Account
                      </>
                    )}
                  </motion.button>
                </form>

                {/* Divider */}
                <div className="flex items-center gap-4 my-5">
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#8b6f63]/15 dark:via-[#3d2f34] to-transparent" />
                  <span className="text-xs text-[#8b6f63]/40 dark:text-[#a89898]/60 uppercase tracking-wider font-medium">
                    or continue with
                  </span>
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#8b6f63]/15 dark:via-[#3d2f34] to-transparent" />
                </div>

                {/* Social Signup Buttons */}
                <div className="space-y-3">
                  <motion.button
                    whileHover={{ scale: 1.01, y: -1 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={handleSocialSignup}
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
                    onClick={handleSocialSignup}
                    className="w-full py-3 px-4 rounded-xl border-2 border-[#f5e6e0] dark:border-[#3d2f34] bg-white dark:bg-[#1a1215] text-[#8b6f63] dark:text-[#e8ddd5] hover:border-[#8b6f63]/30 dark:hover:border-[#a89898]/30 hover:shadow-md transition-all flex items-center justify-center gap-3 font-medium text-sm"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                    </svg>
                    Continue with Apple
                  </motion.button>
                </div>

                <p className="mt-5 text-center text-sm text-[#8b6f63]/70 dark:text-[#e8ddd5]/60">
                  Already have an account?{' '}
                  <button
                    onClick={() => navigate('login')}
                    className="text-[#d4a5a5] hover:text-[#c89a9a] dark:hover:text-[#d4a5a5] underline underline-offset-4 decoration-[#d4a5a5]/30 hover:decoration-[#d4a5a5] font-medium transition-all"
                  >
                    Sign in
                  </button>
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
