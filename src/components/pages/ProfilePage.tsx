'use client';

import { useEffect, useState, useCallback } from 'react';
import { useStore } from '@/store/store';
import { User, Package, Heart, MapPin, Settings, LogOut, ShoppingBag, Star, Plus, Trash2 } from 'lucide-react';
// Inline toast function
function toast(message: string, type: 'success' | 'error' | 'info' = 'success') {
  let container = document.getElementById('__toast_container__') as HTMLDivElement | null;
  if (!container) {
    container = document.createElement('div');
    container.id = '__toast_container__';
    container.style.cssText = 'position:fixed;top:1rem;right:1rem;z-index:9999;display:flex;flex-direction:column;gap:0.5rem;max-width:24rem;width:100%;pointer-events:none;';
    document.body.appendChild(container);
  }
  const colors = { success: '#10b981', error: '#ef4444', info: '#3b82f6' };
  const el = document.createElement('div');
  el.style.cssText = 'pointer-events:auto;background:white;border-radius:0.75rem;box-shadow:0 10px 15px -3px rgba(0,0,0,0.1),0 4px 6px -4px rgba(0,0,0,0.1);border:1px solid #f3f4f6;border-left:4px solid ' + colors[type] + ';padding:0.75rem 1rem;display:flex;align-items:flex-start;gap:0.75rem;transform:translateX(120%);opacity:0;transition:transform 0.3s cubic-bezier(0.34,1.56,0.64,1),opacity 0.3s ease;max-width:100%;';
  el.innerHTML = '<p style="flex:1;font-size:0.875rem;color:#374151;line-height:1.4;margin:0">' + message + '</p><button style="color:#9ca3af;background:none;border:none;cursor:pointer;padding:0;font-size:1rem;line-height:1" aria-label="Close">&times;</button>';
  el.querySelector('button')!.addEventListener('click', () => { el.style.transform = 'translateX(120%)'; el.style.opacity = '0'; setTimeout(() => el.remove(), 300); });
  container.appendChild(el);
  requestAnimationFrame(() => { el.style.transform = 'translateX(0)'; el.style.opacity = '1'; });
  setTimeout(() => { el.style.transform = 'translateX(120%)'; el.style.opacity = '0'; setTimeout(() => el.remove(), 300); }, 4000);
}

import { motion, AnimatePresence } from 'framer-motion';

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  createdAt: string;
  productId?: string;
  orderItems: { id: string; quantity: number; price: number; productId: string; product?: { name: string; image: string } }[];
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

