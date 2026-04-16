'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/store/store';
import {
  Package,
  DollarSign,
  Users,
  ShoppingBag,
  TrendingUp,
  Search,
  Eye,
  Edit3,
  Trash2,
  X,
  Plus,
  Save,
  ArrowLeft,
  Loader2,
  Shield,
} from 'lucide-react';
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

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product?: { name: string; image: string };
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  subtotal: number;
  tax: number;
  shipping: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  trackingNumber?: string;
  createdAt: string;
  orderItems: OrderItem[];
}

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  image: string;
  description: string;
  badge?: string;
  rating: number;
  reviewCount: number;
  stock: number;
  sales: number;
}

interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  createdAt: string;
  orderCount: number;
  totalSpent: number;
}

export function AdminDashboard() {
  const { user, navigate } = useStore();
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'products' | 'customers'>('overview');
  const [loading, setLoading] = useState(true);

  // Data
  const [stats, setStats] = useState({
    totalOrders: 0, totalRevenue: 0, totalCustomers: 0, totalProducts: 0,
    orderGrowth: 0, revenueGrowth: 0, customerGrowth: 0, productGrowth: 0,
  });
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);

  // Search & filter
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('All');
  const [customerSearch, setCustomerSearch] = useState('');

  // Modals
  const [showOrderDetail, setShowOrderDetail] = useState<Order | null>(null);
  const [showOrderStatusModal, setShowOrderStatusModal] = useState<Order | null>(null);
  const [newOrderStatus, setNewOrderStatus] = useState('');
  const [saving, setSaving] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState({
    name: '', price: '', category: '', image: '', description: '', badge: '', stock: '50',
  });
  const [productSaving, setProductSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<{ type: 'product' | 'customer'; id: string; name: string } | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/stats');
      const data = await res.json();
      if (data.stats) setStats(data.stats);
      if (data.recentOrders) setOrders(data.recentOrders);
      if (data.products) setProducts(data.products);
      if (data.customers) setCustomers(data.customers);
    } catch {
      toast('Failed to load admin data', 'error');
    }
    setLoading(false);
  };

  useEffect(() => {
    if (user?.role !== 'admin') {
      navigate('login');
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/admin/stats');
        const data = await res.json();
        if (cancelled) return;
        if (data.stats) setStats(data.stats);
        if (data.recentOrders) setOrders(data.recentOrders);
        if (data.products) setProducts(data.products);
        if (data.customers) setCustomers(data.customers);
      } catch {
        toast('Failed to load admin data', 'error');
      }
      if (!cancelled) setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [user, navigate]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Delivered': return 'bg-green-100 text-green-700';
      case 'Shipped': case 'In Transit': return 'bg-blue-100 text-blue-700';
      case 'Processing': return 'bg-orange-100 text-orange-700';
      case 'Pending': return 'bg-yellow-100 text-yellow-700';
      case 'Cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  // --- Order Handlers ---
  const handleStatusChange = async () => {
    if (!showOrderStatusModal || !newOrderStatus) return;
    setSaving(true);
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: showOrderStatusModal.id, status: newOrderStatus }),
      });
      if (res.ok) {
        toast(`Order #${showOrderStatusModal.orderNumber} status updated to ${newOrderStatus}`);
        setShowOrderStatusModal(null);
        setNewOrderStatus('');
        fetchData();
      } else {
        toast('Failed to update order status', 'error');
      }
    } catch {
      toast('Failed to update order status', 'error');
    }
    setSaving(false);
  };

  // --- Product Handlers ---
  const openProductModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setProductForm({
        name: product.name,
        price: String(product.price),
        category: product.category,
        image: product.image,
        description: product.description,
        badge: product.badge || '',
        stock: String(product.stock),
      });
    } else {
      setEditingProduct(null);
      setProductForm({ name: '', price: '', category: 'Makeup', image: '', description: '', badge: '', stock: '50' });
    }
    setIsProductModalOpen(true);
  };

  const closeProductModal = () => setIsProductModalOpen(false);

  const handleProductSave = async () => {
    setProductSaving(true);
    try {
      if (editingProduct) {
        // Update
        const res = await fetch(`/api/admin/products/${editingProduct.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(productForm),
        });
        if (res.ok) {
          toast('Product updated');
          closeProductModal();
          fetchData();
        } else {
          toast('Failed to update product', 'error');
        }
      } else {
        // Create
        const res = await fetch('/api/admin/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(productForm),
        });
        if (res.ok) {
          toast('Product created');
          closeProductModal();
          fetchData();
        } else {
          toast('Failed to create product', 'error');
        }
      }
    } catch {
      toast('Failed to save product', 'error');
    }
    setProductSaving(false);
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast('Product deleted');
        setConfirmDelete(null);
        fetchData();
      } else {
        toast('Failed to delete product', 'error');
      }
    } catch {
      toast('Failed to delete product', 'error');
    }
  };

  const handleDeleteCustomer = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/customers?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast('Customer deleted');
        setConfirmDelete(null);
        fetchData();
      } else {
        const data = await res.json();
        toast(data.error || 'Failed to delete customer', 'error');
      }
    } catch {
      toast('Failed to delete customer', 'error');
    }
  };

  const filteredOrders = orders.filter((o) => {
    const matchStatus = orderStatusFilter === 'All' || o.status === orderStatusFilter;
    const matchSearch = !orderSearch ||
      o.orderNumber.toLowerCase().includes(orderSearch.toLowerCase()) ||
      `${o.firstName} ${o.lastName}`.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.email.toLowerCase().includes(orderSearch.toLowerCase());
    return matchStatus && matchSearch;
  });

  const filteredCustomers = customers.filter((c) => {
    if (!customerSearch) return true;
    return c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
      c.email.toLowerCase().includes(customerSearch.toLowerCase());
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fef5f1] flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={40} className="text-[#d4a5a5] animate-spin mx-auto mb-4" />
          <p className="text-[#8b6f63]">Loading Admin Dashboard...</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { key: 'overview' as const, label: 'Overview', icon: Package },
    { key: 'orders' as const, label: 'Orders', icon: ShoppingBag },
    { key: 'products' as const, label: 'Products', icon: Package },
    { key: 'customers' as const, label: 'Customers', icon: Users },
  ];

  return (
    <div className="min-h-screen bg-[#fef5f1]">
      {/* Header */}
      <div className="bg-white border-b border-[#f5e6e0]">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('home')}
                className="p-2 hover:bg-[#fef5f1] rounded-full transition-colors"
              >
                <ArrowLeft size={20} className="text-[#8b6f63]" />
              </button>
              <div>
                <div className="flex items-center gap-2">
                  <Shield size={20} className="text-[#d4a5a5]" />
                  <h1 className="text-2xl font-serif text-[#8b6f63]">Admin Dashboard</h1>
                </div>
                <p className="text-sm text-[#8b6f63]/70">Manage your Rare Beauty store</p>
              </div>
            </div>
            <button
              onClick={() => navigate('home')}
              className="px-4 py-2 bg-[#d4a5a5] text-white rounded-full hover:bg-[#c89a9a] transition-colors text-sm"
            >
              View Store
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-sm p-2 mb-8 flex gap-2 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg text-sm whitespace-nowrap transition-colors ${
                activeTab === tab.key
                  ? 'bg-[#d4a5a5] text-white'
                  : 'text-[#8b6f63] hover:bg-[#fef5f1]'
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* ===== OVERVIEW TAB ===== */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: 'Total Orders', value: stats.totalOrders, icon: Package, growth: stats.orderGrowth, prefix: '' },
                { label: 'Total Revenue', value: stats.totalRevenue, icon: DollarSign, growth: stats.revenueGrowth, prefix: '$' },
                { label: 'Total Customers', value: stats.totalCustomers, icon: Users, growth: stats.customerGrowth, prefix: '' },
                { label: 'Total Products', value: stats.totalProducts, icon: ShoppingBag, growth: stats.productGrowth, prefix: '' },
              ].map((stat) => (
                <motion.div
                  key={stat.label}
                  className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-[#fef5f1] rounded-lg flex items-center justify-center">
                      <stat.icon className="text-[#d4a5a5]" size={24} />
                    </div>
                    <span className="text-sm text-green-600 flex items-center gap-1">
                      <TrendingUp size={14} />
                      {stat.growth}%
                    </span>
                  </div>
                  <p className="text-2xl text-[#8b6f63] mb-1">
                    {stat.prefix}{typeof stat.value === 'number' && stat.label.includes('Revenue')
                      ? stat.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                      : stat.value.toLocaleString()}
                  </p>
                  <p className="text-sm text-[#8b6f63]/70">{stat.label}</p>
                </motion.div>
              ))}
            </div>

            {/* Recent Orders */}
            <motion.div className="bg-white rounded-lg shadow-sm p-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-serif text-[#8b6f63]">Recent Orders</h2>
                <button onClick={() => setActiveTab('orders')} className="text-sm text-[#d4a5a5] hover:underline">View All</button>
              </div>
              {orders.length === 0 ? (
                <p className="text-center text-[#8b6f63]/60 py-8">No orders yet</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[#8b6f63]/20">
                        <th className="text-left py-3 px-4 text-sm text-[#8b6f63]">Order ID</th>
                        <th className="text-left py-3 px-4 text-sm text-[#8b6f63]">Customer</th>
                        <th className="text-left py-3 px-4 text-sm text-[#8b6f63]">Date</th>
                        <th className="text-left py-3 px-4 text-sm text-[#8b6f63]">Total</th>
                        <th className="text-left py-3 px-4 text-sm text-[#8b6f63]">Status</th>
                        <th className="text-left py-3 px-4 text-sm text-[#8b6f63]">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.slice(0, 5).map((order) => (
                        <tr key={order.id} className="border-b border-[#8b6f63]/10 hover:bg-[#fef5f1] transition-colors">
                          <td className="py-3 px-4 text-sm text-[#8b6f63] font-medium">#{order.orderNumber}</td>
                          <td className="py-3 px-4 text-sm text-[#8b6f63]">{order.firstName} {order.lastName}</td>
                          <td className="py-3 px-4 text-sm text-[#8b6f63]/70">{new Date(order.createdAt).toLocaleDateString()}</td>
                          <td className="py-3 px-4 text-sm text-[#8b6f63]">${order.total.toFixed(2)}</td>
                          <td className="py-3 px-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>{order.status}</span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1">
                              <button onClick={() => setShowOrderDetail(order)} className="p-1.5 text-[#8b6f63] hover:text-[#d4a5a5] hover:bg-[#fef5f1] rounded-lg transition-colors" title="View"><Eye size={16} /></button>
                              <button onClick={() => { setShowOrderStatusModal(order); setNewOrderStatus(order.status); }} className="p-1.5 text-[#8b6f63] hover:text-[#d4a5a5] hover:bg-[#fef5f1] rounded-lg transition-colors" title="Edit Status"><Edit3 size={16} /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>

            {/* Recent Customers */}
            <motion.div className="bg-white rounded-lg shadow-sm p-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-serif text-[#8b6f63]">Recent Customers</h2>
                <button onClick={() => setActiveTab('customers')} className="text-sm text-[#d4a5a5] hover:underline">View All</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#8b6f63]/20">
                      <th className="text-left py-3 px-4 text-sm text-[#8b6f63]">Name</th>
                      <th className="text-left py-3 px-4 text-sm text-[#8b6f63]">Email</th>
                      <th className="text-left py-3 px-4 text-sm text-[#8b6f63]">Orders</th>
                      <th className="text-left py-3 px-4 text-sm text-[#8b6f63]">Total Spent</th>
                      <th className="text-left py-3 px-4 text-sm text-[#8b6f63]">Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customers.slice(0, 5).map((c) => (
                      <tr key={c.id} className="border-b border-[#8b6f63]/10 hover:bg-[#fef5f1] transition-colors">
                        <td className="py-3 px-4 text-sm text-[#8b6f63] font-medium">{c.name}</td>
                        <td className="py-3 px-4 text-sm text-[#8b6f63]/70">{c.email}</td>
                        <td className="py-3 px-4 text-sm text-[#8b6f63]">{c.orderCount}</td>
                        <td className="py-3 px-4 text-sm text-[#8b6f63]">${c.totalSpent.toFixed(2)}</td>
                        <td className="py-3 px-4 text-sm text-[#8b6f63]/70">{new Date(c.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </div>
        )}

        {/* ===== ORDERS TAB ===== */}
        {activeTab === 'orders' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
              <h2 className="text-xl font-serif text-[#8b6f63]">All Orders</h2>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
                <div className="relative flex-1 md:flex-none">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8b6f63]/50" size={18} />
                  <input
                    type="text"
                    placeholder="Search orders..."
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    className="pl-10 pr-4 py-2 bg-[#fef5f1] rounded-full text-sm text-[#8b6f63] focus:outline-none focus:ring-2 focus:ring-[#d4a5a5] w-full md:w-64"
                  />
                </div>
                <select
                  value={orderStatusFilter}
                  onChange={(e) => setOrderStatusFilter(e.target.value)}
                  className="px-4 py-2 bg-[#fef5f1] rounded-full text-sm text-[#8b6f63] focus:outline-none focus:ring-2 focus:ring-[#d4a5a5]"
                >
                  <option>All</option>
                  <option>Pending</option>
                  <option>Processing</option>
                  <option>In Transit</option>
                  <option>Delivered</option>
                  <option>Cancelled</option>
                </select>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#8b6f63]/20">
                    <th className="text-left py-3 px-4 text-sm text-[#8b6f63]">Order ID</th>
                    <th className="text-left py-3 px-4 text-sm text-[#8b6f63]">Customer</th>
                    <th className="text-left py-3 px-4 text-sm text-[#8b6f63]">Date</th>
                    <th className="text-left py-3 px-4 text-sm text-[#8b6f63]">Items</th>
                    <th className="text-left py-3 px-4 text-sm text-[#8b6f63]">Total</th>
                    <th className="text-left py-3 px-4 text-sm text-[#8b6f63]">Status</th>
                    <th className="text-left py-3 px-4 text-sm text-[#8b6f63]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.length === 0 ? (
                    <tr><td colSpan={7} className="text-center py-8 text-[#8b6f63]/60">No orders found</td></tr>
                  ) : (
                    filteredOrders.map((order) => (
                      <tr key={order.id} className="border-b border-[#8b6f63]/10 hover:bg-[#fef5f1] transition-colors">
                        <td className="py-3 px-4 text-sm text-[#8b6f63] font-medium">#{order.orderNumber}</td>
                        <td className="py-3 px-4 text-sm text-[#8b6f63]">{order.firstName} {order.lastName}</td>
                        <td className="py-3 px-4 text-sm text-[#8b6f63]/70">{new Date(order.createdAt).toLocaleDateString()}</td>
                        <td className="py-3 px-4 text-sm text-[#8b6f63]">{order.orderItems?.length || 0}</td>
                        <td className="py-3 px-4 text-sm text-[#8b6f63]">${order.total.toFixed(2)}</td>
                        <td className="py-3 px-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>{order.status}</span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1">
                            <button onClick={() => setShowOrderDetail(order)} className="p-1.5 text-[#8b6f63] hover:text-[#d4a5a5] hover:bg-[#fef5f1] rounded-lg transition-colors"><Eye size={16} /></button>
                            <button onClick={() => { setShowOrderStatusModal(order); setNewOrderStatus(order.status); }} className="p-1.5 text-[#8b6f63] hover:text-[#d4a5a5] hover:bg-[#fef5f1] rounded-lg transition-colors"><Edit3 size={16} /></button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ===== PRODUCTS TAB ===== */}
        {activeTab === 'products' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-serif text-[#8b6f63]">Products</h2>
              <button onClick={() => openProductModal()} className="px-4 py-2 bg-[#d4a5a5] text-white rounded-full hover:bg-[#c89a9a] transition-colors text-sm flex items-center gap-1.5">
                <Plus size={16} /> Add Product
              </button>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {products.map((product) => (
                <div key={product.id} className="flex items-center gap-4 p-4 border border-[#8b6f63]/20 rounded-lg hover:bg-[#fef5f1] transition-colors">
                  <div className="w-16 h-16 bg-[#fef5f1] rounded-lg overflow-hidden flex-shrink-0">
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-[#8b6f63] font-medium truncate">{product.name}</h3>
                      {product.badge && <span className="px-2 py-0.5 bg-[#d4a5a5] text-white text-xs rounded-full flex-shrink-0">{product.badge}</span>}
                    </div>
                    <p className="text-sm text-[#8b6f63]/70">
                      ${product.price.toFixed(2)} · <span className={product.stock < 10 ? 'text-red-500 font-medium' : ''}>Stock: {product.stock}</span> · Sales: {product.sales}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button onClick={() => openProductModal(product)} className="p-2 text-[#8b6f63] hover:text-[#d4a5a5] hover:bg-[#fef5f1] rounded-lg transition-colors" title="Edit">
                      <Edit3 size={18} />
                    </button>
                    <button onClick={() => setConfirmDelete({ type: 'product', id: product.id, name: product.name })} className="p-2 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ===== CUSTOMERS TAB ===== */}
        {activeTab === 'customers' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
              <h2 className="text-xl font-serif text-[#8b6f63]">Customers</h2>
              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8b6f63]/50" size={18} />
                <input
                  type="text"
                  placeholder="Search customers..."
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-[#fef5f1] rounded-full text-sm text-[#8b6f63] focus:outline-none focus:ring-2 focus:ring-[#d4a5a5] w-full"
                />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#8b6f63]/20">
                    <th className="text-left py-3 px-4 text-sm text-[#8b6f63]">Name</th>
                    <th className="text-left py-3 px-4 text-sm text-[#8b6f63]">Email</th>
                    <th className="text-left py-3 px-4 text-sm text-[#8b6f63]">Role</th>
                    <th className="text-left py-3 px-4 text-sm text-[#8b6f63]">Orders</th>
                    <th className="text-left py-3 px-4 text-sm text-[#8b6f63]">Total Spent</th>
                    <th className="text-left py-3 px-4 text-sm text-[#8b6f63]">Joined</th>
                    <th className="text-left py-3 px-4 text-sm text-[#8b6f63]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCustomers.length === 0 ? (
                    <tr><td colSpan={7} className="text-center py-8 text-[#8b6f63]/60">No customers found</td></tr>
                  ) : (
                    filteredCustomers.map((c) => (
                      <tr key={c.id} className="border-b border-[#8b6f63]/10 hover:bg-[#fef5f1] transition-colors">
                        <td className="py-3 px-4 text-sm text-[#8b6f63] font-medium">{c.name}</td>
                        <td className="py-3 px-4 text-sm text-[#8b6f63]/70">{c.email}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-xs ${c.role === 'admin' ? 'bg-[#d4a5a5] text-white' : 'bg-gray-100 text-gray-600'}`}>{c.role}</span>
                        </td>
                        <td className="py-3 px-4 text-sm text-[#8b6f63]">{c.orderCount}</td>
                        <td className="py-3 px-4 text-sm text-[#8b6f63]">${c.totalSpent.toFixed(2)}</td>
                        <td className="py-3 px-4 text-sm text-[#8b6f63]/70">{new Date(c.createdAt).toLocaleDateString()}</td>
                        <td className="py-3 px-4">
                          {c.role !== 'admin' ? (
                            <button onClick={() => setConfirmDelete({ type: 'customer', id: c.id, name: c.name })} className="p-1.5 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                              <Trash2 size={16} />
                            </button>
                          ) : (
                            <span className="text-xs text-[#8b6f63]/40">—</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ===== ORDER DETAIL MODAL ===== */}
      <AnimatePresence>
        {showOrderDetail && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowOrderDetail(null)} />
            <motion.div className="relative bg-white rounded-xl shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto" initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-serif text-[#8b6f63]">Order #{showOrderDetail.orderNumber}</h3>
                <button onClick={() => setShowOrderDetail(null)} className="text-[#8b6f63]/40 hover:text-[#8b6f63]"><X size={20} /></button>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div><p className="text-xs text-[#8b6f63]/50 uppercase">Status</p><span className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(showOrderDetail.status)}`}>{showOrderDetail.status}</span></div>
                  <div><p className="text-xs text-[#8b6f63]/50 uppercase">Date</p><p className="text-sm text-[#8b6f63]">{new Date(showOrderDetail.createdAt).toLocaleString()}</p></div>
                  <div><p className="text-xs text-[#8b6f63]/50 uppercase">Customer</p><p className="text-sm text-[#8b6f63]">{showOrderDetail.firstName} {showOrderDetail.lastName}</p></div>
                  <div><p className="text-xs text-[#8b6f63]/50 uppercase">Email</p><p className="text-sm text-[#8b6f63]">{showOrderDetail.email}</p></div>
                  <div><p className="text-xs text-[#8b6f63]/50 uppercase">Phone</p><p className="text-sm text-[#8b6f63]">{showOrderDetail.phone}</p></div>
                  {showOrderDetail.trackingNumber && <div><p className="text-xs text-[#8b6f63]/50 uppercase">Tracking</p><p className="text-sm text-[#d4a5a5] font-mono">{showOrderDetail.trackingNumber}</p></div>}
                </div>
                <div className="bg-[#fef5f1] rounded-lg p-4">
                  <p className="text-xs text-[#8b6f63]/50 uppercase mb-1">Shipping Address</p>
                  <p className="text-sm text-[#8b6f63]">{showOrderDetail.address}</p>
                  <p className="text-sm text-[#8b6f63]">{showOrderDetail.city}, {showOrderDetail.state} {showOrderDetail.zipCode}</p>
                  <p className="text-sm text-[#8b6f63]">{showOrderDetail.country}</p>
                </div>
                <div>
                  <p className="text-xs text-[#8b6f63]/50 uppercase mb-3">Items</p>
                  <div className="space-y-3">
                    {showOrderDetail.orderItems?.map((item) => (
                      <div key={item.id} className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-[#fef5f1] rounded-lg overflow-hidden flex-shrink-0">
                          {item.product?.image ? <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-lg opacity-30">💄</div>}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-[#8b6f63] truncate">{item.product?.name || 'Product'}</p>
                          <p className="text-xs text-[#8b6f63]/50">Qty: {item.quantity}</p>
                        </div>
                        <p className="text-sm text-[#8b6f63] font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="border-t border-[#8b6f63]/20 pt-4 space-y-1">
                  <div className="flex justify-between text-sm text-[#8b6f63]/70"><span>Subtotal</span><span>${showOrderDetail.subtotal.toFixed(2)}</span></div>
                  <div className="flex justify-between text-sm text-[#8b6f63]/70"><span>Shipping</span><span>{showOrderDetail.shipping === 0 ? 'Free' : `$${showOrderDetail.shipping.toFixed(2)}`}</span></div>
                  <div className="flex justify-between text-sm text-[#8b6f63]/70"><span>Tax</span><span>${showOrderDetail.tax.toFixed(2)}</span></div>
                  <div className="flex justify-between text-lg text-[#8b6f63] font-semibold pt-2 border-t border-[#8b6f63]/10"><span>Total</span><span>${showOrderDetail.total.toFixed(2)}</span></div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== ORDER STATUS MODAL ===== */}
      <AnimatePresence>
        {showOrderStatusModal && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowOrderStatusModal(null)} />
            <motion.div className="relative bg-white rounded-xl shadow-xl p-6 w-full max-w-sm" initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-serif text-[#8b6f63]">Update Order Status</h3>
                <button onClick={() => setShowOrderStatusModal(null)} className="text-[#8b6f63]/40 hover:text-[#8b6f63]"><X size={20} /></button>
              </div>
              <p className="text-sm text-[#8b6f63]/70 mb-4">Order #{showOrderStatusModal.orderNumber}</p>
              <select
                value={newOrderStatus}
                onChange={(e) => setNewOrderStatus(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-[#fef5f1] border border-[#f5e6e0]/80 text-[#8b6f63] focus:outline-none focus:ring-2 focus:ring-[#d4a5a5] mb-6"
              >
                <option>Pending</option>
                <option>Processing</option>
                <option>In Transit</option>
                <option>Delivered</option>
                <option>Cancelled</option>
              </select>
              <div className="flex gap-3">
                <button onClick={() => setShowOrderStatusModal(null)} className="flex-1 px-4 py-3 border border-[#f5e6e0] text-[#8b6f63] rounded-full hover:bg-[#fef5f1] transition-colors">Cancel</button>
                <button onClick={handleStatusChange} disabled={saving || newOrderStatus === showOrderStatusModal.status} className="flex-1 px-4 py-3 bg-[#d4a5a5] text-white rounded-full hover:bg-[#c89a9a] transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
                  {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  Update
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== PRODUCT MODAL ===== */}
      <AnimatePresence>
        {isProductModalOpen && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={closeProductModal} />
            <motion.div className="relative bg-white rounded-xl shadow-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto" initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-serif text-[#8b6f63]">{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
                <button onClick={closeProductModal} className="text-[#8b6f63]/40 hover:text-[#8b6f63]"><X size={20} /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#8b6f63] mb-1">Product Name</label>
                  <input type="text" value={productForm.name} onChange={(e) => setProductForm({ ...productForm, name: e.target.value })} required className="w-full px-4 py-3 rounded-lg bg-[#fef5f1] border border-[#f5e6e0]/80 text-[#8b6f63] focus:outline-none focus:ring-2 focus:ring-[#d4a5a5]" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#8b6f63] mb-1">Price ($)</label>
                    <input type="number" step="0.01" value={productForm.price} onChange={(e) => setProductForm({ ...productForm, price: e.target.value })} required className="w-full px-4 py-3 rounded-lg bg-[#fef5f1] border border-[#f5e6e0]/80 text-[#8b6f63] focus:outline-none focus:ring-2 focus:ring-[#d4a5a5]" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#8b6f63] mb-1">Stock</label>
                    <input type="number" value={productForm.stock} onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })} className="w-full px-4 py-3 rounded-lg bg-[#fef5f1] border border-[#f5e6e0]/80 text-[#8b6f63] focus:outline-none focus:ring-2 focus:ring-[#d4a5a5]" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#8b6f63] mb-1">Category</label>
                  <select value={productForm.category} onChange={(e) => setProductForm({ ...productForm, category: e.target.value })} className="w-full px-4 py-3 rounded-lg bg-[#fef5f1] border border-[#f5e6e0]/80 text-[#8b6f63] focus:outline-none focus:ring-2 focus:ring-[#d4a5a5]">
                    <option>Makeup</option>
                    <option>Skincare</option>
                    <option>Haircare</option>
                    <option>Perfume</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#8b6f63] mb-1">Image URL</label>
                  <input type="text" value={productForm.image} onChange={(e) => setProductForm({ ...productForm, image: e.target.value })} placeholder="/products/product-name.png" className="w-full px-4 py-3 rounded-lg bg-[#fef5f1] border border-[#f5e6e0]/80 text-[#8b6f63] placeholder:text-[#8b6f63]/40 focus:outline-none focus:ring-2 focus:ring-[#d4a5a5]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#8b6f63] mb-1">Badge</label>
                  <input type="text" value={productForm.badge} onChange={(e) => setProductForm({ ...productForm, badge: e.target.value })} placeholder="e.g. New, Sale, Limited Edition" className="w-full px-4 py-3 rounded-lg bg-[#fef5f1] border border-[#f5e6e0]/80 text-[#8b6f63] placeholder:text-[#8b6f63]/40 focus:outline-none focus:ring-2 focus:ring-[#d4a5a5]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#8b6f63] mb-1">Description</label>
                  <textarea value={productForm.description} onChange={(e) => setProductForm({ ...productForm, description: e.target.value })} rows={3} className="w-full px-4 py-3 rounded-lg bg-[#fef5f1] border border-[#f5e6e0]/80 text-[#8b6f63] focus:outline-none focus:ring-2 focus:ring-[#d4a5a5] resize-none" />
                </div>
                <div className="flex gap-3 pt-2">
                  <button onClick={closeProductModal} className="flex-1 px-4 py-3 border border-[#f5e6e0] text-[#8b6f63] rounded-full hover:bg-[#fef5f1] transition-colors">Cancel</button>
                  <button onClick={handleProductSave} disabled={productSaving || !productForm.name || !productForm.price} className="flex-1 px-4 py-3 bg-[#d4a5a5] text-white rounded-full hover:bg-[#c89a9a] transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
                    {productSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                    {productSaving ? 'Saving...' : 'Save Product'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== CONFIRM DELETE MODAL ===== */}
      <AnimatePresence>
        {confirmDelete && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setConfirmDelete(null)} />
            <motion.div className="relative bg-white rounded-xl shadow-xl p-6 w-full max-w-sm" initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}>
              <div className="text-center mb-6">
                <div className="w-12 h-12 bg-red-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Trash2 className="text-red-500" size={24} />
                </div>
                <h3 className="text-lg font-serif text-[#8b6f63] mb-2">Delete {confirmDelete.type === 'product' ? 'Product' : 'Customer'}</h3>
                <p className="text-sm text-[#8b6f63]/70">Are you sure you want to delete &ldquo;{confirmDelete.name}&rdquo;? This action cannot be undone.</p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setConfirmDelete(null)} className="flex-1 px-4 py-3 border border-[#f5e6e0] text-[#8b6f63] rounded-full hover:bg-[#fef5f1] transition-colors">Cancel</button>
                <button
                  onClick={() => confirmDelete.type === 'product' ? handleDeleteProduct(confirmDelete.id) : handleDeleteCustomer(confirmDelete.id)}
                  className="flex-1 px-4 py-3 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
