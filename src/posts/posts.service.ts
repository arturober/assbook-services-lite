import { EntityRepository, SelectQueryBuilder } from '@mikro-orm/mariadb';
import { InjectRepository } from '@mikro-orm/nestjs';
import {
  Inject,
  Injectable,
  NotFoundException
} from '@nestjs/common';
import { ImageService } from 'src/commons/image/image.service';
import { CreatePostDto } from './dto/create-post.dto';
import { LikePostDto } from './dto/like-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { LikePost } from './entities/like-post.entity';
import { Post } from './entities/post.entity';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepo: EntityRepository<Post>,
    @InjectRepository(LikePost)
    private readonly likePostRepo: EntityRepository<LikePost>,
    private readonly imageService: ImageService,
    @Inject('BING_TOKEN') private readonly bingToken: string,
  ) {}

  private createPostSelect(): SelectQueryBuilder<Post> {
    return this.postRepo
      .createQueryBuilder('p')
      .select('*')
      .addSelect(
        `likes IS NOT NULL AS voted`,
      );
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

  findByCreator(idUser: number) {
    return this.createPostSelect()
      .where({ creator: { id: idUser } })
      .getResultList();
  }

  async findOne(id: number) {
    const post = await this.createPostSelect()
      .where({ id })
      .getSingleResult();
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

O    const post = Post.fromDto(createPostDto);

    await this.postRepo.getEntityManager().persistAndFlush(post);
    post.voted = false;
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
    // let likePost = await this.likePostRepo.findOne({
    //   post: { id: idPost },
    //   user: { id: .id },
    // });
    // if (!likePost) {
    //   likePost = new LikePost();
    //   likePost.post = await this.postRepo.findOne(idPost);
    //   if (!likePost.post) {
    //     throw new NotFoundException({
    //       status: 404,
    //       error: 'Post not found',
    //     });
    //   }
    //   likePost.user = ;
    //   likePost.likes = likePostDto.likes;
    //   await this.likePostRepo.getEntityManager().persistAndFlush(likePost);
    //   likePost.post.totalLikes += likePost.likes ? 1 : -1;
    // } else {
    //   likePost.likes = likePostDto.likes;
    //   await this.likePostRepo.getEntityManager().flush();
    // }

    // return (await this.postRepo.findOne(idPost)).totalLikes;
    return null;
  }

  async deleteLikePost(postId: number) {
    // await this.likePostRepo
    //   .createQueryBuilder()
    //   .delete()
    //   .where({ user: { id: .id }, post: { id: postId } })
    //   .execute();
    // return (await this.postRepo.findOne(postId)).totalLikes;
    return null;
  }
}
