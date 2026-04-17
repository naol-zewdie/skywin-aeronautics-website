import { HydratedDocument } from 'mongoose';
export type AuditDocument = HydratedDocument<Audit>;
export declare class Audit {
    createdBy: string;
    createdAt: Date;
    updatedBy: string;
    updatedAt: Date;
}
export declare const AuditSchema: import("mongoose").Schema<Audit, import("mongoose").Model<Audit, any, any, any, any, any, Audit>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Audit, import("mongoose").Document<unknown, {}, Audit, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<Audit & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, {
    createdBy?: import("mongoose").SchemaDefinitionProperty<string, Audit, import("mongoose").Document<unknown, {}, Audit, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Audit & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    createdAt?: import("mongoose").SchemaDefinitionProperty<Date, Audit, import("mongoose").Document<unknown, {}, Audit, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Audit & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    updatedBy?: import("mongoose").SchemaDefinitionProperty<string, Audit, import("mongoose").Document<unknown, {}, Audit, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Audit & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    updatedAt?: import("mongoose").SchemaDefinitionProperty<Date, Audit, import("mongoose").Document<unknown, {}, Audit, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Audit & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
}, Audit>;
