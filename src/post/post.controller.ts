import { Request, Response } from 'express';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { PostService } from '@src/post/post.service';
import { AuthGuard } from '@src/auth/guards/auth.guard';
import { CreatePostDTO } from '@src/post/dto/create-post.dto';
import { UpdatePostDTO } from '@src/post/dto/update-post.dto';
import { PostGuard } from '@src/post/guards/post.guard';
import { PaginationQueryParams } from '@src/common/pagination-options.query';

@Controller('posts')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Get('')
  async index(@Query() queryParams?: PaginationQueryParams) {
    const posts = await this.postService.findAll(queryParams);
    return { data: posts };
  }

  @Get(':id')
  async show(@Param('id') id: string) {
    const post = await this.postService.findOne(id);
    return { data: post };
  }

  @Post('')
  @UseGuards(AuthGuard)
  async create(
    @Res({ passthrough: true }) res: Response,
    @Body() input: CreatePostDTO,
    @Req() req: Request
  ) {
    const createdPost = await this.postService.create(req.user!.id, input);
    res.statusCode = 201;
    return { data: createdPost };
  }

  @Patch(':id')
  @UseGuards(AuthGuard, PostGuard)
  async update(@Param('id') id: string, @Body() input: UpdatePostDTO) {
    const updatedPost = await this.postService.updateOne(id, input);
    return { data: updatedPost };
  }

  @Delete(':id')
  @UseGuards(AuthGuard, PostGuard)
  async destroy(@Param('id') id: string) {
    const result = await this.postService.deleteOne(id);
    return { success: result };
  }
}
