'use client';

import { useState, useEffect } from 'react';
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
  Plus,
  Trash2,
  Star,
  X,
  Eye,
  EyeOff,
  Loader2,
  Check,
  Calendar,
  Pencil,
  MapPin,
  Banknote,
} from 'lucide-react';
import { toast } from '@/lib/toast';
import { motion, AnimatePresence } from 'framer-motion';

interface Address {
  id: string;
  label: string;
  name: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone?: string;
  isDefault: boolean;
}

interface PaymentMethodItem {
  id: string;
  type: string;
  lastFour: string | null;
  expiryMonth: number | null;
  expiryYear: number | null;
  holderName: string | null;
  isPreferred: boolean;
}

const CARD_TYPES = [
  { value: 'VISA', label: 'Visa', color: '#1a1f71' },
  { value: 'MASTERCARD', label: 'Mastercard', color: '#eb001b' },
  { value: 'AMEX', label: 'American Express', color: '#006fcf' },
  { value: 'DISCOVER', label: 'Discover', color: '#ff6000' },
];

const getPaymentIcon = (type: string) => {
  switch (type.toUpperCase()) {
    case 'VISA':
    case 'MASTERCARD':
    case 'AMEX':
    case 'DISCOVER':
      return <CreditCard size={20} className="text-[#8b6f63]" />;
    case 'PAY_ON_RECEIVE':
      return <Banknote size={20} className="text-[#8b6f63]" />;
    default:
      return <CreditCard size={20} className="text-[#8b6f63]" />;
  }
};

const getPaymentLabel = (type: string) => {
  switch (type.toUpperCase()) {
    case 'PAY_ON_RECEIVE': return 'Pay on Receive';
    case 'CASH_ON_DELIVERY': return 'Cash on Delivery';
    default: return type;
  }
};

const getPaymentDescription = (pm: PaymentMethodItem) => {
  if (pm.type.toUpperCase() === 'PAY_ON_RECEIVE' || pm.type.toUpperCase() === 'CASH_ON_DELIVERY') {
    return 'Pay when you receive your order';
  }
  return `•••• •••• •••• ${pm.lastFour || '****'}`;
};

