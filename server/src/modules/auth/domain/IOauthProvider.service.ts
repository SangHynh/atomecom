import type { ExternalProfile } from '@modules/auth/domain/externalProfile.model.js';

export interface IOAuthProvider {
  readonly name: string;
  getProfile(token: string): Promise<ExternalProfile>;
}
