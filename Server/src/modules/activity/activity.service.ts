import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Activity, ActivityDocument } from "./schemas/activity.schema";
import { User } from "../users/schemas/user.schema";
import { Product } from "../products/schemas/product.schema";
import { Service } from "../services/schemas/service.schema";
import { CareerOpening } from "../careers/schemas/career-opening.schema";

export interface DashboardStats {
  totalUsers: number;
  totalProducts: number;
  totalServices: number;
  activeJobs: number;
  recentActivity: {
    id: string;
    action: string;
    user: string;
    timestamp: string;
    entityType: string;
    entityId?: string;
  }[];
}

@Injectable()
export class ActivityService {
  constructor(
    @InjectModel(Activity.name)
    private activityModel: Model<ActivityDocument>,
    @InjectModel(User.name)
    private userModel: Model<User>,
    @InjectModel(Product.name)
    private productModel: Model<Product>,
    @InjectModel(Service.name)
    private serviceModel: Model<Service>,
    @InjectModel(CareerOpening.name)
    private careerModel: Model<CareerOpening>,
  ) {}

  async log(activity: {
    action: string;
    entityType: string;
    entityId?: string;
    entityName?: string;
    userId: string;
    userName: string;
    details?: Record<string, unknown>;
    ipAddress?: string;
  }): Promise<Activity> {
    return this.activityModel.create(activity);
  }

  async findAll(filters?: {
    entityType?: string;
    userId?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  }): Promise<Activity[]> {
    const query: Record<string, unknown> = {};

    if (filters?.entityType) {
      query.entityType = filters.entityType;
    }

    if (filters?.userId) {
      query.userId = filters.userId;
    }

    if (filters?.startDate || filters?.endDate) {
      query.createdAt = {};
      if (filters.startDate) {
        (query.createdAt as Record<string, unknown>)["$gte"] =
          filters.startDate;
      }
      if (filters.endDate) {
        (query.createdAt as Record<string, unknown>)["$lte"] = filters.endDate;
      }
    }

    return this.activityModel
      .find(query)
      .sort({ createdAt: -1 })
      .limit(filters?.limit ?? 50)
      .select("-ipAddress")
      .lean()
      .exec() as Promise<Activity[]>;
  }

  async getStats(userRole?: string, userId?: string): Promise<DashboardStats> {
    const isOperator = userRole === "operator" || userRole === "r_4b7e";
    const activityQuery: Record<string, unknown> =
      isOperator && userId ? { userId } : {};

    const [
      totalUsers,
      totalProducts,
      totalServices,
      activeJobs,
      recentActivities,
    ] = await Promise.all([
      this.userModel.countDocuments().exec(),
      this.productModel.countDocuments().exec(),
      this.serviceModel.countDocuments().exec(),
      this.careerModel.countDocuments({ status: true }).exec(),
      this.activityModel
        .find(activityQuery)
        .sort({ createdAt: -1 })
        .limit(20)
        .lean()
        .exec(),
    ]);

    return {
      totalUsers,
      totalProducts,
      totalServices,
      activeJobs,
      recentActivity: recentActivities.map((a) => ({
        id: a._id.toString(),
        action: a.action,
        user: a.userName,
        timestamp:
          a.createdAt instanceof Date
            ? a.createdAt.toISOString()
            : new Date(a.createdAt).toISOString(),
        entityType: a.entityType,
        entityId: a.entityId,
      })),
    };
  }


  async logUserCreated(
    userName: string,
    userId: string,
    actorId: string,
    actorName: string,
  ): Promise<Activity> {
    return this.log({
      action: "CREATE",
      entityType: "user",
      entityId: userId,
      entityName: userName,
      userId: actorId,
      userName: actorName,
      details: { message: `Created user ${userName}` },
    });
  }

  async logProductCreated(
    productName: string,
    productId: string,
    actorId: string,
    actorName: string,
  ): Promise<Activity> {
    return this.log({
      action: "CREATE",
      entityType: "product",
      entityId: productId,
      entityName: productName,
      userId: actorId,
      userName: actorName,
      details: { message: `Created product ${productName}` },
    });
  }

  async logLogin(
    userId: string,
    userName: string,
    ipAddress?: string,
  ): Promise<Activity> {
    return this.log({
      action: "LOGIN",
      entityType: "system",
      userId,
      userName,
      ipAddress,
      details: { message: "User logged in" },
    });
  }

  async logLogout(userId: string, userName: string): Promise<Activity> {
    return this.log({
      action: "LOGOUT",
      entityType: "system",
      userId,
      userName,
      details: { message: "User logged out" },
    });
  }
}
