'use client';

import { useState } from 'react';
import { useStore, type CartItem, type Product } from '@/store/store';
import { Star, ShoppingBag, Heart, X, Eye, Minus, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

function QuickViewContent({ product, onClose }: { product: Product; onClose: () => void }) {
  const { addToCart, setProductId, navigate, toggleWishlist, wishlistItems, isAuthenticated, user, closeQuickView } = useStore();
  const [quantity, setQuantity] = useState(1);
  const [imgError, setImgError] = useState(false);

  const isWishlisted = wishlistItems.includes(product.id);

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      const cartItem: CartItem = {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        category: product.category,
        quantity: 1,
      };
      addToCart(cartItem);
    }
    toast.success(`${quantity} x ${product.name} added to cart!`);
  };

  const handleWishlistToggle = () => {
    if (!isAuthenticated || !user) {
      toast.error('Please log in to add items to your wishlist');
      return;
    }
    toggleWishlist(product.id);
    toast.success(isWishlisted ? `${product.name} removed from wishlist` : `${product.name} added to wishlist!`);

    if (isWishlisted) {
      fetch(`/api/wishlist?productId=${product.id}&userId=${user.id}`, { method: 'DELETE' }).catch(() => {});
    } else {
      fetch('/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, productId: product.id }),
      }).catch(() => {});
    }
  };

  const handleViewDetails = () => {
    setProductId(product.id);
    closeQuickView();
    navigate('product-detail');
  };

  return (
    <>
      {/* Backdrop */}
      <motion.div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />

      {/* Modal */}
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto relative"
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm shadow-sm flex items-center justify-center hover:bg-[#fef5f1] transition-colors"
            aria-label="Close quick view"
          >
            <X size={16} className="text-[#8b6f63]" />
          </button>

          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* Image */}
            <div className="bg-[#fef5f1] aspect-square relative overflow-hidden rounded-t-2xl md:rounded-l-2xl md:rounded-tr-none">
              {!imgError ? (
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  onError={() => setImgError(true)}
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-[#fef5f1] to-[#f5e6e0] flex items-center justify-center">
                  <span className="text-6xl opacity-30">💄</span>
                </div>
              )}
              {product.badge && (
                <div className="absolute top-4 left-4 bg-[#d4a5a5] text-white text-xs px-3 py-1 rounded-full font-medium shadow-sm">
                  {product.badge}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="p-6 md:p-8 flex flex-col justify-center">
              {/* Category Badge */}
              <span className="inline-block w-fit text-xs text-[#8b6f63]/70 uppercase tracking-wider bg-[#fef5f1] px-3 py-1 rounded-full mb-3">
                {product.category}
              </span>

              {/* Name */}
              <h2 className="text-xl md:text-2xl font-serif text-[#8b6f63] mb-3">{product.name}</h2>

              {/* Rating */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      className={i < Math.floor(product.rating) ? 'fill-[#d4a5a5] text-[#d4a5a5]' : 'text-[#8b6f63]/20'}
                    />
                  ))}
                </div>
                <span className="text-sm text-[#8b6f63] font-medium">{product.rating}</span>
                <span className="text-xs text-[#8b6f63]/50">({product.reviewCount} reviews)</span>
              </div>

              {/* Price */}
              <div className="text-2xl text-[#8b6f63] font-semibold mb-4">${product.price.toFixed(2)}</div>

              {/* Description */}
              <p className="text-sm text-[#8b6f63]/70 leading-relaxed mb-6 line-clamp-3">{product.description}</p>

              {/* Quantity Selector */}
              <div className="flex items-center gap-4 mb-6">
                <span className="text-sm text-[#8b6f63]">Qty:</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-8 h-8 rounded-full bg-[#fef5f1] text-[#8b6f63] hover:bg-[#f5e6e0] transition-colors flex items-center justify-center"
                    aria-label="Decrease quantity"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-8 text-center text-[#8b6f63] font-medium text-sm">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-8 h-8 rounded-full bg-[#fef5f1] text-[#8b6f63] hover:bg-[#f5e6e0] transition-colors flex items-center justify-center"
                    aria-label="Increase quantity"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleAddToCart}
                  className="flex-1 px-6 py-3 bg-[#d4a5a5] text-white rounded-full hover:bg-[#c89a9a] transition-all flex items-center justify-center gap-2 active:scale-95 text-sm font-medium"
                >
                  <ShoppingBag size={16} />
                  Add to Cart
                </button>
                <button
                  onClick={handleWishlistToggle}
                  className={`px-5 py-3 rounded-full transition-all flex items-center gap-2 text-sm font-medium ${
                    isWishlisted
                      ? 'bg-red-50 border-2 border-red-400 text-red-500 hover:bg-red-100'
                      : 'border-2 border-[#d4a5a5] text-[#d4a5a5] hover:bg-[#d4a5a5] hover:text-white'
                  }`}
                >
                  <Heart size={16} className={isWishlisted ? 'fill-red-500 text-red-500' : ''} />
                  {isWishlisted ? 'Saved' : 'Wishlist'}
                </button>
              </div>

              {/* View Details Link */}
              <button
                onClick={handleViewDetails}
                className="mt-4 flex items-center gap-2 text-sm text-[#d4a5a5] hover:text-[#8b6f63] transition-colors mx-auto"
              >
                <Eye size={14} />
                View Full Details
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </>
  );
}

interface QuickViewModalProps {
  isOpen: boolean;
  product: Product | null;
  onClose: () => void;
}

export function QuickViewModal({ isOpen, product, onClose }: QuickViewModalProps) {
  if (!product || !isOpen) return null;

  return (
    <AnimatePresence>
      <QuickViewContent key={product.id} product={product} onClose={onClose} />
    </AnimatePresence>
  );
}
