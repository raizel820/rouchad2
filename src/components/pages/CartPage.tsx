'use client';

import { useStore } from '@/store/store';
import { Trash2, Plus, Minus, ShoppingBag, Heart, Shield, RotateCcw, Truck, Percent } from 'lucide-react';
import { toast } from '@/lib/toast';
import { motion, AnimatePresence } from 'framer-motion';

const FREE_SHIPPING_THRESHOLD = 50;

export function CartPage() {
  const { cartItems, removeFromCart, updateQuantity, getCartTotal, getCartOriginalTotal, navigate, toggleWishlist, isWishlisted } = useStore();

  const handleRemove = (productId: string, productName: string, selectedColor?: string) => {
    removeFromCart(productId, selectedColor);
    toast(`${productName} removed from cart`);
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

  const subtotal = getCartTotal();
  const originalSubtotal = getCartOriginalTotal();
  const totalSavings = Math.round((originalSubtotal - subtotal) * 100) / 100;
  const tax = subtotal * 0.1;
  const total = subtotal + tax;
  const shippingProgress = Math.min((subtotal / FREE_SHIPPING_THRESHOLD) * 100, 100);
  const remainingForFreeShipping = Math.max(FREE_SHIPPING_THRESHOLD - subtotal, 0);
  const qualifiesForFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD;

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12 min-h-screen">
        <div className="text-center py-16">
          <motion.div
            className="w-28 h-28 bg-[#fef5f1] dark:bg-[#2d1f24] rounded-full mx-auto mb-6 flex items-center justify-center"
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.1, 0.95, 1] }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            <motion.div
              initial={{ y: 0 }}
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            >
              <ShoppingBag size={44} className="text-[#d4a5a5]" />
            </motion.div>
          </motion.div>
          <motion.h1
            className="text-3xl font-serif text-[#8b6f63] dark:text-[#e8ddd5] mb-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Your Cart is Empty
          </motion.h1>
          <motion.p
            className="text-[#8b6f63]/70 dark:text-[#e8ddd5]/60 mb-8"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            Looks like you haven&apos;t added anything to your cart yet
          </motion.p>
          <motion.button
            onClick={() => navigate('products')}
            className="px-8 py-3 bg-[#d4a5a5] text-white rounded-full hover:bg-[#c89a9a] transition-all active:scale-95"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Start Shopping
          </motion.button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 dark:bg-[#1a1215] min-h-screen">
      <motion.h1
        className="text-3xl font-serif text-[#8b6f63] dark:text-[#e8ddd5] mb-8"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        Shopping Cart ({cartItems.length} item{cartItems.length !== 1 ? 's' : ''})
      </motion.h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          <AnimatePresence>
            {cartItems.map((item) => {
              const hasDiscount = item.originalPrice && item.originalPrice > item.price;
              return (
                <motion.div
                  key={`${item.id}-${item.selectedColor}`}
                  className="bg-white dark:bg-[#2d1f24] rounded-xl p-4 shadow-sm border border-[#f5e6e0]/50 dark:border-[#3d2f34] flex gap-4"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20, height: 0 }}
                >
                  <div className="w-24 h-24 bg-[#fef5f1] dark:bg-[#1a1215] rounded-lg overflow-hidden flex-shrink-0 relative">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                    {item.effectiveDiscount && item.effectiveDiscount > 0 && (
                      <div className="absolute top-1 left-1 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-semibold flex items-center gap-0.5">
                        <Percent size={8} />
                        {item.effectiveDiscount}%
                      </div>
                    )}
                  </div>

                  <div className="flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <button
                          onClick={() => { useStore.getState().setProductId(item.id); navigate('product-detail'); }}
                          className="text-[#8b6f63] dark:text-[#e8ddd5] hover:text-[#d4a5a5] transition-colors font-medium text-left"
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
                        <p className="text-sm text-[#8b6f63]/70 dark:text-[#e8ddd5]/60">{item.category}</p>
                        {item.saleName && (
                          <p className="text-xs text-red-500 font-medium mt-0.5">{item.saleName}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleSaveForLater(item.id, item.name)}
                          className="p-2 text-[#8b6f63]/50 dark:text-[#e8ddd5]/40 hover:text-[#d4a5a5] transition-colors"
                          title="Save for later"
                        >
                          <Heart size={18} className={isWishlisted(item.id) ? 'fill-[#d4a5a5] text-[#d4a5a5]' : ''} />
                        </button>
                        <button
                          onClick={() => handleRemove(item.id, item.name, item.selectedColor)}
                          className="p-2 text-[#8b6f63]/50 dark:text-[#e8ddd5]/40 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>

                    <div className="flex justify-between items-end mt-auto">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1, item.selectedColor)}
                          className="w-8 h-8 rounded-full bg-[#fef5f1] dark:bg-[#1a1215] text-[#8b6f63] dark:text-[#e8ddd5] hover:bg-[#f5e6e0] dark:hover:bg-[#3d2f34] transition-colors flex items-center justify-center"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-8 text-center text-[#8b6f63] dark:text-[#e8ddd5] font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1, item.selectedColor)}
                          className="w-8 h-8 rounded-full bg-[#fef5f1] dark:bg-[#1a1215] text-[#8b6f63] dark:text-[#e8ddd5] hover:bg-[#f5e6e0] dark:hover:bg-[#3d2f34] transition-colors flex items-center justify-center"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      <div className="text-right">
                        <p className="text-lg text-[#8b6f63] dark:text-[#e8ddd5] font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
                        {hasDiscount && (
                          <div className="flex items-center gap-1 justify-end">
                            <span className="text-xs text-[#8b6f63]/40 line-through">${(item.originalPrice! * item.quantity).toFixed(2)}</span>
                            <span className="text-xs text-green-600 font-medium">Save ${(item.originalPrice! - item.price).toFixed(2)}</span>
                          </div>
                        )}
                        {item.quantity > 1 && !hasDiscount && <p className="text-xs text-[#8b6f63]/50 dark:text-[#e8ddd5]/40">${item.price.toFixed(2)} each</p>}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <motion.div
            className="bg-[#fef5f1] dark:bg-[#2d1f24] rounded-xl p-6 sticky top-24 border border-[#f5e6e0]/30 dark:border-[#3d2f34]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-xl font-serif text-[#8b6f63] dark:text-[#e8ddd5] mb-6">Order Summary</h2>

            {/* Savings Banner */}
            {totalSavings > 0 && (
              <motion.div
                className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3 mb-4"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <p className="text-sm text-green-700 dark:text-green-400 font-medium text-center">
                  🎉 You&apos;re saving <span className="font-bold">${totalSavings.toFixed(2)}</span> on this order!
                </p>
              </motion.div>
            )}

            {/* Free Shipping Progress Bar */}
            <div className="mb-6">
              {qualifiesForFreeShipping ? (
                <motion.div
                  className="text-center"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <p className="text-sm font-medium text-green-600 dark:text-green-400">
                    You qualify for free shipping! 🎉
                  </p>
                </motion.div>
              ) : (
                <div>
                  <p className="text-sm text-[#8b6f63] dark:text-[#e8ddd5]/70 mb-2">
                    You&apos;re <span className="font-semibold text-[#d4a5a5]">${remainingForFreeShipping.toFixed(2)}</span> away from free shipping!
                  </p>
                  <div className="w-full h-2 bg-[#f5e6e0] dark:bg-[#1a1215] rounded-full overflow-hidden">
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

            <div className="space-y-3 mb-6">
              {totalSavings > 0 && (
                <div className="flex justify-between text-[#8b6f63] dark:text-[#e8ddd5]">
                  <span className="text-[#8b6f63]/60 dark:text-[#e8ddd5]/50">Original Price</span>
                  <span className="line-through text-[#8b6f63]/50 dark:text-[#e8ddd5]/40">${originalSubtotal.toFixed(2)}</span>
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
                <span className={qualifiesForFreeShipping ? 'text-green-600 dark:text-green-400' : ''}>
                  {qualifiesForFreeShipping ? 'Free' : '$5.99'}
                </span>
              </div>
              <div className="flex justify-between text-[#8b6f63] dark:text-[#e8ddd5]">
                <span>Tax</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="border-t border-[#8b6f63]/20 dark:border-[#3d2f34] pt-3">
                <div className="flex justify-between text-lg text-[#8b6f63] dark:text-[#e8ddd5] font-semibold">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              className="w-full py-3 bg-[#d4a5a5] text-white rounded-full hover:bg-[#c89a9a] transition-all mb-4 active:scale-[0.98] font-medium"
            >
              Proceed to Checkout
            </button>

            {/* Trust Badges */}
            <div className="flex items-center justify-center gap-4 py-3 border-t border-[#8b6f63]/10 dark:border-[#3d2f34]">
              <div className="flex items-center gap-1.5 text-[#8b6f63]/60 dark:text-[#e8ddd5]/50 text-xs">
                <Shield size={14} className="text-[#d4a5a5]" />
                <span>Secure</span>
              </div>
              <div className="flex items-center gap-1.5 text-[#8b6f63]/60 dark:text-[#e8ddd5]/50 text-xs">
                <RotateCcw size={14} className="text-[#d4a5a5]" />
                <span>30-Day Returns</span>
              </div>
              <div className="flex items-center gap-1.5 text-[#8b6f63]/60 dark:text-[#e8ddd5]/50 text-xs">
                <Truck size={14} className="text-[#d4a5a5]" />
                <span>Free Shipping</span>
              </div>
            </div>

            <button
              onClick={() => navigate('products')}
              className="block text-center text-[#8b6f63] dark:text-[#e8ddd5]/70 hover:text-[#d4a5a5] text-sm transition-colors w-full mt-2"
            >
              Continue Shopping
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
