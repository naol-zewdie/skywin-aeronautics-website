import { ContentType } from '../schemas/post.schema';
export declare class CreatePostDto {
    title: string;
    content: string;
    type: ContentType;
    author: string;
    excerpt?: string;
    coverImage?: string;
    tags?: string[];
    eventDate?: Date;
    eventLocation?: string;
    status?: boolean;
}
