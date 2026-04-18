'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { ShoppingBag, Star, Heart, Eye, Percent, Check, AlertTriangle, GitCompareArrows } from 'lucide-react';
import { useStore, type CartItem } from '@/store/store';
import { toast } from '@/lib/toast';
import { motion, AnimatePresence } from 'framer-motion';

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    price: number;
    category: string;
    image: string;
    description: string;
    badge?: string;
    rating: number;
    reviewCount: number;
    discountedPrice?: number;
    effectiveDiscount?: number;
    savings?: number;
    saleName?: string | null;
    onSale?: boolean;
    stock?: number;
  };
}

/** Small particle that radiates outward from the heart */
function HeartParticle({ index, total }: { index: number; total: number }) {
  const angle = (index / total) * Math.PI * 2;
  const distance = 18 + Math.random() * 10;
  const x = Math.cos(angle) * distance;
  const y = Math.sin(angle) * distance;
  const colors = ['#ef4444', '#f87171', '#fca5a5', '#fecdd3', '#fb7185', '#e11d48'];
  const color = colors[index % colors.length];
  const size = 3 + Math.random() * 3;

  return (
    <motion.span
      className="absolute rounded-full pointer-events-none"
      style={{ width: size, height: size, backgroundColor: color, top: '50%', left: '50%' }}
      initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
      animate={{ x, y, opacity: 0, scale: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    />
  );
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart, setProductId, navigate, toggleWishlist, wishlistItems, isAuthenticated, openQuickView, compareProductIds, addToCompare } = useStore();
  const [imgError, setImgError] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [productColors, setProductColors] = useState<string[]>([]);
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);
  const [addedToCart, setAddedToCart] = useState(false);
  const [showHeartBurst, setShowHeartBurst] = useState(false);
  const [productStock, setProductStock] = useState<number | null>(null);
  const addedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isWishlisted = wishlistItems.includes(product.id);

  const isOnSale = product.onSale && product.effectiveDiscount && product.effectiveDiscount > 0;
  const displayPrice = isOnSale ? product.discountedPrice || product.price : product.price;
  const originalPrice = isOnSale ? product.price : null;
  const discountPercent = isOnSale ? product.effectiveDiscount : 0;
  const savings = isOnSale ? product.savings : 0;

  const isLowStock = (productStock ?? product.stock ?? 50) > 0 && (productStock ?? product.stock ?? 50) < 5;
  const stockCount = productStock ?? product.stock ?? 50;

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/products/${product.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        if (data.colors) {
          try {
            const colorsArr = JSON.parse(data.colors);
            if (Array.isArray(colorsArr) && colorsArr.length > 0) {
              setProductColors(colorsArr.slice(0, 5));
            }
          } catch {}
        }
        if (data.stock !== undefined) {
          setProductStock(data.stock);
        }
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [product.id]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (addedTimerRef.current) clearTimeout(addedTimerRef.current);
    };
  }, []);

  const handleAddToCart = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (addedToCart) return;
    const cartItem: CartItem = {
      id: product.id,
      name: product.name,
      price: displayPrice,
      originalPrice: originalPrice || undefined,
      image: product.image,
      category: product.category,
      quantity: 1,
      selectedColor: 'default',
      saleName: product.saleName,
      effectiveDiscount: discountPercent || undefined,
    };
    addToCart(cartItem);
    toast(`${product.name} added to cart!`);
    setAddedToCart(true);
    if (addedTimerRef.current) clearTimeout(addedTimerRef.current);
    addedTimerRef.current = setTimeout(() => setAddedToCart(false), 1500);
  }, [addedToCart, addToCart, product, displayPrice, originalPrice, discountPercent]);

  const handleToggleWishlist = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      toast('Please log in to add items to your wishlist', 'error');
      return;
    }
    if (!isWishlisted) {
      setShowHeartBurst(true);
      setTimeout(() => setShowHeartBurst(false), 700);
    }
    toggleWishlist(product.id);
    toast(isWishlisted ? `${product.name} removed from wishlist` : `${product.name} added to wishlist!`);

    if (isWishlisted) {
      const { user: currentUser } = useStore.getState();
      fetch(`/api/wishlist?productId=${product.id}${currentUser ? '&userId=' + currentUser.id : ''}`, { method: 'DELETE' }).catch(() => {});
    } else {
      const { user } = useStore.getState();
      if (user) {
        fetch('/api/wishlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id, productId: product.id }),
        }).catch(() => {});
      }
    }
  }, [isAuthenticated, isWishlisted, toggleWishlist, product.id, product.name]);

  const handleClick = () => {
    setProductId(product.id);
    navigate('product-detail');
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.stopPropagation();
    openQuickView(product);
  };

  const handleColorSelect = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    setSelectedColorIndex(index);
  };

  const isInCompare = compareProductIds.includes(product.id);

  const handleCompare = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (isInCompare) {
      useStore.getState().removeFromCompare(product.id);
      toast(`${product.name} removed from comparison`);
      return;
    }
    const added = addToCompare(product.id);
    if (added) {
      toast(`${product.name} added to comparison!`);
    } else {
      toast('Comparison full (max 4 products)', 'error');
    }
  }, [isInCompare, addToCompare, product.id, product.name]);

  const displayColors = productColors.slice(0, 3);
  const remainingColors = productColors.length - 3;

  return (
    <motion.div
      className="group cursor-pointer"
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      onClick={handleClick}
    >
      <div className="bg-white dark:bg-[#2d1f24] rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-[#f5e6e0]/50 dark:border-[#3d2f34]/50">
        <div className="relative aspect-square bg-[#fef5f1] dark:bg-[#3d2f34] overflow-hidden">
          {/* Ken Burns zoom + translate on hover */}
          {!imgError ? (
            <img
              src={product.image}
              alt={product.name}
              className={`w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110 group-hover:translate-x-1 group-hover:translate-y-[-4px] ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
              onError={() => setImgError(true)}
              onLoad={() => setImgLoaded(true)}
              loading="lazy"
              draggable={false}
            />
          ) : null}
          {(!imgLoaded || imgError) && (
            <div className="absolute inset-0 bg-gradient-to-br from-[#fef5f1] to-[#f5e6e0] dark:from-[#3d2f34] dark:to-[#2d1f24] flex items-center justify-center">
              <span className="text-4xl opacity-30">💄</span>
            </div>
          )}

          {/* Gradient overlay at bottom on hover */}
          <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

          {/* Sale Badge with pulse + slide-in */}
          {isOnSale && (
            <motion.div
              className="absolute top-3 left-3 flex items-center gap-1.5"
              initial={{ x: -20, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            >
              <motion.div
                className="bg-red-500 text-white text-xs px-2.5 py-1 rounded-full font-semibold shadow-sm flex items-center gap-1"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              >
                <Percent size={12} />
                {discountPercent}% OFF
              </motion.div>
              {product.badge && (
                <div className="bg-[#d4a5a5] text-white text-xs px-3 py-1 rounded-full font-medium shadow-sm">
                  {product.badge}
                </div>
              )}
            </motion.div>
          )}
          {!isOnSale && product.badge && (
            <motion.div
              className="absolute top-3 left-3 bg-[#d4a5a5] text-white text-xs px-3 py-1 rounded-full font-medium shadow-sm"
              initial={{ x: -20, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            >
              {product.badge}
            </motion.div>
          )}

          {/* Low stock badge */}
          {isLowStock && (
            <motion.div
              className="absolute top-3 left-1/2 -translate-x-1/2 bg-orange-500 text-white text-[10px] px-2 py-0.5 rounded-full font-semibold shadow-sm flex items-center gap-1"
              initial={{ y: -10, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 300, damping: 25 }}
            >
              <AlertTriangle size={10} />
              Only {stockCount} left!
            </motion.div>
          )}

          {/* Sale name ribbon */}
          {isOnSale && product.saleName && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs py-1.5 text-center font-medium">
              {product.saleName}
            </div>
          )}

          <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button
              onClick={handleQuickView}
              className="bg-white/90 dark:bg-[#3d2f34]/90 backdrop-blur-sm rounded-full p-2 shadow-sm hover:bg-white dark:hover:bg-[#4d3f44] transition-colors"
              aria-label="Quick view"
            >
              <Eye size={14} className="text-[#8b6f63] dark:text-[#e8ddd5]" />
            </button>
            {/* Wishlist with burst animation */}
            <button
              onClick={handleToggleWishlist}
              className="bg-white/90 dark:bg-[#3d2f34]/90 backdrop-blur-sm rounded-full p-2 shadow-sm hover:bg-white dark:hover:bg-[#4d3f44] transition-colors relative"
              aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            >
              <motion.div
                key={isWishlisted ? 'filled' : 'empty'}
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 500, damping: 15 }}
              >
                <Heart
                  size={14}
                  className={isWishlisted ? 'fill-red-500 text-red-500' : 'text-[#8b6f63] dark:text-[#e8ddd5]'}
                />
              </motion.div>
              {/* Heart burst particles */}
              <AnimatePresence>
                {showHeartBurst && (
                  <>
                    {Array.from({ length: 8 }).map((_, i) => (
                      <HeartParticle key={i} index={i} total={8} />
                    ))}
                  </>
                )}
              </AnimatePresence>
            </button>
            <button
              onClick={handleCompare}
              className={`bg-white/90 dark:bg-[#3d2f34]/90 backdrop-blur-sm rounded-full p-2 shadow-sm hover:bg-white dark:hover:bg-[#4d3f44] transition-colors ${isInCompare ? 'ring-2 ring-[#d4a5a5]' : ''}`}
              aria-label={isInCompare ? 'Remove from comparison' : 'Add to comparison'}
            >
              <motion.div
                key={isInCompare ? 'in' : 'out'}
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 500, damping: 15 }}
              >
                <GitCompareArrows size={14} className={isInCompare ? 'text-[#d4a5a5]' : 'text-[#8b6f63] dark:text-[#e8ddd5]'} />
              </motion.div>
            </button>
            <button
              onClick={handleAddToCart}
              className="bg-white/90 dark:bg-[#3d2f34]/90 backdrop-blur-sm rounded-full p-2 shadow-sm hover:bg-white dark:hover:bg-[#4d3f44] transition-colors"
              aria-label="Quick add to cart"
            >
              <motion.div
                key={addedToCart ? 'added' : 'idle'}
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 500, damping: 15 }}
              >
                {addedToCart ? (
                  <Check size={14} className="text-green-500" />
                ) : (
                  <ShoppingBag size={14} className="text-[#8b6f63] dark:text-[#e8ddd5]" />
                )}
              </motion.div>
            </button>
          </div>
        </div>

        <div className="p-4">
          <p className="text-xs text-[#8b6f63]/50 dark:text-[#e8ddd5]/50 uppercase tracking-wide mb-1">{product.category}</p>
          <h3 className="text-[#8b6f63] dark:text-[#e8ddd5] font-medium mb-1 line-clamp-1 group-hover:text-[#d4a5a5] dark:group-hover:text-[#e8a5a5] transition-colors">{product.name}</h3>

          {/* Color Dots with interactive selector */}
          {displayColors.length > 0 && (
            <div className="flex items-center gap-1.5 mb-2">
              {displayColors.map((color, i) => (
                <div key={i} className="relative group/swatch">
                  <motion.button
                    onClick={(e) => handleColorSelect(e, i)}
                    className={`w-4 h-4 rounded-full flex-shrink-0 transition-all duration-200 ${
                      selectedColorIndex === i
                        ? 'ring-2 ring-offset-1 ring-[#d4a5a5] dark:ring-offset-[#2d1f24]'
                        : 'ring-1 ring-gray-200 dark:ring-gray-600 hover:ring-[#d4a5a5]/50'
                    }`}
                    style={{ backgroundColor: color }}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                    aria-label={`Color ${color}`}
                  />
                  {/* Color tooltip */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-0.5 bg-[#2d1f24] text-[#e8ddd5] text-[10px] rounded-md whitespace-nowrap opacity-0 group-hover/swatch:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                    {color}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px border-4 border-transparent border-t-[#2d1f24]" />
                  </div>
                </div>
              ))}
              {remainingColors > 0 && (
                <span className="text-[10px] text-[#8b6f63]/50 dark:text-[#e8ddd5]/50 ml-0.5">
                  +{remainingColors}
                </span>
              )}
            </div>
          )}

          <div className="flex items-center gap-1 mb-3">
            <Star size={14} className="fill-[#d4a5a5] text-[#d4a5a5]" />
            <span className="text-sm text-[#8b6f63] dark:text-[#e8ddd5] font-medium">{product.rating}</span>
            <span className="text-xs text-[#8b6f63]/50 dark:text-[#e8ddd5]/50">({product.reviewCount})</span>
          </div>
          <div className="flex items-center justify-between">
            {/* Price Display */}
            <div className="flex items-center gap-2">
              <span className="text-lg text-[#8b6f63] dark:text-[#e8ddd5] font-semibold">${displayPrice.toFixed(2)}</span>
              {isOnSale && originalPrice && (
                <>
                  <span className="text-sm text-[#8b6f63]/40 line-through">${originalPrice.toFixed(2)}</span>
                  <span className="text-xs text-red-500 font-medium">-${savings?.toFixed(2)}</span>
                </>
              )}
            </div>
            {/* Add to Cart button with shimmer + checkmark animation */}
            <div className="relative">
              <motion.button
                onClick={handleAddToCart}
                className="relative overflow-hidden px-4 py-2 bg-[#d4a5a5] text-white text-xs rounded-full hover:bg-[#c89a9a] transition-all flex items-center gap-1.5 active:scale-95"
                whileTap={{ scale: 0.95 }}
              >
                {/* Shimmer effect */}
                <span className="absolute inset-0 overflow-hidden rounded-full pointer-events-none">
                  <span className="absolute -inset-full top-0 left-1/2 -translate-x-1/2 w-[200%] h-full bg-gradient-to-r from-transparent via-white/25 to-transparent -skew-x-12 group-hover:animate-[shimmer_1.5s_ease-in-out_infinite]" />
                </span>
                <motion.div
                  key={addedToCart ? 'check' : 'cart'}
                  initial={{ scale: 0.5, rotate: -90 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                >
                  {addedToCart ? (
                    <Check size={14} />
                  ) : (
                    <ShoppingBag size={14} />
                  )}
                </motion.div>
                <AnimatePresence mode="wait">
                  {addedToCart ? (
                    <motion.span
                      key="added"
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.2 }}
                      className="whitespace-nowrap overflow-hidden"
                    >
                      Added!
                    </motion.span>
                  ) : (
                    <motion.span
                      key="add"
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.15 }}
                      className="whitespace-nowrap overflow-hidden"
                    >
                      Add to Cart
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
