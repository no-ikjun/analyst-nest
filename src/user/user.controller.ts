import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/user.dto';
import { User } from 'src/global/entities/user.entity';
import { UserDataType } from 'src/global/types/response.type';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('signup')
  async signup(@Body() data: CreateUserDto): Promise<User> {
    return await this.userService.setNewUser(data.email, data.password);
  }

  @UseGuards(AuthGuard)
  @Get()
  async getUserByToken(@Req() request): Promise<UserDataType> {
    return await this.userService.getUserByToken(request);
  }
}
