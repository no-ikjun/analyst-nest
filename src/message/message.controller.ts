import { Controller, Get, Post, Query, Req, UseGuards } from '@nestjs/common';
import { MessageService } from './message.service';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('message')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @UseGuards(AuthGuard)
  @Get()
  async getMessage(@Query('userId') userId: number) {
    return this.messageService.findMessageByUserId(userId);
  }

  @Post()
  async setMessage(@Req() request, @Query('url') url: string) {
    const token = request.headers.authorization.split(' ')[1];
    return this.messageService.setMessage(token, url);
  }
}
