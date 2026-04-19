'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus, Trash2, ShoppingBag, Truck, ArrowRight, Sparkles, Heart, PackageCheck } from 'lucide-react';
import { useStore, type Product } from '@/store/store';

const FREE_SHIPPING_THRESHOLD = 50;

interface MiniCartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MiniCartDrawer({ isOpen, onClose }: MiniCartDrawerProps) {
  const { cartItems, updateQuantity, removeFromCart, navigate, addToCart } = useStore();
  const [removingItemId, setRemovingItemId] = useState<string | null>(null);
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);

  const cartTotal = useStore((s) => s.cartItems.reduce((t, i) => t + i.price * i.quantity, 0));
  const cartOriginalTotal = useStore((s) =>
    s.cartItems.reduce((t, i) => t + (i.originalPrice || i.price) * i.quantity, 0)
  );
  const totalSavings = cartOriginalTotal - cartTotal;

  const remainingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - cartTotal);
  const progressPercent = Math.min(100, (cartTotal / FREE_SHIPPING_THRESHOLD) * 100);

  // Fetch recommended products
  useEffect(() => {
    if (isOpen && cartItems.length > 0) {
      fetch('/api/products?sort=newest')
        .then((res) => res.json())
        .then((data: Product[]) => {
          const cartIds = new Set(cartItems.map((i) => i.id));
          const filtered = data.filter((p) => !cartIds.has(p.id));
          setRecommendedProducts(filtered.slice(0, 3));
        })
        .catch(() => {});
    }
  }, [isOpen, cartItems]);

  // Close on escape
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  // Prevent body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const handleRemove = (id: string, selectedColor?: string) => {
    setRemovingItemId(id);
    setTimeout(() => {
      removeFromCart(id, selectedColor);
      setRemovingItemId(null);
    }, 300);
  };

  const handleAddRecommended = (product: Product) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.discountedPrice ?? product.price,
      originalPrice: product.onSale ? product.price : undefined,
      image: product.image,
      category: product.category,
      quantity: 1,
      selectedColor: 'default',
      saleName: product.saleName,
      effectiveDiscount: product.effectiveDiscount,
    });
  };

  const handleViewCart = () => {
    onClose();
    navigate('cart');
  };

  const handleCheckout = () => {
    onClose();
    navigate('checkout');
  };

  const handleRecommendedClick = (product: Product) => {
    onClose();
    useStore.getState().setProductId(product.id);
    navigate('product-detail');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop with blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 h-full w-full sm:w-[440px] bg-white dark:bg-[#2d1f24] z-[70] flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#f5e6e0] dark:border-[#3d2f34]">
              <div className="flex items-center gap-2">
                <ShoppingBag size={20} className="text-[#8b6f63] dark:text-[#d4a5a5]" />
                <h2 className="text-lg font-serif text-[#8b6f63] dark:text-[#e8ddd5]">
                  Your Cart
                  {cartItems.length > 0 && (
                    <span className="ml-2 text-sm font-normal text-[#8b6f63]/60 dark:text-[#a89898]">
                      ({cartItems.length} {cartItems.length === 1 ? 'item' : 'items'})
                    </span>
                  )}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-[#fef5f1] dark:hover:bg-[#3d2f34] rounded-full transition-colors"
                aria-label="Close cart"
              >
                <X size={20} className="text-[#8b6f63] dark:text-[#a89898]" />
              </button>
            </div>

            {/* Savings Badge */}
            {cartItems.length > 0 && totalSavings > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="px-6 py-2.5 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-b border-green-100 dark:border-green-900/30"
              >
                <div className="flex items-center gap-2">
                  <Sparkles size={14} className="text-green-600 dark:text-green-400" />
                  <p className="text-xs font-medium text-green-700 dark:text-green-300">
                    You&apos;re saving <span className="font-bold">${totalSavings.toFixed(2)}</span> on this order!
                  </p>
                </div>
              </motion.div>
            )}

            {/* Free Shipping Progress */}
            {cartItems.length > 0 && (
              <div className="px-6 py-3 bg-[#fef5f1] dark:bg-[#1a1215] border-b border-[#f5e6e0] dark:border-[#3d2f34]">
                <div className="flex items-center gap-2 mb-2">
                  <Truck size={16} className={remainingForFreeShipping > 0 ? 'text-[#8b6f63]/60 dark:text-[#a89898]' : 'text-green-600 dark:text-green-400'} />
                  {remainingForFreeShipping > 0 ? (
                    <p className="text-xs text-[#8b6f63]/80 dark:text-[#a89898]">
                      Add <span className="font-semibold text-[#d4a5a5] dark:text-[#d4a5a5]">${remainingForFreeShipping.toFixed(2)}</span> more for free shipping!
                    </p>
                  ) : (
                    <p className="text-xs text-green-600 dark:text-green-400 font-medium">
                      You&apos;ve earned free shipping! 🎉
                    </p>
                  )}
                </div>
                <div className="w-full h-2 bg-[#f5e6e0] dark:bg-[#3d2f34] rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                    className="h-full rounded-full bg-gradient-to-r from-[#d4a5a5] to-[#c89a9a] relative"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
                  </motion.div>
                </div>
              </div>
            )}

            {/* Cart Items or Empty State */}
            {cartItems.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center px-6 gap-4">
                <motion.div
                  className="w-24 h-24 rounded-full bg-gradient-to-br from-[#fef5f1] to-[#f5e6e0] dark:from-[#3d2f34] dark:to-[#2d1f24] flex items-center justify-center"
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <ShoppingBag size={36} className="text-[#8b6f63]/30 dark:text-[#a89898]/40" />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="text-center"
                >
                  <p className="text-[#8b6f63] dark:text-[#e8ddd5] text-center font-semibold text-lg">Your cart is empty</p>
                  <p className="text-sm text-[#8b6f63]/50 dark:text-[#a89898]/60 text-center mt-1 max-w-[240px]">
                    Looks like you haven&apos;t added anything to your cart yet.
                  </p>
                </motion.div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => { onClose(); navigate('products'); }}
                  className="mt-2 px-8 py-3 bg-[#d4a5a5] text-white rounded-full text-sm font-medium hover:bg-[#c89a9a] transition-all shadow-lg shadow-[#d4a5a5]/20"
                >
                  Start Shopping
                </motion.button>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto px-6 py-4">
                <div className="space-y-3">
                  <AnimatePresence mode="popLayout">
                    {cartItems.map((item, index) => (
                      <motion.div
                        key={`${item.id}-${item.selectedColor}`}
                        layout
                        initial={{ opacity: 0, y: 15, scale: 0.95 }}
                        animate={{
                          opacity: removingItemId === item.id ? 0 : 1,
                          y: removingItemId === item.id ? -10 : 0,
                          x: removingItemId === item.id ? 60 : 0,
                          scale: removingItemId === item.id ? 0.9 : 1,
                        }}
                        exit={{ opacity: 0, x: 60, scale: 0.9 }}
                        transition={{ duration: 0.25, delay: index * 0.05 }}
                        className="flex gap-3 p-3 bg-[#fef5f1] dark:bg-[#1a1215] rounded-xl border border-[#f5e6e0]/60 dark:border-[#3d2f34]/60 hover:shadow-sm transition-shadow"
                      >
                        {/* Product Image */}
                        <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-white dark:bg-[#2d1f24]">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        </div>

                        {/* Product Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-1">
                            <h3 className="text-sm font-medium text-[#8b6f63] dark:text-[#e8ddd5] truncate leading-snug">
                              {item.name}
                            </h3>
                          </div>

                          {/* Color Swatch */}
                          {item.selectedColor && item.selectedColor !== 'default' && (
                            <div className="flex items-center gap-1.5 mt-1">
                              <span
                                className="w-3.5 h-3.5 rounded-full border border-[#f5e6e0] dark:border-[#3d2f34] shadow-sm flex-shrink-0"
                                style={{ backgroundColor: item.selectedColor }}
                              />
                              <span className="text-[10px] text-[#8b6f63]/50 dark:text-[#a89898] font-mono">
                                {item.selectedColor}
                              </span>
                            </div>
                          )}

                          <p className="text-[11px] text-[#8b6f63]/50 dark:text-[#a89898] mt-0.5">
                            {item.category}
                          </p>

                          {/* Price with savings */}
                          <div className="flex items-center gap-2 mt-1">
                            <p className="text-sm font-bold text-[#d4a5a5]">
                              ${(item.price * item.quantity).toFixed(2)}
                            </p>
                            {item.originalPrice && item.originalPrice > item.price && (
                              <>
                                <p className="text-xs text-[#8b6f63]/40 dark:text-[#a89898]/50 line-through">
                                  ${(item.originalPrice * item.quantity).toFixed(2)}
                                </p>
                                <span className="text-[10px] font-semibold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-1.5 py-0.5 rounded-full">
                                  -{Math.round((1 - item.price / item.originalPrice) * 100)}%
                                </span>
                              </>
                            )}
                          </div>

                          {/* Quantity Controls */}
                          <div className="flex items-center justify-between mt-2.5">
                            <div className="flex items-center bg-white dark:bg-[#2d1f24] rounded-full border border-[#f5e6e0] dark:border-[#3d2f34] shadow-sm">
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity - 1, item.selectedColor)}
                                className="p-1.5 hover:bg-[#fef5f1] dark:hover:bg-[#3d2f34] rounded-full transition-colors active:scale-90"
                                aria-label="Decrease quantity"
                              >
                                <Minus size={14} className="text-[#8b6f63] dark:text-[#a89898]" />
                              </button>
                              <span className="text-sm font-semibold text-[#8b6f63] dark:text-[#e8ddd5] w-7 text-center tabular-nums">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1, item.selectedColor)}
                                className="p-1.5 hover:bg-[#fef5f1] dark:hover:bg-[#3d2f34] rounded-full transition-colors active:scale-90"
                                aria-label="Increase quantity"
                              >
                                <Plus size={14} className="text-[#8b6f63] dark:text-[#a89898]" />
                              </button>
                            </div>

                            {/* Remove Button */}
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleRemove(item.id, item.selectedColor)}
                              className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors group"
                              aria-label="Remove item"
                            >
                              <Trash2 size={14} className="text-[#8b6f63]/30 dark:text-[#a89898]/40 group-hover:text-red-500 dark:group-hover:text-red-400 transition-colors" />
                            </motion.button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                {/* Complete Your Look - Recommendations */}
                {recommendedProducts.length > 0 && (
                  <div className="mt-6 pt-5 border-t border-[#f5e6e0] dark:border-[#3d2f34]">
                    <div className="flex items-center gap-2 mb-4">
                      <Heart size={16} className="text-[#d4a5a5]" />
                      <h3 className="text-sm font-semibold text-[#8b6f63] dark:text-[#e8ddd5]">
                        Complete Your Look
                      </h3>
                    </div>
                    <div className="space-y-2.5">
                      {recommendedProducts.map((product) => (
                        <motion.div
                          key={product.id}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 }}
                          className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-[#fef5f1] dark:hover:bg-[#1a1215] transition-colors cursor-pointer group"
                          onClick={() => handleRecommendedClick(product)}
                        >
                          <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-white dark:bg-[#2d1f24] border border-[#f5e6e0]/60 dark:border-[#3d2f34]/60">
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-[#8b6f63] dark:text-[#e8ddd5] truncate">
                              {product.name}
                            </p>
                            <p className="text-xs text-[#d4a5a5] font-semibold mt-0.5">
                              ${(product.discountedPrice ?? product.price).toFixed(2)}
                            </p>
                          </div>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddRecommended(product);
                            }}
                            className="p-1.5 bg-[#d4a5a5] text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[#c89a9a] shadow-sm"
                            aria-label="Add to cart"
                          >
                            <Plus size={12} />
                          </motion.button>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Footer */}
            {cartItems.length > 0 && (
              <div className="border-t border-[#f5e6e0] dark:border-[#3d2f34] px-6 py-5 space-y-3 bg-white dark:bg-[#2d1f24]">
                {/* Savings summary */}
                {totalSavings > 0 && (
                  <div className="flex items-center justify-between px-3 py-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <span className="text-xs text-green-700 dark:text-green-300 font-medium flex items-center gap-1.5">
                      <PackageCheck size={14} />
                      You save
                    </span>
                    <span className="text-sm font-bold text-green-700 dark:text-green-300">
                      -${totalSavings.toFixed(2)}
                    </span>
                  </div>
                )}

                {/* Subtotal */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#8b6f63] dark:text-[#a89898]">Subtotal</span>
                  <div className="text-right">
                    {cartOriginalTotal > cartTotal && (
                      <p className="text-xs text-[#8b6f63]/40 dark:text-[#a89898]/50 line-through">
                        ${cartOriginalTotal.toFixed(2)}
                      </p>
                    )}
                    <span className="text-lg font-bold text-[#8b6f63] dark:text-[#e8ddd5]">
                      ${cartTotal.toFixed(2)}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-[#8b6f63]/50 dark:text-[#a89898]/60">
                  Shipping &amp; taxes calculated at checkout
                </p>

                {/* Action Buttons */}
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={handleViewCart}
                  className="w-full py-3 border border-[#d4a5a5] text-[#d4a5a5] dark:text-[#d4a5a5] rounded-full text-sm font-medium hover:bg-[#fef5f1] dark:hover:bg-[#3d2f34] transition-all flex items-center justify-center gap-2"
                >
                  View Cart
                  <ArrowRight size={16} />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={handleCheckout}
                  className="w-full py-3.5 bg-gradient-to-r from-[#d4a5a5] to-[#c89a9a] text-white rounded-full text-sm font-semibold hover:from-[#c89a9a] hover:to-[#b88a8a] transition-all shadow-lg shadow-[#d4a5a5]/25 flex items-center justify-center gap-2"
                >
                  Checkout
                  {totalSavings > 0 && (
                    <span className="text-[11px] bg-white/20 px-2 py-0.5 rounded-full">Save ${totalSavings.toFixed(2)}</span>
                  )}
                </motion.button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
