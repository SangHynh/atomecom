import type {
  ITokenPayload,
  ITokenService,
} from '@modules/auth/domain/ITokenService.js';
import type {
  AuthResponseDTO,
  LoginInputDTO,
  RegisterInputDTO,
} from '@modules/auth/use-cases/auth.dtos.js';
import type { IHashService } from '@modules/users/domain/IHashService.interface.js';
import type { SafeUserResponseDTO } from '@modules/users/use-cases/user.dtos.js';
import type { UserService } from '@modules/users/use-cases/user.service.js';
import { InternalServerError, UnauthorizedError } from '@shared/core/error.response.js';

const LAYER = 'Service';
const MODULE = 'Auth';

interface AuthServiceDependencies {
  tokenService: ITokenService;
  userService: UserService;
}

export class AuthService {
  private readonly tokenService: ITokenService;
  private readonly userService: UserService;
  constructor({
    tokenService,
    userService,
  }: AuthServiceDependencies) {
    this.tokenService = tokenService;
    this.userService = userService;
  }

  public async register(dto: RegisterInputDTO): Promise<AuthResponseDTO> {
    const user = await this.userService.create({
      ...dto,
    });
    if (!user || !user.id) {
      const error = new InternalServerError('USER_CREATION_FAILED');
      error.layer = LAYER;
      error.module = MODULE;
      throw error;
    }
    const tokens = await this._generateAuthTokens(user as SafeUserResponseDTO);
    // TODO: Save refresh token to Cache to manage session revocation
    return this._mapToAuthResponse(user as SafeUserResponseDTO, tokens);
  }

  public async login(dto: LoginInputDTO): Promise<AuthResponseDTO> {
    const user = await this.userService.verifyCredentials(dto.email, dto.password);
    const tokens = await this._generateAuthTokens(user as SafeUserResponseDTO);
    return this._mapToAuthResponse(user as SafeUserResponseDTO, tokens);
  }

  private async _generateAuthTokens(user: SafeUserResponseDTO) {
    const payload: ITokenPayload = {
      userId: user.id,
      role: user.role,
    };
    /**
     * TODO: Implement "Per-user Secret Key" strategy for enhanced security.
     * Transition from a static global secret (stored in .env) to dynamic, user-specific secrets
     * stored in a 'KeyToken' collection/Redis. This enables:
     * 1. Granular session revocation (Logout from all devices).
     * 2. Blast radius reduction in case of a single key compromise.
     */
    const [accessToken, refreshToken] = await Promise.all([
      this.tokenService.generateAccessToken(payload),
      this.tokenService.generateRefreshToken(payload),
    ]);

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
    const { password, __v, ...safeUser } = user.toObject ? user.toObject() : user;
    return {
      user: safeUser as SafeUserResponseDTO,
      tokens,
    };
  }
}
