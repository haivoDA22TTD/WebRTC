import { useNotificationStore } from '../stores/notificationStore';
import type { Notification } from '../stores/notificationStore';
import { useAuthStore } from '../stores/authStore';

const NOTIFICATION_URL = import.meta.env.VITE_NOTIFICATION_URL || 'http://localhost:8086';
const NOTIFICATION_WS_URL = import.meta.env.VITE_NOTIFICATION_WS_URL || 'ws://localhost:8086/ws/notifications';

class NotificationService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  // Connect to WebSocket for real-time notifications
  connect() {
    const user = useAuthStore.getState().user;
    if (!user) return;

    const url = `${NOTIFICATION_WS_URL}?userId=${user.id}`;
    this.ws = new WebSocket(url);

    this.ws.onopen = () => {
      console.log('Notification WebSocket connected');
      this.reconnectAttempts = 0;
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'notification') {
          useNotificationStore.getState().addNotification(data.data);
        }
      } catch (e) {
        console.error('Failed to parse notification:', e);
      }
    };

    this.ws.onclose = () => {
      console.log('Notification WebSocket disconnected');
      this.attemptReconnect();
    };

    this.ws.onerror = (error) => {
      console.error('Notification WebSocket error:', error);
    };
  }

  private attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) return;

    this.reconnectAttempts++;
    setTimeout(() => {
      this.connect();
    }, 2000 * this.reconnectAttempts);
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  // REST API calls
  async getNotifications(page = 0, size = 20): Promise<Notification[]> {
    const user = useAuthStore.getState().user;
    if (!user) return [];

    try {
      const response = await fetch(
        `${NOTIFICATION_URL}/api/notifications/user/${user.id}?page=${page}&size=${size}`
      );
      if (!response.ok) throw new Error('Failed to fetch notifications');
      const data = await response.json();
      return data.content || [];
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
  }

  async getUnreadCount(): Promise<number> {
    const user = useAuthStore.getState().user;
    if (!user) return 0;

    try {
      const response = await fetch(
        `${NOTIFICATION_URL}/api/notifications/user/${user.id}/unread/count`
      );
      if (!response.ok) throw new Error('Failed to fetch unread count');
      const data = await response.json();
      return data.count || 0;
    } catch (error) {
      console.error('Error fetching unread count:', error);
      return 0;
    }
  }

  async markAsRead(notificationId: string): Promise<void> {
    try {
      await fetch(`${NOTIFICATION_URL}/api/notifications/${notificationId}/read`, {
        method: 'PUT',
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }

  async markAllAsRead(): Promise<void> {
    const user = useAuthStore.getState().user;
    if (!user) return;

    try {
      await fetch(`${NOTIFICATION_URL}/api/notifications/user/${user.id}/read-all`, {
        method: 'PUT',
      });
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  }
}

export const notificationService = new NotificationService();
