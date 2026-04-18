'use client';

import { useEffect, useState, useCallback } from 'react';
import { useStore } from '@/store/store';
import { User, Package, Heart, MapPin, Settings, LogOut, ShoppingBag, Star, Plus, Trash2, Loader2, Shield, XCircle, Bell, Mail, MessageSquare, Tag, RefreshCw, AlertTriangle, DollarSign, CalendarDays } from 'lucide-react';
import { toast } from '@/lib/toast';
import { motion, AnimatePresence } from 'framer-motion';

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  createdAt: string;
  productId?: string;
  orderItems: { id: string; quantity: number; price: number; productId: string; color?: string | null; product?: { name: string; image: string } }[];
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

interface Address {
  id: string;
  label: string;
  name: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone?: string;
  isDefault: boolean;
}

function getRelativeTime(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);

  if (diffSeconds < 60) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  if (diffWeeks < 4) return `${diffWeeks} week${diffWeeks > 1 ? 's' : ''} ago`;
  if (diffMonths < 12) return `${diffMonths} month${diffMonths > 1 ? 's' : ''} ago`;
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

const tabVariants = {
  initial: { opacity: 0, y: 12, filter: 'blur(4px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
  exit: { opacity: 0, y: -8, filter: 'blur(4px)' },
};

export function ProfilePage() {
  const { user, isAuthenticated, logout, navigate, setWishlistItems, toggleWishlist, wishlistItems, profileTab } = useStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [wishlistProducts, setWishlistProducts] = useState<WishlistProduct[]>([]);
  const [activeTab, setActiveTab] = useState<'orders' | 'wishlist' | 'addresses' | 'settings'>(profileTab === 'orders' || profileTab === 'wishlist' ? profileTab : 'orders');
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [orderFilter, setOrderFilter] = useState<string>('All');

  // Notification preferences
  const [notifPrefs, setNotifPrefs] = useState({
    email: true,
    sms: false,
    promotional: true,
  });

  // Address modal state
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [addressForm, setAddressForm] = useState({
    label: 'Home',
    name: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States',
    phone: '',
    isDefault: false,
  });
  const [addressSaving, setAddressSaving] = useState(false);

  const fetchOrders = useCallback(() => {
    if (!user) return;
    fetch(`/api/orders?userId=${user.id}`)
      .then((r) => r.json())
      .then((data) => setOrders(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, [user]);

  const fetchAddresses = useCallback(() => {
    if (!user) return;
    fetch(`/api/addresses?userId=${user.id}`)
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setAddresses(data); })
      .catch(() => {});
  }, [user]);

  const fetchWishlist = useCallback(() => {
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

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('login');
      return;
    }
    fetchOrders();
    fetchAddresses();
  }, [isAuthenticated, user, navigate, fetchOrders, fetchAddresses]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const handleRemoveFromWishlist = async (productId: string, productName: string, wishlistId: string) => {
    if (!user) return;
    try {
      await fetch(`/api/wishlist?id=${wishlistId}`, { method: 'DELETE' });
      toggleWishlist(productId);
      setWishlistProducts((prev) => prev.filter((p) => p.id !== productId));
      toast(`${productName} removed from wishlist`);
    } catch {
      toast('Failed to remove from wishlist', 'error');
    }
  };

  // --- Address Handlers ---
  const openAddressModal = (address?: Address) => {
    if (address) {
      setEditingAddress(address);
      setAddressForm({
        label: address.label,
        name: address.name,
        street: address.street,
        city: address.city,
        state: address.state,
        zipCode: address.zipCode,
        country: address.country,
        phone: address.phone || '',
        isDefault: address.isDefault,
      });
    } else {
      setEditingAddress(null);
      setAddressForm({
        label: 'Home',
        name: user?.name || '',
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'United States',
        phone: user?.phone || '',
        isDefault: addresses.length === 0,
      });
    }
    setShowAddressModal(true);
  };

  const handleAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setAddressSaving(true);
    try {
      if (editingAddress) {
        const res = await fetch(`/api/addresses/${editingAddress.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id, ...addressForm }),
        });
        const data = await res.json();
        if (res.ok) {
          toast('Address updated successfully!');
          fetchAddresses();
          setShowAddressModal(false);
        } else {
          toast(data.error || 'Failed to update address', 'error');
        }
      } else {
        const res = await fetch('/api/addresses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id, ...addressForm }),
        });
        const data = await res.json();
        if (res.ok) {
          toast('Address added successfully!');
          fetchAddresses();
          setShowAddressModal(false);
        } else {
          toast(data.error || 'Failed to add address', 'error');
        }
      }
    } catch {
      toast('Failed to save address', 'error');
    }
    setAddressSaving(false);
  };

  const handleDeleteAddress = async (addressId: string) => {
    if (!user) return;
    try {
      const res = await fetch(`/api/addresses/${addressId}?userId=${user.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok) {
        toast('Address deleted');
        fetchAddresses();
      } else {
        toast(data.error || 'Failed to delete address', 'error');
      }
    } catch {
      toast('Failed to delete address', 'error');
    }
  };

  const handleSetDefaultAddress = async (addressId: string) => {
    if (!user) return;
    try {
      const res = await fetch(`/api/addresses/${addressId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, isDefault: true }),
      });
      if (res.ok) {
        toast('Default address updated');
        fetchAddresses();
      }
    } catch {
      toast('Failed to update default address', 'error');
    }
  };

  const handleLogout = () => {
    logout();
    toast('Logged out successfully');
    navigate('home');
  };

  const [cancelingOrderId, setCancelingOrderId] = useState<string | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Delivered': return 'text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400';
      case 'Shipped': case 'In Transit': return 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400';
      case 'Processing': return 'text-orange-600 bg-orange-50 dark:bg-orange-900/20 dark:text-orange-400';
      case 'Cancelled': return 'text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400';
      default: return 'text-gray-600 bg-gray-50 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  const canCancelOrder = (status: string) => {
    return ['Pending', 'Processing'].includes(status);
  };

  const handleCancelOrder = async (orderId: string, orderNumber: string) => {
    if (!confirm(`Are you sure you want to cancel order #${orderNumber}? This action cannot be undone.`)) return;
    setCancelingOrderId(orderId);
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: orderId, status: 'Cancelled' }),
      });
      if (res.ok) {
        toast(`Order #${orderNumber} has been cancelled`);
        fetchOrders();
      } else {
        toast('Failed to cancel order', 'error');
      }
    } catch {
      toast('Failed to cancel order', 'error');
    }
    setCancelingOrderId(null);
  };

  const handleReorder = async (order: Order) => {
    const { addToCart } = useStore.getState();
    order.orderItems.forEach((item) => {
      for (let i = 0; i < item.quantity; i++) {
        addToCart({
          id: item.productId,
          name: item.product?.name || 'Product',
          price: item.price,
          image: item.product?.image || '',
          category: '',
          quantity: 1,
          selectedColor: item.color || 'default',
        });
      }
    });
    toast(`Items from order #${order.orderNumber} added to cart!`);
  };

  const handleDeleteAccount = () => {
    if (!confirm('Are you sure you want to delete your account? This action is permanent and cannot be undone. All your data, orders, and preferences will be permanently deleted.')) return;
    if (!confirm('This is your last chance. Type "DELETE" in your mind and click OK to proceed with account deletion.')) return;
    toast('Account deletion request submitted. You will receive a confirmation email.', 'info');
  };

  if (!user) return null;

  const totalOrders = orders.length;
  const totalSpent = orders.reduce((sum, order) => sum + order.total, 0);
  const deliveredOrders = orders.filter(o => o.status === 'Delivered').length;

  // Filter orders
  const filteredOrders = orderFilter === 'All' 
    ? orders 
    : orders.filter(o => o.status === orderFilter);

  const orderFilters = ['All', 'Processing', 'Shipped', 'Delivered'];

  // Get user initials and avatar color
  const initials = user.name
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
  
  const avatarColors = [
    'from-[#d4a5a5] to-[#c89a9a]',
    'from-[#a5b4d4] to-[#8b9fc8]',
    'from-[#a5d4b8] to-[#8bc8a0]',
    'from-[#d4c4a5] to-[#c8b88b]',
    'from-[#d4a5c4] to-[#c88bb0]',
    'from-[#b8a5d4] to-[#a08bc8]',
  ];
  const avatarColorIndex = user.name.charCodeAt(0) % avatarColors.length;

  const tabs = [
    { key: 'orders' as const, label: 'My Orders', icon: Package, count: orders.length },
    { key: 'wishlist' as const, label: 'Wishlist', icon: Heart, count: wishlistItems.length },
    { key: 'addresses' as const, label: 'Addresses', icon: MapPin, count: addresses.length },
    { key: 'settings' as const, label: 'Settings', icon: Settings, count: 0 },
  ];

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      {/* Stats Cards - Top */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-8">
        {[
          { label: 'Total Orders', value: totalOrders, icon: Package, color: 'text-[#d4a5a5]', bg: 'bg-[#fef5f1] dark:bg-[#3d2f34]' },
          { label: 'Wishlist Items', value: wishlistItems.length, icon: Heart, color: 'text-pink-400', bg: 'bg-pink-50 dark:bg-pink-900/10' },
          { label: 'Total Spent', value: `$${totalSpent.toFixed(2)}`, icon: DollarSign, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/10' },
          { label: 'Delivered', value: deliveredOrders, icon: CalendarDays, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/10' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            className={`${stat.bg} rounded-xl p-4 md:p-5 border border-[#f5e6e0]/50 dark:border-[#3d2f34]`}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <div className="flex items-center gap-3">
              <div className={`${stat.color} opacity-80`}>
                <stat.icon size={20} />
              </div>
              <div>
                <p className="text-xs text-[#8b6f63]/60 dark:text-[#e8ddd5]/60 uppercase tracking-wider">{stat.label}</p>
                <p className="text-lg md:text-xl font-semibold text-[#8b6f63] dark:text-[#e8ddd5]">{stat.value}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <motion.div
            className="bg-white dark:bg-[#2d1f24] rounded-lg shadow-sm p-6 sticky top-24 border border-[#f5e6e0]/50 dark:border-[#3d2f34]"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            {/* User Avatar */}
            <div className="text-center mb-6 pb-6 border-b border-[#8b6f63]/20">
              <motion.div
                className={`w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center bg-gradient-to-br ${avatarColors[avatarColorIndex]} shadow-lg`}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', damping: 15, delay: 0.1 }}
              >
                <span className="text-white text-2xl font-bold tracking-wide">{initials}</span>
              </motion.div>
              <h2 className="text-xl text-[#8b6f63] dark:text-[#e8ddd5] mb-1">{user.name}</h2>
              <p className="text-sm text-[#8b6f63]/70 dark:text-[#a89898]">{user.email}</p>
              {user.phone && <p className="text-sm text-[#8b6f63]/50 mt-1">{user.phone}</p>}
              {user.birthdate && (
                <p className="text-sm text-[#8b6f63]/50 mt-1">
                  🎂 {new Date(user.birthdate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              )}
            </div>

            {/* Navigation */}
            <nav className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === tab.key
                      ? 'bg-[#fef5f1] dark:bg-[#3d2f34] text-[#d4a5a5] font-medium'
                      : 'text-[#8b6f63] dark:text-[#e8ddd5] hover:bg-[#fef5f1] dark:hover:bg-[#3d2f34]'
                  }`}
                >
                  <tab.icon size={20} />
                  <span>{tab.label}</span>
                  {tab.count > 0 && (
                    <span className="ml-auto text-xs px-2 py-0.5 bg-[#fef5f1] dark:bg-[#3d2f34] rounded-full text-[#d4a5a5]">{tab.count}</span>
                  )}
                </button>
              ))}

              {user.role === 'admin' && (
                <button
                  onClick={() => navigate('admin')}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-[#d4a5a5] hover:bg-[#fef5f1] dark:hover:bg-[#3d2f34] transition-colors font-medium"
                >
                  <Shield size={20} />
                  <span>Admin Dashboard</span>
                </button>
              )}
              <div className="border-t border-[#8b6f63]/10 pt-2 mt-2">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                >
                  <LogOut size={20} />
                  <span>Logout</span>
                </button>
              </div>
            </nav>
          </motion.div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <AnimatePresence mode="wait">
            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <motion.div key="orders" variants={tabVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.25 }}>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
                  <h1 className="text-2xl font-serif text-[#8b6f63] dark:text-[#e8ddd5]">My Orders</h1>
                  {orders.length > 0 && (
                    <div className="flex items-center gap-1.5 bg-[#fef5f1] dark:bg-[#3d2f34] p-1 rounded-full">
                      {orderFilters.map((filter) => (
                        <button
                          key={filter}
                          onClick={() => setOrderFilter(filter)}
                          className={`px-3 py-1.5 text-xs rounded-full transition-all ${
                            orderFilter === filter
                              ? 'bg-white dark:bg-[#2d1f24] text-[#d4a5a5] shadow-sm font-medium'
                              : 'text-[#8b6f63]/70 dark:text-[#e8ddd5]/70 hover:text-[#8b6f63] dark:hover:text-[#e8ddd5]'
                          }`}
                        >
                          {filter}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {orders.length === 0 ? (
                  <div className="bg-white dark:bg-[#2d1f24] rounded-lg shadow-sm p-12 text-center border border-[#f5e6e0]/50 dark:border-[#3d2f34]">
                    <Package size={48} className="text-[#8b6f63]/20 mx-auto mb-4" />
                    <h3 className="text-lg text-[#8b6f63] mb-2">No Orders Yet</h3>
                    <p className="text-sm text-[#8b6f63]/70 mb-4">Start shopping to see your orders here.</p>
                    <button onClick={() => navigate('products')} className="px-6 py-2 bg-[#d4a5a5] text-white rounded-full text-sm hover:bg-[#c89a9a] transition-colors">
                      Browse Products
                    </button>
                  </div>
                ) : filteredOrders.length === 0 ? (
                  <div className="bg-white dark:bg-[#2d1f24] rounded-lg shadow-sm p-12 text-center border border-[#f5e6e0]/50 dark:border-[#3d2f34]">
                    <Package size={48} className="text-[#8b6f63]/20 mx-auto mb-4" />
                    <h3 className="text-lg text-[#8b6f63] mb-2">No {orderFilter} Orders</h3>
                    <p className="text-sm text-[#8b6f63]/70 mb-4">You don&apos;t have any {orderFilter.toLowerCase()} orders.</p>
                    <button onClick={() => setOrderFilter('All')} className="px-6 py-2 bg-[#d4a5a5] text-white rounded-full text-sm hover:bg-[#c89a9a] transition-colors">
                      View All Orders
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredOrders.map((order, idx) => (
                      <motion.div
                        key={order.id}
                        className="bg-white dark:bg-[#2d1f24] rounded-lg shadow-sm p-6 border border-[#f5e6e0]/50 dark:border-[#3d2f34] hover:shadow-md transition-shadow"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                      >
                        {/* Order Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 pb-4 border-b border-[#8b6f63]/20">
                          <div>
                            <p className="text-sm font-medium text-[#8b6f63]">Order #{order.orderNumber}</p>
                            <p className="text-sm text-[#8b6f63]/70" title={new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}>
                              {getRelativeTime(order.createdAt)}
                            </p>
                          </div>
                          <div className="flex items-center gap-3 mt-2 sm:mt-0">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                              {order.status}
                            </span>
                            <p className="text-lg text-[#8b6f63] font-semibold">${order.total.toFixed(2)}</p>
                          </div>
                        </div>

                        {/* Order Items - Compact Product Cards */}
                        <div className="space-y-3 mb-4">
                          {order.orderItems?.slice(0, 3).map((item) => (
                            <div key={item.id} className="flex items-center gap-3 p-2 rounded-lg bg-[#fef5f1]/50 dark:bg-[#3d2f34]/50">
                              <div className="w-14 h-14 bg-[#fef5f1] dark:bg-[#3d2f34] rounded-lg overflow-hidden flex-shrink-0">
                                {item.product?.image ? (
                                  <img src={item.product.image} alt={item.product.name || 'Product'} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-xl opacity-30">💄</div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <button onClick={() => { useStore.getState().setProductId(item.productId); navigate('product-detail'); }} className="text-[#8b6f63] hover:text-[#d4a5a5] transition-colors font-medium text-left text-sm truncate">
                                    {item.product?.name || 'Product'}
                                  </button>
                                  {item.color && item.color !== 'default' && (
                                    <div className="w-4 h-4 rounded-full border border-gray-200 flex-shrink-0" style={{ backgroundColor: item.color }} />
                                  )}
                                </div>
                                <p className="text-xs text-[#8b6f63]/70">Qty: {item.quantity} × ${item.price.toFixed(2)}</p>
                              </div>
                            </div>
                          ))}
                          {order.orderItems && order.orderItems.length > 3 && (
                            <p className="text-xs text-[#8b6f63]/50 pl-2">+{order.orderItems.length - 3} more item{order.orderItems.length - 3 > 1 ? 's' : ''}</p>
                          )}
                        </div>

                        {/* Order Actions */}
                        <div className="flex flex-wrap gap-2">
                          <button onClick={() => { useStore.getState().setLastOrderId(order.id); navigate('order-tracking'); }} className="px-4 py-2 bg-[#d4a5a5] text-white rounded-full text-sm hover:bg-[#c89a9a] transition-colors flex items-center gap-1.5">
                            Track Order
                          </button>
                          <button onClick={() => { useStore.getState().setLastOrderId(order.id); navigate('order-confirmation'); }} className="px-4 py-2 border border-[#d4a5a5] text-[#d4a5a5] rounded-full text-sm hover:bg-[#fef5f1] dark:hover:bg-[#3d2f34] transition-colors">
                            View Details
                          </button>
                          {(order.status === 'Delivered' || order.status === 'Shipped') && (
                            <motion.button
                              onClick={() => handleReorder(order)}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              className="px-4 py-2 border border-[#8b6f63]/30 text-[#8b6f63] dark:text-[#e8ddd5] rounded-full text-sm hover:bg-[#fef5f1] dark:hover:bg-[#3d2f34] transition-colors flex items-center gap-1.5"
                            >
                              <RefreshCw size={13} />
                              Reorder
                            </motion.button>
                          )}
                          {canCancelOrder(order.status) && (
                            <button
                              onClick={() => handleCancelOrder(order.id, order.orderNumber)}
                              disabled={cancelingOrderId === order.id}
                              className="px-4 py-2 border border-red-300 text-red-500 rounded-full text-sm hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center gap-1.5 disabled:opacity-60"
                            >
                              {cancelingOrderId === order.id ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />}
                              Cancel
                            </button>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* Wishlist Tab */}
            {activeTab === 'wishlist' && (
              <motion.div key="wishlist" variants={tabVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.25 }}>
                <h1 className="text-2xl font-serif text-[#8b6f63] dark:text-[#e8ddd5] mb-6">My Wishlist</h1>
                {wishlistProducts.length === 0 ? (
                  <div className="bg-white dark:bg-[#2d1f24] rounded-lg shadow-sm p-12 text-center border border-[#f5e6e0]/50 dark:border-[#3d2f34]">
                    <Heart size={48} className="text-[#8b6f63]/20 mx-auto mb-4" />
                    <h3 className="text-lg text-[#8b6f63] mb-2">Your Wishlist is Empty</h3>
                    <p className="text-sm text-[#8b6f63]/70 mb-4">Save items you love for later.</p>
                    <button onClick={() => navigate('products')} className="px-6 py-2 bg-[#d4a5a5] text-white rounded-full text-sm hover:bg-[#c89a9a] transition-colors">
                      Explore Products
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {wishlistProducts.map((product) => (
                      <div key={product.id} className="bg-white dark:bg-[#2d1f24] rounded-lg shadow-sm overflow-hidden border border-[#f5e6e0]/50 dark:border-[#3d2f34] hover:shadow-md transition-shadow group">
                        <div
                          className="aspect-square bg-[#fef5f1] overflow-hidden cursor-pointer relative"
                          onClick={() => { useStore.getState().setProductId(product.id); navigate('product-detail'); }}
                        >
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                          />
                          {product.badge && (
                            <div className="absolute top-3 left-3 bg-[#d4a5a5] text-white text-xs px-3 py-1 rounded-full font-medium">{product.badge}</div>
                          )}
                        </div>
                        <div className="p-4">
                          <p className="text-xs text-[#8b6f63]/50 uppercase tracking-wide mb-1">{product.category}</p>
                          <h3 className="text-[#8b6f63] font-medium mb-1 line-clamp-1">{product.name}</h3>
                          <div className="flex items-center gap-1 mb-2">
                            <Star size={14} className="fill-[#d4a5a5] text-[#d4a5a5]" />
                            <span className="text-sm text-[#8b6f63] font-medium">{product.rating}</span>
                            <span className="text-xs text-[#8b6f63]/50">({product.reviewCount})</span>
                          </div>
                          <p className="text-lg text-[#8b6f63] font-semibold mb-4">${product.price.toFixed(2)}</p>
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                const { addToCart } = useStore.getState();
                                addToCart({ id: product.id, name: product.name, price: product.price, image: product.image, category: product.category, quantity: 1, selectedColor: 'default' });
                                toast(`${product.name} added to cart!`);
                              }}
                              className="flex-1 px-4 py-2 bg-[#d4a5a5] text-white text-sm rounded-full hover:bg-[#c89a9a] transition-colors flex items-center justify-center gap-1.5"
                            >
                              <ShoppingBag size={14} />
                              Add to Cart
                            </button>
                            <button
                              onClick={() => handleRemoveFromWishlist(product.id, product.name, product.wishlistId)}
                              className="px-4 py-2 border border-red-300 text-red-500 text-sm rounded-full hover:bg-red-50 transition-colors"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* Addresses Tab */}
            {activeTab === 'addresses' && (
              <motion.div key="addresses" variants={tabVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.25 }}>
                <div className="flex items-center justify-between mb-6">
                  <h1 className="text-2xl font-serif text-[#8b6f63] dark:text-[#e8ddd5]">Saved Addresses</h1>
                  <button
                    onClick={() => openAddressModal()}
                    className="px-4 py-2 bg-[#d4a5a5] text-white rounded-full text-sm hover:bg-[#c89a9a] transition-colors flex items-center gap-1.5"
                  >
                    <Plus size={16} />
                    Add New Address
                  </button>
                </div>
                {addresses.length === 0 ? (
                  <div className="bg-white dark:bg-[#2d1f24] rounded-lg shadow-sm p-12 text-center border border-[#f5e6e0]/50 dark:border-[#3d2f34]">
                    <MapPin size={48} className="text-[#8b6f63]/20 mx-auto mb-4" />
                    <h3 className="text-lg text-[#8b6f63] mb-2">No Saved Addresses</h3>
                    <p className="text-sm text-[#8b6f63]/70 mb-4">Add your shipping address for faster checkout</p>
                    <button
                      onClick={() => openAddressModal()}
                      className="px-6 py-2 bg-[#d4a5a5] text-white rounded-full text-sm hover:bg-[#c89a9a] transition-colors"
                    >
                      Add Your First Address
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {addresses.map((address) => (
                      <div key={address.id} className="bg-white dark:bg-[#2d1f24] rounded-lg shadow-sm p-6 relative border border-[#f5e6e0]/50 dark:border-[#3d2f34] hover:shadow-md transition-shadow">
                        {address.isDefault && (
                          <span className="absolute top-4 right-4 px-3 py-1 bg-[#d4a5a5] text-white text-xs rounded-full">
                            Default
                          </span>
                        )}
                        <div className="mb-4">
                          <div className="flex items-center gap-2 mb-2">
                            <MapPin size={18} className="text-[#d4a5a5]" />
                            <span className="text-[#8b6f63] font-medium">{address.label}</span>
                          </div>
                          <p className="text-[#8b6f63]">{address.name}</p>
                          <p className="text-sm text-[#8b6f63]/70">{address.street}</p>
                          <p className="text-sm text-[#8b6f63]/70">{address.city}, {address.state} {address.zipCode}</p>
                          <p className="text-sm text-[#8b6f63]/50">{address.country}</p>
                          {address.phone && <p className="text-sm text-[#8b6f63]/50 mt-1">{address.phone}</p>}
                        </div>
                        <div className="flex gap-2">
                          {!address.isDefault && (
                            <button
                              onClick={() => handleSetDefaultAddress(address.id)}
                              className="flex-1 px-3 py-2 text-xs text-[#d4a5a5] border border-[#d4a5a5]/30 rounded-full hover:bg-[#fef5f1] transition-colors flex items-center justify-center gap-1"
                            >
                              <Star size={12} />
                              Set Default
                            </button>
                          )}
                          <button
                            onClick={() => openAddressModal(address)}
                            className="flex-1 px-4 py-2 border border-[#d4a5a5] text-[#d4a5a5] text-sm rounded-full hover:bg-[#fef5f1] transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteAddress(address.id)}
                            className="px-4 py-2 border border-red-300 text-red-500 text-sm rounded-full hover:bg-red-50 transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <motion.div key="settings" variants={tabVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.25 }}>
                <h1 className="text-2xl font-serif text-[#8b6f63] dark:text-[#e8ddd5] mb-6">Settings</h1>

                <div className="space-y-6">
                  {/* Notification Preferences */}
                  <div className="bg-white dark:bg-[#2d1f24] rounded-lg shadow-sm p-6 border border-[#f5e6e0]/50 dark:border-[#3d2f34]">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-full bg-[#fef5f1] dark:bg-[#3d2f34] flex items-center justify-center">
                        <Bell size={20} className="text-[#d4a5a5]" />
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-[#8b6f63] dark:text-[#e8ddd5]">Notification Preferences</h3>
                        <p className="text-sm text-[#8b6f63]/60 dark:text-[#e8ddd5]/60">Manage how you receive notifications</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {/* Email Notifications */}
                      <div className="flex items-center justify-between py-3 border-b border-[#8b6f63]/10 last:border-b-0">
                        <div className="flex items-center gap-3">
                          <Mail size={18} className="text-[#8b6f63]/60" />
                          <div>
                            <p className="text-sm font-medium text-[#8b6f63] dark:text-[#e8ddd5]">Email Notifications</p>
                            <p className="text-xs text-[#8b6f63]/50 dark:text-[#e8ddd5]/50">Order updates, shipping confirmations</p>
                          </div>
                        </div>
                        <button
                          onClick={() => setNotifPrefs(prev => ({ ...prev, email: !prev.email }))}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            notifPrefs.email ? 'bg-[#d4a5a5]' : 'bg-gray-300 dark:bg-gray-600'
                          }`}
                        >
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm ${notifPrefs.email ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                      </div>

                      {/* SMS Notifications */}
                      <div className="flex items-center justify-between py-3 border-b border-[#8b6f63]/10 last:border-b-0">
                        <div className="flex items-center gap-3">
                          <MessageSquare size={18} className="text-[#8b6f63]/60" />
                          <div>
                            <p className="text-sm font-medium text-[#8b6f63] dark:text-[#e8ddd5]">SMS Notifications</p>
                            <p className="text-xs text-[#8b6f63]/50 dark:text-[#e8ddd5]/50">Text alerts for delivery updates</p>
                          </div>
                        </div>
                        <button
                          onClick={() => setNotifPrefs(prev => ({ ...prev, sms: !prev.sms }))}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            notifPrefs.sms ? 'bg-[#d4a5a5]' : 'bg-gray-300 dark:bg-gray-600'
                          }`}
                        >
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm ${notifPrefs.sms ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                      </div>

                      {/* Promotional Emails */}
                      <div className="flex items-center justify-between py-3">
                        <div className="flex items-center gap-3">
                          <Tag size={18} className="text-[#8b6f63]/60" />
                          <div>
                            <p className="text-sm font-medium text-[#8b6f63] dark:text-[#e8ddd5]">Promotional Emails</p>
                            <p className="text-xs text-[#8b6f63]/50 dark:text-[#e8ddd5]/50">Sales, new arrivals, and special offers</p>
                          </div>
                        </div>
                        <button
                          onClick={() => setNotifPrefs(prev => ({ ...prev, promotional: !prev.promotional }))}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            notifPrefs.promotional ? 'bg-[#d4a5a5]' : 'bg-gray-300 dark:bg-gray-600'
                          }`}
                        >
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm ${notifPrefs.promotional ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Account Information */}
                  <div className="bg-white dark:bg-[#2d1f24] rounded-lg shadow-sm p-6 border border-[#f5e6e0]/50 dark:border-[#3d2f34]">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-full bg-[#fef5f1] dark:bg-[#3d2f34] flex items-center justify-center">
                        <User size={20} className="text-[#d4a5a5]" />
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-[#8b6f63] dark:text-[#e8ddd5]">Account Information</h3>
                        <p className="text-sm text-[#8b6f63]/60 dark:text-[#e8ddd5]/60">Your personal details</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-[#8b6f63]/50 uppercase tracking-wider mb-1">Full Name</p>
                        <p className="text-sm text-[#8b6f63] dark:text-[#e8ddd5] font-medium">{user.name}</p>
                      </div>
                      <div>
                        <p className="text-xs text-[#8b6f63]/50 uppercase tracking-wider mb-1">Email</p>
                        <p className="text-sm text-[#8b6f63] dark:text-[#e8ddd5] font-medium">{user.email}</p>
                      </div>
                      <div>
                        <p className="text-xs text-[#8b6f63]/50 uppercase tracking-wider mb-1">Phone</p>
                        <p className="text-sm text-[#8b6f63] dark:text-[#e8ddd5] font-medium">{user.phone || 'Not set'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-[#8b6f63]/50 uppercase tracking-wider mb-1">Role</p>
                        <p className="text-sm text-[#8b6f63] dark:text-[#e8ddd5] font-medium capitalize">{user.role}</p>
                      </div>
                      {user.birthdate && (
                        <div>
                          <p className="text-xs text-[#8b6f63]/50 uppercase tracking-wider mb-1">Birthday</p>
                          <p className="text-sm text-[#8b6f63] dark:text-[#e8ddd5] font-medium">
                            {new Date(user.birthdate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                          </p>
                        </div>
                      )}
                      <div>
                        <p className="text-xs text-[#8b6f63]/50 uppercase tracking-wider mb-1">Member Since</p>
                        <p className="text-sm text-[#8b6f63] dark:text-[#e8ddd5] font-medium">
                          {new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Delete Account */}
                  <div className="bg-white dark:bg-[#2d1f24] rounded-lg shadow-sm p-6 border border-red-200 dark:border-red-900/30">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
                        <AlertTriangle size={20} className="text-red-500" />
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-red-600 dark:text-red-400">Danger Zone</h3>
                        <p className="text-sm text-red-500/70 dark:text-red-400/60">Irreversible account actions</p>
                      </div>
                    </div>

                    <div className="bg-red-50/50 dark:bg-red-900/10 rounded-lg p-4">
                      <p className="text-sm text-[#8b6f63]/70 dark:text-[#e8ddd5]/70 mb-4">
                        Once you delete your account, there is no going back. All your data including order history, 
                        saved addresses, wishlist items, and reviews will be permanently removed.
                      </p>
                      <motion.button
                        onClick={handleDeleteAccount}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="px-5 py-2.5 bg-red-500 text-white rounded-full text-sm font-medium hover:bg-red-600 transition-colors flex items-center gap-2 shadow-sm"
                      >
                        <Trash2 size={16} />
                        Delete My Account
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ===== ADDRESS MODAL ===== */}
      <AnimatePresence>
        {showAddressModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowAddressModal(false)} />
            <motion.div
              className="relative bg-white dark:bg-[#2d1f24] rounded-xl shadow-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-serif text-[#8b6f63]">
                  {editingAddress ? 'Edit Address' : 'Add New Address'}
                </h3>
                <button onClick={() => setShowAddressModal(false)} className="text-[#8b6f63]/40 hover:text-[#8b6f63] transition-colors">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                </button>
              </div>
              <form onSubmit={handleAddressSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#8b6f63] mb-1">Address Label</label>
                  <select
                    value={addressForm.label}
                    onChange={(e) => setAddressForm({ ...addressForm, label: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg bg-[#fef5f1] border border-[#f5e6e0]/80 text-[#8b6f63] focus:outline-none focus:ring-2 focus:ring-[#d4a5a5] transition-all"
                  >
                    <option>Home</option>
                    <option>Work</option>
                    <option>Other</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-[#8b6f63] mb-1">Full Name</label>
                    <input
                      type="text"
                      value={addressForm.name}
                      onChange={(e) => setAddressForm({ ...addressForm, name: e.target.value })}
                      required
                      className="w-full px-4 py-3 rounded-lg bg-[#fef5f1] border border-[#f5e6e0]/80 text-[#8b6f63] focus:outline-none focus:ring-2 focus:ring-[#d4a5a5] transition-all"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-[#8b6f63] mb-1">Street Address</label>
                    <input
                      type="text"
                      value={addressForm.street}
                      onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
                      required
                      placeholder="123 Main St, Apt 4B"
                      className="w-full px-4 py-3 rounded-lg bg-[#fef5f1] border border-[#f5e6e0]/80 text-[#8b6f63] placeholder:text-[#8b6f63]/40 focus:outline-none focus:ring-2 focus:ring-[#d4a5a5] transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#8b6f63] mb-1">City</label>
                    <input
                      type="text"
                      value={addressForm.city}
                      onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                      required
                      className="w-full px-4 py-3 rounded-lg bg-[#fef5f1] border border-[#f5e6e0]/80 text-[#8b6f63] focus:outline-none focus:ring-2 focus:ring-[#d4a5a5] transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#8b6f63] mb-1">State / Province</label>
                    <input
                      type="text"
                      value={addressForm.state}
                      onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                      required
                      className="w-full px-4 py-3 rounded-lg bg-[#fef5f1] border border-[#f5e6e0]/80 text-[#8b6f63] focus:outline-none focus:ring-2 focus:ring-[#d4a5a5] transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#8b6f63] mb-1">ZIP / Postal Code</label>
                    <input
                      type="text"
                      value={addressForm.zipCode}
                      onChange={(e) => setAddressForm({ ...addressForm, zipCode: e.target.value })}
                      required
                      className="w-full px-4 py-3 rounded-lg bg-[#fef5f1] border border-[#f5e6e0]/80 text-[#8b6f63] focus:outline-none focus:ring-2 focus:ring-[#d4a5a5] transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#8b6f63] mb-1">Country</label>
                    <input
                      type="text"
                      value={addressForm.country}
                      onChange={(e) => setAddressForm({ ...addressForm, country: e.target.value })}
                      required
                      className="w-full px-4 py-3 rounded-lg bg-[#fef5f1] border border-[#f5e6e0]/80 text-[#8b6f63] focus:outline-none focus:ring-2 focus:ring-[#d4a5a5] transition-all"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-[#8b6f63] mb-1">Phone (optional)</label>
                    <input
                      type="tel"
                      value={addressForm.phone}
                      onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                      placeholder="+1 (555) 000-0000"
                      className="w-full px-4 py-3 rounded-lg bg-[#fef5f1] border border-[#f5e6e0]/80 text-[#8b6f63] placeholder:text-[#8b6f63]/40 focus:outline-none focus:ring-2 focus:ring-[#d4a5a5] transition-all"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setAddressForm({ ...addressForm, isDefault: !addressForm.isDefault })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      addressForm.isDefault ? 'bg-[#d4a5a5]' : 'bg-gray-300'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm ${addressForm.isDefault ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                  <span className="text-sm text-[#8b6f63]">Set as default address</span>
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddressModal(false)}
                    className="flex-1 px-4 py-3 border border-[#f5e6e0] text-[#8b6f63] rounded-full hover:bg-[#fef5f1] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={addressSaving}
                    className="flex-1 px-4 py-3 bg-[#d4a5a5] text-white rounded-full hover:bg-[#c89a9a] transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {addressSaving ? <Loader2 size={18} className="animate-spin" /> : null}
                    {addressSaving ? 'Saving...' : editingAddress ? 'Update Address' : 'Add Address'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
