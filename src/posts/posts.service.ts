import { EntityRepository, SelectQueryBuilder } from '@mikro-orm/mariadb';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ImageService } from 'src/commons/image/image.service';
import { CreatePostDto } from './dto/create-post.dto';
import { LikePostDto } from './dto/like-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Post } from './entities/post.entity';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepo: EntityRepository<Post>,
    private readonly imageService: ImageService,
    @Inject('BING_TOKEN') private readonly bingToken: string,
  ) {}

  private createPostSelect(): SelectQueryBuilder<Post> {
    return this.postRepo.createQueryBuilder('p').select('*');
  }

  private checkPostExist(post: Post) {
    if (!post) {
      throw new NotFoundException({
        status: 404,
        error: 'Post not found',
      });
    }
  }

  findAll() {
    return this.createPostSelect().getResultList();
  }

  async findOne(id: number) {
    const post = await this.createPostSelect().where({ id }).getSingleResult();
    if (!post) {
      throw new NotFoundException({
        status: 404,
        error: 'Post not found',
      });
    }
    return post;
  }

  async create(createPostDto: CreatePostDto) {
    if (createPostDto.lat && createPostDto.lng) {
      const latlon = createPostDto.lat + ',' + createPostDto.lng;
      const img = `https://dev.virtualearth.net/REST/v1/Imagery/Map/Road/${latlon}/15?mapSize=800,400&pp=${latlon};66&mapLayer=Basemap,Buildings&key=${this.bingToken}`;
      createPostDto.image = await this.imageService.downloadImage('posts', img);
    } else if (createPostDto.image) {
      createPostDto.image = await this.imageService.saveImage(
        'posts',
        createPostDto.image,
      );
    }

    const post = Post.fromDto(createPostDto);

    await this.postRepo.getEntityManager().persistAndFlush(post);
    return post;
  }

  async update(id: number, updatePostDto: UpdatePostDto) {
    const post = await this.findOne(id);
    this.checkPostExist(post);
    if (
      updatePostDto.lat &&
      updatePostDto.lng &&
      (updatePostDto.lat != post.lat || updatePostDto.lng != post.lng)
    ) {
      const latlon = updatePostDto.lat + ',' + updatePostDto.lng;
      const img = `https://dev.virtualearth.net/REST/v1/Imagery/Map/Road/${latlon}/15?mapSize=800,400&pp=${latlon};66&mapLayer=Basemap,Buildings&key=${this.bingToken}`;
      post.image = await this.imageService.downloadImage('posts', img);
    } else if (updatePostDto.image && !updatePostDto.image.startsWith('http')) {
      post.image = await this.imageService.saveImage(
        'posts',
        updatePostDto.image,
      );
    }
    post.place = updatePostDto.place;
    post.title = updatePostDto.title;
    post.description = updatePostDto.description;
    this.postRepo.getEntityManager().flush();
    return post;
  }

  async remove(id: number) {
    const post = await this.findOne(id);
    this.checkPostExist(post);
    await this.postRepo.getEntityManager().removeAndFlush(post);
  }

  async likePost(likePostDto: LikePostDto, idPost: number) {
    const post = await this.findOne(idPost);
    this.checkPostExist(post);
    post.likes = likePostDto.likes;
    await this.postRepo.getEntityManager().flush();
  }

  async deleteLikePost(postId: number) {
    const post = await this.findOne(postId);
    this.checkPostExist(post);
    post.likes = null;
    await this.postRepo.getEntityManager().flush();
  }
}
