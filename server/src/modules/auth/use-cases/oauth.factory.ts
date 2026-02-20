// @modules/auth/infra/oauth.factory.ts (Or domain/use-cases if you want full abstraction)
import type { IOAuthProvider } from '@modules/auth/domain/IOauthProvider.service.js';
import { OauthProvider } from '@atomecom/shared';
import { InternalServerError } from '@shared/core/error.response.js';

export class OauthFactory {
  private readonly _strategies: Map<string, IOAuthProvider> = new Map();

  constructor(providers: IOAuthProvider[]) {
    providers.forEach((p) => {
      this._strategies.set(p.name.toUpperCase(), p);
    });
  }

  public getStrategy(provider: string): IOAuthProvider {
    const strategy = this._strategies.get(provider.toUpperCase());
    if (!strategy) {
      throw new InternalServerError(`OAUTH_PROVIDER_IS_NOT_SUPPORTED`);
    }
    return strategy;
  }
}
