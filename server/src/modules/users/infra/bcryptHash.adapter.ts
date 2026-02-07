import type { IHashService } from '@modules/users/domain/IHashService.interface.js';
import bcrypt from 'bcrypt';

export class BcryptHashAdapter implements IHashService {
  private readonly saltRounds = Number(process.env.SALT_ROUNDS) || 10;
  
  public async hash(plain: string): Promise<string> {
    return await bcrypt.hash(plain, this.saltRounds);
  }

  public async compare(plain: string, hashed: string): Promise<boolean> {
    return await bcrypt.compare(plain, hashed);
  }
}