export function ProfilePage() {
  const { user, isAuthenticated, logout, navigate, setWishlistItems, toggleWishlist, wishlistItems, profileTab } = useStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [wishlistProducts, setWishlistProducts] = useState<WishlistProduct[]>([]);
  const [activeTab, setActiveTab] = useState<'orders' | 'wishlist' | 'addresses'>(profileTab === 'orders' || profileTab === 'wishlist' ? profileTab : 'orders');
  const [addresses, setAddresses] = useState<Address[]>([]);

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Delivered': return 'text-green-600 bg-green-50';
      case 'Shipped': case 'In Transit': return 'text-blue-600 bg-blue-50';
      case 'Processing': return 'text-orange-600 bg-orange-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  if (!user) return null;

  const totalOrders = orders.length;

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <motion.div
            className="bg-white rounded-lg shadow-sm p-6 sticky top-24 border border-[#f5e6e0]/50"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            {/* User Info */}
            <div className="text-center mb-6 pb-6 border-b border-[#8b6f63]/20">
              <div className="w-24 h-24 bg-[#fef5f1] rounded-full mx-auto mb-4 flex items-center justify-center">
                <User size={40} className="text-[#d4a5a5]" />
              </div>
              <h2 className="text-xl text-[#8b6f63] mb-1">{user.name}</h2>
              <p className="text-sm text-[#8b6f63]/70">{user.email}</p>
              {user.phone && <p className="text-sm text-[#8b6f63]/50 mt-1">{user.phone}</p>}
              {user.birthdate && (
                <p className="text-sm text-[#8b6f63]/50 mt-1">
                  🎂 {new Date(user.birthdate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              )}
              <div className="mt-4 flex items-center justify-center gap-6 text-sm">
                <div className="text-center">
                  <p className="text-[#d4a5a5] text-lg font-semibold">{totalOrders}</p>
                  <p className="text-[#8b6f63]/70 text-xs">Orders</p>
                </div>
                <div className="text-center">
                  <p className="text-[#d4a5a5] text-lg font-semibold">{wishlistItems.length}</p>
                  <p className="text-[#8b6f63]/70 text-xs">Wishlist</p>
                </div>
                <div className="text-center">
                  <p className="text-[#d4a5a5] text-lg font-semibold">{addresses.length}</p>
                  <p className="text-[#8b6f63]/70 text-xs">Addresses</p>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="space-y-2">
              <button
                onClick={() => setActiveTab('orders')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === 'orders'
                    ? 'bg-[#fef5f1] text-[#d4a5a5] font-medium'
                    : 'text-[#8b6f63] hover:bg-[#fef5f1]'
                }`}
              >
                <Package size={20} />
                <span>My Orders</span>
                {orders.length > 0 && (
                  <span className="ml-auto text-xs px-2 py-0.5 bg-[#fef5f1] rounded-full">{orders.length}</span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('wishlist')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === 'wishlist'
                    ? 'bg-[#fef5f1] text-[#d4a5a5] font-medium'
                    : 'text-[#8b6f63] hover:bg-[#fef5f1]'
                }`}
              >
                <Heart size={20} />
                <span>Wishlist</span>
                {wishlistItems.length > 0 && (
                  <span className="ml-auto text-xs px-2 py-0.5 bg-[#fef5f1] rounded-full">{wishlistItems.length}</span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('addresses')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === 'addresses'
                    ? 'bg-[#fef5f1] text-[#d4a5a5] font-medium'
                    : 'text-[#8b6f63] hover:bg-[#fef5f1]'
                }`}
              >
                <MapPin size={20} />
                <span>Addresses</span>
              </button>
              <button
                onClick={() => navigate('settings')}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-[#8b6f63] hover:bg-[#fef5f1] transition-colors"
              >
                <Settings size={20} />
                <span>Settings</span>
              </button>
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
          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <h1 className="text-2xl font-serif text-[#8b6f63] mb-6">My Orders</h1>
              {orders.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm p-12 text-center border border-[#f5e6e0]/50">
                  <Package size={48} className="text-[#8b6f63]/20 mx-auto mb-4" />
                  <h3 className="text-lg text-[#8b6f63] mb-2">No Orders Yet</h3>
                  <p className="text-sm text-[#8b6f63]/70 mb-4">Start shopping to see your orders here.</p>
                  <button onClick={() => navigate('products')} className="px-6 py-2 bg-[#d4a5a5] text-white rounded-full text-sm hover:bg-[#c89a9a] transition-colors">
                    Browse Products
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order.id} className="bg-white rounded-lg shadow-sm p-6 border border-[#f5e6e0]/50 hover:shadow-md transition-shadow">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 pb-4 border-b border-[#8b6f63]/20">
                        <div>
                          <p className="text-sm font-medium text-[#8b6f63]">Order #{order.orderNumber}</p>
                          <p className="text-sm text-[#8b6f63]/70">{new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                        </div>
                        <div className="flex items-center gap-4 mt-2 md:mt-0">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                          <p className="text-lg text-[#8b6f63] font-semibold">${order.total.toFixed(2)}</p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        {order.orderItems?.map((item) => (
                          <div key={item.id} className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-[#fef5f1] rounded-lg overflow-hidden flex-shrink-0">
                              {item.product?.image ? (
                                <img src={item.product.image} alt={item.product.name || 'Product'} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-2xl opacity-30">💄</div>
                              )}
                            </div>
                            <div className="flex-1">
                              <button onClick={() => { useStore.getState().setProductId(item.productId); navigate('product-detail'); }} className="text-[#8b6f63] hover:text-[#d4a5a5] transition-colors font-medium text-left">
                                {item.product?.name || 'Product'}
                              </button>
                              <p className="text-sm text-[#8b6f63]/70">Quantity: {item.quantity} × ${item.price.toFixed(2)}</p>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="mt-4 pt-4 border-t border-[#8b6f63]/20 flex gap-3">
                        <button onClick={() => { useStore.getState().setLastOrderId(order.id); navigate('order-tracking'); }} className="px-4 py-2 bg-[#d4a5a5] text-white rounded-full text-sm hover:bg-[#c89a9a] transition-colors">
                          Track Order
                        </button>
                        <button onClick={() => { useStore.getState().setLastOrderId(order.id); navigate('order-confirmation'); }} className="px-4 py-2 border border-[#d4a5a5] text-[#d4a5a5] rounded-full text-sm hover:bg-[#fef5f1] transition-colors">
                          View Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* Wishlist Tab */}
          {activeTab === 'wishlist' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <h1 className="text-2xl font-serif text-[#8b6f63] mb-6">My Wishlist</h1>
              {wishlistProducts.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm p-12 text-center border border-[#f5e6e0]/50">
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
                    <div key={product.id} className="bg-white rounded-lg shadow-sm overflow-hidden border border-[#f5e6e0]/50 hover:shadow-md transition-shadow group">
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
                              addToCart({ id: product.id, name: product.name, price: product.price, image: product.image, category: product.category, quantity: 1 });
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
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-serif text-[#8b6f63]">Saved Addresses</h1>
                <button
                  onClick={() => openAddressModal()}
                  className="px-4 py-2 bg-[#d4a5a5] text-white rounded-full text-sm hover:bg-[#c89a9a] transition-colors flex items-center gap-1.5"
                >
                  <Plus size={16} />
                  Add New Address
                </button>
              </div>
              {addresses.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm p-12 text-center border border-[#f5e6e0]/50">
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
                    <div key={address.id} className="bg-white rounded-lg shadow-sm p-6 relative border border-[#f5e6e0]/50 hover:shadow-md transition-shadow">
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
              className="relative bg-white rounded-xl shadow-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto"
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
                    {addressSaving ? <Trash2 size={18} className="animate-spin" /> : null}
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
