import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DataSource } from 'typeorm';
import { UserRepository } from './user.repository';

@Injectable()
export class UserService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly jwtService: JwtService,
    private readonly userRepository: UserRepository,
  ) {}

  async setNewUser(email: string, password: string) {
    return await this.userRepository.setNewUser(
      this.dataSource.manager,
      email,
      password,
    );
  }
}
