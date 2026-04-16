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

function PageRenderer() {
  const { currentPage } = useStore();

  const pageVariants = {
    initial: { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -8 },
  };

  // Login, Signup, and Admin pages have their own full-screen layout (no header/footer)
  if (currentPage === 'login' || currentPage === 'signup' || currentPage === 'admin') {
    if (currentPage === 'admin') {
      return <AnimatePresence mode="wait"><motion.div key="admin" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.2 }}><AdminDashboard /></motion.div></AnimatePresence>;
    }
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={currentPage}
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.2 }}
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
        transition={{ duration: 0.2 }}
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
      <Header />
      <PageRenderer />
      <Footer />
    </div>
  );
}
