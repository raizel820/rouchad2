'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useStore, type Product } from '@/store/store';
import { Trash2, Plus, Minus, ShoppingBag, Heart, Shield, RotateCcw, Truck, Percent, Star, Check, Clock, Sparkles, Gift, ChevronRight, ChevronDown } from 'lucide-react';
import { toast } from '@/lib/toast';
import { motion, AnimatePresence } from 'framer-motion';

const FREE_SHIPPING_THRESHOLD = 50;

// ===== Animated Counter Hook =====
function useAnimatedValue(target: number, duration = 800) {
  const [displayValue, setDisplayValue] = useState(0);
  const prevTargetRef = useRef(target);

  useEffect(() => {
    const startValue = prevTargetRef.current;
    prevTargetRef.current = target;
    let startTime: number | null = null;
    let raf: number;

    const animate = (timestamp: number) => {
      if (startTime === null) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = startValue + (target - startValue) * eased;
      setDisplayValue(Math.round(current * 100) / 100);

      if (progress < 1) {
        raf = requestAnimationFrame(animate);
      }
    };

    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);

  return displayValue;
}

// ===== Quantity Controls Component =====
function QuantityControls({
  quantity,
  onIncrease,
  onDecrease,
  onRemove,
}: {
  quantity: number;
  onIncrease: () => void;
  onDecrease: () => void;
  onRemove: () => void;
}) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [bounceKey, setBounceKey] = useState(0);
  const [showCheckmark, setShowCheckmark] = useState(false);

  const handleDecrease = () => {
    if (quantity <= 1) {
      setShowConfirm(true);
      return;
    }
    onDecrease();
    setBounceKey((k) => k + 1);
  };

  const handleIncrease = () => {
    onIncrease();
    setBounceKey((k) => k + 1);
    setShowCheckmark(true);
    setTimeout(() => setShowCheckmark(false), 600);
  };

  const handleConfirmRemove = () => {
    setShowConfirm(false);
    onRemove();
  };

  return (
    <div className="flex items-center gap-2">
      <AnimatePresence>
        {showConfirm && (
          <motion.div
            className="absolute -top-10 left-1/2 -translate-x-1/2 z-20"
            initial={{ opacity: 0, y: 4, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.9 }}
          >
            <div className="bg-[#2d1f24] dark:bg-[#e8ddd5] text-white dark:text-[#2d1f24] text-xs rounded-lg px-3 py-2 shadow-lg whitespace-nowrap flex items-center gap-2">
              <span>Remove item?</span>
              <button
                onClick={handleConfirmRemove}
                className="text-red-400 dark:text-red-600 font-semibold hover:text-red-300 dark:hover:text-red-500"
              >
                Yes
              </button>
              <button
                onClick={() => setShowConfirm(false)}
                className="text-gray-400 dark:text-gray-500 hover:text-gray-200 dark:hover:text-gray-300"
              >
                No
              </button>
            </div>
            <div className="w-2 h-2 bg-[#2d1f24] dark:bg-[#e8ddd5] rotate-45 absolute -bottom-1 left-1/2 -translate-x-1/2" />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center gap-1.5 relative">
        <motion.button
          onClick={handleDecrease}
          disabled={quantity <= 1 && !showConfirm}
          className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 ${
            quantity <= 1
              ? 'bg-[#fef5f1] dark:bg-[#1a1215] text-[#8b6f63]/30 dark:text-[#e8ddd5]/30 cursor-not-allowed'
              : 'bg-[#fef5f1] dark:bg-[#1a1215] text-[#8b6f63] dark:text-[#e8ddd5] hover:bg-[#f5e6e0] dark:hover:bg-[#3d2f34] hover:shadow-md active:scale-90'
          }`}
          whileHover={quantity > 1 ? { scale: 1.1 } : {}}
          whileTap={quantity > 1 ? { scale: 0.85 } : {}}
        >
          <Minus size={15} strokeWidth={2.5} />
        </motion.button>

        <motion.div
          key={bounceKey}
          className="w-10 text-center text-[#8b6f63] dark:text-[#e8ddd5] font-semibold text-base relative"
          initial={{ scale: 1.3 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 15 }}
        >
          {quantity}
          <AnimatePresence>
            {showCheckmark && (
              <motion.div
                className="absolute -right-4 -top-1"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 20 }}
              >
                <Check size={12} className="text-green-500" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <motion.button
          onClick={handleIncrease}
          className="w-9 h-9 rounded-full bg-[#d4a5a5] text-white flex items-center justify-center hover:bg-[#c89a9a] hover:shadow-md transition-all duration-200 active:scale-90"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.85 }}
        >
          <Plus size={15} strokeWidth={2.5} />
        </motion.button>
      </div>

      <motion.button
        onClick={onRemove}
        className="w-9 h-9 rounded-full flex items-center justify-center text-[#8b6f63]/40 dark:text-[#e8ddd5]/30 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 ml-1"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.85 }}
        title="Remove item"
      >
        <Trash2 size={16} />
      </motion.button>
    </div>
  );
}

// ===== Savings Banner Component =====
function SavingsBanner({ totalSavings }: { totalSavings: number }) {
  const animatedTotal = useAnimatedValue(totalSavings);

  return (
    <motion.div
      className="relative overflow-hidden bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 dark:from-green-900/20 dark:via-emerald-900/20 dark:to-teal-900/20 border border-green-200/70 dark:border-green-800/50 rounded-xl p-4 mb-4"
      initial={{ opacity: 0, y: -10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
    >
      <div className="absolute top-1 right-3 pointer-events-none">
        <motion.div
          animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
        >
          <Sparkles size={16} className="text-green-400/60" />
        </motion.div>
      </div>

      <div className="flex items-center gap-2">
        <motion.div
          animate={{ rotate: [0, -10, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
        >
          <Gift size={16} className="text-green-600 dark:text-green-400" />
        </motion.div>
        <p className="text-sm text-green-700 dark:text-green-400 font-semibold">
          You&apos;re saving{' '}
          <motion.span
            className="text-green-800 dark:text-green-300 font-bold text-base"
            key={animatedTotal}
          >
            ${animatedTotal.toFixed(2)}
          </motion.span>
          {' '}on this order!
        </p>
      </div>
    </motion.div>
  );
}

// ===== Recommended Product Card =====
function RecommendedProductCard({ product, onAdd }: { product: Product; onAdd: (product: Product) => void }) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    onAdd(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  const displayPrice = product.discountedPrice || product.price;
  const isOnSale = product.onSale && product.effectiveDiscount && product.effectiveDiscount > 0;

  return (
    <motion.div
      className="bg-white dark:bg-[#2d1f24] rounded-xl overflow-hidden shadow-sm border border-[#f5e6e0]/50 dark:border-[#3d2f34]/50 flex-shrink-0 w-44 sm:w-48"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
    >
      <div className="relative aspect-square bg-[#fef5f1] dark:bg-[#3d2f34] overflow-hidden">
        {!imgError ? (
          <img
            src={product.image}
            alt={product.name}
            className={`w-full h-full object-cover transition-transform duration-500 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
            onError={() => setImgError(true)}
            onLoad={() => setImgLoaded(true)}
            loading="lazy"
          />
        ) : null}
        {(!imgLoaded || imgError) && (
          <div className="absolute inset-0 bg-gradient-to-br from-[#fef5f1] to-[#f5e6e0] dark:from-[#3d2f34] dark:to-[#2d1f24] flex items-center justify-center">
            <span className="text-3xl opacity-30">💄</span>
          </div>
        )}
        {isOnSale && product.effectiveDiscount && product.effectiveDiscount > 0 && (
          <div className="absolute top-2 left-2 bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full font-semibold flex items-center gap-0.5">
            <Percent size={8} />
            {product.effectiveDiscount}%
          </div>
        )}
      </div>
      <div className="p-3">
        <h4 className="text-sm text-[#8b6f63] dark:text-[#e8ddd5] font-medium line-clamp-1 mb-1">{product.name}</h4>
        <div className="flex items-center gap-1 mb-2">
          <Star size={11} className="fill-[#d4a5a5] text-[#d4a5a5]" />
          <span className="text-xs text-[#8b6f63]/70 dark:text-[#e8ddd5]/60">{product.rating}</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="text-sm text-[#8b6f63] dark:text-[#e8ddd5] font-semibold">${displayPrice.toFixed(2)}</span>
            {isOnSale && (
              <span className="text-xs text-[#8b6f63]/40 line-through">${product.price.toFixed(2)}</span>
            )}
          </div>
          <motion.button
            onClick={handleAdd}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
              added
                ? 'bg-green-500 text-white'
                : 'bg-[#d4a5a5] text-white hover:bg-[#c89a9a]'
            }`}
            whileHover={!added ? { scale: 1.1 } : {}}
            whileTap={!added ? { scale: 0.85 } : {}}
          >
            <AnimatePresence mode="wait">
              {added ? (
                <motion.div
                  key="check"
                  initial={{ scale: 0, rotate: -90 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0, rotate: 90 }}
                >
                  <Check size={14} />
                </motion.div>
              ) : (
                <motion.div
                  key="plus"
                  initial={{ scale: 0, rotate: 90 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0, rotate: -90 }}
                >
                  <Plus size={14} />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

// ===== Get Estimated Delivery Date =====
function getEstimatedDelivery() {
  const today = new Date();
  const deliveryDate = new Date(today);
  deliveryDate.setDate(today.getDate() + 5);
  return deliveryDate.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

// ===== Main CartPage Component =====
export function CartPage() {
  const { cartItems, removeFromCart, updateQuantity, getCartTotal, getCartOriginalTotal, navigate, toggleWishlist, isWishlisted, addToCart } = useStore();
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [fetchKey, setFetchKey] = useState(0);
  const [showMobileSummary, setShowMobileSummary] = useState(false);

  // Use fetchKey to trigger re-fetches without calling setState in effect
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch('/api/products?limit=6');
        const data = await res.json();
        if (cancelled) return;
        if (Array.isArray(data) && data.length > 0) {
          const cartIds = new Set(useStore.getState().cartItems.map((i) => i.id));
          const filtered = data.filter((p: Product) => !cartIds.has(p.id)).slice(0, 4);
          setRecommendations(filtered.length > 0 ? filtered : data.slice(0, 4));
        }
      } catch {
        // Silent fail
      }
    };
    load();
    return () => { cancelled = true; };
  }, [fetchKey]);

  const refreshRecommendations = useCallback(() => {
    setFetchKey((k) => k + 1);
  }, []);

  const handleRemove = (productId: string, productName: string, selectedColor?: string) => {
    removeFromCart(productId, selectedColor);
    toast(`${productName} removed from cart`);
    // Refresh recommendations after a short delay
    setTimeout(refreshRecommendations, 500);
  };

  const handleSaveForLater = (productId: string, productName: string) => {
    toggleWishlist(productId);
    const now = isWishlisted(productId);
    toast(now ? `${productName} saved to wishlist` : `${productName} removed from wishlist`);
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      toast('Your cart is empty', 'error');
      return;
    }
    navigate('checkout');
  };

  const handleAddRecommended = (product: Product) => {
    const { addToCart: addFn } = useStore.getState();
    addFn({
      id: product.id,
      name: product.name,
      price: product.discountedPrice || product.price,
      originalPrice: product.onSale ? product.price : undefined,
      image: product.image,
      category: product.category,
      quantity: 1,
      selectedColor: 'default',
      saleName: product.saleName,
      effectiveDiscount: product.effectiveDiscount || undefined,
    });
    toast(`${product.name} added to cart!`);
  };

  const subtotal = getCartTotal();
  const originalSubtotal = getCartOriginalTotal();
  const totalSavings = Math.round((originalSubtotal - subtotal) * 100) / 100;
  const tax = subtotal * 0.1;
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : 5.99;
  const total = subtotal + shipping + tax;
  const shippingProgress = Math.min((subtotal / FREE_SHIPPING_THRESHOLD) * 100, 100);
  const remainingForFreeShipping = Math.max(FREE_SHIPPING_THRESHOLD - subtotal, 0);
  const qualifiesForFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD;

  // ===== EMPTY CART STATE =====
  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12 min-h-screen">
        <div className="text-center py-16 max-w-lg mx-auto">
          <motion.div
            className="w-32 h-32 bg-[#fef5f1] dark:bg-[#2d1f24] rounded-full mx-auto mb-8 flex items-center justify-center relative"
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.1, 0.95, 1] }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            <motion.div
              initial={{ y: 0 }}
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            >
              <ShoppingBag size={48} className="text-[#d4a5a5]" />
            </motion.div>
            {/* Subtle ring pulse */}
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-[#d4a5a5]/20"
              animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            />
          </motion.div>

          <motion.h1
            className="text-3xl font-serif text-[#8b6f63] dark:text-[#e8ddd5] mb-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Your Cart is Empty
          </motion.h1>
          <motion.p
            className="text-[#8b6f63]/60 dark:text-[#e8ddd5]/50 mb-8 text-lg"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            Looks like you haven&apos;t added anything to your cart yet
          </motion.p>
          <motion.button
            onClick={() => navigate('products')}
            className="px-8 py-3.5 bg-[#d4a5a5] text-white rounded-full hover:bg-[#c89a9a] transition-all font-medium shadow-lg shadow-[#d4a5a5]/25"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            whileHover={{ scale: 1.05, shadow: '0 10px 30px rgba(212,165,165,0.35)' }}
            whileTap={{ scale: 0.95 }}
          >
            Start Shopping
          </motion.button>

          {/* You might also like */}
          {recommendations.length > 0 && (
            <motion.div
              className="mt-16 text-left"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <div className="flex items-center gap-2 mb-6">
                <Sparkles size={18} className="text-[#d4a5a5]" />
                <h2 className="text-xl font-serif text-[#8b6f63] dark:text-[#e8ddd5]">You Might Also Like</h2>
              </div>
              <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-thin">
                {recommendations.map((product, index) => (
                  <motion.div
                    key={product.id}
                    className="snap-start"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 + index * 0.1 }}
                  >
                    <RecommendedProductCard product={product} onAdd={handleAddRecommended} />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    );
  }

  // ===== CART WITH ITEMS =====
  const estimatedDelivery = getEstimatedDelivery();

  return (
    <div className="container mx-auto px-4 py-8 dark:bg-[#1a1215] min-h-screen pb-32 lg:pb-12">
      <motion.h1
        className="text-3xl font-serif text-[#8b6f63] dark:text-[#e8ddd5] mb-2"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        Shopping Cart
      </motion.h1>
      <motion.p
        className="text-sm text-[#8b6f63]/60 dark:text-[#e8ddd5]/50 mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        {cartItems.length} item{cartItems.length !== 1 ? 's' : ''} in your cart
      </motion.p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          <AnimatePresence initial={false}>
            {cartItems.map((item, index) => {
              const hasDiscount = item.originalPrice && item.originalPrice > item.price;
              return (
                <motion.div
                  key={`${item.id}-${item.selectedColor}`}
                  className="bg-white dark:bg-[#2d1f24] rounded-xl p-4 sm:p-5 shadow-sm border border-[#f5e6e0]/50 dark:border-[#3d2f34] flex gap-4 group"
                  initial={{ opacity: 0, x: -30, scale: 0.97 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{
                    opacity: 0,
                    x: 60,
                    scale: 0.95,
                    height: 0,
                    marginTop: 0,
                    marginBottom: 0,
                    paddingTop: 0,
                    paddingBottom: 0,
                    overflow: 'hidden',
                  }}
                  transition={{
                    opacity: { duration: 0.25 },
                    x: { duration: 0.3, ease: 'easeInOut' },
                    scale: { duration: 0.2 },
                    height: { duration: 0.3, delay: 0.1 },
                  }}
                  layout
                >
                  <div className="w-24 h-24 sm:w-28 sm:h-28 bg-[#fef5f1] dark:bg-[#1a1215] rounded-lg overflow-hidden flex-shrink-0 relative">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                    {item.effectiveDiscount && item.effectiveDiscount > 0 && (
                      <div className="absolute top-1.5 left-1.5 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-semibold flex items-center gap-0.5 shadow-sm">
                        <Percent size={8} />
                        {item.effectiveDiscount}%
                      </div>
                    )}
                  </div>

                  <div className="flex-1 flex flex-col min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <div className="min-w-0">
                        <button
                          onClick={() => { useStore.getState().setProductId(item.id); navigate('product-detail'); }}
                          className="text-[#8b6f63] dark:text-[#e8ddd5] hover:text-[#d4a5a5] dark:hover:text-[#e8a5a5] transition-colors font-medium text-left"
                        >
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[#8b6f63] dark:text-[#e8ddd5] font-medium">{item.name}</span>
                            {item.selectedColor && item.selectedColor !== 'default' && (
                              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-[#fef5f1] dark:bg-[#1a1215] rounded-full">
                                <span className="w-3.5 h-3.5 rounded-full border border-gray-200 dark:border-gray-600 flex-shrink-0" style={{ backgroundColor: item.selectedColor }} />
                                <span className="text-xs text-[#8b6f63]/60 dark:text-[#e8ddd5]/50 font-mono">{item.selectedColor}</span>
                              </span>
                            )}
                          </div>
                        </button>
                        <p className="text-sm text-[#8b6f63]/60 dark:text-[#e8ddd5]/50">{item.category}</p>
                        {item.saleName && (
                          <p className="text-xs text-red-500 font-medium mt-0.5">{item.saleName}</p>
                        )}
                      </div>
                      <button
                        onClick={() => handleSaveForLater(item.id, item.name)}
                        className="p-2 text-[#8b6f63]/40 dark:text-[#e8ddd5]/30 hover:text-[#d4a5a5] transition-colors flex-shrink-0"
                        title="Save for later"
                      >
                        <Heart size={18} className={isWishlisted(item.id) ? 'fill-[#d4a5a5] text-[#d4a5a5]' : ''} />
                      </button>
                    </div>

                    <div className="flex justify-between items-end mt-auto gap-4 flex-wrap">
                      <QuantityControls
                        quantity={item.quantity}
                        onIncrease={() => updateQuantity(item.id, item.quantity + 1, item.selectedColor)}
                        onDecrease={() => {
                          if (item.quantity <= 1) {
                            handleRemove(item.id, item.name, item.selectedColor);
                          } else {
                            updateQuantity(item.id, item.quantity - 1, item.selectedColor);
                          }
                        }}
                        onRemove={() => handleRemove(item.id, item.name, item.selectedColor)}
                      />
                      <div className="text-right">
                        <p className="text-lg text-[#8b6f63] dark:text-[#e8ddd5] font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
                        {hasDiscount && (
                          <div className="flex items-center gap-1.5 justify-end mt-0.5">
                            <span className="text-xs text-[#8b6f63]/40 dark:text-[#e8ddd5]/30 line-through">${(item.originalPrice! * item.quantity).toFixed(2)}</span>
                            <span className="text-xs text-green-600 dark:text-green-400 font-medium">Save ${(item.originalPrice! - item.price).toFixed(2)}</span>
                          </div>
                        )}
                        {item.quantity > 1 && !hasDiscount && (
                          <p className="text-xs text-[#8b6f63]/40 dark:text-[#e8ddd5]/30">${item.price.toFixed(2)} each</p>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* You might also like (in-cart recommendations) */}
          {recommendations.length > 0 && (
            <motion.div
              className="mt-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <div className="flex items-center gap-2 mb-4">
                <Sparkles size={16} className="text-[#d4a5a5]" />
                <h3 className="text-lg font-serif text-[#8b6f63] dark:text-[#e8ddd5]">You Might Also Like</h3>
              </div>
              <div className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory">
                {recommendations.map((product) => (
                  <RecommendedProductCard key={product.id} product={product} onAdd={handleAddRecommended} />
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* Order Summary - Desktop */}
        <div className="hidden lg:block lg:col-span-1">
          <motion.div
            className="bg-[#fef5f1] dark:bg-[#2d1f24] rounded-xl p-6 sticky top-24 border border-[#f5e6e0]/30 dark:border-[#3d2f34]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-xl font-serif text-[#8b6f63] dark:text-[#e8ddd5] mb-5">Order Summary</h2>

            {/* Savings Banner */}
            {totalSavings > 0 && <SavingsBanner totalSavings={totalSavings} />}

            {/* Free Shipping Progress Bar */}
            <div className="mb-6">
              {qualifiesForFreeShipping ? (
                <motion.div
                  className="flex items-center gap-2 text-center"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                    <Check size={14} className="text-green-600 dark:text-green-400" />
                  </div>
                  <p className="text-sm font-medium text-green-600 dark:text-green-400">
                    You qualify for free shipping! 🎉
                  </p>
                </motion.div>
              ) : (
                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <Truck size={14} className="text-[#d4a5a5] flex-shrink-0" />
                    <p className="text-sm text-[#8b6f63]/70 dark:text-[#e8ddd5]/60">
                      Add <span className="font-semibold text-[#d4a5a5] dark:text-[#e8a5a5]">${remainingForFreeShipping.toFixed(2)}</span> more for free shipping
                    </p>
                  </div>
                  <div className="w-full h-2.5 bg-[#f5e6e0] dark:bg-[#1a1215] rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{
                        background: 'linear-gradient(90deg, #d4a5a5, #8b6f63)',
                      }}
                      initial={{ width: 0 }}
                      animate={{ width: `${shippingProgress}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Estimated Delivery */}
            <div className="flex items-center gap-2 mb-5 p-3 bg-white/60 dark:bg-[#1a1215]/40 rounded-lg">
              <Clock size={16} className="text-[#d4a5a5] flex-shrink-0" />
              <div>
                <p className="text-xs text-[#8b6f63]/50 dark:text-[#e8ddd5]/40">Estimated delivery</p>
                <p className="text-sm text-[#8b6f63] dark:text-[#e8ddd5] font-medium">{estimatedDelivery}</p>
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="space-y-3 mb-6">
              {totalSavings > 0 && (
                <div className="flex justify-between text-[#8b6f63] dark:text-[#e8ddd5]">
                  <span className="text-[#8b6f63]/60 dark:text-[#e8ddd5]/50">Original Price</span>
                  <span className="line-through text-[#8b6f63]/40 dark:text-[#e8ddd5]/30">${originalSubtotal.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-[#8b6f63] dark:text-[#e8ddd5]">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              {totalSavings > 0 && (
                <motion.div
                  className="flex justify-between text-green-600 dark:text-green-400"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <span className="font-medium">Total Savings</span>
                  <span className="font-medium">-${totalSavings.toFixed(2)}</span>
                </motion.div>
              )}
              <div className="flex justify-between text-[#8b6f63] dark:text-[#e8ddd5]">
                <span>Shipping</span>
                <span className={qualifiesForFreeShipping ? 'text-green-600 dark:text-green-400 font-medium' : ''}>
                  {qualifiesForFreeShipping ? 'Free' : '$5.99'}
                </span>
              </div>
              <div className="flex justify-between text-[#8b6f63] dark:text-[#e8ddd5]">
                <span>Tax (10%)</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="border-t border-[#8b6f63]/15 dark:border-[#3d2f34] pt-3">
                <div className="flex justify-between text-lg text-[#8b6f63] dark:text-[#e8ddd5] font-bold">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <motion.button
              onClick={handleCheckout}
              className="w-full py-3.5 bg-[#d4a5a5] text-white rounded-full hover:bg-[#c89a9a] transition-all mb-4 font-medium shadow-lg shadow-[#d4a5a5]/20 active:scale-[0.98]"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
            >
              Proceed to Checkout
            </motion.button>

            {/* Trust Badges */}
            <div className="flex items-center justify-center gap-4 py-3 border-t border-[#8b6f63]/10 dark:border-[#3d2f34]">
              <div className="flex items-center gap-1.5 text-[#8b6f63]/50 dark:text-[#e8ddd5]/40 text-xs">
                <Shield size={14} className="text-[#d4a5a5]" />
                <span>Secure</span>
              </div>
              <div className="flex items-center gap-1.5 text-[#8b6f63]/50 dark:text-[#e8ddd5]/40 text-xs">
                <RotateCcw size={14} className="text-[#d4a5a5]" />
                <span>30-Day Returns</span>
              </div>
              <div className="flex items-center gap-1.5 text-[#8b6f63]/50 dark:text-[#e8ddd5]/40 text-xs">
                <Truck size={14} className="text-[#d4a5a5]" />
                <span>Free Shipping</span>
              </div>
            </div>

            <button
              onClick={() => navigate('products')}
              className="flex items-center justify-center gap-1 text-[#8b6f63] dark:text-[#e8ddd5]/60 hover:text-[#d4a5a5] dark:hover:text-[#e8a5a5] text-sm transition-colors w-full mt-3 group"
            >
              Continue Shopping
              <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
            </button>
          </motion.div>
        </div>
      </div>

      {/* Mobile Order Summary - Collapsible */}
      <div className="lg:hidden mt-6 mb-4">
        <motion.button
          onClick={() => setShowMobileSummary(!showMobileSummary)}
          className="w-full flex items-center justify-between px-4 py-3 bg-[#fef5f1] dark:bg-[#2d1f24] rounded-xl border border-[#f5e6e0]/50 dark:border-[#3d2f34]/50"
          whileTap={{ scale: 0.98 }}
        >
          <span className="text-sm font-medium text-[#8b6f63] dark:text-[#e8ddd5]">Show Order Summary</span>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-[#8b6f63] dark:text-[#e8ddd5]">${total.toFixed(2)}</span>
            <motion.div
              animate={{ rotate: showMobileSummary ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown size={16} className="text-[#8b6f63] dark:text-[#e8ddd5]" />
            </motion.div>
          </div>
        </motion.button>
        <AnimatePresence>
          {showMobileSummary && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <div className="px-4 py-4 mt-2 bg-[#fef5f1] dark:bg-[#2d1f24] rounded-xl border border-[#f5e6e0]/50 dark:border-[#3d2f34]/50">
                {totalSavings > 0 && <SavingsBanner totalSavings={totalSavings} />}
                <div className="space-y-2.5">
                  {totalSavings > 0 && (
                    <div className="flex justify-between text-[#8b6f63] dark:text-[#e8ddd5]">
                      <span className="text-[#8b6f63]/60 dark:text-[#e8ddd5]/50">Original Price</span>
                      <span className="line-through text-[#8b6f63]/40 dark:text-[#e8ddd5]/30">${originalSubtotal.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-[#8b6f63] dark:text-[#e8ddd5]">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  {totalSavings > 0 && (
                    <div className="flex justify-between text-green-600 dark:text-green-400">
                      <span className="font-medium">Total Savings</span>
                      <span className="font-medium">-${totalSavings.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-[#8b6f63] dark:text-[#e8ddd5]">
                    <span>Shipping</span>
                    <span className={qualifiesForFreeShipping ? 'text-green-600 dark:text-green-400 font-medium' : ''}>
                      {qualifiesForFreeShipping ? 'Free' : '$5.99'}
                    </span>
                  </div>
                  <div className="flex justify-between text-[#8b6f63] dark:text-[#e8ddd5]">
                    <span>Tax (10%)</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-[#8b6f63]/15 dark:border-[#3d2f34] pt-2.5">
                    <div className="flex justify-between text-lg text-[#8b6f63] dark:text-[#e8ddd5] font-bold">
                      <span>Total</span>
                      <span>${total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Mobile Fixed Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden">
        <div className="bg-white/95 dark:bg-[#2d1f24]/95 backdrop-blur-md border-t border-[#f5e6e0]/50 dark:border-[#3d2f34] px-4 py-3 safe-area-pb">
          <div className="flex items-center justify-between max-w-lg mx-auto">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-[#8b6f63]/60 dark:text-[#e8ddd5]/50">Total</span>
                {totalSavings > 0 && (
                  <span className="text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-1.5 py-0.5 rounded-full font-medium">
                    Save ${totalSavings.toFixed(2)}
                  </span>
                )}
              </div>
              <p className="text-xl text-[#8b6f63] dark:text-[#e8ddd5] font-bold">${total.toFixed(2)}</p>
            </div>
            <motion.button
              onClick={handleCheckout}
              className="px-6 py-3 bg-[#d4a5a5] text-white rounded-full font-medium shadow-lg shadow-[#d4a5a5]/25 flex items-center gap-2 active:scale-[0.98]"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.96 }}
            >
              Checkout
              <ChevronRight size={16} />
            </motion.button>
          </div>
          {!qualifiesForFreeShipping && (
            <motion.div
              className="mt-2 max-w-lg mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="flex items-center gap-1.5 mb-1">
                <Truck size={12} className="text-[#d4a5a5]" />
                <p className="text-xs text-[#8b6f63]/50 dark:text-[#e8ddd5]/40">
                  Add <span className="font-semibold text-[#d4a5a5]">${remainingForFreeShipping.toFixed(2)}</span> more for free shipping
                </p>
              </div>
              <div className="w-full h-1.5 bg-[#f5e6e0] dark:bg-[#1a1215] rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: 'linear-gradient(90deg, #d4a5a5, #8b6f63)' }}
                  initial={{ width: 0 }}
                  animate={{ width: `${shippingProgress}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                />
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
