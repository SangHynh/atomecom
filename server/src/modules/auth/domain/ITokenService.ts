export interface ITokenPayload {
  userId: string;
  role: string;
  email?: string;
  [key: string]: any; 
  // other fields
}

export interface ITokenService {
  generateAccessToken(payload: ITokenPayload): Promise<string>;
  generateRefreshToken(payload: ITokenPayload): Promise<string>;
  verifyAccessToken<T>(token: string): Promise<T>;
  verifyRefreshToken<T>(token: string): Promise<T>;
  saveRefreshToken(userId: string, token: string, ttl: number): Promise<void>;
  deleteRefreshToken(userId: string, token: string): Promise<void>;
  isTokenBlacklisted(userId: string, token: string): Promise<boolean>;
}