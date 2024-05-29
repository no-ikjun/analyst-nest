import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/global/entities/user.entity';
import { DataSource, EntityManager } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { UserDataType } from 'src/global/types/response.type';

@Injectable()
export class UserRepository {
  constructor(
    private readonly dataSource: DataSource,
    private readonly jwtService: JwtService,
  ) {}

  async findOneByEmail(email: string): Promise<UserDataType> {
    const user = await this.dataSource.manager.findOne(User, {
      where: { email: email },
    });
    if (!user) return null;
    return { id: user.id, email: user.email, password: user.password };
  }

  async findOneByUserId(
    transctionEntityManager: EntityManager,
    id: number,
  ): Promise<UserDataType> {
    const user = await transctionEntityManager.findOne(User, {
      where: { id: id },
    });
    return { id: user.id, email: user.email, password: user.password };
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

  async getUserPref(transctionEntityManager, id: number): Promise<number> {
    const user = await transctionEntityManager.findOne(User, {
      where: { id: id },
    });
    return user.preference;
  }

  async setUserPref(
    transctionEntityManager: EntityManager,
    id: number,
    preference: number,
  ): Promise<number> {
    await transctionEntityManager.update(
      User,
      { id: id },
      { preference: preference },
    );
    return preference;
  }
}
