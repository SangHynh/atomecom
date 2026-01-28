export enum USER_STATUS {
  // Account is fully operational and verified.
  ACTIVE = 'active',

  // Account is created but awaiting email verification
  PENDING = 'pending',

  // Account is temporarily deactivated by the user.
  DEACTIVE = 'deactive',

  // Account is restricted by the system.
  BANNED = 'banned',

  // Soft-deleted state. Account is marked for removal
  DELETED = 'deleted',
}
