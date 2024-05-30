import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Interest } from './interest.entity';
import { Message } from './message.entity';

@Entity('user')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  email: string;

  @Column()
  password: string;

  @CreateDateColumn()
  created_at: Date;

  @OneToMany(() => Interest, (interest) => interest.user)
  interests: Interest[];

  @Column({ default: 1 })
  preference: number;

  @OneToMany(() => Message, (message) => message.user)
  message: Message[];
}
