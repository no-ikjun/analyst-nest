import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Message } from 'src/global/entities/message.entity';
import { User } from 'src/global/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    private readonly jwtService: JwtService,
  ) {}

  async findMessageByUserId(userId: number) {
    return this.messageRepository.find({
      where: {
        user: {
          id: userId,
        },
      },
    });
  }

  async setMessage(accessToken: string, url: string) {
    const userId = this.jwtService.decode(accessToken).id;
    const message = new Message();
    message.url = url;
    message.created_at = new Date();
    message.user = { id: userId } as User;
    return this.messageRepository.save(message);
  }
}
