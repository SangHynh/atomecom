import type { TokenPayload } from '@modules/auth/domain/tokenPayload.model.js';

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
