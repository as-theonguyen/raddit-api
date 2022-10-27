import { Request, Response } from 'express';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@src/auth/guards/auth.guard';
import { CommentService } from '@src/comment/comment.service';
import { CommentGuard } from '@src/comment/guards/comment.guard';
import { CreateCommentDTO } from '@src/comment/dto/create-comment.dto';

@Controller('posts/:postId/comments')
export class PostCommentController {
  constructor(private readonly commentService: CommentService) {}

  @Get('')
  async index(@Param('postId') postId: string) {
    const comments = await this.commentService.findAllCommentsByPost(postId);
    return { data: comments };
  }

  @Post('')
  @UseGuards(AuthGuard)
  async create(
    @Req() req: Request,
    @Param('postId') postId: string,
    @Body() input: CreateCommentDTO
  ) {
    const comment = await this.commentService.create(
      req.user!.id,
      postId,
      input
    );

    return { data: comment };
  }
}

@Controller('comments')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Delete(':id')
  @UseGuards(AuthGuard, CommentGuard)
  async destroy(@Param('id') id: string) {
    const result = await this.commentService.deleteOne({ id });
    return { success: result };
  }
}
