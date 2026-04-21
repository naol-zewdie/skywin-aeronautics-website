import type { Response } from 'express';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserDto } from './dto/user.dto';
import { UsersService } from './users.service';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    getUsers(): Promise<UserDto[]>;
    getUser(id: string): Promise<UserDto>;
    createUser(payload: CreateUserDto): Promise<UserDto>;
    updateUser(id: string, payload: UpdateUserDto): Promise<UserDto>;
    removeUser(id: string): Promise<void>;
    exportCsv(res: Response, search?: string): Promise<void>;
    exportPdf(res: Response, search?: string): Promise<void>;
}
