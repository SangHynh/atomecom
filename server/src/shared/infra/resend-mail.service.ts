import { InternalServerError } from "@shared/core/error.response.js";
import { registrationTemplate } from "@shared/infra/template/registration.template.js";
import { passwordResetTemplate } from "@shared/infra/template/resetPassword.template.js";
import type { IEmailService } from "@shared/interfaces/IEmail.service.js";
import logger from "@shared/utils/logger.js";
import { Resend } from "resend";

// TODO: Refactor error codes to enum
const MODULE = 'Email';
const LAYER = 'Infrastructure';

export class ResendMailService implements IEmailService {
  private _resend: Resend;
  private readonly FROM_EMAIL = process.env.RESEND_FROM_EMAIL;
  private readonly CLIENT_HOST = process.env.CLIENT_HOST;
  private readonly PROJECT_NAME = process.env.PROJECT_NAME || 'System';

  constructor() {
    const apiKey = process.env.EMAIL_API_KEY;
    if (!apiKey) {
      throw new InternalServerError('MISSING_RESEND_API_KEY_IN_ENV');
    }
    this._resend = new Resend(apiKey);
  }

  private async _send(options: { to: string; subject: string; html: string; priority?: string }) {
    if (!this.FROM_EMAIL || !this.CLIENT_HOST) {
      throw new InternalServerError('MISSING_REQUIRED_EMAIL_CONFIG_IN_ENV');
    }

    const { error } = await this._resend.emails.send({
      from: `${this.PROJECT_NAME} <${this.FROM_EMAIL}>`,
      to: [options.to],
      subject: options.subject,
      headers: {
        'X-Priority': options.priority || '3 (Normal)',
        Importance: options.priority === '1 (Highest)' ? 'high' : 'normal',
      },
      html: options.html,
    });

    if (error) {
      logger.error(`[${MODULE}] [${LAYER}] [SendEmail] Delivery failed:`, error);
      throw new InternalServerError('EMAIL_DELIVERY_FAILED');
    }
  }

  public async sendVerificationEmail(to: string, token: string): Promise<void> {
    const verificationUrl = `${this.CLIENT_HOST}/verify-email?token=${token}`;
    const fallbackName = to.split('@')[0];

    await this._send({
      to,
      subject: `🛡️ ACTION REQUIRED: VERIFY YOUR ${this.PROJECT_NAME.toUpperCase()} ACCOUNT`,
      priority: '1 (Highest)',
      html: registrationTemplate(fallbackName, verificationUrl),
    });
  }

  public async resendVerificationEmail(to: string, token: string): Promise<void> {
    const verificationUrl = `${this.CLIENT_HOST}/verify-email?token=${token}`;
    const fallbackName = to.split('@')[0];

    await this._send({
      to,
      subject: `🔄 NEW LINK: VERIFY YOUR ${this.PROJECT_NAME.toUpperCase()} ACCOUNT`,
      priority: '1 (Highest)',
      html: registrationTemplate(fallbackName, verificationUrl),
    });
  }

  public async sendResetPasswordEmail(to: string, token: string): Promise<void> {
    const resetUrl = `${this.CLIENT_HOST}/reset-password?token=${token}`;
    const fallbackName = to.split('@')[0];

    await this._send({
      to,
      subject: `🔐 RESET YOUR PASSWORD - ${this.PROJECT_NAME.toUpperCase()}`,
      priority: '1 (Highest)',
      html: passwordResetTemplate(fallbackName, resetUrl),
    });
  }
}