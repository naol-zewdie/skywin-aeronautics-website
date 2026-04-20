export interface Notification {
    id: string;
    type: 'info' | 'success' | 'warning' | 'error';
    title: string;
    message: string;
    read: boolean;
    createdAt: Date;
    userId?: string;
}
export declare class NotificationsService {
    private notifications;
    create(notification: Omit<Notification, 'id' | 'createdAt'>): Promise<Notification>;
    findAll(userId?: string): Promise<Notification[]>;
    findUnread(userId?: string): Promise<Notification[]>;
    markAsRead(id: string): Promise<Notification | null>;
    markAllAsRead(userId?: string): Promise<void>;
    remove(id: string): Promise<boolean>;
    notifyProductCreated(productName: string, userId?: string): Promise<Notification>;
    notifyUserCreated(userName: string, userId?: string): Promise<Notification>;
    notifyLowStock(productName: string, stock: number, userId?: string): Promise<Notification>;
}
