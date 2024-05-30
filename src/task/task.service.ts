import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import axios from 'axios';
import { GptService } from 'src/gpt/gpt.service';
import { KisService } from 'src/kis/kis.service';
import { MessageService } from 'src/message/message.service';
import { UserService } from 'src/user/user.service';

@Injectable()
export class TaskService {
  constructor(
    private readonly kisService: KisService,
    private readonly userService: UserService,
    private readonly messageService: MessageService,
    private readonly gptService: GptService,
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
          text: `*[국내주식]*\n${user.email}님의 관심 종목 주가 알림`,
          username: 'AI Analyst',
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
                Number(stockPrice.t_xdif).toLocaleString() +
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
          text: `*[해외주식]*\n${user.email}님의 관심 종목 주가 알림`,
          username: 'AI Analyst',
          attachments: attachments,
        });
      }
    }
  }

  async generateReport() {
    const users = await this.userService.getAllUsers();
    for (const user of users) {
      const interestList = await this.kisService.getInterestListByUserId(
        user.id,
      );
      const balanceSheets = [];
      const incomeStatements = [];
      const financialRatios = [];
      const profitRatios = [];
      const stabilityRatios = [];
      const growthRatios = [];
      for (const interest of interestList) {
        const balanceSheet = await this.kisService.getBalanceSheet(
          interest.code,
        );
        const incomeStatement = await this.kisService.getOperatingProfit(
          interest.code,
        );
        const financialRatio = await this.kisService.getFinancialRatio(
          interest.code,
        );
        const profitRatio = await this.kisService.getProfitRatio(interest.code);
        const stabilityRatio = await this.kisService.getStabilityRatio(
          interest.code,
        );
        const growthRatio = await this.kisService.getGrowthRatio(interest.code);
        balanceSheets.push(balanceSheet[0]);
        incomeStatements.push(incomeStatement[0]);
        financialRatios.push(financialRatio[0]);
        profitRatios.push(profitRatio[0]);
        stabilityRatios.push(stabilityRatio[0]);
        growthRatios.push(growthRatio[0]);
      }
      const report = await this.gptService.generateFinancialReport(
        interestList,
        balanceSheets,
        incomeStatements,
        financialRatios,
        profitRatios,
        stabilityRatios,
        growthRatios,
      );
      const messageUrlList = await this.messageService.findMessageByUserId(
        user.id,
      );
      for (const messageUrl of messageUrlList) {
        await axios.post(messageUrl.url, {
          username: 'AI Analyst',
          attachments: [
            {
              fields: [
                {
                  title: `*[리포트]* ${user.email}님의 관심 종목 리포트`,
                  value: report.choices[0].message.content,
                  short: false,
                },
              ],
            },
          ],
        });
      }
    }
  }

  // 매일 오전 10시에 실행
  // 한국장 시작 직후
  @Cron('0 0 10 * * *', {
    timeZone: 'Asia/Seoul',
  })
  async handleCronAtStartOfMarket() {
    this.sendRealTimeStockPrice();
  }

  // 매일 오후 3시에 실행
  // 한국장 종료 직전
  @Cron('0 0 15 * * *', {
    timeZone: 'Asia/Seoul',
  })
  handleCronAtEndOfMarket() {
    this.sendRealTimeStockPrice();
  }

  // 매일 오후 11시 30분에 실행
  // 미국장 시작 직후
  @Cron('0 30 23 * * *', {
    timeZone: 'Asia/Seoul',
  })
  async handleCronAtStartOfAmericanMarket() {
    this.sendRealTimeForeignStockPrice();
  }

  // 매일 오전 2시 30분에 실행
  // 미국장 중간 점검
  @Cron('0 30 2 * * *', {
    timeZone: 'Asia/Seoul',
  })
  async handleCronAtMiddleOfAmericanMarket() {
    this.sendRealTimeForeignStockPrice();
  }

  // 매일 오전 6시에 실행
  // 미국장 종료 직전
  @Cron('0 0 6 * * *', {
    timeZone: 'Asia/Seoul',
  })
  async handleCronAtEndOfAmericanMarket() {
    this.sendRealTimeForeignStockPrice();
  }

  @Cron('0 55 3 * * *', {
    timeZone: 'Asia/Seoul',
  })
  async sendFinancialReport() {
    this.generateReport();
  }
}
