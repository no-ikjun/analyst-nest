import { HttpService } from '@nestjs/axios';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { firstValueFrom } from 'rxjs';
import { KisToken } from 'src/global/entities/kistoken.entity';
import { KisTokenResponseType } from 'src/global/types/response.type';
import { MoreThan, Repository } from 'typeorm';

@Injectable()
export class KisService {
  constructor(
    @InjectRepository(KisToken)
    private readonly kisTokenRepository: Repository<KisToken>,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  private baseUrl = 'https://openapi.koreainvestment.com:9443';

  async getKisToken(): Promise<KisTokenResponseType> {
    const existingToken = await this.kisTokenRepository.findOne({
      where: { access_token_token_expired: MoreThan(new Date()) },
      order: { access_token_token_expired: 'DESC' },
    });
    if (existingToken) {
      return {
        access_token: existingToken.access_token.toString(),
        token_type: existingToken.token_type,
        expires_in: existingToken.expires_in,
        access_token_expired:
          existingToken.access_token_token_expired.toString(),
      };
    }

    const kisAppKey = this.configService.get('KIS_APP_KEY');
    const kisAppSecret = this.configService.get('KIS_APP_SECRET');
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.baseUrl}/oauth2/tokenP`, {
          grant_type: 'client_credentials',
          appkey: kisAppKey,
          appsecret: kisAppSecret,
        }),
      );
      const tokenResponse = response.data as KisTokenResponseType;

      const tokenExpirationDate = new Date();
      tokenExpirationDate.setSeconds(
        tokenExpirationDate.getSeconds() + tokenResponse.expires_in,
      );

      const newToken = this.kisTokenRepository.create({
        access_token: Buffer.from(tokenResponse.access_token),
        token_type: tokenResponse.token_type,
        expires_in: tokenResponse.expires_in,
        access_token_token_expired: tokenExpirationDate,
      });

      await this.kisTokenRepository.save(newToken);

      return tokenResponse;
    } catch (error) {
      console.error(error);
      throw new HttpException(
        'KIS Token request failed',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async getKisStockInfo(stockCode: string) {
    const kisToken = await this.getKisToken();
    try {
      const response = await firstValueFrom(
        this.httpService.get(
          `${this.baseUrl}/uapi/domestic-stock/v1/quotations/search-stock-info?PDNO=${stockCode}&PRDT_TYPE_CD=300`,
          {
            headers: {
              Authorization: `Bearer ${kisToken.access_token}`,
              appkey: this.configService.get('KIS_APP_KEY'),
              appsecret: this.configService.get('KIS_APP_SECRET'),
              custtype: 'P',
              'Content-Type': 'application/json',
              tr_id: 'CTPF1002R',
            },
          },
        ),
      );
      return response.data;
    } catch (error) {
      console.error(error);
      throw new HttpException(
        'KIS Stock Info request failed',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}