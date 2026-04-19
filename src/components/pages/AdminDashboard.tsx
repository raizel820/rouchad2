'use client';

import { useState, useEffect, useRef } from 'react';
import { useStore } from '@/store/store';
import {
  Package,
  DollarSign,
  Users,
  ShoppingBag,
  ShoppingCart,
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
  Tag,
  Palette,
  FileText,
  Filter,
  Check,
  Percent,
  Settings,
  Image,
  Upload,
  Link,
  Calendar,
  ToggleLeft,
  ToggleRight,
  Ticket,
  Store,
  Globe,
  ImageIcon,
  RotateCcw,
  Clock,
  Sparkles,
  Layers,
  Minus,
} from 'lucide-react';
import { toast } from '@/lib/toast';
import { motion, AnimatePresence } from 'framer-motion';

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  originalPrice?: number;
  discountAmount?: number;
  color?: string | null;
  product?: { name: string; image: string };
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  subtotal: number;
  discountTotal: number;
  tax: number;
  shipping: number;
  promoCode?: string;
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
  paymentMethod?: string;
  createdAt: string;
  orderItems: OrderItem[];
}

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  image: string;
  images?: string | null;
  description: string;
  ingredients?: string | null;
  colors?: string | null;
  badge?: string;
  discountPercentage: number;
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

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  image?: string | null;
  productCount: number;
  createdAt: string;
}

interface SaleCategory {
  id: string;
  saleId: string;
  categoryName: string;
  discountPercentage: number;
}

interface Sale {
  id: string;
  name: string;
  description?: string | null;
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  categories: SaleCategory[];
  promoCodes: PromoCode[];
}

interface PromoCode {
  id: string;
  code: string;
  discountType: string;
  discountValue: number;
  minOrderAmount: number;
  maxUses: number;
  currentUses: number;
  isValid: boolean;
  expiresAt?: string | null;
  saleId?: string | null;
  sale?: Sale | null;
  createdAt: string;
  updatedAt: string;
}

interface ShopSettings {
  id: string;
  shopName: string;
  logoUrl?: string | null;
  faviconUrl?: string | null;
}

const PRODUCT_TAGS = [
  'Cruelty-Free', 'Vegan', 'Clean Beauty', 'Organic', 'Natural',
  'Paraben-Free', 'Sulfate-Free', 'Gluten-Free', 'Dermatologist Tested',
  'Fragrance-Free', 'Oil-Free', 'Non-Comedogenic', 'Recyclable Packaging',
  '12M After Opening',
];

const PRESET_COLORS = [
  '#FF69B4', '#FFB6C1', '#DB7093', '#C71585', '#8B4513',
  '#D2691E', '#F4A460', '#DEB887', '#FFE4B5', '#FFA07A',
  '#E6E6FA', '#DDA0DD', '#EE82EE', '#DA70D6', '#BA55D3',
  '#FF0000', '#FF4500', '#FF6347', '#FF7F50', '#FFA500',
  '#98FB98', '#90EE90', '#3CB371', '#2E8B57', '#006400',
  '#000000', '#333333', '#666666', '#999999', '#FFFFFF',
  '#87CEEB', '#4682B4', '#1E90FF', '#000080', '#4169E1',
];

