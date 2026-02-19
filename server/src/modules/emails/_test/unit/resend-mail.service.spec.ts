import { ResendMailService } from '../../infra/resend-mail.service.js';
import { Resend } from 'resend';
import Handlebars from 'handlebars';

// Mock Resend library
jest.mock('resend', () => {
  return {
    Resend: jest.fn().mockImplementation(() => ({
      emails: {
        send: jest.fn(),
      },
    })),
  };
});

// Mock fs/promises
jest.mock('fs/promises', () => ({
  readFile: jest
    .fn()
    .mockResolvedValue('<html>{{userName}} {{url}} {{projectName}}</html>'),
}));

// Mock Handlebars
jest.mock('handlebars', () => ({
  compile: jest
    .fn()
    .mockImplementation(() => jest.fn().mockReturnValue('rendered-html')),
}));

// Mock logger
jest.mock('@shared/utils/logger.js', () => ({
  __esModule: true,
  default: {
    info: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  },
}));

describe('ResendMailService', () => {
  let mailService: ResendMailService;
  let mockResendInstance: any;

  beforeEach(() => {
    // Reset environment variables for each test
    process.env.RESEND_FROM_EMAIL = 'onboarding@resend.dev';
    process.env.CLIENT_HOST = 'http://localhost:3000';
    process.env.PROJECT_NAME = 'Atomecom';
    process.env.EMAIL_API_KEY = 're_123456789';

    mailService = new ResendMailService();
    mockResendInstance = (Resend as jest.Mock).mock.results[0]?.value;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should send verification email successfully', async () => {
    mockResendInstance.emails.send.mockResolvedValue({
      data: { id: 'msg-1' },
      error: null,
    });

    await mailService.sendVerificationEmail('test@example.com', 'token-123');

    expect(mockResendInstance.emails.send).toHaveBeenCalledWith(
      expect.objectContaining({
        to: ['test@example.com'],
        subject: expect.stringContaining(
          'WELCOME: VERIFY YOUR ATOMECOM ACCOUNT',
        ),
        html: 'rendered-html',
      }),
    );
  });

  it('should resend verification email successfully', async () => {
    mockResendInstance.emails.send.mockResolvedValue({
      data: { id: 'msg-1-retry' },
      error: null,
    });

    await mailService.resendVerificationEmail('test@example.com', 'token-123');

    expect(mockResendInstance.emails.send).toHaveBeenCalledWith(
      expect.objectContaining({
        to: ['test@example.com'],
        subject: expect.stringContaining(
          'NEW LINK: VERIFY YOUR ATOMECOM ACCOUNT',
        ),
      }),
    );
  });

  it('should send reset password email successfully', async () => {
    mockResendInstance.emails.send.mockResolvedValue({
      data: { id: 'msg-2' },
      error: null,
    });

    await mailService.sendResetPasswordEmail('test@example.com', 'token-456');

    expect(mockResendInstance.emails.send).toHaveBeenCalledWith(
      expect.objectContaining({
        to: ['test@example.com'],
        subject: expect.stringContaining('RESET YOUR PASSWORD'),
      }),
    );
  });

  it('should throw InternalServerError when sending fails', async () => {
    mockResendInstance.emails.send.mockResolvedValue({
      data: null,
      error: { message: 'Api Error', name: 'error' },
    });

    await expect(
      mailService.sendVerificationEmail('test@example.com', 'token-123'),
    ).rejects.toThrow();
  });

  describe('Validation & Errors', () => {
    it('should throw error if EMAIL_API_KEY is missing', () => {
      delete process.env.EMAIL_API_KEY;
      expect(() => new ResendMailService()).toThrow(
        'MISSING_EMAIL_API_KEY_IN_ENV',
      );
    });

    it('should throw error if required config is missing during send', async () => {
      delete process.env.RESEND_FROM_EMAIL;
      // We need to re-instantiate because these are read in constructor/fields
      mailService = new ResendMailService();

      await expect(
        mailService.sendVerificationEmail('test@example.com', 'token-123'),
      ).rejects.toThrow('MISSING_REQUIRED_EMAIL_CONFIG_IN_ENV');
    });
  });
});
