'use client';

import { useState, useCallback, useSyncExternalStore } from 'react';
import { Cookie } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CONSENT_KEY = 'cookieConsent';

function getConsentValue() {
  if (typeof window === 'undefined') return 'pending';
  return localStorage.getItem(CONSENT_KEY) ?? 'pending';
}

function subscribeToConsent(callback: () => void) {
  window.addEventListener('storage', callback);
  return () => window.removeEventListener('storage', callback);
}

export function CookieConsent() {
  const consent = useSyncExternalStore(subscribeToConsent, getConsentValue, () => 'pending');
  const [dismissed, setDismissed] = useState(false);

  const visible = consent === 'pending' && !dismissed;

  const handleAcceptAll = useCallback(() => {
    localStorage.setItem(CONSENT_KEY, 'true');
    window.dispatchEvent(new StorageEvent('storage', { key: CONSENT_KEY }));
    setDismissed(true);
  }, []);

  const handleCustomize = useCallback(() => {
    setDismissed(true);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 350, damping: 30 }}
          role="dialog"
          aria-label="Cookie consent"
          className="fixed bottom-0 left-0 right-0 z-50 bg-[#fef5f1] dark:bg-[#2d1f24] border-t border-[#f5e6e0] dark:border-[#3d2f34]"
        >
          <div className="container mx-auto px-4 py-4 sm:py-5">
            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
              {/* Cookie Icon */}
              <Cookie
                size={28}
                className="text-[#d4a5a5] dark:text-[#d4a5a5] flex-shrink-0"
                aria-hidden="true"
              />

              {/* Text */}
              <p className="text-sm text-[#8b6f63] dark:text-[#e8ddd5] text-center sm:text-left flex-1">
                We use cookies to enhance your shopping experience. By continuing, you agree to our{' '}
                <span className="underline underline-offset-2 decoration-[#d4a5a5]/60 text-[#8b6f63] dark:text-[#d4a5a5] font-medium">
                  Cookie Policy
                </span>
                .
              </p>

              {/* Buttons */}
              <div className="flex items-center gap-3 flex-shrink-0">
                <button
                  onClick={handleAcceptAll}
                  className="px-5 py-2.5 bg-[#d4a5a5] text-white text-sm font-medium rounded-full hover:bg-[#c89a9a] hover:shadow-lg hover:shadow-[#d4a5a5]/25 transition-all duration-200 cursor-pointer"
                >
                  Accept All
                </button>
                <button
                  onClick={handleCustomize}
                  className="px-5 py-2.5 border border-[#d4a5a5]/40 dark:border-[#d4a5a5]/30 text-[#8b6f63] dark:text-[#e8ddd5] text-sm font-medium rounded-full hover:bg-[#f5e6e0] dark:hover:bg-[#3d2f34] transition-all duration-200 cursor-pointer"
                >
                  Customize
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
