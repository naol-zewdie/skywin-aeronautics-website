import { Model } from 'mongoose';
import { CreateCareerOpeningDto } from './dto/create-career-opening.dto';
import { CareerOpeningDto } from './dto/career-opening.dto';
import { UpdateCareerOpeningDto } from './dto/update-career-opening.dto';
import { CareerOpening } from './schemas/career-opening.schema';
export declare class CareersService {
    private readonly careerOpeningModel?;
    private readonly fallbackOpenings;
    constructor(careerOpeningModel?: Model<CareerOpening> | undefined);
    findAll(): Promise<CareerOpeningDto[]>;
    findOne(id: string): Promise<CareerOpeningDto>;
    create(payload: CreateCareerOpeningDto): Promise<CareerOpeningDto>;
    update(id: string, payload: UpdateCareerOpeningDto): Promise<CareerOpeningDto>;
    remove(id: string): Promise<void>;
    exportToCsv(openings: CareerOpeningDto[]): string;
    exportToPdf(openings: CareerOpeningDto[]): Promise<Buffer>;
}
