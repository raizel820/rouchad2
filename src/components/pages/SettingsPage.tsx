'use client';

import { useState } from 'react';
import { useStore } from '@/store/store';
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Lock,
  Bell,
  CreditCard,
  Globe,
  Shield,
} from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export function SettingsPage() {
  const { isAuthenticated, user, navigate } = useStore();
  const [activeSection, setActiveSection] = useState<'account' | 'security' | 'notifications' | 'preferences'>('account');

  const [accountData, setAccountData] = useState({
    firstName: user?.name?.split(' ')[0] || '',
    lastName: user?.name?.split(' ').slice(1).join(' ') || '',
    email: user?.email || '',
    phone: user?.phone || '',
    dateOfBirth: '',
  });

  const [notifications, setNotifications] = useState({
    orderUpdates: true,
    promotions: true,
    newsletter: true,
    newArrivals: false,
    restockAlerts: true,
  });

  const [preferences, setPreferences] = useState({
    language: 'English',
    currency: 'USD',
    theme: 'light',
  });

  if (!isAuthenticated) {
    navigate('login');
    return null;
  }

  const handleAccountUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Account information updated successfully!');
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Password changed successfully!');
  };

  const handleNotificationToggle = (key: keyof typeof notifications) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
    toast.success('Notification settings updated');
  };

  const getNotificationDescription = (key: string) => {
    switch (key) {
      case 'orderUpdates': return 'Get updates on your orders';
      case 'promotions': return 'Receive special offers and discounts';
      case 'newsletter': return 'Weekly beauty tips and trends';
      case 'newArrivals': return 'Be first to know about new products';
      case 'restockAlerts': return 'Get notified when items are back in stock';
      default: return '';
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Back Button */}
      <motion.button
        onClick={() => navigate('profile')}
        className="inline-flex items-center gap-2 text-[#8b6f63] hover:text-[#d4a5a5] mb-8 transition-colors"
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <ArrowLeft size={20} />
        Back to Profile
      </motion.button>

      <motion.h1
        className="text-3xl font-serif text-[#8b6f63] mb-8"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        Settings
      </motion.h1>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <motion.div
            className="bg-white rounded-lg shadow-sm p-4 sticky top-24 border border-[#f5e6e0]/50"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <nav className="space-y-2">
              <button
                onClick={() => setActiveSection('account')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeSection === 'account'
                    ? 'bg-[#fef5f1] text-[#d4a5a5] font-medium'
                    : 'text-[#8b6f63] hover:bg-[#fef5f1]'
                }`}
              >
                <User size={20} />
                <span>Account</span>
              </button>
              <button
                onClick={() => setActiveSection('security')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeSection === 'security'
                    ? 'bg-[#fef5f1] text-[#d4a5a5] font-medium'
                    : 'text-[#8b6f63] hover:bg-[#fef5f1]'
                }`}
              >
                <Shield size={20} />
                <span>Security</span>
              </button>
              <button
                onClick={() => setActiveSection('notifications')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeSection === 'notifications'
                    ? 'bg-[#fef5f1] text-[#d4a5a5] font-medium'
                    : 'text-[#8b6f63] hover:bg-[#fef5f1]'
                }`}
              >
                <Bell size={20} />
                <span>Notifications</span>
              </button>
              <button
                onClick={() => setActiveSection('preferences')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeSection === 'preferences'
                    ? 'bg-[#fef5f1] text-[#d4a5a5] font-medium'
                    : 'text-[#8b6f63] hover:bg-[#fef5f1]'
                }`}
              >
                <Globe size={20} />
                <span>Preferences</span>
              </button>
            </nav>
          </motion.div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {/* Account Settings */}
          {activeSection === 'account' && (
            <motion.div
              className="bg-white rounded-lg shadow-sm p-6 border border-[#f5e6e0]/50"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h2 className="text-2xl font-serif text-[#8b6f63] mb-6">Account Information</h2>
              <form onSubmit={handleAccountUpdate} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-[#8b6f63] mb-2">
                      <User className="inline mr-2" size={14} />
                      First Name
                    </label>
                    <input
                      type="text"
                      value={accountData.firstName}
                      onChange={(e) => setAccountData({ ...accountData, firstName: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg bg-[#fef5f1] text-[#8b6f63] focus:outline-none focus:ring-2 focus:ring-[#d4a5a5]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-[#8b6f63] mb-2">
                      <User className="inline mr-2" size={14} />
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={accountData.lastName}
                      onChange={(e) => setAccountData({ ...accountData, lastName: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg bg-[#fef5f1] text-[#8b6f63] focus:outline-none focus:ring-2 focus:ring-[#d4a5a5]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-[#8b6f63] mb-2">
                      <Mail className="inline mr-2" size={14} />
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={accountData.email}
                      onChange={(e) => setAccountData({ ...accountData, email: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg bg-[#fef5f1] text-[#8b6f63] focus:outline-none focus:ring-2 focus:ring-[#d4a5a5]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-[#8b6f63] mb-2">
                      <Phone className="inline mr-2" size={14} />
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={accountData.phone}
                      onChange={(e) => setAccountData({ ...accountData, phone: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg bg-[#fef5f1] text-[#8b6f63] focus:outline-none focus:ring-2 focus:ring-[#d4a5a5]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-[#8b6f63] mb-2">Date of Birth</label>
                    <input
                      type="date"
                      value={accountData.dateOfBirth}
                      onChange={(e) => setAccountData({ ...accountData, dateOfBirth: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg bg-[#fef5f1] text-[#8b6f63] focus:outline-none focus:ring-2 focus:ring-[#d4a5a5]"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="px-6 py-3 bg-[#d4a5a5] text-white rounded-full hover:bg-[#c89a9a] transition-colors"
                >
                  Save Changes
                </button>
              </form>
            </motion.div>
          )}

          {/* Security Settings */}
          {activeSection === 'security' && (
            <motion.div
              className="space-y-6"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="bg-white rounded-lg shadow-sm p-6 border border-[#f5e6e0]/50">
                <h2 className="text-2xl font-serif text-[#8b6f63] mb-6">Change Password</h2>
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div>
                    <label className="block text-sm text-[#8b6f63] mb-2">
                      <Lock className="inline mr-2" size={14} />
                      Current Password
                    </label>
                    <input
                      type="password"
                      placeholder="Enter current password"
                      required
                      className="w-full px-4 py-3 rounded-lg bg-[#fef5f1] text-[#8b6f63] placeholder:text-[#8b6f63]/40 focus:outline-none focus:ring-2 focus:ring-[#d4a5a5]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-[#8b6f63] mb-2">
                      <Lock className="inline mr-2" size={14} />
                      New Password
                    </label>
                    <input
                      type="password"
                      placeholder="Enter new password"
                      required
                      className="w-full px-4 py-3 rounded-lg bg-[#fef5f1] text-[#8b6f63] placeholder:text-[#8b6f63]/40 focus:outline-none focus:ring-2 focus:ring-[#d4a5a5]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-[#8b6f63] mb-2">
                      <Lock className="inline mr-2" size={14} />
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      placeholder="Confirm new password"
                      required
                      className="w-full px-4 py-3 rounded-lg bg-[#fef5f1] text-[#8b6f63] placeholder:text-[#8b6f63]/40 focus:outline-none focus:ring-2 focus:ring-[#d4a5a5]"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-[#d4a5a5] text-white rounded-full hover:bg-[#c89a9a] transition-colors"
                  >
                    Update Password
                  </button>
                </form>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6 border border-[#f5e6e0]/50">
                <h3 className="text-lg text-[#8b6f63] mb-2">Two-Factor Authentication</h3>
                <p className="text-sm text-[#8b6f63]/70 mb-4">Add an extra layer of security to your account</p>
                <button onClick={() => toast.info('2FA setup coming soon!')} className="px-6 py-3 border border-[#d4a5a5] text-[#d4a5a5] rounded-full hover:bg-[#fef5f1] transition-colors">
                  Enable 2FA
                </button>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6 border border-[#f5e6e0]/50">
                <h3 className="text-lg text-[#8b6f63] mb-4">Payment Methods</h3>
                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between p-4 bg-[#fef5f1] rounded-lg">
                    <div className="flex items-center gap-3">
                      <CreditCard className="text-[#d4a5a5]" size={24} />
                      <div>
                        <p className="text-[#8b6f63]">•••• •••• •••• 4242</p>
                        <p className="text-sm text-[#8b6f63]/70">Expires 12/25</p>
                      </div>
                    </div>
                    <button onClick={() => toast.info('Payment method removed')} className="text-sm text-red-500 hover:underline">
                      Remove
                    </button>
                  </div>
                </div>
                <button onClick={() => toast.info('Add payment method coming soon!')} className="px-6 py-3 border border-[#d4a5a5] text-[#d4a5a5] rounded-full hover:bg-[#fef5f1] transition-colors">
                  Add Payment Method
                </button>
              </div>
            </motion.div>
          )}

          {/* Notifications Settings */}
          {activeSection === 'notifications' && (
            <motion.div
              className="bg-white rounded-lg shadow-sm p-6 border border-[#f5e6e0]/50"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h2 className="text-2xl font-serif text-[#8b6f63] mb-6">Notification Preferences</h2>
              <div className="space-y-4">
                {Object.entries(notifications).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between p-4 bg-[#fef5f1] rounded-lg">
                    <div>
                      <p className="text-[#8b6f63] font-medium capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </p>
                      <p className="text-sm text-[#8b6f63]/70">{getNotificationDescription(key)}</p>
                    </div>
                    <button
                      onClick={() => handleNotificationToggle(key as keyof typeof notifications)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        value ? 'bg-[#d4a5a5]' : 'bg-gray-300'
                      }`}
                      aria-label={`Toggle ${key}`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          value ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Preferences Settings */}
          {activeSection === 'preferences' && (
            <motion.div
              className="bg-white rounded-lg shadow-sm p-6 border border-[#f5e6e0]/50"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h2 className="text-2xl font-serif text-[#8b6f63] mb-6">Preferences</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm text-[#8b6f63] mb-2">
                    <Globe className="inline mr-2" size={14} />
                    Language
                  </label>
                  <select
                    value={preferences.language}
                    onChange={(e) => setPreferences({ ...preferences, language: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg bg-[#fef5f1] text-[#8b6f63] focus:outline-none focus:ring-2 focus:ring-[#d4a5a5]"
                  >
                    <option>English</option>
                    <option>Spanish</option>
                    <option>French</option>
                    <option>German</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-[#8b6f63] mb-2">Currency</label>
                  <select
                    value={preferences.currency}
                    onChange={(e) => setPreferences({ ...preferences, currency: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg bg-[#fef5f1] text-[#8b6f63] focus:outline-none focus:ring-2 focus:ring-[#d4a5a5]"
                  >
                    <option>USD ($)</option>
                    <option>EUR (€)</option>
                    <option>GBP (£)</option>
                    <option>JPY (¥)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-[#8b6f63] mb-2">Theme</label>
                  <select
                    value={preferences.theme}
                    onChange={(e) => setPreferences({ ...preferences, theme: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg bg-[#fef5f1] text-[#8b6f63] focus:outline-none focus:ring-2 focus:ring-[#d4a5a5]"
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="auto">Auto</option>
                  </select>
                </div>
                <button
                  onClick={() => toast.success('Preferences saved successfully!')}
                  className="px-6 py-3 bg-[#d4a5a5] text-white rounded-full hover:bg-[#c89a9a] transition-colors"
                >
                  Save Preferences
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
