import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User } from '../modules/users/schemas/user.schema';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  
  const userModel = app.get<Model<User>>(getModelToken(User.name));

  // Hash passwords
  const adminPassword = await bcrypt.hash('admin123A', 12);
  const operatorPassword = await bcrypt.hash('admin123A', 12);

  // Check and create admin user
  const existingAdmin = await userModel.findOne({ email: 'amelia@skywin.aero' }).exec();
  if (!existingAdmin) {
    const admin = new userModel({
      fullName: 'Amelia Hart',
      email: 'amelia@skywin.aero',
      password: adminPassword,
      role: 'admin',
      status: true,
      audit: {
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
    
    await admin.save();
    console.log('Admin user created successfully (email: amelia@skywin.aero, password: admin123A)');
  } else {
    console.log('Admin user already exists');
  }

  // Check and create operator user
  const existingOperator = await userModel.findOne({ email: 'operator@skywin.aero' }).exec();
  if (!existingOperator) {
    const operator = new userModel({
      fullName: 'Operator User',
      email: 'operator@skywin.aero',
      password: operatorPassword,
      role: 'operator',
      status: true,
      audit: {
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
    
    await operator.save();
    console.log('Operator user created successfully (email: operator@skywin.aero, password: admin123A)');
  } else {
    console.log('Operator user already exists');
  }

  await app.close();
}

bootstrap();