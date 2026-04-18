'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, ShoppingBag, User, Menu, X, Heart, LogOut, Settings, Package, ChevronRight, Sun, Moon, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore, type Product } from '@/store/store';
import { toast } from '@/lib/toast';
import { MiniCartDrawer } from '@/components/MiniCartDrawer';
import { useTheme } from 'next-themes';

interface SearchResult {
  id: string;
  name: string;
  price: number;
  category: string;
  image: string;
}

export function Header() {
  const {
    navigate, getCartCount, isAuthenticated, currentPage, user,
    setSelectedCategory, wishlistItems, navigateToProfile, setProductId,
    logout, setSearchQuery,
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

  const { theme, setTheme } = useTheme();

  const searchRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const cartCount = getCartCount();
  const wishlistCount = wishlistItems.length;
  const categories = ['All', 'Makeup', 'Skincare', 'Haircare', 'Perfume'];

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
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

  // Close search dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Live search with debounce
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearchChange = useCallback((value: string) => {
    setSearchQueryLocal(value);
    setShowSearchDropdown(true);

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
        setSearchResults(data.slice(0, 5).map((p) => ({
          id: p.id,
          name: p.name,
          price: p.price,
          category: p.category,
          image: p.image,
        })));
      } catch {
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);
  }, []);

  const handleSearchSubmit = (query: string) => {
    if (query.trim()) {
      setSearchQuery(query.trim());
      navigate('products');
      setShowSearchDropdown(false);
      setIsSearchOpen(false);
      setIsMenuOpen(false);
    }
  };

  const handleSearchResultClick = (result: SearchResult) => {
    setProductId(result.id);
    navigate('product-detail');
    setShowSearchDropdown(false);
    setIsSearchOpen(false);
    setIsMenuOpen(false);
    setSearchQueryLocal('');
  };

  const handleCategoryClick = (cat: string) => {
    setSelectedCategory(cat);
    navigate('products');
    setIsMenuOpen(false);
  };

  const handleWishlistClick = () => {
    if (isAuthenticated) {
      navigateToProfile('wishlist');
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

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/95 dark:bg-[#1a1215]/95 backdrop-blur-sm border-b border-[#f5e6e0] dark:border-[#2d1f24]">
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
              Rare Beauty
            </button>

            {/* Search (desktop) */}
            <div className="hidden md:flex items-center flex-1 max-w-md mx-8" ref={searchRef}>
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8b6f63]/50 dark:text-[#a89898]/60" size={18} />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  onFocus={() => {
                    setIsSearchOpen(true);
                    if (searchQuery.trim()) setShowSearchDropdown(true);
                  }}
                  onBlur={() => setTimeout(() => setShowSearchDropdown(false), 200)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSearchSubmit(searchQuery);
                      (e.target as HTMLInputElement).blur();
                    }
                    if (e.key === 'Escape') {
                      setShowSearchDropdown(false);
                      (e.target as HTMLInputElement).blur();
                    }
                  }}
                  className="w-full pl-10 pr-4 py-2 bg-[#fef5f1] dark:bg-[#2d1f24] rounded-full text-sm text-[#8b6f63] dark:text-[#e8ddd5] placeholder:text-[#8b6f63]/40 dark:placeholder:text-[#a89898]/50 focus:outline-none focus:ring-2 focus:ring-[#d4a5a5]"
                />

                {/* Live Search Results Dropdown */}
                <AnimatePresence>
                  {showSearchDropdown && searchQuery.trim() && (
                    <motion.div
                      initial={{ opacity: 0, y: -4, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -4, scale: 0.98 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#2d1f24] rounded-xl shadow-lg border border-[#f5e6e0] dark:border-[#3d2f34] overflow-hidden z-50"
                    >
                      {isSearching ? (
                        <div className="p-4 text-center text-sm text-[#8b6f63]/60 dark:text-[#a89898]">
                          <div className="inline-block w-4 h-4 border-2 border-[#d4a5a5] border-t-transparent rounded-full animate-spin mr-2" />
                          Searching...
                        </div>
                      ) : searchResults.length > 0 ? (
                        <div className="max-h-80 overflow-y-auto">
                          {searchResults.map((result) => (
                            <button
                              key={result.id}
                              onMouseDown={() => handleSearchResultClick(result)}
                              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#fef5f1] dark:hover:bg-[#3d2f34] transition-colors text-left"
                            >
                              <div className="w-10 h-10 rounded-lg bg-[#fef5f1] dark:bg-[#1a1215] overflow-hidden flex-shrink-0">
                                <img
                                  src={result.image}
                                  alt={result.name}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = 'none';
                                  }}
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-[#8b6f63] dark:text-[#e8ddd5] truncate">{result.name}</p>
                                <p className="text-xs text-[#8b6f63]/60 dark:text-[#a89898]">{result.category}</p>
                              </div>
                              <span className="text-sm font-semibold text-[#d4a5a5]">${result.price.toFixed(2)}</span>
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="p-4 text-center text-sm text-[#8b6f63]/60 dark:text-[#a89898]">
                          No products found for &ldquo;{searchQuery}&rdquo;
                        </div>
                      )}
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
                            onClick={() => { navigateToProfile('wishlist'); setIsProfileOpen(false); }}
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
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: 'easeInOut' }}
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
                <div className="pb-4" ref={searchRef}>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8b6f63]/50 dark:text-[#a89898]/60" size={18} />
                    <input
                      type="text"
                      placeholder="Search products..."
                      value={searchQuery}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      onFocus={() => {
                        if (searchQuery.trim()) setShowSearchDropdown(true);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleSearchSubmit(searchQuery);
                          (e.target as HTMLInputElement).blur();
                        }
                        if (e.key === 'Escape') {
                          setShowSearchDropdown(false);
                          setIsSearchOpen(false);
                        }
                      }}
                      className="w-full pl-10 pr-4 py-2 bg-[#fef5f1] dark:bg-[#2d1f24] rounded-full text-sm text-[#8b6f63] dark:text-[#e8ddd5] placeholder:text-[#8b6f63]/40 dark:placeholder:text-[#a89898]/50 focus:outline-none focus:ring-2 focus:ring-[#d4a5a5]"
                      autoFocus
                    />

                    {/* Mobile Search Results */}
                    <AnimatePresence>
                      {showSearchDropdown && searchQuery.trim() && (
                        <motion.div
                          initial={{ opacity: 0, y: -4, scale: 0.98 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -4, scale: 0.98 }}
                          transition={{ duration: 0.15 }}
                          className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#2d1f24] rounded-xl shadow-lg border border-[#f5e6e0] dark:border-[#3d2f34] overflow-hidden z-50"
                        >
                          {isSearching ? (
                            <div className="p-4 text-center text-sm text-[#8b6f63]/60 dark:text-[#a89898]">
                              <div className="inline-block w-4 h-4 border-2 border-[#d4a5a5] border-t-transparent rounded-full animate-spin mr-2" />
                              Searching...
                            </div>
                          ) : searchResults.length > 0 ? (
                            <div className="max-h-80 overflow-y-auto">
                              {searchResults.map((result) => (
                                <button
                                  key={result.id}
                                  onClick={() => handleSearchResultClick(result)}
                                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#fef5f1] dark:hover:bg-[#3d2f34] transition-colors text-left"
                                >
                                  <div className="w-10 h-10 rounded-lg bg-[#fef5f1] dark:bg-[#1a1215] overflow-hidden flex-shrink-0">
                                    <img
                                      src={result.image}
                                      alt={result.name}
                                      className="w-full h-full object-cover"
                                      onError={(e) => {
                                        (e.target as HTMLImageElement).style.display = 'none';
                                      }}
                                    />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-[#8b6f63] dark:text-[#e8ddd5] truncate">{result.name}</p>
                                    <p className="text-xs text-[#8b6f63]/60 dark:text-[#a89898]">{result.category}</p>
                                  </div>
                                  <span className="text-sm font-semibold text-[#d4a5a5]">${result.price.toFixed(2)}</span>
                                </button>
                              ))}
                            </div>
                          ) : (
                            <div className="p-4 text-center text-sm text-[#8b6f63]/60 dark:text-[#a89898]">
                              No products found
                            </div>
                          )}
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

      {/* Mini Cart Drawer */}
      <MiniCartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}
