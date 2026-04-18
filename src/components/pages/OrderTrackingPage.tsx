'use client';

import { useEffect, useState, useMemo } from 'react';
import Image from 'next/image';
import { useStore } from '@/store/store';
import { toast } from '@/lib/toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package,
  Clock,
  Truck,
  CheckCircle,
  XCircle,
  MapPin,
  CreditCard,
  Calendar,
  ArrowLeft,
  Loader2,
  AlertCircle,
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  color?: string | null;
  product?: { name: string; image: string; id: string } | null;
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  subtotal: number;
  tax: number;
  shipping: number;
  trackingNumber?: string | null;
  createdAt: string;
  updatedAt: string;
  paymentMethod: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  orderItems: OrderItem[];
}

type StepState = 'completed' | 'current' | 'pending';

interface TimelineStep {
  icon: React.ReactNode;
  title: string;
  description: string;
  dateLabel: string;
  getDate: (order: Order) => Date | null;
}

// ─── Status → active step index mapping ──────────────────────────────────────

const STATUS_STEP_MAP: Record<string, number> = {
  Pending: 0,
  Processing: 1,
  'In Transit': 2,
  Shipped: 2,
  Delivered: 3,
  Cancelled: -1,
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getStepState(stepIndex: number, activeStep: number): StepState {
  if (activeStep < 0) return 'pending';
  if (stepIndex < activeStep) return 'completed';
  if (stepIndex === activeStep) return 'current';
  return 'pending';
}

function getPaymentLabel(method: string): string {
  const map: Record<string, string> = {
    credit_card: 'Credit Card',
    debit_card: 'Debit Card',
    paypal: 'PayPal',
    apple_pay: 'Apple Pay',
    google_pay: 'Google Pay',
  };
  return map[method] || method.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

// ─── Timeline steps definition ──────────────────────────────────────────────

function useTimelineSteps(order: Order | null): TimelineStep[] {
  return useMemo(() => {
    if (!order) return [];
    return [
      {
        icon: <Package size={20} />,
        title: 'Order Placed',
        description: 'Your order has been confirmed and received.',
        dateLabel: 'Order date',
        getDate: (o) => new Date(o.createdAt),
      },
      {
        icon: <Clock size={20} />,
        title: 'Processing',
        description: 'We are preparing and packaging your items with care.',
        dateLabel: 'Processing started',
        getDate: (o) => {
          const created = new Date(o.createdAt);
          // Estimate processing started ~2 hours after order
          if (STATUS_STEP_MAP[o.status] >= 1 || o.status === 'Delivered') {
            return new Date(created.getTime() + 2 * 60 * 60 * 1000);
          }
          return null;
        },
      },
      {
        icon: <Truck size={20} />,
        title: 'Shipped / In Transit',
        description: 'Your package is on its way to you.',
        dateLabel: 'Shipped on',
        getDate: (o) => {
          const created = new Date(o.createdAt);
          if (STATUS_STEP_MAP[o.status] >= 2 || o.status === 'Delivered') {
            return new Date(created.getTime() + 24 * 60 * 60 * 1000);
          }
          return null;
        },
      },
      {
        icon: <CheckCircle size={20} />,
        title: 'Delivered',
        description: 'Your package has arrived at your delivery address.',
        dateLabel: 'Delivered on',
        getDate: (o) => {
          if (o.status === 'Delivered') {
            return new Date(o.updatedAt);
          }
          return null;
        },
      },
    ];
  }, [order]);
}

// ─── Animation variants ─────────────────────────────────────────────────────

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { type: 'spring', stiffness: 120, damping: 20 },
  },
};

const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 100, damping: 20 },
  },
};

// ─── Sub-Components ──────────────────────────────────────────────────────────

function CancellationBanner() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full rounded-xl border border-red-200 bg-red-50 dark:border-red-900/40 dark:bg-red-950/40 p-5 flex items-start gap-4"
    >
      <div className="flex-shrink-0 mt-0.5">
        <XCircle size={28} className="text-red-500" />
      </div>
      <div>
        <h3 className="text-lg font-semibold text-red-700 dark:text-red-400 mb-1">
          Order Cancelled
        </h3>
        <p className="text-sm text-red-600/80 dark:text-red-400/70">
          This order has been cancelled. If you believe this is an error, please contact our support team.
        </p>
      </div>
    </motion.div>
  );
}

