'use client';

import { useState, useEffect, useRef, useSyncExternalStore } from 'react';
import { Bell, Tag, Truck, RefreshCw, Sparkles, CheckCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/store/store';
import { useTheme } from 'next-themes';

interface NotificationItem {
  id: string;
  icon: 'sale' | 'shipping' | 'restock' | 'promo';
  title: string;
  description: string;
  timeAgo: string;
  read: boolean;
}

const ICON_MAP: Record<NotificationItem['icon'], { icon: typeof Tag; color: string }> = {
  sale: { icon: Tag, color: 'text-red-500' },
  shipping: { icon: Truck, color: 'text-emerald-500' },
  restock: { icon: RefreshCw, color: 'text-amber-500' },
  promo: { icon: Sparkles, color: 'text-violet-500' },
};

const MOCK_NOTIFICATIONS: NotificationItem[] = [
  {
    id: '1',
    icon: 'sale',
    title: 'New sale: 30% off Skincare!',
    description: 'Don\'t miss our biggest skincare sale of the season. Shop now and save on all your favorites.',
    timeAgo: '2 min ago',
    read: false,
  },
  {
    id: '2',
    icon: 'shipping',
    title: 'Your order has shipped',
    description: 'Order #RB-48291 is on its way! Track your delivery for real-time updates.',
    timeAgo: '1 hour ago',
    read: false,
  },
  {
    id: '3',
    icon: 'restock',
    title: 'Back in stock: Soft Kiss Lip Balm',
    description: 'The fan-favorite lip balm is back! Grab yours before it sells out again.',
    timeAgo: '3 hours ago',
    read: false,
  },
  {
    id: '4',
    icon: 'promo',
    title: 'Exclusive: Early access to new collection',
    description: 'As a valued member, you get first pick of our upcoming spring collection.',
    timeAgo: '1 day ago',
    read: true,
  },
];

export function NotificationBell() {
  const { theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>(MOCK_NOTIFICATIONS);
  const bellRef = useRef<HTMLDivElement>(null);

  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const renderNotificationIcon = (type: NotificationItem['icon']) => {
    const { icon: IconComponent, color } = ICON_MAP[type];
    return (
      <div className="w-9 h-9 rounded-full bg-[#fef5f1] dark:bg-[#1a1215] flex items-center justify-center flex-shrink-0">
        <IconComponent size={16} className={color} />
      </div>
    );
  };

  return (
    <div className="relative" ref={bellRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 hover:bg-[#fef5f1] dark:hover:bg-[#3d2f34] rounded-full transition-colors relative"
        aria-label="Notifications"
      >
        <Bell size={20} className="text-[#8b6f63] dark:text-[#e8ddd5]" />
        {unreadCount > 0 && mounted && (
          <span className="absolute -top-1 -right-1 bg-[#d4a5a5] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-[#2d1f24] rounded-xl shadow-lg border border-[#f5e6e0] dark:border-[#3d2f34] overflow-hidden z-50"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#f5e6e0] dark:border-[#3d2f34]">
              <h3 className="text-sm font-semibold text-[#8b6f63] dark:text-[#e8ddd5]">
                Notifications
              </h3>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="flex items-center gap-1 text-xs text-[#d4a5a5] hover:text-[#8b6f63] dark:hover:text-[#e8ddd5] transition-colors"
                >
                  <CheckCheck size={14} />
                  Mark all as read
                </button>
              )}
            </div>

            {/* Notification List */}
            <div className="max-h-80 overflow-y-auto">
              {notifications.length > 0 ? (
                <ul className="divide-y divide-[#f5e6e0] dark:divide-[#3d2f34]">
                  {notifications.map((notification) => (
                    <li
                      key={notification.id}
                      className={`px-4 py-3 flex items-start gap-3 hover:bg-[#fef5f1] dark:hover:bg-[#3d2f34] transition-colors cursor-pointer ${
                        !notification.read ? 'bg-[#fef5f1]/50 dark:bg-[#1a1215]/50' : ''
                      }`}
                    >
                      {renderNotificationIcon(notification.icon)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className={`text-sm leading-tight ${!notification.read ? 'font-semibold text-[#8b6f63] dark:text-[#e8ddd5]' : 'font-medium text-[#8b6f63]/80 dark:text-[#e8ddd5]/80'}`}>
                            {notification.title}
                          </p>
                          {!notification.read && (
                            <span className="w-2 h-2 rounded-full bg-[#d4a5a5] flex-shrink-0 mt-1.5" />
                          )}
                        </div>
                        <p className="text-xs text-[#8b6f63]/60 dark:text-[#a89898] mt-0.5 line-clamp-2">
                          {notification.description}
                        </p>
                        <p className="text-[10px] text-[#8b6f63]/40 dark:text-[#a89898]/50 mt-1">
                          {notification.timeAgo}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="px-4 py-10 text-center">
                  <Bell size={32} className="text-[#8b6f63]/20 dark:text-[#a89898]/20 mx-auto mb-3" />
                  <p className="text-sm text-[#8b6f63]/50 dark:text-[#a89898]">
                    No notifications yet
                  </p>
                  <p className="text-xs text-[#8b6f63]/30 dark:text-[#a89898]/40 mt-1">
                    We&apos;ll let you know when something arrives
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-[#f5e6e0] dark:border-[#3d2f34] px-4 py-2.5">
              <button
                className="w-full text-center text-xs font-medium text-[#d4a5a5] hover:text-[#8b6f63] dark:hover:text-[#e8ddd5] transition-colors"
                onClick={() => setIsOpen(false)}
              >
                View All Notifications
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
