import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DataSource } from 'typeorm';
import { UserRepository } from './user.repository';
import { Request } from 'express';

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

  async getUserByToken(request: Request) {
    const token = this.extractTokenFromHeader(request);
    if (!token)
      throw new HttpException('User not found', HttpStatus.BAD_REQUEST);
    const { id } = this.jwtService.verify(token);
    return await this.userRepository.findOneByUserId(
      this.dataSource.manager,
      id,
    );
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