export function AdminDashboard() {
  const { user, navigate } = useStore();
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'products' | 'customers' | 'sales' | 'promo-codes' | 'settings'>('overview');
  const [loading, setLoading] = useState(true);

  // Data
  const [stats, setStats] = useState({
    totalOrders: 0, totalRevenue: 0, totalCustomers: 0, totalProducts: 0,
    orderGrowth: 0, revenueGrowth: 0, customerGrowth: 0, productGrowth: 0,
  });
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [shopSettings, setShopSettings] = useState<ShopSettings | null>(null);

  // Search & filter
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('All');
  const [customerSearch, setCustomerSearch] = useState('');
  const [productSearch, setProductSearch] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState('All');
  const [productStockFilter, setProductStockFilter] = useState('All');

  // Modals
  const [showOrderDetail, setShowOrderDetail] = useState<Order | null>(null);
  const [showOrderStatusModal, setShowOrderStatusModal] = useState<Order | null>(null);
  const [newOrderStatus, setNewOrderStatus] = useState('');
  const [saving, setSaving] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState({
    name: '', price: '', category: '', image: '', imageMode: 'url' as 'url' | 'upload',
    images: [] as string[], imageGalleryMode: 'url' as 'url' | 'upload',
    description: '', ingredients: '', colors: [] as string[], badge: '', tags: [] as string[], stock: '50', discountPercentage: '0',
  });
  const [productSaving, setProductSaving] = useState(false);
  const [productUploading, setProductUploading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<{ type: 'product' | 'customer' | 'category' | 'sale' | 'promo-code'; id: string; name: string } | null>(null);

  // Category modal
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryForm, setCategoryForm] = useState({ name: '', description: '', image: '' });
  const [categorySaving, setCategorySaving] = useState(false);

  // Sale modal
  const [isSaleModalOpen, setIsSaleModalOpen] = useState(false);
  const [editingSale, setEditingSale] = useState<Sale | null>(null);
  const [saleForm, setSaleForm] = useState({
    name: '', description: '', startDate: '', endDate: '', isActive: false,
    categoryDiscounts: [] as { categoryName: string; discountPercentage: string }[],
  });
  const [saleSaving, setSaleSaving] = useState(false);

  // Promo Code modal
  const [isPromoModalOpen, setIsPromoModalOpen] = useState(false);
  const [editingPromo, setEditingPromo] = useState<PromoCode | null>(null);
  const [promoForm, setPromoForm] = useState({
    code: '', discountType: 'percentage', discountValue: '', minOrderAmount: '0',
    maxUses: '0', isValid: true, expiresAt: '', saleId: '',
  });
  const [promoSaving, setPromoSaving] = useState(false);

  // Settings
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);
  const [faviconUploading, setFaviconUploading] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);

  // Product upload refs
  const productImageInputRef = useRef<HTMLInputElement>(null);
  const galleryImageInputRef = useRef<HTMLInputElement>(null);

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
    try {
      const catRes = await fetch('/api/admin/categories');
      const catData = await catRes.json();
      if (Array.isArray(catData)) setCategories(catData);
    } catch {}
    try {
      const salesRes = await fetch('/api/admin/sales');
      const salesData = await salesRes.json();
      if (Array.isArray(salesData)) setSales(salesData);
    } catch {}
    try {
      const promoRes = await fetch('/api/admin/promo-codes');
      const promoData = await promoRes.json();
      if (Array.isArray(promoData)) setPromoCodes(promoData);
    } catch {}
    try {
      const settingsRes = await fetch('/api/admin/settings');
      const settingsData = await settingsRes.json();
      if (settingsData) setShopSettings(settingsData);
    } catch {}
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
      if (!cancelled) {
        try {
          const catRes = await fetch('/api/admin/categories');
          const catData = await catRes.json();
          if (Array.isArray(catData)) setCategories(catData);
        } catch {}
      }
      if (!cancelled) {
        try {
          const salesRes = await fetch('/api/admin/sales');
          const salesData = await salesRes.json();
          if (Array.isArray(salesData)) setSales(salesData);
        } catch {}
      }
      if (!cancelled) {
        try {
          const promoRes = await fetch('/api/admin/promo-codes');
          const promoData = await promoRes.json();
          if (Array.isArray(promoData)) setPromoCodes(promoData);
        } catch {}
      }
      if (!cancelled) {
        try {
          const settingsRes = await fetch('/api/admin/settings');
          const settingsData = await settingsRes.json();
          if (settingsData) setShopSettings(settingsData);
        } catch {}
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

  const getStockColor = (stock: number) => {
    if (stock === 0) return 'text-red-600 bg-red-50';
    if (stock < 10) return 'text-amber-600 bg-amber-50';
    return 'text-green-600 bg-green-50';
  };

  const getSaleStatus = (sale: Sale) => {
    const now = new Date();
    const start = new Date(sale.startDate);
    const end = new Date(sale.endDate);
    if (!sale.isActive) return { label: 'Inactive', color: 'bg-gray-100 text-gray-600' };
    if (now < start) return { label: 'Scheduled', color: 'bg-blue-100 text-blue-700' };
    if (now > end) return { label: 'Expired', color: 'bg-gray-100 text-gray-600' };
    return { label: 'Active', color: 'bg-green-100 text-green-700' };
  };

  const getPromoStatus = (promo: PromoCode) => {
    if (!promo.isValid) return { label: 'Disabled', color: 'bg-gray-100 text-gray-600' };
    if (promo.maxUses > 0 && promo.currentUses >= promo.maxUses) return { label: 'Exhausted', color: 'bg-orange-100 text-orange-700' };
    if (promo.expiresAt && new Date(promo.expiresAt) < new Date()) return { label: 'Expired', color: 'bg-red-100 text-red-700' };
    return { label: 'Active', color: 'bg-green-100 text-green-700' };
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const formatDateTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
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

  // --- Category Handlers ---
  const openCategoryModal = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setCategoryForm({ name: category.name, description: category.description || '', image: category.image || '' });
    } else {
      setEditingCategory(null);
      setCategoryForm({ name: '', description: '', image: '' });
    }
    setIsCategoryModalOpen(true);
  };

  const handleCategorySave = async () => {
    if (!categoryForm.name.trim()) { toast('Category name is required', 'error'); return; }
    setCategorySaving(true);
    try {
      if (editingCategory) {
        const res = await fetch(`/api/admin/categories/${editingCategory.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(categoryForm),
        });
        if (res.ok) {
          toast('Category updated');
          setIsCategoryModalOpen(false);
          fetchCategories();
        } else {
          const data = await res.json();
          toast(data.error || 'Failed to update category', 'error');
        }
      } else {
        const res = await fetch('/api/admin/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(categoryForm),
        });
        if (res.ok) {
          toast('Category created');
          setIsCategoryModalOpen(false);
          fetchCategories();
        } else {
          const data = await res.json();
          toast(data.error || 'Failed to create category', 'error');
        }
      }
    } catch {
      toast('Failed to save category', 'error');
    }
    setCategorySaving(false);
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/categories/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast('Category deleted');
        setConfirmDelete(null);
        fetchCategories();
      } else {
        toast('Failed to delete category', 'error');
      }
    } catch {
      toast('Failed to delete category', 'error');
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/admin/categories');
      const data = await res.json();
      if (Array.isArray(data)) setCategories(data);
    } catch {}
  };

  // --- Product Handlers ---
  const openProductModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      // Parse tags from badge field (JSON array) or keep as plain badge
      let parsedTags: string[] = [];
      let badgeText = product.badge || '';
      if (badgeText.startsWith('[')) {
        try {
          parsedTags = JSON.parse(badgeText);
          badgeText = '';
        } catch { /* not valid JSON, keep as-is */ }
      }
      setProductForm({
        name: product.name,
        price: String(product.price),
        category: product.category,
        image: product.image,
        imageMode: 'url',
        images: product.images ? JSON.parse(product.images) : [],
        imageGalleryMode: 'url',
        description: product.description,
        ingredients: product.ingredients || '',
        colors: product.colors ? JSON.parse(product.colors) : [],
        badge: badgeText,
        tags: parsedTags,
        stock: String(product.stock),
        discountPercentage: String(product.discountPercentage || 0),
      });
    } else {
      setEditingProduct(null);
      setProductForm({ name: '', price: '', category: 'Makeup', image: '', imageMode: 'url', images: [], imageGalleryMode: 'url', description: '', ingredients: '', colors: [], badge: '', tags: [], stock: '50', discountPercentage: '0' });
    }
    setIsProductModalOpen(true);
  };

  const closeProductModal = () => setIsProductModalOpen(false);

  const handleProductImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setProductUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/admin/upload', { method: 'POST', body: formData });
      if (res.ok) {
        const data = await res.json();
        setProductForm(prev => ({ ...prev, image: data.url }));
        toast('Image uploaded');
      } else {
        toast('Failed to upload image', 'error');
      }
    } catch {
      toast('Failed to upload image', 'error');
    }
    setProductUploading(false);
    if (productImageInputRef.current) productImageInputRef.current.value = '';
  };

  const handleGalleryImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setProductUploading(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const formData = new FormData();
        formData.append('file', files[i]);
        const res = await fetch('/api/admin/upload', { method: 'POST', body: formData });
        if (res.ok) {
          const data = await res.json();
          setProductForm(prev => ({ ...prev, images: [...prev.images, data.url] }));
        }
      }
      toast('Gallery images uploaded');
    } catch {
      toast('Failed to upload images', 'error');
    }
    setProductUploading(false);
    if (galleryImageInputRef.current) galleryImageInputRef.current.value = '';
  };

  const removeGalleryImage = (index: number) => {
    setProductForm(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
  };

  const addGalleryImageUrl = () => {
    const url = prompt('Enter image URL:');
    if (url && url.trim()) {
      setProductForm(prev => ({ ...prev, images: [...prev.images, url.trim()] }));
    }
  };

  const handleProductSave = async () => {
    if (!productForm.name.trim() || !productForm.price) { toast('Name and price are required', 'error'); return; }
    setProductSaving(true);
    try {
      const payload = {
        ...productForm,
        discountPercentage: parseFloat(productForm.discountPercentage) || 0,
        colors: productForm.colors.length > 0 ? JSON.stringify(productForm.colors) : null,
        images: productForm.images.length > 0 ? JSON.stringify(productForm.images) : null,
        // If tags are selected, store as JSON array in badge; otherwise keep badge as plain text
        badge: productForm.tags.length > 0 ? JSON.stringify(productForm.tags) : (productForm.badge || null),
      };
      // Remove non-payload fields
      const { imageMode, imageGalleryMode, tags, ...data } = payload;
      if (editingProduct) {
        const res = await fetch(`/api/admin/products/${editingProduct.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        if (res.ok) {
          toast('Product updated');
          closeProductModal();
          fetchData();
        } else {
          toast('Failed to update product', 'error');
        }
      } else {
        const res = await fetch('/api/admin/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
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

  const toggleProductTag = (tag: string) => {
    setProductForm(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag],
    }));
  };

  const toggleProductColor = (color: string) => {
    setProductForm(prev => ({
      ...prev,
      colors: prev.colors.includes(color)
        ? prev.colors.filter(c => c !== color)
        : [...prev.colors, color],
    }));
  };

  // --- Sale Handlers ---
  const openSaleModal = (sale?: Sale) => {
    if (sale) {
      setEditingSale(sale);
      setSaleForm({
        name: sale.name,
        description: sale.description || '',
        startDate: sale.startDate ? new Date(sale.startDate).toISOString().slice(0, 16) : '',
        endDate: sale.endDate ? new Date(sale.endDate).toISOString().slice(0, 16) : '',
        isActive: sale.isActive,
        categoryDiscounts: sale.categories.map(c => ({ categoryName: c.categoryName, discountPercentage: String(c.discountPercentage) })),
      });
    } else {
      setEditingSale(null);
      setSaleForm({ name: '', description: '', startDate: '', endDate: '', isActive: false, categoryDiscounts: [] });
    }
    setIsSaleModalOpen(true);
  };

  const addSaleCategory = () => {
    setSaleForm(prev => ({ ...prev, categoryDiscounts: [...prev.categoryDiscounts, { categoryName: '', discountPercentage: '' }] }));
  };

  const removeSaleCategory = (index: number) => {
    setSaleForm(prev => ({ ...prev, categoryDiscounts: prev.categoryDiscounts.filter((_, i) => i !== index) }));
  };

  const updateSaleCategory = (index: number, field: 'categoryName' | 'discountPercentage', value: string) => {
    setSaleForm(prev => ({
      ...prev,
      categoryDiscounts: prev.categoryDiscounts.map((c, i) => i === index ? { ...c, [field]: value } : c),
    }));
  };

  const handleSaleSave = async () => {
    if (!saleForm.name.trim()) { toast('Sale name is required', 'error'); return; }
    if (!saleForm.startDate || !saleForm.endDate) { toast('Start and end dates are required', 'error'); return; }
    setSaleSaving(true);
    try {
      const payload = {
        ...saleForm,
        categories: saleForm.categoryDiscounts.map(c => ({
          categoryName: c.categoryName,
          discountPercentage: parseFloat(c.discountPercentage) || 0,
        })),
      };
      if (editingSale) {
        const res = await fetch(`/api/admin/sales/${editingSale.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          toast('Sale updated');
          setIsSaleModalOpen(false);
          fetchSales();
        } else {
          toast('Failed to update sale', 'error');
        }
      } else {
        const res = await fetch('/api/admin/sales', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          toast('Sale created');
          setIsSaleModalOpen(false);
          fetchSales();
        } else {
          toast('Failed to create sale', 'error');
        }
      }
    } catch {
      toast('Failed to save sale', 'error');
    }
    setSaleSaving(false);
  };

  const handleDeleteSale = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/sales/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast('Sale deleted');
        setConfirmDelete(null);
        fetchSales();
      } else {
        toast('Failed to delete sale', 'error');
      }
    } catch {
      toast('Failed to delete sale', 'error');
    }
  };

  const fetchSales = async () => {
    try {
      const res = await fetch('/api/admin/sales');
      const data = await res.json();
      if (Array.isArray(data)) setSales(data);
    } catch {}
  };

  // --- Promo Code Handlers ---
  const openPromoModal = (promo?: PromoCode) => {
    if (promo) {
      setEditingPromo(promo);
      setPromoForm({
        code: promo.code,
        discountType: promo.discountType,
        discountValue: String(promo.discountValue),
        minOrderAmount: String(promo.minOrderAmount),
        maxUses: String(promo.maxUses),
        isValid: promo.isValid,
        expiresAt: promo.expiresAt ? new Date(promo.expiresAt).toISOString().slice(0, 16) : '',
        saleId: promo.saleId || '',
      });
    } else {
      setEditingPromo(null);
      setPromoForm({ code: '', discountType: 'percentage', discountValue: '', minOrderAmount: '0', maxUses: '0', isValid: true, expiresAt: '', saleId: '' });
    }
    setIsPromoModalOpen(true);
  };

  const handlePromoSave = async () => {
    if (!promoForm.code.trim()) { toast('Promo code is required', 'error'); return; }
    if (!promoForm.discountValue) { toast('Discount value is required', 'error'); return; }
    setPromoSaving(true);
    try {
      const payload = {
        ...promoForm,
        discountValue: parseFloat(promoForm.discountValue),
        minOrderAmount: parseFloat(promoForm.minOrderAmount) || 0,
        maxUses: parseInt(promoForm.maxUses) || 0,
        saleId: promoForm.saleId || null,
        expiresAt: promoForm.expiresAt ? new Date(promoForm.expiresAt).toISOString() : null,
      };
      if (editingPromo) {
        const res = await fetch(`/api/admin/promo-codes/${editingPromo.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          toast('Promo code updated');
          setIsPromoModalOpen(false);
          fetchPromoCodes();
        } else {
          toast('Failed to update promo code', 'error');
        }
      } else {
        const res = await fetch('/api/admin/promo-codes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          toast('Promo code created');
          setIsPromoModalOpen(false);
          fetchPromoCodes();
        } else {
          toast('Failed to create promo code', 'error');
        }
      }
    } catch {
      toast('Failed to save promo code', 'error');
    }
    setPromoSaving(false);
  };

  const handleDeletePromo = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/promo-codes/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast('Promo code deleted');
        setConfirmDelete(null);
        fetchPromoCodes();
      } else {
        toast('Failed to delete promo code', 'error');
      }
    } catch {
      toast('Failed to delete promo code', 'error');
    }
  };

  const fetchPromoCodes = async () => {
    try {
      const res = await fetch('/api/admin/promo-codes');
      const data = await res.json();
      if (Array.isArray(data)) setPromoCodes(data);
    } catch {}
  };

  // --- Settings Handlers ---
  const handleSettingsSave = async () => {
    if (!shopSettings) return;
    setSettingsSaving(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shopName: shopSettings.shopName,
          logoUrl: shopSettings.logoUrl,
          faviconUrl: shopSettings.faviconUrl,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setShopSettings(data);
        toast('Settings saved');
      } else {
        toast('Failed to save settings', 'error');
      }
    } catch {
      toast('Failed to save settings', 'error');
    }
    setSettingsSaving(false);
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'logo');
      const res = await fetch('/api/admin/settings', { method: 'POST', body: formData });
      if (res.ok) {
        const data = await res.json();
        if (data.settings) setShopSettings(data.settings);
        toast('Logo uploaded');
      } else {
        toast('Failed to upload logo', 'error');
      }
    } catch {
      toast('Failed to upload logo', 'error');
    }
    setLogoUploading(false);
    if (logoInputRef.current) logoInputRef.current.value = '';
  };

  const handleFaviconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFaviconUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'favicon');
      const res = await fetch('/api/admin/settings', { method: 'POST', body: formData });
      if (res.ok) {
        const data = await res.json();
        if (data.settings) setShopSettings(data.settings);
        toast('Favicon uploaded');
      } else {
        toast('Failed to upload favicon', 'error');
      }
    } catch {
      toast('Failed to upload favicon', 'error');
    }
    setFaviconUploading(false);
    if (faviconInputRef.current) faviconInputRef.current.value = '';
  };

  // All unique categories from products + custom categories
  const allCategories = [...new Set([
    ...categories.map(c => c.name),
    ...products.map(p => p.category),
    ...['Makeup', 'Skincare', 'Haircare', 'Perfume'],
  ])].sort();

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

  const filteredProducts = products.filter((p) => {
    const matchCategory = productCategoryFilter === 'All' || p.category === productCategoryFilter;
    const matchSearch = !productSearch || p.name.toLowerCase().includes(productSearch.toLowerCase());
    let matchStock = true;
    if (productStockFilter === 'In Stock') matchStock = p.stock > 0;
    else if (productStockFilter === 'Low Stock') matchStock = p.stock > 0 && p.stock < 10;
    else if (productStockFilter === 'Out of Stock') matchStock = p.stock === 0;
    return matchCategory && matchSearch && matchStock;
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
    { key: 'sales' as const, label: 'Sales', icon: Percent },
    { key: 'promo-codes' as const, label: 'Promo Codes', icon: Ticket },
    { key: 'settings' as const, label: 'Settings', icon: Settings },
  ];

  const inputClass = "w-full px-4 py-3 rounded-lg bg-[#fef5f1] border border-[#f5e6e0]/80 text-[#8b6f63] focus:outline-none focus:ring-2 focus:ring-[#d4a5a5]";
  const inputClassSm = "w-full px-3 py-2 rounded-lg bg-[#fef5f1] border border-[#f5e6e0]/80 text-[#8b6f63] focus:outline-none focus:ring-2 focus:ring-[#d4a5a5] text-sm";
  const btnPrimary = "px-4 py-2.5 bg-[#d4a5a5] text-white rounded-full hover:bg-[#c89a9a] transition-colors text-sm flex items-center justify-center gap-1.5 disabled:opacity-60";
  const btnOutline = "px-4 py-2.5 border border-[#f5e6e0] text-[#8b6f63] rounded-full hover:bg-[#fef5f1] transition-colors text-sm";
  const sectionClass = "bg-white rounded-lg shadow-sm p-6";

  return (
    <div className="min-h-screen bg-[#fef5f1]">
      {/* Header */}
      <div className="bg-white border-b border-[#f5e6e0]">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => navigate('home')} className="p-2 hover:bg-[#fef5f1] rounded-full transition-colors">
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
            <button onClick={() => navigate('home')} className="px-4 py-2 bg-[#d4a5a5] text-white rounded-full hover:bg-[#c89a9a] transition-colors text-sm">
              View Store
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-sm p-2 mb-8 flex gap-2 overflow-x-auto">
          {tabs.map((tab) => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-5 py-3 rounded-lg text-sm whitespace-nowrap transition-colors ${
                activeTab === tab.key ? 'bg-[#d4a5a5] text-white' : 'text-[#8b6f63] hover:bg-[#fef5f1]'
              }`}>
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* ===== OVERVIEW TAB ===== */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: 'Total Revenue', value: stats.totalRevenue, icon: DollarSign, demoTrend: 12.5, prefix: '$', gradient: 'from-[#f5e6e0] to-[#fef5f1]', iconBg: 'bg-[#d4a5a5]/15', iconColor: 'text-[#c48a8a]' },
                { label: 'Total Orders', value: stats.totalOrders, icon: ShoppingCart, demoTrend: 8.3, prefix: '', gradient: 'from-[#e8f0e8] to-[#f0f7f0]', iconBg: 'bg-green-100', iconColor: 'text-green-600' },
                { label: 'Total Customers', value: stats.totalCustomers, icon: Users, demoTrend: 15.2, prefix: '', gradient: 'from-[#e8ecf5] to-[#f0f3fa]', iconBg: 'bg-[#c4b5d4]/15', iconColor: 'text-[#9b7fb8]' },
                { label: 'Total Products', value: stats.totalProducts, icon: Package, demoTrend: 0, prefix: '', gradient: 'from-[#f5f0e6] to-[#faf6ed]', iconBg: 'bg-amber-100', iconColor: 'text-amber-600' },
              ].map((stat, idx) => (
                <motion.div key={stat.label}
                  className={`relative bg-gradient-to-br ${stat.gradient} rounded-xl p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-default overflow-hidden`}
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.08 }}>
                  <div className="absolute top-0 right-0 w-24 h-24 opacity-[0.07]">
                    <stat.icon className="w-full h-full" strokeWidth={1} />
                  </div>
                  <div className="relative">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-12 h-12 ${stat.iconBg} rounded-xl flex items-center justify-center`}
                        style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                        <stat.icon className={stat.iconColor} size={22} />
                      </div>
                      {stat.demoTrend > 0 ? (
                        <span className="text-sm text-green-600 flex items-center gap-1 font-medium">
                          <TrendingUp size={14} />+{stat.demoTrend}%
                        </span>
                      ) : (
                        <span className="text-sm text-[#8b6f63]/50 flex items-center gap-1 font-medium">
                          <Minus size={14} />Stable
                        </span>
                      )}
                    </div>
                    <p className="text-2xl font-bold text-[#8b6f63] mb-1 tracking-tight">
                      {stat.prefix}{typeof stat.value === 'number' && stat.label.includes('Revenue')
                        ? stat.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                        : stat.value.toLocaleString()}
                    </p>
                    <p className="text-sm text-[#8b6f63]/60 font-medium">{stat.label}</p>
                  </div>
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
                    <thead><tr className="border-b border-[#8b6f63]/20">
                      <th className="text-left py-3 px-4 text-sm text-[#8b6f63]">Order ID</th>
                      <th className="text-left py-3 px-4 text-sm text-[#8b6f63]">Customer</th>
                      <th className="text-left py-3 px-4 text-sm text-[#8b6f63]">Date</th>
                      <th className="text-left py-3 px-4 text-sm text-[#8b6f63]">Total</th>
                      <th className="text-left py-3 px-4 text-sm text-[#8b6f63]">Status</th>
                      <th className="text-left py-3 px-4 text-sm text-[#8b6f63]">Actions</th>
                    </tr></thead>
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
                  <thead><tr className="border-b border-[#8b6f63]/20">
                    <th className="text-left py-3 px-4 text-sm text-[#8b6f63]">Name</th>
                    <th className="text-left py-3 px-4 text-sm text-[#8b6f63]">Email</th>
                    <th className="text-left py-3 px-4 text-sm text-[#8b6f63]">Orders</th>
                    <th className="text-left py-3 px-4 text-sm text-[#8b6f63]">Total Spent</th>
                    <th className="text-left py-3 px-4 text-sm text-[#8b6f63]">Joined</th>
                  </tr></thead>
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
          <div className={sectionClass}>
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
              <h2 className="text-xl font-serif text-[#8b6f63]">All Orders</h2>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
                <div className="relative flex-1 md:flex-none">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8b6f63]/50" size={18} />
                  <input type="text" placeholder="Search orders..." value={orderSearch} onChange={(e) => setOrderSearch(e.target.value)}
                    className="pl-10 pr-4 py-2 bg-[#fef5f1] rounded-full text-sm text-[#8b6f63] focus:outline-none focus:ring-2 focus:ring-[#d4a5a5] w-full md:w-64" />
                </div>
                <select value={orderStatusFilter} onChange={(e) => setOrderStatusFilter(e.target.value)}
                  className="px-4 py-2 bg-[#fef5f1] rounded-full text-sm text-[#8b6f63] focus:outline-none focus:ring-2 focus:ring-[#d4a5a5]">
                  <option>All</option><option>Pending</option><option>Processing</option><option>In Transit</option><option>Delivered</option><option>Cancelled</option>
                </select>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead><tr className="border-b border-[#8b6f63]/20">
                  <th className="text-left py-3 px-4 text-sm text-[#8b6f63]">Order ID</th>
                  <th className="text-left py-3 px-4 text-sm text-[#8b6f63]">Customer</th>
                  <th className="text-left py-3 px-4 text-sm text-[#8b6f63]">Date</th>
                  <th className="text-left py-3 px-4 text-sm text-[#8b6f63]">Items</th>
                  <th className="text-left py-3 px-4 text-sm text-[#8b6f63]">Total</th>
                  <th className="text-left py-3 px-4 text-sm text-[#8b6f63]">Status</th>
                  <th className="text-left py-3 px-4 text-sm text-[#8b6f63]">Actions</th>
                </tr></thead>
                <tbody>
                  {filteredOrders.length === 0 ? (
                    <tr><td colSpan={7} className="text-center py-8 text-[#8b6f63]/60">No orders found</td></tr>
                  ) : filteredOrders.map((order) => (
                    <tr key={order.id} className="border-b border-[#8b6f63]/10 hover:bg-[#fef5f1] transition-colors">
                      <td className="py-3 px-4 text-sm text-[#8b6f63] font-medium">#{order.orderNumber}</td>
                      <td className="py-3 px-4 text-sm text-[#8b6f63]">{order.firstName} {order.lastName}</td>
                      <td className="py-3 px-4 text-sm text-[#8b6f63]/70">{new Date(order.createdAt).toLocaleDateString()}</td>
                      <td className="py-3 px-4 text-sm text-[#8b6f63]">{order.orderItems?.length || 0}</td>
                      <td className="py-3 px-4 text-sm text-[#8b6f63]">${order.total.toFixed(2)}</td>
                      <td className="py-3 px-4"><span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>{order.status}</span></td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1">
                          <button onClick={() => setShowOrderDetail(order)} className="p-1.5 text-[#8b6f63] hover:text-[#d4a5a5] hover:bg-[#fef5f1] rounded-lg transition-colors"><Eye size={16} /></button>
                          <button onClick={() => { setShowOrderStatusModal(order); setNewOrderStatus(order.status); }} className="p-1.5 text-[#8b6f63] hover:text-[#d4a5a5] hover:bg-[#fef5f1] rounded-lg transition-colors"><Edit3 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ===== PRODUCTS TAB ===== */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            {/* Categories Management */}
            <div className={sectionClass}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-serif text-[#8b6f63]">Categories</h2>
                  <p className="text-sm text-[#8b6f63]/70 mt-1">{categories.length} custom categories</p>
                </div>
                <button onClick={() => openCategoryModal()} className={btnPrimary}>
                  <Plus size={16} /> Add Category
                </button>
              </div>
              {categories.length === 0 ? (
                <p className="text-center text-[#8b6f63]/60 py-6">No custom categories yet. Products use default categories (Makeup, Skincare, Haircare, Perfume).</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <div key={cat.id} className="flex items-center gap-2 px-4 py-2 bg-[#fef5f1] rounded-full border border-[#f5e6e0]/80">
                      <Tag size={14} className="text-[#d4a5a5]" />
                      <span className="text-sm text-[#8b6f63] font-medium">{cat.name}</span>
                      <button onClick={() => openCategoryModal(cat)} className="text-[#8b6f63]/40 hover:text-[#d4a5a5] transition-colors" title="Edit"><Edit3 size={14} /></button>
                      <button onClick={() => setConfirmDelete({ type: 'category', id: cat.id, name: cat.name })} className="text-[#8b6f63]/40 hover:text-red-500 transition-colors" title="Delete"><Trash2 size={14} /></button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Products List */}
            <div className={sectionClass}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-serif text-[#8b6f63]">Products</h2>
                <button onClick={() => openProductModal()} className={btnPrimary}>
                  <Plus size={16} /> Add Product
                </button>
              </div>

              {/* Filters */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6">
                <div className="relative flex-1 sm:flex-none">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8b6f63]/50" size={18} />
                  <input type="text" placeholder="Search products..." value={productSearch} onChange={(e) => setProductSearch(e.target.value)}
                    className="pl-10 pr-4 py-2 bg-[#fef5f1] rounded-full text-sm text-[#8b6f63] focus:outline-none focus:ring-2 focus:ring-[#d4a5a5] w-full sm:w-64" />
                </div>
                <div className="flex items-center gap-2">
                  <Filter size={16} className="text-[#8b6f63]/50" />
                  <select value={productCategoryFilter} onChange={(e) => setProductCategoryFilter(e.target.value)}
                    className="px-3 py-2 bg-[#fef5f1] rounded-full text-sm text-[#8b6f63] focus:outline-none focus:ring-2 focus:ring-[#d4a5a5]">
                    <option value="All">All Categories</option>
                    {allCategories.map(c => <option key={c}>{c}</option>)}
                  </select>
                  <select value={productStockFilter} onChange={(e) => setProductStockFilter(e.target.value)}
                    className="px-3 py-2 bg-[#fef5f1] rounded-full text-sm text-[#8b6f63] focus:outline-none focus:ring-2 focus:ring-[#d4a5a5]">
                    <option value="All">All Stock</option>
                    <option value="In Stock">In Stock</option>
                    <option value="Low Stock">Low Stock (&lt;10)</option>
                    <option value="Out of Stock">Out of Stock</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {filteredProducts.length === 0 ? (
                  <p className="text-center text-[#8b6f63]/60 py-8">No products found</p>
                ) : filteredProducts.map((product) => (
                  <div key={product.id} className="flex items-center gap-4 p-4 border border-[#8b6f63]/20 rounded-lg hover:bg-[#fef5f1] transition-colors">
                    <div className="w-16 h-16 bg-[#fef5f1] rounded-lg overflow-hidden flex-shrink-0">
                      <img src={product.image} alt={product.name} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-[#8b6f63] font-medium truncate">{product.name}</h3>
                        {product.badge && <span className="px-2 py-0.5 bg-[#d4a5a5] text-white text-xs rounded-full">{product.badge}</span>}
                        <span className="px-2 py-0.5 bg-[#fef5f1] text-[#8b6f63]/70 text-xs rounded-full">{product.category}</span>
                        {product.discountPercentage > 0 && (
                          <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">-{product.discountPercentage}%</span>
                        )}
                      </div>
                      <p className="text-sm text-[#8b6f63]/70 mt-1">
                        ${product.price.toFixed(2)} · <span className={product.stock < 10 ? 'text-red-500 font-medium' : ''}>Stock: {product.stock}</span> · Sales: {product.sales}
                      </p>
                      {product.colors && (
                        <div className="flex items-center gap-1 mt-2">
                          <Palette size={12} className="text-[#8b6f63]/40" />
                          {JSON.parse(product.colors).map((color: string, i: number) => (
                            <span key={i} className="w-4 h-4 rounded-full border border-gray-200" style={{ backgroundColor: color }} />
                          ))}
                        </div>
                      )}
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ${getStockColor(product.stock)}`}>
                      {product.stock === 0 ? 'Out of Stock' : product.stock < 10 ? 'Low Stock' : 'In Stock'}
                    </span>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button onClick={() => openProductModal(product)} className="p-2 text-[#8b6f63] hover:text-[#d4a5a5] hover:bg-[#fef5f1] rounded-lg transition-colors" title="Edit"><Edit3 size={18} /></button>
                      <button onClick={() => setConfirmDelete({ type: 'product', id: product.id, name: product.name })} className="p-2 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete"><Trash2 size={18} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ===== CUSTOMERS TAB ===== */}
        {activeTab === 'customers' && (
          <div className={sectionClass}>
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
              <h2 className="text-xl font-serif text-[#8b6f63]">Customers</h2>
              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8b6f63]/50" size={18} />
                <input type="text" placeholder="Search customers..." value={customerSearch} onChange={(e) => setCustomerSearch(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-[#fef5f1] rounded-full text-sm text-[#8b6f63] focus:outline-none focus:ring-2 focus:ring-[#d4a5a5] w-full" />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead><tr className="border-b border-[#8b6f63]/20">
                  <th className="text-left py-3 px-4 text-sm text-[#8b6f63]">Name</th>
                  <th className="text-left py-3 px-4 text-sm text-[#8b6f63]">Email</th>
                  <th className="text-left py-3 px-4 text-sm text-[#8b6f63]">Role</th>
                  <th className="text-left py-3 px-4 text-sm text-[#8b6f63]">Orders</th>
                  <th className="text-left py-3 px-4 text-sm text-[#8b6f63]">Total Spent</th>
                  <th className="text-left py-3 px-4 text-sm text-[#8b6f63]">Joined</th>
                  <th className="text-left py-3 px-4 text-sm text-[#8b6f63]">Actions</th>
                </tr></thead>
                <tbody>
                  {filteredCustomers.length === 0 ? (
                    <tr><td colSpan={7} className="text-center py-8 text-[#8b6f63]/60">No customers found</td></tr>
                  ) : filteredCustomers.map((c) => (
                    <tr key={c.id} className="border-b border-[#8b6f63]/10 hover:bg-[#fef5f1] transition-colors">
                      <td className="py-3 px-4 text-sm text-[#8b6f63] font-medium">{c.name}</td>
                      <td className="py-3 px-4 text-sm text-[#8b6f63]/70">{c.email}</td>
                      <td className="py-3 px-4"><span className={`px-2 py-0.5 rounded-full text-xs ${c.role === 'admin' ? 'bg-[#d4a5a5] text-white' : 'bg-gray-100 text-gray-600'}`}>{c.role}</span></td>
                      <td className="py-3 px-4 text-sm text-[#8b6f63]">{c.orderCount}</td>
                      <td className="py-3 px-4 text-sm text-[#8b6f63]">${c.totalSpent.toFixed(2)}</td>
                      <td className="py-3 px-4 text-sm text-[#8b6f63]/70">{new Date(c.createdAt).toLocaleDateString()}</td>
                      <td className="py-3 px-4">
                        {c.role !== 'admin' ? (
                          <button onClick={() => setConfirmDelete({ type: 'customer', id: c.id, name: c.name })} className="p-1.5 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete"><Trash2 size={16} /></button>
                        ) : <span className="text-xs text-[#8b6f63]/40">—</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ===== SALES TAB ===== */}
        {activeTab === 'sales' && (
          <div className="space-y-6">
            <div className={sectionClass}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-serif text-[#8b6f63]">Sales & Discounts</h2>
                  <p className="text-sm text-[#8b6f63]/70 mt-1">{sales.length} sale{sales.length !== 1 ? 's' : ''} configured</p>
                </div>
                <button onClick={() => openSaleModal()} className={btnPrimary}>
                  <Plus size={16} /> Create Sale
                </button>
              </div>
              {sales.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-20 h-20 bg-[#fef5f1] rounded-2xl flex items-center justify-center mx-auto mb-5">
                    <Sparkles size={36} className="text-[#d4a5a5]/50" />
                  </div>
                  <p className="text-lg font-serif text-[#8b6f63]/70 mb-1">No sales created yet</p>
                  <p className="text-sm text-[#8b6f63]/40 mb-6">Create your first sale to manage category discounts</p>
                  <button onClick={() => openSaleModal()} className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#d4a5a5] text-white rounded-full hover:bg-[#c89a9a] transition-colors text-sm font-medium">
                    <Plus size={16} /> Create Your First Sale
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {sales.map((sale) => {
                    const status = getSaleStatus(sale);
                    const now = new Date();
                    const start = new Date(sale.startDate);
                    const end = new Date(sale.endDate);
                    const totalDuration = end.getTime() - start.getTime();
                    const elapsed = now.getTime() - start.getTime();
                    const progress = totalDuration > 0 ? Math.min(100, Math.max(0, (elapsed / totalDuration) * 100)) : 0;
                    return (
                      <motion.div key={sale.id} className="p-5 border border-[#8b6f63]/15 rounded-xl hover:bg-[#fef5f1]/60 hover:shadow-sm transition-all"
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 flex-wrap">
                              <h3 className="text-[#8b6f63] font-semibold text-lg">{sale.name}</h3>
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${status.color}`}>{status.label}</span>
                            </div>
                            {sale.description && <p className="text-sm text-[#8b6f63]/70 mt-1">{sale.description}</p>}
                            <div className="flex items-center gap-4 mt-3 text-xs text-[#8b6f63]/50">
                              <span className="flex items-center gap-1.5"><Calendar size={13} /> {formatDate(sale.startDate)} — {formatDate(sale.endDate)}</span>
                              <span className="flex items-center gap-1.5"><Layers size={13} /> {sale.categories.length} categor{sale.categories.length !== 1 ? 'ies' : 'y'}</span>
                              <span className="flex items-center gap-1.5"><Ticket size={13} /> {sale.promoCodes.length} promo code{sale.promoCodes.length !== 1 ? 's' : ''}</span>
                            </div>
                            {/* Sale Period Progress Bar */}
                            <div className="mt-3">
                              <div className="flex items-center justify-between text-xs text-[#8b6f63]/40 mb-1">
                                <span>Sale Period</span>
                                <span>{Math.round(progress)}%</span>
                              </div>
                              <div className="w-full h-1.5 bg-[#f5e6e0] rounded-full overflow-hidden">
                                <motion.div
                                  className={`h-full rounded-full ${status.label === 'Active' ? 'bg-[#d4a5a5]' : status.label === 'Expired' ? 'bg-gray-400' : 'bg-[#d4a5a5]/40'}`}
                                  initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 0.8, ease: 'easeOut' }}
                                />
                              </div>
                            </div>
                            {sale.categories.length > 0 && (
                              <div className="flex flex-wrap gap-2 mt-3">
                                {sale.categories.map((cat) => (
                                  <span key={cat.id} className="px-3 py-1.5 bg-[#fef5f1] rounded-full text-xs text-[#8b6f63] border border-[#f5e6e0]/80">
                                    <Tag size={10} className="inline mr-1 text-[#d4a5a5]" />
                                    {cat.categoryName}: <span className="font-semibold text-[#d4a5a5]">{cat.discountPercentage}%</span> off
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <button onClick={() => openSaleModal(sale)} className="p-2 text-[#8b6f63] hover:text-[#d4a5a5] hover:bg-[#fef5f1] rounded-lg transition-colors" title="Edit"><Edit3 size={18} /></button>
                            <button onClick={() => setConfirmDelete({ type: 'sale', id: sale.id, name: sale.name })} className="p-2 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete"><Trash2 size={18} /></button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ===== PROMO CODES TAB ===== */}
        {activeTab === 'promo-codes' && (
          <div className={sectionClass}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-serif text-[#8b6f63]">Promo Codes</h2>
                <p className="text-sm text-[#8b6f63]/70 mt-1">{promoCodes.length} promo code{promoCodes.length !== 1 ? 's' : ''} configured</p>
              </div>
              <button onClick={() => openPromoModal()} className={btnPrimary}>
                <Plus size={16} /> Create Promo Code
              </button>
            </div>
            {promoCodes.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-[#fef5f1] rounded-2xl flex items-center justify-center mx-auto mb-5">
                  <Ticket size={36} className="text-[#d4a5a5]/50" />
                </div>
                <p className="text-lg font-serif text-[#8b6f63]/70 mb-1">No promo codes created yet</p>
                <p className="text-sm text-[#8b6f63]/40 mb-6">Create promo codes to offer discounts at checkout</p>
                <button onClick={() => openPromoModal()} className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#d4a5a5] text-white rounded-full hover:bg-[#c89a9a] transition-colors text-sm font-medium">
                  <Plus size={16} /> Create Your First Promo Code
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {promoCodes.map((promo) => {
                  const status = getPromoStatus(promo);
                  const usagePercent = promo.maxUses > 0 ? Math.min(100, (promo.currentUses / promo.maxUses) * 100) : 0;
                  const isPercentage = promo.discountType === 'percentage';
                  const daysRemaining = promo.expiresAt
                    ? Math.max(0, Math.ceil((new Date(promo.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
                    : null;
                  return (
                    <motion.div key={promo.id}
                      className={`p-5 border rounded-xl hover:shadow-sm transition-all ${isPercentage ? 'border-[#b8c8e0]/40 bg-gradient-to-br from-white to-[#f0f4fa]/40' : 'border-[#c8e0c8]/40 bg-gradient-to-br from-white to-[#f0faf0]/40'}`}
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2.5 flex-wrap">
                            <span className="text-[#8b6f63] font-mono font-bold tracking-wider text-base">{promo.code}</span>
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${isPercentage ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                              {isPercentage ? `${promo.discountValue}% off` : `$${promo.discountValue} off`}
                            </span>
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${status.color}`}>{status.label}</span>
                          </div>
                          <div className="flex items-center gap-3 mt-2.5 text-xs text-[#8b6f63]/50">
                            {promo.minOrderAmount > 0 && <span>Min: ${promo.minOrderAmount}</span>}
                            {promo.sale && <span className="flex items-center gap-1"><Tag size={11} />{promo.sale.name}</span>}
                          </div>
                          {/* Usage Progress Bar */}
                          {promo.maxUses > 0 && (
                            <div className="mt-3">
                              <div className="flex items-center justify-between text-xs text-[#8b6f63]/40 mb-1">
                                <span>Usage</span>
                                <span>{promo.currentUses}/{promo.maxUses}</span>
                              </div>
                              <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                <motion.div
                                  className={`h-full rounded-full ${usagePercent >= 90 ? 'bg-red-400' : usagePercent >= 70 ? 'bg-amber-400' : 'bg-[#d4a5a5]'}`}
                                  initial={{ width: 0 }} animate={{ width: `${usagePercent}%` }} transition={{ duration: 0.6, ease: 'easeOut' }}
                                />
                              </div>
                            </div>
                          )}
                          {/* Expiry Info */}
                          {promo.expiresAt && (
                            <div className="mt-2.5 flex items-center gap-1.5 text-xs text-[#8b6f63]/50">
                              <Clock size={12} />
                              <span>{formatDate(promo.expiresAt)}</span>
                              {daysRemaining !== null && (
                                <span className={daysRemaining <= 7 ? 'text-amber-600 font-medium' : daysRemaining <= 0 ? 'text-red-500 font-medium' : ''}>
                                  ({daysRemaining === 0 ? 'Expires today' : daysRemaining === 1 ? '1 day left' : `${daysRemaining} days left`})
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <button onClick={() => openPromoModal(promo)} className="p-1.5 text-[#8b6f63]/60 hover:text-[#d4a5a5] hover:bg-[#fef5f1] rounded-lg transition-colors" title="Edit"><Edit3 size={16} /></button>
                          <button onClick={() => setConfirmDelete({ type: 'promo-code', id: promo.id, name: promo.code })} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete"><Trash2 size={16} /></button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ===== SETTINGS TAB ===== */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            {/* Shop Info */}
            <div className={sectionClass}>
              <div className="flex items-center gap-3 mb-6">
                <Store size={20} className="text-[#d4a5a5]" />
                <h2 className="text-xl font-serif text-[#8b6f63]">Shop Information</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#8b6f63] mb-1">Shop Name</label>
                  <input type="text" value={shopSettings?.shopName || ''} onChange={(e) => setShopSettings(prev => prev ? { ...prev, shopName: e.target.value } : prev)}
                    placeholder="Rare Beauty" className={inputClass} />
                </div>
                <button onClick={handleSettingsSave} disabled={settingsSaving} className={btnPrimary}>
                  {settingsSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  Save Settings
                </button>
              </div>
            </div>

            {/* Live Preview */}
            <div className={sectionClass}>
              <div className="flex items-center gap-3 mb-6">
                <Eye size={20} className="text-[#d4a5a5]" />
                <h2 className="text-xl font-serif text-[#8b6f63]">Live Preview</h2>
                <span className="text-xs text-[#8b6f63]/40 ml-auto">How your store looks to visitors</span>
              </div>
              <div className="bg-[#fef5f1] rounded-xl border border-[#f5e6e0]/80 p-6 space-y-6">
                {/* Browser Tab Mock */}
                <div className="space-y-2">
                  <div className="bg-white rounded-t-lg border border-b-0 border-[#f5e6e0]/60 px-3 py-2 flex items-center gap-2">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                      <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                    </div>
                    <div className="flex items-center gap-2 flex-1 ml-3 px-3 py-1 bg-[#fef5f1] rounded-md">
                      {shopSettings?.faviconUrl ? (
                        <img src={shopSettings.faviconUrl} alt="" className="w-3.5 h-3.5 object-contain" />
                      ) : (
                        <Globe size={12} className="text-[#8b6f63]/30" />
                      )}
                      <span className="text-xs text-[#8b6f63]/50 truncate">{shopSettings?.shopName || 'Rare Beauty'}</span>
                    </div>
                  </div>
                  {/* Header Mock */}
                  <div className="bg-white border border-[#f5e6e0]/60 rounded-b-lg px-6 py-4">
                    <div className="flex items-center gap-3">
                      {shopSettings?.logoUrl ? (
                        <img src={shopSettings.logoUrl} alt="Logo" className="h-8 object-contain" />
                      ) : (
                        <div className="h-8 w-20 bg-[#f5e6e0] rounded flex items-center justify-center">
                          <span className="text-xs text-[#8b6f63]/40 font-serif">Logo</span>
                        </div>
                      )}
                      <span className="text-lg font-serif text-[#8b6f63]">{shopSettings?.shopName || 'Rare Beauty'}</span>
                    </div>
                    <div className="flex items-center gap-6 mt-3">
                      {['Shop', 'Makeup', 'Skincare', 'About'].map((item) => (
                        <span key={item} className="text-xs text-[#8b6f63]/50">{item}</span>
                      ))}
                    </div>
                  </div>
                </div>
                {/* Hero Mock */}
                <div className="bg-gradient-to-br from-[#f5e6e0] to-[#fef5f1] rounded-lg p-6 text-center">
                  <p className="text-xs text-[#8b6f63]/40 mb-1">Hero Section Preview</p>
                  <p className="text-sm font-serif text-[#8b6f63]/60">{shopSettings?.shopName || 'Rare Beauty'}</p>
                  <p className="text-xs text-[#8b6f63]/40 mt-1">Discover beauty that feels good</p>
                </div>
              </div>
            </div>

            {/* Logo Upload */}
            <div className={sectionClass}>
              <div className="flex items-center gap-3 mb-6">
                <ImageIcon size={20} className="text-[#d4a5a5]" />
                <h2 className="text-xl font-serif text-[#8b6f63]">Shop Logo</h2>
              </div>
              <div className="flex items-start gap-6">
                <div className="w-32 h-32 bg-[#fef5f1] rounded-xl border-2 border-dashed border-[#f5e6e0] flex items-center justify-center overflow-hidden flex-shrink-0">
                  {shopSettings?.logoUrl ? (
                    <img src={shopSettings.logoUrl} alt="Shop Logo" className="w-full h-full object-contain p-2" />
                  ) : (
                    <div className="text-center">
                      <Image size={24} className="text-[#d4a5a5]/40 mx-auto mb-1" />
                      <span className="text-xs text-[#8b6f63]/40">No logo</span>
                    </div>
                  )}
                </div>
                <div className="flex-1 space-y-3">
                  <p className="text-sm text-[#8b6f63]/70">Upload a logo for your store. Recommended size: 200x60px. Supports PNG, JPG, SVG.</p>
                  <input ref={logoInputRef} type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                  <button onClick={() => logoInputRef.current?.click()} disabled={logoUploading} className={btnOutline}>
                    {logoUploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                    {logoUploading ? 'Uploading...' : 'Upload Logo'}
                  </button>
                  {shopSettings?.logoUrl && (
                    <p className="text-xs text-[#8b6f63]/50 break-all">Current: {shopSettings.logoUrl}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Favicon Upload */}
            <div className={sectionClass}>
              <div className="flex items-center gap-3 mb-6">
                <Globe size={20} className="text-[#d4a5a5]" />
                <h2 className="text-xl font-serif text-[#8b6f63]">Favicon</h2>
              </div>
              <div className="flex items-start gap-6">
                <div className="w-16 h-16 bg-[#fef5f1] rounded-xl border-2 border-dashed border-[#f5e6e0] flex items-center justify-center overflow-hidden flex-shrink-0">
                  {shopSettings?.faviconUrl ? (
                    <img src={shopSettings.faviconUrl} alt="Favicon" className="w-full h-full object-contain p-1" />
                  ) : (
                    <div className="text-center">
                      <Globe size={16} className="text-[#d4a5a5]/40" />
                    </div>
                  )}
                </div>
                <div className="flex-1 space-y-3">
                  <p className="text-sm text-[#8b6f63]/70">Upload a favicon for browser tabs. Recommended size: 32x32px or 64x64px. Supports PNG, ICO.</p>
                  <input ref={faviconInputRef} type="file" accept="image/*" onChange={handleFaviconUpload} className="hidden" />
                  <button onClick={() => faviconInputRef.current?.click()} disabled={faviconUploading} className={btnOutline}>
                    {faviconUploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                    {faviconUploading ? 'Uploading...' : 'Upload Favicon'}
                  </button>
                  {shopSettings?.faviconUrl && (
                    <p className="text-xs text-[#8b6f63]/50 break-all">Current: {shopSettings.faviconUrl}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Accent Color */}
            <div className={sectionClass}>
              <div className="flex items-center gap-3 mb-6">
                <Palette size={20} className="text-[#d4a5a5]" />
                <h2 className="text-xl font-serif text-[#8b6f63]">Accent Color</h2>
              </div>
              <p className="text-sm text-[#8b6f63]/70 mb-4">Customize the accent color used across your store. This is a preview feature.</p>
              <div className="grid grid-cols-6 sm:grid-cols-10 gap-2 mb-4">
                {['#d4a5a5', '#c48a8a', '#e8b4b4', '#b88b8b', '#9b7fb8', '#7c6fa0', '#e6a07a', '#d4885c', '#8baf8b', '#6b946b',
                  '#7ba8c9', '#5c8baf', '#d4a574', '#c4845c', '#c97b7b', '#af5c5c', '#b0b0b0', '#888888', '#666666', '#333333'].map((color) => (
                  <button
                    key={color}
                    onClick={() => toast(`Accent color set to ${color}`, 'success')}
                    className={`w-10 h-10 rounded-lg border-2 transition-all hover:scale-110 ${color === '#d4a5a5' ? 'border-[#8b6f63] scale-105 shadow-md' : 'border-transparent'}`}
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
              <div className="flex items-center gap-3">
                <label className="text-sm text-[#8b6f63]">Custom:</label>
                <input
                  type="color"
                  defaultValue="#d4a5a5"
                  className="w-10 h-10 rounded-lg border border-[#f5e6e0] cursor-pointer p-0.5"
                  onChange={(e) => toast(`Accent color: ${e.target.value}`, 'success')}
                />
                <span className="text-sm text-[#8b6f63]/50 font-mono">#d4a5a5</span>
              </div>
            </div>

            {/* Reset to Defaults */}
            <div className={sectionClass}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <RotateCcw size={20} className="text-[#d4a5a5]" />
                    <h2 className="text-xl font-serif text-[#8b6f63]">Reset to Defaults</h2>
                  </div>
                  <p className="text-sm text-[#8b6f63]/50 ml-8">Restore all settings to their original values</p>
                </div>
                <button
                  onClick={() => {
                    if (shopSettings) {
                      setShopSettings({ ...shopSettings, shopName: 'Rare Beauty' });
                      toast('Settings reset to defaults. Save to apply.', 'success');
                    }
                  }}
                  className="px-4 py-2.5 border border-red-200 text-red-500 rounded-full hover:bg-red-50 hover:border-red-300 transition-colors text-sm flex items-center gap-2"
                >
                  <RotateCcw size={14} />
                  Reset All
                </button>
              </div>
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
                  <div><p className="text-xs text-[#8b6f63]/50 uppercase">Date</p><p className="text-sm text-[#8b6f63]">{formatDateTime(showOrderDetail.createdAt)}</p></div>
                  <div><p className="text-xs text-[#8b6f63]/50 uppercase">Customer</p><p className="text-sm text-[#8b6f63]">{showOrderDetail.firstName} {showOrderDetail.lastName}</p></div>
                  <div><p className="text-xs text-[#8b6f63]/50 uppercase">Email</p><p className="text-sm text-[#8b6f63]">{showOrderDetail.email}</p></div>
                  <div><p className="text-xs text-[#8b6f63]/50 uppercase">Phone</p><p className="text-sm text-[#8b6f63]">{showOrderDetail.phone}</p></div>
                  {showOrderDetail.trackingNumber && <div><p className="text-xs text-[#8b6f63]/50 uppercase">Tracking</p><p className="text-sm text-[#d4a5a5] font-mono">{showOrderDetail.trackingNumber}</p></div>}
                  {showOrderDetail.promoCode && <div><p className="text-xs text-[#8b6f63]/50 uppercase">Promo Code</p><p className="text-sm text-green-600 font-mono">{showOrderDetail.promoCode}</p></div>}
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
                          <div className="flex items-center gap-2">
                            <p className="text-sm text-[#8b6f63] truncate">{item.product?.name || 'Product'}</p>
                            {item.color && item.color !== 'default' && (
                              <span className="w-4 h-4 rounded-full border border-gray-200 flex-shrink-0" style={{ backgroundColor: item.color }} title={item.color} />
                            )}
                          </div>
                          <p className="text-xs text-[#8b6f63]/50">Qty: {item.quantity}{item.originalPrice && item.originalPrice > item.price ? <span className="ml-2 line-through text-[#8b6f63]/30">${item.originalPrice.toFixed(2)}</span> : ''}</p>
                        </div>
                        <p className="text-sm text-[#8b6f63] font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="border-t border-[#8b6f63]/20 pt-4 space-y-1">
                  <div className="flex justify-between text-sm text-[#8b6f63]/70"><span>Subtotal</span><span>${showOrderDetail.subtotal.toFixed(2)}</span></div>
                  {(showOrderDetail as Order).discountTotal > 0 && (
                    <div className="flex justify-between text-sm text-green-600"><span>Discount</span><span>-${(showOrderDetail as Order).discountTotal.toFixed(2)}</span></div>
                  )}
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
              <select value={newOrderStatus} onChange={(e) => setNewOrderStatus(e.target.value)} className={inputClass + ' mb-6'}>
                <option>Pending</option><option>Processing</option><option>In Transit</option><option>Delivered</option><option>Cancelled</option>
              </select>
              <div className="flex gap-3">
                <button onClick={() => setShowOrderStatusModal(null)} className={btnOutline}>Cancel</button>
                <button onClick={handleStatusChange} disabled={saving || newOrderStatus === showOrderStatusModal.status} className={btnPrimary}>
                  {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Update
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== CATEGORY MODAL ===== */}
      <AnimatePresence>
        {isCategoryModalOpen && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsCategoryModalOpen(false)} />
            <motion.div className="relative bg-white rounded-xl shadow-xl p-6 w-full max-w-md" initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-serif text-[#8b6f63]">{editingCategory ? 'Edit Category' : 'Add New Category'}</h3>
                <button onClick={() => setIsCategoryModalOpen(false)} className="text-[#8b6f63]/40 hover:text-[#8b6f63]"><X size={20} /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#8b6f63] mb-1">Category Name</label>
                  <input type="text" value={categoryForm.name} onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })} placeholder="e.g. Bath & Body" required className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#8b6f63] mb-1">Description (optional)</label>
                  <textarea value={categoryForm.description} onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })} placeholder="Brief description of this category" rows={3} className={inputClass + ' resize-none'} />
                </div>
                <div className="flex gap-3 pt-2">
                  <button onClick={() => setIsCategoryModalOpen(false)} className={btnOutline}>Cancel</button>
                  <button onClick={handleCategorySave} disabled={categorySaving} className={btnPrimary}>
                    {categorySaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                    {editingCategory ? 'Update' : 'Create'}
                  </button>
                </div>
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
            <motion.div className="relative bg-white rounded-xl shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto" initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-serif text-[#8b6f63]">{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
                <button onClick={closeProductModal} className="text-[#8b6f63]/40 hover:text-[#8b6f63]"><X size={20} /></button>
              </div>
              <div className="space-y-4">
                {/* Basic Info */}
                <div className="bg-[#fef5f1] rounded-lg p-4 space-y-4">
                  <h4 className="text-sm font-medium text-[#8b6f63] flex items-center gap-2"><Package size={16} /> Basic Information</h4>
                  <div>
                    <label className="block text-sm font-medium text-[#8b6f63] mb-1">Product Name *</label>
                    <input type="text" value={productForm.name} onChange={(e) => setProductForm({ ...productForm, name: e.target.value })} required className={inputClass} />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[#8b6f63] mb-1">Price ($) *</label>
                      <input type="number" step="0.01" value={productForm.price} onChange={(e) => setProductForm({ ...productForm, price: e.target.value })} required className={inputClass} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#8b6f63] mb-1">Stock *</label>
                      <input type="number" value={productForm.stock} onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })} className={inputClass} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#8b6f63] mb-1">Discount %</label>
                      <input type="number" min="0" max="100" value={productForm.discountPercentage} onChange={(e) => setProductForm({ ...productForm, discountPercentage: Math.min(100, Math.max(0, parseInt(e.target.value) || 0)).toString() })} className={inputClass} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#8b6f63] mb-1">Category *</label>
                    <select value={productForm.category} onChange={(e) => setProductForm({ ...productForm, category: e.target.value })} className={inputClass}>
                      {allCategories.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#8b6f63] mb-1">Badge (optional)</label>
                    <select value={productForm.badge} onChange={(e) => setProductForm({ ...productForm, badge: e.target.value })} className={inputClass}>
                      <option value="">None</option><option>New</option><option>Sale</option><option>Best Seller</option><option>Limited Edition</option>
                    </select>
                  </div>
                </div>

                {/* Product Image */}
                <div className="bg-[#fef5f1] rounded-lg p-4 space-y-3">
                  <h4 className="text-sm font-medium text-[#8b6f63] flex items-center gap-2"><Image size={16} /> Product Image</h4>
                  <div className="flex gap-2 mb-2">
                    <button onClick={() => setProductForm(prev => ({ ...prev, imageMode: 'url' }))}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-colors ${productForm.imageMode === 'url' ? 'bg-[#d4a5a5] text-white' : 'bg-white border border-[#f5e6e0] text-[#8b6f63]'}`}>
                      <Link size={12} /> Use URL
                    </button>
                    <button onClick={() => setProductForm(prev => ({ ...prev, imageMode: 'upload' }))}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-colors ${productForm.imageMode === 'upload' ? 'bg-[#d4a5a5] text-white' : 'bg-white border border-[#f5e6e0] text-[#8b6f63]'}`}>
                      <Upload size={12} /> Upload File
                    </button>
                  </div>
                  {productForm.imageMode === 'url' ? (
                    <input type="text" value={productForm.image} onChange={(e) => setProductForm({ ...productForm, image: e.target.value })} placeholder="/products/product-name.png" className={inputClassSm} />
                  ) : (
                    <div>
                      <input ref={productImageInputRef} type="file" accept="image/*" onChange={handleProductImageUpload} className="hidden" />
                      <button onClick={() => productImageInputRef.current?.click()} disabled={productUploading} className="flex items-center gap-2 px-4 py-2 bg-white border border-[#f5e6e0] text-[#8b6f63] rounded-lg hover:bg-[#fef5f1] transition-colors text-sm disabled:opacity-60">
                        {productUploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                        {productUploading ? 'Uploading...' : 'Choose File'}
                      </button>
                    </div>
                  )}
                  {productForm.image && (
                    <div className="w-24 h-24 rounded-lg overflow-hidden border border-[#f5e6e0]">
                      <img src={productForm.image} alt="Preview" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                    </div>
                  )}
                </div>

                {/* Image Gallery */}
                <div className="bg-[#fef5f1] rounded-lg p-4 space-y-3">
                  <h4 className="text-sm font-medium text-[#8b6f63] flex items-center gap-2"><ImageIcon size={16} /> Image Gallery</h4>
                  <div className="flex gap-2 mb-2">
                    <button onClick={() => setProductForm(prev => ({ ...prev, imageGalleryMode: 'url' }))}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-colors ${productForm.imageGalleryMode === 'url' ? 'bg-[#d4a5a5] text-white' : 'bg-white border border-[#f5e6e0] text-[#8b6f63]'}`}>
                      <Link size={12} /> Use URL
                    </button>
                    <button onClick={() => setProductForm(prev => ({ ...prev, imageGalleryMode: 'upload' }))}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-colors ${productForm.imageGalleryMode === 'upload' ? 'bg-[#d4a5a5] text-white' : 'bg-white border border-[#f5e6e0] text-[#8b6f63]'}`}>
                      <Upload size={12} /> Upload File
                    </button>
                  </div>
                  {productForm.imageGalleryMode === 'url' ? (
                    <button onClick={addGalleryImageUrl} className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#f5e6e0] text-[#8b6f63] rounded-lg hover:bg-[#fef5f1] transition-colors text-sm">
                      <Plus size={14} /> Add Image URL
                    </button>
                  ) : (
                    <div>
                      <input ref={galleryImageInputRef} type="file" accept="image/*" multiple onChange={handleGalleryImageUpload} className="hidden" />
                      <button onClick={() => galleryImageInputRef.current?.click()} disabled={productUploading} className="flex items-center gap-2 px-4 py-2 bg-white border border-[#f5e6e0] text-[#8b6f63] rounded-lg hover:bg-[#fef5f1] transition-colors text-sm disabled:opacity-60">
                        {productUploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                        {productUploading ? 'Uploading...' : 'Choose Files'}
                      </button>
                    </div>
                  )}
                  {productForm.images.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {productForm.images.map((img, idx) => (
                        <div key={idx} className="relative w-20 h-20 rounded-lg overflow-hidden border border-[#f5e6e0] group">
                          <img src={img} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                          <button onClick={() => removeGalleryImage(idx)} className="absolute top-0.5 right-0.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <X size={10} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Description */}
                <div className="bg-[#fef5f1] rounded-lg p-4 space-y-3">
                  <h4 className="text-sm font-medium text-[#8b6f63] flex items-center gap-2"><FileText size={16} /> Description</h4>
                  <textarea value={productForm.description} onChange={(e) => setProductForm({ ...productForm, description: e.target.value })} placeholder="Enter detailed product description..." rows={4} className={inputClass + ' resize-none'} />
                </div>

                {/* Ingredients */}
                <div className="bg-[#fef5f1] rounded-lg p-4 space-y-3">
                  <h4 className="text-sm font-medium text-[#8b6f63] flex items-center gap-2"><FileText size={16} /> Ingredients</h4>
                  <textarea value={productForm.ingredients} onChange={(e) => setProductForm({ ...productForm, ingredients: e.target.value })} placeholder={`Enter ingredients, one per line:\nWater\nGlycerin\nDimethicone\nNiacinamide\n...`} rows={6} className={inputClass + ' resize-none font-mono text-sm'} />
                  <p className="text-xs text-[#8b6f63]/50">Enter one ingredient per line. These will be displayed on the product detail page.</p>
                </div>

                {/* Product Tags */}
                <div className="bg-[#fef5f1] rounded-lg p-4 space-y-3">
                  <h4 className="text-sm font-medium text-[#8b6f63] flex items-center gap-2"><Tag size={16} /> Product Tags</h4>
                  <p className="text-xs text-[#8b6f63]/50">Click to toggle product tags. Selected tags are displayed on the product detail page.</p>
                  <div className="flex flex-wrap gap-2">
                    {PRODUCT_TAGS.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleProductTag(tag)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                          productForm.tags.includes(tag)
                            ? 'bg-[#d4a5a5] text-white border-[#d4a5a5] shadow-sm'
                            : 'bg-white text-[#8b6f63] border-[#f5e6e0] hover:border-[#d4a5a5] hover:text-[#d4a5a5]'
                        }`}
                      >
                        {productForm.tags.includes(tag) && <Check size={10} className="inline mr-1" />}
                        {tag}
                      </button>
                    ))}
                  </div>
                  {productForm.tags.length > 0 && (
                    <div className="flex items-center gap-2 pt-1">
                      <span className="text-xs text-[#8b6f63]/60">Selected ({productForm.tags.length}):</span>
                      <div className="flex flex-wrap gap-1">
                        {productForm.tags.map((tag) => (
                          <span key={tag} className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#d4a5a5]/15 text-[#8b6f63] rounded-full text-xs">
                            {tag}
                            <button type="button" onClick={() => toggleProductTag(tag)} className="text-[#8b6f63]/40 hover:text-red-500">
                              <X size={10} />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Colors */}
                <div className="bg-[#fef5f1] rounded-lg p-4 space-y-3">
                  <h4 className="text-sm font-medium text-[#8b6f63] flex items-center gap-2"><Palette size={16} /> Available Colors</h4>
                  <p className="text-xs text-[#8b6f63]/50">Select available color options for this product. Click to toggle.</p>
                  <div className="flex flex-wrap gap-2">
                    {PRESET_COLORS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => toggleProductColor(color)}
                        className={`w-8 h-8 rounded-full border-2 transition-all hover:scale-110 ${
                          productForm.colors.includes(color) ? 'border-[#8b6f63] scale-110 shadow-md' : 'border-gray-200 opacity-60 hover:opacity-100'
                        }`}
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="text"
                      value=""
                      placeholder="#FF0000"
                      className="w-24 px-2 py-1.5 text-xs bg-white border border-[#f5e6e0] rounded text-[#8b6f63] focus:outline-none focus:ring-1 focus:ring-[#d4a5a5]"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          const val = (e.target as HTMLInputElement).value.trim();
                          if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
                            toggleProductColor(val);
                            (e.target as HTMLInputElement).value = '';
                          } else if (val) {
                            toast('Invalid hex color. Use format #RRGGBB', 'error');
                          }
                        }
                      }}
                    />
                    <span className="text-xs text-[#8b6f63]/50">Type hex + Enter to add custom</span>
                  </div>
                  {productForm.colors.length > 0 && (
                    <div className="flex items-center gap-2 flex-wrap pt-2">
                      <span className="text-xs text-[#8b6f63]/60">Selected ({productForm.colors.length}):</span>
                      {productForm.colors.map((color) => (
                        <div key={color} className="flex items-center gap-1 px-2 py-1 bg-white rounded-full border border-[#f5e6e0]">
                          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                          <span className="text-xs text-[#8b6f63] font-mono">{color}</span>
                          <button type="button" onClick={() => toggleProductColor(color)} className="text-[#8b6f63]/40 hover:text-red-500"><X size={12} /></button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  <button onClick={closeProductModal} className={btnOutline}>Cancel</button>
                  <button onClick={handleProductSave} disabled={productSaving} className={btnPrimary}>
                    {productSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                    {editingProduct ? 'Update Product' : 'Create Product'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== SALE MODAL ===== */}
      <AnimatePresence>
        {isSaleModalOpen && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsSaleModalOpen(false)} />
            <motion.div className="relative bg-white rounded-xl shadow-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto" initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-serif text-[#8b6f63]">{editingSale ? 'Edit Sale' : 'Create New Sale'}</h3>
                <button onClick={() => setIsSaleModalOpen(false)} className="text-[#8b6f63]/40 hover:text-[#8b6f63]"><X size={20} /></button>
              </div>
              <div className="space-y-4">
                {/* Basic Info */}
                <div className="bg-[#fef5f1] rounded-lg p-4 space-y-4">
                  <h4 className="text-sm font-medium text-[#8b6f63] flex items-center gap-2"><Percent size={16} /> Sale Details</h4>
                  <div>
                    <label className="block text-sm font-medium text-[#8b6f63] mb-1">Sale Name *</label>
                    <input type="text" value={saleForm.name} onChange={(e) => setSaleForm({ ...saleForm, name: e.target.value })} placeholder="e.g. Summer Glow Sale" className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#8b6f63] mb-1">Description</label>
                    <textarea value={saleForm.description} onChange={(e) => setSaleForm({ ...saleForm, description: e.target.value })} placeholder="Describe this sale..." rows={2} className={inputClass + ' resize-none'} />
                  </div>
                </div>

                {/* Schedule & Status */}
                <div className="bg-[#fef5f1] rounded-lg p-4 space-y-4">
                  <h4 className="text-sm font-medium text-[#8b6f63] flex items-center gap-2"><Calendar size={16} /> Schedule & Status</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[#8b6f63] mb-1">Start Date *</label>
                      <input type="datetime-local" value={saleForm.startDate} onChange={(e) => setSaleForm({ ...saleForm, startDate: e.target.value })} className={inputClassSm} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#8b6f63] mb-1">End Date *</label>
                      <input type="datetime-local" value={saleForm.endDate} onChange={(e) => setSaleForm({ ...saleForm, endDate: e.target.value })} className={inputClassSm} />
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button onClick={() => setSaleForm(prev => ({ ...prev, isActive: !prev.isActive }))}
                      className="flex items-center gap-2">
                      {saleForm.isActive ? (
                        <ToggleRight size={28} className="text-[#d4a5a5]" />
                      ) : (
                        <ToggleLeft size={28} className="text-gray-300" />
                      )}
                    </button>
                    <span className="text-sm text-[#8b6f63]">{saleForm.isActive ? 'Active' : 'Inactive'}</span>
                  </div>
                </div>

                {/* Category Discounts */}
                <div className="bg-[#fef5f1] rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-[#8b6f63] flex items-center gap-2"><Tag size={16} /> Category Discounts</h4>
                    <button onClick={addSaleCategory} className="text-xs text-[#d4a5a5] hover:underline flex items-center gap-1"><Plus size={12} /> Add</button>
                  </div>
                  {saleForm.categoryDiscounts.length === 0 && (
                    <p className="text-xs text-[#8b6f63]/50">No category discounts added yet. Click "Add" to include categories.</p>
                  )}
                  <div className="space-y-2">
                    {saleForm.categoryDiscounts.map((cat, idx) => (
                      <div key={idx} className="flex items-center gap-2 bg-white rounded-lg p-2 border border-[#f5e6e0]/60">
                        <select value={cat.categoryName} onChange={(e) => updateSaleCategory(idx, 'categoryName', e.target.value)} className="flex-1 px-3 py-2 bg-transparent text-sm text-[#8b6f63] focus:outline-none focus:ring-2 focus:ring-[#d4a5a5] rounded">
                          <option value="">Select category</option>
                          {allCategories.map(c => <option key={c}>{c}</option>)}
                        </select>
                        <div className="flex items-center gap-1">
                          <input type="number" min="0" max="100" value={cat.discountPercentage} onChange={(e) => updateSaleCategory(idx, 'discountPercentage', e.target.value)} placeholder="%" className="w-20 px-2 py-2 bg-transparent text-sm text-[#8b6f63] focus:outline-none focus:ring-2 focus:ring-[#d4a5a5] rounded" />
                          <span className="text-xs text-[#8b6f63]/50">%</span>
                        </div>
                        <button onClick={() => removeSaleCategory(idx)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><X size={14} /></button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button onClick={() => setIsSaleModalOpen(false)} className={btnOutline}>Cancel</button>
                  <button onClick={handleSaleSave} disabled={saleSaving} className={btnPrimary}>
                    {saleSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                    {editingSale ? 'Update Sale' : 'Create Sale'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== PROMO CODE MODAL ===== */}
      <AnimatePresence>
        {isPromoModalOpen && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsPromoModalOpen(false)} />
            <motion.div className="relative bg-white rounded-xl shadow-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto" initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-serif text-[#8b6f63]">{editingPromo ? 'Edit Promo Code' : 'Create Promo Code'}</h3>
                <button onClick={() => setIsPromoModalOpen(false)} className="text-[#8b6f63]/40 hover:text-[#8b6f63]"><X size={20} /></button>
              </div>
              <div className="space-y-4">
                {/* Promo Code & Discount */}
                <div className="bg-[#fef5f1] rounded-lg p-4 space-y-4">
                  <h4 className="text-sm font-medium text-[#8b6f63] flex items-center gap-2"><Ticket size={16} /> Code & Discount</h4>
                  <div>
                    <label className="block text-sm font-medium text-[#8b6f63] mb-1">Promo Code *</label>
                    <input type="text" value={promoForm.code} onChange={(e) => setPromoForm({ ...promoForm, code: e.target.value.toUpperCase() })} placeholder="e.g. SUMMER20" className={inputClass + ' font-mono uppercase tracking-wider'} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[#8b6f63] mb-1">Discount Type</label>
                      <select value={promoForm.discountType} onChange={(e) => setPromoForm({ ...promoForm, discountType: e.target.value })} className={inputClass}>
                        <option value="percentage">Percentage (%)</option>
                        <option value="fixed">Fixed Amount ($)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#8b6f63] mb-1">Discount Value *</label>
                      <input type="number" step="0.01" min="0" value={promoForm.discountValue} onChange={(e) => setPromoForm({ ...promoForm, discountValue: e.target.value })} placeholder={promoForm.discountType === 'percentage' ? '20' : '10.00'} className={inputClass} />
                    </div>
                  </div>
                </div>

                {/* Restrictions */}
                <div className="bg-[#fef5f1] rounded-lg p-4 space-y-4">
                  <h4 className="text-sm font-medium text-[#8b6f63] flex items-center gap-2"><Filter size={16} /> Restrictions & Schedule</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[#8b6f63] mb-1">Min Order ($)</label>
                      <input type="number" step="0.01" min="0" value={promoForm.minOrderAmount} onChange={(e) => setPromoForm({ ...promoForm, minOrderAmount: e.target.value })} className={inputClass} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#8b6f63] mb-1">Max Uses (0=unlimited)</label>
                      <input type="number" min="0" value={promoForm.maxUses} onChange={(e) => setPromoForm({ ...promoForm, maxUses: e.target.value })} className={inputClass} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#8b6f63] mb-1">Expiry Date (optional)</label>
                    <input type="datetime-local" value={promoForm.expiresAt} onChange={(e) => setPromoForm({ ...promoForm, expiresAt: e.target.value })} className={inputClassSm} />
                  </div>
                </div>

                {/* Linking & Status */}
                <div className="bg-[#fef5f1] rounded-lg p-4 space-y-4">
                  <h4 className="text-sm font-medium text-[#8b6f63] flex items-center gap-2"><Link size={16} /> Linking & Status</h4>
                  <div>
                    <label className="block text-sm font-medium text-[#8b6f63] mb-1">Link to Sale (optional)</label>
                    <select value={promoForm.saleId} onChange={(e) => setPromoForm({ ...promoForm, saleId: e.target.value })} className={inputClass}>
                      <option value="">No linked sale</option>
                      {sales.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                  <div className="flex items-center gap-3">
                    <button onClick={() => setPromoForm(prev => ({ ...prev, isValid: !prev.isValid }))} className="flex items-center gap-2">
                      {promoForm.isValid ? (
                        <ToggleRight size={28} className="text-[#d4a5a5]" />
                      ) : (
                        <ToggleLeft size={28} className="text-gray-300" />
                      )}
                    </button>
                    <span className="text-sm text-[#8b6f63]">{promoForm.isValid ? 'Active' : 'Disabled'}</span>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button onClick={() => setIsPromoModalOpen(false)} className={btnOutline}>Cancel</button>
                  <button onClick={handlePromoSave} disabled={promoSaving} className={btnPrimary}>
                    {promoSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                    {editingPromo ? 'Update' : 'Create'}
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
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-serif text-[#8b6f63]">Confirm Delete</h3>
                <button onClick={() => setConfirmDelete(null)} className="text-[#8b6f63]/40 hover:text-[#8b6f63]"><X size={20} /></button>
              </div>
              <p className="text-sm text-[#8b6f63]/70 mb-6">
                Are you sure you want to delete this {confirmDelete.type}?<br />
                <span className="font-medium text-[#8b6f63]">{confirmDelete.name}</span>
              </p>
              <div className="flex gap-3">
                <button onClick={() => setConfirmDelete(null)} className={btnOutline}>Cancel</button>
                <button
                  onClick={() => {
                    if (confirmDelete.type === 'product') handleDeleteProduct(confirmDelete.id);
                    else if (confirmDelete.type === 'customer') handleDeleteCustomer(confirmDelete.id);
                    else if (confirmDelete.type === 'category') handleDeleteCategory(confirmDelete.id);
                    else if (confirmDelete.type === 'sale') handleDeleteSale(confirmDelete.id);
                    else if (confirmDelete.type === 'promo-code') handleDeletePromo(confirmDelete.id);
                  }}
                  className="px-4 py-2.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors text-sm"
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
