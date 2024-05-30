import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('foreign_interest')
export class ForeignInterest {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.interests)
  user: User;

  @Column()
  code: string;

  @Column()
  prdt_name: string;

  @Column()
  prdt_eng_name: string;

  @Column()
  created_at: Date;

  @Column({ default: true })
  is_active: boolean;
}
