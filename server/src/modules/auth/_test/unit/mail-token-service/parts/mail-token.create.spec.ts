import { setupMailTokenServiceTest } from '../__fixtures__/mail-token.fixtures.js';

describe('MailTokenService - Part 1: createMailToken', () => {
  let { mailTokenService, mockMailTokenRepo } = setupMailTokenServiceTest();

  beforeEach(() => {
    ({ mailTokenService, mockMailTokenRepo } = setupMailTokenServiceTest());
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
});
