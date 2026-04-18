'use client';

import { useEffect, useState } from 'react';
import { useStore } from '@/store/store';
import { toast } from '@/lib/toast';
import {
  ArrowLeft, X, Star, Check, Minus,
  ShoppingBag, Heart, Rabbit, Leaf, Sparkles,
  Clock, Package, GitCompareArrows, Plus,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CompareProduct {
  id: string;
  name: string;
  price: number;
  category: string;
  image: string;
  description: string;
  badge?: string;
  rating: number;
  reviewCount: number;
  stock?: number;
  sales?: number;
  discountedPrice?: number;
  effectiveDiscount?: number;
  savings?: number;
  saleName?: string | null;
  onSale?: boolean;
}

const ATTRIBUTES = [
  { key: 'crueltyFree', label: 'Cruelty-Free', icon: Rabbit, value: true },
  { key: 'vegan', label: 'Vegan', icon: Leaf, value: true },
  { key: 'cleanBeauty', label: 'Clean Beauty', icon: Sparkles, value: true },
  { key: 'shelfLife', label: 'Shelf Life', icon: Clock, value: '12 Months' },
  { key: 'weight', label: 'Net Weight', icon: Package, value: '12g / 0.42 oz' },
] as const;

const ROW_LABELS = [
  { key: 'image', label: 'Image' },
  { key: 'name', label: 'Product' },
  { key: 'price', label: 'Price' },
  { key: 'rating', label: 'Rating' },
  { key: 'description', label: 'Description' },
  { key: 'attributes', label: 'Attributes' },
  { key: 'availability', label: 'Availability' },
  { key: 'action', label: '' },
] as const;

export function ComparePage() {
  const { compareProductIds, removeFromCompare, clearCompare, navigate, addToCart, toggleWishlist, wishlistItems, isAuthenticated, setProductId } = useStore();
  const [products, setProducts] = useState<CompareProduct[]>([]);
  const [imgErrors, setImgErrors] = useState<Set<string>>(new Set());

  const activeProducts = compareProductIds.length === 0 ? [] : products;
  const loading = compareProductIds.length > 0 && activeProducts.length === 0;

  useEffect(() => {
    if (compareProductIds.length === 0) {
      return;
    }

    let cancelled = false;

    Promise.all(
      compareProductIds.map((id) =>
        fetch(`/api/products/${id}`)
          .then((r) => r.json())
          .catch(() => null)
      )
    ).then((results) => {
      if (cancelled) return;
      const validProducts = results.filter(Boolean) as CompareProduct[];
      setProducts(validProducts);
    });

    return () => { cancelled = true; };
  }, [compareProductIds]);

  const handleRemove = (productId: string) => {
    removeFromCompare(productId);
    toast('Product removed from comparison');
  };

  const handleClearAll = () => {
    clearCompare();
    toast('Comparison cleared');
  };

  const handleAddToCart = (product: CompareProduct) => {
    const displayPrice = product.onSale && product.discountedPrice ? product.discountedPrice : product.price;
    addToCart({
      id: product.id,
      name: product.name,
      price: displayPrice,
      originalPrice: product.onSale ? product.price : undefined,
      image: product.image,
      category: product.category,
      quantity: 1,
      selectedColor: 'default',
      saleName: product.saleName,
      effectiveDiscount: product.effectiveDiscount,
    });
    toast(`${product.name} added to cart!`);
  };

  const handleWishlistToggle = (productId: string) => {
    if (!isAuthenticated) {
      toast('Please log in to add items to your wishlist', 'error');
      return;
    }
    toggleWishlist(productId);
  };

  const handleProductClick = (productId: string) => {
    setProductId(productId);
    navigate('product-detail');
  };

  const handleImgError = (productId: string) => {
    setImgErrors((prev) => new Set(prev).add(productId));
  };

  const getStockStatus = (product: CompareProduct) => {
    if (product.stock === undefined) return { text: 'In Stock', color: 'text-green-600 dark:text-green-400', dotColor: 'bg-green-500' };
    if (product.stock <= 0) return { text: 'Out of Stock', color: 'text-red-500', dotColor: 'bg-red-500' };
    if (product.stock <= 5) return { text: `Only ${product.stock} left`, color: 'text-amber-600 dark:text-amber-400', dotColor: 'bg-amber-500' };
    return { text: 'In Stock', color: 'text-green-600 dark:text-green-400', dotColor: 'bg-green-500' };
  };

  // Empty state
  if (!loading && activeProducts.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Back button */}
        <motion.button
          onClick={() => navigate('products')}
          className="inline-flex items-center gap-2 text-[#8b6f63] dark:text-[#e8ddd5] hover:text-[#d4a5a5] mb-8 transition-colors"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <ArrowLeft size={20} />
          Back to Products
        </motion.button>

        <motion.div
          className="text-center py-20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <motion.div
            className="w-24 h-24 mx-auto mb-6 rounded-full bg-[#fef5f1] dark:bg-[#3d2f34] flex items-center justify-center"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <GitCompareArrows size={40} className="text-[#d4a5a5]" />
          </motion.div>
          <h1 className="text-3xl font-serif text-[#8b6f63] dark:text-[#e8ddd5] mb-3">
            Compare Products
          </h1>
          <p className="text-[#8b6f63]/60 dark:text-[#e8ddd5]/60 max-w-md mx-auto mb-8 leading-relaxed">
            Select 2 to 4 products to compare them side by side. 
            Click the compare button on any product card or product page to get started.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <motion.button
              onClick={() => navigate('products')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-6 py-3 bg-[#d4a5a5] text-white rounded-full hover:bg-[#c89a9a] transition-colors flex items-center gap-2"
            >
              <Plus size={18} />
              Browse Products
            </motion.button>
          </div>

          {/* Step hints */}
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-lg mx-auto">
            {[
              { step: '1', text: 'Browse our products' },
              { step: '2', text: 'Click the compare icon' },
              { step: '3', text: 'Compare up to 4 items' },
            ].map((item) => (
              <div key={item.step} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#d4a5a5] text-white flex items-center justify-center text-sm font-semibold flex-shrink-0">
                  {item.step}
                </div>
                <span className="text-sm text-[#8b6f63]/70 dark:text-[#e8ddd5]/70 text-left">{item.text}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <motion.div
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-4">
          <motion.button
            onClick={() => navigate('products')}
            className="inline-flex items-center gap-2 text-[#8b6f63] dark:text-[#e8ddd5] hover:text-[#d4a5a5] transition-colors"
            whileHover={{ x: -3 }}
          >
            <ArrowLeft size={20} />
          </motion.button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-serif text-[#8b6f63] dark:text-[#e8ddd5] flex items-center gap-2">
              <GitCompareArrows size={24} className="text-[#d4a5a5]" />
              Compare Products
            </h1>
            <p className="text-sm text-[#8b6f63]/50 dark:text-[#e8ddd5]/50 mt-1">
              {activeProducts.length} of 4 products selected
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {activeProducts.length >= 2 && (
            <motion.button
              onClick={handleClearAll}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-4 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-full transition-colors flex items-center gap-1.5"
            >
              <X size={16} />
              Clear All
            </motion.button>
          )}
          {activeProducts.length < 4 && (
            <motion.button
              onClick={() => navigate('products')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-4 py-2 text-sm bg-[#d4a5a5] text-white rounded-full hover:bg-[#c89a9a] transition-colors flex items-center gap-1.5"
            >
              <Plus size={16} />
              Add More
            </motion.button>
          )}
        </div>
      </motion.div>

      {/* Comparison Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-[#d4a5a5] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="overflow-x-auto pb-4 -mx-4 px-4">
          <div className="min-w-[600px]">
            <AnimatePresence mode="popLayout">
              <motion.div
                className="grid gap-0 rounded-xl overflow-hidden border border-[#f5e6e0]/50 dark:border-[#3d2f34]/50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{
                  gridTemplateColumns: `200px repeat(${activeProducts.length}, minmax(200px, 1fr))`,
                }}
              >
                {ROW_LABELS.map((row, rowIdx) => (
                  <motion.div
                    key={row.key}
                    className="contents"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: rowIdx * 0.05 }}
                  >
                    {/* Row Label */}
                    <div className={`p-4 font-medium text-sm text-[#8b6f63] dark:text-[#e8ddd5] bg-[#fef5f1] dark:bg-[#2a2220] border-b border-[#f5e6e0]/30 dark:border-[#3d2f34]/30 flex items-center ${row.key === 'image' ? 'items-start pt-6' : ''}`}>
                      {row.label}
                    </div>

                    {/* Product Columns */}
                    {activeProducts.map((product, colIdx) => {
                      const stockStatus = getStockStatus(product);
                      const isOnSale = product.onSale && product.effectiveDiscount && product.effectiveDiscount > 0;
                      const displayPrice = isOnSale ? product.discountedPrice || product.price : product.price;
                      const isWishlisted = wishlistItems.includes(product.id);
                      const hasImgError = imgErrors.has(product.id);

                      return (
                        <motion.div
                          key={product.id}
                          layout
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8, x: -30 }}
                          transition={{ delay: colIdx * 0.1, type: 'spring', stiffness: 300, damping: 25 }}
                          className={`p-4 border-b border-[#f5e6e0]/30 dark:border-[#3d2f34]/30 flex items-center justify-center ${
                            colIdx % 2 === 1 ? 'bg-white/50 dark:bg-[#2d1f24]/50' : 'bg-white dark:bg-[#2d1f24]'
                          }`}
                        >
                          {row.key === 'image' && (
                            <div className="pt-2 pb-1 flex flex-col items-center gap-2">
                              <motion.div
                                className="relative w-32 h-32 rounded-xl overflow-hidden bg-[#fef5f1] dark:bg-[#3d2f34] group cursor-pointer"
                                whileHover={{ scale: 1.03 }}
                                onClick={() => handleProductClick(product.id)}
                              >
                                {!hasImgError ? (
                                  <img
                                    src={product.image}
                                    alt={product.name}
                                    className="w-full h-full object-cover"
                                    onError={() => handleImgError(product.id)}
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <span className="text-3xl opacity-30">💄</span>
                                  </div>
                                )}
                                {/* Remove button overlay */}
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleRemove(product.id); }}
                                  className="absolute top-1.5 right-1.5 w-6 h-6 bg-white/90 dark:bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                                  aria-label="Remove from comparison"
                                >
                                  <X size={12} className="text-[#8b6f63] dark:text-white" />
                                </button>
                                {isOnSale && (
                                  <div className="absolute top-1.5 left-1.5 bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full font-semibold">
                                    -{product.effectiveDiscount}%
                                  </div>
                                )}
                              </motion.div>
                            </div>
                          )}

                          {row.key === 'name' && (
                            <div className="flex flex-col items-center text-center py-2">
                              <span className="text-xs text-[#8b6f63]/50 dark:text-[#e8ddd5]/50 uppercase tracking-wide mb-1">
                                {product.category}
                              </span>
                              <h3
                                className="text-sm font-medium text-[#8b6f63] dark:text-[#e8ddd5] hover:text-[#d4a5a5] dark:hover:text-[#e8a5a5] transition-colors cursor-pointer line-clamp-2"
                                onClick={() => handleProductClick(product.id)}
                              >
                                {product.name}
                              </h3>
                              {product.badge && (
                                <span className="mt-1 text-[10px] bg-[#d4a5a5]/10 text-[#d4a5a5] px-2 py-0.5 rounded-full">
                                  {product.badge}
                                </span>
                              )}
                            </div>
                          )}

                          {row.key === 'price' && (
                            <div className="flex flex-col items-center py-2">
                              <span className="text-lg font-semibold text-[#8b6f63] dark:text-[#e8ddd5]">
                                ${displayPrice.toFixed(2)}
                              </span>
                              {isOnSale && (
                                <>
                                  <span className="text-xs text-[#8b6f63]/40 line-through">
                                    ${product.price.toFixed(2)}
                                  </span>
                                  <span className="text-xs text-red-500 font-medium">
                                    Save ${(product.savings || 0).toFixed(2)}
                                  </span>
                                </>
                              )}
                            </div>
                          )}

                          {row.key === 'rating' && (
                            <div className="flex flex-col items-center py-2 gap-1">
                              <div className="flex items-center gap-0.5">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    size={14}
                                    className={
                                      i < Math.floor(product.rating)
                                        ? 'fill-[#d4a5a5] text-[#d4a5a5]'
                                        : 'text-[#8b6f63]/20'
                                    }
                                  />
                                ))}
                              </div>
                              <span className="text-sm font-medium text-[#8b6f63] dark:text-[#e8ddd5]">
                                {product.rating}
                              </span>
                              <span className="text-xs text-[#8b6f63]/50 dark:text-[#e8ddd5]/50">
                                {product.reviewCount} reviews
                              </span>
                            </div>
                          )}

                          {row.key === 'description' && (
                            <div className="py-2">
                              <p className="text-xs text-[#8b6f63]/70 dark:text-[#e8ddd5]/70 leading-relaxed line-clamp-4 text-center">
                                {product.description}
                              </p>
                            </div>
                          )}

                          {row.key === 'attributes' && (
                            <div className="flex flex-col gap-2 py-2">
                              {ATTRIBUTES.map((attr) => (
                                <div
                                  key={attr.key}
                                  className="flex items-center gap-2 text-xs text-[#8b6f63]/70 dark:text-[#e8ddd5]/70"
                                >
                                  <Check size={12} className="text-green-500 flex-shrink-0" />
                                  <span>{attr.label}</span>
                                </div>
                              ))}
                            </div>
                          )}

                          {row.key === 'availability' && (
                            <div className="flex flex-col items-center py-2 gap-1">
                              <div className="flex items-center gap-1.5">
                                <span className={`w-2 h-2 rounded-full ${stockStatus.dotColor}`} />
                                <span className={`text-sm font-medium ${stockStatus.color}`}>
                                  {stockStatus.text}
                                </span>
                              </div>
                              {product.sales !== undefined && product.sales > 0 && (
                                <span className="text-xs text-[#8b6f63]/40 dark:text-[#e8ddd5]/40">
                                  {product.sales} sold
                                </span>
                              )}
                            </div>
                          )}

                          {row.key === 'action' && (
                            <div className="flex flex-col gap-2 py-3">
                              <motion.button
                                onClick={() => handleAddToCart(product)}
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                                className="w-full px-3 py-2 bg-[#d4a5a5] text-white text-xs rounded-full hover:bg-[#c89a9a] transition-colors flex items-center justify-center gap-1.5"
                              >
                                <ShoppingBag size={14} />
                                Add to Cart
                              </motion.button>
                              <button
                                onClick={() => handleWishlistToggle(product.id)}
                                className={`w-full px-3 py-2 text-xs rounded-full border flex items-center justify-center gap-1.5 transition-colors ${
                                  isWishlisted
                                    ? 'border-red-300 text-red-500 bg-red-50 dark:bg-red-500/10'
                                    : 'border-[#f5e6e0] dark:border-[#3d2f34] text-[#8b6f63]/60 dark:text-[#e8ddd5]/60 hover:border-[#d4a5a5] hover:text-[#d4a5a5]'
                                }`}
                              >
                                <Heart size={14} className={isWishlisted ? 'fill-red-500' : ''} />
                                Wishlist
                              </button>
                            </div>
                          )}
                        </motion.div>
                      );
                    })}

                    {/* Empty slots for remaining columns up to 4 */}
                    {activeProducts.length < 4 &&
                      Array.from({ length: 4 - activeProducts.length }).map((_, emptyIdx) => (
                        <motion.div
                          key={`empty-${emptyIdx}`}
                          className={`p-4 border-b border-[#f5e6e0]/30 dark:border-[#3d2f34]/30 flex items-center justify-center min-h-[80px] ${
                            (activeProducts.length + emptyIdx) % 2 === 1
                              ? 'bg-white/30 dark:bg-[#2d1f24]/30'
                              : 'bg-white/10 dark:bg-[#2d1f24]/10'
                          }`}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: activeProducts.length * 0.1 + emptyIdx * 0.05 }}
                        >
                          {row.key === 'image' && (
                            <motion.button
                              onClick={() => navigate('products')}
                              className="w-32 h-32 rounded-xl border-2 border-dashed border-[#f5e6e0] dark:border-[#3d2f34] flex flex-col items-center justify-center gap-2 text-[#8b6f63]/30 dark:text-[#e8ddd5]/30 hover:border-[#d4a5a5] hover:text-[#d4a5a5] transition-colors group cursor-pointer"
                              whileHover={{ scale: 1.03 }}
                            >
                              <Plus size={24} className="group-hover:scale-110 transition-transform" />
                              <span className="text-[10px]">Add Product</span>
                            </motion.button>
                          )}
                          {row.key !== 'image' && (
                            <Minus size={16} className="text-[#f5e6e0] dark:text-[#3d2f34]" />
                          )}
                        </motion.div>
                      ))}
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}
