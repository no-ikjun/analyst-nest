import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
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
    balance_sheet: BalanceSheetType,
    income_statement: OperatingProfitType,
    financial_ratios: FinancialRatioType,
    profitability_ratios: ProfitRatioType,
    stability_ratios: StabilityRatioType,
    growth_ratios: GrowthRatioType,
  ) {
    const prompt = `
    Create a comprehensive financial report based on the following data. The report should include an analysis of the balance sheet, income statement, financial ratios, profitability ratios, stability ratios, and growth ratios. For each section, provide insights on the company's financial health, performance, and potential investment value. Summarize key findings and provide actionable investment advice. Use investment theories, including the Capital Asset Pricing Model (CAPM), to evaluate the company's investment potential. Provide detailed calculations and insights.

    Balance Sheet:
    - Reporting Date: ${balance_sheet.stac_yymm}
    - Current Assets: ${balance_sheet.cras}
    - Fixed Assets: ${balance_sheet.fxas}
    - Total Assets: ${balance_sheet.total_aset}
    - Current Liabilities: ${balance_sheet.flow_lblt}
    - Fixed Liabilities: ${balance_sheet.fix_lblt}
    - Total Liabilities: ${balance_sheet.total_lblt}
    - Capital: ${balance_sheet.cpfn}
    - Capital Surplus: ${balance_sheet.cfp_surp}
    - Retained Earnings: ${balance_sheet.prfi_surp}
    - Total Equity: ${balance_sheet.total_cptl}
    
    Income Statement:
    - Reporting Date: ${income_statement.stac_yymm}
    - Sales: ${income_statement.sale_account}
    - Cost of Sales: ${income_statement.sale_cost}
    - Gross Profit: ${income_statement.sale_totl_prfi}
    - Depreciation: ${income_statement.depr_cost}
    - SG&A Expenses: ${income_statement.sell_mang}
    - Operating Profit: ${income_statement.bsop_prti}
    - Non-operating Income: ${income_statement.bsop_non_ernn}
    - Non-operating Expenses: ${income_statement.bsop_non_expn}
    - Ordinary Profit: ${income_statement.op_prfi}
    - Extraordinary Income: ${income_statement.spec_prfi}
    - Extraordinary Loss: ${income_statement.spec_loss}
    - Net Income: ${income_statement.thtr_ntin}
    
    Financial Ratios:
    - Reporting Date: ${financial_ratios.stac_yymm}
    - Sales Growth Rate: ${financial_ratios.grs}
    - Operating Profit Growth Rate: ${financial_ratios.bsop_prfi_inrt}
    - Net Income Growth Rate: ${financial_ratios.ntin_inrt}
    - ROE: ${financial_ratios.roe_val}
    - EPS: ${financial_ratios.eps}
    - Sales per Share: ${financial_ratios.sps}
    - BPS: ${financial_ratios.bps}
    - Retention Ratio: ${financial_ratios.rsrv_rate}
    - Debt Ratio: ${financial_ratios.lblt_rate}
    
    Profitability Ratios:
    - Reporting Date: ${profitability_ratios.stac_yymm}
    - Return on Total Assets: ${profitability_ratios.cptl_ntin_rate}
    - Return on Equity: ${profitability_ratios.self_cptl_ntin_inrt}
    - Net Profit Margin: ${profitability_ratios.sale_ntin_rate}
    - Gross Profit Margin: ${profitability_ratios.sale_totl_rate}
    
    Stability Ratios:
    - Reporting Date: ${stability_ratios.stac_yymm}
    - Debt Ratio: ${stability_ratios.lblt_rate}
    - Dependency on Borrowings: ${stability_ratios.bram_depn}
    - Current Ratio: ${stability_ratios.crnt_rate}
    - Quick Ratio: ${stability_ratios.quck_rate}
    
    Growth Ratios:
    - Reporting Date: ${growth_ratios.stac_yymm}
    - Sales Growth Rate: ${growth_ratios.grs}
    - Operating Profit Growth Rate: ${growth_ratios.bsop_prfi_inrt}
    - Equity Growth Rate: ${growth_ratios.equt_inrt}
    - Total Assets Growth Rate: ${growth_ratios.totl_aset_inrt}

    Use the following parameters for CAPM calculation:
    - Risk-Free Rate: 4.5%
    - Market Return: 8%
    - Beta: 1.2
    
    Provide a comprehensive analysis of this data, including insights on the company's financial health, performance trends, and investment potential. Highlight any areas of concern or notable strengths. Provide detailed calculations using the CAPM model and other relevant financial theories.

    Show me the financial report in "Korean".
`;

    const completion = await this.openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'system', content: prompt }],
    });

    return completion;
  }
}
