'use client';

import { useState, useEffect, useCallback } from 'react';
import { useStore, type CartItem, type Product } from '@/store/store';
import { Star, ShoppingBag, Heart, X, Eye, Minus, Plus, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { toast } from '@/lib/toast';
import { motion, AnimatePresence } from 'framer-motion';

interface FullProductData {
  images?: string | null;
  colors?: string | null;
  discountPercentage?: number;
}

function QuickViewContent({ product, onClose }: { product: Product; onClose: () => void }) {
  const { addToCart, setProductId, navigate, toggleWishlist, wishlistItems, isAuthenticated, user, closeQuickView } = useStore();
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imgErrors, setImgErrors] = useState<Set<number>>(new Set());
  const [availableColors, setAvailableColors] = useState<string[]>([]);
  const [selectedColor, setSelectedColor] = useState('');
  const [loadingColors, setLoadingColors] = useState(true);
  const [allImages, setAllImages] = useState<string[]>([product.image]);
  const [fullData, setFullData] = useState<FullProductData | null>(null);
  const [addedToCart, setAddedToCart] = useState(false);

  const isWishlisted = wishlistItems.includes(product.id);

  // Compute sale info
  const isOnSale = product.onSale && product.effectiveDiscount && product.effectiveDiscount > 0;
  const displayPrice = isOnSale ? (product.discountedPrice || product.price) : product.price;
  const originalPrice = isOnSale ? product.price : null;
  const discountPercent = isOnSale ? product.effectiveDiscount : 0;
  const savings = isOnSale ? product.savings || (originalPrice ? originalPrice - displayPrice : 0) : 0;

  // Fetch full product data (including colors, images) from API
  useEffect(() => {
    let cancelled = false;
    fetch(`/api/products/${product.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;

        setFullData(data);

        // Parse images
        if (data.images) {
          try {
            const imgsArr = JSON.parse(data.images);
            if (Array.isArray(imgsArr) && imgsArr.length > 0) {
              setAllImages([product.image, ...imgsArr.filter((img: string) => img !== product.image)]);
            }
          } catch {
            // Invalid JSON, keep default
          }
        }

        // Parse colors
        if (data.colors) {
          try {
            const colorsArr = JSON.parse(data.colors);
            if (Array.isArray(colorsArr) && colorsArr.length > 0) {
              setAvailableColors(colorsArr);
              setSelectedColor(colorsArr[0]);
            }
          } catch {
            // Invalid JSON, ignore
          }
        }
      })
      .catch(() => {
        // Silently fail
      })
      .finally(() => {
        if (!cancelled) setLoadingColors(false);
      });
    return () => { cancelled = true; };
  }, [product.id, product.image]);

  // ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handlePrevImage = useCallback(() => {
    setCurrentImageIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1));
    setImgErrors(new Set());
  }, [allImages.length]);

  const handleNextImage = useCallback(() => {
    setCurrentImageIndex((prev) => (prev === allImages.length - 1 ? 0 : prev + 1));
    setImgErrors(new Set());
  }, [allImages.length]);

  const handleImgError = (index: number) => {
    setImgErrors((prev) => new Set(prev).add(index));
  };

  const handleAddToCart = () => {
    const color = availableColors.length > 0 ? (selectedColor || availableColors[0]) : 'default';
    for (let i = 0; i < quantity; i++) {
      const cartItem: CartItem = {
        id: product.id,
        name: product.name,
        price: displayPrice,
        image: product.image,
        category: product.category,
        quantity: 1,
        selectedColor: color,
        originalPrice: originalPrice || undefined,
        effectiveDiscount: discountPercent || undefined,
      };
      addToCart(cartItem);
    }
    toast(`${quantity} x ${product.name}${availableColors.length > 0 ? ` (${color})` : ''} added to cart!`);

    // Trigger animation
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 800);
  };

  const handleWishlistToggle = () => {
    if (!isAuthenticated || !user) {
      toast('Please log in to add items to your wishlist', 'error');
      return;
    }
    toggleWishlist(product.id);
    toast(isWishlisted ? `${product.name} removed from wishlist` : `${product.name} added to wishlist!`);

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

  const showArrows = allImages.length > 1;

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
          className="bg-white dark:bg-[#2d1f24] rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto relative"
          initial={{ scale: 0.85, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.85, opacity: 0, y: 30 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-white/90 dark:bg-[#3d2f34]/90 backdrop-blur-sm shadow-sm flex items-center justify-center hover:bg-[#fef5f1] dark:hover:bg-[#4d3f44] transition-colors"
            aria-label="Close quick view"
          >
            <X size={16} className="text-[#8b6f63] dark:text-[#e8ddd5]" />
          </button>

          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* Image Gallery */}
            <div className="bg-[#fef5f1] dark:bg-[#3d2f34] aspect-square relative overflow-hidden rounded-t-2xl md:rounded-l-2xl md:rounded-tr-none">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentImageIndex}
                  className="absolute inset-0"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  {!imgErrors.has(currentImageIndex) ? (
                    <img
                      src={allImages[currentImageIndex]}
                      alt={`${product.name} - Image ${currentImageIndex + 1}`}
                      className="w-full h-full object-cover"
                      onError={() => handleImgError(currentImageIndex)}
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-[#fef5f1] to-[#f5e6e0] dark:from-[#3d2f34] dark:to-[#2d1f24] flex items-center justify-center">
                      <span className="text-6xl opacity-30">💄</span>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Sale Badge */}
              {isOnSale && discountPercent > 0 && (
                <motion.div
                  className="absolute top-4 left-4 z-10 flex items-center gap-1"
                  initial={{ scale: 0, rotate: -12 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', delay: 0.2, damping: 15 }}
                >
                  <span className="bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1">
                    <Sparkles size={12} />
                    {discountPercent}% OFF
                  </span>
                </motion.div>
              )}

              {/* Original badge (not sale) */}
              {!isOnSale && product.badge && (
                <div className="absolute top-4 left-4 z-10 bg-[#d4a5a5] text-white text-xs px-3 py-1 rounded-full font-medium shadow-sm">
                  {product.badge}
                </div>
              )}

              {/* Prev Arrow */}
              {showArrows && (
                <button
                  onClick={handlePrevImage}
                  className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white/80 dark:bg-[#2d1f24]/80 backdrop-blur-sm shadow-md flex items-center justify-center hover:bg-white dark:hover:bg-[#3d2f34] transition-all hover:scale-105 active:scale-95"
                  aria-label="Previous image"
                >
                  <ChevronLeft size={18} className="text-[#8b6f63] dark:text-[#e8ddd5]" />
                </button>
              )}

              {/* Next Arrow */}
              {showArrows && (
                <button
                  onClick={handleNextImage}
                  className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white/80 dark:bg-[#2d1f24]/80 backdrop-blur-sm shadow-md flex items-center justify-center hover:bg-white dark:hover:bg-[#3d2f34] transition-all hover:scale-105 active:scale-95"
                  aria-label="Next image"
                >
                  <ChevronRight size={18} className="text-[#8b6f63] dark:text-[#e8ddd5]" />
                </button>
              )}

              {/* Image counter */}
              {showArrows && (
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 bg-black/40 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full">
                  {currentImageIndex + 1} / {allImages.length}
                </div>
              )}

              {/* Thumbnail Strip */}
              {showArrows && allImages.length > 1 && (
                <div className="absolute bottom-3 left-3 right-3 z-10 hidden md:flex justify-center gap-1.5 pointer-events-none">
                  {allImages.slice(0, 5).map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => { setCurrentImageIndex(idx); setImgErrors(new Set()); }}
                      className={`pointer-events-auto w-2 h-2 rounded-full transition-all ${
                        idx === currentImageIndex
                          ? 'bg-white w-4'
                          : 'bg-white/50 hover:bg-white/70'
                      }`}
                      aria-label={`Go to image ${idx + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="p-6 md:p-8 flex flex-col justify-center">
              {/* Category Badge */}
              <span className="inline-block w-fit text-xs text-[#8b6f63]/70 dark:text-[#e8ddd5]/70 uppercase tracking-wider bg-[#fef5f1] dark:bg-[#3d2f34] px-3 py-1 rounded-full mb-3">
                {product.category}
              </span>

              {/* Name */}
              <h2 className="text-xl md:text-2xl font-serif text-[#8b6f63] dark:text-[#e8ddd5] mb-3">{product.name}</h2>

              {/* Rating */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      className={i < Math.floor(product.rating) ? 'fill-[#d4a5a5] text-[#d4a5a5]' : 'text-[#8b6f63]/20 dark:text-[#e8ddd5]/20'}
                    />
                  ))}
                </div>
                <span className="text-sm text-[#8b6f63] dark:text-[#e8ddd5] font-medium">{product.rating}</span>
                <span className="text-xs text-[#8b6f63]/50 dark:text-[#e8ddd5]/50">({product.reviewCount} reviews)</span>
              </div>

              {/* Animated Price */}
              <div className="mb-4">
                {isOnSale && originalPrice ? (
                  <div className="flex items-baseline gap-3 flex-wrap">
                    <motion.span
                      className="text-2xl text-[#8b6f63] dark:text-[#e8ddd5] font-bold"
                      initial={{ y: 10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ type: 'spring', damping: 20 }}
                    >
                      ${displayPrice.toFixed(2)}
                    </motion.span>
                    <motion.span
                      className="text-base text-[#8b6f63]/40 line-through"
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ delay: 0.15, duration: 0.3 }}
                      style={{ transformOrigin: 'left' }}
                    >
                      ${originalPrice.toFixed(2)}
                    </motion.span>
                    {savings > 0 && (
                      <motion.span
                        className="text-xs font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded-full"
                        initial={{ opacity: 0, x: -5 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                      >
                        You save ${savings.toFixed(2)}
                      </motion.span>
                    )}
                  </div>
                ) : (
                  <div className="text-2xl text-[#8b6f63] dark:text-[#e8ddd5] font-semibold">${product.price.toFixed(2)}</div>
                )}
              </div>

              {/* Description */}
              <p className="text-sm text-[#8b6f63]/70 dark:text-[#e8ddd5]/70 leading-relaxed mb-6 line-clamp-3">{product.description}</p>

              {/* Color Selector */}
              {availableColors.length > 0 && (
                <motion.div
                  className="mb-6"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-sm font-medium text-[#8b6f63] dark:text-[#e8d5cf]">Color:</span>
                    <span className="text-sm text-[#d4a5a5] dark:text-[#e8a5a5] font-medium">{selectedColor}</span>
                  </div>
                  <div className="flex items-center gap-3 flex-wrap">
                    {availableColors.map((color) => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`w-8 h-8 rounded-full border-2 transition-all duration-200 hover:scale-110 ${
                          selectedColor === color
                            ? 'border-[#8b6f63] scale-110 shadow-md ring-2 ring-[#8b6f63]/20'
                            : 'border-gray-200 hover:border-gray-400 dark:border-gray-600 dark:hover:border-gray-400'
                        }`}
                        style={{ backgroundColor: color }}
                        title={color}
                        aria-label={`Select color ${color}`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-[#8b6f63]/50 dark:text-[#8b6f63]/40 mt-2">{availableColors.length} colors available</p>
                </motion.div>
              )}

              {/* Color Loading Skeleton */}
              {loadingColors && (
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="h-4 w-12 bg-[#f5e6e0]/50 dark:bg-[#3d2f34] rounded animate-pulse" />
                    <div className="h-4 w-16 bg-[#f5e6e0]/50 dark:bg-[#3d2f34] rounded animate-pulse" />
                  </div>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="w-8 h-8 rounded-full bg-[#f5e6e0]/50 dark:bg-[#3d2f34] animate-pulse" />
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity Selector */}
              <div className="flex items-center gap-4 mb-6">
                <span className="text-sm text-[#8b6f63] dark:text-[#e8ddd5]">Qty:</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-9 h-9 rounded-full bg-[#fef5f1] dark:bg-[#3d2f34] text-[#8b6f63] dark:text-[#e8ddd5] hover:bg-[#f5e6e0] dark:hover:bg-[#4d3f44] transition-colors flex items-center justify-center active:scale-90"
                    aria-label="Decrease quantity"
                  >
                    <Minus size={14} />
                  </button>
                  <motion.span
                    key={quantity}
                    className="w-8 text-center text-[#8b6f63] dark:text-[#e8ddd5] font-semibold text-sm"
                    initial={{ y: -5, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.15 }}
                  >
                    {quantity}
                  </motion.span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-9 h-9 rounded-full bg-[#fef5f1] dark:bg-[#3d2f34] text-[#8b6f63] dark:text-[#e8ddd5] hover:bg-[#f5e6e0] dark:hover:bg-[#4d3f44] transition-colors flex items-center justify-center active:scale-90"
                    aria-label="Increase quantity"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3">
                <motion.button
                  onClick={handleAddToCart}
                  className="flex-1 px-6 py-3.5 bg-[#d4a5a5] text-white rounded-full hover:bg-[#c89a9a] transition-all flex items-center justify-center gap-2 text-sm font-medium shadow-lg shadow-[#d4a5a5]/20 hover:shadow-[#d4a5a5]/30"
                  whileTap={{ scale: 0.96 }}
                  animate={addedToCart ? { scale: [1, 1.05, 1] } : {}}
                  transition={addedToCart ? { duration: 0.4 } : {}}
                >
                  {addedToCart ? (
                    <motion.svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <motion.path
                        d="M5 13l4 4L19 7"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 0.3 }}
                      />
                    </motion.svg>
                  ) : (
                    <ShoppingBag size={18} />
                  )}
                  {addedToCart ? 'Added!' : 'Add to Cart'}
                </motion.button>
                <motion.button
                  onClick={handleWishlistToggle}
                  whileTap={{ scale: 0.95 }}
                  className={`px-5 py-3.5 rounded-full transition-all flex items-center gap-2 text-sm font-medium ${
                    isWishlisted
                      ? 'bg-red-50 dark:bg-red-950/30 border-2 border-red-400 text-red-500 hover:bg-red-100 dark:hover:bg-red-950/50'
                      : 'border-2 border-[#d4a5a5] text-[#d4a5a5] hover:bg-[#d4a5a5] hover:text-white'
                  }`}
                >
                  <Heart size={16} className={isWishlisted ? 'fill-red-500 text-red-500' : ''} />
                  {isWishlisted ? 'Saved' : 'Wishlist'}
                </motion.button>
              </div>

              {/* View Details Link */}
              <motion.button
                onClick={handleViewDetails}
                className="mt-4 flex items-center gap-2 text-sm text-[#d4a5a5] hover:text-[#8b6f63] dark:hover:text-[#e8ddd5] transition-colors mx-auto group"
                whileHover={{ x: 3 }}
              >
                <Eye size={14} />
                View Full Details
                <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
              </motion.button>
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
