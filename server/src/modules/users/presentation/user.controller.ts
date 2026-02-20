import type { UserService } from '@modules/users/use-cases/user.service.js';
import { Created, OK, NoContent } from '@shared/core/success.response.js';
import type { Request, Response, NextFunction } from 'express';
import { ForbiddenError } from '@shared/core/error.response.js';
import { USER_ROLE, ErrorRBACCodes } from '@atomecom/shared';

export class UserController {
  constructor(private readonly userService: UserService) {}

  public findAll = async (req: Request, res: Response, _next: NextFunction) => {
    const result = await this.userService.findAll(req.query);
    return OK.withPagination(res, result);
  };

  public getStats = async (
    req: Request,
    res: Response,
    _next: NextFunction,
  ) => {
    const result = await this.userService.getStats();
    return new OK({ data: result }).send(res);
  };

  public findById = async (
    req: Request,
    res: Response,
    _next: NextFunction,
  ) => {
    const { id } = req.params as { id: string };
    const result = await this.userService.findById(id);
    return new OK({ data: result }).send(res);
  };

  public findByEmail = async (
    req: Request,
    res: Response,
    _next: NextFunction,
  ) => {
    const { email } = req.params as { email: string };
    const result = await this.userService.findByEmail(email);
    return new OK({ data: result }).send(res);
  };

  public findByPhone = async (
    req: Request,
    res: Response,
    _next: NextFunction,
  ) => {
    const { phone } = req.params as { phone: string };
    const result = await this.userService.findByPhone(phone);
    return new OK({ data: result }).send(res);
  };

  public create = async (req: Request, res: Response, _next: NextFunction) => {
    const currentUser = (req as any).user;
    const targetRole = req.body.role;

    // 1. Prevent creation of OWNER via API
    if (targetRole === USER_ROLE.OWNER) {
      throw new ForbiddenError(ErrorRBACCodes.CANNOT_CREATE_OWNER_VIA_API);
    }

    // 2. Hierarchy Check (Only OWNER can create ADMINs)
    if (
      targetRole === USER_ROLE.ADMIN &&
      currentUser?.role !== USER_ROLE.OWNER
    ) {
      throw new ForbiddenError(ErrorRBACCodes.ONLY_OWNER_CAN_CREATE_ADMINS);
    }

    const result = await this.userService.create(req.body);
    return new Created({ data: result }).send(res);
  };

  public delete = async (req: Request, res: Response, _next: NextFunction) => {
    const { id } = req.params as { id: string };
    const currentUser = (req as any).user;

    // 1. Fetch target user to check hierarchy
    const targetUser = await this.userService.findById(id);

    // 2. Prevent self-deletion
    if (currentUser.userId === id) {
      throw new ForbiddenError(ErrorRBACCodes.CANNOT_DELETE_SELF);
    }

    // 3. Prevent deletion of OWNER
    if (targetUser.role === USER_ROLE.OWNER) {
      throw new ForbiddenError(ErrorRBACCodes.CANNOT_DELETE_OWNER);
    }

    // 4. Hierarchy Check (Only OWNER can delete ADMINs)
    if (
      targetUser.role === USER_ROLE.ADMIN &&
      currentUser.role !== USER_ROLE.OWNER
    ) {
      throw new ForbiddenError(ErrorRBACCodes.ONLY_OWNER_CAN_DELETE_ADMINS);
    }

    await this.userService.delete(id);
    return new NoContent('USER_DELETED_SUCCESS').send(res);
  };

  public getMe = async (req: Request, res: Response, _next: NextFunction) => {
    const { userId } = (req as any).user;
    const result = await this.userService.findById(userId);
    return new OK({ data: result }).send(res);
  };

