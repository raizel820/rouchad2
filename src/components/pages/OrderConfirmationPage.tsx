'use client';

import { useEffect, useState } from 'react';
import { useStore } from '@/store/store';
import { CheckCircle, Package, ArrowRight } from 'lucide-react';
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

export function OrderConfirmationPage() {
  const { lastOrderId, navigate } = useStore();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!lastOrderId) {
      navigate('home');
      return;
    }
    fetch(`/api/orders/${lastOrderId}`)
      .then((r) => r.json())
      .then((data) => {
        setOrder(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [lastOrderId, navigate]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="animate-pulse space-y-4 max-w-md mx-auto">
          <div className="w-20 h-20 bg-[#fef5f1] rounded-full mx-auto" />
          <div className="h-8 bg-[#fef5f1] rounded w-3/4 mx-auto" />
          <div className="h-4 bg-[#fef5f1] rounded w-1/2 mx-auto" />
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl text-[#8b6f63] mb-4">Order not found</h1>
        <button onClick={() => navigate('home')} className="text-[#d4a5a5] hover:underline">
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-2xl mx-auto text-center">
        {/* Success Animation */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', duration: 0.6 }}
          className="mb-8"
        >
          <div className="w-24 h-24 bg-green-100 rounded-full mx-auto flex items-center justify-center">
            <CheckCircle size={48} className="text-green-600" />
          </div>
        </motion.div>

        <motion.h1
          className="text-3xl font-serif text-[#8b6f63] mb-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          Thank You for Your Order!
        </motion.h1>
        <motion.p
          className="text-[#8b6f63]/70 mb-8"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          Your order has been placed and is being processed.
        </motion.p>

        {/* Order Details Card */}
        <motion.div
          className="bg-white rounded-xl p-8 shadow-sm border border-[#f5e6e0]/50 text-left mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-center gap-3 mb-6">
            <Package className="text-[#d4a5a5]" size={24} />
            <h2 className="text-xl font-serif text-[#8b6f63]">Order Details</h2>
          </div>

          <div className="space-y-4 mb-6">
            <div className="flex justify-between">
              <span className="text-sm text-[#8b6f63]/70">Order Number</span>
              <span className="text-sm text-[#8b6f63] font-medium">{order.orderNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-[#8b6f63]/70">Date</span>
              <span className="text-sm text-[#8b6f63]">{new Date(order.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-[#8b6f63]/70">Status</span>
              <span className="text-sm text-amber-600 font-medium flex items-center gap-1">
                <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                {order.status}
              </span>
            </div>
            {order.trackingNumber && (
              <div className="flex justify-between">
                <span className="text-sm text-[#8b6f63]/70">Tracking Number</span>
                <span className="text-sm text-[#8b6f63] font-medium">{order.trackingNumber}</span>
              </div>
            )}
          </div>

          {/* Items */}
          {order.orderItems && order.orderItems.length > 0 && (
            <div className="border-t border-[#f5e6e0]/50 pt-4 mb-6">
              <h3 className="text-sm font-medium text-[#8b6f63] mb-3">Items Ordered</h3>
              <div className="space-y-2">
                {order.orderItems.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-[#8b6f63]/70">
                      {item.product?.name || 'Product'} x {item.quantity}
                    </span>
                    <span className="text-[#8b6f63]">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="border-t border-[#f5e6e0]/50 pt-4">
            <div className="flex justify-between text-lg font-semibold text-[#8b6f63]">
              <span>Total</span>
              <span>${order.total.toFixed(2)}</span>
            </div>
          </div>
        </motion.div>

        {/* Timeline */}
        <motion.div
          className="bg-[#fef5f1] rounded-xl p-6 mb-8 text-left"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <h3 className="text-sm font-medium text-[#8b6f63] mb-4">Order Timeline</h3>
          <div className="space-y-4">
            {[
              { label: 'Order Placed', done: true, date: new Date(order.createdAt).toLocaleDateString() },
              { label: 'Processing', done: true, date: 'In progress' },
              { label: 'Shipped', done: false, date: '' },
              { label: 'Delivered', done: false, date: '' },
            ].map((step, idx) => (
              <div key={step.label} className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step.done ? 'bg-[#d4a5a5] text-white' : 'bg-white text-[#8b6f63]/30 border border-[#f5e6e0]'}`}>
                  {step.done ? <CheckCircle size={16} /> : <span className="text-xs">{idx + 1}</span>}
                </div>
                <div className="flex-1">
                  <p className={`text-sm ${step.done ? 'text-[#8b6f63] font-medium' : 'text-[#8b6f63]/50'}`}>{step.label}</p>
                </div>
                <span className="text-xs text-[#8b6f63]/50">{step.date}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <button
            onClick={() => navigate('order-tracking')}
            className="px-8 py-3 bg-[#d4a5a5] text-white rounded-full hover:bg-[#c89a9a] transition-all flex items-center justify-center gap-2"
          >
            <Package size={18} />
            Track Order
          </button>
          <button
            onClick={() => navigate('products')}
            className="px-8 py-3 border-2 border-[#d4a5a5] text-[#d4a5a5] rounded-full hover:bg-[#d4a5a5] hover:text-white transition-all flex items-center justify-center gap-2"
          >
            Continue Shopping
            <ArrowRight size={18} />
          </button>
        </motion.div>
      </div>
    </div>
  );
}
