export interface TokenPayload {
  userId: string;
  sessionId: string;
  role: string;
  nonce?: string;
  iat?: number;
  exp?: number;
}

export interface ITokenService {
  generateAccessToken(payload: TokenPayload): Promise<string>;
  generateRefreshToken(
    payload: TokenPayload,
    remainingSeconds: number,
  ): Promise<string>;
  verifyAccessToken(
    token: string | undefined,
  ): Promise<TokenPayload | undefined>;
  verifyRefreshToken(
    token: string | undefined,
  ): Promise<TokenPayload | undefined>;
}
