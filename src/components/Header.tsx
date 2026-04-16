'use client';

import { useState } from 'react';
import { Search, ShoppingBag, User, Menu, X, Heart } from 'lucide-react';
import { useStore } from '@/store/store';

export function Header() {
  const { navigate, getCartCount, isAuthenticated, currentPage, setSelectedCategory, wishlistItems, navigateToProfile } = useStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const cartCount = getCartCount();
  const wishlistCount = wishlistItems.length;
  const categories = ['All', 'Makeup', 'Skincare', 'Haircare', 'Perfume'];

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

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-[#f5e6e0]">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          {/* Mobile menu button */}
          <button
            className="lg:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={24} className="text-[#8b6f63]" /> : <Menu size={24} className="text-[#8b6f63]" />}
          </button>

          {/* Logo */}
          <button onClick={() => navigate('home')} className="text-2xl font-serif text-[#8b6f63] hover:text-[#d4a5a5] transition-colors">
            Rare Beauty
          </button>

          {/* Search (desktop) */}
          <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8b6f63]/50" size={18} />
              <input
                type="text"
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-2 bg-[#fef5f1] rounded-full text-sm text-[#8b6f63] placeholder:text-[#8b6f63]/40 focus:outline-none focus:ring-2 focus:ring-[#d4a5a5]"
                onFocus={() => setIsSearchOpen(true)}
                onBlur={() => setTimeout(() => setIsSearchOpen(false), 200)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.currentTarget.value) {
                    useStore.getState().setSearchQuery(e.currentTarget.value);
                    navigate('products');
                    setIsSearchOpen(false);
                  }
                }}
              />
            </div>
          </div>

          {/* Right icons */}
          <div className="flex items-center gap-3">
            <button
              className="md:hidden p-2 hover:bg-[#fef5f1] rounded-full transition-colors"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              aria-label="Search"
            >
              <Search size={20} className="text-[#8b6f63]" />
            </button>

            {/* Wishlist */}
            <button
              onClick={handleWishlistClick}
              className="p-2 hover:bg-[#fef5f1] rounded-full transition-colors relative"
              aria-label="Wishlist"
            >
              <Heart size={20} className={isAuthenticated && wishlistCount > 0 ? 'text-red-500 fill-red-500' : 'text-[#8b6f63]'} />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                  {wishlistCount > 99 ? '99+' : wishlistCount}
                </span>
              )}
            </button>

            {isAuthenticated ? (
              <button
                onClick={() => navigateToProfile()}
                className="p-2 hover:bg-[#fef5f1] rounded-full transition-colors"
                aria-label="Profile"
              >
                <User size={20} className="text-[#8b6f63]" />
              </button>
            ) : (
              <button
                onClick={() => navigate('login')}
                className="hidden sm:block px-4 py-2 text-sm text-[#8b6f63] hover:text-[#d4a5a5] transition-colors"
              >
                Sign In
              </button>
            )}

            <button
              onClick={() => navigate('cart')}
              className="p-2 hover:bg-[#fef5f1] rounded-full transition-colors relative"
              aria-label="Cart"
            >
              <ShoppingBag size={20} className="text-[#8b6f63]" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#d4a5a5] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center justify-center gap-8 pb-4 border-t border-[#f5e6e0] pt-3">
          <button
            onClick={() => navigate('home')}
            className={`text-sm transition-colors ${currentPage === 'home' ? 'text-[#d4a5a5] font-medium' : 'text-[#8b6f63] hover:text-[#d4a5a5]'}`}
          >
            Home
          </button>
          {categories.slice(1).map((category) => (
            <button
              key={category}
              onClick={() => handleCategoryClick(category)}
              className={`text-sm transition-colors ${currentPage === 'products' ? 'text-[#d4a5a5] font-medium' : 'text-[#8b6f63] hover:text-[#d4a5a5]'}`}
            >
              {category}
            </button>
          ))}
          <button
            onClick={() => handleCategoryClick('All')}
            className={`text-sm transition-colors ${currentPage === 'products' ? 'text-[#d4a5a5] font-medium' : 'text-[#8b6f63] hover:text-[#d4a5a5]'}`}
          >
            All Products
          </button>
        </nav>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="lg:hidden flex flex-col gap-3 pb-4 border-t border-[#f5e6e0] pt-4">
            <button onClick={() => { navigate('home'); setIsMenuOpen(false); }} className="text-sm text-[#8b6f63] hover:text-[#d4a5a5] text-left py-1">Home</button>
            {categories.slice(1).map((category) => (
              <button key={category} onClick={() => handleCategoryClick(category)} className="text-sm text-[#8b6f63] hover:text-[#d4a5a5] text-left py-1">
                {category}
              </button>
            ))}
            <button onClick={() => handleCategoryClick('All')} className="text-sm text-[#8b6f63] hover:text-[#d4a5a5] text-left py-1">
              All Products
            </button>
            <div className="border-t border-[#f5e6e0] pt-3 mt-1">
              {isAuthenticated && (
                <button onClick={() => { handleWishlistClick(); }} className="text-sm text-[#8b6f63] hover:text-[#d4a5a5] text-left py-1">
                  Wishlist {wishlistCount > 0 && `(${wishlistCount})`}
                </button>
              )}
              <button onClick={() => { navigate('contact'); setIsMenuOpen(false); }} className="text-sm text-[#8b6f63] hover:text-[#d4a5a5] text-left py-1">Contact</button>
              <button onClick={() => { navigate('help-center'); setIsMenuOpen(false); }} className="text-sm text-[#8b6f63] hover:text-[#d4a5a5] text-left py-1">Help Center</button>
            </div>
          </nav>
        )}

        {/* Mobile Search Bar */}
        {isSearchOpen && (
          <div className="md:hidden pb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8b6f63]/50" size={18} />
              <input
                type="text"
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-2 bg-[#fef5f1] rounded-full text-sm text-[#8b6f63] placeholder:text-[#8b6f63]/40 focus:outline-none focus:ring-2 focus:ring-[#d4a5a5]"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.currentTarget.value) {
                    useStore.getState().setSearchQuery(e.currentTarget.value);
                    navigate('products');
                    setIsSearchOpen(false);
                    setIsMenuOpen(false);
                  }
                }}
              />
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
