import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AppService {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  getHello(): string {
    return 'Hello World!';
  }

  async fetchApiData(query: string) {
    const serviceKey = this.configService.get<string>('SERVICE_KEY');
    try {
      const response = await firstValueFrom(
        this.httpService.get(
          `https://apis.data.go.kr/1160100/service/GetStockSecuritiesInfoService/getStockPriceInfo?serviceKey=${serviceKey}&numOfRows=5&pageNo=1&resultType=json&likeItmsNm=${query}`,
        ),
      );
      return response.data;
    } catch (error) {
      console.error(error);
      throw new Error('API request failed');
    }
  }

  async testGpt() {
    const openai = new OpenAI();
    const completion = await openai.chat.completions.create({
      messages: [{ role: 'system', content: 'You are a helpful assistant.' }],
      model: 'gpt-3.5-turbo',
    });
    return completion;
  }
}
