import { CreateCareerOpeningDto } from './dto/create-career-opening.dto';
import { CareerOpeningDto } from './dto/career-opening.dto';
import { UpdateCareerOpeningDto } from './dto/update-career-opening.dto';
import { CareerOpeningEntity } from './entities/career-opening.entity';
import { Repository } from 'typeorm';
export declare class CareersService {
    private readonly careersRepository?;
    private readonly fallbackOpenings;
    constructor(careersRepository?: Repository<CareerOpeningEntity> | undefined);
    findAll(): Promise<CareerOpeningDto[]>;
    findOne(id: string): Promise<CareerOpeningDto>;
    create(payload: CreateCareerOpeningDto): Promise<CareerOpeningDto>;
    update(id: string, payload: UpdateCareerOpeningDto): Promise<CareerOpeningDto>;
    remove(id: string): Promise<void>;
}
