import { HttpService } from '@nestjs/axios';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { firstValueFrom } from 'rxjs';
import { Interest } from 'src/global/entities/interest.entity';
import { KisToken } from 'src/global/entities/kistoken.entity';
import { KisTokenResponseType } from 'src/global/types/response.type';
import { MoreThan, Repository } from 'typeorm';
import { BalanceSheetType } from './types/balanceSheet.type';
import { OperatingProfitType } from './types/operatingProfit.type';
import { FinancialRatioType } from './types/financialRatio.type';
import { ProfitRatioType } from './types/profitRatio.type';
import { GrowthRatioType } from './types/growthRatio.type';
import { RealTimePriceType } from './types/realtimePrice.type';

@Injectable()
export class KisService {
  constructor(
    @InjectRepository(KisToken)
    private readonly kisTokenRepository: Repository<KisToken>,
    @InjectRepository(Interest)
    private readonly interestRepository: Repository<Interest>,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
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

  async addInterest(stockCode: string, accessToken: string): Promise<Interest> {
    const existingInterest = await this.getInterestByCode(
      stockCode,
      accessToken,
    );
    if (existingInterest) {
      throw new HttpException('Already added', HttpStatus.BAD_REQUEST);
    }
    const stockInfo = await this.getKisStockInfo(stockCode);
    const userId = this.jwtService.decode(accessToken).id;
    const interest = this.interestRepository.create({
      code: stockCode,
      std_pdno: stockInfo.output.std_pdno,
      prdt_name: stockInfo.output.prdt_name,
      prdt_abrv_name: stockInfo.output.prdt_abrv_name,
      prdt_eng_name: stockInfo.output.prdt_eng_name,
      cd_name: stockInfo.output.idx_bztp_scls_cd_name,
      user: { id: userId },
      created_at: new Date(),
    });
    await this.interestRepository.save(interest);
    return interest;
  }

  async getInterestList(accessToken: string): Promise<Interest[]> {
    const userId = this.jwtService.decode(accessToken).id;
    return await this.interestRepository.find({
      where: { user: { id: userId } },
    });
  }

  async getInterestByCode(
    stockCode: string,
    accessToken: string,
  ): Promise<Interest> {
    const userId = this.jwtService.decode(accessToken).id;
    return await this.interestRepository.findOne({
      where: { user: { id: userId }, code: stockCode },
    });
  }

  async deleteInterest(stockCode: string, accessToken: string) {
    const interest = await this.getInterestByCode(stockCode, accessToken);
    if (!interest) {
      throw new HttpException('Not found', HttpStatus.BAD_REQUEST);
    }
    await this.interestRepository.delete(interest);
    return interest;
  }

  ///대차대조표 조회
  async getBalanceSheet(stockCode: string): Promise<BalanceSheetType[]> {
    const kisToken = await this.getKisToken();
    try {
      const response = await firstValueFrom(
        this.httpService.get(
          `${this.baseUrl}/uapi/domestic-stock/v1/finance/balance-sheet?fid_input_iscd=${stockCode}&FID_DIV_CLS_CODE=1&fid_cond_mrkt_div_code=J`,
          {
            headers: {
              Authorization: `Bearer ${kisToken.access_token}`,
              appkey: this.configService.get('KIS_APP_KEY'),
              appsecret: this.configService.get('KIS_APP_SECRET'),
              custtype: 'P',
              'Content-Type': 'application/json',
              tr_id: 'FHKST66430100',
            },
          },
        ),
      );
      if (response.data.rt_cd !== '0') {
        return [];
      }
      return response.data.output;
    } catch (error) {
      console.error(error);
      throw new HttpException(
        'KIS Balance Sheet request failed',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  ///손익계산서 조회
  async getOperatingProfit(stockCode: string): Promise<OperatingProfitType[]> {
    const kisToken = await this.getKisToken();
    try {
      const response = await firstValueFrom(
        this.httpService.get(
          `${this.baseUrl}/uapi/domestic-stock/v1/finance/income-statement?fid_input_iscd=${stockCode}&FID_DIV_CLS_CODE=1&fid_cond_mrkt_div_code=J`,
          {
            headers: {
              Authorization: `Bearer ${kisToken.access_token}`,
              appkey: this.configService.get('KIS_APP_KEY'),
              appsecret: this.configService.get('KIS_APP_SECRET'),
              custtype: 'P',
              'Content-Type': 'application/json',
              tr_id: 'FHKST66430200',
            },
          },
        ),
      );
      if (response.data.rt_cd !== '0') {
        return [];
      }
      return response.data.output;
    } catch (error) {
      console.error(error);
      throw new HttpException(
        'KIS Operating Profit request failed',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  //재무비율 조회
  async getFinancialRatio(stockCode: string): Promise<FinancialRatioType[]> {
    const kisToken = await this.getKisToken();
    try {
      const response = await firstValueFrom(
        this.httpService.get(
          `${this.baseUrl}/uapi/domestic-stock/v1/finance/financial-ratio?fid_input_iscd=${stockCode}&FID_DIV_CLS_CODE=1&fid_cond_mrkt_div_code=J`,
          {
            headers: {
              Authorization: `Bearer ${kisToken.access_token}`,
              appkey: this.configService.get('KIS_APP_KEY'),
              appsecret: this.configService.get('KIS_APP_SECRET'),
              custtype: 'P',
              'Content-Type': 'application/json',
              tr_id: 'FHKST66430300',
            },
          },
        ),
      );
      if (response.data.rt_cd !== '0') {
        return [];
      }
      return response.data.output;
    } catch (error) {
      console.error(error);
      throw new HttpException(
        'KIS Financial Ratio request failed',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  ///수익성비율 조회
  async getProfitRatio(stockCode: string): Promise<ProfitRatioType[]> {
    const kisToken = await this.getKisToken();
    try {
      const response = await firstValueFrom(
        this.httpService.get(
          `${this.baseUrl}/uapi/domestic-stock/v1/finance/profit-ratio?fid_input_iscd=${stockCode}&FID_DIV_CLS_CODE=1&fid_cond_mrkt_div_code=J`,
          {
            headers: {
              Authorization: `Bearer ${kisToken.access_token}`,
              appkey: this.configService.get('KIS_APP_KEY'),
              appsecret: this.configService.get('KIS_APP_SECRET'),
              custtype: 'P',
              'Content-Type': 'application/json',
              tr_id: 'FHKST66430400',
            },
          },
        ),
      );
      if (response.data.rt_cd !== '0') {
        return [];
      }
      return response.data.output;
    } catch (error) {
      console.error(error);
      throw new HttpException(
        'KIS Profit Ratio request failed',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  ///안정성 비율 조회
  async getStabilityRatio(stockCode: string) {
    const kisToken = await this.getKisToken();
    try {
      const response = await firstValueFrom(
        this.httpService.get(
          `${this.baseUrl}/uapi/domestic-stock/v1/finance/stability-ratio?fid_input_iscd=${stockCode}&FID_DIV_CLS_CODE=1&fid_cond_mrkt_div_code=J`,
          {
            headers: {
              Authorization: `Bearer ${kisToken.access_token}`,
              appkey: this.configService.get('KIS_APP_KEY'),
              appsecret: this.configService.get('KIS_APP_SECRET'),
              custtype: 'P',
              'Content-Type': 'application/json',
              tr_id: 'FHKST66430600',
            },
          },
        ),
      );
      if (response.data.rt_cd !== '0') {
        return [];
      }
      return response.data.output;
    } catch (error) {
      console.error(error);
      throw new HttpException(
        'KIS Stability Ratio request failed',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  ///성장성 비율 조회
  async getGrowthRatio(stockCode: string): Promise<GrowthRatioType[]> {
    const kisToken = await this.getKisToken();
    try {
      const response = await firstValueFrom(
        this.httpService.get(
          `${this.baseUrl}/uapi/domestic-stock/v1/finance/growth-ratio?fid_input_iscd=${stockCode}&FID_DIV_CLS_CODE=1&fid_cond_mrkt_div_code=J`,
          {
            headers: {
              Authorization: `Bearer ${kisToken.access_token}`,
              appkey: this.configService.get('KIS_APP_KEY'),
              appsecret: this.configService.get('KIS_APP_SECRET'),
              custtype: 'P',
              'Content-Type': 'application/json',
              tr_id: 'FHKST66430800',
            },
          },
        ),
      );
      if (response.data.rt_cd !== '0') {
        return [];
      }
      return response.data.output;
    } catch (error) {
      console.error(error);
      throw new HttpException(
        'KIS Growth Ratio request failed',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  ///실시간 주가 조회
  async getRealTimeStockPrice(stockCode: string): Promise<RealTimePriceType> {
    const kisToken = await this.getKisToken();
    try {
      const response = await firstValueFrom(
        this.httpService.get(
          `${this.baseUrl}/uapi/domestic-stock/v1/quotations/inquire-price?FID_INPUT_ISCD=${stockCode}&FID_COND_MRKT_DIV_CODE=J`,
          {
            headers: {
              Authorization: `Bearer ${kisToken.access_token}`,
              appkey: this.configService.get('KIS_APP_KEY'),
              appsecret: this.configService.get('KIS_APP_SECRET'),
              custtype: 'P',
              'Content-Type': 'application/json',
              tr_id: 'FHKST01010100',
            },
          },
        ),
      );
      return {
        stck_prpr: response.data.output.stck_prpr,
        prdy_vrss: response.data.output.prdy_vrss,
        prdy_ctrt: response.data.output.prdy_ctrt,
      };
    } catch (error) {
      console.error(error);
      throw new HttpException(
        'KIS Stock Info request failed',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
