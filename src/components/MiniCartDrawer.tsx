'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus, Trash2, ShoppingBag, Truck, ArrowRight } from 'lucide-react';
import { useStore } from '@/store/store';

const FREE_SHIPPING_THRESHOLD = 50;

interface MiniCartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MiniCartDrawer({ isOpen, onClose }: MiniCartDrawerProps) {
  const { cartItems, updateQuantity, removeFromCart, navigate } = useStore();
  const cartTotal = useStore((s) => s.cartItems.reduce((t, i) => t + i.price * i.quantity, 0));

  const remainingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - cartTotal);
  const progressPercent = Math.min(100, (cartTotal / FREE_SHIPPING_THRESHOLD) * 100);

  const handleViewCart = () => {
    onClose();
    navigate('cart');
  };

  const handleCheckout = () => {
    onClose();
    navigate('checkout');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 bg-black/40 z-[60]"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 h-full w-full sm:w-[420px] bg-white dark:bg-[#2d1f24] z-[70] flex flex-col shadow-2xl"
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

            {/* Free Shipping Progress */}
            {cartItems.length > 0 && (
              <div className="px-6 py-3 bg-[#fef5f1] dark:bg-[#1a1215] border-b border-[#f5e6e0] dark:border-[#3d2f34]">
                <div className="flex items-center gap-2 mb-2">
                  <Truck size={16} className={remainingForFreeShipping > 0 ? 'text-[#8b6f63]/60 dark:text-[#a89898]' : 'text-green-600'} />
                  {remainingForFreeShipping > 0 ? (
                    <p className="text-xs text-[#8b6f63]/80 dark:text-[#a89898]">
                      Add <span className="font-semibold text-[#d4a5a5]">${remainingForFreeShipping.toFixed(2)}</span> more for free shipping!
                    </p>
                  ) : (
                    <p className="text-xs text-green-600 dark:text-green-400 font-medium">
                      You&apos;ve earned free shipping!
                    </p>
                  )}
                </div>
                <div className="w-full h-1.5 bg-[#f5e6e0] dark:bg-[#3d2f34] rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    className="h-full rounded-full bg-gradient-to-r from-[#d4a5a5] to-[#c89a9a]"
                  />
                </div>
              </div>
            )}

            {/* Cart Items */}
            {cartItems.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center px-6 gap-4">
                <div className="w-20 h-20 rounded-full bg-[#fef5f1] dark:bg-[#3d2f34] flex items-center justify-center">
                  <ShoppingBag size={32} className="text-[#8b6f63]/40 dark:text-[#a89898]/60" />
                </div>
                <p className="text-[#8b6f63]/80 dark:text-[#a89898] text-center font-medium">Your cart is empty</p>
                <p className="text-sm text-[#8b6f63]/50 dark:text-[#a89898]/60 text-center">
                  Looks like you haven&apos;t added anything to your cart yet.
                </p>
                <button
                  onClick={onClose}
                  className="mt-2 px-6 py-2.5 bg-[#d4a5a5] text-white rounded-full text-sm font-medium hover:bg-[#c89a9a] transition-colors"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto px-6 py-4">
                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: 50 }}
                      className="flex gap-3 p-3 bg-[#fef5f1] dark:bg-[#1a1215] rounded-xl"
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
                        <div className="flex items-center gap-2">
                          {item.selectedColor && item.selectedColor !== 'default' && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-white dark:bg-[#2d1f24] rounded-full">
                              <span className="w-3 h-3 rounded-full border border-gray-200 dark:border-gray-600 flex-shrink-0" style={{ backgroundColor: item.selectedColor }} />
                              <span className="text-[10px] text-[#8b6f63]/60 dark:text-[#a89898] font-mono">{item.selectedColor}</span>
                            </span>
                          )}
                          <h3 className="text-sm font-medium text-[#8b6f63] dark:text-[#e8ddd5] truncate">
                            {item.name}
                          </h3>
                        </div>
                        <p className="text-xs text-[#8b6f63]/60 dark:text-[#a89898] mt-0.5">
                          {item.category}
                        </p>
                        <p className="text-sm font-semibold text-[#d4a5a5] mt-1">
                          ${(item.price * item.quantity).toFixed(2)}
                        </p>

                        {/* Quantity Controls */}
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-1 bg-white dark:bg-[#2d1f24] rounded-full border border-[#f5e6e0] dark:border-[#3d2f34]">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1, item.selectedColor)}
                              className="p-1.5 hover:bg-[#fef5f1] dark:hover:bg-[#3d2f34] rounded-full transition-colors"
                              aria-label="Decrease quantity"
                            >
                              <Minus size={14} className="text-[#8b6f63] dark:text-[#a89898]" />
                            </button>
                            <span className="text-sm font-medium text-[#8b6f63] dark:text-[#e8ddd5] w-6 text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1, item.selectedColor)}
                              className="p-1.5 hover:bg-[#fef5f1] dark:hover:bg-[#3d2f34] rounded-full transition-colors"
                              aria-label="Increase quantity"
                            >
                              <Plus size={14} className="text-[#8b6f63] dark:text-[#a89898]" />
                            </button>
                          </div>

                          {/* Remove Button */}
                          <button
                            onClick={() => removeFromCart(item.id, item.selectedColor)}
                            className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors group"
                            aria-label="Remove item"
                          >
                            <Trash2 size={14} className="text-[#8b6f63]/40 dark:text-[#a89898]/60 group-hover:text-red-500 dark:group-hover:text-red-400 transition-colors" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Footer */}
            {cartItems.length > 0 && (
              <div className="border-t border-[#f5e6e0] dark:border-[#3d2f34] px-6 py-5 space-y-4 bg-white dark:bg-[#2d1f24]">
                {/* Subtotal */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#8b6f63] dark:text-[#a89898]">Subtotal</span>
                  <span className="text-lg font-semibold text-[#8b6f63] dark:text-[#e8ddd5]">
                    ${cartTotal.toFixed(2)}
                  </span>
                </div>
                <p className="text-xs text-[#8b6f63]/50 dark:text-[#a89898]/60">
                  Shipping &amp; taxes calculated at checkout
                </p>

                {/* Action Buttons */}
                <button
                  onClick={handleViewCart}
                  className="w-full py-3 border border-[#d4a5a5] text-[#d4a5a5] rounded-full text-sm font-medium hover:bg-[#fef5f1] dark:hover:bg-[#3d2f34] transition-colors flex items-center justify-center gap-2"
                >
                  View Cart
                  <ArrowRight size={16} />
                </button>
                <button
                  onClick={handleCheckout}
                  className="w-full py-3 bg-[#d4a5a5] text-white rounded-full text-sm font-medium hover:bg-[#c89a9a] transition-colors"
                >
                  Checkout
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
