'use client';

import { useStore } from '@/store/store';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
// Inline toast function
function toast(message: string, type: 'success' | 'error' | 'info' = 'success') {
  let container = document.getElementById('__toast_container__') as HTMLDivElement | null;
  if (!container) {
    container = document.createElement('div');
    container.id = '__toast_container__';
    container.style.cssText = 'position:fixed;top:1rem;right:1rem;z-index:9999;display:flex;flex-direction:column;gap:0.5rem;max-width:24rem;width:100%;pointer-events:none;';
    document.body.appendChild(container);
  }
  const colors = { success: '#10b981', error: '#ef4444', info: '#3b82f6' };
  const el = document.createElement('div');
  el.style.cssText = 'pointer-events:auto;background:white;border-radius:0.75rem;box-shadow:0 10px 15px -3px rgba(0,0,0,0.1),0 4px 6px -4px rgba(0,0,0,0.1);border:1px solid #f3f4f6;border-left:4px solid ' + colors[type] + ';padding:0.75rem 1rem;display:flex;align-items:flex-start;gap:0.75rem;transform:translateX(120%);opacity:0;transition:transform 0.3s cubic-bezier(0.34,1.56,0.64,1),opacity 0.3s ease;max-width:100%;';
  el.innerHTML = '<p style="flex:1;font-size:0.875rem;color:#374151;line-height:1.4;margin:0">' + message + '</p><button style="color:#9ca3af;background:none;border:none;cursor:pointer;padding:0;font-size:1rem;line-height:1" aria-label="Close">&times;</button>';
  el.querySelector('button')!.addEventListener('click', () => { el.style.transform = 'translateX(120%)'; el.style.opacity = '0'; setTimeout(() => el.remove(), 300); });
  container.appendChild(el);
  requestAnimationFrame(() => { el.style.transform = 'translateX(0)'; el.style.opacity = '1'; });
  setTimeout(() => { el.style.transform = 'translateX(120%)'; el.style.opacity = '0'; setTimeout(() => el.remove(), 300); }, 4000);
}

import { motion, AnimatePresence } from 'framer-motion';

export function CartPage() {
  const { cartItems, removeFromCart, updateQuantity, getCartTotal, navigate } = useStore();

  const handleRemove = (productId: string, productName: string) => {
    removeFromCart(productId);
    toast(`${productName} removed from cart`);
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      toast('Your cart is empty', 'error');
      return;
    }
    navigate('checkout');
  };

  const subtotal = getCartTotal();
  const tax = subtotal * 0.1;
  const total = subtotal + tax;

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center py-16">
          <div className="w-24 h-24 bg-[#fef5f1] rounded-full mx-auto mb-6 flex items-center justify-center">
            <ShoppingBag size={40} className="text-[#d4a5a5]" />
          </div>
          <h1 className="text-3xl font-serif text-[#8b6f63] mb-4">Your Cart is Empty</h1>
          <p className="text-[#8b6f63]/70 mb-8">Looks like you haven&apos;t added anything to your cart yet</p>
          <button onClick={() => navigate('products')} className="px-8 py-3 bg-[#d4a5a5] text-white rounded-full hover:bg-[#c89a9a] transition-all active:scale-95">
            Start Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <motion.h1 className="text-3xl font-serif text-[#8b6f63] mb-8" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        Shopping Cart ({cartItems.length} item{cartItems.length !== 1 ? 's' : ''})
      </motion.h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          <AnimatePresence>
            {cartItems.map((item) => (
              <motion.div
                key={item.id}
                className="bg-white rounded-xl p-4 shadow-sm border border-[#f5e6e0]/50 flex gap-4"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20, height: 0 }}
              >
                <div className="w-24 h-24 bg-[#fef5f1] rounded-lg overflow-hidden flex-shrink-0">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                </div>

                <div className="flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <button onClick={() => { useStore.getState().setProductId(item.id); navigate('product-detail'); }} className="text-[#8b6f63] hover:text-[#d4a5a5] transition-colors font-medium text-left">
                        {item.name}
                      </button>
                      <p className="text-sm text-[#8b6f63]/70">{item.category}</p>
                    </div>
                    <button onClick={() => handleRemove(item.id, item.name)} className="p-2 text-[#8b6f63]/50 hover:text-red-500 transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </div>

                  <div className="flex justify-between items-end mt-auto">
                    <div className="flex items-center gap-3">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-8 h-8 rounded-full bg-[#fef5f1] text-[#8b6f63] hover:bg-[#f5e6e0] transition-colors flex items-center justify-center">
                        <Minus size={14} />
                      </button>
                      <span className="w-8 text-center text-[#8b6f63] font-medium">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-8 h-8 rounded-full bg-[#fef5f1] text-[#8b6f63] hover:bg-[#f5e6e0] transition-colors flex items-center justify-center">
                        <Plus size={14} />
                      </button>
                    </div>
                    <div className="text-right">
                      <p className="text-lg text-[#8b6f63] font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
                      {item.quantity > 1 && <p className="text-xs text-[#8b6f63]/50">${item.price.toFixed(2)} each</p>}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <motion.div className="bg-[#fef5f1] rounded-xl p-6 sticky top-24" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <h2 className="text-xl font-serif text-[#8b6f63] mb-6">Order Summary</h2>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-[#8b6f63]"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between text-[#8b6f63]"><span>Shipping</span><span className="text-green-600">Free</span></div>
              <div className="flex justify-between text-[#8b6f63]"><span>Tax</span><span>${tax.toFixed(2)}</span></div>
              <div className="border-t border-[#8b6f63]/20 pt-3">
                <div className="flex justify-between text-lg text-[#8b6f63] font-semibold"><span>Total</span><span>${total.toFixed(2)}</span></div>
              </div>
            </div>
            <button onClick={handleCheckout} className="w-full py-3 bg-[#d4a5a5] text-white rounded-full hover:bg-[#c89a9a] transition-all mb-4 active:scale-[0.98]">
              Proceed to Checkout
            </button>
            <button onClick={() => navigate('products')} className="block text-center text-[#8b6f63] hover:text-[#d4a5a5] text-sm transition-colors w-full">
              Continue Shopping
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
