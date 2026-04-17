import { HydratedDocument } from 'mongoose';
import { Audit } from '../../../common/schemas/audit.schema';
export type CareerOpeningDocument = HydratedDocument<CareerOpening>;
export declare class CareerOpening {
    title: string;
    location: string;
    employmentType: string;
    description: string;
    status: boolean;
    audit: Audit;
}
export declare const CareerOpeningSchema: import("mongoose").Schema<CareerOpening, import("mongoose").Model<CareerOpening, any, any, any, any, any, CareerOpening>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, CareerOpening, import("mongoose").Document<unknown, {}, CareerOpening, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<CareerOpening & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, {
    title?: import("mongoose").SchemaDefinitionProperty<string, CareerOpening, import("mongoose").Document<unknown, {}, CareerOpening, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<CareerOpening & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    location?: import("mongoose").SchemaDefinitionProperty<string, CareerOpening, import("mongoose").Document<unknown, {}, CareerOpening, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<CareerOpening & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    employmentType?: import("mongoose").SchemaDefinitionProperty<string, CareerOpening, import("mongoose").Document<unknown, {}, CareerOpening, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<CareerOpening & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    description?: import("mongoose").SchemaDefinitionProperty<string, CareerOpening, import("mongoose").Document<unknown, {}, CareerOpening, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<CareerOpening & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    status?: import("mongoose").SchemaDefinitionProperty<boolean, CareerOpening, import("mongoose").Document<unknown, {}, CareerOpening, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<CareerOpening & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    audit?: import("mongoose").SchemaDefinitionProperty<Audit, CareerOpening, import("mongoose").Document<unknown, {}, CareerOpening, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<CareerOpening & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
}, CareerOpening>;
