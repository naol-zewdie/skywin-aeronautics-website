import type { Response } from 'express';
import { CreateCareerOpeningDto } from './dto/create-career-opening.dto';
import { CareerOpeningDto } from './dto/career-opening.dto';
import { UpdateCareerOpeningDto } from './dto/update-career-opening.dto';
import { CareersService } from './careers.service';
export declare class CareersController {
    private readonly careersService;
    constructor(careersService: CareersService);
    getOpenings(): Promise<CareerOpeningDto[]>;
    getOpening(id: string): Promise<CareerOpeningDto>;
    createOpening(payload: CreateCareerOpeningDto, req: any): Promise<CareerOpeningDto>;
    toggleOpeningStatus(id: string): Promise<CareerOpeningDto>;
    updateOpening(id: string, payload: UpdateCareerOpeningDto, req: any): Promise<CareerOpeningDto>;
    removeOpening(id: string): Promise<void>;
    exportCsv(res: Response, search?: string): Promise<void>;
    exportPdf(res: Response, search?: string): Promise<void>;
}
