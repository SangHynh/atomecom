import jwt from 'jsonwebtoken';
import type { ITokenService } from '@modules/auth/domain/IToken.service.js';
import {
  InternalServerError,
  UnauthorizedError,
} from '@shared/core/error.response.js';
import type { TokenPayload } from '@modules/auth/domain/tokenPayload.model.js';

const JWT_ALGORITHM: jwt.Algorithm = 'HS256';
export class JwtTokenAdapter implements ITokenService {
  private readonly _accessSecret: string;
  private readonly _refreshSecret: string;
  private readonly _accessExpires: string;
  private readonly _refreshExpires: string;

  constructor() {
    const accessSecret = process.env.ACCESS_TOKEN_SECRET;
    const refreshSecret = process.env.REFRESH_TOKEN_SECRET;

    const missingConfigs = [];
    if (!accessSecret)
      missingConfigs.push({
        field: 'ACCESS_TOKEN_SECRET',
        message: 'MISSING_ACCESS_TOKEN_SECRET',
      });
    if (!refreshSecret)
      missingConfigs.push({
        field: 'REFRESH_TOKEN_SECRET',
        message: 'MISSING_REFRESH_TOKEN_SECRET',
      });

    if (missingConfigs.length > 0) {
      throw new InternalServerError('JWT_CONFIG_ERROR', missingConfigs);
    }

    this._accessSecret = accessSecret!;
    this._refreshSecret = refreshSecret!;
    this._accessExpires = process.env.ACCESS_TOKEN_EXPIRES_IN || '15m';
    this._refreshExpires = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d';
  }

  public async generateAccessToken(payload: TokenPayload): Promise<string> {
    return this._sign(payload, this._accessSecret, this._accessExpires);
  }

  public async generateRefreshToken(payload: TokenPayload): Promise<string> {
    return this._sign(payload, this._refreshSecret, this._refreshExpires);
  }

  public async verifyAccessToken<T>(token: string): Promise<T> {
    return this._verify<T>(token, this._accessSecret);
  }

  public async verifyRefreshToken<T>(token: string): Promise<T> {
    return this._verify<T>(token, this._refreshSecret);
  }

  private async _sign(
    payload: any,
    secret: string,
    expires: string,
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      jwt.sign(
        payload,
        secret,
        { expiresIn: expires as any, algorithm: JWT_ALGORITHM },
        (err, token) => {
          if (err) return reject(err);
          resolve(token as string);
        },
      );
    });
  }

  private async _verify<T>(token: string, secret: string): Promise<T> {
    return new Promise((resolve, reject) => {
      jwt.verify(token, secret, (err, decoded) => {
        if (err) {
          if (err.name === 'TokenExpiredError')
            return reject(new UnauthorizedError('TOKEN_EXPIRED'));
          return reject(new UnauthorizedError('INVALID_TOKEN'));
        }
        resolve(decoded as T);
      });
    });
  }
}
