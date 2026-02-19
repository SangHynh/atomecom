import { DomainEvents } from '@shared/constants/event.constants.js';
import type { EventBus } from '@shared/infra/event-bus.js';
import type { IEmailService } from '../domain/IEmail.service.js';
import type { MailTokenService } from '@modules/auth/use-cases/mailToken.service.js';
import logger from '@shared/utils/logger.js';

const MODULE = 'Email';
const LAYER = 'Listener';

interface EmailListenerDependencies {
  eventBus: EventBus;
  emailService: IEmailService;
  mailTokenService: MailTokenService;
}

export class EmailListener {
  private readonly _eventBus: EventBus;
  private readonly _emailService: IEmailService;
  private readonly _mailTokenService: MailTokenService;

  constructor({
    eventBus,
    emailService,
    mailTokenService,
  }: EmailListenerDependencies) {
    this._eventBus = eventBus;
    this._emailService = emailService;
    this._mailTokenService = mailTokenService;
    this._setupListeners();
  }

  private _setupListeners(): void {
    // 1. User Created (Registration/Admin Create)
    this._eventBus.on(DomainEvents.USER_CREATED, async (data) => {
      await this._handleEmailTask(data.userId, data.email, 'EMAIL_VERIFICATION');
    });

    // 2. Verification Email Resend
    this._eventBus.on(DomainEvents.VERIFICATION_EMAIL_REQUESTED, async (data) => {
      await this._handleEmailTask(data.userId, data.email, 'VERIFICATION_RESEND');
    });

    // 3. Password Reset Request
    this._eventBus.on(DomainEvents.PASSWORD_RESET_REQUESTED, async (data) => {
      await this._handleEmailTask(data.userId, data.email, 'RESET_PASSWORD');
    });

    logger.info(`[${MODULE}][${LAYER}] Event listeners initialized`);
  }

  private async _handleEmailTask(
    userId: string,
    email: string,
    type: 'EMAIL_VERIFICATION' | 'VERIFICATION_RESEND' | 'RESET_PASSWORD',
  ): Promise<void> {
    try {
      // Create email token
      // For both verification and resend, the token type is 'EMAIL_VERIFICATION'
      const tokenType = type === 'RESET_PASSWORD' ? 'RESET_PASSWORD' : 'EMAIL_VERIFICATION';
      
      const token = await this._mailTokenService.createMailToken(
        userId,
        email,
        tokenType,
      );

      // Send email based on type
      if (type === 'EMAIL_VERIFICATION') {
        await this._emailService.sendVerificationEmail(email, token);
      } else if (type === 'VERIFICATION_RESEND') {
        await this._emailService.resendVerificationEmail(email, token);
      } else if (type === 'RESET_PASSWORD') {
        await this._emailService.sendResetPasswordEmail(email, token);
      }

      logger.info(
        `[${MODULE}][${LAYER}][BackgroundMail] ${type} sent to ${email} for UserID: ${userId}`,
      );
    } catch (err) {
      logger.error(
        `[${MODULE}][${LAYER}][BackgroundMail] Failed to send ${type} to ${email}`,
        { error: err },
      );
    }
  }
}
