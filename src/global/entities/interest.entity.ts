import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('interest')
export class Interest {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.interests)
  user: User;

  @Column()
  code: string;

  @Column()
  std_pdno: string;

  @Column()
  prdt_name: string;

  @Column()
  prdt_abrv_name: string;

  @Column()
  prdt_eng_name: string;

  @Column()
  cd_name: string;

  @Column()
  created_at: Date;

  @Column({ default: true })
  is_active: boolean;
}
