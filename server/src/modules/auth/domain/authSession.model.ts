export interface AuthSession {
  sessionId: string;
  userId: string;
  refreshToken: string;
  refreshTokensUsed: string[];
  expiresAt: number;
}
