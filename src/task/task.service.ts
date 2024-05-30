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

  async sendRealTimeStockPrice() {
    const users = await this.userService.getAllUsers();
    const attachments = [];
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
        attachments.push({
          color: Number(stockPrice.prdy_ctrt) >= 0 ? '#2eb886' : '#ff0000',
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
        });
      }
      for (const messageUrl of messageUrlList) {
        await axios.post(messageUrl.url, {
          text: `[국내주식] ${user.email}님의 관심 종목 주가 알림`,
          username: 'AI Analyst',
          icon_emoji: ':robot_face:',
          attachments: attachments,
        });
      }
    }
  }

  async sendRealTimeForeignStockPrice() {
    const users = await this.userService.getAllUsers();
    const attachments = [];
    for (const user of users) {
      const interestList = await this.kisService.getForeignInterestListByUserId(
        user.id,
      );
      const messageUrlList = await this.messageService.findMessageByUserId(
        user.id,
      );
      for (const interestStock of interestList) {
        const stockPrice = await this.kisService.getRealTimeForeignStockPrice(
          interestStock.code,
        );
        attachments.push({
          color: Number(stockPrice.t_xrat) >= 0 ? '#2eb886' : '#ff0000',
          fields: [
            {
              title: '종목',
              value: interestStock.prdt_name,
              short: false,
            },
            {
              title: '현재가',
              value: Number(stockPrice.t_xprc).toLocaleString() + '원',
              short: false,
            },
            {
              title: '전일대비',
              value:
                Number(stockPrice.p_xdif).toLocaleString() +
                '원' +
                ' (' +
                stockPrice.t_xrat +
                '%)',
              short: false,
            },
          ],
        });
      }
      for (const messageUrl of messageUrlList) {
        await axios.post(messageUrl.url, {
          text: `[해외주식] ${user.email}님의 관심 종목 주가 알림`,
          username: 'AI Analyst',
          icon_emoji: ':robot_face:',
          attachments: attachments,
        });
      }
    }
  }

  // 매일 오전 10시에 실행
  @Cron('0 0 10 * * *', {
    timeZone: 'Asia/Seoul',
  })
  async handleCronAtStartOfMarket() {
    this.sendRealTimeStockPrice();
  }

  // 매일 오후 3시에 실행
  @Cron('0 0 15 * * *', {
    timeZone: 'Asia/Seoul',
  })
  handleCronAtEndOfMarket() {
    this.sendRealTimeStockPrice();
  }

  // 매일 오후 11시 30분에 실행
  @Cron('0 30 23 * * *', {
    timeZone: 'Asia/Seoul',
  })
  async handleCronAtStartOfAmericanMarket() {
    this.sendRealTimeForeignStockPrice();
  }

  // 매일 오전 6시에 실행
  @Cron('0 0 6 * * *', {
    timeZone: 'Asia/Seoul',
  })
  async handleCronAtEndOfAmericanMarket() {
    this.sendRealTimeForeignStockPrice();
  }
}
