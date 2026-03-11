import type { IHashService } from '@modules/users/domain/IHash.service.js';
import bcrypt from 'bcrypt';
import appConfig from '@shared/configs/app.config.js';

const appCfg = appConfig!;

export class BcryptHashAdapter implements IHashService {
  private readonly saltRounds = appCfg.security.hash.saltRounds;

  public async hash(plain: string): Promise<string> {
    return await bcrypt.hash(plain, this.saltRounds);
  }

  public async compare(plain: string, hashed: string): Promise<boolean> {
    return await bcrypt.compare(plain, hashed);
  }
}
