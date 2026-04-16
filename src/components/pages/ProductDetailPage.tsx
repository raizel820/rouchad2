'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useStore, type CartItem } from '@/store/store';
import { toast } from '@/lib/toast';
import {
  Star, ShoppingBag, Heart, Share2, ArrowLeft, Send,
  ChevronLeft, ChevronRight, Minus, Plus, Check,
  Facebook, Twitter, Truck, RotateCcw, Shield, Clock,
  Package, Droplets, Leaf,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ProductCard } from '@/components/ProductCard';
import { ProductDetailSkeleton } from '@/components/Skeletons';

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
  stock?: number;
  sales?: number;
}

interface Review {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  user: { name: string };
}

const IMAGE_VARIANTS = [
  { label: 'Front', filter: 'none' },
  { label: 'Side', filter: 'brightness(1.05) contrast(1.05)' },
  { label: 'Detail', filter: 'brightness(0.95) saturate(1.15)' },
  { label: 'Swatch', filter: 'brightness(1.08) hue-rotate(5deg) saturate(1.1)' },
  { label: 'Lifestyle', filter: 'brightness(1.02) contrast(0.98)' },
];

const INGREDIENTS = [
  { name: 'Water (Aqua)', purpose: 'Solvent' },
  { name: 'Glycerin', purpose: 'Humectant' },
  { name: 'Hyaluronic Acid', purpose: 'Moisturizing Agent' },
  { name: 'Niacinamide (Vitamin B3)', purpose: 'Brightening' },
  { name: 'Squalane', purpose: 'Emollient' },
  { name: 'Shea Butter', purpose: 'Skin Conditioner' },
  { name: 'Jojoba Oil', purpose: 'Moisturizer' },
  { name: 'Vitamin E (Tocopherol)', purpose: 'Antioxidant' },
  { name: 'Ceramide NP', purpose: 'Barrier Repair' },
  { name: 'Centella Asiatica Extract', purpose: 'Soothing Agent' },
  { name: 'Panthenol (Provitamin B5)', purpose: 'Moisturizer' },
  { name: 'Aloe Barbadensis Leaf Juice', purpose: 'Soothing Agent' },
  { name: 'Titanium Dioxide', purpose: 'UV Filter' },
  { name: 'Zinc Oxide', purpose: 'UV Filter' },
  { name: 'Mica', purpose: 'Mineral Pigment' },
];

const TABS = ['Description', 'Ingredients', 'Reviews', 'Shipping'] as const;
type TabKey = (typeof TABS)[number];

