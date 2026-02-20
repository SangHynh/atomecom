import { InternalServerError } from '@shared/core/error.response.js';
import type { IEmailService } from '../domain/IEmail.service.js';
import logger from '@shared/utils/logger.js';
import { Resend } from 'resend';
import Handlebars from 'handlebars';
import { readFile } from 'fs/promises';
import path from 'path';
import { ErrorInfraCodes } from '@atomecom/shared';

// TODO: Refactor error codes to enum
// Resolve template directory relative to project root for best compatibility
// This avoids issues with ESM vs CommonJS (import.meta vs __dirname)
const _templateDir = path.resolve(
  process.cwd(),
  'src/modules/emails/templates',
);

const MODULE = 'Email';
const LAYER = 'Infrastructure';

export class ResendMailService implements IEmailService {
  private _resend: Resend;
  private readonly FROM_EMAIL = process.env.RESEND_FROM_EMAIL;
  private readonly CLIENT_HOST = process.env.CLIENT_HOST;
  private readonly PROJECT_NAME = process.env.PROJECT_NAME || 'System';
  private readonly LOGO_URL = process.env.EMAIL_LOGO_URL || '';

  // Point to the internal templates folder
  private readonly TEMPLATE_DIR = _templateDir;

  constructor() {
    const apiKey = process.env.EMAIL_API_KEY;
    if (!apiKey) {
      throw new InternalServerError(
        ErrorInfraCodes.MISSING_EMAIL_API_KEY_IN_ENV,
      );
    }
    this._resend = new Resend(apiKey);
  }

  private async _renderTemplate(
    templateName: string,
    context: any,
  ): Promise<string> {
    try {
      const templatePath = path.join(this.TEMPLATE_DIR, `${templateName}.hbs`);
      const templateContent = await readFile(templatePath, 'utf8');
      const template = Handlebars.compile(templateContent);
      return template({
        ...context,
        projectName: this.PROJECT_NAME,
        logoUrl: this.LOGO_URL,
      });
    } catch (err) {
      logger.error(
        `[${MODULE}][${LAYER}] Failed to render template: ${templateName}`,
        { error: err },
      );
      throw new InternalServerError(ErrorInfraCodes.EMAIL_TEMPLATE_ERROR);
    }
  }

  private async _send(options: {
    to: string;
    subject: string;
    html: string;
    priority?: string;
  }) {
    if (!this.FROM_EMAIL || !this.CLIENT_HOST) {
      throw new InternalServerError(
        ErrorInfraCodes.MISSING_REQUIRED_EMAIL_CONFIG_IN_ENV,
      );
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
      logger.error(
        `[${MODULE}] [${LAYER}] [SendEmail] Delivery failed:`,
        error,
      );
      throw new InternalServerError(ErrorInfraCodes.EMAIL_DELIVERY_FAILED);
    }
  }

  public async sendVerificationEmail(to: string, token: string): Promise<void> {
    const verificationUrl = `${this.CLIENT_HOST}/verify-email?token=${token}`;
    const userName = to.split('@')[0];
    const html = await this._renderTemplate('registration', {
      userName,
      url: verificationUrl,
    });

    await this._send({
      to,
      subject: `🛡️ WELCOME: VERIFY YOUR ${this.PROJECT_NAME.toUpperCase()} ACCOUNT`,
      priority: '1 (Highest)',
      html,
    });
  }

  public async resendVerificationEmail(
    to: string,
    token: string,
  ): Promise<void> {
    const verificationUrl = `${this.CLIENT_HOST}/verify-email?token=${token}`;
    const userName = to.split('@')[0];
    const html = await this._renderTemplate('verification_resend', {
      userName,
      url: verificationUrl,
    });

    await this._send({
      to,
      subject: `🔄 NEW LINK: VERIFY YOUR ${this.PROJECT_NAME.toUpperCase()} ACCOUNT`,
      priority: '1 (Highest)',
      html,
    });
  }

  public async sendResetPasswordEmail(
    to: string,
    token: string,
  ): Promise<void> {
    const resetUrl = `${this.CLIENT_HOST}/reset-password?token=${token}`;
    const userName = to.split('@')[0];
    const html = await this._renderTemplate('password_reset', {
      userName,
      url: resetUrl,
    });

    await this._send({
      to,
      subject: `🔐 RESET YOUR PASSWORD - ${this.PROJECT_NAME.toUpperCase()}`,
      priority: '1 (Highest)',
      html,
    });
  }

  public async sendStatusChangeEmail(
    to: string,
    userName: string,
    status: string,
  ): Promise<void> {
    const html = await this._renderTemplate('account_status', {
      userName,
      status: status.toLowerCase(),
      isActive: status.toUpperCase() === 'ACTIVE',
      isBanned: status.toUpperCase() === 'BANNED',
      isDeactive: status.toUpperCase() === 'DEACTIVE',
      isDeleted: status.toUpperCase() === 'DELETED',
    });

    const statusMap: Record<string, string> = {
      ACTIVE: '✅ ACCOUNT ACTIVATED',
      BANNED: '🚫 ACCOUNT RESTRICTED',
      DEACTIVE: '⚠️ ACCOUNT DEACTIVATED',
      DELETED: '🗑️ ACCOUNT DELETED',
    };

    const subject =
      statusMap[status.toUpperCase()] || '📢 ACCOUNT STATUS UPDATE';

    await this._send({
      to,
      subject: `${subject} - ${this.PROJECT_NAME.toUpperCase()}`,
      priority: '2 (High)',
      html,
    });
  }
}
