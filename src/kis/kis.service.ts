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
import {
  ForeignRealTimePriceType,
  RealTimePriceType,
} from './types/realtimePrice.type';
import { ForeignInterest } from 'src/global/entities/foreignInterest.entity';

@Injectable()
export class KisService {
  constructor(
    @InjectRepository(KisToken)
    private readonly kisTokenRepository: Repository<KisToken>,
    @InjectRepository(Interest)
    private readonly interestRepository: Repository<Interest>,
    @InjectRepository(ForeignInterest)
    private readonly foreignInterestRepository: Repository<ForeignInterest>,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  private baseUrl = 'https://openapi.koreainvestment.com:9443';

  ///KIS 토큰 발급
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

  ///[국내주식] 주식 기본 정보
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

  ///[해외주식] 주식 기본 정보
  async getKisForeignStockInfo(stockCode: string) {
    const kisToken = await this.getKisToken();
    try {
      const response = await firstValueFrom(
        this.httpService.get(
          `${this.baseUrl}/uapi/overseas-price/v1/quotations/search-info?PDNO=${stockCode}&PRDT_TYPE_CD=512`,
          {
            headers: {
              Authorization: `Bearer ${kisToken.access_token}`,
              appkey: this.configService.get('KIS_APP_KEY'),
              appsecret: this.configService.get('KIS_APP_SECRET'),
              custtype: 'P',
              'Content-Type': 'application/json',
              tr_id: 'CTPF1702R',
            },
          },
        ),
      );
      return response.data;
    } catch (error) {
      console.error(error);
      throw new HttpException(
        'KIS Forien Stock Info request failed',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  ///[국내주식] 관심종목 추가
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

  ///[해외주식] 관심 종목 추가
  async addForeignInterest(
    stockCode: string,
    accessToken: string,
  ): Promise<ForeignInterest> {
    const existingInterest = await this.getForeignInterestByCode(
      stockCode,
      accessToken,
    );
    if (existingInterest) {
      throw new HttpException('Already added', HttpStatus.BAD_REQUEST);
    }
    const stockInfo = await this.getKisForeignStockInfo(stockCode);
    const userId = this.jwtService.decode(accessToken).id;
    const interest = this.foreignInterestRepository.create({
      code: stockCode,
      prdt_name: stockInfo.output.prdt_name,
      prdt_eng_name: stockInfo.output.prdt_eng_name,
      user: { id: userId },
      created_at: new Date(),
    });
    await this.foreignInterestRepository.save(interest);
    return interest;
  }

  ///[국내주식] 나의 관심종목 조회 (토큰)
  async getInterestList(accessToken: string): Promise<Interest[]> {
    const userId = this.jwtService.decode(accessToken).id;
    return await this.interestRepository.find({
      where: { user: { id: userId } },
    });
  }

  ///[해외주식] 나의 관심종목 조회 (토큰)
  async getForeignInterestList(
    accessToken: string,
  ): Promise<ForeignInterest[]> {
    const userId = this.jwtService.decode(accessToken).id;
    return await this.foreignInterestRepository.find({
      where: { user: { id: userId } },
    });
  }

  ///[국내주식] 나의 관심종목 조회 (아이디)
  async getInterestListByUserId(userId: number): Promise<Interest[]> {
    return await this.interestRepository.find({
      where: { user: { id: userId } },
    });
  }

  ///[해외주식] 나의 관심종목 조회 (아이디)
  async getForeignInterestListByUserId(
    userId: number,
  ): Promise<ForeignInterest[]> {
    return await this.foreignInterestRepository.find({
      where: { user: { id: userId } },
    });
  }

  ///[국내주식] 특정 종목 정보 조회
  async getInterestByCode(
    stockCode: string,
    accessToken: string,
  ): Promise<Interest> {
    const userId = this.jwtService.decode(accessToken).id;
    return await this.interestRepository.findOne({
      where: { user: { id: userId }, code: stockCode },
    });
  }

  ///[해외주식] 특정 종목 정보 조회
  async getForeignInterestByCode(
    stockCode: string,
    accessToken: string,
  ): Promise<ForeignInterest> {
    const userId = this.jwtService.decode(accessToken).id;
    return await this.foreignInterestRepository.findOne({
      where: { user: { id: userId }, code: stockCode },
    });
  }

  ///[국내주식] 관심종목 삭제
  async deleteInterest(stockCode: string, accessToken: string) {
    const interest = await this.getInterestByCode(stockCode, accessToken);
    if (!interest) {
      throw new HttpException('Not found', HttpStatus.BAD_REQUEST);
    }
    await this.interestRepository.delete(interest);
    return interest;
  }

  ///[해외주식] 관심종목 삭제
  async deleteForeignInterest(stockCode: string, accessToken: string) {
    const interest = await this.getForeignInterestByCode(
      stockCode,
      accessToken,
    );
    if (!interest) {
      throw new HttpException('Not Found', HttpStatus.BAD_REQUEST);
    }
    await this.foreignInterestRepository.delete(interest);
    return interest;
  }

  ///[국내주식] 대차대조표 조회
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

  ///[국내주식] 손익계산서 조회
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

  //[국내주식] 재무비율 조회
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

  ///[국내주식] 수익성비율 조회
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

  ///[국내주식] 안정성 비율 조회
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

  ///[국내주식] 성장성 비율 조회
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

  ///[국내주식] 실시간 주가 조회
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

  ///[해외주식] 실시간 주가 조회
  async getRealTimeForeignStockPrice(
    stockCode: string,
  ): Promise<ForeignRealTimePriceType> {
    const kisToken = await this.getKisToken();
    try {
      const response = await firstValueFrom(
        this.httpService.get(
          `${this.baseUrl}/uapi/overseas-price/v1/quotations/price-detail?SYMB=${stockCode}&AUTH=&EXCD=NAS`,
          {
            headers: {
              Authorization: `Bearer ${kisToken.access_token}`,
              appkey: this.configService.get('KIS_APP_KEY'),
              appsecret: this.configService.get('KIS_APP_SECRET'),
              custtype: 'P',
              'Content-Type': 'application/json',
              tr_id: 'HHDFS76200200',
            },
          },
        ),
      );
      return {
        last: response.data.output.last,
        t_xprc: response.data.output.t_xprc,
        t_xdif: response.data.output.t_xdif,
        t_xrat: response.data.output.t_xrat,
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
