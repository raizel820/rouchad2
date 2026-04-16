'use client';

import { useState } from 'react';
import { ShoppingBag, Star, Heart } from 'lucide-react';
import { useStore, type CartItem } from '@/store/store';
import { toast } from 'sonner';
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
  const { addToCart, setProductId, navigate, toggleWishlist, wishlistItems, isAuthenticated } = useStore();
  const [imgError, setImgError] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const isWishlisted = wishlistItems.includes(product.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    const cartItem: CartItem = {
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      category: product.category,
      quantity: 1,
    };
    addToCart(cartItem);
    toast.success(`${product.name} added to cart!`);
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      toast.error('Please log in to add items to your wishlist');
      return;
    }
    toggleWishlist(product.id);
    toast.success(isWishlisted ? `${product.name} removed from wishlist` : `${product.name} added to wishlist!`);

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

  return (
    <motion.div
      className="group cursor-pointer"
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      onClick={handleClick}
    >
      <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-[#f5e6e0]/50">
        <div className="relative aspect-square bg-[#fef5f1] overflow-hidden">
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
            <div className="absolute inset-0 bg-gradient-to-br from-[#fef5f1] to-[#f5e6e0] flex items-center justify-center">
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
              onClick={handleToggleWishlist}
              className="bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-sm hover:bg-white transition-colors"
              aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            >
              <Heart
                size={14}
                className={isWishlisted ? 'fill-red-500 text-red-500' : 'text-[#8b6f63]'}
              />
            </button>
            <div className="bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-sm">
              <ShoppingBag size={14} className="text-[#8b6f63]" />
            </div>
          </div>
        </div>

        <div className="p-4">
          <p className="text-xs text-[#8b6f63]/50 uppercase tracking-wide mb-1">{product.category}</p>
          <h3 className="text-[#8b6f63] font-medium mb-2 line-clamp-1 group-hover:text-[#d4a5a5] transition-colors">{product.name}</h3>
          <div className="flex items-center gap-1 mb-3">
            <Star size={14} className="fill-[#d4a5a5] text-[#d4a5a5]" />
            <span className="text-sm text-[#8b6f63] font-medium">{product.rating}</span>
            <span className="text-xs text-[#8b6f63]/50">({product.reviewCount})</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-lg text-[#8b6f63] font-semibold">${product.price.toFixed(2)}</span>
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
