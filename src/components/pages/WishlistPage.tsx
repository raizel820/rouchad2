'use client';

import { useEffect, useState } from 'react';
import { useStore, type CartItem } from '@/store/store';
import { ProductCard } from '@/components/ProductCard';
import { ProductCardSkeleton } from '@/components/Skeletons';
import { Heart, ShoppingBag, X, ArrowRight, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from '@/lib/toast';

interface Product {
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
}

export function WishlistPage() {
  const {
    wishlistItems,
    toggleWishlist,
    addToCart,
    navigate,
    isAuthenticated,
    user,
    setSelectedCategory,
  } = useStore();

  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoaded, setProductsLoaded] = useState(false);

  // Fetch product details for all wishlisted items
  useEffect(() => {
    if (wishlistItems.length === 0) return;

    let cancelled = false;

    Promise.all(
      wishlistItems.map((id) =>
        fetch(`/api/products/${id}`)
          .then((r) => r.json())
          .catch(() => null)
      )
    )
      .then((results) => {
        if (cancelled) return;
        const validProducts = results.filter((p) => p && p.id) as Product[];
        setProducts(validProducts);
        setProductsLoaded(true);
      })
      .catch(() => {
        if (!cancelled) setProductsLoaded(true);
      });

    return () => {
      cancelled = true;
    };
  }, [wishlistItems]);

  const loading = wishlistItems.length > 0 && !productsLoaded;

  // Only show products that are still in the wishlist (handles removal while products state hasn't updated yet)
  const displayProducts = products.filter((p) => wishlistItems.includes(p.id));

  const handleRemoveFromWishlist = (productId: string, productName: string) => {
    toggleWishlist(productId);
    toast(`${productName} removed from wishlist`);

    // Persist removal to backend
    const currentUser = useStore.getState().user;
    fetch(
      `/api/wishlist?productId=${productId}${currentUser ? '&userId=' + currentUser.id : ''}`,
      { method: 'DELETE' }
    ).catch(() => {});
  };

  const handleMoveToCart = (product: Product) => {
    const isOnSale = product.onSale && product.effectiveDiscount && product.effectiveDiscount > 0;
    const displayPrice = isOnSale ? product.discountedPrice || product.price : product.price;

    const cartItem: CartItem = {
      id: product.id,
      name: product.name,
      price: displayPrice,
      originalPrice: isOnSale ? product.price : undefined,
      image: product.image,
      category: product.category,
      quantity: 1,
      selectedColor: 'default',
      saleName: product.saleName,
      effectiveDiscount: isOnSale ? product.effectiveDiscount : undefined,
    };

    addToCart(cartItem);
    toast(`${product.name} added to cart!`);
  };

  const handleAddAllToCart = () => {
    if (products.length === 0) return;

    products.forEach((product) => {
      const isOnSale = product.onSale && product.effectiveDiscount && product.effectiveDiscount > 0;
      const displayPrice = isOnSale ? product.discountedPrice || product.price : product.price;

      const cartItem: CartItem = {
        id: product.id,
        name: product.name,
        price: displayPrice,
        originalPrice: isOnSale ? product.price : undefined,
        image: product.image,
        category: product.category,
        quantity: 1,
        selectedColor: 'default',
        saleName: product.saleName,
        effectiveDiscount: isOnSale ? product.effectiveDiscount : undefined,
      };

      addToCart(cartItem);
    });

    toast(`${products.length} item${products.length > 1 ? 's' : ''} added to cart!`);
  };

  const handleBrowseProducts = () => {
    setSelectedCategory('All');
    navigate('products');
  };

  // Empty state — show when wishlist has no items
  if (wishlistItems.length === 0) {
    return (
      <div className="min-h-screen">
        <div className="container mx-auto px-4 py-12">
          <motion.div
            className="flex flex-col items-center justify-center py-20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Heart icon with animation */}
            <motion.div
              className="w-28 h-28 rounded-full bg-[#fef5f1] dark:bg-[#3d2f34] flex items-center justify-center mb-8"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            >
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              >
                <Heart
                  size={48}
                  className="text-[#d4a5a5]/40 dark:text-[#d4a5a5]/30"
                />
              </motion.div>
            </motion.div>

            <motion.h2
              className="text-2xl font-serif text-[#8b6f63] dark:text-[#e8ddd5] mb-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              Your wishlist is empty
            </motion.h2>

            <motion.p
              className="text-[#8b6f63]/60 dark:text-[#e8ddd5]/40 text-center max-w-md mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {isAuthenticated
                ? 'Save your favorite products here so you can easily find them later. Start exploring our collection!'
                : 'Log in to save your favorite products and build your dream wishlist.'}
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <button
                onClick={handleBrowseProducts}
                className="inline-flex items-center gap-2 px-8 py-3 bg-[#d4a5a5] text-white text-sm rounded-full hover:bg-[#c89a9a] transition-all active:scale-95 shadow-sm"
              >
                <ShoppingBag size={16} />
                Browse Products
                <ArrowRight size={16} />
              </button>
              {!isAuthenticated && (
                <button
                  onClick={() => navigate('login')}
                  className="inline-flex items-center gap-2 px-8 py-3 border-2 border-[#d4a5a5] text-[#d4a5a5] text-sm rounded-full hover:bg-[#d4a5a5] hover:text-white transition-all active:scale-95"
                >
                  Log In
                </button>
              )}
            </motion.div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <motion.div
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Heart size={28} className="text-[#d4a5a5] fill-[#d4a5a5]" />
              <h1 className="text-3xl font-serif text-[#8b6f63] dark:text-[#e8ddd5]">
                My Wishlist
              </h1>
              <span className="inline-flex items-center justify-center px-3 py-0.5 bg-[#d4a5a5]/10 text-[#d4a5a5] dark:text-[#d4a5a5] text-sm font-medium rounded-full">
                {displayProducts.length} {displayProducts.length === 1 ? 'item' : 'items'}
              </span>
            </div>
            <p className="text-[#8b6f63]/70 dark:text-[#e8ddd5]/50 text-sm">
              Products you&apos;ve saved for later
            </p>
          </div>

          {/* Batch actions */}
          {displayProducts.length > 0 && (
            <motion.div
              className="flex items-center gap-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <button
                onClick={handleAddAllToCart}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#d4a5a5] text-white text-sm rounded-full hover:bg-[#c89a9a] transition-all active:scale-95 shadow-sm"
              >
                <ShoppingBag size={16} />
                Add All to Cart
              </button>
              <button
                onClick={handleBrowseProducts}
                className="inline-flex items-center gap-2 px-5 py-2.5 border-2 border-[#d4a5a5] text-[#d4a5a5] text-sm rounded-full hover:bg-[#d4a5a5] hover:text-white transition-all active:scale-95"
              >
                Continue Shopping
              </button>
            </motion.div>
          )}
        </motion.div>

        {/* Products Grid */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {[...Array(Math.min(wishlistItems.length, 4) || 4)].map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="wishlist-grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              <AnimatePresence>
                {displayProducts.map((product, idx) => (
                  <motion.div
                    key={product.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                    transition={{ delay: 0.03 * idx }}
                  >
                    <div className="relative group">
                      <ProductCard product={product} />

                      {/* Action overlay on hover */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 dark:group-hover:bg-black/20 rounded-xl transition-colors duration-300 pointer-events-none" />

                      {/* Quick action buttons - visible on hover */}
                      <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 z-10">
                        <div className="flex gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMoveToCart(product);
                            }}
                            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-[#d4a5a5] text-white text-xs rounded-full hover:bg-[#c89a9a] transition-all active:scale-95 shadow-lg"
                          >
                            <ShoppingBag size={12} />
                            Move to Cart
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveFromWishlist(product.id, product.name);
                            }}
                            className="inline-flex items-center justify-center px-3 py-2 bg-white/95 dark:bg-[#2d1f24]/95 backdrop-blur-sm text-red-500 text-xs rounded-full hover:bg-red-50 dark:hover:bg-red-500/10 transition-all active:scale-95 shadow-lg border border-red-100 dark:border-red-500/20"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom action bar when items exist */}
        {!loading && displayProducts.length > 0 && (
          <motion.div
            className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4 p-5 bg-[#fef5f1] dark:bg-[#2d1f24] rounded-xl border border-[#f5e6e0]/50 dark:border-[#3d2f34]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#d4a5a5]/10 dark:bg-[#d4a5a5]/20 flex items-center justify-center">
                <ShoppingBag size={18} className="text-[#d4a5a5]" />
              </div>
              <div>
                <p className="text-sm font-medium text-[#8b6f63] dark:text-[#e8ddd5]">
                  {displayProducts.length} {displayProducts.length === 1 ? 'item' : 'items'} in your wishlist
                </p>
                <p className="text-xs text-[#8b6f63]/60 dark:text-[#e8ddd5]/40">
                  Ready to make them yours?
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  displayProducts.forEach((p) => handleRemoveFromWishlist(p.id, p.name));
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-full transition-colors"
              >
                <Trash2 size={14} />
                Clear All
              </button>
              <button
                onClick={handleAddAllToCart}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#d4a5a5] text-white text-sm rounded-full hover:bg-[#c89a9a] transition-all active:scale-95 shadow-sm"
              >
                <ShoppingBag size={16} />
                Add All to Cart
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
