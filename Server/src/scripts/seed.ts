import { NestFactory } from "@nestjs/core";
import { AppModule } from "../app.module";
import { getModelToken } from "@nestjs/mongoose";
import { Model } from "mongoose";
import * as bcrypt from "bcrypt";
import { User } from "../modules/users/schemas/user.schema";

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const userModel = app.get<Model<User>>(getModelToken(User.name));

  // Hash passwords
  const SEED_PASSWORD = process.env.SEED_PASSWORD;
  if (!SEED_PASSWORD) {
    throw new Error("SEED_PASSWORD environment variable is required");
  }
  const adminPassword = await bcrypt.hash(SEED_PASSWORD, 12);
  const operatorPassword = await bcrypt.hash(SEED_PASSWORD, 12);

  // Check and create admin user
  const existingAdmin = await userModel
    .findOne({ email: "amelia@skywin.aero" })
    .exec();
  if (!existingAdmin) {
    const admin = new userModel({
      fullName: "Amelia Hart",
      email: "amelia@skywin.aero",
      password: adminPassword,
      role: "admin",
      status: true,
      audit: {
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    await admin.save();
    if (process.env.NODE_ENV !== "production") {
      console.log(
        "Admin user created successfully (email: amelia@skywin.aero)",
      );
    }
  } else {
    console.log("Admin user already exists");
  }

  // Check and create operator user
  const existingOperator = await userModel
    .findOne({ email: "operator@skywin.aero" })
    .exec();
  if (!existingOperator) {
    const operator = new userModel({
      fullName: "Operator User",
      email: "operator@skywin.aero",
      password: operatorPassword,
      role: "operator",
      status: true,
      audit: {
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    await operator.save();
    if (process.env.NODE_ENV !== "production") {
      console.log(
        "Operator user created successfully (email: operator@skywin.aero)",
      );
    }
  } else {
    console.log("Operator user already exists");
  }

  await app.close();
}

bootstrap();
