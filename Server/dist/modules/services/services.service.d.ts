import { CreateServiceDto } from './dto/create-service.dto';
import { ServiceDto } from './dto/service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { ServiceEntity } from './entities/service.entity';
import { Repository } from 'typeorm';
export declare class ServicesService {
    private readonly servicesRepository?;
    private readonly fallbackServices;
    constructor(servicesRepository?: Repository<ServiceEntity> | undefined);
    findAll(): Promise<ServiceDto[]>;
    findOne(id: string): Promise<ServiceDto>;
    create(payload: CreateServiceDto): Promise<ServiceDto>;
    update(id: string, payload: UpdateServiceDto): Promise<ServiceDto>;
    remove(id: string): Promise<void>;
}
