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

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  quantity: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
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
  wishlistItems: string[]
  wishlistLoaded: boolean;
  profileTab: ProfileTab;

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
  getCartCount: () => number;

  login: (user: User) => void;
  logout: () => void;

  setWishlistItems: (items: string[]) => void;
  toggleWishlist: (productId: string) => void;
  isWishlisted: (productId: string) => boolean;
  setWishlistLoaded: (loaded: boolean) => void;
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
      const existing = state.cartItems.find((i) => i.id === item.id);
      if (existing) {
        return {
          cartItems: state.cartItems.map((i) =>
            i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
          ),
        };
      }
      return { cartItems: [...state.cartItems, { ...item, quantity: 1 }] };
    });
  },
  removeFromCart: (id: string) => {
    set((state) => ({
      cartItems: state.cartItems.filter((i) => i.id !== id),
    }));
  },
  updateQuantity: (id: string, quantity: number) => {
    if (quantity <= 0) {
      get().removeFromCart(id);
      return;
    }
    set((state) => ({
      cartItems: state.cartItems.map((i) =>
        i.id === id ? { ...i, quantity } : i
      ),
    }));
  },
  clearCart: () => set({ cartItems: [] }),
  getCartTotal: () => {
    return get().cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  },
  getCartCount: () => {
    return get().cartItems.reduce((count, item) => count + item.quantity, 0);
  },

  // Auth actions
  login: (user: User) => set({ user, isAuthenticated: true, wishlistLoaded: false, wishlistItems: [] }),
  logout: () => set({ user: null, isAuthenticated: false, wishlistItems: [], wishlistLoaded: false }),
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
}));
