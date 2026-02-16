// response type from oauth provider

import type { OauthProvider } from '@shared/enum/oauthProvider.enum.js';

export interface ExternalProfile {
  provider: OauthProvider;
  providerId: string;
  email?: string;
  name: string;
  avatar?: string;
}
