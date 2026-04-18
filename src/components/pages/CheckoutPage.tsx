'use client';

import { useState, useEffect } from 'react';
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

export function CheckoutPage() {
  const { cartItems, getCartTotal, clearCart, navigate, isAuthenticated, user } = useStore();
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
  const shipping = subtotal >= 50 ? 0 : 5.99;
  const tax = subtotal * 0.1;
  const total = subtotal + shipping + tax;

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
        subtotal, tax, total: subtotal + tax,
        paymentMethod: paymentType === 'PAY_ON_RECEIVE' ? 'pay_on_receive' : 'credit_card',
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
              <h2 className="text-xl font-serif text-[#8b6f63] mb-6">Order Summary</h2>
              <div className="space-y-3 mb-6 max-h-48 overflow-y-auto">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-[#8b6f63] truncate mr-2">{item.name} x {item.quantity}</span>
                      {item.selectedColor && item.selectedColor !== 'default' && (
                        <span className="inline-flex items-center gap-1 flex-shrink-0">
                          <span className="w-3 h-3 rounded-full border border-gray-200" style={{ backgroundColor: item.selectedColor }} />
                          <span className="text-[10px] text-[#8b6f63]/60 font-mono">{item.selectedColor}</span>
                        </span>
                      )}
                    </div>
                    <span className="text-[#8b6f63] whitespace-nowrap">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-[#8b6f63]/20 pt-4 space-y-3 mb-6">
                <div className="flex justify-between text-[#8b6f63]">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[#8b6f63]">
                  <span>Shipping</span>
                  <span className={shipping === 0 ? 'text-green-600' : ''}>
                    {shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}
                  </span>
                </div>
                {shipping > 0 && (
                  <p className="text-xs text-[#8b6f63]/50">Free shipping on orders over $50</p>
                )}
                <div className="flex justify-between text-[#8b6f63]">
                  <span>Tax</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <div className="border-t border-[#8b6f63]/20 pt-3">
                  <div className="flex justify-between text-lg text-[#8b6f63] font-semibold">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Trust badges */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center gap-2 text-xs text-[#8b6f63]/60">
                  <ShieldCheck size={14} className="text-green-600" />
                  <span>Secure checkout</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-[#8b6f63]/60">
                  <Truck size={14} className="text-blue-600" />
                  <span>{shipping === 0 ? 'Free shipping' : 'Fast delivery'}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-[#8b6f63]/60">
                  <Package size={14} className="text-[#d4a5a5]" />
                  <span>30-day returns</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </form>
    </div>
  );
}
