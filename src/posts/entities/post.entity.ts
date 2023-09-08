import {
  DateTimeType,
  Entity,
  ManyToOne,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';
import { User } from '../../users/entities/user.entity';
import { CreatePostDto } from '../dto/create-post.dto';

@Entity()
export class Post {
  @PrimaryKey({ autoincrement: true, columnType: 'int', unsigned: true })
  id: number;

  @Property({ length: 100, nullable: true })
  title: string;

  @Property({ type: 'text', nullable: true })
  description: string;

  @Property({ type: DateTimeType })
  date: Date = new Date();

  @Property({ length: 100, nullable: true })
  image: string;

  @Property({ length: 100, nullable: true })
  place: string;

  @Property({ columnType: 'double', default: 0 })
  lat!: number;

  @Property({ columnType: 'double', default: 0 })
  lng!: number;

  @Property({ columnType: 'tinyint', default: 0 })
  mood: number;

  @Property({ default: null })
  likes?: boolean;

  @Property({ persist: false })
  voted?: boolean;

  static fromDto(createPostDto: CreatePostDto): Post {
    const post = new Post();
    return Object.assign(post, createPostDto);
  }
}
