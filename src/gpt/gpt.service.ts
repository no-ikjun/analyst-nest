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

  async generateSingleStockReport(
    interestStock: Interest,
    interestStockPrice: string,
    balanceSheet: BalanceSheetType,
    incomeStatement: OperatingProfitType,
    financialRatio: FinancialRatioType,
    profitabilityRatio: ProfitRatioType,
    stabilityRatio: StabilityRatioType,
    growthRatio: GrowthRatioType,
  ) {
    let prompt = `
    Provide a detailed financial analysis and investment recommendation for a company based on the following data. The analysis should include a "Buy" recommendation and a target price of 6,000 KRW. Discuss the company's 1Q24 performance, annual performance projections, and the factors influencing these projections. Use the following format and details:

    Note: In your response, summarize the financial data for each company into one or two sentences highlighting the most critical information. Do not include all the raw data in the response.

    Analysis Example (Note: Do not use this verbatim, create your own analysis based on the data provided):
    - Maintain a "Buy" recommendation with a target price of ??? KRW. Despite the downward adjustment in annual performance projections due to poor 1Q24 performance, explain that this is due to temporary slowdowns in sales of secured group company volumes, not real estate market risks. Justify maintaining the target price.
    - Note that the target price is at an estimated PER of ???x for 2024, which is relatively high compared to the industry. However, highlight the potential for an increase in estimated EPS for 2024 due to the progress in group company sales.
    - Highlight key points for 2024 performance expectations
    `;

    prompt += `
    종목: ${interestStock.code} - ${interestStock.prdt_abrv_name}
    현재가: ₩${interestStockPrice}

    Balance Sheet:
    - Reporting Date: ${balanceSheet.stac_yymm}
    - Current Assets: ${balanceSheet.cras}
    - Fixed Assets: ${balanceSheet.fxas}
    - Total Assets: ${balanceSheet.total_aset}
    - Current Liabilities: ${balanceSheet.flow_lblt}
    - Fixed Liabilities: ${balanceSheet.fix_lblt}
    - Total Liabilities: ${balanceSheet.total_lblt}
    - Capital: ${balanceSheet.cpfn}
    - Capital Surplus: ${balanceSheet.cfp_surp}
    - Retained Earnings: ${balanceSheet.prfi_surp}
    - Total Equity: ${balanceSheet.total_cptl}

    Income Statement:
    - Reporting Date: ${incomeStatement.stac_yymm}
    - Sales: ${incomeStatement.sale_account}
    - Cost of Sales: ${incomeStatement.sale_cost}
    - Gross Profit: ${incomeStatement.sale_totl_prfi}
    - Depreciation: ${incomeStatement.depr_cost}
    - SG&A Expenses: ${incomeStatement.sell_mang}
    - Operating Profit: ${incomeStatement.bsop_prti}
    - Non-operating Income: ${incomeStatement.bsop_non_ernn}
    - Non-operating Expenses: ${incomeStatement.bsop_non_expn}
    - Ordinary Profit: ${incomeStatement.op_prfi}
    - Extraordinary Income: ${incomeStatement.spec_prfi}
    - Extraordinary Loss: ${incomeStatement.spec_loss}
    - Net Income: ${incomeStatement.thtr_ntin}

    Financial Ratios:
    - Reporting Date: ${financialRatio.stac_yymm}
    - Sales Growth Rate: ${financialRatio.grs}
    - Operating Profit Growth Rate: ${financialRatio.bsop_prfi_inrt}
    - Net Income Growth Rate: ${financialRatio.ntin_inrt}
    - ROE: ${financialRatio.roe_val}
    - EPS: ${financialRatio.eps}
    - Sales per Share: ${financialRatio.sps}
    - BPS: ${financialRatio.bps}
    - Retention Ratio: ${financialRatio.rsrv_rate}
    - Debt Ratio: ${financialRatio.lblt_rate}

    Profitability Ratios:
    - Reporting Date: ${profitabilityRatio.stac_yymm}
    - Return on Total Assets: ${profitabilityRatio.cptl_ntin_rate}
    - Return on Equity: ${profitabilityRatio.self_cptl_ntin_inrt}
    - Net Profit Margin: ${profitabilityRatio.sale_ntin_rate}
    - Gross Profit Margin: ${profitabilityRatio.sale_totl_rate}
    
    Stability Ratios:
    - Reporting Date: ${stabilityRatio.stac_yymm}
    - Debt Ratio: ${stabilityRatio.lblt_rate}
    - Dependency on Borrowings: ${stabilityRatio.bram_depn}
    - Current Ratio: ${stabilityRatio.crnt_rate}
    - Quick Ratio: ${stabilityRatio.quck_rate}

    Growth Ratios:
    - Reporting Date: ${growthRatio.stac_yymm}
    - Sales Growth Rate: ${growthRatio.grs}
    - Operating Profit Growth Rate: ${growthRatio.bsop_prfi_inrt}
    - Equity Growth Rate: ${growthRatio.equt_inrt}
    - Total Assets Growth Rate: ${growthRatio.totl_aset_inrt}
    `;

    prompt += `
    Provide a comprehensive analysis of this data, including insights on the company's financial health, performance trends, and investment potential. Highlight any areas of concern or notable strengths.

    Show me the financial report in "Korean".
    `;

    const completion = await this.openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'system', content: prompt }],
      max_tokens: 1500,
    });

    return completion;
  }
}
