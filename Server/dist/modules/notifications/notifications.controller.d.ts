import { NotificationsService, Notification } from './notifications.service';
export declare class NotificationsController {
    private readonly notificationsService;
    constructor(notificationsService: NotificationsService);
    findAll(userId?: string): Promise<Notification[]>;
    findUnread(userId?: string): Promise<Notification[]>;
    getUnreadCount(userId?: string): Promise<{
        count: number;
    }>;
    markAsRead(id: string): Promise<Notification | null>;
    markAllAsRead(userId?: string): Promise<void>;
}
