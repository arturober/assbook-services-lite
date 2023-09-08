import { ConnectionOptions } from '@mikro-orm/core';
import { User } from './users/entities/user.entity';
import { Post } from './posts/entities/post.entity';
import { LikePost } from './posts/entities/like-post.entity';
import { Comment } from './comments/entities/comment.entity';

export default {
  entities: [User, Post, LikePost, Comment],
  type: 'mariadb', // one of `mongo` | `mysql` | `mariadb` | `postgresql` | `sqlite`
  dbName: process.env.DB_DATABASE || 'assbook_lite',
  user: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || '',
  host: process.env.DB_SERVER_HOST || 'localhost',
  port: parseInt(process.env.DB_SERVER_PORT, 10) || 3306,
  debug: true,
} as ConnectionOptions;
