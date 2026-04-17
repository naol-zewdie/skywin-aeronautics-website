import { CreateServiceDto } from './dto/create-service.dto';
import { ServiceDto } from './dto/service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { ServicesService } from './services.service';
export declare class ServicesController {
    private readonly servicesService;
    constructor(servicesService: ServicesService);
    getServices(): Promise<ServiceDto[]>;
    getService(id: string): Promise<ServiceDto>;
    createService(payload: CreateServiceDto): Promise<ServiceDto>;
    updateService(id: string, payload: UpdateServiceDto): Promise<ServiceDto>;
    removeService(id: string): Promise<void>;
}
