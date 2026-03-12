import { ResendMailService } from '../../infra/resend-mail.service.js';
import { Resend } from 'resend';
import appConfig from '@shared/configs/app.config.js';
import * as fs from 'fs/promises';
import Handlebars from 'handlebars';

// Mock appConfig
jest.mock('@shared/configs/app.config.js', () => ({
  __esModule: true,
  default: {
    email: {
      apiKey: 're_123456789',
      fromEmail: 'onboarding@resend.dev',
      clientHost: 'http://localhost:3000',
      projectName: 'Atomecom',
      logoUrl: '',
    },
  },
}));

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
  readFile: jest.fn().mockResolvedValue('<html>{{userName}} {{url}} {{projectName}}</html>'),
}));

// Mock Handlebars
jest.mock('handlebars', () => ({
  compile: jest.fn().mockImplementation(() => jest.fn().mockReturnValue('rendered-html')),
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
  let mailService!: ResendMailService;
  let mockResendInstance!: any;

  beforeEach(() => {
    (appConfig!.email as any).apiKey = 're_123456789';
    (appConfig!.email as any).fromEmail = 'onboarding@resend.dev';

    mailService = new ResendMailService();
    mockResendInstance = (Resend as jest.Mock).mock.results[0]!.value;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Verification Emails', () => {
    it('should send verification email successfully with highest priority (TC-RES-01, 14)', async () => {
      mockResendInstance.emails.send.mockResolvedValue({ data: { id: 'msg-1' }, error: null });

      await mailService.sendVerificationEmail('test@example.com', 'token-123');

      expect(mockResendInstance.emails.send).toHaveBeenCalledWith(
        expect.objectContaining({
          to: ['test@example.com'],
          subject: expect.stringContaining('WELCOME: VERIFY YOUR ATOMECOM ACCOUNT'),
          headers: { 
            'X-Priority': '1 (Highest)',
            'Importance': 'high'
          }
        })
      );
    });

    it('should include correct token in verification URL (TC-RES-09)', async () => {
      mockResendInstance.emails.send.mockResolvedValue({ data: { id: 'msg-1' }, error: null });
      
      await mailService.sendVerificationEmail('test@ex.com', 'secret-token');

      const mockCompile = Handlebars.compile as jest.Mock;
      const templateFn = mockCompile.mock.results[0]!.value;
      
      expect(templateFn).toHaveBeenCalledWith(
        expect.objectContaining({
          url: expect.stringContaining('secret-token')
        })
      );
    });

    it('should resend verification email successfully (TC-RES-02)', async () => {
      mockResendInstance.emails.send.mockResolvedValue({ data: { id: 'msg-remind' }, error: null });
      await mailService.resendVerificationEmail('test@example.com', 'token-123');
      expect(mockResendInstance.emails.send).toHaveBeenCalledWith(
        expect.objectContaining({ subject: expect.stringContaining('NEW LINK') })
      );
    });
  });

  describe('Password Reset', () => {
    it('should send reset password email (TC-RES-03)', async () => {
      mockResendInstance.emails.send.mockResolvedValue({ data: { id: 'msg-reset' }, error: null });
      await mailService.sendResetPasswordEmail('test@example.com', 'token-456');
      expect(mockResendInstance.emails.send).toHaveBeenCalledWith(
        expect.objectContaining({ subject: expect.stringContaining('RESET YOUR PASSWORD') })
      );
    });

    it('should include correct token in reset URL (TC-RES-10)', async () => {
      mockResendInstance.emails.send.mockResolvedValue({ data: { id: 'msg-reset' }, error: null });
      
      await mailService.sendResetPasswordEmail('test@ex.com', 'reset-token-789');

      const mockCompile = Handlebars.compile as jest.Mock;
      const templateFn = mockCompile.mock.results[0]!.value;
      
      expect(templateFn).toHaveBeenCalledWith(
        expect.objectContaining({
          url: expect.stringContaining('reset-token-789')
        })
      );
    });
  });

  describe('sendStatusChangeEmail', () => {
    const statuses = [
      { status: 'BANNED', expected: '🚫 ACCOUNT RESTRICTED' },
      { status: 'ACTIVE', expected: '✅ ACCOUNT ACTIVATED' },
      { status: 'DEACTIVE', expected: '⚠️ ACCOUNT DEACTIVATED' },
      { status: 'DELETED', expected: '🗑️ ACCOUNT DELETED' },
      { status: 'UNKNOWN', expected: '📢 ACCOUNT STATUS UPDATE' },
    ];

    statuses.forEach(({ status, expected }) => {
      it(`should send email for status ${status} with correct subject (TC-RES-04, 05, 11, 12, 13)`, async () => {
        mockResendInstance.emails.send.mockResolvedValue({ data: { id: 'msg-status' }, error: null });
        await mailService.sendStatusChangeEmail('john@ex.com', 'John', status);
        expect(mockResendInstance.emails.send).toHaveBeenCalledWith(
          expect.objectContaining({ subject: expect.stringContaining(expected) })
        );
      });
    });
  });

  describe('Validation & Errors', () => {
    it('should throw error if EMAIL_API_KEY is missing (TC-RES-07)', () => {
      (appConfig!.email as any).apiKey = '';
      expect(() => new ResendMailService()).toThrow('MISSING_EMAIL_API_KEY_IN_ENV');
    });

    it('should throw error if required config is missing during send (TC-RES-08)', async () => {
      (appConfig!.email as any).fromEmail = '';
      mailService = new ResendMailService();
      await expect(mailService.sendVerificationEmail('a@b.com', 't')).rejects.toThrow('MISSING_REQUIRED_EMAIL_CONFIG_IN_ENV');
    });

    it('should throw InternalServerError when Resend API returns error (TC-RES-06)', async () => {
      mockResendInstance.emails.send.mockResolvedValue({
        data: null,
        error: { message: 'Limit reached', name: 'rate_limit' },
      });
      await expect(mailService.sendVerificationEmail('a@b.com', 't')).rejects.toThrow();
    });

    it('should throw InternalServerError if template file cannot be read (TC-RES-15)', async () => {
      (fs.readFile as jest.Mock).mockRejectedValueOnce(new Error('File not found'));
      await expect(mailService.sendVerificationEmail('a@b.com', 't')).rejects.toThrow();
    });
  });
});