export function ProductDetailPage() {
  const {
    productId, navigate, addToCart, isAuthenticated, user,
    toggleWishlist, wishlistItems, setWishlistItems, addRecentlyViewed,
  } = useStore();

  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [imgError, setImgError] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<TabKey>('Description');

  // Review form state
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // Add to cart state
  const [addingToCart, setAddingToCart] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  // Zoom on hover state
  const [isZooming, setIsZooming] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const imageRef = useRef<HTMLDivElement>(null);

  const isWishlisted = product ? wishlistItems.includes(product.id) : false;

  const fetchReviews = useCallback(async (pid: string) => {
    try {
      const res = await fetch(`/api/reviews?productId=${pid}`);
      const data = await res.json();
      return data;
    } catch {
      return [];
    }
  }, []);

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
        addRecentlyViewed(productData);
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
  }, [productId, navigate, fetchReviews, addRecentlyViewed]);

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

  const handleAddToCart = useCallback(() => {
    if (!product) return;
    setAddingToCart(true);
    // Simulate a small delay for the loading animation
    setTimeout(() => {
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
      toast(`${quantity} x ${product.name} added to cart!`);
      setAddingToCart(false);
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 2000);
    }, 600);
  }, [product, quantity, addToCart]);

  const handleBuyNow = useCallback(() => {
    if (!product) return;
    // Add to cart then navigate to checkout
    const cartItem: CartItem = {
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      category: product.category,
      quantity,
    };
    addToCart(cartItem);
    navigate('checkout');
  }, [product, quantity, addToCart, navigate]);

  const handleWishlistToggle = async () => {
    if (!isAuthenticated || !user || !product) {
      toast('Please log in to add items to your wishlist', 'error');
      return;
    }

    if (isWishlisted) {
      try {
        await fetch(`/api/wishlist?productId=${product.id}&userId=${user.id}`, { method: 'DELETE' });
        toggleWishlist(product.id);
        toast(`${product.name} removed from wishlist`);
      } catch {
        toast('Failed to remove from wishlist', 'error');
      }
    } else {
      try {
        await fetch('/api/wishlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id, productId: product.id }),
        });
        toggleWishlist(product.id);
        toast(`${product.name} added to wishlist!`);
      } catch {
        toast('Failed to add to wishlist', 'error');
      }
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !product || reviewRating === 0) {
      toast('Please select a rating', 'error');
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
      toast('Review submitted successfully!');
      setReviewRating(0);
      setReviewComment('');
      const [reviewsData, productData] = await Promise.all([
        fetchReviews(product.id),
        fetch(`/api/products/${product.id}`).then((r) => r.json()),
      ]);
      setReviews(reviewsData);
      setProduct(productData);
    } catch {
      toast('Failed to submit review. Please try again.', 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleImageNav = useCallback((direction: 'left' | 'right') => {
    setActiveImageIndex((prev) => {
      if (direction === 'left') return prev === 0 ? IMAGE_VARIANTS.length - 1 : prev - 1;
      return prev === IMAGE_VARIANTS.length - 1 ? 0 : prev + 1;
    });
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageRef.current) return;
    const rect = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPos({ x, y });
  }, []);

  const getStockStatus = () => {
    if (!product || product.stock === undefined) return { text: 'In Stock', color: 'text-green-600', dotColor: 'bg-green-500' };
    if (product.stock <= 0) return { text: 'Out of Stock', color: 'text-red-500', dotColor: 'bg-red-500' };
    if (product.stock <= 5) return { text: `Low Stock — Only ${product.stock} left!`, color: 'text-amber-600', dotColor: 'bg-amber-500' };
    return { text: 'In Stock', color: 'text-green-600', dotColor: 'bg-green-500' };
  };

  const stockStatus = getStockStatus();
  const isOutOfStock = product?.stock !== undefined && product.stock <= 0;

  if (loading) {
    return <ProductDetailSkeleton />;
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
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Breadcrumb */}
      <motion.nav
        className="flex items-center gap-2 text-sm mb-6 flex-wrap"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        aria-label="Breadcrumb"
      >
        <button onClick={() => navigate('home')} className="text-[#8b6f63]/60 hover:text-[#d4a5a5] transition-colors">
          Home
        </button>
        <span className="text-[#8b6f63]/30">/</span>
        <button onClick={() => navigate('products')} className="text-[#8b6f63]/60 hover:text-[#d4a5a5] transition-colors">
          {product.category}
        </button>
        <span className="text-[#8b6f63]/30">/</span>
        <span className="text-[#8b6f63] font-medium truncate max-w-[200px]">{product.name}</span>
      </motion.nav>

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
        {/* Image Gallery */}
        <motion.div
          className="flex flex-col gap-4"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          {/* Main Image with Zoom */}
          <div
            ref={imageRef}
            className="relative bg-[#fef5f1] rounded-2xl aspect-square overflow-hidden cursor-crosshair group"
            onMouseEnter={() => setIsZooming(true)}
            onMouseLeave={() => setIsZooming(false)}
            onMouseMove={handleMouseMove}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={activeImageIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0"
              >
                {!imgError ? (
                  <img
                    src={product.image}
                    alt={`${product.name} - ${IMAGE_VARIANTS[activeImageIndex].label}`}
                    className="w-full h-full object-cover transition-transform duration-200 ease-out"
                    style={{
                      transform: isZooming ? 'scale(2)' : 'scale(1)',
                      transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                      filter: IMAGE_VARIANTS[activeImageIndex].filter,
                    }}
                    onError={() => setImgError(true)}
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-[#fef5f1] to-[#f5e6e0] flex items-center justify-center">
                    <span className="text-6xl opacity-30">💄</span>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Badge */}
            {product.badge && (
              <div className="absolute top-5 left-5 z-10 bg-[#d4a5a5] text-white text-sm px-4 py-1.5 rounded-full font-medium shadow-sm">
                {product.badge}
              </div>
            )}

            {/* Image variant label */}
            <div className="absolute bottom-5 left-5 z-10 bg-white/80 backdrop-blur-sm text-[#8b6f63] text-xs px-3 py-1 rounded-full">
              {IMAGE_VARIANTS[activeImageIndex].label}
            </div>

            {/* Navigation Arrows */}
            <button
              onClick={(e) => { e.stopPropagation(); handleImageNav('left'); }}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-10 bg-white/80 backdrop-blur-sm hover:bg-white rounded-full p-2 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Previous image"
            >
              <ChevronLeft size={20} className="text-[#8b6f63]" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); handleImageNav('right'); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-10 bg-white/80 backdrop-blur-sm hover:bg-white rounded-full p-2 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Next image"
            >
              <ChevronRight size={20} className="text-[#8b6f63]" />
            </button>

            {/* Zoom hint */}
            <div className="absolute top-5 right-5 z-10 bg-white/80 backdrop-blur-sm text-[#8b6f63] text-xs px-3 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
              Hover to zoom
            </div>
          </div>

          {/* Thumbnails */}
          <div className="flex gap-3 overflow-x-auto pb-1">
            {IMAGE_VARIANTS.map((variant, index) => (
              <button
                key={variant.label}
                onClick={() => setActiveImageIndex(index)}
                className={`relative flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden transition-all duration-200 border-2 ${
                  index === activeImageIndex
                    ? 'border-[#d4a5a5] ring-2 ring-[#d4a5a5]/30'
                    : 'border-transparent hover:border-[#d4a5a5]/40'
                }`}
                aria-label={`View ${variant.label}`}
              >
                {!imgError ? (
                  <img
                    src={product.image}
                    alt={variant.label}
                    className="w-full h-full object-cover"
                    style={{ filter: variant.filter }}
                  />
                ) : (
                  <div className="w-full h-full bg-[#fef5f1]" />
                )}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Product Info */}
        <motion.div className="flex flex-col" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
          <span className="text-sm text-[#8b6f63]/70 uppercase tracking-wider mb-3">{product.category}</span>
          <h1 className="text-3xl lg:text-4xl font-serif text-[#8b6f63] mb-4 leading-tight">{product.name}</h1>

          {/* Rating */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={18} className={i < Math.floor(product.rating) ? 'fill-[#d4a5a5] text-[#d4a5a5]' : 'text-[#8b6f63]/20'} />
              ))}
            </div>
            <span className="text-[#8b6f63] font-medium">{product.rating}</span>
            <span className="text-[#8b6f63]/50">({product.reviewCount} reviews)</span>
            {product.sales !== undefined && product.sales > 0 && (
              <span className="text-xs text-[#8b6f63]/40 ml-1">• {product.sales} sold</span>
            )}
          </div>

          {/* Price */}
          <div className="text-3xl lg:text-4xl text-[#8b6f63] font-semibold mb-6">${product.price.toFixed(2)}</div>

          {/* Stock Status */}
          <div className="flex items-center gap-2 mb-6">
            <span className={`w-2.5 h-2.5 rounded-full ${stockStatus.dotColor} ${isOutOfStock ? '' : 'animate-pulse'}`} />
            <span className={`text-sm font-medium ${stockStatus.color}`}>{stockStatus.text}</span>
          </div>

          {/* Description Preview */}
          <p className="text-[#8b6f63]/70 mb-8 leading-relaxed">{product.description}</p>

          {/* Quantity Selector */}
          <div className="flex items-center gap-5 mb-6">
            <span className="text-sm font-medium text-[#8b6f63]">Quantity</span>
            <div className="flex items-center border-2 border-[#f5e6e0] rounded-xl overflow-hidden">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1 || isOutOfStock}
                className="w-12 h-12 flex items-center justify-center text-[#8b6f63] hover:bg-[#fef5f1] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label="Decrease quantity"
              >
                <Minus size={18} />
              </button>
              <span className="w-14 text-center text-[#8b6f63] font-semibold text-lg border-x-2 border-[#f5e6e0]">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                disabled={isOutOfStock}
                className="w-12 h-12 flex items-center justify-center text-[#8b6f63] hover:bg-[#fef5f1] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label="Increase quantity"
              >
                <Plus size={18} />
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 mb-8">
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock || addingToCart}
              className="flex-1 px-8 py-4 bg-[#d4a5a5] text-white rounded-full hover:bg-[#c89a9a] transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#d4a5a5] min-h-[56px]"
            >
              <AnimatePresence mode="wait">
                {addingToCart ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="flex items-center gap-2"
                  >
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Adding...
                  </motion.div>
                ) : addedToCart ? (
                  <motion.div
                    key="added"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="flex items-center gap-2"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                    >
                      <Check size={20} strokeWidth={3} />
                    </motion.div>
                    Added!
                  </motion.div>
                ) : (
                  <motion.span
                    key="default"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2"
                  >
                    <ShoppingBag size={20} />
                    Add to Cart
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
            <button
              onClick={handleBuyNow}
              disabled={isOutOfStock}
              className="flex-1 px-8 py-4 border-2 border-[#8b6f63] text-[#8b6f63] rounded-full hover:bg-[#8b6f63] hover:text-white transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-[#8b6f63] min-h-[56px]"
            >
              <ShoppingBag size={20} />
              Buy It Now
            </button>
            <button
              onClick={handleWishlistToggle}
              className={`px-5 py-4 rounded-full transition-all flex items-center gap-2 border-2 ${
                isWishlisted
                  ? 'bg-red-50 border-red-300 text-red-500 hover:bg-red-100'
                  : 'border-[#f5e6e0] text-[#8b6f63]/60 hover:border-[#d4a5a5] hover:text-[#d4a5a5]'
              }`}
              aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            >
              <Heart size={20} className={isWishlisted ? 'fill-red-500 text-red-500' : ''} />
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
                    if (err instanceof Error && err.name !== 'AbortError') {
                      navigator.clipboard.writeText(window.location.href);
                      toast('Product link copied to clipboard!');
                    }
                  }
                } else {
                  navigator.clipboard.writeText(window.location.href).then(() => {
                    toast('Product link copied to clipboard!');
                  }).catch(() => {
                    toast('Share this product with friends!');
                  });
                }
              }}
              className="px-5 py-4 border-2 border-[#f5e6e0] text-[#8b6f63]/60 rounded-full hover:border-[#d4a5a5] hover:text-[#d4a5a5] transition-all flex items-center gap-2"
              aria-label="Share product"
            >
              <Share2 size={20} />
            </button>
          </div>

          {/* Social Sharing Buttons */}
          <div className="flex items-center gap-3 mb-8">
            <span className="text-sm text-[#8b6f63]/50">Share:</span>
            <button
              onClick={() => {
                window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, '_blank');
                toast('Opening Facebook share', 'info');
              }}
              className="w-9 h-9 rounded-full bg-[#fef5f1] flex items-center justify-center text-[#8b6f63]/60 hover:bg-[#1877f2] hover:text-white transition-all"
              aria-label="Share on Facebook"
            >
              <Facebook size={16} />
            </button>
            <button
              onClick={() => {
                window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out ${product.name} on Rare Beauty!`)}&url=${encodeURIComponent(window.location.href)}`, '_blank');
                toast('Opening Twitter share', 'info');
              }}
              className="w-9 h-9 rounded-full bg-[#fef5f1] flex items-center justify-center text-[#8b6f63]/60 hover:bg-[#1da1f2] hover:text-white transition-all"
              aria-label="Share on Twitter"
            >
              <Twitter size={16} />
            </button>
            <button
              onClick={() => {
                window.open(`https://pinterest.com/pin/create/button/?url=${encodeURIComponent(window.location.href)}&description=${encodeURIComponent(product.name)}&media=${encodeURIComponent(product.image)}`, '_blank');
                toast('Opening Pinterest share', 'info');
              }}
              className="w-9 h-9 rounded-full bg-[#fef5f1] flex items-center justify-center text-[#8b6f63]/60 hover:bg-[#e60023] hover:text-white transition-all"
              aria-label="Share on Pinterest"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z"/></svg>
            </button>
          </div>

          {/* Meta Info */}
          <div className="border-t border-[#8b6f63]/10 pt-6 space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-[#8b6f63]/50">SKU:</span>
              <span className="text-[#8b6f63] font-medium">RB-{product.id.slice(-6).toUpperCase()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#8b6f63]/50">Category:</span>
              <span className="text-[#8b6f63]">{product.category}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#8b6f63]/50">Availability:</span>
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${stockStatus.dotColor}`} />
                <span className={`font-medium ${stockStatus.color}`}>{stockStatus.text}</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Product Info Tabs */}
      <motion.div
        className="mb-16"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {/* Tab Headers */}
        <div className="relative flex border-b border-[#8b6f63]/15 mb-8">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`relative px-6 py-4 text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === tab ? 'text-[#8b6f63]' : 'text-[#8b6f63]/50 hover:text-[#8b6f63]/70'
              }`}
            >
              {tab}
              {activeTab === tab && (
                <motion.div
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#d4a5a5]"
                  layoutId="product-tab-underline"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'Description' && (
            <motion.div
              key="description"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="max-w-3xl"
            >
              <h3 className="text-lg font-serif text-[#8b6f63] mb-4">About this product</h3>
              <p className="text-[#8b6f63]/70 leading-relaxed mb-6">{product.description}</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
                <div className="flex items-start gap-3 p-4 bg-[#fef5f1] rounded-xl">
                  <Leaf size={20} className="text-[#d4a5a5] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-[#8b6f63]">Clean Formula</p>
                    <p className="text-xs text-[#8b6f63]/50 mt-1">Free from harmful chemicals</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-[#fef5f1] rounded-xl">
                  <Droplets size={20} className="text-[#d4a5a5] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-[#8b6f63]">Hydrating</p>
                    <p className="text-xs text-[#8b6f63]/50 mt-1">Infused with hyaluronic acid</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-[#fef5f1] rounded-xl">
                  <Shield size={20} className="text-[#d4a5a5] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-[#8b6f63]">Dermatologist Tested</p>
                    <p className="text-xs text-[#8b6f63]/50 mt-1">Safe for all skin types</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'Ingredients' && (
            <motion.div
              key="ingredients"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="max-w-3xl"
            >
              <h3 className="text-lg font-serif text-[#8b6f63] mb-2">Key Ingredients</h3>
              <p className="text-sm text-[#8b6f63]/50 mb-6">Formulated with carefully selected ingredients for optimal results.</p>
              <div className="bg-white rounded-2xl border border-[#f5e6e0]/50 overflow-hidden">
                <div className="grid grid-cols-[1fr_1fr_40px] sm:grid-cols-[1fr_1fr_60px] text-xs font-medium text-[#8b6f63]/50 uppercase tracking-wider border-b border-[#f5e6e0]/50 bg-[#fef5f1]/50">
                  <div className="px-5 py-3">Ingredient</div>
                  <div className="px-5 py-3">Purpose</div>
                  <div className="px-3 py-3 hidden sm:block" />
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {INGREDIENTS.map((item, index) => (
                    <div
                      key={item.name}
                      className={`grid grid-cols-[1fr_1fr_40px] sm:grid-cols-[1fr_1fr_60px] items-center ${
                        index < INGREDIENTS.length - 1 ? 'border-b border-[#f5e6e0]/30' : ''
                      }`}
                    >
                      <div className="px-5 py-3 text-sm text-[#8b6f63]">{item.name}</div>
                      <div className="px-5 py-3 text-sm text-[#8b6f63]/60">{item.purpose}</div>
                      <div className="px-3 py-3 hidden sm:block">
                        <div className="w-5 h-5 rounded-full border-2 border-green-400 flex items-center justify-center">
                          <Check size={10} className="text-green-500" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <p className="text-xs text-[#8b6f63]/40 mt-4">
                * Full ingredient list available on product packaging. This product is cruelty-free and vegan.
              </p>
            </motion.div>
          )}

          {activeTab === 'Reviews' && (
            <motion.div
              key="reviews"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <h3 className="text-lg font-serif text-[#8b6f63] mb-6">Customer Reviews ({reviews.length})</h3>

              {/* Existing Reviews */}
              {reviews.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mb-10">
                  {reviews.slice(0, 8).map((review, index) => (
                    <motion.div
                      key={review.id}
                      className="bg-white rounded-xl p-6 shadow-sm border border-[#f5e6e0]/50"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <div className="flex items-center gap-1 mb-2">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={14} className={i < review.rating ? 'fill-[#d4a5a5] text-[#d4a5a5]' : 'text-[#8b6f63]/20'} />
                        ))}
                      </div>
                      <p className="text-sm text-[#8b6f63]/70 mb-3 leading-relaxed">{review.comment || 'Great product!'}</p>
                      <p className="text-xs text-[#8b6f63]/40">{review.user.name} • {new Date(review.createdAt).toLocaleDateString()}</p>
                    </motion.div>
                  ))}
                </div>
              )}

              {reviews.length === 0 && (
                <p className="text-[#8b6f63]/50 mb-10">No reviews yet. Be the first to share your experience!</p>
              )}

              {/* Review Submission Form */}
              {isAuthenticated ? (
                <motion.div
                  className="max-w-2xl bg-white rounded-xl p-6 shadow-sm border border-[#f5e6e0]/50"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <h4 className="text-lg font-medium text-[#8b6f63] mb-4">Write a Review</h4>
                  <form onSubmit={handleSubmitReview} className="space-y-4">
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
          )}

          {activeTab === 'Shipping' && (
            <motion.div
              key="shipping"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="max-w-3xl"
            >
              <h3 className="text-lg font-serif text-[#8b6f63] mb-6">Shipping & Returns</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white rounded-xl p-6 border border-[#f5e6e0]/50">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-[#fef5f1] flex items-center justify-center">
                      <Truck size={18} className="text-[#d4a5a5]" />
                    </div>
                    <h4 className="font-medium text-[#8b6f63]">Free Shipping</h4>
                  </div>
                  <p className="text-sm text-[#8b6f63]/60 leading-relaxed">
                    Enjoy free standard shipping on all orders over $50. Orders under $50 have a flat rate of $5.99.
                  </p>
                </div>
                <div className="bg-white rounded-xl p-6 border border-[#f5e6e0]/50">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-[#fef5f1] flex items-center justify-center">
                      <Clock size={18} className="text-[#d4a5a5]" />
                    </div>
                    <h4 className="font-medium text-[#8b6f63]">Delivery Time</h4>
                  </div>
                  <p className="text-sm text-[#8b6f63]/60 leading-relaxed">
                    Standard shipping takes 3-5 business days. Express shipping (1-2 days) available for $12.99.
                  </p>
                </div>
                <div className="bg-white rounded-xl p-6 border border-[#f5e6e0]/50">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-[#fef5f1] flex items-center justify-center">
                      <RotateCcw size={18} className="text-[#d4a5a5]" />
                    </div>
                    <h4 className="font-medium text-[#8b6f63]">30-Day Returns</h4>
                  </div>
                  <p className="text-sm text-[#8b6f63]/60 leading-relaxed">
                    Not satisfied? Return any unused product within 30 days for a full refund. Free return shipping included.
                  </p>
                </div>
                <div className="bg-white rounded-xl p-6 border border-[#f5e6e0]/50">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-[#fef5f1] flex items-center justify-center">
                      <Package size={18} className="text-[#d4a5a5]" />
                    </div>
                    <h4 className="font-medium text-[#8b6f63]">Secure Packaging</h4>
                  </div>
                  <p className="text-sm text-[#8b6f63]/60 leading-relaxed">
                    All products are carefully packaged to ensure they arrive in perfect condition. Eco-friendly materials used.
                  </p>
                </div>
              </div>
              <div className="mt-8 p-5 bg-[#fef5f1] rounded-xl border border-[#f5e6e0]/50">
                <h4 className="text-sm font-medium text-[#8b6f63] mb-2">Need help?</h4>
                <p className="text-sm text-[#8b6f63]/60 leading-relaxed">
                  If you have any questions about shipping or returns, please visit our{' '}
                  <button onClick={() => navigate('help-center')} className="text-[#d4a5a5] hover:underline font-medium">
                    Help Center
                  </button>{' '}
                  or{' '}
                  <button onClick={() => navigate('contact')} className="text-[#d4a5a5] hover:underline font-medium">
                    Contact Us
                  </button>.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* You May Also Like */}
      {relatedProducts.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center gap-4 mb-8">
            <motion.h2
              className="text-2xl font-serif text-[#8b6f63]"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              You May Also Like
            </motion.h2>
            <motion.div
              className="flex-1 h-px bg-gradient-to-r from-[#d4a5a5]/40 to-transparent"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              style={{ originX: 0 }}
            />
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {relatedProducts.map((rp, index) => (
              <motion.div
                key={rp.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
              >
                <ProductCard product={rp} />
              </motion.div>
            ))}
          </div>
        </motion.section>
      )}
    </div>
  );
}