function TimelineStepCard({
  step,
  state,
  isLast,
}: {
  step: TimelineStep;
  state: StepState;
  isLast: boolean;
}) {
  const isCompleted = state === 'completed';
  const isCurrent = state === 'current';
  const isPending = state === 'pending';

  return (
    <motion.div className="relative flex gap-5" variants={itemVariants}>
      {/* Left: circle + line */}
      <div className="flex flex-col items-center">
        {/* Circle */}
        <div className="relative flex-shrink-0">
          {/* Pulse ring for current step */}
          {isCurrent && (
            <span className="absolute inset-0 rounded-full animate-ping bg-[#d4a5a5]/40" />
          )}
          <div
            className={`relative w-12 h-12 rounded-full flex items-center justify-center transition-colors duration-300 z-10 ${
              isCompleted
                ? 'bg-[#d4a5a5] text-white shadow-lg shadow-[#d4a5a5]/30'
                : isCurrent
                  ? 'bg-[#d4a5a5] text-white shadow-lg shadow-[#d4a5a5]/40 ring-4 ring-[#d4a5a5]/20'
                  : 'bg-gray-100 dark:bg-[#3d2f34] text-gray-400 dark:text-[#a89898]'
            }`}
          >
            {isCompleted ? <CheckCircle size={20} /> : step.icon}
          </div>
        </div>

        {/* Connecting line */}
        {!isLast && (
          <div
            className={`w-0.5 flex-1 min-h-[3rem] transition-colors duration-300 ${
              isCompleted
                ? 'bg-[#d4a5a5]'
                : 'border-l-2 border-dashed border-gray-300 dark:border-[#a89898]/40'
            }`}
          />
        )}
      </div>

      {/* Right: content */}
      <div className={`pb-10 ${isLast ? 'pb-0' : ''}`}>
        <h4
          className={`text-base font-semibold transition-colors duration-300 ${
            isCompleted || isCurrent
              ? 'text-[#8b6f63] dark:text-[#e8ddd5]'
              : 'text-gray-400 dark:text-[#a89898]'
          }`}
        >
          {step.title}
        </h4>
        <p
          className={`text-sm mt-1 leading-relaxed transition-colors duration-300 ${
            isCompleted || isCurrent
              ? 'text-[#8b6f63]/70 dark:text-[#e8ddd5]/70'
              : 'text-gray-400/70 dark:text-[#a89898]/60'
          }`}
        >
          {step.description}
        </p>
        {isCurrent && (
          <span className="inline-block mt-2 text-xs font-medium text-[#d4a5a5] bg-[#d4a5a5]/10 dark:bg-[#d4a5a5]/15 dark:text-[#d4a5a5] px-2.5 py-1 rounded-full">
            Current Status
          </span>
        )}
      </div>
    </motion.div>
  );
}

