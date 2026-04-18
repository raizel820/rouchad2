import { create } from 'zustand';

export type Page =
  | 'home'
  | 'products'
  | 'product-detail'
  | 'cart'
  | 'checkout'
  | 'login'
  | 'signup'
  | 'profile'
  | 'settings'
  | 'admin'
  | 'order-confirmation'
  | 'order-tracking'
  | 'returns-refunds'
  | 'help-center'
  | 'contact'
  | 'wishlist';

export type ProfileTab = 'orders' | 'wishlist' | 'settings';
export type ToastType = 'success' | 'error' | 'info';

export interface ToastItem {
  id: number;
  message: string;
  type: ToastType;
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  quantity: number;
  selectedColor: string;
  saleName?: string | null;
  effectiveDiscount?: number;
}

export interface Product {
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

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  birthdate?: string;
  role: string;
}

export interface AppliedPromoCode {
  id: string;
  code: string;
  discountType: string;
  discountValue: number;
  discountAmount: number;
  description: string;
}

export interface ShopSettings {
  shopName: string;
  logoUrl?: string | null;
  faviconUrl?: string | null;
}

interface StoreState {
  // Navigation
  currentPage: Page;
  productId: string | null;
  selectedCategory: string;
  sortBy: string;
  searchQuery: string;
  lastOrderId: string | null;

  // Cart
  cartItems: CartItem[];

  // Auth
  user: User | null;
  isAuthenticated: boolean;

  // Wishlist
  wishlistItems: string[];
  wishlistLoaded: boolean;
  profileTab: ProfileTab;

  // Recently Viewed
  recentlyViewed: Product[];

  // Quick View
  quickViewProduct: Product | null;
  isQuickViewOpen: boolean;

  // Toasts
  toasts: ToastItem[];

  // Promo Code
  appliedPromoCode: AppliedPromoCode | null;

  // Shop Settings
  shopSettings: ShopSettings;

  // Actions
  navigate: (page: Page) => void;
  navigateToProfile: (tab?: ProfileTab) => void;
  setProductId: (id: string | null) => void;
  setSelectedCategory: (category: string) => void;
  setSortBy: (sort: string) => void;
  setSearchQuery: (query: string) => void;
  setLastOrderId: (id: string | null) => void;

  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartOriginalTotal: () => number;
  getCartCount: () => number;

  login: (user: User) => void;
  logout: () => void;
  updateUser: (data: Partial<User>) => void;

  setWishlistItems: (items: string[]) => void;
  toggleWishlist: (productId: string) => void;
  isWishlisted: (productId: string) => boolean;
  setWishlistLoaded: (loaded: boolean) => void;

  addRecentlyViewed: (product: Product) => void;
  clearRecentlyViewed: () => void;

  openQuickView: (product: Product) => void;
  closeQuickView: () => void;

  addToast: (message: string, type?: ToastType) => void;
  removeToast: (id: number) => void;

  applyPromoCode: (promo: AppliedPromoCode) => void;
  removePromoCode: () => void;

  setShopSettings: (settings: ShopSettings) => void;
}