export function SettingsPage() {
  const { isAuthenticated, user, navigate, updateUser } = useStore();
  const [activeSection, setActiveSection] = useState<'account' | 'security' | 'payment' | 'notifications' | 'preferences'>('account');
  const [saving, setSaving] = useState(false);

  // Account form state
  const [accountData, setAccountData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
  });

  // Password form state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);

  // Addresses state
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [addressForm, setAddressForm] = useState({
    label: 'Home',
    name: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States',
    phone: '',
    isDefault: false,
  });
  const [addressSaving, setAddressSaving] = useState(false);

  // Payment methods state
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodItem[]>([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    type: 'VISA',
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    holderName: '',
    isPreferred: false,
  });
  const [paymentSaving, setPaymentSaving] = useState(false);

  // Notifications state
  const [notifications, setNotifications] = useState({
    orderUpdates: true,
    promotions: true,
    newsletter: true,
    newArrivals: false,
    restockAlerts: true,
  });

  // Preferences state
  const [preferences, setPreferences] = useState({
    language: 'English',
    currency: 'USD',
    theme: 'light',
  });

  const fetchAddresses = async () => {
    if (!user) return;
    try {
      const res = await fetch(`/api/addresses?userId=${user.id}`);
      const data = await res.json();
      if (Array.isArray(data)) setAddresses(data);
    } catch {}
  };

  const fetchPaymentMethods = async () => {
    if (!user) return;
    try {
      const res = await fetch(`/api/payment-methods?userId=${user.id}`);
      const data = await res.json();
      if (Array.isArray(data)) setPaymentMethods(data);
    } catch {}
  };

  // Load user profile data on mount
  useEffect(() => {
    if (!isAuthenticated || !user) {
      navigate('login');
      return;
    }
    // Load profile from API
    fetch(`/api/user/profile?userId=${user.id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.id) {
          const nameParts = (data.name || '').split(' ');
          setAccountData({
            firstName: nameParts[0] || '',
            lastName: nameParts.slice(1).join(' ') || '',
            email: data.email || '',
            phone: data.phone || '',
            dateOfBirth: data.birthdate ? data.birthdate.split('T')[0] : '',
          });
        }
      })
      .catch(() => {});

    // Load addresses and payment methods
    fetch(`/api/addresses?userId=${user.id}`)
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setAddresses(data); })
      .catch(() => {});

    fetch(`/api/payment-methods?userId=${user.id}`)
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setPaymentMethods(data); })
      .catch(() => {});
  }, [isAuthenticated, user, navigate]);

  if (!isAuthenticated || !user) return null;

  // --- Account Handlers ---
  const handleAccountUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          name: `${accountData.firstName} ${accountData.lastName}`.trim(),
          email: accountData.email,
          phone: accountData.phone || null,
          birthdate: accountData.dateOfBirth || null,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        updateUser({
          name: data.name,
          email: data.email,
          phone: data.phone,
          birthdate: data.birthdate,
        });
        toast('Account information updated successfully!');
      } else {
        toast(data.error || 'Failed to update account', 'error');
      }
    } catch {
      toast('Failed to update account', 'error');
    }
    setSaving(false);
  };

  // --- Password Handlers ---
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast('New passwords do not match', 'error');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      toast('New password must be at least 6 characters', 'error');
      return;
    }
    setPasswordSaving(true);
    try {
      const res = await fetch('/api/user/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        toast('Password changed successfully!');
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        toast(data.error || 'Failed to change password', 'error');
      }
    } catch {
      toast('Failed to change password', 'error');
    }
    setPasswordSaving(false);
  };

  // --- Address Handlers ---
  const openAddressModal = (address?: Address) => {
    if (address) {
      setEditingAddress(address);
      setAddressForm({
        label: address.label,
        name: address.name,
        street: address.street,
        city: address.city,
        state: address.state,
        zipCode: address.zipCode,
        country: address.country,
        phone: address.phone || '',
        isDefault: address.isDefault,
      });
    } else {
      setEditingAddress(null);
      setAddressForm({
        label: 'Home',
        name: `${user.name}`,
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'United States',
        phone: user.phone || '',
        isDefault: addresses.length === 0,
      });
    }
    setShowAddressModal(true);
  };

  const handleAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddressSaving(true);
    try {
      if (editingAddress) {
        const res = await fetch(`/api/addresses/${editingAddress.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id, ...addressForm }),
        });
        const data = await res.json();
        if (res.ok) {
          toast('Address updated successfully!');
          await fetchAddresses();
          setShowAddressModal(false);
        } else {
          toast(data.error || 'Failed to update address', 'error');
        }
      } else {
        const res = await fetch('/api/addresses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id, ...addressForm }),
        });
        const data = await res.json();
        if (res.ok) {
          toast('Address added successfully!');
          await fetchAddresses();
          setShowAddressModal(false);
        } else {
          toast(data.error || 'Failed to add address', 'error');
        }
      }
    } catch {
      toast('Failed to save address', 'error');
    }
    setAddressSaving(false);
  };

  const handleDeleteAddress = async (addressId: string) => {
    if (!confirm('Are you sure you want to delete this address?')) return;
    try {
      const res = await fetch(`/api/addresses/${addressId}?userId=${user.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok) {
        toast('Address deleted');
        await fetchAddresses();
      } else {
        toast(data.error || 'Failed to delete address', 'error');
      }
    } catch {
      toast('Failed to delete address', 'error');
    }
  };

  const handleSetDefaultAddress = async (addressId: string) => {
    try {
      const res = await fetch(`/api/addresses/${addressId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, isDefault: true }),
      });
      if (res.ok) {
        toast('Default address updated');
        await fetchAddresses();
      }
    } catch {
      toast('Failed to update default address', 'error');
    }
  };

  // --- Payment Method Handlers ---
  const openPaymentModal = () => {
    setPaymentForm({
      type: 'VISA',
      cardNumber: '',
      expiryMonth: '',
      expiryYear: '',
      holderName: `${user.name}`,
      isPreferred: paymentMethods.length === 0,
    });
    setShowPaymentModal(true);
  };

  const handleAddPayOnReceive = async () => {
    // Check if already exists
    const existing = paymentMethods.find(pm => pm.type.toUpperCase() === 'PAY_ON_RECEIVE');
    if (existing) {
      toast('Pay on Receive is already added', 'error');
      return;
    }
    setPaymentSaving(true);
    try {
      const res = await fetch('/api/payment-methods', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          type: 'PAY_ON_RECEIVE',
          isPreferred: paymentMethods.length === 0,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        toast('Pay on Receive added successfully!');
        await fetchPaymentMethods();
      } else {
        toast(data.error || 'Failed to add payment method', 'error');
      }
    } catch {
      toast('Failed to add payment method', 'error');
    }
    setPaymentSaving(false);
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const lastFour = paymentForm.cardNumber.replace(/\s/g, '').slice(-4);
    if (paymentForm.cardNumber.replace(/\s/g, '').length < 4) {
      toast('Please enter a valid card number', 'error');
      return;
    }
    const month = parseInt(paymentForm.expiryMonth);
    const year = parseInt(paymentForm.expiryYear);
    if (!month || month < 1 || month > 12) {
      toast('Please enter a valid expiry month', 'error');
      return;
    }
    if (!year || year < 2024 || year > 2035) {
      toast('Please enter a valid expiry year', 'error');
      return;
    }

    setPaymentSaving(true);
    try {
      const res = await fetch('/api/payment-methods', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          type: paymentForm.type,
          lastFour,
          expiryMonth: month,
          expiryYear: year,
          holderName: paymentForm.holderName,
          isPreferred: paymentForm.isPreferred,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        toast('Payment method added successfully!');
        await fetchPaymentMethods();
        setShowPaymentModal(false);
      } else {
        toast(data.error || 'Failed to add payment method', 'error');
      }
    } catch {
      toast('Failed to add payment method', 'error');
    }
    setPaymentSaving(false);
  };

  const handleDeletePayment = async (paymentId: string) => {
    if (!confirm('Are you sure you want to remove this payment method?')) return;
    try {
      const res = await fetch(`/api/payment-methods/${paymentId}?userId=${user.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok) {
        toast('Payment method removed');
        await fetchPaymentMethods();
      } else {
        toast(data.error || 'Failed to remove payment method', 'error');
      }
    } catch {
      toast('Failed to remove payment method', 'error');
    }
  };

  const handleSetPreferredPayment = async (paymentId: string) => {
    try {
      const res = await fetch(`/api/payment-methods/${paymentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, isPreferred: true }),
      });
      if (res.ok) {
        toast('Preferred payment method updated');
        await fetchPaymentMethods();
      }
    } catch {
      toast('Failed to update preferred payment method', 'error');
    }
  };

  // --- Notification Handlers ---
  const handleNotificationToggle = (key: keyof typeof notifications) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
    toast('Notification settings updated');
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

  const sidebarItems = [
    { key: 'account' as const, icon: User, label: 'Account' },
    { key: 'security' as const, icon: Shield, label: 'Security' },
    { key: 'payment' as const, icon: CreditCard, label: 'Payment Methods' },
    { key: 'notifications' as const, icon: Bell, label: 'Notifications' },
    { key: 'preferences' as const, icon: Globe, label: 'Preferences' },
  ];

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Back Button */}
      <motion.button
        onClick={() => navigate('profile')}
        className="inline-flex items-center gap-2 text-[#8b6f63] dark:text-[#e8ddd5] hover:text-[#d4a5a5] mb-8 transition-colors"
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <ArrowLeft size={20} />
        Back to Profile
      </motion.button>

      <motion.h1
        className="text-3xl font-serif text-[#8b6f63] dark:text-[#e8ddd5] mb-8"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        Settings
      </motion.h1>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <motion.div
            className="bg-white dark:bg-[#2d1f24] rounded-lg shadow-sm p-4 sticky top-24 border border-[#f5e6e0]/50 dark:border-[#3d2f34]"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <nav className="space-y-1">
              {sidebarItems.map((item) => (
                <button
                  key={item.key}
                  onClick={() => setActiveSection(item.key)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    activeSection === item.key
                      ? 'bg-[#fef5f1] dark:bg-[#3d2f34] text-[#d4a5a5] font-medium'
                      : 'text-[#8b6f63] dark:text-[#e8ddd5] hover:bg-[#fef5f1] dark:hover:bg-[#3d2f34]'
                  }`}
                >
                  <item.icon size={20} />
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>
          </motion.div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {/* ===== ACCOUNT SETTINGS ===== */}
          <AnimatePresence mode="wait">
            {activeSection === 'account' && (
              <motion.div
                key="account"
                className="space-y-6"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                {/* Personal Information */}
                <div className="bg-white dark:bg-[#2d1f24] rounded-lg shadow-sm p-6 border border-[#f5e6e0]/50 dark:border-[#3d2f34]">
                  <h2 className="text-2xl font-serif text-[#8b6f63] dark:text-[#e8ddd5] mb-6">Personal Information</h2>
                  <form onSubmit={handleAccountUpdate} className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-[#8b6f63] dark:text-[#e8ddd5] mb-2">
                          <User className="inline mr-2" size={14} />
                          First Name
                        </label>
                        <input
                          type="text"
                          value={accountData.firstName}
                          onChange={(e) => setAccountData({ ...accountData, firstName: e.target.value })}
                          className="w-full px-4 py-3 rounded-lg bg-[#fef5f1] dark:bg-[#1a1215] border border-[#f5e6e0]/80 dark:border-[#3d2f34] text-[#8b6f63] dark:text-[#e8ddd5] focus:outline-none focus:ring-2 focus:ring-[#d4a5a5] focus:border-transparent transition-all"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[#8b6f63] dark:text-[#e8ddd5] mb-2">
                          <User className="inline mr-2" size={14} />
                          Last Name
                        </label>
                        <input
                          type="text"
                          value={accountData.lastName}
                          onChange={(e) => setAccountData({ ...accountData, lastName: e.target.value })}
                          className="w-full px-4 py-3 rounded-lg bg-[#fef5f1] dark:bg-[#1a1215] border border-[#f5e6e0]/80 dark:border-[#3d2f34] text-[#8b6f63] dark:text-[#e8ddd5] focus:outline-none focus:ring-2 focus:ring-[#d4a5a5] focus:border-transparent transition-all"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[#8b6f63] dark:text-[#e8ddd5] mb-2">
                          <Mail className="inline mr-2" size={14} />
                          Email Address
                        </label>
                        <input
                          type="email"
                          value={accountData.email}
                          onChange={(e) => setAccountData({ ...accountData, email: e.target.value })}
                          className="w-full px-4 py-3 rounded-lg bg-[#fef5f1] dark:bg-[#1a1215] border border-[#f5e6e0]/80 dark:border-[#3d2f34] text-[#8b6f63] dark:text-[#e8ddd5] focus:outline-none focus:ring-2 focus:ring-[#d4a5a5] focus:border-transparent transition-all"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[#8b6f63] dark:text-[#e8ddd5] mb-2">
                          <Phone className="inline mr-2" size={14} />
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          value={accountData.phone}
                          onChange={(e) => setAccountData({ ...accountData, phone: e.target.value })}
                          placeholder="+1 (555) 000-0000"
                          className="w-full px-4 py-3 rounded-lg bg-[#fef5f1] dark:bg-[#1a1215] border border-[#f5e6e0]/80 dark:border-[#3d2f34] text-[#8b6f63] dark:text-[#e8ddd5] placeholder:text-[#8b6f63]/40 dark:placeholder:text-[#a89898]/50 focus:outline-none focus:ring-2 focus:ring-[#d4a5a5] focus:border-transparent transition-all"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-[#8b6f63] dark:text-[#e8ddd5] mb-2">
                          <Calendar className="inline mr-2" size={14} />
                          Date of Birth
                        </label>
                        <input
                          type="date"
                          value={accountData.dateOfBirth}
                          onChange={(e) => setAccountData({ ...accountData, dateOfBirth: e.target.value })}
                          max={new Date().toISOString().split('T')[0]}
                          className="w-full md:w-1/2 px-4 py-3 rounded-lg bg-[#fef5f1] dark:bg-[#1a1215] border border-[#f5e6e0]/80 dark:border-[#3d2f34] text-[#8b6f63] dark:text-[#e8ddd5] focus:outline-none focus:ring-2 focus:ring-[#d4a5a5] focus:border-transparent transition-all"
                        />
                        {accountData.dateOfBirth && (
                          <p className="text-xs text-[#8b6f63]/50 dark:text-[#a89898]/60 mt-1">
                            {new Date(accountData.dateOfBirth).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={saving}
                        className="px-8 py-3 bg-[#d4a5a5] text-white rounded-full hover:bg-[#c89a9a] transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {saving ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
                        {saving ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  </form>
                </div>

                {/* Addresses Section */}
                <div className="bg-white dark:bg-[#2d1f24] rounded-lg shadow-sm p-6 border border-[#f5e6e0]/50 dark:border-[#3d2f34]">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-serif text-[#8b6f63] dark:text-[#e8ddd5]">Saved Addresses</h2>
                    <button
                      onClick={() => openAddressModal()}
                      className="px-4 py-2 bg-[#d4a5a5] text-white rounded-full text-sm hover:bg-[#c89a9a] transition-colors flex items-center gap-1.5"
                    >
                      <Plus size={16} />
                      Add Address
                    </button>
                  </div>
                  {addresses.length === 0 ? (
                    <div className="text-center py-8">
                      <MapPin size={40} className="text-[#8b6f63]/20 mx-auto mb-3" />
                      <p className="text-[#8b6f63]/60 dark:text-[#a89898] mb-3">No saved addresses yet</p>
                      <button
                        onClick={() => openAddressModal()}
                        className="text-[#d4a5a5] hover:underline text-sm"
                      >
                        + Add your first address
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {addresses.map((address) => (
                        <div key={address.id} className="flex items-start justify-between p-4 bg-[#fef5f1] dark:bg-[#1a1215] rounded-lg border border-[#f5e6e0]/50 dark:border-[#3d2f34]">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-semibold uppercase tracking-wide text-[#d4a5a5]">{address.label}</span>
                              {address.isDefault && (
                                <span className="text-xs px-2 py-0.5 bg-[#d4a5a5] text-white rounded-full">Default</span>
                              )}
                            </div>
                            <p className="text-[#8b6f63] text-sm font-medium">{address.name}</p>
                            <p className="text-[#8b6f63]/70 dark:text-[#a89898] text-sm">{address.street}</p>
                            <p className="text-[#8b6f63]/70 dark:text-[#a89898] text-sm">{address.city}, {address.state} {address.zipCode}</p>
                            <p className="text-[#8b6f63]/50 dark:text-[#a89898]/60 text-xs mt-1">{address.country}{address.phone ? ` · ${address.phone}` : ''}</p>
                          </div>
                          <div className="flex items-center gap-1 ml-4 flex-shrink-0">
                            {!address.isDefault && (
                              <button
                                onClick={() => handleSetDefaultAddress(address.id)}
                                className="p-2 text-[#8b6f63]/60 dark:text-[#a89898] hover:text-[#d4a5a5] rounded-lg hover:bg-white dark:hover:bg-[#3d2f34] transition-colors"
                                title="Set as default"
                              >
                                <Star size={16} />
                              </button>
                            )}
                            <button
                              onClick={() => openAddressModal(address)}
                              className="p-2 text-[#8b6f63]/60 dark:text-[#a89898] hover:text-[#d4a5a5] rounded-lg hover:bg-white dark:hover:bg-[#3d2f34] transition-colors"
                              title="Edit"
                            >
                              <Pencil size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteAddress(address.id)}
                              className="p-2 text-[#8b6f63]/60 dark:text-[#a89898] hover:text-red-500 rounded-lg hover:bg-white dark:hover:bg-[#3d2f34] transition-colors"
                              title="Delete"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* ===== SECURITY SETTINGS ===== */}
            {activeSection === 'security' && (
              <motion.div
                key="security"
                className="space-y-6"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <div className="bg-white dark:bg-[#2d1f24] rounded-lg shadow-sm p-6 border border-[#f5e6e0]/50 dark:border-[#3d2f34]">
                  <h2 className="text-2xl font-serif text-[#8b6f63] dark:text-[#e8ddd5] mb-2">Change Password</h2>
                  <p className="text-sm text-[#8b6f63]/60 dark:text-[#a89898] mb-6">Ensure your account stays secure by updating your password regularly</p>
                  <form onSubmit={handlePasswordChange} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-[#8b6f63] dark:text-[#e8ddd5] mb-2">
                        <Lock className="inline mr-2" size={14} />
                        Current Password
                      </label>
                      <div className="relative">
                        <input
                          type={showCurrentPassword ? 'text' : 'password'}
                          value={passwordData.currentPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                          placeholder="Enter current password"
                          required
                          className="w-full px-4 py-3 pr-12 rounded-lg bg-[#fef5f1] dark:bg-[#1a1215] border border-[#f5e6e0]/80 dark:border-[#3d2f34] text-[#8b6f63] dark:text-[#e8ddd5] placeholder:text-[#8b6f63]/40 dark:placeholder:text-[#a89898]/50 focus:outline-none focus:ring-2 focus:ring-[#d4a5a5] focus:border-transparent transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8b6f63]/40 hover:text-[#8b6f63] transition-colors"
                        >
                          {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#8b6f63] dark:text-[#e8ddd5] mb-2">
                        <Lock className="inline mr-2" size={14} />
                        New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showNewPassword ? 'text' : 'password'}
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                          placeholder="Enter new password (min 6 characters)"
                          required
                          minLength={6}
                          className="w-full px-4 py-3 pr-12 rounded-lg bg-[#fef5f1] dark:bg-[#1a1215] border border-[#f5e6e0]/80 dark:border-[#3d2f34] text-[#8b6f63] dark:text-[#e8ddd5] placeholder:text-[#8b6f63]/40 dark:placeholder:text-[#a89898]/50 focus:outline-none focus:ring-2 focus:ring-[#d4a5a5] focus:border-transparent transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8b6f63]/40 hover:text-[#8b6f63] transition-colors"
                        >
                          {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                      {passwordData.newPassword && (
                        <div className="mt-2">
                          <div className="flex gap-1">
                            {[1, 2, 3, 4].map((level) => {
                              const strength = passwordData.newPassword.length >= 8 && /[A-Z]/.test(passwordData.newPassword) && /[0-9]/.test(passwordData.newPassword) && /[^A-Za-z0-9]/.test(passwordData.newPassword)
                                ? 4
                                : passwordData.newPassword.length >= 6 && /[A-Z]/.test(passwordData.newPassword) && /[0-9]/.test(passwordData.newPassword)
                                  ? 3
                                  : passwordData.newPassword.length >= 6
                                    ? 2
                                    : 1;
                              const colors = ['bg-red-300', 'bg-orange-300', 'bg-yellow-300', 'bg-green-400'];
                              return (
                                <div
                                  key={level}
                                  className={`h-1 flex-1 rounded-full transition-colors ${
                                    level <= strength ? colors[strength - 1] : 'bg-gray-200'
                                  }`}
                                />
                              );
                            })}
                          </div>
                          <p className="text-xs text-[#8b6f63]/50 dark:text-[#a89898]/60 mt-1">
                            {passwordData.newPassword.length < 6
                              ? 'Too short'
                              : passwordData.newPassword.length < 8
                                ? 'Weak'
                                : /[A-Z]/.test(passwordData.newPassword) && /[0-9]/.test(passwordData.newPassword) && /[^A-Za-z0-9]/.test(passwordData.newPassword)
                                  ? 'Strong'
                                  : /[A-Z]/.test(passwordData.newPassword) && /[0-9]/.test(passwordData.newPassword)
                                    ? 'Good'
                                    : 'Fair'}
                          </p>
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#8b6f63] dark:text-[#e8ddd5] mb-2">
                        <Lock className="inline mr-2" size={14} />
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                        placeholder="Confirm new password"
                        required
                        className="w-full px-4 py-3 rounded-lg bg-[#fef5f1] dark:bg-[#1a1215] border border-[#f5e6e0]/80 dark:border-[#3d2f34] text-[#8b6f63] dark:text-[#e8ddd5] placeholder:text-[#8b6f63]/40 dark:placeholder:text-[#a89898]/50 focus:outline-none focus:ring-2 focus:ring-[#d4a5a5] focus:border-transparent transition-all"
                      />
                      {passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword && (
                        <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
                      )}
                    </div>
                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={passwordSaving || passwordData.newPassword !== passwordData.confirmPassword}
                        className="px-8 py-3 bg-[#d4a5a5] text-white rounded-full hover:bg-[#c89a9a] transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {passwordSaving ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
                        {passwordSaving ? 'Updating...' : 'Update Password'}
                      </button>
                    </div>
                  </form>
                </div>

                <div className="bg-white dark:bg-[#2d1f24] rounded-lg shadow-sm p-6 border border-[#f5e6e0]/50 dark:border-[#3d2f34]">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-[#8b6f63] mb-1">Two-Factor Authentication</h3>
                      <p className="text-sm text-[#8b6f63]/60 dark:text-[#a89898]">Add an extra layer of security to your account</p>
                    </div>
                    <button
                      onClick={() => toast('2FA setup coming soon!', 'info')}
                      className="px-5 py-2.5 border border-[#d4a5a5] text-[#d4a5a5] rounded-full hover:bg-[#fef5f1] transition-colors text-sm font-medium"
                    >
                      Enable 2FA
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ===== PAYMENT METHODS ===== */}
            {activeSection === 'payment' && (
              <motion.div
                key="payment"
                className="space-y-6"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <div className="bg-white dark:bg-[#2d1f24] rounded-lg shadow-sm p-6 border border-[#f5e6e0]/50 dark:border-[#3d2f34]">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-serif text-[#8b6f63] mb-1">Payment Methods</h2>
                      <p className="text-sm text-[#8b6f63]/60 dark:text-[#a89898]">Manage your saved payment methods</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={handleAddPayOnReceive}
                        disabled={!!paymentMethods.find(pm => pm.type.toUpperCase() === 'PAY_ON_RECEIVE')}
                        className="px-4 py-2 border-2 border-[#d4a5a5] text-[#d4a5a5] rounded-full text-sm hover:bg-[#fef5f1] transition-colors flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Banknote size={16} />
                        Pay on Receive
                      </button>
                      <button
                        onClick={openPaymentModal}
                        className="px-4 py-2 bg-[#d4a5a5] text-white rounded-full text-sm hover:bg-[#c89a9a] transition-colors flex items-center gap-1.5"
                      >
                        <Plus size={16} />
                        Add Card
                      </button>
                    </div>
                  </div>

                  {paymentMethods.length === 0 ? (
                    <div className="text-center py-12">
                      <CreditCard size={48} className="text-[#8b6f63]/20 mx-auto mb-4" />
                      <h3 className="text-lg text-[#8b6f63] mb-2">No Payment Methods</h3>
                      <p className="text-sm text-[#8b6f63]/60 dark:text-[#a89898] mb-4">Add a payment method for faster checkout</p>
                      <div className="flex gap-3 justify-center">
                        <button
                          onClick={handleAddPayOnReceive}
                          className="px-5 py-2.5 border-2 border-[#d4a5a5] text-[#d4a5a5] rounded-full text-sm hover:bg-[#fef5f1] transition-colors flex items-center gap-2"
                        >
                          <Banknote size={16} />
                          Pay on Receive
                        </button>
                        <button
                          onClick={openPaymentModal}
                          className="px-5 py-2.5 bg-[#d4a5a5] text-white rounded-full text-sm hover:bg-[#c89a9a] transition-colors"
                        >
                          Add Card
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {paymentMethods.map((pm) => {
                        const isCash = pm.type.toUpperCase() === 'PAY_ON_RECEIVE' || pm.type.toUpperCase() === 'CASH_ON_DELIVERY';
                        return (
                          <div
                            key={pm.id}
                            className={`flex items-center justify-between p-4 rounded-lg border transition-all ${
                              pm.isPreferred
                                ? 'bg-[#fef5f1] border-[#d4a5a5]/30'
                                : 'bg-white border-[#f5e6e0]/50 hover:border-[#d4a5a5]/30'
                            }`}
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-8 rounded-md bg-gradient-to-br from-[#8b6f63]/10 to-[#d4a5a5]/20 flex items-center justify-center">
                                {getPaymentIcon(pm.type)}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <p className="text-[#8b6f63] font-medium">{getPaymentLabel(pm.type)}</p>
                                  {pm.isPreferred && (
                                    <span className="text-xs px-2 py-0.5 bg-[#d4a5a5] text-white rounded-full flex items-center gap-1">
                                      <Star size={10} className="fill-white" />
                                      Preferred
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm text-[#8b6f63]/70">
                                  {getPaymentDescription(pm)}
                                </p>
                                {!isCash && (
                                  <p className="text-xs text-[#8b6f63]/50 dark:text-[#a89898]/60">
                                    Expires {String(pm.expiryMonth || '').padStart(2, '0')}/{pm.expiryYear || ''} · {pm.holderName || ''}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              {!pm.isPreferred && (
                                <button
                                  onClick={() => handleSetPreferredPayment(pm.id)}
                                  className="px-3 py-1.5 text-xs text-[#d4a5a5] border border-[#d4a5a5]/30 rounded-full hover:bg-[#fef5f1] transition-colors"
                                >
                                  Set Preferred
                                </button>
                              )}
                              <button
                                onClick={() => handleDeletePayment(pm.id)}
                                className="p-2 text-[#8b6f63]/40 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                                title="Remove"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* ===== NOTIFICATIONS SETTINGS ===== */}
            {activeSection === 'notifications' && (
              <motion.div
                key="notifications"
                className="bg-white dark:bg-[#2d1f24] rounded-lg shadow-sm p-6 border border-[#f5e6e0]/50 dark:border-[#3d2f34]"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <h2 className="text-2xl font-serif text-[#8b6f63] mb-2">Notification Preferences</h2>
                <p className="text-sm text-[#8b6f63]/60 dark:text-[#a89898] mb-6">Choose what notifications you want to receive</p>
                <div className="space-y-3">
                  {Object.entries(notifications).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between p-4 bg-[#fef5f1] dark:bg-[#1a1215] rounded-lg border border-[#f5e6e0]/30 dark:border-[#3d2f34]">
                      <div>
                        <p className="text-[#8b6f63] font-medium capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </p>
                        <p className="text-sm text-[#8b6f63]/60 dark:text-[#a89898]">{getNotificationDescription(key)}</p>
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

            {/* ===== PREFERENCES ===== */}
            {activeSection === 'preferences' && (
              <motion.div
                key="preferences"
                className="bg-white dark:bg-[#2d1f24] rounded-lg shadow-sm p-6 border border-[#f5e6e0]/50 dark:border-[#3d2f34] space-y-6"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <div>
                  <h2 className="text-2xl font-serif text-[#8b6f63] mb-2">Preferences</h2>
                  <p className="text-sm text-[#8b6f63]/60 dark:text-[#a89898]">Customize your shopping experience</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#8b6f63] dark:text-[#e8ddd5] mb-2">
                      <Globe className="inline mr-2" size={14} />
                      Language
                    </label>
                    <select
                      value={preferences.language}
                      onChange={(e) => setPreferences({ ...preferences, language: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg bg-[#fef5f1] dark:bg-[#1a1215] border border-[#f5e6e0]/80 dark:border-[#3d2f34] text-[#8b6f63] dark:text-[#e8ddd5] focus:outline-none focus:ring-2 focus:ring-[#d4a5a5] focus:border-transparent transition-all"
                    >
                      <option value="English">English</option>
                      <option value="Spanish">Spanish</option>
                      <option value="French">French</option>
                      <option value="Chinese">Chinese</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#8b6f63] dark:text-[#e8ddd5] mb-2">
                      Currency
                    </label>
                    <select
                      value={preferences.currency}
                      onChange={(e) => setPreferences({ ...preferences, currency: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg bg-[#fef5f1] dark:bg-[#1a1215] border border-[#f5e6e0]/80 dark:border-[#3d2f34] text-[#8b6f63] dark:text-[#e8ddd5] focus:outline-none focus:ring-2 focus:ring-[#d4a5a5] focus:border-transparent transition-all"
                    >
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#8b6f63] dark:text-[#e8ddd5] mb-2">
                      Theme
                    </label>
                    <select
                      value={preferences.theme}
                      onChange={(e) => setPreferences({ ...preferences, theme: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg bg-[#fef5f1] dark:bg-[#1a1215] border border-[#f5e6e0]/80 dark:border-[#3d2f34] text-[#8b6f63] dark:text-[#e8ddd5] focus:outline-none focus:ring-2 focus:ring-[#d4a5a5] focus:border-transparent transition-all"
                    >
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                      <option value="system">System</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ===== ADDRESS MODAL ===== */}
      <AnimatePresence>
        {showAddressModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowAddressModal(false)} />
            <motion.div
              className="relative bg-white dark:bg-[#2d1f24] rounded-2xl shadow-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-serif text-[#8b6f63] dark:text-[#e8ddd5]">
                  {editingAddress ? 'Edit Address' : 'Add New Address'}
                </h3>
                <button onClick={() => setShowAddressModal(false)} className="p-2 hover:bg-[#fef5f1] dark:hover:bg-[#3d2f34] rounded-full transition-colors">
                  <X size={20} className="text-[#8b6f63] dark:text-[#e8ddd5]" />
                </button>
              </div>
              <form onSubmit={handleAddressSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#8b6f63] dark:text-[#e8ddd5] mb-2">Label</label>
                  <div className="flex gap-2">
                    {['Home', 'Work', 'Other'].map((label) => (
                      <button
                        key={label}
                        type="button"
                        onClick={() => setAddressForm({ ...addressForm, label })}
                        className={`px-4 py-2 rounded-full text-sm transition-colors ${
                          addressForm.label === label
                            ? 'bg-[#d4a5a5] text-white'
                            : 'bg-[#fef5f1] text-[#8b6f63] hover:bg-[#f5e6e0]'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#8b6f63] dark:text-[#e8ddd5] mb-2">Full Name</label>
                  <input
                    type="text"
                    value={addressForm.name}
                    onChange={(e) => setAddressForm({ ...addressForm, name: e.target.value })}
                    required
                    className="w-full px-4 py-3 rounded-lg bg-[#fef5f1] dark:bg-[#1a1215] border border-[#f5e6e0]/80 dark:border-[#3d2f34] text-[#8b6f63] dark:text-[#e8ddd5] focus:outline-none focus:ring-2 focus:ring-[#d4a5a5] focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#8b6f63] dark:text-[#e8ddd5] mb-2">Street Address</label>
                  <input
                    type="text"
                    value={addressForm.street}
                    onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
                    required
                    className="w-full px-4 py-3 rounded-lg bg-[#fef5f1] dark:bg-[#1a1215] border border-[#f5e6e0]/80 dark:border-[#3d2f34] text-[#8b6f63] dark:text-[#e8ddd5] focus:outline-none focus:ring-2 focus:ring-[#d4a5a5] focus:border-transparent transition-all"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-[#8b6f63] dark:text-[#e8ddd5] mb-2">City</label>
                    <input
                      type="text"
                      value={addressForm.city}
                      onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                      required
                      className="w-full px-4 py-3 rounded-lg bg-[#fef5f1] dark:bg-[#1a1215] border border-[#f5e6e0]/80 dark:border-[#3d2f34] text-[#8b6f63] dark:text-[#e8ddd5] focus:outline-none focus:ring-2 focus:ring-[#d4a5a5] focus:border-transparent transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#8b6f63] dark:text-[#e8ddd5] mb-2">State / Province</label>
                    <input
                      type="text"
                      value={addressForm.state}
                      onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                      required
                      className="w-full px-4 py-3 rounded-lg bg-[#fef5f1] dark:bg-[#1a1215] border border-[#f5e6e0]/80 dark:border-[#3d2f34] text-[#8b6f63] dark:text-[#e8ddd5] focus:outline-none focus:ring-2 focus:ring-[#d4a5a5] focus:border-transparent transition-all"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-[#8b6f63] dark:text-[#e8ddd5] mb-2">ZIP Code</label>
                    <input
                      type="text"
                      value={addressForm.zipCode}
                      onChange={(e) => setAddressForm({ ...addressForm, zipCode: e.target.value })}
                      required
                      className="w-full px-4 py-3 rounded-lg bg-[#fef5f1] dark:bg-[#1a1215] border border-[#f5e6e0]/80 dark:border-[#3d2f34] text-[#8b6f63] dark:text-[#e8ddd5] focus:outline-none focus:ring-2 focus:ring-[#d4a5a5] focus:border-transparent transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#8b6f63] dark:text-[#e8ddd5] mb-2">Country</label>
                    <input
                      type="text"
                      value={addressForm.country}
                      onChange={(e) => setAddressForm({ ...addressForm, country: e.target.value })}
                      required
                      className="w-full px-4 py-3 rounded-lg bg-[#fef5f1] dark:bg-[#1a1215] border border-[#f5e6e0]/80 dark:border-[#3d2f34] text-[#8b6f63] dark:text-[#e8ddd5] focus:outline-none focus:ring-2 focus:ring-[#d4a5a5] focus:border-transparent transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#8b6f63] dark:text-[#e8ddd5] mb-2">Phone (optional)</label>
                  <input
                    type="tel"
                    value={addressForm.phone}
                    onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg bg-[#fef5f1] dark:bg-[#1a1215] border border-[#f5e6e0]/80 dark:border-[#3d2f34] text-[#8b6f63] dark:text-[#e8ddd5] focus:outline-none focus:ring-2 focus:ring-[#d4a5a5] focus:border-transparent transition-all"
                  />
                </div>
                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="isDefault"
                    checked={addressForm.isDefault}
                    onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                    className="w-4 h-4 rounded border-[#f5e6e0] text-[#d4a5a5] focus:ring-[#d4a5a5]"
                  />
                  <label htmlFor="isDefault" className="text-sm text-[#8b6f63]">
                    Set as default address
                  </label>
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddressModal(false)}
                    className="flex-1 py-3 border border-[#f5e6e0] text-[#8b6f63] rounded-full hover:bg-[#fef5f1] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={addressSaving}
                    className="flex-1 py-3 bg-[#d4a5a5] text-white rounded-full hover:bg-[#c89a9a] transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {addressSaving ? <Loader2 size={18} className="animate-spin" /> : null}
                    {addressSaving ? 'Saving...' : editingAddress ? 'Update Address' : 'Add Address'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== PAYMENT METHOD MODAL ===== */}
      <AnimatePresence>
        {showPaymentModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowPaymentModal(false)} />
            <motion.div
              className="relative bg-white dark:bg-[#2d1f24] rounded-2xl shadow-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-serif text-[#8b6f63] dark:text-[#e8ddd5]">Add Card</h3>
                <button onClick={() => setShowPaymentModal(false)} className="p-2 hover:bg-[#fef5f1] dark:hover:bg-[#3d2f34] rounded-full transition-colors">
                  <X size={20} className="text-[#8b6f63] dark:text-[#e8ddd5]" />
                </button>
              </div>
              <form onSubmit={handlePaymentSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#8b6f63] dark:text-[#e8ddd5] mb-2">Card Type</label>
                  <div className="grid grid-cols-2 gap-2">
                    {CARD_TYPES.map((card) => (
                      <button
                        key={card.value}
                        type="button"
                        onClick={() => setPaymentForm({ ...paymentForm, type: card.value })}
                        className={`px-4 py-3 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                          paymentForm.type === card.value
                            ? 'bg-[#fef5f1] border-2 border-[#d4a5a5] text-[#d4a5a5]'
                            : 'bg-[#fef5f1] border border-[#f5e6e0] text-[#8b6f63] hover:border-[#d4a5a5]/50'
                        }`}
                      >
                        <CreditCard size={16} />
                        {card.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#8b6f63] dark:text-[#e8ddd5] mb-2">Card Number</label>
                  <input
                    type="text"
                    value={paymentForm.cardNumber}
                    onChange={(e) => setPaymentForm({ ...paymentForm, cardNumber: e.target.value.replace(/[^\d\s]/g, '').slice(0, 19) })}
                    placeholder="1234 5678 9012 3456"
                    required
                    className="w-full px-4 py-3 rounded-lg bg-[#fef5f1] dark:bg-[#1a1215] border border-[#f5e6e0]/80 dark:border-[#3d2f34] text-[#8b6f63] dark:text-[#e8ddd5] placeholder:text-[#8b6f63]/40 dark:placeholder:text-[#a89898]/50 focus:outline-none focus:ring-2 focus:ring-[#d4a5a5] focus:border-transparent transition-all font-mono"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#8b6f63] dark:text-[#e8ddd5] mb-2">Cardholder Name</label>
                  <input
                    type="text"
                    value={paymentForm.holderName}
                    onChange={(e) => setPaymentForm({ ...paymentForm, holderName: e.target.value })}
                    required
                    className="w-full px-4 py-3 rounded-lg bg-[#fef5f1] dark:bg-[#1a1215] border border-[#f5e6e0]/80 dark:border-[#3d2f34] text-[#8b6f63] dark:text-[#e8ddd5] placeholder:text-[#8b6f63]/40 dark:placeholder:text-[#a89898]/50 focus:outline-none focus:ring-2 focus:ring-[#d4a5a5] focus:border-transparent transition-all"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-[#8b6f63] dark:text-[#e8ddd5] mb-2">Expiry Month</label>
                    <select
                      value={paymentForm.expiryMonth}
                      onChange={(e) => setPaymentForm({ ...paymentForm, expiryMonth: e.target.value })}
                      required
                      className="w-full px-4 py-3 rounded-lg bg-[#fef5f1] dark:bg-[#1a1215] border border-[#f5e6e0]/80 dark:border-[#3d2f34] text-[#8b6f63] dark:text-[#e8ddd5] focus:outline-none focus:ring-2 focus:ring-[#d4a5a5] focus:border-transparent transition-all"
                    >
                      <option value="">MM</option>
                      {Array.from({ length: 12 }, (_, i) => (
                        <option key={i + 1} value={String(i + 1)}>{String(i + 1).padStart(2, '0')}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#8b6f63] dark:text-[#e8ddd5] mb-2">Expiry Year</label>
                    <select
                      value={paymentForm.expiryYear}
                      onChange={(e) => setPaymentForm({ ...paymentForm, expiryYear: e.target.value })}
                      required
                      className="w-full px-4 py-3 rounded-lg bg-[#fef5f1] dark:bg-[#1a1215] border border-[#f5e6e0]/80 dark:border-[#3d2f34] text-[#8b6f63] dark:text-[#e8ddd5] focus:outline-none focus:ring-2 focus:ring-[#d4a5a5] focus:border-transparent transition-all"
                    >
                      <option value="">YYYY</option>
                      {Array.from({ length: 12 }, (_, i) => (
                        <option key={2024 + i} value={String(2024 + i)}>{2024 + i}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="isPreferredPayment"
                    checked={paymentForm.isPreferred}
                    onChange={(e) => setPaymentForm({ ...paymentForm, isPreferred: e.target.checked })}
                    className="w-4 h-4 rounded border-[#f5e6e0] text-[#d4a5a5] focus:ring-[#d4a5a5]"
                  />
                  <label htmlFor="isPreferredPayment" className="text-sm text-[#8b6f63]">
                    Set as preferred payment method
                  </label>
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowPaymentModal(false)}
                    className="flex-1 py-3 border border-[#f5e6e0] text-[#8b6f63] rounded-full hover:bg-[#fef5f1] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={paymentSaving}
                    className="flex-1 py-3 bg-[#d4a5a5] text-white rounded-full hover:bg-[#c89a9a] transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {paymentSaving ? <Loader2 size={18} className="animate-spin" /> : null}
                    {paymentSaving ? 'Adding...' : 'Add Card'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
