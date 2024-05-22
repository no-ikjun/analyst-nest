import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/global/entities/user.entity';
import { DataSource, EntityManager } from 'typeorm';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserRepository {
  constructor(
    private readonly dataSource: DataSource,
    private readonly jwtService: JwtService,
  ) {}

  async findOneByUserId(
    transctionEntityManager: EntityManager,
    id: number,
  ): Promise<User> {
    const user = await transctionEntityManager.findOne(User, {
      where: { id: id },
    });
    return user;
  }

  async setNewUser(
    transctionEntityManager: EntityManager,
    email: string,
    password: string,
  ): Promise<User> {
    const user = new User();
    user.email = email;
    user.password = await bcrypt.hash(password, 10);
    await transctionEntityManager.save(user);
    return user;
  }
}
