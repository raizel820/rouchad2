'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { useStore, type Product } from '@/store/store';
import {
  CheckCircle,
  Package,
  ArrowRight,
  Truck,
  Gift,
  Printer,
  Share2,
  ChevronDown,
  MapPin,
  CreditCard,
  Clock,
  Star,
  Sparkles,
  Tag,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';

// ── Interfaces ──────────────────────────────────────────────────────────────

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  originalPrice?: number;
  discountAmount?: number;
  color?: string | null;
  product?: { name: string; image: string; id: string };
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  subtotal: number;
  discountTotal: number;
  tax: number;
  shipping: number;
  promoCode?: string | null;
  trackingNumber?: string;
  createdAt: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  paymentMethod: string;
  orderItems: OrderItem[];
}

// ── Confetti Particle ───────────────────────────────────────────────────────

function ConfettiParticle({ delay, x, y, color, size }: { delay: number; x: number; y: number; color: string; size: number }) {
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{
        width: size,
        height: size,
        backgroundColor: color,
        left: '50%',
        top: '50%',
      }}
      initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
      animate={{
        x: [0, x * 0.6, x],
        y: [0, y * 0.4 - 40, y],
        opacity: [1, 1, 0],
        scale: [0, 1.2, 0.5],
        rotate: [0, 180, 360],
      }}
      transition={{
        duration: 1.4,
        delay,
        ease: 'easeOut',
      }}
    />
  );
}

// ── Animated Checkmark SVG ──────────────────────────────────────────────────

function AnimatedCheckmark() {
  return (
    <div className="relative w-28 h-28 mx-auto">
      {/* Glow ring */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{ background: 'conic-gradient(from 0deg, #22c55e, #4ade80, #86efac, #22c55e)' }}
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: [0, 0.3, 0.1], scale: [0.5, 1.2, 1] }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
      />
      {/* Circle */}
      <svg className="w-28 h-28" viewBox="0 0 112 112">
        <motion.circle
          cx="56"
          cy="56"
          r="50"
          fill="#f0fdf4"
          stroke="#22c55e"
          strokeWidth="4"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
        />
        {/* Checkmark */}
        <motion.path
          d="M34 56 L50 72 L78 42"
          fill="none"
          stroke="#22c55e"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.4, delay: 0.5, ease: 'easeOut' }}
        />
      </svg>
    </div>
  );
}

// ── Sparkle Particles ───────────────────────────────────────────────────────

function SparkleParticles() {
  const particles = useMemo(() => {
    const colors = ['#22c55e', '#d4a5a5', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4'];
    return Array.from({ length: 24 }, (_, i) => ({
      id: i,
      x: (Math.random() - 0.5) * 300,
      y: (Math.random() - 0.5) * 300 - 60,
      color: colors[i % colors.length],
      size: Math.random() * 8 + 4,
      delay: Math.random() * 0.5,
    }));
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <ConfettiParticle key={p.id} {...p} />
      ))}
    </div>
  );
}

// ── Progress Tracker ────────────────────────────────────────────────────────

const STEPS = [
  { label: 'Order Placed', icon: Package, active: true },
  { label: 'Processing', icon: Clock, active: false },
  { label: 'Shipped', icon: Truck, active: false },
  { label: 'Delivered', icon: CheckCircle, active: false },
];

