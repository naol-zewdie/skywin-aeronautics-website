import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
  Res,
  UseGuards,
  Req,
} from "@nestjs/common";
import {
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
  ApiBearerAuth,
} from "@nestjs/swagger";
import type { Response } from "express";
import { CreatePostDto } from "./dto/create-post.dto";
import { PostDto } from "./dto/post.dto";
import { UpdatePostDto } from "./dto/update-post.dto";
import { PostsService } from "./posts.service";
import { ContentType } from "./schemas/post.schema";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard, Roles, Role } from "../../common/guards/roles.guard";

const MAX_EXPORT_RECORDS = 10000;

/** Typed request shape after JWT validation has populated req.user. */
interface AuthenticatedRequest {
  user: {
    userId: string;
    email: string;
    role: string;
  };
}

@ApiTags("Posts")
@Controller("posts")
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth("JWT-auth")
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get()
  @Roles(Role.ADMIN, Role.OPERATOR, Role.VIEWER)
  @ApiOperation({
    summary: "List all posts with optional filters",
    description:
      "Get all posts with filtering by type, search, author, status, and tags",
  })
  @ApiQuery({
    name: "type",
    required: false,
    enum: ContentType,
    description: "Filter by content type (news, blog, event)",
  })
  @ApiQuery({
    name: "search",
    required: false,
    description: "Search in title, content, and excerpt",
  })
  @ApiQuery({
    name: "author",
    required: false,
    description: "Filter by author",
  })
  @ApiQuery({
    name: "status",
    required: false,
    description: "Filter by status (true/false)",
  })
  @ApiQuery({
    name: "tags",
    required: false,
    description: "Filter by tags (comma-separated)",
  })
  @ApiOkResponse({ type: PostDto, isArray: true })
  getPosts(
    @Req() req: AuthenticatedRequest,
    @Query("type") type?: ContentType,
    @Query("search") search?: string,
    @Query("author") author?: string,
    @Query("status") status?: string,
    @Query("tags") tags?: string,
  ): Promise<PostDto[]> {
    const tagArray = tags ? tags.split(",").map((t) => t.trim()) : undefined;
    return this.postsService.findAll(
      {
        type,
        search,
        author,
        status: status !== undefined ? status === "true" : undefined,
        tags: tagArray,
      },
      req.user?.role,
      req.user?.userId,
    );
  }

  @Get("by-type/:type")
  @Roles(Role.ADMIN, Role.OPERATOR, Role.VIEWER)
  @ApiOperation({ summary: "Get posts by content type" })
  @ApiParam({ name: "type", enum: ContentType, description: "Content type" })
  @ApiOkResponse({ type: PostDto, isArray: true })
  getPostsByType(
    @Param("type") type: ContentType,
    @Req() req: AuthenticatedRequest,
  ): Promise<PostDto[]> {
    return this.postsService.findByType(type, req.user?.role, req.user?.userId);
  }

  @Get("export/csv")
  @Roles(Role.ADMIN, Role.OPERATOR)
  @ApiOperation({ summary: "Export posts to CSV" })
  @ApiQuery({ name: "type", required: false, enum: ContentType })
  @ApiQuery({ name: "search", required: false })
  @ApiQuery({ name: "author", required: false })
  async exportCsv(
    @Res({ passthrough: true }) res: Response,
    @Req() req: AuthenticatedRequest,
    @Query("type") type?: ContentType,
    @Query("search") search?: string,
    @Query("author") author?: string,
  ): Promise<string> {
    const posts = await this.postsService.findAll(
      { type, search, author, limit: MAX_EXPORT_RECORDS },
      req.user?.role,
      req.user?.userId,
    );
    const csv = this.postsService.exportToCsv(posts);
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=posts.csv");
    return csv;
  }

  @Get("export/pdf")
  @Roles(Role.ADMIN, Role.OPERATOR)
  @ApiOperation({ summary: "Export posts to PDF" })
  @ApiQuery({ name: "type", required: false, enum: ContentType })
  @ApiQuery({ name: "search", required: false })
  @ApiQuery({ name: "author", required: false })
  async exportPdf(
    @Res({ passthrough: true }) res: Response,
    @Req() req: AuthenticatedRequest,
    @Query("type") type?: ContentType,
    @Query("search") search?: string,
    @Query("author") author?: string,
  ): Promise<Buffer> {
    const posts = await this.postsService.findAll(
      { type, search, author, limit: MAX_EXPORT_RECORDS },
      req.user?.role,
      req.user?.userId,
    );
    const pdfBuffer = await this.postsService.exportToPdf(posts);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=posts.pdf");
    return pdfBuffer;
  }

  @Get(":id")
  @Roles(Role.ADMIN, Role.OPERATOR, Role.VIEWER)
  @ApiOperation({ summary: "Get post by id" })
  @ApiParam({ name: "id", type: "string", description: "Post ID" })
  @ApiOkResponse({ type: PostDto })
  getPost(@Param("id") id: string, @Req() req: AuthenticatedRequest): Promise<PostDto> {
    return this.postsService.findOne(id, req.user?.role, req.user?.userId);
  }

  @Post()
  @Roles(Role.ADMIN, Role.OPERATOR)
  @ApiOperation({ summary: "Create new post" })
  @ApiCreatedResponse({ type: PostDto })
  createPost(@Body() payload: CreatePostDto, @Req() req: AuthenticatedRequest): Promise<PostDto> {
    return this.postsService.create(payload, req.user?.role, req.user?.userId);
  }

  @Patch(":id/toggle-status")
  @Roles(Role.ADMIN, Role.OPERATOR)
  @ApiOperation({ summary: "Toggle post status" })
  @ApiParam({ name: "id", type: "string", description: "Post ID" })
  @ApiOkResponse({ type: PostDto })
  togglePostStatus(@Param("id") id: string, @Req() req: AuthenticatedRequest): Promise<PostDto> {
    return this.postsService.toggleStatus(id, req.user?.role, req.user?.userId);
  }

  @Patch(":id")
  @Roles(Role.ADMIN, Role.OPERATOR)
  @ApiOperation({ summary: "Update post" })
  @ApiParam({ name: "id", type: "string", description: "Post ID" })
  @ApiOkResponse({ type: PostDto })
  updatePost(
    @Param("id") id: string,
    @Body() payload: UpdatePostDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<PostDto> {
    return this.postsService.update(
      id,
      payload,
      req.user?.role,
      req.user?.userId,
    );
  }

  @Delete(":id")
  @HttpCode(204)
  @Roles(Role.ADMIN, Role.OPERATOR)
  @ApiOperation({ summary: "Delete post" })
  @ApiParam({ name: "id", type: "string", description: "Post ID" })
  @ApiNoContentResponse({ description: "Post deleted" })
  removePost(@Param("id") id: string, @Req() req: AuthenticatedRequest): Promise<void> {
    return this.postsService.remove(id, req.user?.role, req.user?.userId);
  }
}
