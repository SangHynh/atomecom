import { MailTokenService } from '@modules/auth/use-cases/mailToken.service.js';
import type { IMailTokenRepo } from '@modules/auth/domain/IMailToken.repo.js';
import { BadRequestError, ConflictError } from '@shared/core/error.response.js';
import { ErrorAuthCodes } from '@atomecom/shared';

describe('MailTokenService', () => {
  let mailTokenService: MailTokenService;
  let mockMailTokenRepo: jest.Mocked<IMailTokenRepo>;

  beforeEach(() => {
    mockMailTokenRepo = {
      create: jest.fn(),
      findByToken: jest.fn(),
      markAsUsed: jest.fn(),
    } as any;
    mailTokenService = new MailTokenService(mockMailTokenRepo);
  });

  it('should create mail token', async () => {
    const token = await mailTokenService.createMailToken('u', 'e', 'EMAIL_VERIFICATION');
    expect(token).toBeDefined();
    expect(mockMailTokenRepo.create).toHaveBeenCalled();
  });

  it('should verify mail token', async () => {
    mockMailTokenRepo.findByToken.mockResolvedValue({
      userId: 'u',
      isUsed: false,
      expiresAt: new Date(Date.now() + 10000),
    } as any);

    const res = await mailTokenService.verifyMailToken('t', 'EMAIL_VERIFICATION');
    expect(res).toBe('u');
    expect(mockMailTokenRepo.markAsUsed).toHaveBeenCalled();
  });
});
