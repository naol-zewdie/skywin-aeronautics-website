export interface Activity {
    id: string;
    action: string;
    entityType: 'user' | 'product' | 'service' | 'career' | 'system';
    entityId?: string;
    entityName?: string;
    userId: string;
    userName: string;
    details?: Record<string, any>;
    ipAddress?: string;
    createdAt: Date;
}
export declare class ActivityService {
    private activities;
    private readonly maxActivities;
    log(activity: Omit<Activity, 'id' | 'createdAt'>): Promise<Activity>;
    findAll(filters?: {
        entityType?: string;
        userId?: string;
        startDate?: Date;
        endDate?: Date;
        limit?: number;
    }): Promise<Activity[]>;
    getStats(): Promise<{
        totalToday: number;
        totalThisWeek: number;
        totalThisMonth: number;
        byEntityType: Record<string, number>;
        byAction: Record<string, number>;
    }>;
    logUserCreated(userName: string, userId: string, actorId: string, actorName: string): Promise<Activity>;
    logProductCreated(productName: string, productId: string, actorId: string, actorName: string): Promise<Activity>;
    logLogin(userId: string, userName: string, ipAddress?: string): Promise<Activity>;
    logLogout(userId: string, userName: string): Promise<Activity>;
}
