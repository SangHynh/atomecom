import type { ITokenService } from '@modules/auth/domain/IToken.service.js';
import type { TokenPayload } from '@modules/auth/domain/tokenPayload.model.js';
import type {
  AuthResponseDTO,
  LoginInputDTO,
  RegisterInputDTO,
} from '@modules/auth/use-cases/auth.dtos.js';
import type { MailTokenService } from '@modules/auth/use-cases/mailToken.service.js';
import type { SessionService } from '@modules/auth/use-cases/session.service.js';
import type { SafeUserResponseDTO } from '@modules/users/use-cases/user.dtos.js';
import type { UserService } from '@modules/users/use-cases/user.service.js';
import { ErrorAuthCodes, ErrorUserCodes } from '@shared/core/error.enum.js';
import {
  InternalServerError,
  NotFoundError,
  UnauthorizedError,
} from '@shared/core/error.response.js';
import { USER_STATUS } from '@shared/enum/userStatus.enum.js';
import type { IEmailService } from '@shared/interfaces/IEmail.service.js';
import logger from '@shared/utils/logger.js';
import { getExpiresAt, getExpiresInSeconds } from '@shared/utils/time.js';

const LAYER = 'Service';
const MODULE = 'Auth';

interface AuthServiceDependencies {
  tokenService: ITokenService;
  userService: UserService;
  sessionService: SessionService;
  emailService: IEmailService;
  mailTokenService: MailTokenService;
}

export class AuthService {
  private readonly _tokenService: ITokenService;
  private readonly _userService: UserService;
  private readonly _sessionService: SessionService;
  private readonly _emailService: IEmailService;
  private readonly _mailTokenService: MailTokenService;

  constructor({
    tokenService,
    userService,
    sessionService,
    emailService,
    mailTokenService,
  }: AuthServiceDependencies) {
    this._tokenService = tokenService;
    this._userService = userService;
    this._sessionService = sessionService;
    this._emailService = emailService;
    this._mailTokenService = mailTokenService;
  }

  public async register(dto: RegisterInputDTO): Promise<AuthResponseDTO> {
    const user = await this._userService.create({ ...dto });
    if (!user || !user.id)
      throw new InternalServerError(ErrorUserCodes.CREATE_USER_FAILED);
    const tokens = await this._createNewSession(user as SafeUserResponseDTO);
    this._sendEmailInBackground(user.id, user.email, 'EMAIL_VERIFICATION');
    return this._mapToAuthResponse(user as SafeUserResponseDTO, tokens);
  }

  public async login(dto: LoginInputDTO): Promise<AuthResponseDTO> {
    const user = await this._userService.verifyCredentials(
      dto.email,
      dto.password,
    );
    const tokens = await this._createNewSession(user as SafeUserResponseDTO);
    return this._mapToAuthResponse(user as SafeUserResponseDTO, tokens);
    // TODO: LIMIT SESSIONS PER USER
  }

  public async refresh(refreshToken: string): Promise<AuthResponseDTO> {
    const payload = await this._tokenService.verifyRefreshToken(refreshToken);
    if (!payload?.userId || !payload?.sessionId || !payload?.exp) {
      throw new UnauthorizedError(ErrorAuthCodes.INVALID_REFRESH_TOKEN);
    }
    const user = await this._userService.findById(
      payload.userId,
      USER_STATUS.ACTIVE,
    );

    const originalExpiresAt = payload.exp * 1000;
    const { accessToken, refreshToken: newToken } =
      await this._generateAuthTokens(
        user as SafeUserResponseDTO,
        originalExpiresAt,
        payload.sessionId,
      );

    await this._sessionService.handleRefreshToken(
      payload.userId,
      payload.sessionId,
      refreshToken,
      newToken,
      originalExpiresAt,
    );

    return this._mapToAuthResponse(user as SafeUserResponseDTO, {
      accessToken,
      refreshToken: newToken,
    });
  }

  public async logout(refreshToken: string): Promise<void> {
    try {
      const payload = await this._tokenService.verifyRefreshToken(refreshToken);
      if (payload?.userId && payload?.sessionId) {
        await this._sessionService.revokeRefreshToken(
          payload.userId,
          payload.sessionId,
        );
      }
    } catch (error) {
      // still log out
      logger.error(
        `[${MODULE}][${LAYER}][Logout] Error while revoking refresh token: ${error}`,
      );
    }
  }

  public async verifyEmail(token: string): Promise<AuthResponseDTO> {
    const userId = await this._mailTokenService.verifyMailToken(
      token,
      'EMAIL_VERIFICATION',
    );
    const updatedUser = await this._userService.verifyAccount(userId, true);
    if (!updatedUser) {
      throw new InternalServerError(ErrorAuthCodes.VERIFY_ACCOUNT_FAILED);
    }
    const tokens = await this._createNewSession(
      updatedUser as SafeUserResponseDTO,
    );
    return this._mapToAuthResponse(updatedUser as SafeUserResponseDTO, tokens);
  }

  public async resendVerificationEmail(email: string): Promise<void> {
    const user = await this._userService.findByEmail(email);
    if (user && user.id) {
      if (user.isVerified) return;
      this._sendEmailInBackground(user.id, email, 'EMAIL_VERIFICATION');
    }
    logger.info(
      `[${MODULE}][${LAYER}][ResendEmail] Request initiated for email: ${email}`,
    );
  }

