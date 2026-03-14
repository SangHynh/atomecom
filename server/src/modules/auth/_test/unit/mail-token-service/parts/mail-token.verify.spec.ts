import { setupMailTokenServiceTest } from '../__fixtures__/mail-token.fixtures.js';
import { BadRequestError, ConflictError } from '@shared/core/error.response.js';

describe('MailTokenService - Part 2: verifyMailToken', () => {
  let { mailTokenService, mockMailTokenRepo } = setupMailTokenServiceTest();

  beforeEach(() => {
    ({ mailTokenService, mockMailTokenRepo } = setupMailTokenServiceTest());
  });

  it('should verify mail token', async () => {
    mockMailTokenRepo.findByToken.mockResolvedValue({
      userId: 'u',
      isUsed: false,
      expiresAt: new Date(Date.now() + 10000),
      type: 'EMAIL_VERIFICATION',
    } as any);

    const res = await mailTokenService.verifyMailToken(
      't',
      'EMAIL_VERIFICATION',
    );
    expect(res).toBe('u');
    expect(mockMailTokenRepo.markAsUsed).toHaveBeenCalled();
  });

  describe('verifyMailToken Errors', () => {
    it('should throw BadRequestError if token missing', async () => {
      mockMailTokenRepo.findByToken.mockResolvedValue(null);
      await expect(mailTokenService.verifyMailToken('missing', 'EMAIL_VERIFICATION'))
        .rejects.toThrow(BadRequestError);
    });

    it('should throw ConflictError if token used', async () => {
      mockMailTokenRepo.findByToken.mockResolvedValue({
        isUsed: true,
        expiresAt: new Date(Date.now() + 10000),
        type: 'EMAIL_VERIFICATION',
      } as any);
      await expect(mailTokenService.verifyMailToken('used', 'EMAIL_VERIFICATION'))
        .rejects.toThrow(ConflictError);
    });

    it('should throw BadRequestError if token expired', async () => {
      mockMailTokenRepo.findByToken.mockResolvedValue({
        isUsed: false,
        expiresAt: new Date(Date.now() - 10000),
        type: 'EMAIL_VERIFICATION',
      } as any);
      await expect(mailTokenService.verifyMailToken('expired', 'EMAIL_VERIFICATION'))
        .rejects.toThrow(BadRequestError);
    });

    it('should throw BadRequestError if token type mismatch', async () => {
      mockMailTokenRepo.findByToken.mockResolvedValue(null);
      await expect(mailTokenService.verifyMailToken('token', 'RESET_PASSWORD' as any))
        .rejects.toThrow(BadRequestError);
    });
  });
});
