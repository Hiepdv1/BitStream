export enum JwtTokenType {
  ACCESS = 'ACCESS',
  REFRESH = 'REFRESH',
  STREAM = 'STREAM',
  INTERNAL = 'INTERNAL',
  VERIFY_EMAIL = 'VERIFY_EMAIL',
}

export interface BaseJwtPayload {
  sub: string;
}

export interface DecodedJwtPayload extends BaseJwtPayload {
  jti: string;
  type: JwtTokenType;
  iat: number;
  exp: number;
}
