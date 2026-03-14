import { User, USER_ROLE } from '@atomecom/shared';

/**
 * Checks if a user can be managed by the current user.
 * Logic:
 * - Current user must exist.
 * - Cannot manage self.
 * - Owners cannot be managed by others.
 * - Owners can manage everyone else.
 * - Admins can manage regular Users.
 */
export function canManageUser(currentUser: User | null | undefined, targetUser: User): boolean {
  if (!currentUser) return false;
  if (currentUser.id === targetUser.id) return false;
  if (targetUser.role === USER_ROLE.OWNER) return false;
  if (currentUser.role === USER_ROLE.OWNER) return true;
  if (currentUser.role === USER_ROLE.ADMIN && targetUser.role === USER_ROLE.USER)
    return true;
  return false;
}

/**
 * Checks if a user can be edited by the current user.
 * Logic:
 * - Can edit self.
 * - Or can manage the user as per admin rules.
 */
export function canEditUser(currentUser: User | null | undefined, targetUser: User): boolean {
  if (!currentUser) return false;
  if (currentUser.id === targetUser.id) return true;
  return canManageUser(currentUser, targetUser);
}

/**
 * Checks if a user is an admin/owner (higher authority).
 */
export function isPrivileged(user: User | null | undefined): boolean {
  if (!user) return false;
  return user.role === USER_ROLE.ADMIN || user.role === USER_ROLE.OWNER;
}
