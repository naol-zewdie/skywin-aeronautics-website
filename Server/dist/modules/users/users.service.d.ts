import { Model } from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserDto } from './dto/user.dto';
import { User } from './schemas/user.schema';
export declare class UsersService {
    private readonly userModel;
    constructor(userModel: Model<User>);
    findAll(): Promise<UserDto[]>;
    findOne(id: string): Promise<UserDto>;
    create(payload: CreateUserDto): Promise<UserDto>;
    update(id: string, payload: UpdateUserDto, currentUserId?: string): Promise<UserDto>;
    remove(id: string, currentUserId?: string): Promise<void>;
    exportToCsv(users: UserDto[]): string;
    exportToPdf(users: UserDto[]): Promise<Buffer>;
}
