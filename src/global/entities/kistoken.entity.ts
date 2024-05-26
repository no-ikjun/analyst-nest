import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('kistoken')
export class KisToken {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('blob')
  access_token: string;

  @Column()
  token_type: string;

  @Column()
  expires_in: number;

  @Column()
  access_token_token_expired: Date;
}
