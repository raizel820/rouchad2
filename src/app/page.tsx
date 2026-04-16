'use client';

import { useEffect } from 'react';
import { useStore } from '@/store/store';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { HomePage } from '@/components/pages/HomePage';
import { ProductsPage } from '@/components/pages/ProductsPage';
import { ProductDetailPage } from '@/components/pages/ProductDetailPage';
import { CartPage } from '@/components/pages/CartPage';
import { CheckoutPage } from '@/components/pages/CheckoutPage';
import { LoginPage } from '@/components/pages/LoginPage';
import { SignupPage } from '@/components/pages/SignupPage';
import { ContactPage } from '@/components/pages/ContactPage';
import { OrderConfirmationPage } from '@/components/pages/OrderConfirmationPage';
import { OrderTrackingPage } from '@/components/pages/OrderTrackingPage';
import { ReturnsRefundsPage } from '@/components/pages/ReturnsRefundsPage';
import { HelpCenterPage } from '@/components/pages/HelpCenterPage';
import { ProfilePage } from '@/components/pages/ProfilePage';
import { SettingsPage } from '@/components/pages/SettingsPage';
import { AdminDashboard } from '@/components/pages/AdminDashboard';
import { AnimatePresence, motion } from 'framer-motion';
import { ScrollToTop } from '@/components/ScrollToTop';
import { QuickViewModal } from '@/components/QuickViewModal';
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


// Global effect to load wishlist when user logs in
function WishlistLoader() {
  const { isAuthenticated, user, wishlistLoaded, setWishlistItems, setWishlistLoaded } = useStore();

  useEffect(() => {
    if (!isAuthenticated || !user || wishlistLoaded) return;
    let cancelled = false;
    fetch(`/api/wishlist?userId=${user.id}`)
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        if (Array.isArray(data)) {
          setWishlistItems(data.map((item: { productId: string }) => item.productId));
        }
        setWishlistLoaded(true);
      })
      .catch(() => setWishlistLoaded(true));
    return () => { cancelled = true; };
  }, [isAuthenticated, user, wishlistLoaded, setWishlistItems, setWishlistLoaded]);

  return null;
}

function QuickViewWrapper() {
  const { isQuickViewOpen, quickViewProduct, closeQuickView } = useStore();
  return (
    <QuickViewModal
      isOpen={isQuickViewOpen}
      product={quickViewProduct}
      onClose={closeQuickView}
    />
  );
}

function PageRenderer() {
  const { currentPage } = useStore();

  const pageVariants = {
    initial: { opacity: 0, y: 20, scale: 0.98 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: -10, scale: 0.99 },
  };

  // Login, Signup, and Admin pages have their own full-screen layout (no header/footer)
  if (currentPage === 'login' || currentPage === 'signup' || currentPage === 'admin') {
    if (currentPage === 'admin') {
      return <AnimatePresence mode="wait"><motion.div key="admin" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.3 }}><AdminDashboard /></motion.div></AnimatePresence>;
    }
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={currentPage}
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.3 }}
        >
          {currentPage === 'login' && <LoginPage />}
          {currentPage === 'signup' && <SignupPage />}
        </motion.div>
      </AnimatePresence>
    );
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage />;
      case 'products':
        return <ProductsPage />;
      case 'product-detail':
        return <ProductDetailPage />;
      case 'cart':
        return <CartPage />;
      case 'checkout':
        return <CheckoutPage />;
      case 'contact':
        return <ContactPage />;
      case 'order-confirmation':
        return <OrderConfirmationPage />;
      case 'order-tracking':
        return <OrderTrackingPage />;
      case 'returns-refunds':
        return <ReturnsRefundsPage />;
      case 'help-center':
        return <HelpCenterPage />;
      case 'profile':
        return <ProfilePage />;
      case 'settings':
        return <SettingsPage />;
      case 'admin':
        return <AdminDashboard />;
      default:
        return <HomePage />;
    }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.main
        key={currentPage}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ duration: 0.3 }}
        className="flex-1"
      >
        {renderPage()}
      </motion.main>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <WishlistLoader />
      <ScrollToTop />
      <Header />
      <PageRenderer />
      <Footer />
      <QuickViewWrapper />
    </div>
  );
}
