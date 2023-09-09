import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { CommonsModule } from 'src/commons/commons.module';
import { Post } from './entities/post.entity';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';

@Module({
  imports: [MikroOrmModule.forFeature([Post]), CommonsModule],
  controllers: [PostsController],
  providers: [PostsService],
})
export class PostsModule {}