  public update = async (req: Request, res: Response, _next: NextFunction) => {
    const { id } = req.params as { id: string };
    const currentUser = (req as any).user;
    // 1. Fetch target user
    const targetUser = await this.userService.findById(id);

    // 3. Construct Safe DTO based on Roles and Context
    const updateDto: any = {};
    const {
      // Personal Info
      name,
      email,
      phone,
      addresses,
      // Security/Admin Info
      role,
      status,
      isVerified,
      password,
    } = req.body;

    // CASE 1: SELF-UPDATE (User updating their own profile)
    // - Can update Personal Info + Addresses
    // - CANNOT update Role, Status, Verified (prohibited by schema validation usually or ignored here)
    if (currentUser.userId === id) {
      if (name) updateDto.name = name;
      if (email) updateDto.email = email;
      if (phone) updateDto.phone = phone;
      if (addresses) updateDto.addresses = addresses;

      // Note: We intentionally IGNORE role, status, isVerified, password here for self-update via this endpoint
      // Users should use specific endpoints like /change-password for security sensitive ops if needed,
      // but if this is a general update, we might allow password here too?
      // Requirement says "update user is only the user themselves... check id... no need to check role"
      // But typically self-update shouldn't change role/status.
    }

    // CASE 2: ADMINISTRATIVE UPDATE (Admin/Owner updating someone else OR themselves with higher privileges)
    // If the user has Admin/Owner role, they might want to update Status/Role/Verified/Password

    // Check if acting as Admin/Owner
    const isOwner = currentUser.role === USER_ROLE.OWNER;
    const isAdmin = currentUser.role === USER_ROLE.ADMIN;

    if (isOwner || isAdmin) {
      // --- Permission Checks for target ---
      // Admin cannot update Owner
      if (targetUser.role === USER_ROLE.OWNER && !isOwner) {
        throw new ForbiddenError(ErrorRBACCodes.CANNOT_UPDATE_OWNER);
      }
      // Admin cannot update other Admin
      if (
        targetUser.role === USER_ROLE.ADMIN &&
        !isOwner &&
        currentUser.userId !== id
      ) {
        throw new ForbiddenError(ErrorRBACCodes.ONLY_OWNER_CAN_UPDATE_ADMINS);
      }

      // --- Allowed Fields for Admin/Owner ---
      if (status) updateDto.status = status;
      if (typeof isVerified === 'boolean') updateDto.isVerified = isVerified;
      if (password) updateDto.password = password;

      // --- Special Field: ROLE ---
      // Only OWNER can update role
      if (role) {
        if (!isOwner) {
          throw new ForbiddenError(
            ErrorRBACCodes.ACCESS_DENIED_INSUFFICIENT_PERMISSIONS,
          );
        }
        updateDto.role = role;
      }

      // Note: If Admin/Owner is updating THEMSELVES (userId === id), the logic flows:
      // 1. Enters "CASE 1" block above -> adds name/email/phone/addresses
      // 2. Enters "CASE 2" block here -> adds status/role/password
      // Result: Full update capability for themselves.
      // If updating OTHERS -> CASE 1 skipped -> only status/role/password added.
    }

    if (Object.keys(updateDto).length === 0) {
      // No valid fields to update or permission denied for all requested fields
      // But we should return success if nothing changed? Or error?
      // Let's perform the update with empty object? No, Repo might complain.
      // If it's a self-update with only personal info, it works.
      // If it's admin update with only name (ignored), updateDto is empty.
      // Let's just return current user if empty.
      return new OK({
        message: 'USER_UPDATED_SUCCESS',
        data: await this.userService.findById(id),
      }).send(res);
    }

    const result = await this.userService.updateUser(id, updateDto);
    return new OK({
      message: 'USER_UPDATED_SUCCESS',
      data: result,
    }).send(res);
  };

  public updateMe = async (
    req: Request,
    res: Response,
    _next: NextFunction,
  ) => {
    const { userId } = (req as any).user;
    const result = await this.userService.updateProfile(userId, req.body);
    return new OK({
      message: 'PROFILE_UPDATED_SUCCESS',
      data: result,
    }).send(res);
  };

  public changePassword = async (
    req: Request,
    res: Response,
    _next: NextFunction,
  ) => {
    const { id } = req.params as { id: string };
    const { newPassword } = req.body;
    const result = await this.userService.changePassword(id, newPassword);
    return new OK({
      message: 'PASSWORD_CHANGED_SUCCESS',
      data: result,
    }).send(res);
  };

  public changeEmail = async (
    req: Request,
    res: Response,
    _next: NextFunction,
  ) => {
    const { id } = req.params as { id: string };
    const { newEmail } = req.body;
    const result = await this.userService.changeEmail(id, newEmail);
    return new OK({
      message: 'EMAIL_CHANGED_SUCCESS',
      data: result,
    }).send(res);
  };

  public changePhone = async (
    req: Request,
    res: Response,
    _next: NextFunction,
  ) => {
    const { id } = req.params as { id: string };
    const { newPhone } = req.body;
    const result = await this.userService.changePhone(id, newPhone);
    return new OK({
      message: 'PHONE_CHANGED_SUCCESS',
      data: result,
    }).send(res);
  };
}
