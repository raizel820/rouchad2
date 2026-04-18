'use client';

import { useState, useEffect, useRef } from 'react';
import { useStore } from '@/store/store';
import {
  CreditCard,
  MapPin,
  User,
  Mail,
  Phone,
  CheckCircle,
  ChevronDown,
  Plus,
  Banknote,
  Truck,
  ShieldCheck,
  Package,
  ArrowRight,
  Loader2,
  ShoppingBag,
  Tag,
  X,
  Percent,
  Gift,
  Sparkles,
  Lock,
  AlertCircle,
} from 'lucide-react';
import { toast } from '@/lib/toast';
import { motion, AnimatePresence } from 'framer-motion';

// ===== Animated Counter Hook =====
function useAnimatedValue(target: number, duration = 800) {
  const [displayValue, setDisplayValue] = useState(0);
  const rafRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const startValueRef = useRef(0);
  const prevTargetRef = useRef(0);

  useEffect(() => {
    startValueRef.current = prevTargetRef.current !== target ? startValueRef.current : 0;
    prevTargetRef.current = target;
    startTimeRef.current = null;

    const animate = (timestamp: number) => {
      if (startTimeRef.current === null) startTimeRef.current = timestamp;
      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = startValueRef.current + (target - startValueRef.current) * eased;
      setDisplayValue(Math.round(current * 100) / 100);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        startValueRef.current = target;
      }
    };

    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [target, duration]);

  return displayValue;
}

