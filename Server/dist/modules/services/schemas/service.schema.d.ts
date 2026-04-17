import { HydratedDocument } from 'mongoose';
import { Audit } from '../../../common/schemas/audit.schema';
export type ServiceDocument = HydratedDocument<Service>;
export declare class Service {
    name: string;
    description: string;
    status: boolean;
    audit: Audit;
}
export declare const ServiceSchema: import("mongoose").Schema<Service, import("mongoose").Model<Service, any, any, any, any, any, Service>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Service, import("mongoose").Document<unknown, {}, Service, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<Service & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, {
    name?: import("mongoose").SchemaDefinitionProperty<string, Service, import("mongoose").Document<unknown, {}, Service, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Service & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    description?: import("mongoose").SchemaDefinitionProperty<string, Service, import("mongoose").Document<unknown, {}, Service, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Service & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    status?: import("mongoose").SchemaDefinitionProperty<boolean, Service, import("mongoose").Document<unknown, {}, Service, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Service & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    audit?: import("mongoose").SchemaDefinitionProperty<Audit, Service, import("mongoose").Document<unknown, {}, Service, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Service & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
}, Service>;