  public async forgotPassword(email: string): Promise<void> {
    const user = await this._userService.findByEmail(email, USER_STATUS.ACTIVE);
    console.log(user)
    if (user && user.id) {
      this._sendEmailInBackground(user.id, email, 'RESET_PASSWORD');
      logger.info(
        `[${MODULE}][${LAYER}][ForgotPassword] Email sent to ${email} for password reset. UserID: ${user.id}`,
      );
    }
    // background task, aldready logged, response 200 at controller
  }

  public async resetPassword(
    token: string,
    newPassword: string,
  ): Promise<void> {
    const userId = await this._mailTokenService.verifyMailToken(
      token,
      'RESET_PASSWORD',
    );

    const updatedUser = await this._userService.changePassword(
      userId,
      newPassword,
    );

    if (!updatedUser) {
      throw new InternalServerError(ErrorAuthCodes.RESET_PASSWORD_FAILED);
    }

    // response 200 at controller
    logger.info(
      `[${MODULE}][${LAYER}][ResetPassword] Success for UserID: ${userId}`,
    );
  }

  /**
   * TODO: Implement "Per-user Secret Key" strategy for enhanced security.
   * Transition from a static global secret (stored in .env) to dynamic, user-specific secrets
   * stored in a 'KeyToken' collection/Redis. This enables:
   * 1. Granular session revocation (Logout from all devices).
   * 2. Blast radius reduction in case of a single key compromise.
   */
  private async _generateAuthTokens(
    user: SafeUserResponseDTO,
    expiresAt?: number,
    sessionId?: string,
  ): Promise<{ accessToken: string; refreshToken: string; sessionId: string }> {
    // Step 1: Initialize or reuse session identifier
    const finalSessionId = sessionId || crypto.randomUUID();

    // Step 2: Prepare the token payload
    const payload: TokenPayload = {
      userId: user.id,
      role: user.role,
      sessionId: finalSessionId,
    };

    // Step 3: Calculate refresh token expiration and remaining TTL
    // if expiresAt is provided, use it to calculate remaining TTL, else use the default value
    const rfConfig = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d';
    const remainingSeconds = getExpiresInSeconds(rfConfig, expiresAt);

    // Step 4: Generate token pair concurrently
    const [accessToken, refreshToken] = await Promise.all([
      this._tokenService.generateAccessToken(payload),
      this._tokenService.generateRefreshToken(payload, remainingSeconds),
    ]);

    // Step 5: Return generated credentials and session context
    return {
      accessToken,
      refreshToken,
      sessionId: finalSessionId,
    };
  }

  /**
   * Initializes a fresh authentication session for Login or Register.
   * This involves calculating expiration, generating token pairs,
   * and persisting the session context to Redis.
   */
  private async _createNewSession(user: SafeUserResponseDTO) {
    const rfConfig = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d';

    // 1. Determine the absolute expiration timestamp first
    const expiresAt = getExpiresAt(rfConfig);

    // 2. Calculate remaining TTL in seconds based on that timestamp
    // This ensures consistency between the database record and cache(Redis) expiration
    const ttl = getExpiresInSeconds(rfConfig, expiresAt);

    // 3. Generate a new set of tokens linked to this session
    // We pass expiresAt to synchronize JWT 'exp' with our session data
    const { accessToken, refreshToken, sessionId } =
      await this._generateAuthTokens(user, expiresAt);

    // 4. Persist the session to Redis for rotation and revocation management
    await this._sessionService.saveRefreshTokenToCache(
      {
        sessionId,
        userId: user.id,
        refreshToken,
        refreshTokensUsed: [],
        expiresAt,
      },
      ttl,
    );

    return { accessToken, refreshToken };
  }

  private _mapToAuthResponse(
    user: any,
    tokens: { accessToken: string; refreshToken: string },
  ): AuthResponseDTO {
    /**
     * TODO: Refactor to HttpOnly Cookie for Refresh Token to mitigate XSS risks.
     * Currently returning both tokens in the response body for initial development speed.
     */
    const { password, ...safeUser } = user.toObject ? user.toObject() : user;
    return {
      user: safeUser as SafeUserResponseDTO,
      tokens,
    };
  }

  private async _sendEmailInBackground(
    userId: string,
    email: string,
    type: 'EMAIL_VERIFICATION' | 'RESET_PASSWORD',
  ): Promise<void> {
    try {
      // 1. Create email token
      const token = await this._mailTokenService.createMailToken(
        userId,
        email,
        type,
      );

      // 2. Send email
      if (type === 'EMAIL_VERIFICATION') {
        await this._emailService.sendVerificationEmail(email, token);
      } else if (type === 'RESET_PASSWORD') {
        await this._emailService.sendResetPasswordEmail(email, token);
      }
      logger.info(
        `[${MODULE}][${LAYER}][BackgroundMail] ${type} sent to ${email}`,
      );
    } catch (err) {
      logger.error(
        `[${MODULE}][${LAYER}][BackgroundMail] Failed to send ${type} to ${email}`,
        { error: err },
      );
    }
  }
}
