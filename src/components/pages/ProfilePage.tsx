'use client';

import { useEffect, useState } from 'react';
import { useStore } from '@/store/store';
import { User, Mail, Phone, LogOut, Package, Heart, Settings, ChevronRight, ShoppingBag, MapPin, Trash2, Star } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  createdAt: string;
  orderItems: { id: string; quantity: number; price: number; product?: { name: string } }[];
}

interface WishlistProduct {
  id: string;
  name: string;
  price: number;
  category: string;
  image: string;
  description: string;
  badge?: string;
  rating: number;
  reviewCount: number;
  wishlistId: string;
}

export function ProfilePage() {
  const { user, isAuthenticated, logout, navigate, setWishlistItems, toggleWishlist, wishlistItems } = useStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [wishlistProducts, setWishlistProducts] = useState<WishlistProduct[]>([]);
  const [activeTab, setActiveTab] = useState<'orders' | 'wishlist' | 'settings'>('orders');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('login');
      return;
    }
    if (user) {
      fetch(`/api/orders?userId=${user.id}`)
        .then((r) => r.json())
        .then((data) => setOrders(Array.isArray(data) ? data : []))
        .catch(() => {});
    }
  }, [isAuthenticated, user, navigate]);

  useEffect(() => {
    if (activeTab !== 'wishlist' || !user) return;
    let cancelled = false;
    fetch(`/api/wishlist?userId=${user.id}`)
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        if (Array.isArray(data)) {
          setWishlistProducts(data.map((item: { id: string; product: WishlistProduct }) => ({
            ...item.product,
            wishlistId: item.id,
          })));
          setWishlistItems(data.map((item: { productId: string }) => item.productId));
        }
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [activeTab, user, setWishlistItems]);

  const handleRemoveFromWishlist = async (productId: string, productName: string, wishlistId: string) => {
    if (!user) return;
    try {
      await fetch(`/api/wishlist?id=${wishlistId}`, { method: 'DELETE' });
      toggleWishlist(productId);
      setWishlistProducts((prev) => prev.filter((p) => p.id !== productId));
      toast.success(`${productName} removed from wishlist`);
    } catch {
      toast.error('Failed to remove from wishlist');
    }
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('home');
  };

  if (!user) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Delivered': return 'bg-green-50 text-green-600';
      case 'Shipped': return 'bg-blue-50 text-blue-600';
      case 'Processing': return 'bg-amber-50 text-amber-600';
      default: return 'bg-[#fef5f1] text-[#8b6f63]';
    }
  };

  const tabs = [
    { id: 'orders' as const, label: 'Orders', icon: <Package size={18} />, count: orders.length },
    { id: 'wishlist' as const, label: 'Wishlist', icon: <Heart size={18} />, count: wishlistItems.length },
    { id: 'settings' as const, label: 'Settings', icon: <Settings size={18} /> },
  ];

  return (
    <div className="min-h-screen bg-[#fef5f1]">
      {/* Profile Header */}
      <div className="bg-white border-b border-[#f5e6e0]/50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="w-20 h-20 bg-gradient-to-br from-[#d4a5a5] to-[#8b6f63] rounded-full flex items-center justify-center text-white text-2xl font-serif shadow-lg">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-serif text-[#8b6f63]">{user.name}</h1>
              <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-[#8b6f63]/70">
                <span className="flex items-center gap-1"><Mail size={14} />{user.email}</span>
                {user.phone && <span className="flex items-center gap-1"><Phone size={14} />{user.phone}</span>}
                <span className="px-2 py-0.5 bg-[#fef5f1] rounded-full text-xs text-[#8b6f63]/70 capitalize">{user.role}</span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-sm text-[#8b6f63]/70 hover:text-red-500 transition-colors"
            >
              <LogOut size={18} />
              Sign Out
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { icon: <ShoppingBag size={20} />, label: 'Total Orders', value: orders.length },
            { icon: <Heart size={20} />, label: 'Wishlist', value: wishlistItems.length },
            { icon: <MapPin size={20} />, label: 'Addresses', value: '1' },
            { icon: <Package size={20} />, label: 'Active Orders', value: orders.filter((o) => o.status !== 'Delivered').length },
          ].map((stat, idx) => (
            <motion.div
              key={stat.label}
              className="bg-white rounded-xl p-4 shadow-sm border border-[#f5e6e0]/50"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * idx }}
            >
              <div className="flex items-center gap-3">
                <div className="text-[#d4a5a5]">{stat.icon}</div>
                <div>
                  <p className="text-lg font-semibold text-[#8b6f63]">{stat.value}</p>
                  <p className="text-xs text-[#8b6f63]/50">{stat.label}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-[#d4a5a5] text-white shadow-sm'
                  : 'bg-white text-[#8b6f63] hover:bg-[#f5e6e0]'
              }`}
            >
              {tab.icon}
              {tab.label}
              {tab.count !== undefined && tab.count > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${activeTab === tab.id ? 'bg-white/20' : 'bg-[#fef5f1]'}`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'orders' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {orders.length === 0 ? (
              <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-[#f5e6e0]/50">
                <Package size={48} className="text-[#8b6f63]/20 mx-auto mb-4" />
                <h3 className="text-lg text-[#8b6f63] mb-2">No Orders Yet</h3>
                <p className="text-sm text-[#8b6f63]/70 mb-4">Start shopping to see your orders here.</p>
                <button
                  onClick={() => navigate('products')}
                  className="px-6 py-2 bg-[#d4a5a5] text-white rounded-full text-sm hover:bg-[#c89a9a] transition-colors"
                >
                  Browse Products
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order.id} className="bg-white rounded-xl p-6 shadow-sm border border-[#f5e6e0]/50 hover:shadow-md transition-shadow">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                      <div>
                        <p className="text-sm font-medium text-[#8b6f63]">Order #{order.orderNumber}</p>
                        <p className="text-xs text-[#8b6f63]/50">{new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                        <button
                          onClick={() => { useStore.getState().setLastOrderId(order.id); navigate('order-confirmation'); }}
                          className="text-[#d4a5a5] hover:text-[#c89a9a] transition-colors"
                        >
                          <ChevronRight size={18} />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between border-t border-[#f5e6e0]/50 pt-3">
                      <span className="text-xs text-[#8b6f63]/70">
                        {order.orderItems?.length || 0} item{order.orderItems?.length !== 1 ? 's' : ''}
                      </span>
                      <span className="text-sm font-semibold text-[#8b6f63]">${order.total.toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'wishlist' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {wishlistProducts.length === 0 ? (
              <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-[#f5e6e0]/50">
                <Heart size={48} className="text-[#8b6f63]/20 mx-auto mb-4" />
                <h3 className="text-lg text-[#8b6f63] mb-2">Your Wishlist is Empty</h3>
                <p className="text-sm text-[#8b6f63]/70 mb-4">Save items you love for later.</p>
                <button
                  onClick={() => navigate('products')}
                  className="px-6 py-2 bg-[#d4a5a5] text-white rounded-full text-sm hover:bg-[#c89a9a] transition-colors"
                >
                  Explore Products
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {wishlistProducts.map((product) => (
                  <div key={product.id} className="bg-white rounded-xl overflow-hidden shadow-sm border border-[#f5e6e0]/50 hover:shadow-md transition-shadow group">
                    <div
                      className="relative aspect-square bg-[#fef5f1] cursor-pointer"
                      onClick={() => { useStore.getState().setProductId(product.id); navigate('product-detail'); }}
                    >
                      <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      {product.badge && (
                        <div className="absolute top-3 left-3 bg-[#d4a5a5] text-white text-xs px-3 py-1 rounded-full font-medium">{product.badge}</div>
                      )}
                      <button
                        onClick={(e) => { e.stopPropagation(); handleRemoveFromWishlist(product.id, product.name, product.wishlistId); }}
                        className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-sm hover:bg-red-50 transition-colors"
                        aria-label="Remove from wishlist"
                      >
                        <Trash2 size={16} className="text-red-400" />
                      </button>
                    </div>
                    <div className="p-4">
                      <p className="text-xs text-[#8b6f63]/50 uppercase tracking-wide mb-1">{product.category}</p>
                      <h3 className="text-[#8b6f63] font-medium mb-1 line-clamp-1">{product.name}</h3>
                      <div className="flex items-center gap-1 mb-2">
                        <Star size={14} className="fill-[#d4a5a5] text-[#d4a5a5]" />
                        <span className="text-sm text-[#8b6f63] font-medium">{product.rating}</span>
                        <span className="text-xs text-[#8b6f63]/50">({product.reviewCount})</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-lg text-[#8b6f63] font-semibold">${product.price.toFixed(2)}</span>
                        <button
                          onClick={() => {
                            const { addToCart } = useStore.getState();
                            addToCart({ id: product.id, name: product.name, price: product.price, image: product.image, category: product.category, quantity: 1 });
                            toast.success(`${product.name} added to cart!`);
                          }}
                          className="px-4 py-2 bg-[#d4a5a5] text-white text-xs rounded-full hover:bg-[#c89a9a] transition-all flex items-center gap-1.5 active:scale-95"
                        >
                          <ShoppingBag size={14} />
                          Add to Cart
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'settings' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-[#f5e6e0]/50"
          >
            <h2 className="text-lg font-serif text-[#8b6f63] mb-6">Account Settings</h2>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-[#8b6f63]/70 mb-2">Full Name</label>
                  <input
                    type="text" defaultValue={user.name}
                    className="w-full px-4 py-2.5 rounded-lg bg-[#fef5f1] text-[#8b6f63] focus:outline-none focus:ring-2 focus:ring-[#d4a5a5]"
                  />
                </div>
                <div>
                  <label className="block text-sm text-[#8b6f63]/70 mb-2">Email Address</label>
                  <input
                    type="email" defaultValue={user.email}
                    className="w-full px-4 py-2.5 rounded-lg bg-[#fef5f1] text-[#8b6f63] focus:outline-none focus:ring-2 focus:ring-[#d4a5a5]"
                  />
                </div>
                <div>
                  <label className="block text-sm text-[#8b6f63]/70 mb-2">Phone Number</label>
                  <input
                    type="tel" defaultValue={user.phone || ''}
                    placeholder="Add phone number"
                    className="w-full px-4 py-2.5 rounded-lg bg-[#fef5f1] text-[#8b6f63] placeholder:text-[#8b6f63]/40 focus:outline-none focus:ring-2 focus:ring-[#d4a5a5]"
                  />
                </div>
              </div>
              <button
                onClick={() => toast.success('Settings saved!')}
                className="px-6 py-2 bg-[#d4a5a5] text-white rounded-full text-sm hover:bg-[#c89a9a] transition-colors"
              >
                Save Changes
              </button>

              <div className="border-t border-[#f5e6e0]/50 pt-6">
                <h3 className="text-sm font-medium text-[#8b6f63] mb-3">Security</h3>
                <button className="px-6 py-2 border border-[#d4a5a5] text-[#d4a5a5] rounded-full text-sm hover:bg-[#d4a5a5] hover:text-white transition-colors">
                  Change Password
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
