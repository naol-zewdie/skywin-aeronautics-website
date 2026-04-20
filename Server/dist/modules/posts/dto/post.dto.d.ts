import { ContentType } from '../schemas/post.schema';
export declare class PostDto {
    id: string;
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
}
