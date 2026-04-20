"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsService = void 0;
const common_1 = require("@nestjs/common");
let NotificationsService = class NotificationsService {
    notifications = [];
    async create(notification) {
        const newNotification = {
            ...notification,
            id: `notif_${Date.now()}`,
            createdAt: new Date(),
        };
        this.notifications.push(newNotification);
        return newNotification;
    }
    async findAll(userId) {
        if (userId) {
            return this.notifications
                .filter(n => n.userId === userId || !n.userId)
                .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        }
        return this.notifications.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }
    async findUnread(userId) {
        const all = await this.findAll(userId);
        return all.filter(n => !n.read);
    }
    async markAsRead(id) {
        const notification = this.notifications.find(n => n.id === id);
        if (notification) {
            notification.read = true;
            return notification;
        }
        return null;
    }
    async markAllAsRead(userId) {
        this.notifications
            .filter(n => (userId ? n.userId === userId || !n.userId : true) && !n.read)
            .forEach(n => n.read = true);
    }
    async remove(id) {
        const index = this.notifications.findIndex(n => n.id === id);
        if (index > -1) {
            this.notifications.splice(index, 1);
            return true;
        }
        return false;
    }
    async notifyProductCreated(productName, userId) {
        return this.create({
            type: 'success',
            title: 'Product Created',
            message: `Product "${productName}" has been created successfully.`,
            read: false,
            userId,
        });
    }
    async notifyUserCreated(userName, userId) {
        return this.create({
            type: 'success',
            title: 'User Created',
            message: `User "${userName}" has been added to the system.`,
            read: false,
            userId,
        });
    }
    async notifyLowStock(productName, stock, userId) {
        return this.create({
            type: 'warning',
            title: 'Low Stock Alert',
            message: `Product "${productName}" is running low on stock (${stock} remaining).`,
            read: false,
            userId,
        });
    }
};
exports.NotificationsService = NotificationsService;
exports.NotificationsService = NotificationsService = __decorate([
    (0, common_1.Injectable)()
], NotificationsService);
//# sourceMappingURL=notifications.service.js.map