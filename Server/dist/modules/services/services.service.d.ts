import { Model } from 'mongoose';
import { CreateServiceDto } from './dto/create-service.dto';
import { ServiceDto } from './dto/service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { Service } from './schemas/service.schema';
export declare class ServicesService {
    private readonly serviceModel;
    constructor(serviceModel: Model<Service>);
    findAll(): Promise<ServiceDto[]>;
    findOne(id: string): Promise<ServiceDto>;
    create(payload: CreateServiceDto, userRole?: string): Promise<ServiceDto>;
    update(id: string, payload: UpdateServiceDto, userRole?: string): Promise<ServiceDto>;
    remove(id: string): Promise<void>;
    toggleStatus(id: string): Promise<ServiceDto>;
    exportToCsv(services: ServiceDto[]): string;
    exportToPdf(services: ServiceDto[]): Promise<Buffer>;
}
