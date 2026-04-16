'use client';

import { useState } from 'react';
import { useStore } from '@/store/store';
import { Search, Package, ArrowLeft, CheckCircle, Clock, Truck, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product?: { name: string; image: string };
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  trackingNumber?: string;
  createdAt: string;
  orderItems: OrderItem[];
}

export function OrderTrackingPage() {
  const { navigate } = useStore();
  const [orderNumber, setOrderNumber] = useState('');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNumber.trim()) return;

    setLoading(true);
    setError('');
    setSearched(true);

    try {
      const res = await fetch(`/api/orders/${orderNumber.trim()}`);
      if (!res.ok) {
        setError('Order not found. Please check your order number and try again.');
        setOrder(null);
        return;
      }
      const data = await res.json();
      setOrder(data);
    } catch {
      setError('Failed to track order. Please try again.');
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Delivered': return 'text-green-600 bg-green-50';
      case 'Shipped': return 'text-blue-600 bg-blue-50';
      case 'Processing': return 'text-amber-600 bg-amber-50';
      default: return 'text-[#8b6f63] bg-[#fef5f1]';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Delivered': return <CheckCircle size={20} />;
      case 'Shipped': return <Truck size={20} />;
      case 'Processing': return <Clock size={20} />;
      default: return <Package size={20} />;
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-[#fef5f1] to-[#f5e6e0] py-16">
        <div className="container mx-auto px-4 text-center">
          <motion.h1
            className="text-4xl font-serif text-[#8b6f63] mb-4"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Track Your Order
          </motion.h1>
          <motion.p
            className="text-[#8b6f63]/70 max-w-md mx-auto"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            Enter your order number to see the latest status of your delivery.
          </motion.p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Search Form */}
        <motion.div
          className="max-w-lg mx-auto mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <form onSubmit={handleTrack} className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8b6f63]/50" size={18} />
              <input
                type="text"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                placeholder="Enter order number (e.g. RB12345678)"
                className="w-full pl-12 pr-4 py-3 rounded-full bg-[#fef5f1] text-[#8b6f63] placeholder:text-[#8b6f63]/40 focus:outline-none focus:ring-2 focus:ring-[#d4a5a5]"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !orderNumber.trim()}
              className="px-8 py-3 bg-[#d4a5a5] text-white rounded-full hover:bg-[#c89a9a] transition-all disabled:opacity-50 active:scale-[0.98] whitespace-nowrap"
            >
              {loading ? 'Tracking...' : 'Track Order'}
            </button>
          </form>
        </motion.div>

        {/* Error */}
        {error && searched && (
          <div className="max-w-lg mx-auto mb-8 text-center">
            <div className="bg-red-50 border border-red-200 rounded-xl p-6">
              <Package size={40} className="text-red-400 mx-auto mb-3" />
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Order Result */}
        {order && (
          <motion.div
            className="max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Status Banner */}
            <div className={`rounded-xl p-6 mb-6 flex items-center gap-4 ${getStatusColor(order.status)}`}>
              {getStatusIcon(order.status)}
              <div>
                <p className="text-sm opacity-70">Order Status</p>
                <p className="text-lg font-semibold">{order.status}</p>
              </div>
              {order.trackingNumber && (
                <div className="ml-auto text-right">
                  <p className="text-xs opacity-70">Tracking Number</p>
                  <p className="text-sm font-mono font-medium">{order.trackingNumber}</p>
                </div>
              )}
            </div>

            {/* Order Info */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-[#f5e6e0]/50 mb-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-[#8b6f63]/50">Order Number</p>
                  <p className="text-sm text-[#8b6f63] font-medium">{order.orderNumber}</p>
                </div>
                <div>
                  <p className="text-xs text-[#8b6f63]/50">Date</p>
                  <p className="text-sm text-[#8b6f63]">{new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-xs text-[#8b6f63]/50">Items</p>
                  <p className="text-sm text-[#8b6f63]">{order.orderItems?.length || 0} items</p>
                </div>
                <div>
                  <p className="text-xs text-[#8b6f63]/50">Total</p>
                  <p className="text-sm text-[#8b6f63] font-semibold">${order.total.toFixed(2)}</p>
                </div>
              </div>
            </div>

            {/* Progress Timeline */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-[#f5e6e0]/50 mb-6">
              <h3 className="text-lg font-serif text-[#8b6f63] mb-6">Delivery Progress</h3>
              <div className="space-y-6 relative">
                <div className="absolute left-4 top-6 bottom-6 w-0.5 bg-[#f5e6e0]" />
                {[
                  { icon: <CheckCircle size={20} />, label: 'Order Confirmed', desc: 'Your order has been received', done: true },
                  { icon: <Clock size={20} />, label: 'Processing', desc: 'Preparing your items', done: ['Processing', 'Shipped', 'Delivered'].includes(order.status) },
                  { icon: <Truck size={20} />, label: 'Shipped', desc: 'Your package is on the way', done: ['Shipped', 'Delivered'].includes(order.status) },
                  { icon: <MapPin size={20} />, label: 'Delivered', desc: 'Package delivered to your address', done: order.status === 'Delivered' },
                ].map((step, idx) => (
                  <div key={step.label} className="flex items-center gap-4 relative z-10">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      step.done ? 'bg-[#d4a5a5] text-white' : 'bg-[#fef5f1] text-[#8b6f63]/30'
                    }`}>
                      {step.icon}
                    </div>
                    <div>
                      <p className={`text-sm ${step.done ? 'text-[#8b6f63] font-medium' : 'text-[#8b6f63]/40'}`}>{step.label}</p>
                      <p className="text-xs text-[#8b6f63]/50">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Items */}
            {order.orderItems && order.orderItems.length > 0 && (
              <div className="bg-white rounded-xl p-6 shadow-sm border border-[#f5e6e0]/50">
                <h3 className="text-lg font-serif text-[#8b6f63] mb-4">Order Items</h3>
                <div className="space-y-3">
                  {order.orderItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between py-2 border-b border-[#f5e6e0]/30 last:border-0">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#fef5f1] rounded-lg flex items-center justify-center">
                          <span className="text-lg opacity-40">💄</span>
                        </div>
                        <div>
                          <p className="text-sm text-[#8b6f63] font-medium">{item.product?.name || 'Product'}</p>
                          <p className="text-xs text-[#8b6f63]/50">Qty: {item.quantity}</p>
                        </div>
                      </div>
                      <span className="text-sm text-[#8b6f63] font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Back link */}
        <div className="text-center mt-8">
          <button
            onClick={() => navigate('home')}
            className="inline-flex items-center gap-2 text-[#8b6f63] hover:text-[#d4a5a5] transition-colors text-sm"
          >
            <ArrowLeft size={16} />
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}
