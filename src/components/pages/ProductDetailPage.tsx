'use client';

import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { useStore, type CartItem } from '@/store/store';
import { toast } from '@/lib/toast';
import {
  Star, ShoppingBag, Heart, Share2, ArrowLeft, Send,
  ChevronLeft, ChevronRight, ChevronDown, Minus, Plus, Check,
  Facebook, Twitter, Truck, RotateCcw, Shield, Clock,
  Package, Droplets, Leaf, ThumbsUp, X, ZoomIn, Sparkles,
  Copy, Ruler, Rabbit, Info, GitCompareArrows,
} from 'lucide-react';
import {
  Popover, PopoverTrigger, PopoverContent,
} from '@/components/ui/popover';
import { motion, AnimatePresence } from 'framer-motion';
import { ProductCard } from '@/components/ProductCard';
import { ProductDetailSkeleton } from '@/components/Skeletons';

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  image: string;
  images?: string;
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
  ingredients?: string | null;
  tags?: string | null;
}

interface Review {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  user: { name: string };
}

const DEFAULT_INGREDIENTS = [
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

const DEFAULT_KEY_INGREDIENTS = [
  { name: 'Hyaluronic Acid', benefit: 'Deeply hydrates and plumps skin, holding up to 1,000x its weight in water', goodFor: 'All skin types, especially dry & mature skin', popularity: 5, color: '#e8b4d8' },
  { name: 'Niacinamide (Vitamin B3)', benefit: 'Brightens skin, minimizes pores, and evens out skin tone', goodFor: 'Combination, oily, and acne-prone skin', popularity: 5, color: '#f5c5a3' },
  { name: 'Vitamin E (Tocopherol)', benefit: 'Powerful antioxidant that protects skin from free radical damage', goodFor: 'All skin types, especially dry & sensitive', popularity: 4, color: '#d4a5a5' },
  { name: 'Squalane', benefit: 'Lightweight moisturizer that mimics skin\'s natural oils', goodFor: 'All skin types, non-comedogenic', popularity: 4, color: '#a8d8b9' },
  { name: 'Ceramide NP', benefit: 'Strengthens the skin barrier and locks in moisture', goodFor: 'Dry, sensitive, and damaged skin', popularity: 4, color: '#c9b1ff' },
  { name: 'Centella Asiatica Extract', benefit: 'Soothes inflammation and promotes skin healing', goodFor: 'Sensitive, acne-prone, and irritated skin', popularity: 5, color: '#b8d4e3' },
];

const SIZE_GUIDE = [
  { size: 'Sample', dimensions: '2g / 0.07 oz', recommended: 'Try before you buy', diameter: 32 },
  { size: 'Regular', dimensions: '6g / 0.21 oz', recommended: 'Everyday use', diameter: 52 },
  { size: 'Full Size', dimensions: '12g / 0.42 oz', recommended: 'Frequent use, best value', diameter: 80 },
];

const SHADE_TIPS = [
  { tip: 'Start with a shade lighter than your natural lip color for a natural look.', icon: '💡' },
  { tip: 'Apply with a lip brush for precise, even coverage.', icon: '🖌️' },
  { tip: 'Layer over lip balm for a subtle, tinted finish.', icon: '✨' },
  { tip: 'Swatch on your wrist to compare shades in natural light.', icon: '☀️' },
];

interface Ingredient {
  name: string;
  purpose: string;
}

interface KeyIngredient {
  name: string;
  benefit: string;
  goodFor: string;
  popularity: number;
  color: string;
}

interface ProductTag {
  label: string;
  icon: typeof Rabbit;
  iconColor: string;
  show: (category: string) => boolean;
}

const PRODUCT_TAGS: ProductTag[] = [
  { label: 'Cruelty-Free', icon: Rabbit, iconColor: 'text-[#d4a5a5]', show: () => true },
  { label: 'Vegan', icon: Leaf, iconColor: 'text-green-500', show: () => true },
  { label: 'Clean Beauty', icon: Sparkles, iconColor: 'text-amber-500', show: () => true },
  { label: '12M After Opening', icon: Clock, iconColor: 'text-[#8b6f63]/60', show: (cat) => cat.toLowerCase() !== 'haircare' },
  { label: '12g / 0.42 oz', icon: Package, iconColor: 'text-[#8b6f63]/60', show: () => true },
];

const TABS = ['Description', 'Ingredients', 'Reviews', 'Shipping'] as const;
type TabKey = (typeof TABS)[number];

export function ProductDetailPage() {
  const {
    productId, navigate, addToCart, isAuthenticated, user,
    toggleWishlist, wishlistItems, setWishlistItems, addRecentlyViewed,
    compareProductIds, addToCompare, removeFromCompare,
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

  // Review sort state
  const [reviewSortOrder, setReviewSortOrder] = useState<'recent' | 'highest' | 'lowest'>('recent');

  // Add to cart state
  const [addingToCart, setAddingToCart] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  // Color selector state
  const [selectedColor, setSelectedColor] = useState('');
  const [availableColors, setAvailableColors] = useState<string[]>([]);

  // Zoom on hover state
  const [isZooming, setIsZooming] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const imageRef = useRef<HTMLDivElement>(null);

  // Lightbox state
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // Size guide modal state
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);

  // Ingredient accordion state
  const [ingredientAccordion, setIngredientAccordion] = useState<'key' | 'full' | null>('key');

  // Active ingredient tooltip state
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  // Parse gallery images from product images JSON field
  const galleryImages = useMemo(() => {
    if (!product) return [];
    try {
      const parsed = product.images ? JSON.parse(product.images) : [];
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Deduplicate: put main image first, then unique extras
        const uniqueUrls = [product.image, ...parsed.filter((url: string) => url !== product.image)];
        return uniqueUrls.slice(0, 8); // Max 8 images
      }
    } catch {
      // JSON parse failed, fall through
    }
    return [product.image];
  }, [product]);

  const hasMultipleImages = galleryImages.length > 1;

  const isWishlisted = product ? wishlistItems.includes(product.id) : false;

  // Dynamic ingredients from DB, falling back to defaults
  const dynamicIngredients = useMemo((): Ingredient[] => {
    if (!product?.ingredients || product.ingredients.trim() === '') {
      return DEFAULT_INGREDIENTS;
    }
    const lines = product.ingredients.split('\n').map((l) => l.trim()).filter(Boolean);
    if (lines.length === 0) return DEFAULT_INGREDIENTS;
    return lines.map((line) => ({ name: line, purpose: '' }));
  }, [product?.ingredients]);

  const dynamicKeyIngredients = useMemo((): KeyIngredient[] => {
    // If DB ingredients exist, find matches from DEFAULT_KEY_INGREDIENTS
    if (product?.ingredients && product.ingredients.trim() !== '') {
      const ingredientNames = product.ingredients.split('\n').map((l) => l.trim().toLowerCase());
      const matched = DEFAULT_KEY_INGREDIENTS.filter((ki) =>
        ingredientNames.some((name) => name.includes(ki.name.split(' (')[0].toLowerCase()))
      );
      if (matched.length > 0) return matched;
    }
    return DEFAULT_KEY_INGREDIENTS;
  }, [product?.ingredients]);

  // Configurable product tags based on category
  const productTags = useMemo(() => {
    const category = product?.category || '';
    return PRODUCT_TAGS.filter((tag) => tag.show(category));
  }, [product?.category]);

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
        // Parse colors from JSON
        const colorsArr = productData.colors ? JSON.parse(productData.colors) : [];
        setAvailableColors(colorsArr);
        if (colorsArr.length > 0) setSelectedColor(colorsArr[0]);
        return fetch(`/api/products?category=${productData.category}`);
      })
      .then((r) => r?.json())
      .then((allProducts) => {
        if (cancelled || !allProducts) return;
        setRelatedProducts(allProducts.filter((p: Product) => p.id !== productId).slice(0, 8));
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
    const displayPrice = product.onSale && product.discountedPrice ? product.discountedPrice : product.price;
    setTimeout(() => {
      for (let i = 0; i < quantity; i++) {
        const cartItem: CartItem = {
          id: product.id,
          name: product.name,
          price: displayPrice,
          originalPrice: product.onSale ? product.price : undefined,
          image: product.image,
          category: product.category,
          quantity: 1,
          selectedColor: selectedColor || 'default',
          saleName: product.saleName,
          effectiveDiscount: product.effectiveDiscount,
        };
        addToCart(cartItem);
      }
      toast(`${quantity} x ${product.name} added to cart!`);
      setAddingToCart(false);
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 2000);
    }, 600);
  }, [product, quantity, addToCart, selectedColor]);

  const handleBuyNow = useCallback(() => {
    if (!product) return;
    const displayPrice = product.onSale && product.discountedPrice ? product.discountedPrice : product.price;
    const cartItem: CartItem = {
      id: product.id,
      name: product.name,
      price: displayPrice,
      originalPrice: product.onSale ? product.price : undefined,
      image: product.image,
      category: product.category,
      quantity,
      selectedColor: selectedColor || 'default',
      saleName: product.saleName,
      effectiveDiscount: product.effectiveDiscount,
    };
    addToCart(cartItem);
    navigate('checkout');
  }, [product, quantity, addToCart, navigate, selectedColor]);

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
      const len = galleryImages.length;
      if (direction === 'left') return prev === 0 ? len - 1 : prev - 1;
      return prev === len - 1 ? 0 : prev + 1;
    });
  }, [galleryImages.length]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageRef.current) return;
    const rect = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPos({ x, y });
  }, []);

  // ESC key to close lightbox / size guide
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isSizeGuideOpen) setIsSizeGuideOpen(false);
        else if (isLightboxOpen) setIsLightboxOpen(false);
      }
      if (isLightboxOpen) {
        if (e.key === 'ArrowLeft') handleImageNav('left');
        if (e.key === 'ArrowRight') handleImageNav('right');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLightboxOpen, isSizeGuideOpen, handleImageNav]);

  const getStockStatus = () => {
    if (!product || product.stock === undefined) return { text: 'In Stock', color: 'text-green-600', dotColor: 'bg-green-500' };
    if (product.stock <= 0) return { text: 'Out of Stock', color: 'text-red-500', dotColor: 'bg-red-500' };
    if (product.stock <= 5) return { text: `Low Stock — Only ${product.stock} left!`, color: 'text-amber-600', dotColor: 'bg-amber-500' };
    return { text: 'In Stock', color: 'text-green-600', dotColor: 'bg-green-500' };
  };

  const stockStatus = getStockStatus();
  const isOutOfStock = product?.stock !== undefined && product.stock <= 0;

  const formatRelativeDate = (dateStr: string) => {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
    }
    if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      if (months < 2) return 'Last month';
      return `${months} months ago`;
    }
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const AVATAR_COLORS = ['#d4a5a5', '#8b6f63', '#c89a9a', '#a0845e', '#b08968', '#d4a574', '#9c8468', '#c4917a'];

  const sortedReviews = useMemo(() => {
    const sorted = [...reviews];
    if (reviewSortOrder === 'highest') sorted.sort((a, b) => b.rating - a.rating || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    else if (reviewSortOrder === 'lowest') sorted.sort((a, b) => a.rating - b.rating || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    else sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return sorted.slice(0, 8);
  }, [reviews, reviewSortOrder]);

  const completeLookProducts = useMemo(() => relatedProducts.slice(0, 4), [relatedProducts]);
  const mayAlsoLikeProducts = useMemo(() => relatedProducts.slice(4, 8), [relatedProducts]);

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
            className="relative bg-[#fef5f1] dark:bg-[#2a2220] rounded-2xl aspect-square overflow-hidden cursor-zoom-in group"
            onMouseEnter={() => setIsZooming(true)}
            onMouseLeave={() => setIsZooming(false)}
            onMouseMove={handleMouseMove}
            onClick={() => setIsLightboxOpen(true)}
            role="button"
            tabIndex={0}
            aria-label="Open image in fullscreen lightbox"
            onKeyDown={(e) => { if (e.key === 'Enter') setIsLightboxOpen(true); }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={galleryImages[activeImageIndex]}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="absolute inset-0"
              >
                {!imgError ? (
                  <img
                    src={galleryImages[activeImageIndex]}
                    alt={`${product.name} - Image ${activeImageIndex + 1} of ${galleryImages.length}`}
                    className="w-full h-full object-cover transition-transform duration-200 ease-out select-none"
                    draggable={false}
                    style={{
                      transform: isZooming ? 'scale(2)' : 'scale(1)',
                      transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                    }}
                    onError={() => setImgError(true)}
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-[#fef5f1] to-[#f5e6e0] dark:from-[#2a2220] dark:to-[#1f1a18] flex items-center justify-center">
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

            {/* Image counter */}
            {hasMultipleImages && (
              <div className="absolute bottom-5 left-5 z-10 bg-white/80 dark:bg-black/60 backdrop-blur-sm text-[#8b6f63] dark:text-[#e8d5cf] text-xs px-3 py-1 rounded-full">
                {activeImageIndex + 1} / {galleryImages.length}
              </div>
            )}

            {/* Navigation Arrows (only if multiple images) */}
            {hasMultipleImages && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); handleImageNav('left'); }}
                  className="absolute left-3 top-1/2 -translate-y-1/2 z-10 bg-white/80 dark:bg-black/60 backdrop-blur-sm hover:bg-white dark:hover:bg-black/80 rounded-full p-2 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Previous image"
                >
                  <ChevronLeft size={20} className="text-[#8b6f63] dark:text-white" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleImageNav('right'); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 z-10 bg-white/80 dark:bg-black/60 backdrop-blur-sm hover:bg-white dark:hover:bg-black/80 rounded-full p-2 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Next image"
                >
                  <ChevronRight size={20} className="text-[#8b6f63] dark:text-white" />
                </button>
              </>
            )}

            {/* Zoom & lightbox hint */}
            <div className="absolute top-5 right-5 z-10 bg-white/80 dark:bg-black/60 backdrop-blur-sm text-[#8b6f63] dark:text-[#e8d5cf] text-xs px-3 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
              <ZoomIn size={12} />
              Hover to zoom · Click to expand
            </div>
          </div>

          {/* Thumbnails (hidden if only 1 image) */}
          {hasMultipleImages && (
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
              {galleryImages.map((imgUrl, index) => (
                <button
                  key={imgUrl}
                  onClick={() => setActiveImageIndex(index)}
                  className={`relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden transition-all duration-200 border-2 ${
                    index === activeImageIndex
                      ? 'border-[#d4a5a5] ring-2 ring-[#d4a5a5]/30 opacity-100'
                      : 'border-transparent opacity-50 hover:opacity-80 hover:border-[#d4a5a5]/40'
                  }`}
                  aria-label={`View image ${index + 1}`}
                >
                  {!imgError ? (
                    <img
                      src={imgUrl}
                      alt={`${product.name} thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                      draggable={false}
                    />
                  ) : (
                    <div className="w-full h-full bg-[#fef5f1] dark:bg-[#2a2220]" />
                  )}
                </button>
              ))}
            </div>
          )}
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
          <div className="mb-6">
            {product.onSale && product.effectiveDiscount && product.effectiveDiscount > 0 ? (
              <div>
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-3xl lg:text-4xl text-[#8b6f63] font-semibold">${(product.discountedPrice || product.price).toFixed(2)}</span>
                  <span className="text-xl text-[#8b6f63]/40 line-through">${product.price.toFixed(2)}</span>
                  <span className="px-3 py-1 bg-red-500 text-white text-sm rounded-full font-semibold flex items-center gap-1">
                    -{product.effectiveDiscount}%
                  </span>
                  {product.saleName && (
                    <span className="px-3 py-1 bg-red-50 text-red-600 text-sm rounded-full font-medium border border-red-200">
                      {product.saleName}
                    </span>
                  )}
                </div>
                <p className="text-sm text-green-600 font-medium mt-1">You save ${(product.savings || 0).toFixed(2)}</p>
              </div>
            ) : (
              <span className="text-3xl lg:text-4xl text-[#8b6f63] font-semibold">${product.price.toFixed(2)}</span>
            )}
          </div>

          {/* Stock Status */}
          <div className="flex items-center gap-2 mb-6">
            <span className={`w-2.5 h-2.5 rounded-full ${stockStatus.dotColor} ${isOutOfStock ? '' : 'animate-pulse'}`} />
            <span className={`text-sm font-medium ${stockStatus.color}`}>{stockStatus.text}</span>
          </div>

          {/* Color Selector */}
          {availableColors.length > 0 && (
            <motion.div
              className="mb-6"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm font-medium text-[#8b6f63] dark:text-[#e8d5cf]">Color:</span>
                <span className="text-sm text-[#d4a5a5] dark:text-[#e8a5a5] font-medium">{selectedColor}</span>
              </div>
              <div className="flex items-center gap-3">
                {availableColors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`w-10 h-10 rounded-full border-2 transition-all duration-200 hover:scale-110 ${
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

          {/* Description Preview */}
          <p className="text-[#8b6f63]/70 mb-6 leading-relaxed">{product.description}</p>

          {/* Product Info Badges */}
          <motion.div
            className="flex flex-wrap gap-2.5 mb-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {productTags.map((tag) => {
              const TagIcon = tag.icon;
              return (
                <span key={tag.label} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#fef5f1] dark:bg-[#2d1f24] rounded-full text-xs font-medium text-[#8b6f63] dark:text-[#e8ddd5] border border-[#f5e6e0]/50 dark:border-[#3d2f34]">
                  <TagIcon size={14} className={tag.iconColor} />
                  {tag.label}
                </span>
              );
            })}
          </motion.div>

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
              onClick={() => {
                if (!product) return;
                if (compareProductIds.includes(product.id)) {
                  removeFromCompare(product.id);
                  toast(`${product.name} removed from comparison`);
                } else {
                  const added = addToCompare(product.id);
                  if (added) {
                    toast(`${product.name} added to comparison!`);
                  } else {
                    toast('Comparison full (max 4 products)', 'error');
                  }
                }
              }}
              className={`px-5 py-4 rounded-full transition-all flex items-center gap-2 border-2 ${
                product && compareProductIds.includes(product.id)
                  ? 'bg-[#fef5f1] dark:bg-[#d4a5a5]/10 border-[#d4a5a5] text-[#d4a5a5]'
                  : 'border-[#f5e6e0] text-[#8b6f63]/60 hover:border-[#d4a5a5] hover:text-[#d4a5a5]'
              }`}
              aria-label={product && compareProductIds.includes(product.id) ? 'Remove from comparison' : 'Add to comparison'}
            >
              <GitCompareArrows size={20} />
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

          {/* Share & Size Guide Row */}
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <span className="text-sm text-[#8b6f63]/50">Share:</span>
            <button
              onClick={() => {
                navigator.clipboard.writeText(window.location.href).then(() => {
                  toast('Link copied to clipboard!');
                }).catch(() => {
                  toast('Failed to copy link', 'error');
                });
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#fef5f1] dark:bg-[#2d1f24] border border-[#f5e6e0]/50 dark:border-[#3d2f34] text-xs font-medium text-[#8b6f63] dark:text-[#e8ddd5] hover:bg-[#f5e6e0] hover:text-[#8b6f63] transition-all"
              aria-label="Copy product link"
            >
              <Copy size={13} />
              Copy Link
            </button>
            <button
              onClick={() => {
                window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, '_blank');
                toast('Opening Facebook share', 'info');
              }}
              className="w-8 h-8 rounded-full bg-[#fef5f1] dark:bg-[#2d1f24] flex items-center justify-center text-[#8b6f63]/60 dark:text-[#e8ddd5] hover:bg-[#1877f2] hover:text-white transition-all border border-[#f5e6e0]/30 dark:border-[#3d2f34]"
              aria-label="Share on Facebook"
            >
              <Facebook size={14} />
            </button>
            <button
              onClick={() => {
                window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out ${product.name} on Rare Beauty!`)}&url=${encodeURIComponent(window.location.href)}`, '_blank');
                toast('Opening Twitter share', 'info');
              }}
              className="w-8 h-8 rounded-full bg-[#fef5f1] dark:bg-[#2d1f24] flex items-center justify-center text-[#8b6f63]/60 dark:text-[#e8ddd5] hover:bg-[#1da1f2] hover:text-white transition-all border border-[#f5e6e0]/30 dark:border-[#3d2f34]"
              aria-label="Share on Twitter"
            >
              <Twitter size={14} />
            </button>
            <button
              onClick={() => {
                window.open(`https://pinterest.com/pin/create/button/?url=${encodeURIComponent(window.location.href)}&description=${encodeURIComponent(product.name)}&media=${encodeURIComponent(product.image)}`, '_blank');
                toast('Opening Pinterest share', 'info');
              }}
              className="w-8 h-8 rounded-full bg-[#fef5f1] dark:bg-[#2d1f24] flex items-center justify-center text-[#8b6f63]/60 dark:text-[#e8ddd5] hover:bg-[#e60023] hover:text-white transition-all border border-[#f5e6e0]/30 dark:border-[#3d2f34]"
              aria-label="Share on Pinterest"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z"/></svg>
            </button>
          </div>

          {/* Size Guide Link */}
          <button
            onClick={() => setIsSizeGuideOpen(true)}
            className="inline-flex items-center gap-1.5 text-sm text-[#d4a5a5] hover:text-[#c89a9a] mb-8 transition-colors group"
          >
            <Ruler size={15} className="group-hover:scale-110 transition-transform" />
            Size Guide
          </button>

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
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-serif text-[#8b6f63]">Ingredients</h3>
                  <p className="text-sm text-[#8b6f63]/50">Formulated with care for optimal results.</p>
                </div>
                <button
                  onClick={() => {
                    const fullList = dynamicIngredients.map(i => i.name).join(', ');
                    navigator.clipboard.writeText(fullList).then(() => {
                      toast('Ingredients copied to clipboard!');
                    }).catch(() => {
                      toast('Failed to copy', 'error');
                    });
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#fef5f1] dark:bg-[#2d1f24] border border-[#f5e6e0]/50 dark:border-[#3d2f34] text-xs font-medium text-[#8b6f63] dark:text-[#e8ddd5] hover:bg-[#f5e6e0] transition-all"
                >
                  <Copy size={12} />
                  Copy Ingredients
                </button>
              </div>

              {/* Key Ingredients Accordion */}
              <div className="bg-white dark:bg-[#2d1f24] rounded-2xl border border-[#f5e6e0]/50 dark:border-[#3d2f34] overflow-hidden mb-4">
                <button
                  onClick={() => setIngredientAccordion(ingredientAccordion === 'key' ? null : 'key')}
                  className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-[#fef5f1]/50 dark:hover:bg-[#3d2f34]/50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Sparkles size={16} className="text-[#d4a5a5]" />
                    <span className="text-sm font-medium text-[#8b6f63] dark:text-[#e8ddd5]">Key Ingredients</span>
                    <span className="text-xs text-[#8b6f63]/40 ml-1">({dynamicKeyIngredients.length})</span>
                  </div>
                  <motion.div
                    animate={{ rotate: ingredientAccordion === 'key' ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown size={16} className="text-[#8b6f63]/40" />
                  </motion.div>
                </button>
                <AnimatePresence>
                  {ingredientAccordion === 'key' && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-5 flex flex-wrap gap-2.5">
                        {dynamicKeyIngredients.map((ki) => (
                          <Popover key={ki.name} open={activeTooltip === ki.name} onOpenChange={(open) => setActiveTooltip(open ? ki.name : null)}>
                            <PopoverTrigger asChild>
                              <button
                                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium border transition-all hover:scale-105 cursor-pointer"
                                style={{
                                  backgroundColor: ki.color + '20',
                                  borderColor: ki.color + '60',
                                  color: '#8b6f63',
                                }}
                              >
                                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: ki.color }} />
                                {ki.name}
                                <Info size={11} className="opacity-50" />
                              </button>
                            </PopoverTrigger>
                            <PopoverContent className="w-72 p-4" side="top" align="center">
                              <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: ki.color }} />
                                  <span className="font-medium text-sm text-[#8b6f63] dark:text-[#e8ddd5]">{ki.name}</span>
                                </div>
                                <div>
                                  <span className="text-xs text-[#8b6f63]/50 uppercase tracking-wider">What it does</span>
                                  <p className="text-sm text-[#8b6f63]/80 dark:text-[#e8ddd5]/80 mt-0.5">{ki.benefit}</p>
                                </div>
                                <div>
                                  <span className="text-xs text-[#8b6f63]/50 uppercase tracking-wider">Good for</span>
                                  <p className="text-sm text-[#8b6f63]/80 dark:text-[#e8ddd5]/80 mt-0.5">{ki.goodFor}</p>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <span className="text-xs text-[#8b6f63]/50">Popularity:</span>
                                  <div className="flex items-center gap-0.5">
                                    {[...Array(5)].map((_, i) => (
                                      <Star key={i} size={12} className={i < ki.popularity ? 'fill-[#d4a5a5] text-[#d4a5a5]' : 'text-[#8b6f63]/15'} />
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </PopoverContent>
                          </Popover>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Full Ingredients List Accordion */}
              <div className="bg-white dark:bg-[#2d1f24] rounded-2xl border border-[#f5e6e0]/50 dark:border-[#3d2f34] overflow-hidden">
                <button
                  onClick={() => setIngredientAccordion(ingredientAccordion === 'full' ? null : 'full')}
                  className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-[#fef5f1]/50 dark:hover:bg-[#3d2f34]/50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Package size={16} className="text-[#8b6f63]/50" />
                    <span className="text-sm font-medium text-[#8b6f63] dark:text-[#e8ddd5]">Full Ingredients List</span>
                    <span className="text-xs text-[#8b6f63]/40 ml-1">({dynamicIngredients.length})</span>
                  </div>
                  <motion.div
                    animate={{ rotate: ingredientAccordion === 'full' ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown size={16} className="text-[#8b6f63]/40" />
                  </motion.div>
                </button>
                <AnimatePresence>
                  {ingredientAccordion === 'full' && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <div className="bg-white dark:bg-[#2d1f24] rounded-b-2xl overflow-hidden">
                        <div className="grid grid-cols-[1fr_1fr_40px] sm:grid-cols-[1fr_1fr_60px] text-xs font-medium text-[#8b6f63]/50 uppercase tracking-wider border-b border-[#f5e6e0]/50 dark:border-[#3d2f34] bg-[#fef5f1]/50 dark:bg-[#2d1f24]">
                          <div className="px-5 py-3">Ingredient</div>
                          <div className="px-5 py-3">Purpose</div>
                          <div className="px-3 py-3 hidden sm:block" />
                        </div>
                        <div className="max-h-80 overflow-y-auto">
                          {dynamicIngredients.map((item, index) => {
                            const isKey = dynamicKeyIngredients.some(ki => item.name.includes(ki.name.split(' (')[0]));
                            return (
                              <div
                                key={item.name}
                                className={`grid grid-cols-[1fr_1fr_40px] sm:grid-cols-[1fr_1fr_60px] items-center ${
                                  index < dynamicIngredients.length - 1 ? 'border-b border-[#f5e6e0]/30 dark:border-[#3d2f34]/50' : ''
                                } ${isKey ? 'bg-[#fef5f1]/30 dark:bg-[#d4a5a5]/5' : ''}`}
                              >
                                <div className="px-5 py-3 text-sm text-[#8b6f63] dark:text-[#e8ddd5] flex items-center gap-2">
                                  {isKey && <span className="w-1.5 h-1.5 rounded-full bg-[#d4a5a5] flex-shrink-0" />}
                                  {item.name}
                                </div>
                                <div className="px-5 py-3 text-sm text-[#8b6f63]/60 dark:text-[#e8ddd5]/60">{item.purpose}</div>
                                <div className="px-3 py-3 hidden sm:block">
                                  <div className="w-5 h-5 rounded-full border-2 border-green-400 flex items-center justify-center">
                                    <Check size={10} className="text-green-500" />
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
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
              <div className="max-w-4xl">
                {/* Rating Distribution Chart */}
                {reviews.length > 0 && (
                  <motion.div
                    className="flex flex-col sm:flex-row gap-6 bg-[#fef5f1] rounded-2xl p-6 mb-8 border border-[#f5e6e0]/50"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 }}
                  >
                    {/* Average Rating Summary */}
                    <div className="flex flex-col items-center justify-center min-w-[140px] sm:border-r sm:border-[#d4a5a5]/20 sm:pr-6">
                      <span className="text-5xl font-bold text-[#8b6f63]">
                        {reviews.length > 0
                          ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
                          : '0.0'}
                      </span>
                      <div className="flex items-center gap-0.5 my-2">
                        {[...Array(5)].map((_, i) => {
                          const avg = reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;
                          return (
                            <Star
                              key={i}
                              size={16}
                              className={
                                i < Math.floor(avg)
                                  ? 'fill-[#d4a5a5] text-[#d4a5a5]'
                                  : i < avg
                                    ? 'fill-[#d4a5a5]/50 text-[#d4a5a5]'
                                    : 'text-[#8b6f63]/20'
                              }
                            />
                          );
                        })}
                      </div>
                      <span className="text-sm text-[#8b6f63]/50">{reviews.length} review{reviews.length !== 1 ? 's' : ''}</span>
                    </div>

                    {/* Rating Breakdown Bars */}
                    <div className="flex-1 space-y-2">
                      {[5, 4, 3, 2, 1].map((star) => {
                        const count = reviews.filter((r) => r.rating === star).length;
                        const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                        return (
                          <div key={star} className="flex items-center gap-3">
                            <span className="text-sm text-[#8b6f63]/70 w-12 text-right flex items-center justify-end gap-1">
                              {star}
                              <Star size={12} className="fill-[#d4a5a5] text-[#d4a5a5]" />
                            </span>
                            <div className="flex-1 h-2.5 bg-white rounded-full overflow-hidden">
                              <motion.div
                                className="h-full bg-[#d4a5a5] rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: `${percentage}%` }}
                                transition={{ duration: 0.6, delay: 0.1 + (5 - star) * 0.08, ease: 'easeOut' }}
                              />
                            </div>
                            <span className="text-xs text-[#8b6f63]/50 w-8 text-right">{count}</span>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}

                <h3 className="text-lg font-serif text-[#8b6f63] mb-6">Customer Reviews ({reviews.length})</h3>

                {/* Sort Dropdown + Reviews */}
                {reviews.length > 0 && (
                  <>
                    <div className="flex items-center justify-between mb-6">
                      <span className="text-sm text-[#8b6f63]/60">{reviews.length} review{reviews.length !== 1 ? 's' : ''}</span>
                      <div className="relative">
                        <select
                          value={reviewSortOrder}
                          onChange={(e) => setReviewSortOrder(e.target.value as 'recent' | 'highest' | 'lowest')}
                          className="appearance-none text-sm text-[#8b6f63] bg-white border border-[#f5e6e0] rounded-lg px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-[#d4a5a5]/50 focus:border-[#d4a5a5] cursor-pointer transition-all"
                        >
                          <option value="recent">Most Recent</option>
                          <option value="highest">Highest Rated</option>
                          <option value="lowest">Lowest Rated</option>
                        </select>
                        <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8b6f63]/40 pointer-events-none" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
                      {sortedReviews.map((review, index) => {
                        const avatarColor = AVATAR_COLORS[index % AVATAR_COLORS.length];
                        const initial = (review.user.name || 'U').charAt(0).toUpperCase();
                        const isLightBg = index % 2 === 1;

                        return (
                          <motion.div
                            key={review.id}
                            className={`rounded-xl p-6 shadow-sm border border-[#f5e6e0]/50 transition-colors ${isLightBg ? 'bg-[#fff8f6]' : 'bg-white'}`}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.04 }}
                            whileHover={{ y: -2 }}
                          >
                            {/* Header: Avatar + Name + Verified Badge + Date */}
                            <div className="flex items-start gap-3 mb-3">
                              <div
                                className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0"
                                style={{ backgroundColor: avatarColor }}
                              >
                                {initial}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-sm font-medium text-[#8b6f63] truncate">{review.user.name}</span>
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-50 text-green-700 text-[10px] font-medium rounded-full border border-green-200">
                                    <Check size={10} className="text-green-500" />
                                    Verified Purchase
                                  </span>
                                </div>
                                <span className="text-xs text-[#8b6f63]/40">{formatRelativeDate(review.createdAt)}</span>
                              </div>
                            </div>

                            {/* Rating Stars */}
                            <div className="flex items-center gap-1 mb-2">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} size={14} className={i < review.rating ? 'fill-[#d4a5a5] text-[#d4a5a5]' : 'text-[#8b6f63]/20'} />
                              ))}
                            </div>

                            {/* Comment */}
                            <p className="text-sm text-[#8b6f63]/70 mb-3 leading-relaxed">{review.comment || 'Great product!'}</p>

                            {/* Helpful Button */}
                            <button
                              className="inline-flex items-center gap-1.5 text-xs text-[#8b6f63]/40 hover:text-[#d4a5a5] transition-colors group"
                              onClick={() => toast('Thanks for your feedback!')}
                            >
                              <ThumbsUp size={13} className="group-hover:fill-[#d4a5a5]/20 transition-colors" />
                              Helpful
                            </button>
                          </motion.div>
                        );
                      })}
                    </div>
                  </>
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
              </div>
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

      {/* Complete the Look */}
      {completeLookProducts.length > 0 && (
        <motion.section
          className="mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center gap-4 mb-8">
            <motion.h2
              className="text-2xl font-serif text-[#8b6f63]"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.35 }}
            >
              Complete the Look
            </motion.h2>
            <motion.div
              className="flex-1 h-px bg-gradient-to-r from-[#d4a5a5]/40 to-transparent"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              style={{ originX: 0 }}
            />
          </div>
          <div className="flex gap-4 sm:gap-6 overflow-x-auto pb-4 scrollbar-thin snap-x snap-mandatory -mx-4 px-4 lg:mx-0 lg:px-0">
            {completeLookProducts.map((rp, index) => (
              <motion.div
                key={rp.id}
                className="flex-shrink-0 w-[200px] sm:w-[220px] lg:w-[240px] snap-start"
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

      {/* You May Also Like */}
      {mayAlsoLikeProducts.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center gap-4 mb-8">
            <motion.h2
              className="text-2xl font-serif text-[#8b6f63]"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.45 }}
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
            {mayAlsoLikeProducts.map((rp, index) => (
              <motion.div
                key={rp.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
              >
                <ProductCard product={rp} />
              </motion.div>
            ))}
          </div>
        </motion.section>
      )}

      {/* Size Guide Modal */}
      <AnimatePresence>
        {isSizeGuideOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setIsSizeGuideOpen(false)}
            role="dialog"
            aria-modal="true"
            aria-label="Size Guide"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="bg-white dark:bg-[#2d1f24] rounded-2xl shadow-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 pb-4 border-b border-[#f5e6e0]/50 dark:border-[#3d2f34]">
                <div className="flex items-center gap-2">
                  <Ruler size={20} className="text-[#d4a5a5]" />
                  <h3 className="text-lg font-serif text-[#8b6f63] dark:text-[#e8ddd5]">Size Guide</h3>
                </div>
                <button
                  onClick={() => setIsSizeGuideOpen(false)}
                  className="w-8 h-8 rounded-full bg-[#fef5f1] dark:bg-[#3d2f34] flex items-center justify-center text-[#8b6f63]/60 hover:text-[#8b6f63] transition-colors"
                  aria-label="Close size guide"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Size Table */}
                <div>
                  <h4 className="text-sm font-medium text-[#8b6f63] dark:text-[#e8ddd5] mb-3">Shade Sizes</h4>
                  <div className="bg-[#fef5f1] dark:bg-[#3d2f34]/50 rounded-xl overflow-hidden">
                    <div className="grid grid-cols-3 text-xs font-medium text-[#8b6f63]/50 uppercase tracking-wider border-b border-[#f5e6e0]/50 dark:border-[#3d2f34]">
                      <div className="px-4 py-2.5">Size</div>
                      <div className="px-4 py-2.5">Dimensions</div>
                      <div className="px-4 py-2.5">Best For</div>
                    </div>
                    {SIZE_GUIDE.map((item, index) => (
                      <motion.div
                        key={item.size}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 + index * 0.08 }}
                        className={`grid grid-cols-3 text-sm ${index < SIZE_GUIDE.length - 1 ? 'border-b border-[#f5e6e0]/30 dark:border-[#3d2f34]/50' : ''}`}
                      >
                        <div className="px-4 py-3 font-medium text-[#8b6f63] dark:text-[#e8ddd5]">{item.size}</div>
                        <div className="px-4 py-3 text-[#8b6f63]/70 dark:text-[#e8ddd5]/70">{item.dimensions}</div>
                        <div className="px-4 py-3 text-[#8b6f63]/70 dark:text-[#e8ddd5]/70">{item.recommended}</div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Visual Size Comparison */}
                <div>
                  <h4 className="text-sm font-medium text-[#8b6f63] dark:text-[#e8ddd5] mb-4">Relative Size Comparison</h4>
                  <div className="flex items-end justify-center gap-8 py-6 bg-[#fef5f1] dark:bg-[#3d2f34]/50 rounded-xl">
                    {SIZE_GUIDE.map((item, index) => (
                      <motion.div
                        key={item.size}
                        className="flex flex-col items-center gap-3"
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 + index * 0.12, type: 'spring', stiffness: 300, damping: 20 }}
                      >
                        <motion.div
                          className="rounded-full bg-gradient-to-br from-[#d4a5a5] to-[#c89a9a] shadow-md"
                          style={{ width: item.diameter, height: item.diameter }}
                          whileHover={{ scale: 1.1 }}
                        />
                        <span className="text-xs font-medium text-[#8b6f63] dark:text-[#e8ddd5]">{item.size}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Find Your Shade Tips */}
                <div>
                  <h4 className="text-sm font-medium text-[#8b6f63] dark:text-[#e8ddd5] mb-3">Find Your Shade</h4>
                  <div className="space-y-2.5">
                    {SHADE_TIPS.map((tip, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + index * 0.08 }}
                        className="flex items-start gap-3 p-3 bg-[#fef5f1] dark:bg-[#3d2f34]/50 rounded-lg"
                      >
                        <span className="text-lg flex-shrink-0 mt-0.5">{tip.icon}</span>
                        <p className="text-sm text-[#8b6f63]/80 dark:text-[#e8ddd5]/80 leading-relaxed">{tip.tip}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-6 pt-4 border-t border-[#f5e6e0]/50 dark:border-[#3d2f34]">
                <button
                  onClick={() => setIsSizeGuideOpen(false)}
                  className="w-full px-6 py-3 bg-[#d4a5a5] text-white rounded-full hover:bg-[#c89a9a] transition-all active:scale-[0.98] text-sm font-medium"
                >
                  Got It
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fullscreen Lightbox */}
      <AnimatePresence>
        {isLightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center"
            onClick={() => setIsLightboxOpen(false)}
            role="dialog"
            aria-modal="true"
            aria-label="Image lightbox"
          >
            {/* Close Button */}
            <button
              onClick={() => setIsLightboxOpen(false)}
              className="absolute top-4 right-4 z-50 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              aria-label="Close lightbox"
            >
              <X size={24} />
            </button>

            {/* Image Counter */}
            <div className="absolute top-4 left-4 z-50 bg-white/10 backdrop-blur-sm text-white text-sm px-3 py-1.5 rounded-full">
              {activeImageIndex + 1} / {galleryImages.length}
            </div>

            {/* Prev Arrow */}
            {hasMultipleImages && (
              <button
                onClick={(e) => { e.stopPropagation(); handleImageNav('left'); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-50 w-12 h-12 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white shadow-lg transition-colors"
                aria-label="Previous image"
              >
                <ChevronLeft size={28} />
              </button>
            )}

            {/* Main Lightbox Image */}
            <motion.div
              key={galleryImages[activeImageIndex]}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="max-w-4xl max-h-[85vh] w-full mx-16"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={galleryImages[activeImageIndex]}
                alt={`${product.name} - Image ${activeImageIndex + 1}`}
                className="w-full h-full object-contain rounded-2xl"
                draggable={false}
              />
            </motion.div>

            {/* Next Arrow */}
            {hasMultipleImages && (
              <button
                onClick={(e) => { e.stopPropagation(); handleImageNav('right'); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-50 w-12 h-12 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white shadow-lg transition-colors"
                aria-label="Next image"
              >
                <ChevronRight size={28} />
              </button>
            )}

            {/* Thumbnail strip at bottom of lightbox */}
            {hasMultipleImages && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 flex gap-2 max-w-[80vw] overflow-x-auto px-2">
                {galleryImages.map((imgUrl, index) => (
                  <button
                    key={imgUrl}
                    onClick={(e) => { e.stopPropagation(); setActiveImageIndex(index); }}
                    className={`flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden transition-all duration-200 border-2 ${
                      index === activeImageIndex
                        ? 'border-white opacity-100 scale-105'
                        : 'border-white/30 opacity-50 hover:opacity-80 hover:border-white/60'
                    }`}
                    aria-label={`Go to image ${index + 1}`}
                  >
                    <img
                      src={imgUrl}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                      draggable={false}
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Keyboard hint */}
            <div className="absolute bottom-6 right-6 z-50 text-white/40 text-xs hidden sm:block">
              ESC to close · Arrow keys to navigate
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
