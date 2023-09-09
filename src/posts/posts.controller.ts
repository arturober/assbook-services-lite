import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseInterceptors,
  ValidationPipe,
} from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { LikePostDto } from './dto/like-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostResponseInterceptor } from './interceptors/post-response.interceptor';
import { PostsService } from './posts.service';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  @UseInterceptors(PostResponseInterceptor)
  create(
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    createPostDto: CreatePostDto,
  ) {
    return this.postsService.create(createPostDto);
  }

  @Get()
  @UseInterceptors(PostResponseInterceptor)
  findAll() {
    return this.postsService.findAll();
  }

  @Get(':id')
  @UseInterceptors(PostResponseInterceptor)
  findOne(@Param('id', ParseIntPipe) postId: number) {
    return this.postsService.findOne(postId);
  }

  @Put(':id')
  @UseInterceptors(PostResponseInterceptor)
  update(
    @Param('id', ParseIntPipe) postId: number,
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    postDto: UpdatePostDto,
  ) {
    return this.postsService.update(postId, postDto);
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id', ParseIntPipe) postId: number) {
    await this.postsService.remove(postId);
  }

  @Post(':id/likes')
  @HttpCode(204)
  async likePost(
    @Param('id', ParseIntPipe) postId: number,
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    likeDto: LikePostDto,
  ) {
    await this.postsService.likePost(likeDto, postId);
  }

  @Delete(':id/likes')
  @HttpCode(204)
  async deleteLikePost(@Param('id', ParseIntPipe) postId: number) {
    await this.postsService.deleteLikePost(postId);
  }
}
