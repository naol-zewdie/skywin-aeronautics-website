import { Injectable, NotFoundException, Optional } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { randomUUID } from 'crypto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserDto } from './dto/user.dto';
import { User } from './schemas/user.schema';

@Injectable()
export class UsersService {
  private readonly fallbackUsers: UserDto[] = [
    {
      id: 'u_001',
      fullName: 'Amelia Hart',
      email: 'amelia@skywin.aero',
      role: 'admin',
      status: true,
    },
    {
      id: 'u_002',
      fullName: 'Rohan Mehta',
      email: 'rohan@skywin.aero',
      role: 'operator',
      status: true,
    },
  ];

  constructor(
    @Optional()
    @InjectModel(User.name)
    private readonly userModel?: Model<User>,
  ) {}

  async findAll(): Promise<UserDto[]> {
    if (!this.userModel) {
      return this.fallbackUsers;
    }

    const users = await this.userModel.find().exec();
    return users.map(user => ({
      id: user._id.toString(),
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      status: user.status,
    }));
  }

  async findOne(id: string): Promise<UserDto> {
    if (!this.userModel) {
      const user = this.fallbackUsers.find((item) => item.id === id);
      if (!user) {
        throw new NotFoundException(`User with id ${id} not found`);
      }
      return user;
    }

    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return {
      id: user._id.toString(),
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      status: user.status,
    };
  }

  async create(payload: CreateUserDto): Promise<UserDto> {
    if (!this.userModel) {
      const created: UserDto = { id: randomUUID(), status: true, ...payload };
      this.fallbackUsers.push(created);
      return created;
    }

    const created = new this.userModel({
      ...payload,
      audit: {
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
    const saved = await created.save();
    return {
      id: saved._id.toString(),
      fullName: saved.fullName,
      email: saved.email,
      role: saved.role,
      status: saved.status,
    };
  }

  async update(id: string, payload: UpdateUserDto, currentUserId?: string): Promise<UserDto> {
    const targetUser = await this.findOne(id);

    // Prevent admin from editing another admin
    if (targetUser.role === 'admin' && currentUserId !== id) {
      throw new Error('Cannot edit another admin account');
    }

    if (!this.userModel) {
      const index = this.fallbackUsers.findIndex((item) => item.id === id);
      if (index === -1) {
        throw new NotFoundException(`User with id ${id} not found`);
      }

      this.fallbackUsers[index] = { ...this.fallbackUsers[index], ...payload };
      return this.fallbackUsers[index];
    }

    const updated = await this.userModel.findByIdAndUpdate(
      id,
      {
        ...payload,
        'audit.updatedAt': new Date(),
      },
      { new: true }
    ).exec();
    if (!updated) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return {
      id: updated._id.toString(),
      fullName: updated.fullName,
      email: updated.email,
      role: updated.role,
      status: updated.status,
    };
  }

  async remove(id: string, currentUserId?: string): Promise<void> {
    // Prevent deleting the logged-in user
    if (id === currentUserId) {
      throw new Error('Cannot delete your own account');
    }

    if (!this.userModel) {
      const index = this.fallbackUsers.findIndex((item) => item.id === id);
      if (index === -1) {
        throw new NotFoundException(`User with id ${id} not found`);
      }
      this.fallbackUsers.splice(index, 1);
      return;
    }

    const result = await this.userModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
  }
}
