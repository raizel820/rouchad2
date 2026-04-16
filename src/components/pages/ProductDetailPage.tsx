'use client';

import { useEffect, useState } from 'react';
import { useStore, type CartItem } from '@/store/store';
import { Star, ShoppingBag, Heart, Share2, ArrowLeft, Send } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { ProductCard } from '@/components/ProductCard';

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
}

interface Review {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  user: { name: string };
}

export function ProductDetailPage() {
  const { productId, navigate, addToCart, isAuthenticated, user, toggleWishlist, wishlistItems, setWishlistItems } = useStore();
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [imgError, setImgError] = useState(false);

  // Review form state
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const isWishlisted = product ? wishlistItems.includes(product.id) : false;

  const fetchReviews = async (pid: string) => {
    try {
      const res = await fetch(`/api/reviews?productId=${pid}`);
      const data = await res.json();
      return data;
    } catch {
      return [];
    }
  };

  useEffect(() => {
    if (!productId) {
      navigate('products');
      return;
    }
    let cancelled = false;
    Promise.all([
      fetch(`/api/products/${productId}`).then((r) => r.json()),
      fetchReviews(productId),
    ])
      .then(([productData, reviewsData]) => {
        if (cancelled) return;
        setProduct(productData);
        setReviews(reviewsData);
        return fetch(`/api/products?category=${productData.category}`);
      })
      .then((r) => r?.json())
      .then((allProducts) => {
        if (cancelled || !allProducts) return;
        setRelatedProducts(allProducts.filter((p: Product) => p.id !== productId).slice(0, 4));
        setLoading(false);
      })
      .catch(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [productId, navigate]);

  // Fetch wishlist items when authenticated
  useEffect(() => {
    if (!isAuthenticated || !user) return;
    fetch(`/api/wishlist?userId=${user.id}`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setWishlistItems(data.map((item: { productId: string }) => item.productId));
        }
      })
      .catch(() => {});
  }, [isAuthenticated, user, setWishlistItems]);

  const handleAddToCart = () => {
    if (!product) return;
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

  const handleWishlistToggle = async () => {
    if (!isAuthenticated || !user || !product) {
      toast.error('Please log in to add items to your wishlist');
      return;
    }

    if (isWishlisted) {
      try {
        await fetch(`/api/wishlist?productId=${product.id}&userId=${user.id}`, { method: 'DELETE' });
        toggleWishlist(product.id);
        toast.success(`${product.name} removed from wishlist`);
      } catch {
        toast.error('Failed to remove from wishlist');
      }
    } else {
      try {
        await fetch('/api/wishlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id, productId: product.id }),
        });
        toggleWishlist(product.id);
        toast.success(`${product.name} added to wishlist!`);
      } catch {
        toast.error('Failed to add to wishlist');
      }
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !product || reviewRating === 0) {
      toast.error('Please select a rating');
      return;
    }
    setSubmittingReview(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          productId: product.id,
          rating: reviewRating,
          comment: reviewComment,
        }),
      });
      if (!res.ok) throw new Error('Failed to submit review');
      toast.success('Review submitted successfully!');
      setReviewRating(0);
      setReviewComment('');
      // Refresh reviews and product data
      const [reviewsData, productData] = await Promise.all([
        fetchReviews(product.id),
        fetch(`/api/products/${product.id}`).then((r) => r.json()),
      ]);
      setReviews(reviewsData);
      setProduct(productData);
    } catch {
      toast.error('Failed to submit review. Please try again.');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="aspect-square bg-[#fef5f1] rounded-xl animate-pulse" />
          <div className="space-y-4 animate-pulse">
            <div className="h-6 bg-[#fef5f1] rounded w-1/4" />
            <div className="h-10 bg-[#fef5f1] rounded w-3/4" />
            <div className="h-4 bg-[#fef5f1] rounded w-1/2" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl text-[#8b6f63] mb-4">Product not found</h1>
        <button onClick={() => navigate('products')} className="text-[#d4a5a5] hover:underline">
          Back to Products
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Button */}
      <motion.button
        onClick={() => navigate('products')}
        className="inline-flex items-center gap-2 text-[#8b6f63] hover:text-[#d4a5a5] mb-8 transition-colors"
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <ArrowLeft size={20} />
        Back to Products
      </motion.button>

      {/* Product Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
        {/* Image */}
        <motion.div
          className="bg-[#fef5f1] rounded-xl aspect-square overflow-hidden relative"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          {!imgError ? (
            <img src={product.image} alt={product.name} className="w-full h-full object-cover" onError={() => setImgError(true)} />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-[#fef5f1] to-[#f5e6e0] flex items-center justify-center">
              <span className="text-6xl opacity-30">💄</span>
            </div>
          )}
          {product.badge && (
            <div className="absolute top-6 left-6 bg-[#d4a5a5] text-white text-sm px-4 py-2 rounded-full font-medium">{product.badge}</div>
          )}
        </motion.div>

        {/* Info */}
        <motion.div className="flex flex-col" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
          <span className="text-sm text-[#8b6f63]/70 uppercase tracking-wider mb-4">{product.category}</span>
          <h1 className="text-3xl font-serif text-[#8b6f63] mb-4">{product.name}</h1>

          <div className="flex items-center gap-2 mb-6">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={18} className={i < Math.floor(product.rating) ? 'fill-[#d4a5a5] text-[#d4a5a5]' : 'text-[#8b6f63]/20'} />
              ))}
            </div>
            <span className="text-[#8b6f63]">{product.rating}</span>
            <span className="text-[#8b6f63]/50">({product.reviewCount} reviews)</span>
          </div>

          <div className="text-3xl text-[#8b6f63] font-semibold mb-6">${product.price.toFixed(2)}</div>
          <p className="text-[#8b6f63]/70 mb-8 leading-relaxed">{product.description}</p>

          {/* Quantity */}
          <div className="flex items-center gap-4 mb-8">
            <span className="text-[#8b6f63]">Quantity:</span>
            <div className="flex items-center gap-3">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-10 rounded-full bg-[#fef5f1] text-[#8b6f63] hover:bg-[#f5e6e0] transition-colors flex items-center justify-center">-</button>
              <span className="w-12 text-center text-[#8b6f63] font-medium">{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)} className="w-10 h-10 rounded-full bg-[#fef5f1] text-[#8b6f63] hover:bg-[#f5e6e0] transition-colors flex items-center justify-center">+</button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <button onClick={handleAddToCart} className="flex-1 px-8 py-4 bg-[#d4a5a5] text-white rounded-full hover:bg-[#c89a9a] transition-all flex items-center justify-center gap-2 active:scale-95">
              <ShoppingBag size={20} />
              Add to Cart
            </button>
            <button
              onClick={handleWishlistToggle}
              className={`px-6 py-4 rounded-full transition-all flex items-center gap-2 ${
                isWishlisted
                  ? 'bg-red-50 border-2 border-red-400 text-red-500 hover:bg-red-100'
                  : 'border-2 border-[#d4a5a5] text-[#d4a5a5] hover:bg-[#d4a5a5] hover:text-white'
              }`}
            >
              <Heart size={20} className={isWishlisted ? 'fill-red-500 text-red-500' : ''} />
              {isWishlisted ? 'Wishlisted' : 'Add to Wishlist'}
            </button>
            <button
              onClick={async () => {
                const shareData = {
                  title: product.name,
                  text: `Check out ${product.name} on Rare Beauty!`,
                  url: window.location.href,
                };
                if (navigator.share) {
                  try {
                    await navigator.share(shareData);
                  } catch (err) {
                    // User cancelled or share failed, fallback to clipboard
                    if (err instanceof Error && err.name !== 'AbortError') {
                      navigator.clipboard.writeText(window.location.href);
                      toast.success('Product link copied to clipboard!');
                    }
                  }
                } else {
                  navigator.clipboard.writeText(window.location.href).then(() => {
                    toast.success('Product link copied to clipboard!');
                  }).catch(() => {
                    toast.success('Share this product with friends!');
                  });
                }
              }}
              className="px-6 py-4 border-2 border-[#d4a5a5] text-[#d4a5a5] rounded-full hover:bg-[#d4a5a5] hover:text-white transition-all flex items-center gap-2"
              aria-label="Share product"
            >
              <Share2 size={20} />
              Share
            </button>
          </div>

          {/* Additional Info */}
          <div className="border-t border-[#8b6f63]/20 pt-6 space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-[#8b6f63]/70">SKU:</span><span className="text-[#8b6f63]">RB-{product.id.slice(-4).toUpperCase()}</span></div>
            <div className="flex justify-between"><span className="text-[#8b6f63]/70">Category:</span><span className="text-[#8b6f63]">{product.category}</span></div>
            <div className="flex justify-between"><span className="text-[#8b6f63]/70">Availability:</span><span className="text-green-600">In Stock</span></div>
          </div>
        </motion.div>
      </div>

      {/* Reviews Section */}
      <motion.div className="mb-16" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-2xl font-serif text-[#8b6f63] mb-8">Customer Reviews ({reviews.length})</h2>

        {/* Existing Reviews */}
        {reviews.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mb-10">
            {reviews.slice(0, 4).map((review) => (
              <div key={review.id} className="bg-white rounded-xl p-6 shadow-sm border border-[#f5e6e0]/50">
                <div className="flex items-center gap-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} className={i < review.rating ? 'fill-[#d4a5a5] text-[#d4a5a5]' : 'text-[#8b6f63]/20'} />
                  ))}
                </div>
                <p className="text-sm text-[#8b6f63]/70 mb-2">{review.comment || 'Great product!'}</p>
                <p className="text-xs text-[#8b6f63]/50">{review.user.name} • {new Date(review.createdAt).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        )}

        {reviews.length === 0 && (
          <p className="text-[#8b6f63]/50 mb-10">No reviews yet. Be the first to share your experience!</p>
        )}

        {/* Review Submission Form - Only visible when authenticated */}
        {isAuthenticated ? (
          <motion.div
            className="max-w-2xl bg-white rounded-xl p-6 shadow-sm border border-[#f5e6e0]/50"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="text-lg font-medium text-[#8b6f63] mb-4">Write a Review</h3>
            <form onSubmit={handleSubmitReview} className="space-y-4">
              {/* Star Rating Selector */}
              <div>
                <label className="block text-sm text-[#8b6f63]/70 mb-2">Your Rating</label>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className="p-1 transition-transform hover:scale-110 active:scale-95"
                      aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                    >
                      <Star
                        size={24}
                        className={
                          star <= reviewRating
                            ? 'fill-[#d4a5a5] text-[#d4a5a5]'
                            : 'text-[#8b6f63]/20 hover:text-[#8b6f63]/40'
                        }
                      />
                    </button>
                  ))}
                  {reviewRating > 0 && (
                    <span className="ml-2 text-sm text-[#8b6f63]/70">
                      {reviewRating === 1 ? 'Poor' : reviewRating === 2 ? 'Fair' : reviewRating === 3 ? 'Good' : reviewRating === 4 ? 'Very Good' : 'Excellent'}
                    </span>
                  )}
                </div>
              </div>

              {/* Comment Textarea */}
              <div>
                <label className="block text-sm text-[#8b6f63]/70 mb-2">Your Review</label>
                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Share your thoughts about this product..."
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border border-[#f5e6e0] bg-[#fef5f1] text-[#8b6f63] placeholder:text-[#8b6f63]/40 focus:outline-none focus:ring-2 focus:ring-[#d4a5a5]/50 focus:border-[#d4a5a5] resize-none transition-all"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submittingReview || reviewRating === 0}
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#d4a5a5] text-white rounded-full hover:bg-[#c89a9a] transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#d4a5a5]"
              >
                {submittingReview ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    Submit Review
                  </>
                )}
              </button>
            </form>
          </motion.div>
        ) : (
          <div className="max-w-2xl bg-[#fef5f1] rounded-xl p-6 border border-[#f5e6e0] text-center">
            <p className="text-[#8b6f63]/70 mb-3">Please log in to write a review.</p>
            <button
              onClick={() => navigate('login')}
              className="inline-block px-6 py-2 bg-[#d4a5a5] text-white text-sm rounded-full hover:bg-[#c89a9a] transition-all"
            >
              Log In
            </button>
          </div>
        )}
      </motion.div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <h2 className="text-2xl font-serif text-[#8b6f63] mb-8">You May Also Like</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((rp) => (
              <ProductCard key={rp.id} product={rp} />
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
