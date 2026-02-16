import React, { useMemo, useRef, useState, useEffect } from 'react';
import { Bell, BellRing, X, Check, CheckCheck, Trash2, Clock, AlertCircle, Info } from 'lucide-react';
import { useNotifications } from '../../contexts/NotificationContext';
import { formatDistanceToNow } from 'date-fns';

const NotificationDropdown = () => {
  const {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification
  } = useNotifications();

  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef(null);
  const fetchNotificationsRef = useRef(fetchNotifications);

  const [panelPosition, setPanelPosition] = useState({ top: 0, left: 0, width: 384 });

  useEffect(() => {
    fetchNotificationsRef.current = fetchNotifications;
  }, [fetchNotifications]);

  useEffect(() => {
    if (isOpen) {
      fetchNotificationsRef.current();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const updatePosition = () => {
      const el = buttonRef.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const viewportW = window.innerWidth;
      const margin = 16;
      const maxWidth = 384;
      const width = Math.min(maxWidth, Math.max(280, viewportW - margin * 2));
      const leftUnclamped = rect.right - width;
      const left = Math.min(Math.max(leftUnclamped, margin), viewportW - width - margin);
      const top = rect.bottom + 8;

      setPanelPosition({ top, left, width });
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [isOpen]);

  const panelStyle = useMemo(
    () => ({ top: panelPosition.top, left: panelPosition.left, width: panelPosition.width }),
    [panelPosition]
  );

  const getNotificationIcon = (type, priority) => {
    if (priority === 'high') return <AlertCircle className="w-4 h-4 text-red-500" />;
    if (type === 'complaint_resolved') return <Check className="w-4 h-4 text-green-500" />;
    if (type === 'complaint_assigned') return <Clock className="w-4 h-4 text-blue-500" />;
    return <Info className="w-4 h-4 text-gray-500" />;
  };

  const getNotificationColor = (priority) => {
    switch (priority) {
      case 'high': return 'border-l-red-500 bg-red-50';
      case 'medium': return 'border-l-yellow-500 bg-yellow-50';
      default: return 'border-l-gray-300 bg-white';
    }
  };

  const handleNotificationClick = (notification) => {
    if (!notification.isRead) {
      markAsRead(notification._id);
    }
    if (notification.actionUrl) {
      window.location.href = notification.actionUrl;
    }
    setIsOpen(false);
  };

  return (
    <div className="relative flex items-center">
      {/* Notification Bell */}
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
      >
        {unreadCount > 0 ? (
          <BellRing className="w-5 h-5" />
        ) : (
          <Bell className="w-5 h-5" />
        )}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown Content */}
          <div
            style={panelStyle}
            className={[
              'fixed',
              'bg-white rounded-lg shadow-xl border border-gray-200 z-20',
              'max-h-96 overflow-hidden'
            ].join(' ')}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">Notifications</h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={() => markAllAsRead()}
                    className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    <CheckCheck className="w-4 h-4" />
                    Mark all read
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Notifications List */}
            <div className="overflow-y-auto max-h-80">
              {loading ? (
                <div className="flex items-center justify-center p-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-600"></div>
                </div>
              ) : notifications.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Bell className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p>No notifications yet</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification._id}
                    className={`border-l-4 p-4 hover:bg-gray-50 cursor-pointer transition-colors ${getNotificationColor(
                      notification.priority
                    )} ${!notification.isRead ? 'font-semibold' : ''}`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type, notification.priority)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {notification.title}
                          </p>
                          <div className="flex items-center gap-1 ml-2">
                            {!notification.isRead && (
                              <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteNotification(notification._id);
                              }}
                              className="text-gray-400 hover:text-red-500 transition-colors"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-400">
                          {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="p-3 border-t border-gray-200 bg-gray-50">
                <button
                  onClick={() => {
                    // Navigate to full notifications page
                    window.location.href = '/notifications';
                  }}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  View all notifications
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationDropdown;
