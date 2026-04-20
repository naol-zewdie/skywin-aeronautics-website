import type { Response } from 'express';
import { CreatePostDto } from './dto/create-post.dto';
import { PostDto } from './dto/post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostsService } from './posts.service';
import { ContentType } from './schemas/post.schema';
export declare class PostsController {
    private readonly postsService;
    constructor(postsService: PostsService);
    getPosts(type?: ContentType, search?: string, author?: string, status?: string, tags?: string): Promise<PostDto[]>;
    getPostsByType(type: ContentType): Promise<PostDto[]>;
    exportCsv(res: Response, type?: ContentType, search?: string, author?: string): Promise<void>;
    exportPdf(res: Response, type?: ContentType, search?: string, author?: string): Promise<void>;
    getPost(id: string): Promise<PostDto>;
    createPost(payload: CreatePostDto): Promise<PostDto>;
    updatePost(id: string, payload: UpdatePostDto): Promise<PostDto>;
    removePost(id: string): Promise<void>;
}
