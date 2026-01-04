import { useEffect, useRef } from 'react';
import { Bell, Check, CheckCheck, Users, Video, LogOut, Mail } from 'lucide-react';
import { useNotificationStore } from '../../stores/notificationStore';
import type { Notification } from '../../stores/notificationStore';
import { notificationService } from '../../services/notification';
import { useThemeStore, themeColors } from '../../stores/themeStore';

const notificationIcons: Record<string, React.ReactNode> = {
  'room-created': <Video size={16} />,
  'user-joined': <Users size={16} />,
  'user-left': <LogOut size={16} />,
  'meeting-invite': <Mail size={16} />,
  'welcome': <Check size={16} />,
};

function NotificationItem({ notification, onRead }: { notification: Notification; onRead: () => void }) {
  const { themeColor } = useThemeStore();
  const theme = themeColors[themeColor];

  const timeAgo = (date: string) => {
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return 'Vừa xong';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} phút trước`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} giờ trước`;
    return `${Math.floor(seconds / 86400)} ngày trước`;
  };

  return (
    <div
      className={`p-3 hover:bg-[#35363c] cursor-pointer transition-colors ${
        !notification.read ? 'bg-[#35363c]/50' : ''
      }`}
      onClick={onRead}
    >
      <div className="flex gap-3">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
          style={{ backgroundColor: notification.read ? '#4e5058' : theme.primary }}
        >
          {notificationIcons[notification.type] || <Bell size={16} />}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-white font-medium truncate">{notification.title}</p>
          <p className="text-xs text-[#b5bac1] truncate">{notification.message}</p>
          <p className="text-xs text-[#6d6f78] mt-1">{timeAgo(notification.createdAt)}</p>
        </div>
        {!notification.read && (
          <div
            className="w-2 h-2 rounded-full shrink-0 mt-2"
            style={{ backgroundColor: theme.primary }}
          />
        )}
      </div>
    </div>
  );
}

export function NotificationDropdown() {
  const { notifications, unreadCount, isOpen, setOpen, markAsRead, markAllAsRead, setNotifications, setUnreadCount } =
    useNotificationStore();
  const { themeColor } = useThemeStore();
  const theme = themeColors[themeColor];
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load notifications on mount
    const loadNotifications = async () => {
      const data = await notificationService.getNotifications();
      setNotifications(data);
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count);
    };
    loadNotifications();

    // Connect WebSocket
    notificationService.connect();

    return () => {
      notificationService.disconnect();
    };
  }, [setNotifications, setUnreadCount]);

  useEffect(() => {
    // Close dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setOpen]);

  const handleMarkAsRead = async (notification: Notification) => {
    if (!notification.read) {
      await notificationService.markAsRead(notification.id);
      markAsRead(notification.id);
    }
  };

  const handleMarkAllAsRead = async () => {
    await notificationService.markAllAsRead();
    markAllAsRead();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setOpen(!isOpen)}
        className="relative p-2 text-[#b5bac1] hover:text-white hover:bg-[#35363c] rounded-lg transition-all"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span
            className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center text-[10px] font-bold text-white rounded-full px-1"
            style={{ backgroundColor: theme.primary }}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-[#2b2d31] rounded-lg shadow-xl border border-[#1e1f22] overflow-hidden z-50">
          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b border-[#1e1f22]">
            <h3 className="text-white font-semibold">Thông báo</h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="flex items-center gap-1 text-xs text-[#b5bac1] hover:text-white transition-colors"
              >
                <CheckCheck size={14} />
                Đọc tất cả
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell size={32} className="mx-auto text-[#4e5058] mb-2" />
                <p className="text-[#b5bac1] text-sm">Không có thông báo</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onRead={() => handleMarkAsRead(notification)}
                />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
