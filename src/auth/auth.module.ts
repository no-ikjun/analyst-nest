import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserRepository } from 'src/user/user.repository';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    JwtModule.register({
      global: true,
    }),
    HttpModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, UserRepository, JwtService],
})
export class AuthModule {}
