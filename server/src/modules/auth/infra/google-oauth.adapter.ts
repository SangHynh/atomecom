// @modules/auth/infra/oauth/google.provider.ts
import type { ExternalProfile } from '@modules/auth/domain/externalProfile.model.js';
import type { IOAuthProvider } from '@modules/auth/domain/IOauthProvider.service.js';
import {
  UnauthorizedError,
  InternalServerError,
} from '@shared/core/error.response.js';
import { OauthProvider } from '@shared/enum/oauthProvider.enum.js';
import logger from '@shared/utils/logger.js';
import { OAuth2Client } from 'google-auth-library';

export class GoogleProvider implements IOAuthProvider {
  private readonly _client: OAuth2Client;
  private readonly _clientId: string;
  public readonly name = OauthProvider.GOOGLE;

  constructor() {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId) {
      throw new InternalServerError(
        'GOOGLE_CLIENT_ID_IS_NOT_CONFIGURED_IN_ENV',
      );
    }
    this._clientId = clientId;
    this._client = new OAuth2Client(this._clientId);
  }

  public async getProfile(token: string): Promise<ExternalProfile> {
    try {
      const ticket = await this._client.verifyIdToken({
        idToken: token,
        audience: this._clientId,
      });
      const payload = ticket.getPayload();
      if (!payload) {
        throw new UnauthorizedError('GOOGLE_TOKEN_PAYLOAD_NOT_FOUND');
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
      logger.error(`[OAuth][Google] Verification failed: ${error}`);
      throw new UnauthorizedError('INVALID_GOOGLE_TOKEN');
    }
  }
}