function ProgressTracker() {
  return (
    <motion.div
      className="bg-[#fef5f1] dark:bg-[#3d2f34] rounded-2xl p-6 mb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.9 }}
    >
      <h3 className="text-sm font-semibold text-[#8b6f63] dark:text-[#e8ddd5] mb-6 flex items-center gap-2">
        <Truck size={16} className="text-[#d4a5a5]" />
        Order Progress
      </h3>
      <div className="relative">
        {/* Progress line background */}
        <div className="absolute top-6 left-6 right-6 h-1 bg-[#e8ddd5] dark:bg-[#4d3f44] rounded-full" />
        {/* Animated fill */}
        <motion.div
          className="absolute top-6 left-6 h-1 bg-[#d4a5a5] rounded-full"
          initial={{ width: 0 }}
          animate={{ width: 'calc((100% - 48px) / 3)' }}
          transition={{ duration: 1.2, delay: 1.2, ease: 'easeOut' }}
        />
        {/* Steps */}
        <div className="flex justify-between relative">
          {STEPS.map((step, idx) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.label}
                className="flex flex-col items-center gap-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.0 + idx * 0.15 }}
              >
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                    step.active
                      ? 'bg-[#d4a5a5] text-white shadow-lg shadow-[#d4a5a5]/30'
                      : 'bg-white dark:bg-[#4d3f44] text-[#8b6f63]/40 dark:text-[#e8ddd5]/40 border-2 border-[#e8ddd5] dark:border-[#5d4f54]'
                  }`}
                >
                  <Icon size={20} />
                </div>
                <span
                  className={`text-xs font-medium text-center ${
                    step.active
                      ? 'text-[#8b6f63] dark:text-[#e8ddd5]'
                      : 'text-[#8b6f63]/50 dark:text-[#e8ddd5]/40'
                  }`}
                >
                  {step.label}
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}

// ── Order Item Row ──────────────────────────────────────────────────────────

function OrderItemRow({ item }: { item: OrderItem }) {
  return (
    <div className="flex items-center gap-4 py-3">
      {/* Thumbnail */}
      <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-[#fef5f1] dark:bg-[#3d2f34]">
        {item.product?.image ? (
          <img
            src={item.product.image}
            alt={item.product?.name || 'Product'}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package size={20} className="text-[#d4a5a5]/40" />
          </div>
        )}
      </div>
      {/* Details */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[#8b6f63] dark:text-[#e8ddd5] truncate">
          {item.product?.name || 'Product'}
        </p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-[#8b6f63]/60 dark:text-[#e8ddd5]/50">Qty: {item.quantity}</span>
          {item.color && item.color !== 'default' && (
            <span className="flex items-center gap-1">
              <span
                className="w-3 h-3 rounded-full border border-gray-200 dark:border-gray-600 inline-block"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-xs text-[#8b6f63]/60 dark:text-[#e8ddd5]/50">{item.color}</span>
            </span>
          )}
          {item.originalPrice && item.originalPrice > item.price && (
            <span className="text-xs text-red-400 font-medium">
              -{item.discountAmount?.toFixed(2) || ((item.originalPrice - item.price) * item.quantity).toFixed(2)}
            </span>
          )}
        </div>
      </div>
      {/* Price */}
      <div className="text-right flex-shrink-0">
        <p className="text-sm font-semibold text-[#8b6f63] dark:text-[#e8ddd5]">
          ${(item.price * item.quantity).toFixed(2)}
        </p>
        {item.originalPrice && item.originalPrice > item.price && (
          <p className="text-xs text-[#8b6f63]/40 dark:text-[#e8ddd5]/30 line-through">
            ${(item.originalPrice * item.quantity).toFixed(2)}
          </p>
        )}
      </div>
    </div>
  );
}

// ── Recommendation Card ─────────────────────────────────────────────────────

function RecommendationCard({ product }: { product: Product }) {
  const { navigate, setProductId } = useStore();

  return (
    <motion.div
      className="flex-shrink-0 w-48 cursor-pointer group"
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      onClick={() => {
        setProductId(product.id);
        navigate('product-detail');
      }}
    >
      <div className="w-48 h-48 rounded-2xl overflow-hidden bg-[#fef5f1] dark:bg-[#3d2f34] mb-3">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <p className="text-sm font-medium text-[#8b6f63] dark:text-[#e8ddd5] truncate">{product.name}</p>
      <div className="flex items-center gap-2 mt-1">
        {product.onSale && product.discountedPrice ? (
          <>
            <span className="text-sm font-bold text-red-500">${product.discountedPrice.toFixed(2)}</span>
            <span className="text-xs text-[#8b6f63]/40 line-through">${product.price.toFixed(2)}</span>
          </>
        ) : (
          <span className="text-sm font-bold text-[#8b6f63] dark:text-[#e8ddd5]">${product.price.toFixed(2)}</span>
        )}
      </div>
    </motion.div>
  );
}

// ── Accordion Section ───────────────────────────────────────────────────────

function AccordionSection({
  title,
  icon: Icon,
  children,
  defaultOpen = false,
}: {
  title: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border border-[#f5e6e0]/60 dark:border-[#4d3f44] rounded-xl overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-[#fef5f1]/60 dark:hover:bg-[#3d2f34]/60 transition-colors"
      >
        <span className="flex items-center gap-2 text-sm font-semibold text-[#8b6f63] dark:text-[#e8ddd5]">
          <Icon size={16} className="text-[#d4a5a5]" />
          {title}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown size={16} className="text-[#8b6f63]/50" />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-1">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Main Component ──────────────────────────────────────────────────────────

export function OrderConfirmationPage() {
  const { lastOrderId, navigate, addToast } = useStore();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState<Product[]>([]);

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

  useEffect(() => {
    fetch('/api/products?limit=4')
      .then((r) => r.json())
      .then((data: Product[]) => {
        if (Array.isArray(data)) setRecommendations(data);
      })
      .catch(() => {});
  }, []);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  const handleShare = useCallback(async () => {
    if (!order) return;
    const summary = [
      `📦 Order ${order.orderNumber}`,
      `💰 Total: $${order.total.toFixed(2)}`,
      `📅 ${new Date(order.createdAt).toLocaleDateString()}`,
      '',
      order.orderItems.map((item) => `• ${item.product?.name || 'Product'} x${item.quantity} — $${(item.price * item.quantity).toFixed(2)}`).join('\n'),
    ].join('\n');

    try {
      await navigator.clipboard.writeText(summary);
      addToast('Order summary copied to clipboard!', 'success');
    } catch {
      addToast('Could not copy to clipboard', 'error');
    }
  }, [order, addToast]);

  const estimatedDelivery = useMemo(() => {
    if (!order) return '';
    const date = new Date(order.createdAt);
    date.setDate(date.getDate() + 5);
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  }, [order]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="animate-pulse space-y-4 max-w-2xl mx-auto">
          <div className="w-28 h-28 bg-[#fef5f1] dark:bg-[#3d2f34] rounded-full mx-auto" />
          <div className="h-8 bg-[#fef5f1] dark:bg-[#3d2f34] rounded-lg w-3/4 mx-auto" />
          <div className="h-4 bg-[#fef5f1] dark:bg-[#3d2f34] rounded-lg w-1/2 mx-auto" />
          <div className="h-64 bg-[#fef5f1] dark:bg-[#3d2f34] rounded-2xl mx-auto" />
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl text-[#8b6f63] dark:text-[#e8ddd5] mb-4">Order not found</h1>
        <button onClick={() => navigate('home')} className="text-[#d4a5a5] hover:underline">
          Back to Home
        </button>
      </div>
    );
  }

  const hasDiscount = order.discountTotal > 0;
  const hasPromo = !!order.promoCode;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fef5f1] via-white to-[#fef5f1] dark:from-[#2d1f24] dark:via-[#2a2025] dark:to-[#2d1f24] transition-colors">
      <div className="container mx-auto px-4 py-12 sm:py-16">
        <div className="max-w-2xl mx-auto">
          {/* ── Success Animation ─────────────────────────────────────── */}
          <div className="relative text-center mb-8">
            {/* Animated background gradient */}
            <motion.div
              className="absolute inset-0 -z-10 rounded-3xl"
              style={{
                background: 'radial-gradient(ellipse at center, rgba(34,197,94,0.08) 0%, transparent 70%)',
              }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1.5 }}
              transition={{ duration: 1.5, ease: 'easeOut' }}
            />

            {/* Confetti / Sparkle particles */}
            <SparkleParticles />

            {/* Animated Checkmark */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            >
              <AnimatedCheckmark />
            </motion.div>

            {/* Text with spring animation */}
            <motion.h1
              className="text-3xl sm:text-4xl font-serif text-[#8b6f63] dark:text-[#e8ddd5] mb-2 mt-4"
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 150, damping: 12, delay: 0.7 }}
            >
              Order Confirmed! 🎉
            </motion.h1>
            <motion.p
              className="text-[#8b6f63]/70 dark:text-[#e8ddd5]/60 text-sm sm:text-base"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0 }}
            >
              Thank you for your purchase! We&apos;ll send a confirmation to{' '}
              <span className="font-medium text-[#8b6f63] dark:text-[#e8ddd5]">{order.email}</span>
            </motion.p>
          </div>

          {/* ── Order Summary Card ────────────────────────────────────── */}
          <motion.div
            className="bg-white dark:bg-[#3d2f34] rounded-2xl shadow-sm border border-[#f5e6e0]/60 dark:border-[#4d3f44] overflow-hidden mb-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
          >
            <div className="p-6 sm:p-8">
              {/* Order header info */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Package size={18} className="text-[#d4a5a5]" />
                    <h2 className="text-lg font-serif text-[#8b6f63] dark:text-[#e8ddd5]">Order Summary</h2>
                  </div>
                  <p className="text-xs text-[#8b6f63]/50 dark:text-[#e8ddd5]/40">
                    {new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-[#8b6f63]/50 dark:text-[#e8ddd5]/40">Order Number</p>
                  <p className="text-sm font-mono font-semibold text-[#8b6f63] dark:text-[#e8ddd5]">{order.orderNumber}</p>
                </div>
              </div>

              {/* Estimated delivery */}
              <motion.div
                className="bg-[#fef5f1] dark:bg-[#2d1f24] rounded-xl p-4 mb-6 flex items-center gap-3"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.0 }}
              >
                <div className="w-10 h-10 rounded-full bg-[#d4a5a5]/10 flex items-center justify-center flex-shrink-0">
                  <Truck size={18} className="text-[#d4a5a5]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-[#8b6f63] dark:text-[#e8ddd5]">Estimated Delivery</p>
                  <p className="text-xs text-[#8b6f63]/60 dark:text-[#e8ddd5]/50">{estimatedDelivery}</p>
                </div>
              </motion.div>

              {/* Order items */}
              {order.orderItems && order.orderItems.length > 0 && (
                <div className="divide-y divide-[#f5e6e0]/40 dark:divide-[#4d3f44]/40 mb-6">
                  {order.orderItems.map((item) => (
                    <OrderItemRow key={item.id} item={item} />
                  ))}
                </div>
              )}

              {/* Pricing breakdown */}
              <div className="border-t border-[#f5e6e0]/40 dark:border-[#4d3f44]/40 pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-[#8b6f63]/60 dark:text-[#e8ddd5]/50">Subtotal</span>
                  <span className="text-[#8b6f63] dark:text-[#e8ddd5]">${order.subtotal.toFixed(2)}</span>
                </div>
                {hasDiscount && (
                  <div className="flex justify-between text-sm">
                    <span className="text-red-400 flex items-center gap-1">
                      <Tag size={14} />
                      Sale Savings
                    </span>
                    <span className="text-red-400 font-medium">-${order.discountTotal.toFixed(2)}</span>
                  </div>
                )}
                {hasPromo && (
                  <div className="flex justify-between text-sm">
                    <span className="text-green-600 flex items-center gap-1">
                      <Gift size={14} />
                      Promo Code ({order.promoCode})
                    </span>
                    <span className="text-green-600 font-medium">Applied</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-[#8b6f63]/60 dark:text-[#e8ddd5]/50">Shipping</span>
                  <span className="text-[#8b6f63] dark:text-[#e8ddd5]">
                    {order.shipping === 0 ? (
                      <span className="flex items-center gap-1 text-green-600 font-medium">
                        <CheckCircle size={14} /> Free
                      </span>
                    ) : (
                      `$${order.shipping.toFixed(2)}`
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#8b6f63]/60 dark:text-[#e8ddd5]/50">Tax</span>
                  <span className="text-[#8b6f63] dark:text-[#e8ddd5]">${order.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between pt-3 border-t border-[#f5e6e0]/40 dark:border-[#4d3f44]/40">
                  <span className="text-lg font-bold text-[#8b6f63] dark:text-[#e8ddd5]">Total</span>
                  <span className="text-lg font-bold text-[#8b6f63] dark:text-[#e8ddd5]">${order.total.toFixed(2)}</span>
                </div>
              </div>

              {/* Shipping address summary */}
              <div className="mt-6 flex items-start gap-3 p-4 bg-[#fef5f1]/50 dark:bg-[#2d1f24]/50 rounded-xl">
                <MapPin size={16} className="text-[#d4a5a5] mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-[#8b6f63]/60 dark:text-[#e8ddd5]/50 uppercase tracking-wide mb-1">Shipping To</p>
                  <p className="text-sm text-[#8b6f63] dark:text-[#e8ddd5]">
                    {order.firstName} {order.lastName}
                  </p>
                  <p className="text-xs text-[#8b6f63]/60 dark:text-[#e8ddd5]/50">
                    {order.address}, {order.city}, {order.state} {order.zipCode}
                  </p>
                </div>
              </div>

              {/* Payment method summary */}
              <div className="mt-3 flex items-start gap-3 p-4 bg-[#fef5f1]/50 dark:bg-[#2d1f24]/50 rounded-xl">
                <CreditCard size={16} className="text-[#d4a5a5] mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-[#8b6f63]/60 dark:text-[#e8ddd5]/50 uppercase tracking-wide mb-1">Payment Method</p>
                  <p className="text-sm text-[#8b6f63] dark:text-[#e8ddd5] capitalize">{order.paymentMethod.replace(/_/g, ' ')}</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* ── Progress Tracker ──────────────────────────────────────── */}
          <ProgressTracker />

          {/* ── Action Buttons ────────────────────────────────────────── */}
          <motion.div
            className="grid grid-cols-2 gap-3 mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4 }}
          >
            <motion.button
              onClick={() => navigate('order-tracking')}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-[#d4a5a5] text-white rounded-xl font-medium text-sm hover:bg-[#c89a9a] transition-colors shadow-lg shadow-[#d4a5a5]/20"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Package size={16} />
              Track Order
            </motion.button>
            <motion.button
              onClick={() => navigate('products')}
              className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-[#d4a5a5] text-[#d4a5a5] rounded-xl font-medium text-sm hover:bg-[#d4a5a5] hover:text-white transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Continue Shopping
              <ArrowRight size={16} />
            </motion.button>
            <motion.button
              onClick={handlePrint}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-[#fef5f1] dark:bg-[#3d2f34] text-[#8b6f63] dark:text-[#e8ddd5] rounded-xl font-medium text-sm hover:bg-[#f5e6e0] dark:hover:bg-[#4d3f44] transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Printer size={16} />
              Print Receipt
            </motion.button>
            <motion.button
              onClick={handleShare}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-[#fef5f1] dark:bg-[#3d2f34] text-[#8b6f63] dark:text-[#e8ddd5] rounded-xl font-medium text-sm hover:bg-[#f5e6e0] dark:hover:bg-[#4d3f44] transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Share2 size={16} />
              Share Order
            </motion.button>
          </motion.div>

          {/* ── Order Details Accordion ───────────────────────────────── */}
          <motion.div
            className="space-y-3 mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5 }}
          >
            <h3 className="text-sm font-semibold text-[#8b6f63] dark:text-[#e8ddd5] flex items-center gap-2 mb-2">
              <Sparkles size={16} className="text-[#d4a5a5]" />
              Order Details
            </h3>

            {/* Shipping Address */}
            <AccordionSection title="Shipping Address" icon={MapPin}>
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-[#8b6f63]/50 dark:text-[#e8ddd5]/40 text-xs">Name</span>
                    <p className="text-[#8b6f63] dark:text-[#e8ddd5]">{order.firstName} {order.lastName}</p>
                  </div>
                  <div>
                    <span className="text-[#8b6f63]/50 dark:text-[#e8ddd5]/40 text-xs">Phone</span>
                    <p className="text-[#8b6f63] dark:text-[#e8ddd5]">{order.phone}</p>
                  </div>
                </div>
                <div>
                  <span className="text-[#8b6f63]/50 dark:text-[#e8ddd5]/40 text-xs">Address</span>
                  <p className="text-[#8b6f63] dark:text-[#e8ddd5]">{order.address}</p>
                  <p className="text-[#8b6f63] dark:text-[#e8ddd5]">{order.city}, {order.state} {order.zipCode}, {order.country}</p>
                </div>
                <div>
                  <span className="text-[#8b6f63]/50 dark:text-[#e8ddd5]/40 text-xs">Email</span>
                  <p className="text-[#8b6f63] dark:text-[#e8ddd5]">{order.email}</p>
                </div>
              </div>
            </AccordionSection>

            {/* Payment Method */}
            <AccordionSection title="Payment Method" icon={CreditCard}>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-[#8b6f63]/50 dark:text-[#e8ddd5]/40 text-xs">Method</span>
                  <p className="text-[#8b6f63] dark:text-[#e8ddd5] capitalize">{order.paymentMethod.replace(/_/g, ' ')}</p>
                </div>
                {order.trackingNumber && (
                  <div>
                    <span className="text-[#8b6f63]/50 dark:text-[#e8ddd5]/40 text-xs">Tracking Number</span>
                    <p className="text-[#8b6f63] dark:text-[#e8ddd5] font-mono">{order.trackingNumber}</p>
                  </div>
                )}
              </div>
            </AccordionSection>

            {/* Order Items */}
            <AccordionSection title={`Order Items (${order.orderItems?.length || 0})`} icon={Package} defaultOpen>
              <div className="divide-y divide-[#f5e6e0]/30 dark:divide-[#4d3f44]/30">
                {order.orderItems?.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 py-3">
                    <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-[#fef5f1] dark:bg-[#2d1f24]">
                      {item.product?.image ? (
                        <img src={item.product.image} alt={item.product?.name || 'Product'} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package size={14} className="text-[#d4a5a5]/40" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-[#8b6f63] dark:text-[#e8ddd5] truncate">{item.product?.name || 'Product'}</p>
                      <div className="flex items-center gap-2 text-xs text-[#8b6f63]/50 dark:text-[#e8ddd5]/40">
                        <span>Qty: {item.quantity}</span>
                        {item.color && item.color !== 'default' && (
                          <span className="flex items-center gap-1">
                            <span className="w-2.5 h-2.5 rounded-full border border-gray-200 dark:border-gray-600" style={{ backgroundColor: item.color }} />
                            {item.color}
                          </span>
                        )}
                        {item.originalPrice && item.originalPrice > item.price && (
                          <span className="text-red-400">Sale: ${item.price.toFixed(2)}</span>
                        )}
                      </div>
                    </div>
                    <p className="text-sm font-semibold text-[#8b6f63] dark:text-[#e8ddd5]">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            </AccordionSection>

            {/* Promo Code */}
            {hasPromo && (
              <AccordionSection title="Promo Code Applied" icon={Gift}>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-3 py-2 rounded-lg border border-green-200 dark:border-green-800/30">
                    <Gift size={16} />
                    <span className="font-mono font-bold text-sm">{order.promoCode}</span>
                  </div>
                  {order.discountTotal > 0 && (
                    <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                      You saved ${order.discountTotal.toFixed(2)}!
                    </span>
                  )}
                </div>
              </AccordionSection>
            )}
          </motion.div>

          {/* ── Recommendations Section ───────────────────────────────── */}
          {recommendations.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.6 }}
            >
              <h3 className="text-lg font-serif text-[#8b6f63] dark:text-[#e8ddd5] mb-4 flex items-center gap-2">
                <Star size={18} className="text-[#d4a5a5]" />
                You Might Also Like
              </h3>
              <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide -mx-4 px-4">
                {recommendations.map((product, idx) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.7 + idx * 0.1 }}
                  >
                    <RecommendationCard product={product} />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Bottom spacer */}
          <div className="h-8" />
        </div>
      </div>
    </div>
  );
}
