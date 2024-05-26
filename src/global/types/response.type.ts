export type LoginResponseType = {
  accessToken: string;
};

export type UserDataType = {
  id: number;
  email: string;
  password: string;
};

export type KisTokenResponseType = {
  access_token: string;
  access_token_expired: string;
  token_type: string;
  expires_in: number;
};
