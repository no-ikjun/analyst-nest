export type OperatingProfitType = {
  ///결산년월
  stac_yymm: string;
  ///매출액
  sale_account: string;
  ///매출원가
  sale_cost: string;
  ///매출총이익
  sale_totl_prfi: string;
  ///감가상각비
  depr_cost: string;
  ///판매및관리비
  sell_mang: string;
  ///영업이익
  bsop_prti: string;
  ///영업외수익
  bsop_non_ernn: string;
  ///영업외비용
  bsop_non_expn: string;
  ///경상이익
  op_prfi: string;
  ///특별이익
  spec_prfi: string;
  ///특별손실
  spec_loss: string;
  ///당기순이익
  thtr_ntin: string;
};
