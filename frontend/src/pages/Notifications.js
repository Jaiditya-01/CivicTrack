import React, { useEffect, useState } from 'react';
import { Bell, Check, CheckCheck, Trash2 } from 'lucide-react';
import { useNotifications } from '../contexts/NotificationContext';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Icons } from '../components/ui/icons';

const NotificationsPage = () => {
  const {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification
  } = useNotifications();

  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchNotifications(1, 50); // Load more notifications for the full page
  }, []);

  const filteredNotifications = notifications.filter(notification => {
    const matchesFilter = 
      filter === 'all' ||
      (filter === 'unread' && !notification.isRead) ||
      (filter === 'high' && notification.priority === 'high');
    
    const matchesSearch = 
      notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  const getNotificationIcon = (type, priority) => {
    if (priority === 'high') return <div className="w-3 h-3 bg-red-500 rounded-full"></div>;
    if (type === 'complaint_resolved') return <div className="w-3 h-3 bg-green-500 rounded-full"></div>;
    if (type === 'complaint_assigned') return <div className="w-3 h-3 bg-blue-500 rounded-full"></div>;
    return <div className="w-3 h-3 bg-gray-400 rounded-full"></div>;
  };

  const getNotificationColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'border-l-red-500 bg-red-500/5 dark:bg-red-500/10';
      case 'medium':
        return 'border-l-yellow-500 bg-yellow-500/5 dark:bg-yellow-500/10';
      default:
        return 'border-l-border bg-card';
    }
  };

  const handleNotificationClick = (notification) => {
    if (!notification.isRead) {
      markAsRead(notification._id);
    }
    if (notification.actionUrl) {
      window.location.href = notification.actionUrl;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Bell className="h-6 w-6 text-muted-foreground" />
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Notifications</h1>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-xs bg-red-500/10 text-red-500 border border-red-500/20">
                {unreadCount} unread
              </span>
            )}
          </div>
          <p className="text-muted-foreground">Updates about your complaints and assignments</p>
        </div>

        {unreadCount > 0 && (
          <Button variant="outline" onClick={markAllAsRead} className="justify-center">
            <CheckCheck className="mr-2 h-4 w-4" />
            Mark all as read
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle>All Notifications</CardTitle>
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <div className="relative w-full md:w-72">
                <Icons.search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search notifications..."
                  className="pl-8 w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={filter === 'all' ? 'default' : 'outline'}
                  onClick={() => setFilter('all')}
                >
                  All
                </Button>
                <Button
                  type="button"
                  variant={filter === 'unread' ? 'default' : 'outline'}
                  onClick={() => setFilter('unread')}
                >
                  Unread
                </Button>
                <Button
                  type="button"
                  variant={filter === 'high' ? 'default' : 'outline'}
                  onClick={() => setFilter('high')}
                >
                  High
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Icons.spinner className="h-8 w-8 animate-spin" />
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Bell className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-1">
                {searchTerm || filter !== 'all' ? 'No matching notifications' : 'No notifications yet'}
              </h3>
              <p className="text-sm text-muted-foreground max-w-md">
                {searchTerm || filter !== 'all'
                  ? 'Try adjusting your search or filters.'
                  : 'Notifications will appear here when there are updates to your complaints.'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredNotifications.map((notification) => (
                <Card
                  key={notification._id}
                  className={`border-l-4 cursor-pointer hover:shadow-md transition-shadow ${getNotificationColor(
                    notification.priority
                  )}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1">{getNotificationIcon(notification.type, notification.priority)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <h3 className={`font-medium text-foreground truncate ${!notification.isRead ? 'font-semibold' : ''}`}>
                                {notification.title}
                              </h3>
                              {!notification.isRead && <span className="w-2 h-2 rounded-full bg-primary" />}
                              <span
                                className={`px-2 py-0.5 rounded-full text-xs border ${
                                  notification.priority === 'high'
                                    ? 'bg-red-500/10 text-red-500 border-red-500/20'
                                    : notification.priority === 'medium'
                                    ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                                    : 'bg-muted/50 text-muted-foreground border-border/50'
                                }`}
                              >
                                {notification.priority}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                            <p className="text-xs text-muted-foreground mt-2">
                              {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                            </p>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {!notification.isRead && (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  markAsRead(notification._id);
                                }}
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteNotification(notification._id);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationsPage;
