"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActivityService = void 0;
const common_1 = require("@nestjs/common");
let ActivityService = class ActivityService {
    activities = [];
    maxActivities = 1000;
    async log(activity) {
        const newActivity = {
            ...activity,
            id: `act_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            createdAt: new Date(),
        };
        this.activities.unshift(newActivity);
        if (this.activities.length > this.maxActivities) {
            this.activities = this.activities.slice(0, this.maxActivities);
        }
        return newActivity;
    }
    async findAll(filters) {
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
    async getStats() {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
        const byEntityType = {};
        const byAction = {};
        let totalToday = 0;
        let totalThisWeek = 0;
        let totalThisMonth = 0;
        for (const activity of this.activities) {
            byEntityType[activity.entityType] = (byEntityType[activity.entityType] || 0) + 1;
            byAction[activity.action] = (byAction[activity.action] || 0) + 1;
            if (activity.createdAt >= today)
                totalToday++;
            if (activity.createdAt >= weekAgo)
                totalThisWeek++;
            if (activity.createdAt >= monthAgo)
                totalThisMonth++;
        }
        return {
            totalToday,
            totalThisWeek,
            totalThisMonth,
            byEntityType,
            byAction,
        };
    }
    async logUserCreated(userName, userId, actorId, actorName) {
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
    async logProductCreated(productName, productId, actorId, actorName) {
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
    async logLogin(userId, userName, ipAddress) {
        return this.log({
            action: 'LOGIN',
            entityType: 'system',
            userId,
            userName,
            ipAddress,
            details: { message: 'User logged in' },
        });
    }
    async logLogout(userId, userName) {
        return this.log({
            action: 'LOGOUT',
            entityType: 'system',
            userId,
            userName,
            details: { message: 'User logged out' },
        });
    }
};
exports.ActivityService = ActivityService;
exports.ActivityService = ActivityService = __decorate([
    (0, common_1.Injectable)()
], ActivityService);
//# sourceMappingURL=activity.service.js.map