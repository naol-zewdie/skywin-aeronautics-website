import { HydratedDocument } from 'mongoose';
import { Audit } from '../../../common/schemas/audit.schema';
export declare enum ContentType {
    NEWS = "news",
    BLOG = "blog",
    EVENT = "event"
}
export type PostDocument = HydratedDocument<Post>;
export declare class Post {
    title: string;
    content: string;
    type: ContentType;
    author: string;
    excerpt?: string;
    coverImage?: string;
    tags?: string[];
    eventDate?: Date;
    eventLocation?: string;
    status: boolean;
    views?: number;
    audit: Audit;
}
export declare const PostSchema: import("mongoose").Schema<Post, import("mongoose").Model<Post, any, any, any, any, any, Post>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Post, import("mongoose").Document<unknown, {}, Post, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<Post & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, {
    title?: import("mongoose").SchemaDefinitionProperty<string, Post, import("mongoose").Document<unknown, {}, Post, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Post & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    content?: import("mongoose").SchemaDefinitionProperty<string, Post, import("mongoose").Document<unknown, {}, Post, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Post & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    type?: import("mongoose").SchemaDefinitionProperty<ContentType, Post, import("mongoose").Document<unknown, {}, Post, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Post & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    author?: import("mongoose").SchemaDefinitionProperty<string, Post, import("mongoose").Document<unknown, {}, Post, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Post & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    excerpt?: import("mongoose").SchemaDefinitionProperty<string | undefined, Post, import("mongoose").Document<unknown, {}, Post, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Post & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    coverImage?: import("mongoose").SchemaDefinitionProperty<string | undefined, Post, import("mongoose").Document<unknown, {}, Post, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Post & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    tags?: import("mongoose").SchemaDefinitionProperty<string[] | undefined, Post, import("mongoose").Document<unknown, {}, Post, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Post & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    eventDate?: import("mongoose").SchemaDefinitionProperty<Date | undefined, Post, import("mongoose").Document<unknown, {}, Post, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Post & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    eventLocation?: import("mongoose").SchemaDefinitionProperty<string | undefined, Post, import("mongoose").Document<unknown, {}, Post, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Post & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    status?: import("mongoose").SchemaDefinitionProperty<boolean, Post, import("mongoose").Document<unknown, {}, Post, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Post & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    views?: import("mongoose").SchemaDefinitionProperty<number | undefined, Post, import("mongoose").Document<unknown, {}, Post, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Post & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    audit?: import("mongoose").SchemaDefinitionProperty<Audit, Post, import("mongoose").Document<unknown, {}, Post, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Post & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
}, Post>;