export const useStore = create<StoreState>((set, get) => ({
  // Navigation defaults
  currentPage: 'home',
  productId: null,
  selectedCategory: 'All',
  sortBy: 'featured',
  searchQuery: '',
  lastOrderId: null,

  // Cart defaults
  cartItems: [],

  // Auth defaults
  user: null,
  isAuthenticated: false,

  // Wishlist defaults
  wishlistItems: [],
  wishlistLoaded: false,
  profileTab: 'orders' as ProfileTab,

  // Recently Viewed defaults
  recentlyViewed: [],

  // Quick View defaults
  quickViewProduct: null,
  isQuickViewOpen: false,

  // Toast defaults
  toasts: [],

  // Promo Code defaults
  appliedPromoCode: null,

  // Shop Settings defaults
  shopSettings: {
    shopName: 'Rare Beauty',
    logoUrl: null,
    faviconUrl: null,
  },

  // Navigation actions
  navigate: (page: Page) => {
    set({ currentPage: page });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },
  setProductId: (id: string | null) => set({ productId: id }),
  setSelectedCategory: (category: string) => set({ selectedCategory: category }),
  setSortBy: (sort: string) => set({ sortBy: sort }),
  setSearchQuery: (query: string) => set({ searchQuery: query }),
  setLastOrderId: (id: string | null) => set({ lastOrderId: id }),

  // Cart actions
  addToCart: (item: CartItem) => {
    set((state) => {
      const existing = state.cartItems.find((i) => i.id === item.id && i.selectedColor === item.selectedColor);
      if (existing) {
        return {
          cartItems: state.cartItems.map((i) =>
            i.id === item.id && i.selectedColor === item.selectedColor ? { ...i, quantity: i.quantity + 1 } : i
          ),
        };
      }
      return { cartItems: [...state.cartItems, { ...item, quantity: 1 }] };
    });
  },
  removeFromCart: (id: string, selectedColor?: string) => {
    set((state) => ({
      cartItems: state.cartItems.filter((i) => !(i.id === id && i.selectedColor === selectedColor)),
    }));
  },
  updateQuantity: (id: string, quantity: number, selectedColor?: string) => {
    if (quantity <= 0) {
      get().removeFromCart(id, selectedColor);
      return;
    }
    set((state) => ({
      cartItems: state.cartItems.map((i) =>
        i.id === id && i.selectedColor === selectedColor ? { ...i, quantity } : i
      ),
    }));
  },
  clearCart: () => set({ cartItems: [], appliedPromoCode: null }),
  getCartTotal: () => {
    return get().cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  },
  getCartOriginalTotal: () => {
    return get().cartItems.reduce((total, item) => total + (item.originalPrice || item.price) * item.quantity, 0);
  },
  getCartCount: () => {
    return get().cartItems.reduce((count, item) => count + item.quantity, 0);
  },

  // Auth actions
  login: (user: User) => set({ user, isAuthenticated: true, wishlistLoaded: false, wishlistItems: [] }),
  logout: () => set({ user: null, isAuthenticated: false, wishlistItems: [], wishlistLoaded: false }),
  updateUser: (data: Partial<User>) => {
    const currentUser = get().user;
    if (currentUser) {
      set({ user: { ...currentUser, ...data } });
    }
  },
  navigateToProfile: (tab?: ProfileTab) => {
    set({ currentPage: 'profile', profileTab: tab || 'orders' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  // Wishlist actions
  setWishlistItems: (items: string[]) => set({ wishlistItems: items }),
  toggleWishlist: (productId: string) => {
    const state = get();
    const isCurrentlyWishlisted = state.wishlistItems.includes(productId);
    if (isCurrentlyWishlisted) {
      set({ wishlistItems: state.wishlistItems.filter((id) => id !== productId) });
    } else {
      set({ wishlistItems: [...state.wishlistItems, productId] });
    }
  },
  setWishlistLoaded: (loaded: boolean) => set({ wishlistLoaded: loaded }),
  isWishlisted: (productId: string) => {
    return get().wishlistItems.includes(productId);
  },

  // Recently Viewed actions
  addRecentlyViewed: (product: Product) => {
    set((state) => {
      const filtered = state.recentlyViewed.filter((p) => p.id !== product.id);
      return { recentlyViewed: [product, ...filtered].slice(0, 8) };
    });
  },
  clearRecentlyViewed: () => set({ recentlyViewed: [] }),

  // Quick View actions
  openQuickView: (product: Product) => set({ quickViewProduct: product, isQuickViewOpen: true }),
  closeQuickView: () => set({ quickViewProduct: null, isQuickViewOpen: false }),

  // Toast actions
  addToast: (message: string, type: ToastType = 'success') => {
    const id = Date.now() + Math.random();
    set((state) => ({ toasts: [...state.toasts, { id, message, type }] }));
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
    }, 4000);
  },
  removeToast: (id: number) => {
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
  },

  // Promo Code actions
  applyPromoCode: (promo: AppliedPromoCode) => set({ appliedPromoCode: promo }),
  removePromoCode: () => set({ appliedPromoCode: null }),

  // Shop Settings actions
  setShopSettings: (settings: ShopSettings) => set({ shopSettings: settings }),
}));
