import { Injectable, NotFoundException, Optional } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'crypto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserDto } from './dto/user.dto';
import { UserEntity } from './entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
  private readonly fallbackUsers: UserDto[] = [
    {
      id: 'u_001',
      fullName: 'Amelia Hart',
      email: 'amelia@skywin.aero',
      role: 'admin',
    },
    {
      id: 'u_002',
      fullName: 'Rohan Mehta',
      email: 'rohan@skywin.aero',
      role: 'operator',
    },
  ];

  constructor(
    @Optional()
    @InjectRepository(UserEntity)
    private readonly usersRepository?: Repository<UserEntity>,
  ) {}

  async findAll(): Promise<UserDto[]> {
    if (!this.usersRepository) {
      return this.fallbackUsers;
    }

    return this.usersRepository.find();
  }

  async findOne(id: string): Promise<UserDto> {
    if (!this.usersRepository) {
      const user = this.fallbackUsers.find((item) => item.id === id);
      if (!user) {
        throw new NotFoundException(`User with id ${id} not found`);
      }
      return user;
    }

    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return user;
  }

  async create(payload: CreateUserDto): Promise<UserDto> {
    if (!this.usersRepository) {
      const created: UserDto = { id: randomUUID(), ...payload };
      this.fallbackUsers.push(created);
      return created;
    }

    const created = this.usersRepository.create(payload);
    return this.usersRepository.save(created);
  }

  async update(id: string, payload: UpdateUserDto): Promise<UserDto> {
    if (!this.usersRepository) {
      const index = this.fallbackUsers.findIndex((item) => item.id === id);
      if (index === -1) {
        throw new NotFoundException(`User with id ${id} not found`);
      }

      this.fallbackUsers[index] = { ...this.fallbackUsers[index], ...payload };
      return this.fallbackUsers[index];
    }

    const user = await this.findOne(id);
    const merged = this.usersRepository.merge(user, payload);
    return this.usersRepository.save(merged);
  }

  async remove(id: string): Promise<void> {
    if (!this.usersRepository) {
      const index = this.fallbackUsers.findIndex((item) => item.id === id);
      if (index === -1) {
        throw new NotFoundException(`User with id ${id} not found`);
      }
      this.fallbackUsers.splice(index, 1);
      return;
    }

    const result = await this.usersRepository.delete(id);
    if (!result.affected) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
  }
}
