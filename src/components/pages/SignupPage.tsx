'use client';

import { useState } from 'react';
import { useStore } from '@/store/store';
import { User, Mail, Lock, Eye, EyeOff, Phone } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export function SignupPage() {
  const { login, navigate } = useStore();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    password: '', confirmPassword: '', agreeToTerms: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) { toast.error('Passwords do not match'); return; }
    if (!formData.agreeToTerms) { toast.error('Please agree to the terms'); return; }

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: `${formData.firstName} ${formData.lastName}`, email: formData.email, password: formData.password, phone: formData.phone }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || 'Failed to create account'); return; }
      login(data);
      toast.success('Account created successfully!');
      navigate('home');
    } catch {
      toast.error('Failed to create account');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fef5f1] flex">
      <div className="hidden lg:block lg:flex-1 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#8b6f63] to-[#d4a5a5] opacity-90" />
        <div className="absolute inset-0 flex items-center justify-center p-12">
          <div className="text-center text-white space-y-6">
            <h2 className="text-4xl font-serif">Join Our Beauty Community</h2>
            <p className="text-xl opacity-90">Start your journey to natural beauty</p>
            <div className="mt-12 space-y-4">
              {[
                { emoji: '✨', title: 'Exclusive Offers', desc: 'Get 10% off your first order' },
                { emoji: '🎁', title: 'Early Access', desc: 'Be first to try new products' },
                { emoji: '💎', title: 'Loyalty Rewards', desc: 'Earn points on every purchase' },
              ].map((item) => (
                <div key={item.title} className="flex items-center gap-4 bg-white/20 backdrop-blur-sm rounded-lg p-4">
                  <span className="text-2xl">{item.emoji}</span>
                  <div className="text-left"><p className="font-medium">{item.title}</p><p className="text-sm opacity-80">{item.desc}</p></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <motion.div className="flex-1 flex items-center justify-center p-8" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <button onClick={() => navigate('home')} className="text-3xl font-serif text-[#8b6f63] inline-block mb-2 hover:text-[#d4a5a5] transition-colors">Rare Beauty</button>
            <h1 className="text-2xl text-[#8b6f63] mb-2">Create Your Account</h1>
            <p className="text-[#8b6f63]/70">Join us and discover your natural beauty</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-[#8b6f63] mb-2">First Name</label>
                  <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} placeholder="First name" required
                    className="w-full px-4 py-3 rounded-lg bg-[#fef5f1] text-[#8b6f63] placeholder:text-[#8b6f63]/40 focus:outline-none focus:ring-2 focus:ring-[#d4a5a5]" />
                </div>
                <div>
                  <label className="block text-sm text-[#8b6f63] mb-2">Last Name</label>
                  <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} placeholder="Last name" required
                    className="w-full px-4 py-3 rounded-lg bg-[#fef5f1] text-[#8b6f63] placeholder:text-[#8b6f63]/40 focus:outline-none focus:ring-2 focus:ring-[#d4a5a5]" />
                </div>
              </div>

              <div>
                <label className="block text-sm text-[#8b6f63] mb-2"><Mail size={16} className="inline mr-2" />Email Address</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Enter your email" required
                  className="w-full px-4 py-3 rounded-lg bg-[#fef5f1] text-[#8b6f63] placeholder:text-[#8b6f63]/40 focus:outline-none focus:ring-2 focus:ring-[#d4a5a5]" />
              </div>
              <div>
                <label className="block text-sm text-[#8b6f63] mb-2"><Phone size={16} className="inline mr-2" />Phone (Optional)</label>
                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="Enter your phone number"
                  className="w-full px-4 py-3 rounded-lg bg-[#fef5f1] text-[#8b6f63] placeholder:text-[#8b6f63]/40 focus:outline-none focus:ring-2 focus:ring-[#d4a5a5]" />
              </div>

              {[
                { name: 'password', label: 'Password', show: showPassword, toggle: () => setShowPassword(!showPassword) },
                { name: 'confirmPassword', label: 'Confirm Password', show: showConfirmPassword, toggle: () => setShowConfirmPassword(!showConfirmPassword) },
              ].map((field) => (
                <div key={field.name}>
                  <label className="block text-sm text-[#8b6f63] mb-2"><Lock size={16} className="inline mr-2" />{field.label}</label>
                  <div className="relative">
                    <input type={field.show ? 'text' : 'password'} name={field.name} value={formData[field.name as keyof typeof formData] as string} onChange={handleChange} placeholder={field.label} required
                      className="w-full px-4 py-3 rounded-lg bg-[#fef5f1] text-[#8b6f63] placeholder:text-[#8b6f63]/40 focus:outline-none focus:ring-2 focus:ring-[#d4a5a5]" />
                    <button type="button" onClick={field.toggle} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8b6f63]/50 hover:text-[#8b6f63]">
                      {field.show ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>
              ))}

              <label className="flex items-start gap-2 text-sm text-[#8b6f63]">
                <input type="checkbox" name="agreeToTerms" checked={formData.agreeToTerms} onChange={handleChange} className="mt-0.5 rounded border-[#8b6f63]/30 accent-[#d4a5a5]" />
                <span>I agree to the Terms of Service and Privacy Policy</span>
              </label>

              <button type="submit" disabled={isLoading} className="w-full py-3 bg-[#d4a5a5] text-white rounded-full hover:bg-[#c89a9a] transition-all disabled:opacity-50 active:scale-[0.98]">
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-[#8b6f63]/70">
              Already have an account?{' '}
              <button onClick={() => navigate('login')} className="text-[#d4a5a5] hover:underline font-medium">Sign in</button>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