function OrderDetailsCard({ order }: { order: Order }) {
  return (
    <motion.div
      className="rounded-xl border border-[#f5e6e0] bg-white dark:border-[#3d2f34] dark:bg-[#2d1f24] overflow-hidden"
      variants={fadeInUp}
    >
      {/* Header */}
      <div className="px-6 py-4 border-b border-[#f5e6e0] dark:border-[#3d2f34] flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs text-[#8b6f63]/50 dark:text-[#e8ddd5]/40 uppercase tracking-wider">
            Order Number
          </p>
          <p className="text-sm font-semibold text-[#8b6f63] dark:text-[#e8ddd5] font-mono mt-0.5">
            {order.orderNumber}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-[#8b6f63]/50 dark:text-[#e8ddd5]/40 uppercase tracking-wider">
            Date
          </p>
          <p className="text-sm text-[#8b6f63] dark:text-[#e8ddd5] mt-0.5">
            {formatDate(new Date(order.createdAt))}
          </p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      {/* Body */}
      <div className="p-6 space-y-6">
        {/* Items */}
        {order.orderItems && order.orderItems.length > 0 && (
          <div>
            <h4 className="text-xs text-[#8b6f63]/50 dark:text-[#e8ddd5]/40 uppercase tracking-wider mb-3">
              Items
            </h4>
            <div className="space-y-3 max-h-64 overflow-y-auto pr-1 custom-scrollbar">
              {order.orderItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-[#fef5f1]/60 dark:bg-[#3d2f34]/50"
                >
                  {/* Product image */}
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-[#f5e6e0] dark:bg-[#4d3f44] flex-shrink-0">
                    {item.product?.image ? (
                      <Image
                        src={item.product.image}
                        alt={item.product.name || 'Product'}
                        width={48}
                        height={48}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-lg">
                        💄
                      </div>
                    )}
                  </div>
                  {/* Product info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-[#8b6f63] dark:text-[#e8ddd5] truncate">
                        {item.product?.name || 'Product'}
                      </p>
                      {item.color && item.color !== 'default' && (
                        <span className="w-4 h-4 rounded-full border border-gray-200 dark:border-gray-600 flex-shrink-0" style={{ backgroundColor: item.color }} title={item.color} />
                      )}
                    </div>
                    <p className="text-xs text-[#8b6f63]/50 dark:text-[#e8ddd5]/50">
                      Qty: {item.quantity} &middot; ${item.price.toFixed(2)} each
                      {item.color && item.color !== 'default' && <span className="ml-1.5">· <span className="font-mono text-[#d4a5a5] dark:text-[#d4a5a5]">{item.color}</span></span>}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-[#8b6f63] dark:text-[#e8ddd5] flex-shrink-0">
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Shipping address */}
        <div>
          <h4 className="text-xs text-[#8b6f63]/50 dark:text-[#e8ddd5]/40 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <MapPin size={13} /> Shipping Address
          </h4>
          <div className="text-sm text-[#8b6f63] dark:text-[#e8ddd5]/80 leading-relaxed bg-[#fef5f1]/40 dark:bg-[#3d2f34]/30 rounded-lg p-3">
            <p className="font-medium">
              {order.firstName} {order.lastName}
            </p>
            <p className="mt-0.5">{order.address}</p>
            <p>
              {order.city}, {order.state} {order.zipCode}
            </p>
            <p>{order.country}</p>
          </div>
        </div>

        {/* Payment & total */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <h4 className="text-xs text-[#8b6f63]/50 dark:text-[#e8ddd5]/40 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <CreditCard size={13} /> Payment Method
            </h4>
            <div className="text-sm text-[#8b6f63] dark:text-[#e8ddd5]/80 bg-[#fef5f1]/40 dark:bg-[#3d2f34]/30 rounded-lg p-3">
              {getPaymentLabel(order.paymentMethod)}
            </div>
          </div>
          <div>
            <h4 className="text-xs text-[#8b6f63]/50 dark:text-[#e8ddd5]/40 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Calendar size={13} /> Order Total
            </h4>
            <div className="bg-[#fef5f1]/40 dark:bg-[#3d2f34]/30 rounded-lg p-3 space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="text-[#8b6f63]/60 dark:text-[#e8ddd5]/50">Subtotal</span>
                <span className="text-[#8b6f63] dark:text-[#e8ddd5]">${order.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#8b6f63]/60 dark:text-[#e8ddd5]/50">Tax</span>
                <span className="text-[#8b6f63] dark:text-[#e8ddd5]">${order.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#8b6f63]/60 dark:text-[#e8ddd5]/50">Shipping</span>
                <span className="text-[#8b6f63] dark:text-[#e8ddd5]">
                  {order.shipping === 0 ? 'Free' : `$${order.shipping.toFixed(2)}`}
                </span>
              </div>
              <div className="border-t border-[#f5e6e0] dark:border-[#3d2f34] pt-2 mt-2 flex justify-between">
                <span className="text-sm font-semibold text-[#8b6f63] dark:text-[#e8ddd5]">Total</span>
                <span className="text-base font-bold text-[#d4a5a5] dark:text-[#d4a5a5]">
                  ${order.total.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tracking number */}
        {order.trackingNumber && (
          <div>
            <h4 className="text-xs text-[#8b6f63]/50 dark:text-[#e8ddd5]/40 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Truck size={13} /> Tracking Number
            </h4>
            <p className="text-sm font-mono text-[#d4a5a5] dark:text-[#d4a5a5] bg-[#d4a5a5]/10 dark:bg-[#d4a5a5]/10 rounded-lg px-3 py-2 inline-block">
              {order.trackingNumber}
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; className: string }> = {
    Pending: {
      label: 'Pending',
      className:
        'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800/40',
    },
    Processing: {
      label: 'Processing',
      className:
        'bg-[#fef5f1] text-[#8b6f63] border border-[#f5e6e0] dark:bg-[#2d1f24] dark:text-[#e8ddd5] dark:border-[#3d2f34]',
    },
    'In Transit': {
      label: 'In Transit',
      className:
        'bg-sky-50 text-sky-700 border border-sky-200 dark:bg-sky-900/20 dark:text-sky-400 dark:border-sky-800/40',
    },
    Shipped: {
      label: 'Shipped',
      className:
        'bg-sky-50 text-sky-700 border border-sky-200 dark:bg-sky-900/20 dark:text-sky-400 dark:border-sky-800/40',
    },
    Delivered: {
      label: 'Delivered',
      className:
        'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800/40',
    },
    Cancelled: {
      label: 'Cancelled',
      className:
        'bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800/40',
    },
  };

  const c = config[status] || {
    label: status,
    className:
      'bg-gray-50 text-gray-700 border border-gray-200 dark:bg-gray-800/20 dark:text-gray-400 dark:border-gray-700/40',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${c.className}`}
    >
      {status === 'Delivered' && <CheckCircle size={13} />}
      {status === 'Cancelled' && <XCircle size={13} />}
      {c.label}
    </span>
  );
}

function EmptyState() {
  const { navigate } = useStore();
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center py-20"
    >
      <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[#fef5f1] dark:bg-[#2d1f24] flex items-center justify-center">
        <Package size={36} className="text-[#d4a5a5]/60" />
      </div>
      <h3 className="text-xl font-serif text-[#8b6f63] dark:text-[#e8ddd5] mb-2">
        No Order to Track
      </h3>
      <p className="text-sm text-[#8b6f63]/60 dark:text-[#e8ddd5]/50 max-w-sm mx-auto mb-6">
        You haven&apos;t placed an order yet, or the order link has expired. Start shopping to see your order status here.
      </p>
      <button
        onClick={() => navigate('products')}
        className="inline-flex items-center gap-2 px-6 py-3 bg-[#d4a5a5] text-white rounded-full hover:bg-[#c89a9a] transition-all active:scale-[0.98] shadow-md shadow-[#d4a5a5]/20"
      >
        Browse Products
      </button>
      <div className="mt-6">
        <button
          onClick={() => navigate('home')}
          className="inline-flex items-center gap-2 text-sm text-[#8b6f63]/60 dark:text-[#e8ddd5]/50 hover:text-[#d4a5a5] dark:hover:text-[#d4a5a5] transition-colors"
        >
          <ArrowLeft size={14} />
          Back to Home
        </button>
      </div>
    </motion.div>
  );
}

function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <Loader2 size={36} className="animate-spin text-[#d4a5a5]" />
      <p className="mt-4 text-sm text-[#8b6f63]/60 dark:text-[#e8ddd5]/50">
        Loading order details...
      </p>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────

export function OrderTrackingPage() {
  const { lastOrderId, navigate } = useStore();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const timelineSteps = useTimelineSteps(order);
  const activeStep = order ? STATUS_STEP_MAP[order.status] ?? -1 : -1;
  const isCancelled = order?.status === 'Cancelled';

  useEffect(() => {
    if (!lastOrderId) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    const fetchOrder = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`/api/orders/${lastOrderId}`);
        if (!res.ok) {
          setError('Order not found. It may have been removed or the link expired.');
          setOrder(null);
          return;
        }
        const data: Order = await res.json();
        setOrder(data);
      } catch {
        setError('Failed to load order details. Please try again later.');
        setOrder(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchOrder();
    return () => {
      cancelled = true;
    };
  }, [lastOrderId]);

  return (
    <div className="min-h-screen">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-[#fef5f1] to-[#f5e6e0] dark:from-[#2d1f24] dark:to-[#3d2f34] py-14">
        <div className="container mx-auto px-4 text-center">
          <motion.h1
            className="text-4xl font-serif text-[#8b6f63] dark:text-[#e8ddd5] mb-3"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Track Your Order
          </motion.h1>
          <motion.p
            className="text-[#8b6f63]/70 dark:text-[#e8ddd5]/50 max-w-md mx-auto text-sm"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            Follow the journey of your order from placement to delivery.
          </motion.p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Loading */}
        {loading && <LoadingState />}

        {/* Error */}
        {!loading && error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-lg mx-auto text-center"
          >
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-50 dark:bg-red-950/30 flex items-center justify-center">
              <AlertCircle size={36} className="text-red-400" />
            </div>
            <p className="text-red-600 dark:text-red-400 text-sm mb-6">{error}</p>
            <button
              onClick={() => navigate('home')}
              className="inline-flex items-center gap-2 text-sm text-[#8b6f63]/60 dark:text-[#e8ddd5]/50 hover:text-[#d4a5a5] dark:hover:text-[#d4a5a5] transition-colors"
            >
              <ArrowLeft size={14} />
              Back to Home
            </button>
          </motion.div>
        )}

        {/* Empty state: no lastOrderId */}
        {!loading && !error && !order && !lastOrderId && <EmptyState />}

        {/* Order loaded */}
        <AnimatePresence mode="wait">
          {!loading && order && (
            <motion.div
              key={order.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="max-w-5xl mx-auto space-y-8"
            >
              {/* Cancellation banner */}
              {isCancelled && <CancellationBanner />}

              {/* Two-column layout: timeline left, details right */}
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                {/* Timeline — takes 3/5 on desktop */}
                <div className="lg:col-span-3">
                  <motion.div
                    className="rounded-xl border border-[#f5e6e0] bg-white dark:border-[#3d2f34] dark:bg-[#2d1f24] p-6 md:p-8"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    <h3 className="text-lg font-serif text-[#8b6f63] dark:text-[#e8ddd5] mb-8">
                      Order Timeline
                    </h3>
                    <div>
                      {timelineSteps.map((step, idx) => {
                        const state = isCancelled
                          ? (idx === 0 ? 'completed' as StepState : 'pending' as StepState)
                          : getStepState(idx, activeStep);

                        return (
                          <TimelineStepCard
                            key={step.title}
                            step={{
                              ...step,
                              // Show real date if available
                              dateLabel: step.dateLabel,
                            }}
                            state={state}
                            isLast={idx === timelineSteps.length - 1}
                          />
                        );
                      })}
                    </div>
                  </motion.div>
                </div>

                {/* Order details — takes 2/5 on desktop */}
                <div className="lg:col-span-2">
                  <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={containerVariants}
                    transition={{ delay: 0.3 }}
                  >
                    <OrderDetailsCard order={order} />
                  </motion.div>

                  {/* Back to home link */}
                  <div className="mt-6 text-center lg:text-left">
                    <button
                      onClick={() => navigate('home')}
                      className="inline-flex items-center gap-2 text-sm text-[#8b6f63]/60 dark:text-[#e8ddd5]/50 hover:text-[#d4a5a5] dark:hover:text-[#d4a5a5] transition-colors"
                    >
                      <ArrowLeft size={14} />
                      Back to Home
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Custom scrollbar styles */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #d4a5a5;
          border-radius: 999px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #c89a9a;
        }
        @media (prefers-color-scheme: dark) {
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #5d4f54;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #6d5f64;
          }
        }
      `}</style>
    </div>
  );
}
