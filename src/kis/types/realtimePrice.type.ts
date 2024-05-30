export type RealTimePriceType = {
  ///주식 현재가
  stck_prpr: string;
  ///전일대비 가격 변동
  prdy_vrss: string;
  ///전일대비 가격 변동율
  prdy_ctrt: string;
};

export type ForeignRealTimePriceType = {
  ///현재가
  last: string;
  ///원환산당 당일가격
  t_xprc: string;
  ///전일대비
  p_xdif: string;
  ///원환상당 당일등락
  t_xrat: string;
};
