import { Model } from 'mongoose';
import { CreateServiceDto } from './dto/create-service.dto';
import { ServiceDto } from './dto/service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { Service } from './schemas/service.schema';
export declare class ServicesService {
    private readonly serviceModel?;
    private readonly fallbackServices;
    constructor(serviceModel?: Model<Service> | undefined);
    findAll(): Promise<ServiceDto[]>;
    findOne(id: string): Promise<ServiceDto>;
    create(payload: CreateServiceDto): Promise<ServiceDto>;
    update(id: string, payload: UpdateServiceDto): Promise<ServiceDto>;
    remove(id: string): Promise<void>;
    exportToCsv(services: ServiceDto[]): string;
    exportToPdf(services: ServiceDto[]): Promise<Buffer>;
}
