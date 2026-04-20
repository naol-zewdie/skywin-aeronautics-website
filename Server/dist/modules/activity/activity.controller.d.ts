import { ActivityService, Activity } from './activity.service';
export declare class ActivityController {
    private readonly activityService;
    constructor(activityService: ActivityService);
    findAll(entityType?: string, userId?: string, startDate?: string, endDate?: string, limit?: string): Promise<Activity[]>;
    getStats(): Promise<{
        totalToday: number;
        totalThisWeek: number;
        totalThisMonth: number;
        byEntityType: Record<string, number>;
        byAction: Record<string, number>;
    }>;
    getRecent(limit?: string): Promise<Activity[]>;
}
