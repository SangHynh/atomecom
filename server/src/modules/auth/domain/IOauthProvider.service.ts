import type { OauthProvider } from '@atomecom/shared';

export interface ExternalProfile {
  provider: OauthProvider;
  providerId: string;
  email?: string;
  name: string;
  avatar?: string;
}


export interface IOAuthProvider {
  readonly name: string;
  getProfile(token: string): Promise<ExternalProfile>;
}
