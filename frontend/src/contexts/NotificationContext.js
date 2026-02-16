import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';
import api from '../api';

const NotificationContext = createContext();

// Notification reducer
const notificationReducer = (state, action) => {
  switch (action.type) {
    case 'SET_NOTIFICATIONS':
      return {
        ...state,
        notifications: action.payload.notifications,
        unreadCount: action.payload.unreadCount
      };
    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [action.payload, ...state.notifications],
        unreadCount: state.unreadCount + 1
      };
    case 'MARK_AS_READ':
      return {
        ...state,
        notifications: state.notifications.map(notif =>
          notif._id === action.payload
            ? { ...notif, isRead: true }
            : notif
        ),
        unreadCount: Math.max(0, state.unreadCount - 1)
      };
    case 'MARK_ALL_AS_READ':
      return {
        ...state,
        notifications: state.notifications.map(notif => ({
          ...notif,
          isRead: true
        })),
        unreadCount: 0
      };
    case 'DELETE_NOTIFICATION':
      const deletedNotif = state.notifications.find(n => n._id === action.payload);
      return {
        ...state,
        notifications: state.notifications.filter(notif => notif._id !== action.payload),
        unreadCount: deletedNotif && !deletedNotif.isRead 
          ? Math.max(0, state.unreadCount - 1) 
          : state.unreadCount
      };
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload
      };
    case 'SET_SOCKET':
      return {
        ...state,
        socket: action.payload
      };
    default:
      return state;
  }
};

const initialState = {
  notifications: [],
  unreadCount: 0,
  loading: false,
  socket: null
};

export const NotificationProvider = ({ children }) => {
  const [state, dispatch] = useReducer(notificationReducer, initialState);

  // Initialize socket connection
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const socket = io(process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000', {
        auth: {
          token
        }
      });

      socket.on('connect', () => {
        console.log('Connected to notification server');
        dispatch({ type: 'SET_SOCKET', payload: socket });
      });

      socket.on('newNotification', (notification) => {
        dispatch({ type: 'ADD_NOTIFICATION', payload: notification });
        
        // Show toast notification
        const toastMessage = `${notification.title}: ${notification.message}`;
        
        if (notification.priority === 'high') {
          toast.error(toastMessage, {
            duration: 5000,
            icon: '🔔'
          });
        } else if (notification.priority === 'medium') {
          toast(toastMessage, {
            duration: 4000,
            icon: '📢'
          });
        } else {
          toast(toastMessage, {
            duration: 3000,
            icon: '💬'
          });
        }
      });

      socket.on('disconnect', () => {
        console.log('Disconnected from notification server');
      });

      return () => {
        socket.disconnect();
      };
    }
  }, []);

  // Join user room when authenticated
  const joinUserRoom = (userId, isAdmin = false) => {
    if (state.socket) {
      state.socket.emit('joinUserRoom', userId);
      if (isAdmin) {
        state.socket.emit('joinAdminRoom');
      }
    }
  };

  // Fetch notifications
  const fetchNotifications = async (page = 1, limit = 20, unreadOnly = false) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });
      
      if (unreadOnly) {
        params.append('unreadOnly', 'true');
      }

      const response = await api.get(`/notifications?${params}`);
      
      dispatch({
        type: 'SET_NOTIFICATIONS',
        payload: {
          notifications: response.data.notifications,
          unreadCount: response.data.unreadCount
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Failed to fetch notifications');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      await api.patch(`/notifications/${notificationId}/read`);
      dispatch({ type: 'MARK_AS_READ', payload: notificationId });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast.error('Failed to mark notification as read');
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      await api.patch('/notifications/mark-all-read');
      dispatch({ type: 'MARK_ALL_AS_READ' });
      toast.success('All notifications marked as read');
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      toast.error('Failed to mark all notifications as read');
    }
  };

  // Delete notification
  const deleteNotification = async (notificationId) => {
    try {
      await api.delete(`/notifications/${notificationId}`);
      dispatch({ type: 'DELETE_NOTIFICATION', payload: notificationId });
      toast.success('Notification deleted');
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('Failed to delete notification');
    }
  };

  // Get unread count
  const getUnreadCount = async () => {
    try {
      const response = await api.get('/notifications/unread-count');
      dispatch({
        type: 'SET_NOTIFICATIONS',
        payload: {
          notifications: state.notifications,
          unreadCount: response.data.unreadCount
        }
      });
      return response.data.unreadCount;
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const value = {
    ...state,
    joinUserRoom,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    getUnreadCount
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export default NotificationContext;
