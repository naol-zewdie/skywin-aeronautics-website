import { Injectable } from '@nestjs/common';

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
  userId?: string;
}

@Injectable()
export class NotificationsService {
  private notifications: Notification[] = [];

  async create(notification: Omit<Notification, 'id' | 'createdAt'>): Promise<Notification> {
    const newNotification: Notification = {
      ...notification,
      id: `notif_${Date.now()}`,
      createdAt: new Date(),
    };
    this.notifications.push(newNotification);
    return newNotification;
  }

  async findAll(userId?: string): Promise<Notification[]> {
    if (userId) {
      return this.notifications
        .filter(n => n.userId === userId || !n.userId)
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }
    return this.notifications.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async findUnread(userId?: string): Promise<Notification[]> {
    const all = await this.findAll(userId);
    return all.filter(n => !n.read);
  }

  async markAsRead(id: string): Promise<Notification | null> {
    const notification = this.notifications.find(n => n.id === id);
    if (notification) {
      notification.read = true;
      return notification;
    }
    return null;
  }

  async markAllAsRead(userId?: string): Promise<void> {
    this.notifications
      .filter(n => (userId ? n.userId === userId || !n.userId : true) && !n.read)
      .forEach(n => n.read = true);
  }

  async remove(id: string): Promise<boolean> {
    const index = this.notifications.findIndex(n => n.id === id);
    if (index > -1) {
      this.notifications.splice(index, 1);
      return true;
    }
    return false;
  }

  // Helper methods for common notifications
  async notifyProductCreated(productName: string, userId?: string): Promise<Notification> {
    return this.create({
      type: 'success',
      title: 'Product Created',
      message: `Product "${productName}" has been created successfully.`,
      read: false,
      userId,
    });
  }

  async notifyUserCreated(userName: string, userId?: string): Promise<Notification> {
    return this.create({
      type: 'success',
      title: 'User Created',
      message: `User "${userName}" has been added to the system.`,
      read: false,
      userId,
    });
  }

  async notifyLowStock(productName: string, stock: number, userId?: string): Promise<Notification> {
    return this.create({
      type: 'warning',
      title: 'Low Stock Alert',
      message: `Product "${productName}" is running low on stock (${stock} remaining).`,
      read: false,
      userId,
    });
  }
}
