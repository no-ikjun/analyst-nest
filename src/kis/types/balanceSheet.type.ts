export type BalanceSheetType = {
  ///결산년원
  stac_yymm: string;
  ///유동자산
  cras: string;
  ///고정자산
  fxas: string;
  ///자산총계
  total_aset: string;
  ///유동부채
  flow_lblt: string;
  ///고정부채
  fix_lblt: string;
  ///부채총계
  total_lblt: string;
  ///자본금
  cpfn: string;
  ///자본잉여금
  cfp_surp: string;
  ///이익잉여금
  prfi_surp: string;
  ///자본총계
  total_cptl: string;
};
