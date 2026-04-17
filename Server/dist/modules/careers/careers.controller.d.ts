import { CreateCareerOpeningDto } from './dto/create-career-opening.dto';
import { CareerOpeningDto } from './dto/career-opening.dto';
import { UpdateCareerOpeningDto } from './dto/update-career-opening.dto';
import { CareersService } from './careers.service';
export declare class CareersController {
    private readonly careersService;
    constructor(careersService: CareersService);
    getOpenings(): Promise<CareerOpeningDto[]>;
    getOpening(id: string): Promise<CareerOpeningDto>;
    createOpening(payload: CreateCareerOpeningDto): Promise<CareerOpeningDto>;
    updateOpening(id: string, payload: UpdateCareerOpeningDto): Promise<CareerOpeningDto>;
    removeOpening(id: string): Promise<void>;
}
