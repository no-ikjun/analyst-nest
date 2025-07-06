import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('article')
export class Article {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  topic: string;

  @Column()
  difficulty: string;

  @Column('text')
  article: string;

  @Column('text')
  vector: string;
  @Column('text')
  sources: string;

  @CreateDateColumn()
  createdAt: Date;
}
