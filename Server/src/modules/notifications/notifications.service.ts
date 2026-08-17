import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import {
  Notification,
  NotificationDocument,
} from "./schemas/notification.schema";

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel(Notification.name)
    private notificationModel: Model<NotificationDocument>,
  ) {}

  async create(notification: {
    type: string;
    title: string;
    message: string;
    read: boolean;
    userId?: string;
  }): Promise<Notification> {
    return this.notificationModel.create(notification);
  }

  async findAll(userId?: string): Promise<Notification[]> {
    const query = userId
      ? { $or: [{ userId }, { userId: { $exists: false } }] }
      : {};
    return this.notificationModel
      .find(query)
      .sort({ createdAt: -1 })
      .lean()
      .exec() as Promise<Notification[]>;
  }

  async findUnread(userId?: string): Promise<Notification[]> {
    const all = await this.findAll(userId);
    return all.filter((n) => {
      if (n.userId) return !n.read;
      if (!userId) return !n.read;
      return !n.readBy?.includes(userId);
    });
  }

  async markAsRead(id: string, userId: string): Promise<Notification> {
    const isMongoId = /^[a-f\d]{24}$/i.test(id);
    if (!isMongoId) {
      throw new BadRequestException("Invalid ID format");
    }
    const notification = await this.notificationModel.findById(id).exec();
    if (!notification) {
      throw new NotFoundException("Notification not found");
    }

    if (notification.userId === userId) {
      notification.read = true;
    } else if (!notification.userId) {
      if (!notification.readBy) notification.readBy = [];
      if (!notification.readBy.includes(userId)) {
        notification.readBy.push(userId);
      }
    } else {
      throw new ForbiddenException("You cannot modify another user's notification");
    }
    return notification.save();
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationModel
      .updateMany({ userId, read: false }, { read: true })
      .exec();
    await this.notificationModel
      .updateMany(
        { userId: { $exists: false }, readBy: { $ne: userId } },
        { $push: { readBy: userId } },
      )
      .exec();
  }

  async remove(id: string, userId: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException("Invalid ID format");
    }
    const result = await this.notificationModel
      .findOneAndDelete({ _id: id, userId })
      .exec();
    return result !== null;
  }

  async notifyProductCreated(
    productName: string,
    userId?: string,
  ): Promise<Notification> {
    return this.create({
      type: "success",
      title: "Product Created",
      message: `Product "${productName}" has been created successfully.`,
      read: false,
      userId,
    });
  }

  async notifyUserCreated(
    userName: string,
    userId?: string,
  ): Promise<Notification> {
    return this.create({
      type: "success",
      title: "User Created",
      message: `User "${userName}" has been added to the system.`,
      read: false,
      userId,
    });
  }

  async notifyLowStock(
    productName: string,
    stock: number,
    userId?: string,
  ): Promise<Notification> {
    return this.create({
      type: "warning",
      title: "Low Stock Alert",
      message: `Product "${productName}" is running low on stock (${stock} remaining).`,
      read: false,
      userId,
    });
  }
}
