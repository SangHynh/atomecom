export enum DomainEvents {
  // User Events
  USER_CREATED = 'user.created',
  USER_UPDATED = 'user.updated',
  USER_DELETED = 'user.deleted',
  USER_ACTIVITY = 'user.activity',

  // Auth Events
  PASSWORD_RESET_REQUESTED = 'auth.password_reset_requested',
  VERIFICATION_EMAIL_REQUESTED = 'auth.verification_email_requested',
  ACCOUNT_VERIFIED = 'auth.account_verified',
  USER_LOGGED_IN = 'user.logged_in',

  // System Events
  SYSTEM_LOG = 'system.log',
}
