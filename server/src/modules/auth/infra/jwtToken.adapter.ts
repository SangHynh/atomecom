import jwt from 'jsonwebtoken';
import type {
  ITokenService,
  TokenPayload,
} from '@modules/auth/domain/IToken.service.js';
import {
  InternalServerError,
  UnauthorizedError,
} from '@shared/core/error.response.js';
import { ErrorAuthCodes } from '@atomecom/shared';
import appConfig from '@shared/configs/app.config.js';

const appCfg = appConfig!;

const MODULE = 'Auth';
const JWT_ALGORITHM: jwt.Algorithm = 'HS256';
export class JwtTokenAdapter implements ITokenService {
  private readonly _accessSecret: string;
  private readonly _refreshSecret: string;
  private readonly _accessExpires: string;
  private readonly _refreshExpires: string;

  constructor() {
    const { accessSecret, refreshSecret, accessExpires, refreshExpires } =
      appCfg.security.jwt;

    this._accessSecret = accessSecret;
    this._refreshSecret = refreshSecret;
    this._accessExpires = accessExpires;
    this._refreshExpires = refreshExpires;
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
          if (err.name === 'TokenExpiredError') {
            return reject(new UnauthorizedError(ErrorAuthCodes.TOKEN_EXPIRED));
          }
          return reject(new UnauthorizedError(ErrorAuthCodes.INVALID_TOKEN));
        }
        resolve(decoded as T);
      });
    });
  }
}
