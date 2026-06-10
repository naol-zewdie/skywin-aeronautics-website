import { Injectable } from '@nestjs/common';

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

@Injectable()
export class ActivityService {
  private activities: Activity[] = [];
  private readonly maxActivities = 1000;

  async log(activity: Omit<Activity, 'id' | 'createdAt'>): Promise<Activity> {
    const newActivity: Activity = {
      ...activity,
      id: `act_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
    };
    
    this.activities.unshift(newActivity);
    
    // Keep only the most recent activities
    if (this.activities.length > this.maxActivities) {
      this.activities = this.activities.slice(0, this.maxActivities);
    }
    
    return newActivity;
  }

  async findAll(filters?: {
    entityType?: string;
    userId?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  }): Promise<Activity[]> {
    let results = [...this.activities];
    
    if (filters?.entityType) {
      results = results.filter(a => a.entityType === filters.entityType);
    }
    
    if (filters?.userId) {
      results = results.filter(a => a.userId === filters.userId);
    }
    
    const startDate = filters?.startDate;
    const endDate = filters?.endDate;
    
    if (startDate) {
      results = results.filter(a => a.createdAt >= startDate);
    }
    
    if (endDate) {
      results = results.filter(a => a.createdAt <= endDate);
    }
    
    if (filters?.limit) {
      results = results.slice(0, filters.limit);
    }
    
    return results;
  }

  async getStats(): Promise<{
    totalToday: number;
    totalThisWeek: number;
    totalThisMonth: number;
    byEntityType: Record<string, number>;
    byAction: Record<string, number>;
  }> {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    const byEntityType: Record<string, number> = {};
    const byAction: Record<string, number> = {};
    
    let totalToday = 0;
    let totalThisWeek = 0;
    let totalThisMonth = 0;
    
    for (const activity of this.activities) {
      // Count by entity type
      byEntityType[activity.entityType] = (byEntityType[activity.entityType] || 0) + 1;
      
      // Count by action
      byAction[activity.action] = (byAction[activity.action] || 0) + 1;
      
      // Time-based counts
      if (activity.createdAt >= today) totalToday++;
      if (activity.createdAt >= weekAgo) totalThisWeek++;
      if (activity.createdAt >= monthAgo) totalThisMonth++;
    }
    
    return {
      totalToday,
      totalThisWeek,
      totalThisMonth,
      byEntityType,
      byAction,
    };
  }

  // Convenience methods for common activities
  async logUserCreated(userName: string, userId: string, actorId: string, actorName: string): Promise<Activity> {
    return this.log({
      action: 'CREATE',
      entityType: 'user',
      entityId: userId,
      entityName: userName,
      userId: actorId,
      userName: actorName,
      details: { message: `Created user ${userName}` },
    });
  }

  async logProductCreated(productName: string, productId: string, actorId: string, actorName: string): Promise<Activity> {
    return this.log({
      action: 'CREATE',
      entityType: 'product',
      entityId: productId,
      entityName: productName,
      userId: actorId,
      userName: actorName,
      details: { message: `Created product ${productName}` },
    });
  }

  async logLogin(userId: string, userName: string, ipAddress?: string): Promise<Activity> {
    return this.log({
      action: 'LOGIN',
      entityType: 'system',
      userId,
      userName,
      ipAddress,
      details: { message: 'User logged in' },
    });
  }

  async logLogout(userId: string, userName: string): Promise<Activity> {
    return this.log({
      action: 'LOGOUT',
      entityType: 'system',
      userId,
      userName,
      details: { message: 'User logged out' },
    });
  }
}
