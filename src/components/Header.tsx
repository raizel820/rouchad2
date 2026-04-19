'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Search, ShoppingBag, User, Menu, X, Heart, LogOut, Settings, Package, ChevronRight, Sun, Moon, Shield, Clock, TrendingUp, ArrowRight, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore, type Product } from '@/store/store';
import { toast } from '@/lib/toast';
import { MiniCartDrawer } from '@/components/MiniCartDrawer';
import { NotificationBell } from '@/components/NotificationBell';
import { useTheme } from 'next-themes';

interface SearchResult {
  id: string;
  name: string;
  price: number;
  category: string;
  image: string;
  rating: number;
  reviewCount: number;
  onSale?: boolean;
  discountedPrice?: number;
  savings?: number;
  discountPercentage?: number;
}

interface TrendingProduct {
  id: string;
  name: string;
  price: number;
  image: string;
  rating: number;
}

const RECENT_SEARCHES_KEY = 'rarebeauty_recent_searches';
const MAX_RECENT_SEARCHES = 5;

const CATEGORY_CHIPS = [
  { name: 'Makeup', color: 'bg-rose-400' },
  { name: 'Skincare', color: 'bg-emerald-400' },
  { name: 'Haircare', color: 'bg-amber-400' },
  { name: 'Perfume', color: 'bg-violet-400' },
];

function loadRecentSearches(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(RECENT_SEARCHES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveRecentSearchToStorage(query: string) {
  if (!query.trim()) return;
  try {
    const existing = loadRecentSearches();
    const filtered = existing.filter((s) => s.toLowerCase() !== query.toLowerCase());
    const updated = [query, ...filtered].slice(0, MAX_RECENT_SEARCHES);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
  } catch {
    // ignore storage errors
  }
}

function clearRecentSearchesStorage() {
  try {
    localStorage.removeItem(RECENT_SEARCHES_KEY);
  } catch {
    // ignore storage errors
  }
}

function HighlightedText({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <>{text}</>;
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);
  return (
    <>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <span key={i} className="font-bold text-[#d4a5a5] dark:text-[#d4a5a5]">{part}</span>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  );
}

function RatingStars({ rating }: { rating: number }) {
  return (
    <span className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={10}
          className={star <= Math.round(rating) ? 'text-amber-400 fill-amber-400' : 'text-[#d4c5c0] dark:text-[#3d2f34]'}
        />
      ))}
    </span>
  );
}

