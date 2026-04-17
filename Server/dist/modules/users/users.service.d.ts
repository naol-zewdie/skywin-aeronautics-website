import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserDto } from './dto/user.dto';
import { UserEntity } from './entities/user.entity';
import { Repository } from 'typeorm';
export declare class UsersService {
    private readonly usersRepository?;
    private readonly fallbackUsers;
    constructor(usersRepository?: Repository<UserEntity> | undefined);
    findAll(): Promise<UserDto[]>;
    findOne(id: string): Promise<UserDto>;
    create(payload: CreateUserDto): Promise<UserDto>;
    update(id: string, payload: UpdateUserDto): Promise<UserDto>;
    remove(id: string): Promise<void>;
}
