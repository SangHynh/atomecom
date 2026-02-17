// @modules/auth/infra/oauth/facebook.provider.ts
import type { ExternalProfile, IOAuthProvider } from '@modules/auth/domain/IOauthProvider.service.js';
import { UnauthorizedError } from '@shared/core/error.response.js';
import { OauthProvider } from '@shared/enum/oauthProvider.enum.js';
import logger from '@shared/utils/logger.js';
import axios from 'axios';

export class FacebookProvider implements IOAuthProvider {
  public readonly name = OauthProvider.FACEBOOK;

  public async getProfile(token: string): Promise<ExternalProfile> {
    try {
      const response = await axios.get(`https://graph.facebook.com/me`, {
        params: {
          fields: 'id,name,email,picture.type(large)',
          access_token: token,
        },
      });

      const { id, name, email, picture } = response.data;

      return {
        providerId: id,
        provider: OauthProvider.FACEBOOK,
        email: email, // may be null if user doesn't provide email
        name: name,
        avatar: picture?.data?.url,
      };
    } catch (error) {
      logger.error(`[OAuth][Facebook] Verification failed: ${error}`);
      throw new UnauthorizedError('INVALID_FACEBOOK_TOKEN');
    }
  }
}
