import { Controller, Get, Post, Query, Req } from '@nestjs/common';
import { MessageService } from './message.service';

@Controller('message')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Get()
  async getMessage(@Query('userId') userId: number) {
    return this.messageService.findMessageByUserId(userId);
  }

  @Post()
  async setMessage(@Query('url') url: string, @Req() req) {
    const accessToken = req.headers.authorization.split(' ')[1];
    return this.messageService.setMessage(accessToken, url);
  }
}
