export enum USER_STATUS {
  // Account is fully operational and verified.
  ACTIVE = 'ACTIVE',

  // Account is temporarily deactivated by the user.
  DEACTIVE = 'DEACTIVE',

  // Account is restricted by the system.
  BANNED = 'BANNED',

  // Account is soft deleted.
  DELETED = 'DELETED',
}
