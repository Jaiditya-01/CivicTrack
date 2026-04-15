import React, { useMemo, useRef, useState, useEffect } from 'react';
import { Bell, BellRing, X, Check, CheckCheck, Trash2, Clock, AlertCircle, Info } from 'lucide-react';
import { useNotifications } from '../../contexts/NotificationContext';
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';

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
    if (isOpen) fetchNotificationsRef.current();
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
      setPanelPosition({ top: rect.bottom + 8, left, width });
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
    if (priority === 'high')          return <AlertCircle className="w-4 h-4 text-red-500" />;
    if (type === 'complaint_resolved') return <Check className="w-4 h-4 text-green-500" />;
    if (type === 'complaint_assigned') return <Clock className="w-4 h-4 text-blue-500" />;
    return <Info className="w-4 h-4 text-muted-foreground" />;
  };

  const getNotificationBorder = (priority) => {
    if (priority === 'high')   return 'border-l-red-500 bg-red-500/5';
    if (priority === 'medium') return 'border-l-yellow-500 bg-yellow-500/5';
    return 'border-l-border';
  };

  const handleNotificationClick = (notification) => {
    if (!notification.isRead) markAsRead(notification._id);
    if (notification.actionUrl) window.location.href = notification.actionUrl;
    setIsOpen(false);
  };

  return (
    <div className="relative flex items-center">
      {/* Bell button — fully themed */}
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
      >
        {unreadCount > 0 ? <BellRing className="w-5 h-5" /> : <Bell className="w-5 h-5" />}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />

          {/* Dropdown panel — uses card/border theme variables */}
          <div
            style={panelStyle}
            className="fixed z-20 rounded-xl border border-border bg-card shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <h3 className="font-semibold text-foreground">Notifications</h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={() => markAllAsRead()}
                    className="text-xs text-primary hover:text-primary/80 flex items-center gap-1 transition-colors"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    Mark all read
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-accent"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* List */}
            <div className="overflow-y-auto max-h-80">
              {loading ? (
                <div className="flex items-center justify-center p-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary" />
                </div>
              ) : notifications.length === 0 ? (
                <div className="text-center py-8">
                  <Bell className="w-8 h-8 mx-auto mb-2 text-muted-foreground/40" />
                  <p className="text-sm text-muted-foreground">No notifications yet</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification._id}
                    className={`border-l-4 px-4 py-3 hover:bg-accent/50 cursor-pointer transition-colors ${getNotificationBorder(notification.priority)} ${!notification.isRead ? 'bg-primary/5' : ''}`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-0.5">
                        {getNotificationIcon(notification.type, notification.priority)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <p className={`text-sm truncate text-foreground ${!notification.isRead ? 'font-semibold' : 'font-medium'}`}>
                            {notification.title}
                          </p>
                          <div className="flex items-center gap-1.5 ml-2 shrink-0">
                            {!notification.isRead && (
                              <span className="w-2 h-2 bg-primary rounded-full" />
                            )}
                            <button
                              onClick={(e) => { e.stopPropagation(); deleteNotification(notification._id); }}
                              className="text-muted-foreground hover:text-destructive transition-colors"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">{notification.message}</p>
                        <p className="text-xs text-muted-foreground/60 mt-1">
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
              <div className="px-4 py-3 border-t border-border bg-muted/30">
                <Link
                  to="/notifications"
                  onClick={() => setIsOpen(false)}
                  className="text-sm text-primary hover:text-primary/80 font-medium transition-colors"
                >
                  View all notifications →
                </Link>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationDropdown;
