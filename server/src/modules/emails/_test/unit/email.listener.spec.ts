import { EmailListener } from '../../use-cases/email.listener.js';
import { DomainEvents } from '@shared/constants/event.constants.js';
import type { EventBus } from '@shared/infra/event-bus.js';
import type { IEmailService } from '../../domain/IEmail.service.js';
import type { MailTokenService } from '@modules/auth/use-cases/mailToken.service.js';

describe('EmailListener', () => {
  let emailListener: EmailListener;
  let mockEventBus: jest.Mocked<EventBus>;
  let mockEmailService: jest.Mocked<IEmailService>;
  let mockMailTokenService: jest.Mocked<MailTokenService>;

  beforeEach(() => {
    mockEventBus = {
      on: jest.fn(),
      emit: jest.fn(),
    } as any;
    mockEmailService = {
      sendVerificationEmail: jest.fn(),
      sendResetPasswordEmail: jest.fn(),
      resendVerificationEmail: jest.fn(),
      sendStatusChangeEmail: jest.fn(),
    } as any;
    mockMailTokenService = {
      createMailToken: jest.fn().mockResolvedValue('fake-token'),
    } as any;

    emailListener = new EmailListener({
      eventBus: mockEventBus as any,
      emailService: mockEmailService as any,
      mailTokenService: mockMailTokenService as any,
    });
  });

  it('should setup listeners on initialization (TC-EML-01)', () => {
    expect(mockEventBus.on).toHaveBeenCalledWith(DomainEvents.USER_CREATED, expect.any(Function));
    expect(mockEventBus.on).toHaveBeenCalledWith(DomainEvents.VERIFICATION_EMAIL_REQUESTED, expect.any(Function));
    expect(mockEventBus.on).toHaveBeenCalledWith(DomainEvents.PASSWORD_RESET_REQUESTED, expect.any(Function));
    expect(mockEventBus.on).toHaveBeenCalledWith(DomainEvents.USER_STATUS_CHANGED, expect.any(Function));
    expect(mockEventBus.on).toHaveBeenCalledWith(DomainEvents.USER_DELETED, expect.any(Function));
  });

  it('should handle USER_CREATED event (TC-EML-02, TC-EML-08)', async () => {
    const handler = mockEventBus.on.mock.calls.find((call) => call[0] === DomainEvents.USER_CREATED)![1];
    await handler({ userId: 'u1', email: 'test@ex.com' });

    expect(mockMailTokenService.createMailToken).toHaveBeenCalledWith('u1', 'test@ex.com', 'EMAIL_VERIFICATION');
    expect(mockEmailService.sendVerificationEmail).toHaveBeenCalledWith('test@ex.com', 'fake-token');
  });

  it('should handle USER_STATUS_CHANGED event (TC-EML-03, 11, 12)', async () => {
    const handler = mockEventBus.on.mock.calls.find((call) => call[0] === DomainEvents.USER_STATUS_CHANGED)![1];

    await handler({ email: 'u1@ex.com', name: 'John', status: 'BANNED' });
    expect(mockEmailService.sendStatusChangeEmail).toHaveBeenCalledWith('u1@ex.com', 'John', 'BANNED');

    await handler({ email: 'u2@ex.com', name: 'John', status: 'DEACTIVE' });
    expect(mockEmailService.sendStatusChangeEmail).toHaveBeenCalledWith('u2@ex.com', 'John', 'DEACTIVE');

    await handler({ email: 'u3@ex.com', name: 'John', status: 'ACTIVE' });
    expect(mockEmailService.sendStatusChangeEmail).toHaveBeenCalledWith('u3@ex.com', 'John', 'ACTIVE');
  });

  it('should handle USER_DELETED event (TC-EML-04)', async () => {
    const handler = mockEventBus.on.mock.calls.find((call) => call[0] === DomainEvents.USER_DELETED)![1];
    await handler({ email: 'deleted@ex.com', name: 'John', status: 'DELETED' });
    expect(mockEmailService.sendStatusChangeEmail).toHaveBeenCalledWith('deleted@ex.com', 'John', 'DELETED');
  });

  it('should handle PASSWORD_RESET_REQUESTED event (TC-EML-05)', async () => {
    const handler = mockEventBus.on.mock.calls.find((call) => call[0] === DomainEvents.PASSWORD_RESET_REQUESTED)![1];
    await handler({ userId: 'u2', email: 'reset@ex.com' });

    expect(mockMailTokenService.createMailToken).toHaveBeenCalledWith('u2', 'reset@ex.com', 'RESET_PASSWORD');
    expect(mockEmailService.sendResetPasswordEmail).toHaveBeenCalledWith('reset@ex.com', 'fake-token');
  });

  it('should handle VERIFICATION_EMAIL_REQUESTED event (TC-EML-06, 09)', async () => {
    const handler = mockEventBus.on.mock.calls.find((call) => call[0] === DomainEvents.VERIFICATION_EMAIL_REQUESTED)![1];
    await handler({ userId: 'u3', email: 'v@ex.com' });

    expect(mockMailTokenService.createMailToken).toHaveBeenCalledWith('u3', 'v@ex.com', 'EMAIL_VERIFICATION');
    expect(mockEmailService.resendVerificationEmail).toHaveBeenCalledWith('v@ex.com', 'fake-token');
  });

  describe('Error Isolation & Resilience', () => {
    it('should log error if email sending fails but NOT throw (TC-EML-07)', async () => {
      mockEmailService.sendVerificationEmail.mockRejectedValue(new Error('Send failed'));
      const handler = mockEventBus.on.mock.calls.find((call) => call[0] === DomainEvents.USER_CREATED)![1];
      await expect(handler({ userId: 'u1', email: 'test@ex.com' })).resolves.not.toThrow();
    });

    it('should NOT throw if createMailToken fails (TC-EML-10)', async () => {
      mockMailTokenService.createMailToken.mockRejectedValue(new Error('DB Down'));
      const handler = mockEventBus.on.mock.calls.find((call) => call[0] === DomainEvents.USER_CREATED)![1];
      
      await expect(handler({ userId: 'u1', email: 'test@ex.com' })).resolves.not.toThrow();
      expect(mockEmailService.sendVerificationEmail).not.toHaveBeenCalled();
    });

    it('should NOT throw if sendStatusChangeEmail fails (TC-EML-13)', async () => {
      mockEmailService.sendStatusChangeEmail.mockRejectedValue(new Error('SMTP Error'));
      const handler = mockEventBus.on.mock.calls.find((call) => call[0] === DomainEvents.USER_STATUS_CHANGED)![1];
      
      await expect(handler({ email: 'u1@ex.com', name: 'J', status: 'BANNED' })).resolves.not.toThrow();
    });
  });
});
