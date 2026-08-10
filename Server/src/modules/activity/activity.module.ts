import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { ActivityService } from "./activity.service";
import { ActivityController } from "./activity.controller";
import { Activity, ActivitySchema } from "./schemas/activity.schema";
import { User, UserSchema } from "../users/schemas/user.schema";
import { Product, ProductSchema } from "../products/schemas/product.schema";
import { Service, ServiceSchema } from "../services/schemas/service.schema";
import {
  CareerOpening,
  CareerOpeningSchema,
} from "../careers/schemas/career-opening.schema";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Activity.name, schema: ActivitySchema },
      { name: User.name, schema: UserSchema },
      { name: Product.name, schema: ProductSchema },
      { name: Service.name, schema: ServiceSchema },
      { name: CareerOpening.name, schema: CareerOpeningSchema },
    ]),
  ],
  providers: [ActivityService],
  controllers: [ActivityController],
  exports: [ActivityService],
})
export class ActivityModule {}
