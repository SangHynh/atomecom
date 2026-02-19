export enum DomainEvents {
  // User Events
  USER_CREATED = 'user.created',
  USER_UPDATED = 'user.updated',
  USER_DELETED = 'user.deleted',

  // Auth Events
  PASSWORD_RESET_REQUESTED = 'auth.password_reset_requested',
  VERIFICATION_EMAIL_REQUESTED = 'auth.verification_email_requested',
  ACCOUNT_VERIFIED = 'auth.account_verified',

  // System Events
  SYSTEM_LOG = 'system.log',
}
