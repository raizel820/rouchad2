'use client';

import { useState, useEffect } from 'react';
import { ShoppingBag, Star, Heart, Eye } from 'lucide-react';
import { useStore, type CartItem } from '@/store/store';
import { toast } from '@/lib/toast';
import { motion } from 'framer-motion';

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
  };
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart, setProductId, navigate, toggleWishlist, wishlistItems, isAuthenticated, openQuickView } = useStore();
  const [imgError, setImgError] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [productColors, setProductColors] = useState<string[]>([]);
  const isWishlisted = wishlistItems.includes(product.id);

  // Fetch product colors from API
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
              setProductColors(colorsArr.slice(0, 5)); // Show up to 5 color dots
            }
          } catch {
            // Invalid JSON, ignore
          }
        }
      })
      .catch(() => {
        // Silently fail
      });
    return () => { cancelled = true; };
  }, [product.id]);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    const cartItem: CartItem = {
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      category: product.category,
      quantity: 1,
      selectedColor: 'default',
    };
    addToCart(cartItem);
    toast(`${product.name} added to cart!`);
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      toast('Please log in to add items to your wishlist', 'error');
      return;
    }
    toggleWishlist(product.id);
    toast(isWishlisted ? `${product.name} removed from wishlist` : `${product.name} added to wishlist!`);

    // Call API in background
    if (isWishlisted) {
      const { user: currentUser } = useStore.getState();
      fetch(`/api/wishlist?productId=${product.id}${currentUser ? '&userId=' + currentUser.id : ''}`, { method: 'DELETE' }).catch(() => {});
    } else {
      // We need the user ID from the store
      const { user } = useStore.getState();
      if (user) {
        fetch('/api/wishlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id, productId: product.id }),
        }).catch(() => {});
      }
    }
  };

  const handleClick = () => {
    setProductId(product.id);
    navigate('product-detail');
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.stopPropagation();
    openQuickView(product);
  };

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
          {!imgError ? (
            <img
              src={product.image}
              alt={product.name}
              className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
              onError={() => setImgError(true)}
              onLoad={() => setImgLoaded(true)}
              loading="lazy"
            />
          ) : null}
          {(!imgLoaded || imgError) && (
            <div className="absolute inset-0 bg-gradient-to-br from-[#fef5f1] to-[#f5e6e0] dark:from-[#3d2f34] dark:to-[#2d1f24] flex items-center justify-center">
              <span className="text-4xl opacity-30">💄</span>
            </div>
          )}
          {product.badge && (
            <div className="absolute top-3 left-3 bg-[#d4a5a5] text-white text-xs px-3 py-1 rounded-full font-medium shadow-sm">
              {product.badge}
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
            <button
              onClick={handleToggleWishlist}
              className="bg-white/90 dark:bg-[#3d2f34]/90 backdrop-blur-sm rounded-full p-2 shadow-sm hover:bg-white dark:hover:bg-[#4d3f44] transition-colors"
              aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            >
              <Heart
                size={14}
                className={isWishlisted ? 'fill-red-500 text-red-500' : 'text-[#8b6f63] dark:text-[#e8ddd5]'}
              />
            </button>
            <button
              onClick={handleAddToCart}
              className="bg-white/90 dark:bg-[#3d2f34]/90 backdrop-blur-sm rounded-full p-2 shadow-sm hover:bg-white dark:hover:bg-[#4d3f44] transition-colors"
              aria-label="Quick add to cart"
            >
              <ShoppingBag size={14} className="text-[#8b6f63] dark:text-[#e8ddd5]" />
            </button>
          </div>
        </div>

        <div className="p-4">
          <p className="text-xs text-[#8b6f63]/50 dark:text-[#e8ddd5]/50 uppercase tracking-wide mb-1">{product.category}</p>
          <h3 className="text-[#8b6f63] dark:text-[#e8ddd5] font-medium mb-1 line-clamp-1 group-hover:text-[#d4a5a5] dark:group-hover:text-[#e8a5a5] transition-colors">{product.name}</h3>

          {/* Color Dots */}
          {displayColors.length > 0 && (
            <div className="flex items-center gap-1 mb-2">
              {displayColors.map((color, i) => (
                <span
                  key={i}
                  className="w-3.5 h-3.5 rounded-full border border-gray-200 dark:border-gray-600 shadow-sm flex-shrink-0"
                  style={{ backgroundColor: color }}
                  title={color}
                />
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
            <span className="text-lg text-[#8b6f63] dark:text-[#e8ddd5] font-semibold">${product.price.toFixed(2)}</span>
            <button
              onClick={handleAddToCart}
              className="px-4 py-2 bg-[#d4a5a5] text-white text-xs rounded-full hover:bg-[#c89a9a] transition-all flex items-center gap-1.5 active:scale-95"
            >
              <ShoppingBag size={14} />
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
