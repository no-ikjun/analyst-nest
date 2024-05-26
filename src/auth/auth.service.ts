import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserRepository } from 'src/user/user.repository';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { KisTokenResponseType } from 'src/global/types/response.type';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {}

  async login(email: string, password: string) {
    const user = await this.userRepository.findOneByEmail(email);
    if (user) {
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (isPasswordValid) {
        return {
          accessToken: await this.getJwtAccessToken(user.id, user.email),
        };
      } else {
        throw new HttpException('Password not match', HttpStatus.UNAUTHORIZED);
      }
    } else {
      throw new HttpException('User not found', HttpStatus.BAD_REQUEST);
    }
  }

  public async getJwtAccessToken(id: number, email: string): Promise<string> {
    const payload = { id: id, email: email };
    const jwtAccessTokenSecret = this.configService.get(
      'JWT_ACCESS_TOKEN_SECRET',
    );
    const jwtAccessTokenExpire = this.configService.get(
      'JWT_ACCESS_TOKEN_EXPIRATION_TIME',
    );
    return this.jwtService.sign(payload, {
      secret: jwtAccessTokenSecret,
      expiresIn: jwtAccessTokenExpire,
    });
  }
}