export function Header() {
  const {
    navigate, getCartCount, isAuthenticated, currentPage, user,
    setSelectedCategory, wishlistItems, navigateToProfile, setProductId,
    logout, setSearchQuery, shopSettings,
  } = useStore();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchQuery, setSearchQueryLocal] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [cartBounce, setCartBounce] = useState(false);
  const [prevCartCount, setPrevCartCount] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [trendingProducts, setTrendingProducts] = useState<TrendingProduct[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const { theme, setTheme } = useTheme();

  const searchRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mobileSearchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const mobileInputRef = useRef<HTMLInputElement>(null);

  const cartCount = getCartCount();
  const wishlistCount = wishlistItems.length;
  const categories = ['All', 'Makeup', 'Skincare', 'Haircare', 'Perfume'];

  // Compute total number of navigable items for keyboard nav
  const totalNavItems = useMemo(() => {
    if (!isSearchFocused && !showSearchDropdown) return 0;
    if (!searchQuery.trim()) {
      // Recent searches (if any) or trending products
      if (recentSearches.length > 0) return recentSearches.length;
      return trendingProducts.length;
    }
    // Live search results
    return searchResults.length;
  }, [isSearchFocused, showSearchDropdown, searchQuery, recentSearches.length, trendingProducts.length, searchResults.length]);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
    setRecentSearches(loadRecentSearches());
  }, []);

  // Fetch trending products on mount
  useEffect(() => {
    async function fetchTrending() {
      try {
        const res = await fetch('/api/products?limit=50');
        const data: Product[] = await res.json();
        const sorted = [...data].sort((a, b) => b.rating - a.rating);
        setTrendingProducts(sorted.slice(0, 3).map((p) => ({
          id: p.id,
          name: p.name,
          price: p.price,
          image: p.image,
          rating: p.rating,
        })));
      } catch {
        // ignore fetch errors
      }
    }
    fetchTrending();
  }, []);

  // Scroll detection for header effects
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Cart badge bounce animation when items are added
  useEffect(() => {
    if (cartCount > prevCartCount && prevCartCount >= 0) {
      setCartBounce(true);
      const timer = setTimeout(() => setCartBounce(false), 500);
      return () => clearTimeout(timer);
    }
    setPrevCartCount(cartCount);
  }, [cartCount, prevCartCount]);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close search dropdown when clicking outside (desktop)
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearchDropdown(false);
        setIsSearchFocused(false);
        setHighlightedIndex(-1);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close search dropdown when clicking outside (mobile)
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (mobileSearchRef.current && !mobileSearchRef.current.contains(e.target as Node)) {
        setShowSearchDropdown(false);
        setIsSearchFocused(false);
        setHighlightedIndex(-1);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Live search with debounce
  const handleSearchChange = useCallback((value: string) => {
    setSearchQueryLocal(value);
    setShowSearchDropdown(true);
    setHighlightedIndex(-1);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (!value.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/products?search=${encodeURIComponent(value.trim())}`);
        const data: Product[] = await res.json();
        setSearchResults(data.slice(0, 8).map((p) => ({
          id: p.id,
          name: p.name,
          price: p.price,
          category: p.category,
          image: p.image,
          rating: p.rating,
          reviewCount: p.reviewCount,
          onSale: p.onSale,
          discountedPrice: p.discountedPrice,
          savings: p.savings,
          discountPercentage: p.effectiveDiscount,
        })));
      } catch {
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);
  }, []);

  const handleSearchSubmit = useCallback((query: string) => {
    if (query.trim()) {
      saveRecentSearchToStorage(query.trim());
      setRecentSearches(loadRecentSearches());
      setSearchQuery(query.trim());
      navigate('products');
      setShowSearchDropdown(false);
      setIsSearchFocused(false);
      setIsSearchOpen(false);
      setIsMenuOpen(false);
      setHighlightedIndex(-1);
    }
  }, [navigate]);

  const handleRecentSearchClick = useCallback((query: string) => {
    setSearchQueryLocal(query);
    handleSearchSubmit(query);
  }, [handleSearchSubmit]);

  const clearRecentSearches = useCallback(() => {
    clearRecentSearchesStorage();
    setRecentSearches([]);
  }, []);

  const handleSearchResultClick = (result: SearchResult) => {
    setProductId(result.id);
    navigate('product-detail');
    setShowSearchDropdown(false);
    setIsSearchFocused(false);
    setIsSearchOpen(false);
    setIsMenuOpen(false);
    setSearchQueryLocal('');
    setHighlightedIndex(-1);
  };

  const handleTrendingClick = (product: TrendingProduct) => {
    setProductId(product.id);
    navigate('product-detail');
    setShowSearchDropdown(false);
    setIsSearchFocused(false);
    setIsSearchOpen(false);
    setIsMenuOpen(false);
    setSearchQueryLocal('');
    setHighlightedIndex(-1);
  };

  const handleCategoryChipClick = (cat: string) => {
    setSelectedCategory(cat);
    navigate('products');
    setIsMenuOpen(false);
    setShowSearchDropdown(false);
    setIsSearchFocused(false);
    setHighlightedIndex(-1);
  };

  const handleCategoryClick = (cat: string) => {
    setSelectedCategory(cat);
    navigate('products');
    setIsMenuOpen(false);
  };

  const handleWishlistClick = () => {
    if (isAuthenticated) {
      navigate('wishlist');
    } else {
      navigate('login');
    }
    setIsMenuOpen(false);
  };

  const handleSignOut = () => {
    logout();
    setIsProfileOpen(false);
    toast('You have been signed out');
    navigate('home');
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const handleSearchFocus = useCallback(() => {
    setIsSearchFocused(true);
    setShowSearchDropdown(true);
    setHighlightedIndex(-1);
  }, []);

  const handleSearchBlur = useCallback(() => {
    // Delay to allow click events on dropdown items
    setTimeout(() => {
      setShowSearchDropdown(false);
      setIsSearchFocused(false);
      setHighlightedIndex(-1);
    }, 200);
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>, isMobile: boolean) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightedIndex >= 0 && highlightedIndex < totalNavItems) {
        if (!searchQuery.trim()) {
          // Navigating recent searches or trending
          if (recentSearches.length > 0 && highlightedIndex < recentSearches.length) {
            handleRecentSearchClick(recentSearches[highlightedIndex]);
            return;
          }
          if (trendingProducts.length > 0 && highlightedIndex < trendingProducts.length) {
            handleTrendingClick(trendingProducts[highlightedIndex]);
            return;
          }
        } else {
          // Navigating search results
          if (highlightedIndex < searchResults.length) {
            handleSearchResultClick(searchResults[highlightedIndex]);
            return;
          }
        }
      }
      // If nothing highlighted, submit the search
      handleSearchSubmit(searchQuery);
      if (!isMobile) {
        inputRef.current?.blur();
      } else {
        mobileInputRef.current?.blur();
      }
      return;
    }

    if (e.key === 'Escape') {
      e.preventDefault();
      setShowSearchDropdown(false);
      setIsSearchFocused(false);
      setHighlightedIndex(-1);
      if (!isMobile) {
        inputRef.current?.blur();
      } else {
        mobileInputRef.current?.blur();
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev + 1 >= totalNavItems ? 0 : prev + 1));
      return;
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev <= 0 ? totalNavItems - 1 : prev - 1));
    }
  }, [highlightedIndex, totalNavItems, searchQuery, recentSearches, trendingProducts, searchResults, handleSearchSubmit, handleRecentSearchClick, handleSearchResultClick, handleTrendingClick]);

  // Render the search dropdown content (shared between desktop and mobile)
  const renderSearchDropdown = (isMobile: boolean) => {
    // When focused but no query typed
    if (!searchQuery.trim() && (isSearchFocused || showSearchDropdown)) {
      return (
        <div className="p-2">
          {/* Recent Searches */}
          {recentSearches.length > 0 ? (
            <div>
              <div className="flex items-center justify-between px-3 py-2">
                <span className="text-xs font-semibold text-[#8b6f63]/70 dark:text-[#a89898] uppercase tracking-wider">Recent Searches</span>
                <button
                  onClick={clearRecentSearches}
                  className="text-xs text-[#d4a5a5] hover:text-[#8b6f63] dark:hover:text-[#e8ddd5] transition-colors flex items-center gap-1"
                >
                  <X size={12} />
                  Clear Recent
                </button>
              </div>
              <div className="max-h-48 overflow-y-auto">
                {recentSearches.map((term, idx) => (
                  <button
                    key={term}
                    onMouseDown={(e) => { e.preventDefault(); handleRecentSearchClick(term); }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left ${
                      highlightedIndex === idx
                        ? 'bg-[#fef5f1] dark:bg-[#3d2f34]'
                        : 'hover:bg-[#fef5f1] dark:hover:bg-[#3d2f34]'
                    }`}
                  >
                    <Clock size={14} className="text-[#8b6f63]/40 dark:text-[#a89898]/50 flex-shrink-0" />
                    <span className="text-sm text-[#8b6f63] dark:text-[#e8ddd5]">{term}</span>
                    <ArrowRight size={12} className="text-[#8b6f63]/30 dark:text-[#a89898]/30 ml-auto flex-shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          ) : trendingProducts.length > 0 ? (
            <div>
              <div className="flex items-center gap-2 px-3 py-2">
                <TrendingUp size={12} className="text-[#d4a5a5]" />
                <span className="text-xs font-semibold text-[#8b6f63]/70 dark:text-[#a89898] uppercase tracking-wider">Trending Products</span>
              </div>
              <div className="max-h-56 overflow-y-auto">
                {trendingProducts.map((product, idx) => (
                  <button
                    key={product.id}
                    onMouseDown={(e) => { e.preventDefault(); handleTrendingClick(product); }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left ${
                      highlightedIndex === idx
                        ? 'bg-[#fef5f1] dark:bg-[#3d2f34]'
                        : 'hover:bg-[#fef5f1] dark:hover:bg-[#3d2f34]'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-lg bg-[#fef5f1] dark:bg-[#1a1215] overflow-hidden flex-shrink-0 relative">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                      <div className="absolute top-0 right-0 bg-[#d4a5a5] rounded-bl-lg p-0.5">
                        <TrendingUp size={8} className="text-white" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#8b6f63] dark:text-[#e8ddd5] truncate">{product.name}</p>
                      <div className="flex items-center gap-1.5">
                        <RatingStars rating={product.rating} />
                        <span className="text-[10px] text-[#8b6f63]/50 dark:text-[#a89898]/60">{product.rating}</span>
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-[#d4a5a5]">${product.price.toFixed(2)}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {/* Category Quick Filters */}
          <div className="mt-2 pt-2 border-t border-[#f5e6e0] dark:border-[#3d2f34]">
            <span className="text-xs font-semibold text-[#8b6f63]/70 dark:text-[#a89898] uppercase tracking-wider px-3 pb-2 block">Categories</span>
            <div className="flex flex-wrap gap-2 px-3 pb-1">
              {CATEGORY_CHIPS.map((cat) => (
                <button
                  key={cat.name}
                  onMouseDown={(e) => { e.preventDefault(); handleCategoryChipClick(cat.name); }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#fef5f1] dark:bg-[#1a1215] hover:bg-[#f5e6e0] dark:hover:bg-[#3d2f34] transition-colors text-xs font-medium text-[#8b6f63] dark:text-[#e8ddd5]"
                >
                  <span className={`w-2 h-2 rounded-full ${cat.color}`} />
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      );
    }

    // When typing - show search results
    if (searchQuery.trim()) {
      return (
        <div className="p-2">
          {isSearching ? (
            <div className="p-4 text-center text-sm text-[#8b6f63]/60 dark:text-[#a89898]">
              <div className="inline-block w-4 h-4 border-2 border-[#d4a5a5] border-t-transparent rounded-full animate-spin mr-2" />
              Searching...
            </div>
          ) : searchResults.length > 0 ? (
            <>
              <div className="max-h-80 overflow-y-auto">
                {searchResults.map((result, idx) => (
                  <button
                    key={result.id}
                    onMouseDown={(e) => { e.preventDefault(); handleSearchResultClick(result); }}
                    onMouseEnter={() => setHighlightedIndex(idx)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left ${
                      highlightedIndex === idx
                        ? 'bg-[#fef5f1] dark:bg-[#3d2f34]'
                        : 'hover:bg-[#fef5f1] dark:hover:bg-[#3d2f34]'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-lg bg-[#fef5f1] dark:bg-[#1a1215] overflow-hidden flex-shrink-0 relative">
                      <img
                        src={result.image}
                        alt={result.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                      {result.onSale && result.discountPercentage && (
                        <div className="absolute top-0 left-0 bg-red-500 text-white text-[9px] font-bold px-1 py-0.5 rounded-tl-lg rounded-br-lg">
                          -{Math.round(result.discountPercentage)}%
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-medium text-[#8b6f63] dark:text-[#e8ddd5] truncate">
                          <HighlightedText text={result.name} query={searchQuery} />
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <RatingStars rating={result.rating} />
                        <span className="text-[10px] text-[#8b6f63]/50 dark:text-[#a89898]/60">{result.rating}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end flex-shrink-0">
                      {result.onSale && result.discountedPrice ? (
                        <>
                          <span className="text-sm font-semibold text-[#d4a5a5]">${result.discountedPrice.toFixed(2)}</span>
                          <span className="text-[10px] text-[#8b6f63]/40 dark:text-[#a89898]/40 line-through">${result.price.toFixed(2)}</span>
                        </>
                      ) : (
                        <span className="text-sm font-semibold text-[#d4a5a5]">${result.price.toFixed(2)}</span>
                      )}
                    </div>
                  </button>
                ))}
              </div>

              {/* View All Results Button */}
              {searchResults.length >= 5 && (
                <div className="border-t border-[#f5e6e0] dark:border-[#3d2f34] mt-1 pt-1">
                  <button
                    onMouseDown={(e) => { e.preventDefault(); handleSearchSubmit(searchQuery); }}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-medium text-[#d4a5a5] hover:bg-[#fef5f1] dark:hover:bg-[#3d2f34] rounded-lg transition-colors"
                  >
                    View All Results
                    <ArrowRight size={14} />
                  </button>
                </div>
              )}

              {/* Category Quick Filters below results */}
              <div className="border-t border-[#f5e6e0] dark:border-[#3d2f34] mt-1 pt-2">
                <span className="text-xs font-semibold text-[#8b6f63]/70 dark:text-[#a89898] uppercase tracking-wider px-3 pb-2 block">Categories</span>
                <div className="flex flex-wrap gap-2 px-3 pb-1">
                  {CATEGORY_CHIPS.map((cat) => (
                    <button
                      key={cat.name}
                      onMouseDown={(e) => { e.preventDefault(); handleCategoryChipClick(cat.name); }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#fef5f1] dark:bg-[#1a1215] hover:bg-[#f5e6e0] dark:hover:bg-[#3d2f34] transition-colors text-xs font-medium text-[#8b6f63] dark:text-[#e8ddd5]"
                    >
                      <span className={`w-2 h-2 rounded-full ${cat.color}`} />
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <>
              {/* No results */}
              <div className="p-6 text-center">
                <Search size={24} className="text-[#8b6f63]/30 dark:text-[#a89898]/30 mx-auto mb-2" />
                <p className="text-sm text-[#8b6f63]/60 dark:text-[#a89898]">
                  No products found for &ldquo;{searchQuery}&rdquo;
                </p>
                <p className="text-xs text-[#8b6f63]/40 dark:text-[#a89898]/50 mt-1">Try a different search or browse categories</p>
              </div>

              {/* Category suggestions */}
              <div className="border-t border-[#f5e6e0] dark:border-[#3d2f34] pt-2 px-3 pb-2">
                <span className="text-xs font-semibold text-[#8b6f63]/70 dark:text-[#a89898] uppercase tracking-wider pb-2 block">Browse Categories</span>
                <div className="flex flex-wrap gap-2">
                  {CATEGORY_CHIPS.map((cat) => (
                    <button
                      key={cat.name}
                      onMouseDown={(e) => { e.preventDefault(); handleCategoryChipClick(cat.name); }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#fef5f1] dark:bg-[#1a1215] hover:bg-[#f5e6e0] dark:hover:bg-[#3d2f34] transition-colors text-xs font-medium text-[#8b6f63] dark:text-[#e8ddd5]"
                    >
                      <span className={`w-2 h-2 rounded-full ${cat.color}`} />
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      );
    }

    return null;
  };

  return (
    <>
      <header className={`sticky top-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white/80 dark:bg-[#1a1215]/80 backdrop-blur-xl shadow-sm border-b border-[#f5e6e0]/50 dark:border-[#3d2f34]/50' : 'bg-white/95 dark:bg-[#1a1215]/95 backdrop-blur-sm'} relative`}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-4">
            {/* Mobile menu button */}
            <button
              className="lg:hidden p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X size={24} className="text-[#8b6f63] dark:text-[#e8ddd5]" /> : <Menu size={24} className="text-[#8b6f63] dark:text-[#e8ddd5]" />}
            </button>

            {/* Logo */}
            <button onClick={() => navigate('home')} className="text-2xl font-serif text-[#8b6f63] dark:text-[#e8ddd5] hover:text-[#d4a5a5] transition-colors">
              {shopSettings.shopName}
            </button>

            {/* Search (desktop) */}
            <div className="hidden md:flex items-center flex-1 max-w-md mx-8" ref={searchRef}>
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8b6f63]/50 dark:text-[#a89898]/60" size={18} />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  onFocus={handleSearchFocus}
                  onBlur={handleSearchBlur}
                  onKeyDown={(e) => handleKeyDown(e, false)}
                  className="w-full pl-10 pr-4 py-2 bg-[#fef5f1] dark:bg-[#2d1f24] rounded-full text-sm text-[#8b6f63] dark:text-[#e8ddd5] placeholder:text-[#8b6f63]/40 dark:placeholder:text-[#a89898]/50 focus:outline-none focus:ring-2 focus:ring-[#d4a5a5]"
                  role="combobox"
                  aria-expanded={showSearchDropdown}
                  aria-controls="search-dropdown-list"
                  aria-activedescendant={highlightedIndex >= 0 ? `search-option-${highlightedIndex}` : undefined}
                  aria-autocomplete="list"
                />

                {/* Search Dropdown */}
                <AnimatePresence>
                  {showSearchDropdown && isSearchFocused && (
                    <motion.div
                      id="search-dropdown-list"
                      initial={{ opacity: 0, y: -4, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -4, scale: 0.98 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#2d1f24] rounded-xl shadow-lg border border-[#f5e6e0] dark:border-[#3d2f34] overflow-hidden z-50"
                      role="listbox"
                    >
                      {renderSearchDropdown(false)}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Right icons */}
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                className="md:hidden p-2 hover:bg-[#fef5f1] dark:hover:bg-[#3d2f34] rounded-full transition-colors"
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                aria-label="Search"
              >
                <Search size={20} className="text-[#8b6f63] dark:text-[#e8ddd5]" />
              </button>

              {/* Theme Toggle */}
              {mounted && (
                <button
                  onClick={toggleTheme}
                  className="p-2 hover:bg-[#fef5f1] dark:hover:bg-[#3d2f34] rounded-full transition-colors"
                  aria-label="Toggle theme"
                >
                  <AnimatePresence mode="wait" initial={false}>
                    {theme === 'dark' ? (
                      <motion.div
                        key="moon"
                        initial={{ rotate: -90, scale: 0 }}
                        animate={{ rotate: 0, scale: 1 }}
                        exit={{ rotate: 90, scale: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Moon size={20} className="text-[#d4a5a5]" />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="sun"
                        initial={{ rotate: 90, scale: 0 }}
                        animate={{ rotate: 0, scale: 1 }}
                        exit={{ rotate: -90, scale: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Sun size={20} className="text-[#8b6f63]" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </button>
              )}

              {/* Notification Bell */}
              <NotificationBell />

              {/* Wishlist */}
              <button
                onClick={handleWishlistClick}
                className="p-2 hover:bg-[#fef5f1] dark:hover:bg-[#3d2f34] rounded-full transition-colors relative"
                aria-label="Wishlist"
              >
                <Heart size={20} className={isAuthenticated && wishlistCount > 0 ? 'text-red-500 fill-red-500' : 'text-[#8b6f63] dark:text-[#e8ddd5]'} />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                    {wishlistCount > 99 ? '99+' : wishlistCount}
                  </span>
                )}
              </button>

              {/* Profile / Sign In */}
              {isAuthenticated ? (
                <div className="relative" ref={profileRef}>
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="p-2 hover:bg-[#fef5f1] dark:hover:bg-[#3d2f34] rounded-full transition-colors"
                    aria-label="Profile"
                  >
                    <User size={20} className="text-[#8b6f63] dark:text-[#e8ddd5]" />
                  </button>

                  {/* Profile Dropdown */}
                  <AnimatePresence>
                    {isProfileOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -4, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -4, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-[#2d1f24] rounded-xl shadow-lg border border-[#f5e6e0] dark:border-[#3d2f34] overflow-hidden z-50"
                      >
                        {/* User Info */}
                        <div className="px-4 py-3 bg-[#fef5f1] dark:bg-[#1a1215] border-b border-[#f5e6e0] dark:border-[#3d2f34]">
                          <p className="text-sm font-semibold text-[#8b6f63] dark:text-[#e8ddd5] truncate">{user?.name}</p>
                          <p className="text-xs text-[#8b6f63]/60 dark:text-[#a89898] truncate">{user?.email}</p>
                        </div>

                        {/* Menu Items */}
                        <div className="py-1">
                          <button
                            onClick={() => { navigateToProfile(); setIsProfileOpen(false); }}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[#8b6f63] dark:text-[#e8ddd5] hover:bg-[#fef5f1] dark:hover:bg-[#3d2f34] transition-colors text-left"
                          >
                            <User size={16} className="text-[#8b6f63]/60 dark:text-[#a89898]" />
                            My Profile
                          </button>
                          <button
                            onClick={() => { navigateToProfile('orders'); setIsProfileOpen(false); }}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[#8b6f63] dark:text-[#e8ddd5] hover:bg-[#fef5f1] dark:hover:bg-[#3d2f34] transition-colors text-left"
                          >
                            <Package size={16} className="text-[#8b6f63]/60 dark:text-[#a89898]" />
                            My Orders
                          </button>
                          <button
                            onClick={() => { navigate('wishlist'); setIsProfileOpen(false); }}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[#8b6f63] dark:text-[#e8ddd5] hover:bg-[#fef5f1] dark:hover:bg-[#3d2f34] transition-colors text-left"
                          >
                            <Heart size={16} className="text-[#8b6f63]/60 dark:text-[#a89898]" />
                            My Wishlist
                          </button>
                          <button
                            onClick={() => { navigate('settings'); setIsProfileOpen(false); }}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[#8b6f63] dark:text-[#e8ddd5] hover:bg-[#fef5f1] dark:hover:bg-[#3d2f34] transition-colors text-left"
                          >
                            <Settings size={16} className="text-[#8b6f63]/60 dark:text-[#a89898]" />
                            Settings
                          </button>
                          {user?.role === 'admin' && (
                            <button
                              onClick={() => { navigate('admin'); setIsProfileOpen(false); }}
                              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[#d4a5a5] hover:bg-[#fef5f1] dark:hover:bg-[#3d2f34] transition-colors text-left font-medium"
                            >
                              <Shield size={16} className="text-[#d4a5a5]" />
                              Admin Dashboard
                            </button>
                          )}
                        </div>

                        {/* Divider + Sign Out */}
                        <div className="border-t border-[#f5e6e0] dark:border-[#3d2f34] py-1">
                          <button
                            onClick={handleSignOut}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-left"
                          >
                            <LogOut size={16} />
                            Sign Out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <button
                  onClick={() => navigate('login')}
                  className="hidden sm:flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#8b6f63] dark:text-[#e8ddd5] border border-[#8b6f63]/30 dark:border-[#3d2f34] rounded-full hover:border-[#d4a5a5] hover:text-[#d4a5a5] hover:bg-[#fef5f1] dark:hover:bg-[#3d2f34] transition-all"
                >
                  Sign In
                </button>
              )}

              {/* Cart */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="p-2 hover:bg-[#fef5f1] dark:hover:bg-[#3d2f34] rounded-full transition-colors relative"
                aria-label="Cart"
              >
                <ShoppingBag size={20} className="text-[#8b6f63] dark:text-[#e8ddd5]" />
                {cartCount > 0 && (
                  <motion.span
                    key={cartCount}
                    initial={cartBounce ? { scale: 0.5 } : false}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                    className="absolute -top-1 -right-1 bg-[#d4a5a5] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium"
                  >
                    {cartCount > 99 ? '99+' : cartCount}
                  </motion.span>
                )}
              </button>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center justify-center gap-8 pb-4 border-t border-[#f5e6e0] dark:border-[#2d1f24] pt-3">
            <button
              onClick={() => navigate('home')}
              className={`text-sm relative py-1 transition-colors ${currentPage === 'home' ? 'text-[#d4a5a5] font-medium' : 'text-[#8b6f63] dark:text-[#e8ddd5] hover:text-[#d4a5a5]'}`}
            >
              Home
              {currentPage === 'home' && (
                <motion.span
                  layoutId="nav-underline"
                  className="absolute -bottom-[11px] left-0 right-0 h-0.5 bg-[#d4a5a5] rounded-full"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
            </button>
            {categories.slice(1).map((category) => (
              <button
                key={category}
                onClick={() => handleCategoryClick(category)}
                className={`text-sm relative py-1 transition-colors ${currentPage === 'products' ? 'text-[#d4a5a5] font-medium' : 'text-[#8b6f63] dark:text-[#e8ddd5] hover:text-[#d4a5a5]'}`}
              >
                {category}
                {currentPage === 'products' && (
                  <motion.span
                    layoutId="nav-underline"
                    className="absolute -bottom-[11px] left-0 right-0 h-0.5 bg-[#d4a5a5] rounded-full"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
              </button>
            ))}
            <button
              onClick={() => handleCategoryClick('All')}
              className={`text-sm relative py-1 transition-colors ${currentPage === 'products' ? 'text-[#d4a5a5] font-medium' : 'text-[#8b6f63] dark:text-[#e8ddd5] hover:text-[#d4a5a5]'}`}
            >
              All Products
              {currentPage === 'products' && (
                <motion.span
                  layoutId="nav-underline"
                  className="absolute -bottom-[11px] left-0 right-0 h-0.5 bg-[#d4a5a5] rounded-full"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
            </button>
          </nav>

          {/* Mobile Navigation - AnimatePresence for smooth slide */}
          <AnimatePresence>
            {isMenuOpen && (
              <motion.nav
                initial={{ height: 0, opacity: 0, x: -16 }}
                animate={{ height: 'auto', opacity: 1, x: 0 }}
                exit={{ height: 0, opacity: 0, x: -16 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="lg:hidden overflow-hidden"
              >
                <div className="flex flex-col gap-3 pb-4 border-t border-[#f5e6e0] dark:border-[#2d1f24] pt-4">
                  <button onClick={() => { navigate('home'); setIsMenuOpen(false); }} className="text-sm text-[#8b6f63] dark:text-[#e8ddd5] hover:text-[#d4a5a5] text-left py-1 flex items-center justify-between">
                    Home
                    {currentPage === 'home' && <ChevronRight size={16} className="text-[#d4a5a5]" />}
                  </button>
                  {categories.slice(1).map((category) => (
                    <button key={category} onClick={() => handleCategoryClick(category)} className="text-sm text-[#8b6f63] dark:text-[#e8ddd5] hover:text-[#d4a5a5] text-left py-1 flex items-center justify-between">
                      {category}
                      {currentPage === 'products' && <ChevronRight size={16} className="text-[#d4a5a5]" />}
                    </button>
                  ))}
                  <button onClick={() => handleCategoryClick('All')} className="text-sm text-[#8b6f63] dark:text-[#e8ddd5] hover:text-[#d4a5a5] text-left py-1 flex items-center justify-between">
                    All Products
                    {currentPage === 'products' && <ChevronRight size={16} className="text-[#d4a5a5]" />}
                  </button>
                  <div className="border-t border-[#f5e6e0] dark:border-[#2d1f24] pt-3 mt-1">
                    {isAuthenticated && (
                      <button onClick={() => { handleWishlistClick(); }} className="text-sm text-[#8b6f63] dark:text-[#e8ddd5] hover:text-[#d4a5a5] text-left py-1 flex items-center justify-between">
                        Wishlist {wishlistCount > 0 && `(${wishlistCount})`}
                      </button>
                    )}
                    <button onClick={() => { navigate('contact'); setIsMenuOpen(false); }} className="text-sm text-[#8b6f63] dark:text-[#e8ddd5] hover:text-[#d4a5a5] text-left py-1">Contact</button>
                    <button onClick={() => { navigate('help-center'); setIsMenuOpen(false); }} className="text-sm text-[#8b6f63] dark:text-[#e8ddd5] hover:text-[#d4a5a5] text-left py-1">Help Center</button>
                    {isAuthenticated && (
                      <button onClick={() => { handleSignOut(); setIsMenuOpen(false); }} className="text-sm text-red-500 hover:text-red-600 text-left py-1">Sign Out</button>
                    )}
                  </div>
                </div>
              </motion.nav>
            )}
          </AnimatePresence>

          {/* Mobile Search Bar */}
          <AnimatePresence>
            {isSearchOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2, ease: 'easeInOut' }}
                className="md:hidden overflow-hidden"
              >
                <div className="pb-4" ref={mobileSearchRef}>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8b6f63]/50 dark:text-[#a89898]/60" size={18} />
                    <input
                      ref={mobileInputRef}
                      type="text"
                      placeholder="Search products..."
                      value={searchQuery}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      onFocus={handleSearchFocus}
                      onKeyDown={(e) => handleKeyDown(e, true)}
                      className="w-full pl-10 pr-4 py-2 bg-[#fef5f1] dark:bg-[#2d1f24] rounded-full text-sm text-[#8b6f63] dark:text-[#e8ddd5] placeholder:text-[#8b6f63]/40 dark:placeholder:text-[#a89898]/50 focus:outline-none focus:ring-2 focus:ring-[#d4a5a5]"
                      autoFocus
                    />

                    {/* Mobile Search Dropdown */}
                    <AnimatePresence>
                      {showSearchDropdown && isSearchFocused && (
                        <motion.div
                          initial={{ opacity: 0, y: -4, scale: 0.98 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -4, scale: 0.98 }}
                          transition={{ duration: 0.15 }}
                          className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#2d1f24] rounded-xl shadow-lg border border-[#f5e6e0] dark:border-[#3d2f34] overflow-hidden z-50"
                        >
                          {renderSearchDropdown(true)}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* Bottom gradient border on scroll */}
      <AnimatePresence>
        {isScrolled && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed top-[73px] left-0 right-0 h-px z-50 bg-gradient-to-r from-transparent via-[#d4a5a5]/30 dark:via-[#d4a5a5]/20 to-transparent pointer-events-none"
          />
        )}
      </AnimatePresence>

      {/* Mini Cart Drawer */}
      <MiniCartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}
