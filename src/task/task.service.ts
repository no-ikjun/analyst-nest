import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import axios from 'axios';
import { KisService } from 'src/kis/kis.service';
import { MessageService } from 'src/message/message.service';
import { UserService } from 'src/user/user.service';

@Injectable()
export class TaskService {
  constructor(
    private readonly kisService: KisService,
    private readonly userService: UserService,
    private readonly messageService: MessageService,
  ) {}
  // 매일 오전 10시에 실행
  @Cron('0 30 14 * * *', {
    timeZone: 'Asia/Seoul',
  })
  async handleCronAtNoon() {
    const users = await this.userService.getAllUsers();
    for (const user of users) {
      const interestList = await this.kisService.getInterestListByUserId(
        user.id,
      );
      const messageUrlList = await this.messageService.findMessageByUserId(
        user.id,
      );
      for (const interestStock of interestList) {
        const stockPrice = await this.kisService.getRealTimeStockPrice(
          interestStock.code,
        );
        for (const messageUrl of messageUrlList) {
          await axios.post(messageUrl.url, {
            text: '관심 종목 주가 알림',
            username: 'AI Analyst',
            icon_emoji: ':robot_face:',
            attachments: [
              {
                color: '#2eb886',
                fields: [
                  {
                    title: '종목',
                    value: interestStock.prdt_abrv_name,
                    short: false,
                  },
                  {
                    title: '현재가',
                    value: Number(stockPrice.stck_prpr).toLocaleString() + '원',
                    short: false,
                  },
                  {
                    title: '전일대비',
                    value:
                      Number(stockPrice.prdy_vrss).toLocaleString() +
                      '원' +
                      ' (' +
                      stockPrice.prdy_ctrt +
                      '%)',
                    short: false,
                  },
                ],
              },
            ],
          });
        }
      }
    }
  }

  // 매일 오후 3시에 실행
  @Cron('0 0 15 * * *', {
    timeZone: 'Asia/Seoul',
  })
  handleCronAtOnePM() {
    console.log('매일 낮 1시에 실행되는 작업');
    // 여기에 원하는 작업을 추가하세요
  }
}
