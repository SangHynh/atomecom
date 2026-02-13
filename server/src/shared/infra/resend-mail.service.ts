import { InternalServerError } from '@shared/core/error.response.js';
import { registrationTemplate } from '@shared/infra/template/registration.template.js';
import type { IEmailService } from '@shared/interfaces/IEmail.service.js';
import { Resend } from 'resend';

export class ResendMailService implements IEmailService {
  private _resend: Resend;
  private readonly FROM_EMAIL = process.env.RESEND_FROM_EMAIL;

  constructor() {
    const apiKey = process.env.EMAIL_API_KEY;
    if (!apiKey) {
      throw new InternalServerError('MISSING_RESEND_API_KEY_IN_ENV');
    }
    this._resend = new Resend(apiKey);
  }

  async sendVerificationEmail(to: string, token: string): Promise<void> {
    const verificationUrl = `${process.env.CLIENT_HOST}/verify-email?token=${token}`;
    const fromEmail = this.FROM_EMAIL;
    const clientHost = process.env.CLIENT_HOST;
    const fallbackName = to.split('@')[0];

    if (!fromEmail) {
      throw new InternalServerError('MISSING_RESEND_FROM_EMAIL_IN_ENV');
    }

    if (!clientHost) {
      throw new InternalServerError('MISSING_CLIENT_HOST_IN_ENV');
    }

    const { error } = await this._resend.emails.send({
      from: `${process.env.PROJECT_NAME} <${fromEmail}>`,
      to: [to],
      subject: `🛡️ ACTION REQUIRED: VERIFY YOUR ${process.env.PROJECT_NAME} ACCOUNT`,
      headers: {
        'X-Priority': '1 (Highest)',
        Importance: 'high',
      },
      html: registrationTemplate(fallbackName, verificationUrl),
    });

    if (error) {
      console.error('Failed to send verification email:', error);
      throw new Error('Email delivery failed');
    }
  }

  sendResetPasswordEmail(to: string, token: string): Promise<void> {
    throw new Error('Method not implemented.');
  }
}
