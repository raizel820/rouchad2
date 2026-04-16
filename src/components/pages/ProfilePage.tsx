'use client';

import { useEffect, useState } from 'react';
import { useStore } from '@/store/store';
import { User, Package, Heart, MapPin, Settings, LogOut, ShoppingBag, Trash2, Star } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  createdAt: string;
  orderItems: { id: string; quantity: number; price: number; product?: { name: string; image: string } }[];
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
  id: number;
  type: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  isDefault: boolean;
}

export function ProfilePage() {
  const { user, isAuthenticated, logout, navigate, setWishlistItems, toggleWishlist, wishlistItems, profileTab } = useStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [wishlistProducts, setWishlistProducts] = useState<WishlistProduct[]>([]);
  const [activeTab, setActiveTab] = useState<'orders' | 'wishlist' | 'addresses'>(profileTab === 'orders' || profileTab === 'wishlist' ? profileTab : 'orders');
  const [addresses, setAddresses] = useState<Address[]>([
    { id: 1, type: 'Home', name: user?.name || '', address: '123 Beauty Lane', city: 'Los Angeles', state: 'CA', zipCode: '90001', isDefault: true },
    { id: 2, type: 'Work', name: user?.name || '', address: '456 Office Boulevard', city: 'Los Angeles', state: 'CA', zipCode: '90012', isDefault: false },
  ]);

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

  const handleRemoveAddress = (id: number) => {
    setAddresses((prev) => prev.filter((a) => a.id !== id));
    toast.success('Address removed');
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
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
              <div className="mt-4 flex items-center justify-center gap-6 text-sm">
                <div className="text-center">
                  <p className="text-[#d4a5a5] text-lg font-semibold">{totalOrders}</p>
                  <p className="text-[#8b6f63]/70 text-xs">Orders</p>
                </div>
                <div className="text-center">
                  <p className="text-[#d4a5a5] text-lg font-semibold">{wishlistItems.length}</p>
                  <p className="text-[#8b6f63]/70 text-xs">Wishlist</p>
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
                              <p className="text-sm text-[#8b6f63]/70">Quantity: {item.quantity}</p>
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
                        className="aspect-square bg-[#fef5f1] overflow-hidden cursor-pointer"
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
                              toast.success(`${product.name} added to cart!`);
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
                <button onClick={() => toast.success('Address form coming soon!')} className="px-4 py-2 bg-[#d4a5a5] text-white rounded-full text-sm hover:bg-[#c89a9a] transition-colors">
                  Add New Address
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {addresses.map((address) => (
                  <div key={address.id} className="bg-white rounded-lg shadow-sm p-6 relative border border-[#f5e6e0]/50">
                    {address.isDefault && (
                      <span className="absolute top-4 right-4 px-3 py-1 bg-[#d4a5a5] text-white text-xs rounded-full">
                        Default
                      </span>
                    )}
                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin size={18} className="text-[#d4a5a5]" />
                        <span className="text-[#8b6f63] font-medium">{address.type}</span>
                      </div>
                      <p className="text-[#8b6f63]">{address.name}</p>
                      <p className="text-sm text-[#8b6f63]/70">{address.address}</p>
                      <p className="text-sm text-[#8b6f63]/70">{address.city}, {address.state} {address.zipCode}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => toast.success('Edit address form coming soon!')} className="flex-1 px-4 py-2 border border-[#d4a5a5] text-[#d4a5a5] text-sm rounded-full hover:bg-[#fef5f1] transition-colors">
                        Edit
                      </button>
                      <button onClick={() => handleRemoveAddress(address.id)} className="flex-1 px-4 py-2 border border-red-300 text-red-500 text-sm rounded-full hover:bg-red-50 transition-colors">
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
