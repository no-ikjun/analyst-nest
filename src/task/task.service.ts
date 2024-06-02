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
    for (const user of users) {
      const interestList = await this.kisService.getInterestListByUserId(
        user.id,
      );
      const messageUrlList = await this.messageService.findMessageByUserId(
        user.id,
      );
      const attachments = [];
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
          text: `*[국내주식]*\n${
            user.email.split('@')[0]
          }님의 관심 종목 주가 알림`,
          username: 'AI Analyst',
          attachments: attachments,
        });
      }
    }
  }

  async sendRealTimeForeignStockPrice() {
    const users = await this.userService.getAllUsers();
    for (const user of users) {
      const interestList = await this.kisService.getForeignInterestListByUserId(
        user.id,
      );
      const messageUrlList = await this.messageService.findMessageByUserId(
        user.id,
      );
      const attachments = [];
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
          text: `*[해외주식]*\n${
            user.email.split('@')[0]
          }님의 관심 종목 주가 알림`,
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
                  title: `[포트폴리오 비중 계산] ${
                    user.email.split('@')[0]
                  }님의 관심 종목 리포트`,
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

  async generateSingleStockReport() {
    const users = await this.userService.getAllUsers();
    for (const user of users) {
      const interestList = await this.kisService.getInterestListByUserId(
        user.id,
      );
      const randomInterestIndex = Math.floor(
        Math.random() * interestList.length,
      );
      const interest = interestList[randomInterestIndex];
      const interestStockPrice = await this.kisService.getRealTimeStockPrice(
        interest.code,
      );
      const balanceSheet = await this.kisService.getBalanceSheet(interest.code);
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
      const report = await this.gptService.generateSingleStockReport(
        interest,
        interestStockPrice.stck_prpr,
        balanceSheet[0],
        incomeStatement[0],
        financialRatio[0],
        profitRatio[0],
        stabilityRatio[0],
        growthRatio[0],
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
                  title: `[단일 종목 분석 리포트] ${
                    user.email.split('@')[0]
                  }님의 관심 종목 리포트`,
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

  // 평일 오전 10시에 실행
  // 한국장 시작 직후
  @Cron('0 0 10 * * 1-5', {
    timeZone: 'Asia/Seoul',
  })
  async handleCronAtStartOfMarket() {
    this.sendRealTimeStockPrice();
  }

  // 평일 오전 12시 30분에 실행
  // 한국장 중간 점검
  @Cron('0 30 12 * * 1-5', {
    timeZone: 'Asia/Seoul',
  })
  async handleCronAtMiddleOfMarket() {
    this.sendRealTimeStockPrice();
  }

  // 평일 오후 3시에 실행
  // 한국장 종료 직전
  @Cron('0 0 15 * * 1-5', {
    timeZone: 'Asia/Seoul',
  })
  handleCronAtEndOfMarket() {
    this.sendRealTimeStockPrice();
  }

  // 평일 오후 11시 30분에 실행
  // 미국장 시작 직후
  @Cron('0 30 23 * * 1-5', {
    timeZone: 'Asia/Seoul',
  })
  async handleCronAtStartOfAmericanMarket() {
    this.sendRealTimeForeignStockPrice();
  }

  // 평일 오전 2시 30분에 실행
  // 미국장 중간 점검
  @Cron('0 30 2 * * 1-5', {
    timeZone: 'Asia/Seoul',
  })
  async handleCronAtMiddleOfAmericanMarket() {
    this.sendRealTimeForeignStockPrice();
  }

  // 평일 오전 6시에 실행
  // 미국장 종료 직전
  @Cron('0 0 6 * * 1-5', {
    timeZone: 'Asia/Seoul',
  })
  async handleCronAtEndOfAmericanMarket() {
    this.sendRealTimeForeignStockPrice();
  }

  @Cron('0 0 8 * * 1', {
    timeZone: 'Asia/Seoul',
  })
  // 매월 첫째 주 월요일 오전 8시
  handleCronFirstMondayOfMonth() {
    const now = new Date();
    const day = now.getDate();
    const weekDay = now.getDay();
    const isFirstWeek = day <= 7;

    if (isFirstWeek && weekDay === 1) {
      this.generateReport();
    }
  }
}
