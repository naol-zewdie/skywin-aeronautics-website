import { Model } from 'mongoose';
import { CreateCareerOpeningDto } from './dto/create-career-opening.dto';
import { CareerOpeningDto } from './dto/career-opening.dto';
import { UpdateCareerOpeningDto } from './dto/update-career-opening.dto';
import { CareerOpening } from './schemas/career-opening.schema';
export declare class CareersService {
    private readonly careerOpeningModel;
    constructor(careerOpeningModel: Model<CareerOpening>);
    findAll(): Promise<CareerOpeningDto[]>;
    findOne(id: string): Promise<CareerOpeningDto>;
    create(payload: CreateCareerOpeningDto, userRole?: string): Promise<CareerOpeningDto>;
    update(id: string, payload: UpdateCareerOpeningDto, userRole?: string): Promise<CareerOpeningDto>;
    remove(id: string): Promise<void>;
    toggleStatus(id: string): Promise<CareerOpeningDto>;
    exportToCsv(openings: CareerOpeningDto[]): string;
    exportToPdf(openings: CareerOpeningDto[]): Promise<Buffer>;
}
