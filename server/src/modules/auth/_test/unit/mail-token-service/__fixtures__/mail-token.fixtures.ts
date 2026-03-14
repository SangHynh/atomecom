import { MailTokenService } from '@modules/auth/use-cases/mailToken.service.js';
import type { IMailTokenRepo } from '@modules/auth/domain/IMailToken.repo.js';

export const createMockMailTokenRepo = () => ({
  create: jest.fn(),
  findByToken: jest.fn(),
  markAsUsed: jest.fn(),
} as unknown as jest.Mocked<IMailTokenRepo>);

export const setupMailTokenServiceTest = () => {
  const mockMailTokenRepo = createMockMailTokenRepo();
  const mailTokenService = new MailTokenService(mockMailTokenRepo);

  return {
    mailTokenService,
    mockMailTokenRepo,
  };
};
