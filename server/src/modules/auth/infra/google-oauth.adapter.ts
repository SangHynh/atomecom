// @modules/auth/infra/oauth/google.provider.ts
import type {
  ExternalProfile,
  IOAuthProvider,
} from '@modules/auth/domain/IOauthProvider.service.js';
import {
  UnauthorizedError,
  InternalServerError,
} from '@shared/core/error.response.js';
import { OauthProvider, ErrorAuthCodes } from '@atomecom/shared';
import logger from '@shared/utils/logger.js';
import { OAuth2Client } from 'google-auth-library';
import axios from 'axios';

export class GoogleProvider implements IOAuthProvider {
  private readonly _client: OAuth2Client;
  private readonly _clientId: string;
  public readonly name = OauthProvider.GOOGLE;

  constructor() {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId) {
      logger.warn(
        '[OAuth][Google] GOOGLE_CLIENT_ID is not configured. Google login will be unavailable.',
      );
      this._clientId = '';
      this._client = new OAuth2Client();
    } else {
      this._clientId = clientId;
      this._client = new OAuth2Client(this._clientId);
    }
  }

  public async getProfile(token: string): Promise<ExternalProfile> {
    if (!this._clientId) {
      throw new InternalServerError('GOOGLE_CLIENT_ID_IS_NOT_CONFIGURED');
    }

    // Detect if token is JWT (ID Token) or Access Token (Opaque)
    const isJwt = token.split('.').length === 3;

    if (isJwt) {
      return this._verifyIdToken(token);
    } else {
      return this._verifyAccessToken(token);
    }
  }

  private async _verifyIdToken(token: string): Promise<ExternalProfile> {
    try {
      const ticket = await this._client.verifyIdToken({
        idToken: token,
        audience: this._clientId,
      });
      const payload = ticket.getPayload();
      if (!payload) {
        throw new UnauthorizedError(
          ErrorAuthCodes.GOOGLE_TOKEN_PAYLOAD_NOT_FOUND,
        );
      }
      const profile: ExternalProfile = {
        providerId: payload.sub,
        provider: OauthProvider.GOOGLE,
        name: payload.name || 'Google User',
      };

      if (payload.email) profile.email = payload.email;
      if (payload.picture) profile.avatar = payload.picture;

      return profile;
    } catch (error) {
      logger.error(`[OAuth][Google] ID Token verification failed: ${error}`);
      throw new UnauthorizedError(ErrorAuthCodes.INVALID_GOOGLE_TOKEN);
    }
  }

  private async _verifyAccessToken(token: string): Promise<ExternalProfile> {
    try {
      // Parallelize requests to curb latency
      const [tokenInfoResponse, userInfoResponse] = await Promise.all([
        axios.get(
          `https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=${token}`,
        ),
        axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      // 1. Check Audience
      const { aud } = tokenInfoResponse.data;
      if (aud !== this._clientId) {
        logger.error(
          `[OAuth][Google] Token audience mismatch. Expected: ${this._clientId}, Got: ${aud}`,
        );
        throw new UnauthorizedError('INVALID_TOKEN_AUDIENCE');
      }

      // 2. Process User Info
      const payload = userInfoResponse.data;

      const profile: ExternalProfile = {
        providerId: payload.sub,
        provider: OauthProvider.GOOGLE,
        name: payload.name || 'Google User',
      };

      if (payload.email) profile.email = payload.email;
      if (payload.picture) profile.avatar = payload.picture;

      return profile;
    } catch (error) {
      logger.error(
        `[OAuth][Google] Access Token verification failed: ${error}`,
      );
      throw new UnauthorizedError(ErrorAuthCodes.INVALID_GOOGLE_TOKEN);
    }
  }
}
