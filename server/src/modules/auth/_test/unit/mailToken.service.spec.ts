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
    const token = await mailTokenService.createMailToken(
      'u',
      'e',
      'EMAIL_VERIFICATION',
    );
    expect(token).toBeDefined();
    expect(mockMailTokenRepo.create).toHaveBeenCalled();
  });

  it('should verify mail token', async () => {
    mockMailTokenRepo.findByToken.mockResolvedValue({
      userId: 'u',
      isUsed: false,
      expiresAt: new Date(Date.now() + 10000),
    } as any);

    const res = await mailTokenService.verifyMailToken(
      't',
      'EMAIL_VERIFICATION',
    );
    expect(res).toBe('u');
    expect(mockMailTokenRepo.markAsUsed).toHaveBeenCalled();
  });

  describe('verifyMailToken Errors (TC-MAIL-03 to 06)', () => {
    it('should throw BadRequestError if token missing (TC-MAIL-03)', async () => {
      mockMailTokenRepo.findByToken.mockResolvedValue(null);
      await expect(mailTokenService.verifyMailToken('missing', 'EMAIL_VERIFICATION'))
        .rejects.toThrow(BadRequestError);
    });

    it('should throw ConflictError if token used (TC-MAIL-04)', async () => {
      mockMailTokenRepo.findByToken.mockResolvedValue({
        isUsed: true,
        expiresAt: new Date(Date.now() + 10000),
      } as any);
      await expect(mailTokenService.verifyMailToken('used', 'EMAIL_VERIFICATION'))
        .rejects.toThrow(ConflictError);
    });

    it('should throw BadRequestError if token expired (TC-MAIL-05)', async () => {
      mockMailTokenRepo.findByToken.mockResolvedValue({
        isUsed: false,
        expiresAt: new Date(Date.now() - 10000),
      } as any);
      await expect(mailTokenService.verifyMailToken('expired', 'EMAIL_VERIFICATION'))
        .rejects.toThrow(BadRequestError);
    });

    it('should throw BadRequestError if token type mismatch (TC-MAIL-06)', async () => {
      // If repo correctly filters by type, type mismatch returns null
      mockMailTokenRepo.findByToken.mockResolvedValue(null);
      await expect(mailTokenService.verifyMailToken('token', 'RESET_PASSWORD' as any))
        .rejects.toThrow(BadRequestError);
    });
  });
});
