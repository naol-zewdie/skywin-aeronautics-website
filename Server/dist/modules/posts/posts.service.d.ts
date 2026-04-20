import { Model } from 'mongoose';
import { CreatePostDto } from './dto/create-post.dto';
import { PostDto } from './dto/post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Post, ContentType } from './schemas/post.schema';
export declare class PostsService {
    private readonly postModel?;
    private readonly fallbackPosts;
    constructor(postModel?: Model<Post> | undefined);
    findAll(filters?: {
        type?: ContentType;
        search?: string;
        author?: string;
        status?: boolean;
        tags?: string[];
    }): Promise<PostDto[]>;
    findByType(type: ContentType): Promise<PostDto[]>;
    findOne(id: string): Promise<PostDto>;
    create(payload: CreatePostDto): Promise<PostDto>;
    update(id: string, payload: UpdatePostDto): Promise<PostDto>;
    remove(id: string): Promise<void>;
    exportToCsv(posts: PostDto[]): string;
    exportToPdf(posts: PostDto[]): Promise<Buffer>;
    private mapToDto;
}