// ===== Savings Banner Component =====
function SavingsBanner({
  totalDiscount,
  saleSavings,
  promoDiscount,
  appliedPromoCode,
}: {
  totalDiscount: number;
  saleSavings: number;
  promoDiscount: number;
  appliedPromoCode: { code: string; description: string } | null;
}) {
  const animatedTotal = useAnimatedValue(totalDiscount);

  return (
    <motion.div
      className="relative overflow-hidden bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 border border-green-200/70 rounded-xl p-4 mb-5"
      initial={{ opacity: 0, y: -10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
    >
      {/* Decorative sparkles */}
      <div className="absolute top-1 right-3 pointer-events-none">
        <motion.div
          animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
        >
          <Sparkles size={16} className="text-green-400/60" />
        </motion.div>
      </div>

      <div className="flex items-center gap-2 mb-2">
        <motion.div
          animate={{ rotate: [0, -10, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
        >
          <Gift size={16} className="text-green-600" />
        </motion.div>
        <p className="text-sm text-green-700 font-semibold">
          You&apos;re saving{' '}
          <motion.span
            className="text-green-800 font-bold text-base"
            key={animatedTotal}
          >
            ${animatedTotal.toFixed(2)}
          </motion.span>
          {' '}on this order!
        </p>
      </div>

      {/* Savings breakdown */}
      <div className="space-y-1 ml-6">
        {saleSavings > 0 && (
          <motion.div
            className="flex items-center gap-1.5 text-xs text-green-600/80"
            initial={{ opacity: 0, x: -5 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Tag size={10} className="text-green-500" />
            <span>Sale discounts: <span className="font-semibold">-${saleSavings.toFixed(2)}</span></span>
          </motion.div>
        )}
        {appliedPromoCode && promoDiscount > 0 && (
          <motion.div
            className="flex items-center gap-1.5 text-xs text-green-600/80"
            initial={{ opacity: 0, x: -5 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Percent size={10} className="text-green-500" />
            <span>Promo code ({appliedPromoCode.code}): <span className="font-semibold">-{promoDiscount.toFixed(2)}</span></span>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

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

export function CheckoutPage() {
  const { cartItems, getCartTotal, getCartOriginalTotal, clearCart, navigate, isAuthenticated, user, appliedPromoCode, applyPromoCode, removePromoCode } = useStore();
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [orderId, setOrderId] = useState('');

  // Step tracking
  const [currentStep, setCurrentStep] = useState(1); // 1: shipping, 2: payment, 3: review

  // Saved data
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodItem[]>([]);

  // Selected items
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [selectedPaymentId, setSelectedPaymentId] = useState<string>('');
  const [useNewAddress, setUseNewAddress] = useState(false);
  const [useNewPayment, setUseNewPayment] = useState(false);

  // New address form
  const [newAddress, setNewAddress] = useState({
    label: 'Home',
    name: '', street: '', city: '', state: '', zipCode: '', country: 'United States', phone: '',
  });

  // Promo code
  const [promoInput, setPromoInput] = useState('');
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoError, setPromoError] = useState('');
  const [promoExpanded, setPromoExpanded] = useState(false);
  const [promoSuccess, setPromoSuccess] = useState(false);

  // New payment form
  const [newPayment, setNewPayment] = useState({
    type: 'VISA',
    cardNumber: '',
    holderName: '',
    expiryMonth: '',
    expiryYear: '',
  });

  // Load saved addresses and payment methods
  useEffect(() => {
    if (!user) return;
    fetch(`/api/addresses?userId=${user.id}`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setAddresses(data);
          const defaultAddr = data.find((a: Address) => a.isDefault);
          if (defaultAddr) setSelectedAddressId(defaultAddr.id);
        } else {
          setUseNewAddress(true);
        }
      })
      .catch(() => setUseNewAddress(true));

    fetch(`/api/payment-methods?userId=${user.id}`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setPaymentMethods(data);
          const preferred = data.find((p: PaymentMethodItem) => p.isPreferred);
          if (preferred) setSelectedPaymentId(preferred.id);
        } else {
          setUseNewPayment(true);
        }
      })
      .catch(() => setUseNewPayment(true));
  }, [user]);

  if (cartItems.length === 0 && !orderPlaced) {
    navigate('cart');
    return null;
  }

  const subtotal = getCartTotal();
  const originalSubtotal = getCartOriginalTotal();
  const saleSavings = Math.round((originalSubtotal - subtotal) * 100) / 100;
  const promoDiscount = appliedPromoCode?.discountAmount || 0;
  const afterPromoSubtotal = Math.max(subtotal - promoDiscount, 0);
  const shipping = afterPromoSubtotal >= 50 ? 0 : 5.99;
  const tax = afterPromoSubtotal * 0.1;
  const total = afterPromoSubtotal + shipping + tax;
  const totalDiscount = saleSavings + promoDiscount;

  const getSelectedAddress = () => {
    if (useNewAddress) return null;
    return addresses.find((a) => a.id === selectedAddressId);
  };

  const getSelectedPayment = () => {
    if (useNewPayment) return null;
    return paymentMethods.find((p) => p.id === selectedPaymentId);
  };

  const getPaymentLabel = (type: string) => {
    switch (type.toUpperCase()) {
      case 'PAY_ON_RECEIVE': return 'Pay on Receive';
      case 'CASH_ON_DELIVERY': return 'Cash on Delivery';
      default: return type;
    }
  };

  const getPaymentDescription = (pm: PaymentMethodItem) => {
    const isCash = pm.type.toUpperCase() === 'PAY_ON_RECEIVE' || pm.type.toUpperCase() === 'CASH_ON_DELIVERY';
    if (isCash) return 'Pay when you receive your order';
    return `•••• •••• •••• ${pm.lastFour || '****'}`;
  };

  const canProceedToPayment = () => {
    if (useNewAddress) {
      return newAddress.name && newAddress.street && newAddress.city && newAddress.state && newAddress.zipCode && newAddress.country;
    }
    return !!selectedAddressId;
  };

  const handleApplyPromo = async () => {
    if (!promoInput.trim()) return;
    setPromoLoading(true);
    setPromoError('');
    try {
      const res = await fetch('/api/promo-codes/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: promoInput, orderTotal: subtotal }),
      });
      const data = await res.json();
      if (res.ok) {
        applyPromoCode(data);
        toast(`Promo code applied! ${data.description}`);
        setPromoInput('');
        setPromoSuccess(true);
        setPromoExpanded(false);
        setTimeout(() => setPromoSuccess(false), 2000);
      } else {
        setPromoError(data.error || 'Invalid promo code');
      }
    } catch {
      setPromoError('Failed to validate promo code');
    }
    setPromoLoading(false);
  };

  const canPlaceOrder = () => {
    if (useNewPayment) {
      const pType = newPayment.type.toUpperCase();
      if (pType === 'PAY_ON_RECEIVE' || pType === 'CASH_ON_DELIVERY') return true;
      return newPayment.cardNumber && newPayment.holderName && newPayment.expiryMonth && newPayment.expiryYear;
    }
    return !!selectedPaymentId;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cartItems.length === 0) return;

    setIsLoading(true);
    try {
      const addr = getSelectedAddress();
      const addrData = addr || newAddress;
      const pm = getSelectedPayment();
      const paymentType = pm
        ? pm.type
        : newPayment.type.toUpperCase();

      // Save new address if needed
      let finalAddressId = selectedAddressId;
      if (useNewAddress && user) {
        const addrRes = await fetch('/api/addresses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id, ...newAddress, isDefault: addresses.length === 0 }),
        });
        const addrDataRes = await addrRes.json();
        if (addrRes.ok) finalAddressId = addrDataRes.id;
      }

      // Save new payment method if needed
      let finalPaymentId = selectedPaymentId;
      if (useNewPayment && user) {
        const isCash = paymentType === 'PAY_ON_RECEIVE' || paymentType === 'CASH_ON_DELIVERY';
        const payRes = await fetch('/api/payment-methods', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.id,
            type: paymentType,
            lastFour: isCash ? null : newPayment.cardNumber.replace(/\s/g, '').slice(-4),
            expiryMonth: isCash ? null : parseInt(newPayment.expiryMonth),
            expiryYear: isCash ? null : parseInt(newPayment.expiryYear),
            holderName: isCash ? null : newPayment.holderName,
            isPreferred: paymentMethods.length === 0,
          }),
        });
        const payData = await payRes.json();
        if (payRes.ok) finalPaymentId = payData.id;
      }

      const nameParts = (user?.name || addrData.name || '').split(' ');
      const orderData = {
        userId: isAuthenticated ? user?.id : 'guest',
        items: cartItems.map((item) => ({ productId: item.id, quantity: item.quantity, price: item.price, color: item.selectedColor && item.selectedColor !== 'default' ? item.selectedColor : null })),
        firstName: nameParts[0] || addrData.name || '',
        lastName: nameParts.slice(1).join(' ') || '',
        email: user?.email || '',
        phone: addrData.phone || user?.phone || '',
        address: addrData.street,
        city: addrData.city,
        state: addrData.state,
        zipCode: addrData.zipCode,
        country: addrData.country,
        subtotal: afterPromoSubtotal,
        tax,
        shipping,
        total,
        paymentMethod: paymentType === 'PAY_ON_RECEIVE' ? 'pay_on_receive' : 'credit_card',
        promoCodeId: appliedPromoCode?.id || null,
        promoCode: appliedPromoCode?.code || null,
        discountTotal: promoDiscount,
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });

      const order = await res.json();
      setOrderId(order.id);
      setOrderPlaced(true);
      clearCart();
      toast('Order placed successfully!');

      setTimeout(() => {
        useStore.getState().setLastOrderId(order.id);
        navigate('order-confirmation');
      }, 2500);
    } catch {
      toast('Failed to place order. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  if (orderPlaced) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto text-center py-16">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}>
            <div className="w-20 h-20 bg-green-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <CheckCircle size={40} className="text-green-600" />
            </div>
          </motion.div>
          <h1 className="text-3xl font-serif text-[#8b6f63] mb-4">Order Confirmed!</h1>
          <p className="text-[#8b6f63]/70 mb-2">Thank you for your purchase.</p>
          <p className="text-sm text-[#8b6f63]/50">Redirecting to confirmation...</p>
        </div>
      </div>
    );
  }

  const steps = [
    { number: 1, label: 'Shipping', icon: Truck },
    { number: 2, label: 'Payment', icon: CreditCard },
    { number: 3, label: 'Review', icon: CheckCircle },
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <h1 className="text-3xl font-serif text-[#8b6f63] mb-8">Checkout</h1>

      {/* Step Indicator */}
      <div className="flex items-center justify-center mb-10">
        {steps.map((step, index) => (
          <div key={step.number} className="flex items-center">
            <button
              onClick={() => {
                if (step.number < currentStep) setCurrentStep(step.number);
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                currentStep === step.number
                  ? 'bg-[#d4a5a5] text-white'
                  : currentStep > step.number
                    ? 'bg-green-100 text-green-700 cursor-pointer hover:bg-green-200'
                    : 'bg-gray-100 text-gray-400 cursor-default'
              }`}
            >
              <step.icon size={16} />
              <span className="text-sm font-medium">{step.label}</span>
              {currentStep > step.number && <CheckCircle size={14} />}
            </button>
            {index < steps.length - 1 && (
              <div className={`w-12 h-0.5 mx-2 transition-colors ${currentStep > step.number ? 'bg-[#d4a5a5]' : 'bg-gray-200'}`} />
            )}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* ===== STEP 1: SHIPPING ===== */}
            <AnimatePresence mode="wait">
              {currentStep === 1 && (
                <motion.div
                  key="shipping"
                  className="bg-white rounded-xl p-6 shadow-sm border border-[#f5e6e0]/50"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <div className="flex items-center gap-2 mb-6">
                    <MapPin className="text-[#d4a5a5]" size={24} />
                    <h2 className="text-xl font-serif text-[#8b6f63]">Shipping Address</h2>
                  </div>

                  {/* Saved Addresses */}
                  {addresses.length > 0 && !useNewAddress && (
                    <div className="space-y-3 mb-4">
                      {addresses.map((addr) => (
                        <label
                          key={addr.id}
                          className={`flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                            selectedAddressId === addr.id
                              ? 'border-[#d4a5a5] bg-[#fef5f1]'
                              : 'border-[#f5e6e0]/50 hover:border-[#d4a5a5]/50'
                          }`}
                        >
                          <input
                            type="radio"
                            name="address"
                            value={addr.id}
                            checked={selectedAddressId === addr.id}
                            onChange={() => setSelectedAddressId(addr.id)}
                            className="mt-1 w-4 h-4 accent-[#d4a5a5]"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-semibold uppercase tracking-wide text-[#d4a5a5]">{addr.label}</span>
                              {addr.isDefault && (
                                <span className="text-xs px-2 py-0.5 bg-[#d4a5a5] text-white rounded-full">Default</span>
                              )}
                            </div>
                            <p className="text-[#8b6f63] text-sm font-medium">{addr.name}</p>
                            <p className="text-[#8b6f63]/70 text-sm">{addr.street}</p>
                            <p className="text-[#8b6f63]/70 text-sm">{addr.city}, {addr.state} {addr.zipCode}</p>
                            <p className="text-[#8b6f63]/50 text-xs mt-1">{addr.country}{addr.phone ? ` · ${addr.phone}` : ''}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}

                  {/* Toggle for new address */}
                  <div className="flex items-center gap-3 mb-4">
                    <button
                      type="button"
                      onClick={() => setUseNewAddress(!useNewAddress)}
                      className="text-sm text-[#d4a5a5] hover:underline flex items-center gap-1"
                    >
                      <Plus size={14} />
                      {useNewAddress ? 'Choose a saved address' : 'Use a new address'}
                    </button>
                  </div>

                  {/* New Address Form */}
                  {useNewAddress && (
                    <motion.div
                      className="space-y-4 p-4 bg-[#fef5f1] rounded-lg"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                    >
                      <div className="flex gap-2">
                        {['Home', 'Work', 'Other'].map((label) => (
                          <button
                            key={label}
                            type="button"
                            onClick={() => setNewAddress({ ...newAddress, label })}
                            className={`px-3 py-1.5 rounded-full text-xs transition-colors ${
                              newAddress.label === label
                                ? 'bg-[#d4a5a5] text-white'
                                : 'bg-white text-[#8b6f63] hover:bg-white/80 border border-[#f5e6e0]'
                            }`}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <input
                          type="text"
                          placeholder="Full Name *"
                          value={newAddress.name}
                          onChange={(e) => setNewAddress({ ...newAddress, name: e.target.value })}
                          required={useNewAddress}
                          className="w-full px-4 py-3 rounded-lg bg-white border border-[#f5e6e0]/80 text-[#8b6f63] placeholder:text-[#8b6f63]/40 focus:outline-none focus:ring-2 focus:ring-[#d4a5a5]"
                        />
                        <input
                          type="tel"
                          placeholder="Phone"
                          value={newAddress.phone}
                          onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                          className="w-full px-4 py-3 rounded-lg bg-white border border-[#f5e6e0]/80 text-[#8b6f63] placeholder:text-[#8b6f63]/40 focus:outline-none focus:ring-2 focus:ring-[#d4a5a5]"
                        />
                      </div>
                      <input
                        type="text"
                        placeholder="Street Address *"
                        value={newAddress.street}
                        onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                        required={useNewAddress}
                        className="w-full px-4 py-3 rounded-lg bg-white border border-[#f5e6e0]/80 text-[#8b6f63] placeholder:text-[#8b6f63]/40 focus:outline-none focus:ring-2 focus:ring-[#d4a5a5]"
                      />
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        <input
                          type="text"
                          placeholder="City *"
                          value={newAddress.city}
                          onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                          required={useNewAddress}
                          className="w-full px-4 py-3 rounded-lg bg-white border border-[#f5e6e0]/80 text-[#8b6f63] placeholder:text-[#8b6f63]/40 focus:outline-none focus:ring-2 focus:ring-[#d4a5a5]"
                        />
                        <input
                          type="text"
                          placeholder="State *"
                          value={newAddress.state}
                          onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                          required={useNewAddress}
                          className="w-full px-4 py-3 rounded-lg bg-white border border-[#f5e6e0]/80 text-[#8b6f63] placeholder:text-[#8b6f63]/40 focus:outline-none focus:ring-2 focus:ring-[#d4a5a5]"
                        />
                        <input
                          type="text"
                          placeholder="ZIP Code *"
                          value={newAddress.zipCode}
                          onChange={(e) => setNewAddress({ ...newAddress, zipCode: e.target.value })}
                          required={useNewAddress}
                          className="w-full px-4 py-3 rounded-lg bg-white border border-[#f5e6e0]/80 text-[#8b6f63] placeholder:text-[#8b6f63]/40 focus:outline-none focus:ring-2 focus:ring-[#d4a5a5]"
                        />
                      </div>
                      <input
                        type="text"
                        placeholder="Country *"
                        value={newAddress.country}
                        onChange={(e) => setNewAddress({ ...newAddress, country: e.target.value })}
                        required={useNewAddress}
                        className="w-full px-4 py-3 rounded-lg bg-white border border-[#f5e6e0]/80 text-[#8b6f63] placeholder:text-[#8b6f63]/40 focus:outline-none focus:ring-2 focus:ring-[#d4a5a5]"
                      />
                    </motion.div>
                  )}

                  <div className="flex justify-end pt-4">
                    <button
                      type="button"
                      onClick={() => canProceedToPayment() && setCurrentStep(2)}
                      disabled={!canProceedToPayment()}
                      className="px-6 py-3 bg-[#d4a5a5] text-white rounded-full hover:bg-[#c89a9a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      Continue to Payment
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* ===== STEP 2: PAYMENT ===== */}
              {currentStep === 2 && (
                <motion.div
                  key="payment"
                  className="bg-white rounded-xl p-6 shadow-sm border border-[#f5e6e0]/50"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <div className="flex items-center gap-2 mb-6">
                    <CreditCard className="text-[#d4a5a5]" size={24} />
                    <h2 className="text-xl font-serif text-[#8b6f63]">Payment Method</h2>
                  </div>

                  {/* Saved Payment Methods */}
                  {paymentMethods.length > 0 && !useNewPayment && (
                    <div className="space-y-3 mb-4">
                      {paymentMethods.map((pm) => {
                        const isCash = pm.type.toUpperCase() === 'PAY_ON_RECEIVE' || pm.type.toUpperCase() === 'CASH_ON_DELIVERY';
                        return (
                          <label
                            key={pm.id}
                            className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                              selectedPaymentId === pm.id
                                ? 'border-[#d4a5a5] bg-[#fef5f1]'
                                : 'border-[#f5e6e0]/50 hover:border-[#d4a5a5]/50'
                            }`}
                          >
                            <input
                              type="radio"
                              name="payment"
                              value={pm.id}
                              checked={selectedPaymentId === pm.id}
                              onChange={() => setSelectedPaymentId(pm.id)}
                              className="w-4 h-4 accent-[#d4a5a5]"
                            />
                            <div className="w-10 h-7 rounded-md bg-gradient-to-br from-[#8b6f63]/10 to-[#d4a5a5]/20 flex items-center justify-center">
                              {isCash ? <Banknote size={16} className="text-[#8b6f63]" /> : <CreditCard size={16} className="text-[#8b6f63]" />}
                            </div>
                            <div>
                              <p className="text-[#8b6f63] font-medium text-sm">{getPaymentLabel(pm.type)}</p>
                              <p className="text-xs text-[#8b6f63]/60">{getPaymentDescription(pm)}</p>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  )}

                  {/* Toggle for new payment */}
                  <div className="flex items-center gap-3 mb-4">
                    <button
                      type="button"
                      onClick={() => setUseNewPayment(!useNewPayment)}
                      className="text-sm text-[#d4a5a5] hover:underline flex items-center gap-1"
                    >
                      <Plus size={14} />
                      {useNewPayment ? 'Choose a saved payment' : 'Add a new payment method'}
                    </button>
                  </div>

                  {/* New Payment Form */}
                  {useNewPayment && (
                    <motion.div
                      className="space-y-4 p-4 bg-[#fef5f1] rounded-lg"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                    >
                      {/* Pay on Receive Option */}
                      <button
                        type="button"
                        onClick={() => setNewPayment({ ...newPayment, type: 'PAY_ON_RECEIVE' })}
                        className={`w-full flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${
                          newPayment.type === 'PAY_ON_RECEIVE'
                            ? 'border-[#d4a5a5] bg-white'
                            : 'border-[#f5e6e0]/50 hover:border-[#d4a5a5]/50 bg-white'
                        }`}
                      >
                        <div className="w-10 h-7 rounded-md bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center">
                          <Banknote size={16} className="text-green-700" />
                        </div>
                        <div className="text-left">
                          <p className="text-[#8b6f63] font-medium text-sm">Pay on Receive</p>
                          <p className="text-xs text-[#8b6f63]/60">Pay cash when you receive your order</p>
                        </div>
                      </button>

                      {/* Card Options */}
                      <div className="text-xs text-[#8b6f63]/50 uppercase tracking-wide font-medium">Or add a card</div>
                      <div className="grid grid-cols-2 gap-2">
                        {['VISA', 'MASTERCARD', 'AMEX', 'DISCOVER'].map((card) => (
                          <button
                            key={card}
                            type="button"
                            onClick={() => setNewPayment({ ...newPayment, type: card })}
                            className={`px-3 py-2 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                              newPayment.type === card
                                ? 'bg-[#d4a5a5] text-white'
                                : 'bg-white border border-[#f5e6e0] text-[#8b6f63] hover:border-[#d4a5a5]/50'
                            }`}
                          >
                            <CreditCard size={14} />
                            {card.charAt(0) + card.slice(1).toLowerCase()}
                          </button>
                        ))}
                      </div>

                      {newPayment.type !== 'PAY_ON_RECEIVE' && (
                        <motion.div
                          className="space-y-3"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                        >
                          <input
                            type="text"
                            placeholder="Card Number *"
                            value={newPayment.cardNumber}
                            onChange={(e) => setNewPayment({ ...newPayment, cardNumber: e.target.value.replace(/[^\d\s]/g, '').slice(0, 19) })}
                            className="w-full px-4 py-3 rounded-lg bg-white border border-[#f5e6e0]/80 text-[#8b6f63] placeholder:text-[#8b6f63]/40 focus:outline-none focus:ring-2 focus:ring-[#d4a5a5] font-mono"
                          />
                          <input
                            type="text"
                            placeholder="Cardholder Name *"
                            value={newPayment.holderName}
                            onChange={(e) => setNewPayment({ ...newPayment, holderName: e.target.value })}
                            className="w-full px-4 py-3 rounded-lg bg-white border border-[#f5e6e0]/80 text-[#8b6f63] placeholder:text-[#8b6f63]/40 focus:outline-none focus:ring-2 focus:ring-[#d4a5a5]"
                          />
                          <div className="grid grid-cols-2 gap-3">
                            <select
                              value={newPayment.expiryMonth}
                              onChange={(e) => setNewPayment({ ...newPayment, expiryMonth: e.target.value })}
                              className="w-full px-4 py-3 rounded-lg bg-white border border-[#f5e6e0]/80 text-[#8b6f63] focus:outline-none focus:ring-2 focus:ring-[#d4a5a5]"
                            >
                              <option value="">Month</option>
                              {Array.from({ length: 12 }, (_, i) => (
                                <option key={i + 1} value={String(i + 1)}>{String(i + 1).padStart(2, '0')}</option>
                              ))}
                            </select>
                            <select
                              value={newPayment.expiryYear}
                              onChange={(e) => setNewPayment({ ...newPayment, expiryYear: e.target.value })}
                              className="w-full px-4 py-3 rounded-lg bg-white border border-[#f5e6e0]/80 text-[#8b6f63] focus:outline-none focus:ring-2 focus:ring-[#d4a5a5]"
                            >
                              <option value="">Year</option>
                              {Array.from({ length: 12 }, (_, i) => (
                                <option key={2024 + i} value={String(2024 + i)}>{2024 + i}</option>
                              ))}
                            </select>
                          </div>
                        </motion.div>
                      )}
                    </motion.div>
                  )}

                  <div className="flex justify-between pt-4">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="px-6 py-3 border border-[#f5e6e0] text-[#8b6f63] rounded-full hover:bg-[#fef5f1] transition-colors"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={() => canPlaceOrder() && setCurrentStep(3)}
                      disabled={!canPlaceOrder()}
                      className="px-6 py-3 bg-[#d4a5a5] text-white rounded-full hover:bg-[#c89a9a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      Review Order
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* ===== STEP 3: REVIEW ===== */}
              {currentStep === 3 && (
                <motion.div
                  key="review"
                  className="space-y-6"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  {/* Review Address */}
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-[#f5e6e0]/50">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <MapPin className="text-[#d4a5a5]" size={18} />
                        <h3 className="font-medium text-[#8b6f63]">Shipping Address</h3>
                      </div>
                      <button
                        type="button"
                        onClick={() => setCurrentStep(1)}
                        className="text-xs text-[#d4a5a5] hover:underline"
                      >
                        Change
                      </button>
                    </div>
                    {(() => {
                      const addr = getSelectedAddress();
                      const a = addr || newAddress;
                      return (
                        <p className="text-sm text-[#8b6f63]/70">
                          <span className="font-medium text-[#8b6f63]">{a.name}</span>
                          {a.phone && <span className="ml-2">{a.phone}</span>}
                          <br />{a.street}
                          <br />{a.city}, {a.state} {a.zipCode}
                          <br />{a.country}
                        </p>
                      );
                    })()}
                  </div>

                  {/* Review Payment */}
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-[#f5e6e0]/50">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <CreditCard className="text-[#d4a5a5]" size={18} />
                        <h3 className="font-medium text-[#8b6f63]">Payment Method</h3>
                      </div>
                      <button
                        type="button"
                        onClick={() => setCurrentStep(2)}
                        className="text-xs text-[#d4a5a5] hover:underline"
                      >
                        Change
                      </button>
                    </div>
                    {(() => {
                      const pm = getSelectedPayment();
                      const pType = pm ? pm.type : newPayment.type.toUpperCase();
                      const isCash = pType === 'PAY_ON_RECEIVE' || pType === 'CASH_ON_DELIVERY';
                      return (
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-7 rounded-md bg-gradient-to-br from-[#8b6f63]/10 to-[#d4a5a5]/20 flex items-center justify-center">
                            {isCash ? <Banknote size={16} className="text-[#8b6f63]" /> : <CreditCard size={16} className="text-[#8b6f63]" />}
                          </div>
                          <div>
                            <p className="text-[#8b6f63] font-medium text-sm">{getPaymentLabel(pType)}</p>
                            {pm ? (
                              <p className="text-xs text-[#8b6f63]/60">{getPaymentDescription(pm)}</p>
                            ) : (
                              !isCash && (
                                <p className="text-xs text-[#8b6f63]/60">•••• •••• •••• {newPayment.cardNumber.replace(/\s/g, '').slice(-4)}</p>
                              )
                            )}
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Review Items */}
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-[#f5e6e0]/50">
                    <div className="flex items-center gap-2 mb-4">
                      <ShoppingBag className="text-[#d4a5a5]" size={18} />
                      <h3 className="font-medium text-[#8b6f63]">Order Items ({cartItems.length})</h3>
                    </div>
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {cartItems.map((item) => (
                        <div key={item.id} className="flex items-center gap-3">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-14 h-14 rounded-lg object-cover border border-[#f5e6e0]/50"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm text-[#8b6f63] font-medium truncate">{item.name}</p>
                              {item.selectedColor && item.selectedColor !== 'default' && (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-[#fef5f1] rounded-full flex-shrink-0">
                                  <span className="w-3 h-3 rounded-full border border-gray-200" style={{ backgroundColor: item.selectedColor }} />
                                  <span className="text-[10px] text-[#8b6f63]/60 font-mono">{item.selectedColor}</span>
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-[#8b6f63]/60">Qty: {item.quantity}</p>
                          </div>
                          <p className="text-sm text-[#8b6f63] font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      className="px-6 py-3 border border-[#f5e6e0] text-[#8b6f63] rounded-full hover:bg-[#fef5f1] transition-colors"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="px-8 py-3 bg-[#d4a5a5] text-white rounded-full hover:bg-[#c89a9a] transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] flex items-center gap-2"
                    >
                      {isLoading ? <Loader2 size={18} className="animate-spin" /> : null}
                      {isLoading ? 'Processing...' : `Place Order — $${total.toFixed(2)}`}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <motion.div
              className="bg-[#fef5f1] rounded-xl p-6 sticky top-24"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex items-center gap-2 mb-6">
                <ShoppingBag className="text-[#d4a5a5]" size={20} />
                <h2 className="text-xl font-serif text-[#8b6f63]">Order Summary</h2>
              </div>

              {/* ===== ORDER ITEMS WITH THUMBNAILS ===== */}
              <div className="space-y-3 mb-5 max-h-52 overflow-y-auto pr-1 custom-scrollbar">
                {cartItems.map((item) => (
                  <motion.div
                    key={item.id}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/60 transition-colors"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    <div className="relative flex-shrink-0">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-12 h-12 rounded-lg object-cover border border-[#f5e6e0]/50"
                      />
                      <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-[#d4a5a5] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-[#8b6f63] font-medium truncate leading-tight">{item.name}</p>
                      {item.selectedColor && item.selectedColor !== 'default' && (
                        <div className="flex items-center gap-1 mt-0.5">
                          <span className="w-2.5 h-2.5 rounded-full border border-gray-200" style={{ backgroundColor: item.selectedColor }} />
                          <span className="text-[10px] text-[#8b6f63]/50 font-mono">{item.selectedColor}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1.5 mt-0.5">
                        {item.originalPrice && item.originalPrice > item.price ? (
                          <>
                            <span className="text-[10px] text-[#8b6f63]/40 line-through">${item.originalPrice.toFixed(2)}</span>
                            <span className="text-xs text-[#8b6f63] font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                          </>
                        ) : (
                          <span className="text-xs text-[#8b6f63] font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* ===== PROMO CODE SECTION ===== */}
              <div className="mb-5">
                {appliedPromoCode ? (
                  <motion.div
                    className="relative overflow-hidden"
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  >
                    {/* Confetti-like decorative dots */}
                    <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                      {[...Array(8)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="absolute w-1.5 h-1.5 rounded-full"
                          style={{
                            backgroundColor: ['#f59e0b', '#10b981', '#d4a5a5', '#f472b6', '#8b5cf6', '#06b6d4', '#f59e0b', '#10b981'][i],
                            left: `${10 + i * 12}%`,
                            top: '50%',
                          }}
                          initial={{ opacity: 0, scale: 0, y: 0 }}
                          animate={{
                            opacity: [0, 1, 0],
                            scale: [0, 1.2, 0.5],
                            y: [0, -12, -20],
                          }}
                          transition={{
                            duration: 0.8,
                            delay: i * 0.05,
                            repeat: 2,
                            repeatDelay: 0.3,
                          }}
                        />
                      ))}
                    </div>
                    <div className="flex items-center justify-between bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg px-3 py-2.5">
                      <div className="flex items-center gap-2">
                        <motion.div
                          initial={{ rotate: -20, scale: 0 }}
                          animate={{ rotate: 0, scale: 1 }}
                          transition={{ type: 'spring', delay: 0.1 }}
                        >
                          <Gift size={16} className="text-green-600" />
                        </motion.div>
                        <span className="text-sm text-green-700 font-bold tracking-wide">{appliedPromoCode.code}</span>
                        <span className="text-[10px] text-green-600 bg-green-100 px-1.5 py-0.5 rounded-full font-medium">
                          {appliedPromoCode.description}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => { removePromoCode(); toast('Promo code removed'); }}
                        className="text-green-500 hover:text-red-500 transition-colors p-0.5 hover:bg-red-50 rounded-full"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <div>
                    {/* Expandable toggle */}
                    <button
                      type="button"
                      onClick={() => setPromoExpanded(!promoExpanded)}
                      className="w-full flex items-center justify-between py-2 text-sm text-[#8b6f63]/70 hover:text-[#8b6f63] transition-colors group"
                    >
                      <span className="flex items-center gap-2">
                        <Gift size={14} className="text-[#d4a5a5] group-hover:text-[#d4a5a5]" />
                        <span className="font-medium">Have a promo code?</span>
                      </span>
                      <motion.div
                        animate={{ rotate: promoExpanded ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronDown size={16} />
                      </motion.div>
                    </button>

                    {/* Expandable input area */}
                    <AnimatePresence>
                      {promoExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25 }}
                          className="overflow-hidden"
                        >
                          <div className="flex gap-2 pt-1 pb-1">
                            <div className="flex-1 relative">
                              <Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8b6f63]/30" />
                              <input
                                type="text"
                                placeholder="Enter code"
                                value={promoInput}
                                onChange={(e) => { setPromoInput(e.target.value.toUpperCase()); setPromoError(''); }}
                                onKeyDown={(e) => { if (e.key === 'Enter') handleApplyPromo(); }}
                                className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-white border border-[#f5e6e0]/80 text-[#8b6f63] placeholder:text-[#8b6f63]/30 focus:outline-none focus:ring-2 focus:ring-[#d4a5a5]/50 focus:border-[#d4a5a5] text-sm transition-all"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={handleApplyPromo}
                              disabled={promoLoading || !promoInput.trim()}
                              className="px-4 py-2.5 bg-[#8b6f63] text-white rounded-lg text-sm hover:bg-[#7a5f53] transition-all disabled:opacity-50 flex items-center gap-1.5 font-medium"
                            >
                              {promoLoading ? (
                                <Loader2 size={14} className="animate-spin" />
                              ) : (
                                <Sparkles size={14} />
                              )}
                              {promoLoading ? 'Checking...' : 'Apply'}
                            </button>
                          </div>

                          {/* Hint text */}
                          <p className="text-[10px] text-[#8b6f63]/40 mt-1.5 flex items-center gap-1">
                            <Tag size={10} />
                            Try: WELCOME10, SUMMER20, FREESHIP
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Error state */}
                    <AnimatePresence>
                      {promoError && (
                        <motion.div
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -5 }}
                          className="flex items-center gap-1.5 mt-2 text-xs text-red-500 bg-red-50 px-2.5 py-1.5 rounded-lg"
                        >
                          <AlertCircle size={12} className="flex-shrink-0" />
                          <span>{promoError}</span>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Success flash */}
                    <AnimatePresence>
                      {promoSuccess && (
                        <motion.div
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -5 }}
                          className="flex items-center gap-1.5 mt-2 text-xs text-green-600 bg-green-50 px-2.5 py-1.5 rounded-lg"
                        >
                          <CheckCircle size={12} className="flex-shrink-0" />
                          <span>Promo code applied successfully!</span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </div>

              {/* ===== SAVINGS BANNER ===== */}
              {totalDiscount > 0 && (
                <SavingsBanner totalDiscount={totalDiscount} saleSavings={saleSavings} promoDiscount={promoDiscount} appliedPromoCode={appliedPromoCode} />
              )}

              {/* ===== PRICING BREAKDOWN ===== */}
              <div className="border-t border-[#8b6f63]/10 pt-4 space-y-2.5 mb-5">
                {saleSavings > 0 && (
                  <div className="flex justify-between text-[#8b6f63]/50 text-xs">
                    <span>Original Price</span>
                    <span className="line-through">${originalSubtotal.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-[#8b6f63] text-sm">
                  <span>Subtotal</span>
                  <span className="font-medium">${subtotal.toFixed(2)}</span>
                </div>
                {saleSavings > 0 && (
                  <motion.div
                    className="flex justify-between text-green-600 text-sm"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    <span className="flex items-center gap-1.5 font-medium">
                      <Tag size={12} />
                      Sale discounts
                    </span>
                    <span className="font-semibold">-{saleSavings.toFixed(2)}</span>
                  </motion.div>
                )}
                {appliedPromoCode && (
                  <motion.div
                    className="flex justify-between text-green-600 text-sm"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <span className="flex items-center gap-1.5 font-medium">
                      <Percent size={12} />
                      Promo ({appliedPromoCode.code})
                    </span>
                    <span className="font-semibold">-{promoDiscount.toFixed(2)}</span>
                  </motion.div>
                )}

                {/* Subtle separator */}
                <div className="border-b border-[#8b6f63]/8" />

                <div className="flex justify-between text-[#8b6f63] text-sm">
                  <span className="flex items-center gap-1.5">
                    <Truck size={13} className="text-[#8b6f63]/40" />
                    Shipping
                  </span>
                  <span className={`font-medium ${shipping === 0 ? 'text-green-600' : ''}`}>
                    {shipping === 0 ? (
                      <span className="flex items-center gap-1">
                        <CheckCircle size={13} className="text-green-500" />
                        Free
                      </span>
                    ) : (
                      `$${shipping.toFixed(2)}`
                    )}
                  </span>
                </div>
                {shipping > 0 && (
                  <p className="text-[10px] text-[#8b6f63]/40 -mt-1">
                    <span className="flex items-center gap-1">
                      <Sparkles size={10} />
                      Add ${(50 - afterPromoSubtotal).toFixed(2)} more for free shipping
                    </span>
                  </p>
                )}

                <div className="flex justify-between text-[#8b6f63] text-sm">
                  <span>Tax</span>
                  <span className="font-medium">${tax.toFixed(2)}</span>
                </div>

                {/* ===== TOTAL ROW ===== */}
                <div className="border-t-2 border-[#8b6f63]/15 pt-3 mt-2">
                  <div className="flex justify-between items-baseline">
                    <span className="text-base font-semibold text-[#8b6f63]">Total</span>
                    <span className="text-xl font-bold text-[#8b6f63]">${total.toFixed(2)}</span>
                  </div>
                  {totalDiscount > 0 && (
                    <motion.p
                      className="text-[11px] text-green-600 mt-1 flex items-center gap-1"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      <Sparkles size={11} />
                      You save ${totalDiscount.toFixed(2)} on this order
                    </motion.p>
                  )}
                </div>
              </div>

              {/* ===== SECURITY BADGES ===== */}
              <div className="border-t border-[#8b6f63]/10 pt-4">
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center gap-1.5 text-[10px] text-[#8b6f63]/50 bg-white/60 rounded-lg px-2.5 py-2">
                    <ShieldCheck size={13} className="text-green-600 flex-shrink-0" />
                    <div>
                      <span className="font-semibold text-[#8b6f63]/70 block leading-tight">Secure Checkout</span>
                      <span>256-bit SSL</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-[#8b6f63]/50 bg-white/60 rounded-lg px-2.5 py-2">
                    <Lock size={13} className="text-green-600 flex-shrink-0" />
                    <div>
                      <span className="font-semibold text-[#8b6f63]/70 block leading-tight">Encrypted</span>
                      <span>Data protected</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-[#8b6f63]/50 bg-white/60 rounded-lg px-2.5 py-2">
                    <Truck size={13} className="text-[#d4a5a5] flex-shrink-0" />
                    <div>
                      <span className="font-semibold text-[#8b6f63]/70 block leading-tight">{shipping === 0 ? 'Free Shipping' : 'Fast Delivery'}</span>
                      <span>Tracked package</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-[#8b6f63]/50 bg-white/60 rounded-lg px-2.5 py-2">
                    <Package size={13} className="text-[#d4a5a5] flex-shrink-0" />
                    <div>
                      <span className="font-semibold text-[#8b6f63]/70 block leading-tight">Easy Returns</span>
                      <span>30-day policy</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </form>
    </div>
  );
}
