export interface IAuthSession {
    userId: string;
    deviceId: string;
    refreshToken: string;
    refreshTokensUsed: string[];
}

