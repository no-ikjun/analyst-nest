import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { Interest } from 'src/global/entities/interest.entity';
import { BalanceSheetType } from 'src/kis/types/balanceSheet.type';
import { FinancialRatioType } from 'src/kis/types/financialRatio.type';
import { GrowthRatioType } from 'src/kis/types/growthRatio.type';
import { OperatingProfitType } from 'src/kis/types/operatingProfit.type';
import { ProfitRatioType } from 'src/kis/types/profitRatio.type';
import { StabilityRatioType } from 'src/kis/types/stabilityRatio.type';

@Injectable()
export class GptService {
  private openai: OpenAI;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('GPT_KEY');
    this.openai = new OpenAI({ apiKey });
  }

  async testGpt(text: string) {
    const completion = await this.openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'system', content: text }],
    });
    return completion;
  }

  async generateFinancialReport(
    interestStocks: Interest[],
    balanceSheets: BalanceSheetType[],
    incomeStatements: OperatingProfitType[],
    financialRatios: FinancialRatioType[],
    profitabilityRatios: ProfitRatioType[],
    stabilityRatios: StabilityRatioType[],
    growthRatios: GrowthRatioType[],
  ) {
    let prompt = `
    Create a comprehensive financial report based on the following data for multiple stocks. Summarize key findings and provide actionable investment advice. Finally, calculate the optimal portfolio weights for these stocks using the Mean-Variance Optimization (Markowitz Portfolio Theory). Provide detailed calculations and insights.

    Use the following parameters for CAPM calculation:
    - Risk-Free Rate: 4.5%
    - Market Return: 8%
    - Beta: 1.2

    Provide the comprehensive analysis in "Korean".

    Note: In your response, summarize the financial data for each company into one or two sentences highlighting the most critical information. Do not include all the raw data in the response.
    `;

    for (let i = 0; i < interestStocks.length; i++) {
      prompt += `
      종목 ${i + 1}: ${interestStocks[i].code} - ${
        interestStocks[i].prdt_abrv_name
      }
      Balance Sheet:
      - Reporting Date: ${balanceSheets[i].stac_yymm}
      - Current Assets: ${balanceSheets[i].cras}
      - Fixed Assets: ${balanceSheets[i].fxas}
      - Total Assets: ${balanceSheets[i].total_aset}
      - Current Liabilities: ${balanceSheets[i].flow_lblt}
      - Fixed Liabilities: ${balanceSheets[i].fix_lblt}
      - Total Liabilities: ${balanceSheets[i].total_lblt}
      - Capital: ${balanceSheets[i].cpfn}
      - Capital Surplus: ${balanceSheets[i].cfp_surp}
      - Retained Earnings: ${balanceSheets[i].prfi_surp}
      - Total Equity: ${balanceSheets[i].total_cptl}
      
      Income Statement:
      - Reporting Date: ${incomeStatements[i].stac_yymm}
      - Sales: ${incomeStatements[i].sale_account}
      - Cost of Sales: ${incomeStatements[i].sale_cost}
      - Gross Profit: ${incomeStatements[i].sale_totl_prfi}
      - Depreciation: ${incomeStatements[i].depr_cost}
      - SG&A Expenses: ${incomeStatements[i].sell_mang}
      - Operating Profit: ${incomeStatements[i].bsop_prti}
      - Non-operating Income: ${incomeStatements[i].bsop_non_ernn}
      - Non-operating Expenses: ${incomeStatements[i].bsop_non_expn}
      - Ordinary Profit: ${incomeStatements[i].op_prfi}
      - Extraordinary Income: ${incomeStatements[i].spec_prfi}
      - Extraordinary Loss: ${incomeStatements[i].spec_loss}
      - Net Income: ${incomeStatements[i].thtr_ntin}
      
      Financial Ratios:
      - Reporting Date: ${financialRatios[i].stac_yymm}
      - Sales Growth Rate: ${financialRatios[i].grs}
      - Operating Profit Growth Rate: ${financialRatios[i].bsop_prfi_inrt}
      - Net Income Growth Rate: ${financialRatios[i].ntin_inrt}
      - ROE: ${financialRatios[i].roe_val}
      - EPS: ${financialRatios[i].eps}
      - Sales per Share: ${financialRatios[i].sps}
      - BPS: ${financialRatios[i].bps}
      - Retention Ratio: ${financialRatios[i].rsrv_rate}
      - Debt Ratio: ${financialRatios[i].lblt_rate}
      
      Profitability Ratios:
      - Reporting Date: ${profitabilityRatios[i].stac_yymm}
      - Return on Total Assets: ${profitabilityRatios[i].cptl_ntin_rate}
      - Return on Equity: ${profitabilityRatios[i].self_cptl_ntin_inrt}
      - Net Profit Margin: ${profitabilityRatios[i].sale_ntin_rate}
      - Gross Profit Margin: ${profitabilityRatios[i].sale_totl_rate}
      
      Stability Ratios:
      - Reporting Date: ${stabilityRatios[i].stac_yymm}
      - Debt Ratio: ${stabilityRatios[i].lblt_rate}
      - Dependency on Borrowings: ${stabilityRatios[i].bram_depn}
      - Current Ratio: ${stabilityRatios[i].crnt_rate}
      - Quick Ratio: ${stabilityRatios[i].quck_rate}
      
      Growth Ratios:
      - Reporting Date: ${growthRatios[i].stac_yymm}
      - Sales Growth Rate: ${growthRatios[i].grs}
      - Operating Profit Growth Rate: ${growthRatios[i].bsop_prfi_inrt}
      - Equity Growth Rate: ${growthRatios[i].equt_inrt}
      - Total Assets Growth Rate: ${growthRatios[i].totl_aset_inrt}
      `;
    }

    prompt += `
    Finally, calculate the optimal portfolio weights for these stocks using the Mean-Variance Optimization (Markowitz Portfolio Theory). Provide detailed calculations and insights. Highlight any areas of concern or notable strengths.
    `;

    const completion = await this.openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'system', content: prompt }],
      max_tokens: 1500,
    });

    return completion;
  }
}
