export interface TokenPayload {
  userId: string;
  sessionId: string;
  role: string;
  iat?: number;
  exp?: number;
}
