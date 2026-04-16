'use client';

import { useState } from 'react';
import { useStore } from '@/store/store';
import { CreditCard, MapPin, User, Mail, Phone, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export function CheckoutPage() {
  const { cartItems, getCartTotal, clearCart, navigate, isAuthenticated } = useStore();
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [orderId, setOrderId] = useState('');

  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    address: '', city: '', state: '', zipCode: '', country: '',
    cardNumber: '', cardName: '', expiryDate: '', cvv: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cartItems.length === 0) return;

    setIsLoading(true);
    try {
      const subtotal = getCartTotal();
      const tax = subtotal * 0.1;
      const total = subtotal + tax;

      const orderData = {
        userId: isAuthenticated ? useStore.getState().user?.id : 'guest',
        items: cartItems.map((item) => ({ productId: item.id, quantity: item.quantity, price: item.price })),
        firstName: formData.firstName, lastName: formData.lastName,
        email: formData.email, phone: formData.phone,
        address: formData.address, city: formData.city,
        state: formData.state, zipCode: formData.zipCode, country: formData.country,
        subtotal, tax, total,
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
      toast.success('Order placed successfully!');

      setTimeout(() => {
        useStore.getState().setLastOrderId(order.id);
        navigate('order-confirmation');
      }, 2000);
    } catch {
      toast.error('Failed to place order. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (cartItems.length === 0 && !orderPlaced) {
    navigate('cart');
    return null;
  }

  const subtotal = getCartTotal();
  const tax = subtotal * 0.1;
  const total = subtotal + tax;

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

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-serif text-[#8b6f63] mb-8">Checkout</h1>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Personal Information */}
            <motion.div className="bg-white rounded-xl p-6 shadow-sm border border-[#f5e6e0]/50" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex items-center gap-2 mb-6"><User className="text-[#d4a5a5]" size={24} /><h2 className="text-xl font-serif text-[#8b6f63]">Personal Information</h2></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { name: 'firstName', label: 'First Name', icon: <User size={14} className="inline mr-1" /> },
                  { name: 'lastName', label: 'Last Name', icon: <User size={14} className="inline mr-1" /> },
                  { name: 'email', label: 'Email', type: 'email', icon: <Mail size={14} className="inline mr-1" /> },
                  { name: 'phone', label: 'Phone', type: 'tel', icon: <Phone size={14} className="inline mr-1" /> },
                ].map((field) => (
                  <div key={field.name}>
                    <label className="block text-sm text-[#8b6f63] mb-2">{field.icon}{field.label}</label>
                    <input type={field.type || 'text'} name={field.name} value={formData[field.name as keyof typeof formData]} onChange={handleChange} required
                      className="w-full px-4 py-3 rounded-lg bg-[#fef5f1] text-[#8b6f63] focus:outline-none focus:ring-2 focus:ring-[#d4a5a5]" />
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Shipping Address */}
            <motion.div className="bg-white rounded-xl p-6 shadow-sm border border-[#f5e6e0]/50" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <div className="flex items-center gap-2 mb-6"><MapPin className="text-[#d4a5a5]" size={24} /><h2 className="text-xl font-serif text-[#8b6f63]">Shipping Address</h2></div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-[#8b6f63] mb-2">Street Address</label>
                  <input type="text" name="address" value={formData.address} onChange={handleChange} required
                    className="w-full px-4 py-3 rounded-lg bg-[#fef5f1] text-[#8b6f63] focus:outline-none focus:ring-2 focus:ring-[#d4a5a5]" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {['city', 'state', 'zipCode', 'country'].map((field) => (
                    <div key={field}>
                      <label className="block text-sm text-[#8b6f63] mb-2">{field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1')}</label>
                      <input type="text" name={field} value={formData[field as keyof typeof formData]} onChange={handleChange} required
                        className="w-full px-4 py-3 rounded-lg bg-[#fef5f1] text-[#8b6f63] focus:outline-none focus:ring-2 focus:ring-[#d4a5a5]" />
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Payment */}
            <motion.div className="bg-white rounded-xl p-6 shadow-sm border border-[#f5e6e0]/50" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <div className="flex items-center gap-2 mb-6"><CreditCard className="text-[#d4a5a5]" size={24} /><h2 className="text-xl font-serif text-[#8b6f63]">Payment Information</h2></div>
              <div className="space-y-4">
                {[
                  { name: 'cardNumber', label: 'Card Number', placeholder: '1234 5678 9012 3456' },
                  { name: 'cardName', label: 'Cardholder Name', placeholder: '' },
                ].map((field) => (
                  <div key={field.name}>
                    <label className="block text-sm text-[#8b6f63] mb-2">{field.label}</label>
                    <input type="text" name={field.name} value={formData[field.name as keyof typeof formData]} onChange={handleChange} placeholder={field.placeholder} required
                      className="w-full px-4 py-3 rounded-lg bg-[#fef5f1] text-[#8b6f63] focus:outline-none focus:ring-2 focus:ring-[#d4a5a5]" />
                  </div>
                ))}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-[#8b6f63] mb-2">Expiry Date</label>
                    <input type="text" name="expiryDate" value={formData.expiryDate} onChange={handleChange} placeholder="MM/YY" required
                      className="w-full px-4 py-3 rounded-lg bg-[#fef5f1] text-[#8b6f63] focus:outline-none focus:ring-2 focus:ring-[#d4a5a5]" />
                  </div>
                  <div>
                    <label className="block text-sm text-[#8b6f63] mb-2">CVV</label>
                    <input type="text" name="cvv" value={formData.cvv} onChange={handleChange} placeholder="123" required
                      className="w-full px-4 py-3 rounded-lg bg-[#fef5f1] text-[#8b6f63] focus:outline-none focus:ring-2 focus:ring-[#d4a5a5]" />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <motion.div className="bg-[#fef5f1] rounded-xl p-6 sticky top-24" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <h2 className="text-xl font-serif text-[#8b6f63] mb-6">Order Summary</h2>
              <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-[#8b6f63]">{item.name} x {item.quantity}</span>
                    <span className="text-[#8b6f63]">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-[#8b6f63]/20 pt-4 space-y-3 mb-6">
                <div className="flex justify-between text-[#8b6f63]"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
                <div className="flex justify-between text-[#8b6f63]"><span>Shipping</span><span className="text-green-600">Free</span></div>
                <div className="flex justify-between text-[#8b6f63]"><span>Tax</span><span>${tax.toFixed(2)}</span></div>
                <div className="border-t border-[#8b6f63]/20 pt-3">
                  <div className="flex justify-between text-lg text-[#8b6f63] font-semibold"><span>Total</span><span>${total.toFixed(2)}</span></div>
                </div>
              </div>
              <button type="submit" disabled={isLoading} className="w-full py-3 bg-[#d4a5a5] text-white rounded-full hover:bg-[#c89a9a] transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]">
                {isLoading ? 'Processing...' : `Place Order — $${total.toFixed(2)}`}
              </button>
              <p className="text-xs text-[#8b6f63]/50 text-center mt-4">By placing your order, you agree to our terms and conditions</p>
            </motion.div>
          </div>
        </div>
      </form>
    </div>
  );
}
