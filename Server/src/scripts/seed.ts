import { NestFactory } from "@nestjs/core";
import { AppModule } from "../app.module";
import { getModelToken } from "@nestjs/mongoose";
import { Model } from "mongoose";
import * as bcrypt from "bcrypt";
import { User } from "../modules/users/schemas/user.schema";

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const userModel = app.get<Model<User>>(getModelToken(User.name));

  // Security: Read seed credentials from environment variables — never hardcode emails.
  const SEED_PASSWORD = process.env.SEED_PASSWORD;
  if (!SEED_PASSWORD) {
    throw new Error("SEED_PASSWORD environment variable is required");
  }
  const SEED_ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL;
  const SEED_OPERATOR_EMAIL = process.env.SEED_OPERATOR_EMAIL;
  if (!SEED_ADMIN_EMAIL || !SEED_OPERATOR_EMAIL) {
    throw new Error(
      "SEED_ADMIN_EMAIL and SEED_OPERATOR_EMAIL environment variables are required",
    );
  }

  const adminPassword = await bcrypt.hash(SEED_PASSWORD, 12);
  const operatorPassword = await bcrypt.hash(SEED_PASSWORD, 12);

  const existingAdmin = await userModel
    .findOne({ email: SEED_ADMIN_EMAIL })
    .exec();
  if (!existingAdmin) {
    const admin = new userModel({
      fullName: process.env.SEED_ADMIN_NAME || "Admin User",
      email: SEED_ADMIN_EMAIL,
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
        `Admin user created successfully (email: ${SEED_ADMIN_EMAIL})`,
      );
    }
  } else {
    if (process.env.NODE_ENV !== "production") {
      console.log("Admin user already exists");
    }
  }

  const existingOperator = await userModel
    .findOne({ email: SEED_OPERATOR_EMAIL })
    .exec();
  if (!existingOperator) {
    const operator = new userModel({
      fullName: process.env.SEED_OPERATOR_NAME || "Operator User",
      email: SEED_OPERATOR_EMAIL,
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
        `Operator user created successfully (email: ${SEED_OPERATOR_EMAIL})`,
      );
    }
  } else {
    if (process.env.NODE_ENV !== "production") {
      console.log("Operator user already exists");
    }
  }

  await app.close();
}

bootstrap();
